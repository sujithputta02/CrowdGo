import { db } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';

export interface PlaybookRule {
  id: string;
  name: string;
  condition: {
    metric: 'queue_wait' | 'crowd_density' | 'incident_count' | 'zone_capacity';
    operator: '>' | '<' | '==' | '>=';
    threshold: number;
  };
  intervention: {
    type: 'open_lane' | 'redirect_crowd' | 'deploy_staff' | 'activate_service' | 'alert_ops';
    description: string;
    affectedZones: string[];
    priority: 'low' | 'medium' | 'high' | 'critical';
  };
  autoExecute: boolean;
  enabled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Intervention {
  id: string;
  ruleId: string;
  ruleName: string;
  type: string;
  description: string;
  affectedZones: string[];
  priority: string;
  status: 'suggested' | 'approved' | 'executing' | 'completed' | 'failed';
  triggeredAt: Date;
  approvedAt?: Date;
  completedAt?: Date;
  approvedBy?: string;
  executedBy?: string;
  estimatedImpact?: string;
  actualImpact?: string;
  notes?: string;
}

export const PlaybookService = {
  /**
   * Get all active playbook rules
   */
  async getActiveRules(): Promise<PlaybookRule[]> {
    const firestore = db();
    const snapshot = await firestore
      .collection('playbook_rules')
      .where('enabled', '==', true)
      .orderBy('intervention.priority', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      createdAt: doc.data().createdAt?.toDate?.() || new Date(),
      updatedAt: doc.data().updatedAt?.toDate?.() || new Date(),
    } as PlaybookRule));
  },

  /**
   * Evaluate all rules against current venue state
   */
  async evaluateRules(venueState: {
    queueWaitTimes: Record<string, number>;
    crowdDensity: Record<string, number>;
    incidentCount: number;
    zoneCapacity: Record<string, number>;
  }): Promise<Intervention[]> {
    const rules = await this.getActiveRules();
    const interventions: Intervention[] = [];

    for (const rule of rules) {
      const triggered = this.evaluateRule(rule, venueState);
      
      if (triggered) {
        const intervention = await this.createIntervention(rule);
        interventions.push(intervention);

        if (rule.autoExecute) {
          await this.executeIntervention(intervention.id);
        }
      }
    }

    return interventions;
  },

  /**
   * Evaluate a single rule
   */
  evaluateRule(
    rule: PlaybookRule,
    venueState: {
      queueWaitTimes: Record<string, number>;
      crowdDensity: Record<string, number>;
      incidentCount: number;
      zoneCapacity: Record<string, number>;
    }
  ): boolean {
    const { condition } = rule;
    let value = 0;

    switch (condition.metric) {
      case 'queue_wait':
        // Get max queue wait time
        value = Math.max(...Object.values(venueState.queueWaitTimes), 0);
        break;
      case 'crowd_density':
        // Get max crowd density
        value = Math.max(...Object.values(venueState.crowdDensity), 0);
        break;
      case 'incident_count':
        value = venueState.incidentCount;
        break;
      case 'zone_capacity':
        // Get max zone capacity
        value = Math.max(...Object.values(venueState.zoneCapacity), 0);
        break;
    }

    switch (condition.operator) {
      case '>':
        return value > condition.threshold;
      case '<':
        return value < condition.threshold;
      case '==':
        return value === condition.threshold;
      case '>=':
        return value >= condition.threshold;
      default:
        return false;
    }
  },

  /**
   * Create an intervention from a triggered rule
   */
  async createIntervention(rule: PlaybookRule): Promise<Intervention> {
    const firestore = db();
    const interventionRef = firestore.collection('interventions').doc();

    const intervention: Intervention = {
      id: interventionRef.id,
      ruleId: rule.id,
      ruleName: rule.name,
      type: rule.intervention.type,
      description: rule.intervention.description,
      affectedZones: rule.intervention.affectedZones,
      priority: rule.intervention.priority,
      status: 'suggested',
      triggeredAt: new Date(),
      estimatedImpact: rule.intervention.description,
    };

    await interventionRef.set(intervention);

    logger.info('Intervention created', {
      interventionId: intervention.id,
      ruleId: rule.id,
      type: intervention.type,
      priority: intervention.priority,
    });

    return intervention;
  },

  /**
   * Approve an intervention
   */
  async approveIntervention(interventionId: string, approvedBy: string): Promise<void> {
    const firestore = db();
    await firestore.collection('interventions').doc(interventionId).update({
      status: 'approved',
      approvedAt: new Date(),
      approvedBy,
    });

    logger.info('Intervention approved', { interventionId, approvedBy });
  },

  /**
   * Execute an intervention
   */
  async executeIntervention(interventionId: string, executedBy?: string): Promise<void> {
    const firestore = db();
    await firestore.collection('interventions').doc(interventionId).update({
      status: 'executing',
      executedBy: executedBy || 'system',
    });

    logger.info('Intervention executing', { interventionId });
  },

  /**
   * Complete an intervention
   */
  async completeIntervention(
    interventionId: string,
    actualImpact?: string,
    notes?: string
  ): Promise<void> {
    const firestore = db();
    await firestore.collection('interventions').doc(interventionId).update({
      status: 'completed',
      completedAt: new Date(),
      actualImpact,
      notes,
    });

    logger.info('Intervention completed', { interventionId });
  },

  /**
   * Get recent interventions
   */
  async getRecentInterventions(limit: number = 20): Promise<Intervention[]> {
    const firestore = db();
    const snapshot = await firestore
      .collection('interventions')
      .orderBy('triggeredAt', 'desc')
      .limit(limit)
      .get();

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
      triggeredAt: doc.data().triggeredAt?.toDate?.() || new Date(),
      approvedAt: doc.data().approvedAt?.toDate?.(),
      completedAt: doc.data().completedAt?.toDate?.(),
    } as Intervention));
  },

  /**
   * Get intervention effectiveness metrics
   */
  async getInterventionMetrics(): Promise<{
    totalTriggered: number;
    totalApproved: number;
    totalCompleted: number;
    avgTimeToApprove: number;
    avgTimeToComplete: number;
    successRate: number;
  }> {
    const firestore = db();
    const snapshot = await firestore
      .collection('interventions')
      .where('triggeredAt', '>=', new Date(Date.now() - 24 * 60 * 60 * 1000))
      .get();

    const interventions = snapshot.docs.map((doc) => doc.data() as Intervention);

    const approved = interventions.filter((i) => i.status !== 'suggested');
    const completed = interventions.filter((i) => i.status === 'completed');

    const timeToApprove = approved
      .filter((i) => i.approvedAt)
      .map((i) => (i.approvedAt!.getTime() - i.triggeredAt.getTime()) / 1000 / 60)
      .reduce((a, b) => a + b, 0) / (approved.length || 1);

    const timeToComplete = completed
      .filter((i) => i.completedAt)
      .map((i) => (i.completedAt!.getTime() - i.triggeredAt.getTime()) / 1000 / 60)
      .reduce((a, b) => a + b, 0) / (completed.length || 1);

    return {
      totalTriggered: interventions.length,
      totalApproved: approved.length,
      totalCompleted: completed.length,
      avgTimeToApprove: Math.round(timeToApprove),
      avgTimeToComplete: Math.round(timeToComplete),
      successRate: completed.length > 0 ? (completed.length / interventions.length) * 100 : 0,
    };
  },
};
