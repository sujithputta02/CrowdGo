import { db } from '@/lib/firebase-admin';
import { logger } from '@/lib/logger';

export type IncidentType = 'queue' | 'safety' | 'facility' | 'medical' | 'crowd';
export type IncidentSeverity = 'low' | 'medium' | 'high' | 'critical';
export type IncidentStatus = 'open' | 'assigned' | 'in_progress' | 'resolved';

export interface Incident {
  id: string;
  type: IncidentType;
  severity: IncidentSeverity;
  location: string;
  zone: string;
  description: string;
  reportedBy: string;
  reportedByRole: 'staff' | 'system' | 'user';
  status: IncidentStatus;
  assignedTo?: string;
  photoUrl?: string;
  createdAt: Date;
  updatedAt: Date;
  resolvedAt?: Date;
  estimatedImpact?: string;
  affectedCapacity?: number;
}

export interface StaffTask {
  id: string;
  incidentId?: string;
  title: string;
  description: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  assignedTo: string;
  assignedBy: string;
  status: 'pending' | 'acknowledged' | 'in_progress' | 'completed';
  zone: string;
  dueBy?: Date;
  createdAt: Date;
  acknowledgedAt?: Date;
  completedAt?: Date;
}

export interface VenueHealth {
  overallStatus: 'optimal' | 'good' | 'warning' | 'critical';
  crowdLevel: number; // 0-100
  activeIncidents: number;
  criticalIncidents: number;
  averageQueueTime: number;
  zonesAtCapacity: string[];
  lastUpdated: Date;
}

export const IncidentService = {
  /**
   * Create a new incident
   */
  async createIncident(incident: Omit<Incident, 'id' | 'createdAt' | 'updatedAt'>): Promise<Incident> {
    const firestore = db();
    const incidentRef = firestore.collection('incidents').doc();
    
    const newIncident: Incident = {
      ...incident,
      id: incidentRef.id,
      createdAt: new Date(),
      updatedAt: new Date(),
    };

    await incidentRef.set(newIncident);
    
    logger.info('Incident created', { 
      incidentId: newIncident.id, 
      severity: newIncident.severity, 
      type: newIncident.type 
    });
    
    return newIncident;
  },

  /**
   * Get all active incidents
   */
  async getActiveIncidents(): Promise<Incident[]> {
    const firestore = db();
    const snapshot = await firestore
      .collection('incidents')
      .where('status', 'in', ['open', 'assigned', 'in_progress'])
      .orderBy('severity', 'desc')
      .orderBy('createdAt', 'desc')
      .limit(50)
      .get();

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as Incident));
  },

  /**
   * Update incident status
   */
  async updateIncidentStatus(
    incidentId: string, 
    status: IncidentStatus, 
    assignedTo?: string
  ): Promise<void> {
    const firestore = db();
    const updates: Partial<Incident> = {
      status,
      updatedAt: new Date(),
    };

    if (assignedTo) {
      updates.assignedTo = assignedTo;
    }

    if (status === 'resolved') {
      updates.resolvedAt = new Date();
    }

    await firestore.collection('incidents').doc(incidentId).update(updates);
    
    logger.info('Incident status updated', { incidentId, status });
  },

  /**
   * Create a staff task
   */
  async createTask(task: Omit<StaffTask, 'id' | 'createdAt'>): Promise<StaffTask> {
    const firestore = db();
    const taskRef = firestore.collection('staff_tasks').doc();
    
    const newTask: StaffTask = {
      ...task,
      id: taskRef.id,
      createdAt: new Date(),
    };

    await taskRef.set(newTask);
    
    logger.info('Staff task created', { taskId: newTask.id, assignedTo: newTask.assignedTo });
    
    return newTask;
  },

  /**
   * Get tasks for a staff member
   */
  async getTasksForStaff(staffId: string): Promise<StaffTask[]> {
    const firestore = db();
    const snapshot = await firestore
      .collection('staff_tasks')
      .where('assignedTo', '==', staffId)
      .where('status', 'in', ['pending', 'acknowledged', 'in_progress'])
      .orderBy('priority', 'desc')
      .orderBy('createdAt', 'desc')
      .get();

    return snapshot.docs.map((doc) => ({
      ...doc.data(),
      id: doc.id,
    } as StaffTask));
  },

  /**
   * Update task status
   */
  async updateTaskStatus(taskId: string, status: StaffTask['status']): Promise<void> {
    const firestore = db();
    const updates: Partial<StaffTask> = {
      status,
    };

    if (status === 'acknowledged') {
      updates.acknowledgedAt = new Date();
    } else if (status === 'completed') {
      updates.completedAt = new Date();
    }

    await firestore.collection('staff_tasks').doc(taskId).update(updates);
    
    logger.info('Task status updated', { taskId, status });
  },

  /**
   * Get venue health metrics
   */
  async getVenueHealth(): Promise<VenueHealth> {
    const firestore = db();
    // Get active incidents
    const incidents = await this.getActiveIncidents();
    const criticalIncidents = incidents.filter(i => i.severity === 'critical').length;

    // Get queue data from Firestore
    const queueSnapshot = await firestore
      .collection('queue_snapshots')
      .where('venueId', '==', 'wankhede')
      .orderBy('timestamp', 'desc')
      .limit(10)
      .get();

    const queues = queueSnapshot.docs.map((doc) => doc.data());
    const avgQueueTime = queues.length > 0
      ? queues.reduce((sum, q) => sum + ((q.waitTime as number) || 0), 0) / queues.length
      : 0;

    // Calculate crowd level (0-100)
    const crowdLevel = Math.min(100, Math.round((incidents.length * 10) + (avgQueueTime * 2)));

    // Determine overall status
    let overallStatus: VenueHealth['overallStatus'] = 'optimal';
    if (criticalIncidents > 0 || crowdLevel > 80) {
      overallStatus = 'critical';
    } else if (incidents.length > 5 || crowdLevel > 60) {
      overallStatus = 'warning';
    } else if (incidents.length > 2 || crowdLevel > 40) {
      overallStatus = 'good';
    }

    // Find zones at capacity
    const zonesAtCapacity = queues
      .filter((q) => ((q.waitTime as number) || 0) > 15)
      .map((q) => q.zone as string)
      .filter((v, i, a) => a.indexOf(v) === i);

    return {
      overallStatus,
      crowdLevel,
      activeIncidents: incidents.length,
      criticalIncidents,
      averageQueueTime: Math.round(avgQueueTime),
      zonesAtCapacity,
      lastUpdated: new Date(),
    };
  },

  /**
   * Auto-create incident from system detection
   */
  async autoCreateIncident(
    type: IncidentType,
    severity: IncidentSeverity,
    location: string,
    zone: string,
    description: string,
    estimatedImpact?: string
  ): Promise<Incident> {
    return this.createIncident({
      type,
      severity,
      location,
      zone,
      description,
      reportedBy: 'system',
      reportedByRole: 'system',
      status: 'open',
      estimatedImpact,
    });
  },
};
