import { PlaybookService, PlaybookRule, Intervention } from '@/lib/services/playbook.service';
import { db } from '@/lib/firebase-admin';

jest.mock('@/lib/firebase-admin');
jest.mock('@/lib/logger');

describe('PlaybookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('getActiveRules', () => {
    it('should fetch and return active rules', async () => {
      const mockRule = {
        id: 'rule-1',
        name: 'Test Rule',
        enabled: true,
        intervention: { priority: 'high' },
        createdAt: { toDate: () => new Date() },
        updatedAt: { toDate: () => new Date() },
      };

      const mockFirestore = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: [{ data: () => mockRule, id: 'rule-1' }],
          }),
        }),
      };

      (db as jest.Mock).mockReturnValue(mockFirestore);

      const rules = await PlaybookService.getActiveRules();

      expect(rules).toHaveLength(1);
      expect(rules[0].id).toBe('rule-1');
      expect(rules[0].name).toBe('Test Rule');
    });

    it('should handle missing date fields in rules', async () => {
      const mockRule = {
        id: 'rule-1',
        name: 'Test Rule',
        enabled: true,
        intervention: { priority: 'high' },
        createdAt: null,
        updatedAt: null,
      };

      const mockFirestore = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: [{ data: () => mockRule, id: 'rule-1' }],
          }),
        }),
      };

      (db as jest.Mock).mockReturnValue(mockFirestore);

      const rules = await PlaybookService.getActiveRules();

      expect(rules).toHaveLength(1);
      expect(rules[0].createdAt).toBeInstanceOf(Date);
      expect(rules[0].updatedAt).toBeInstanceOf(Date);
    });
  });

  describe('evaluateRules', () => {
    it('should evaluate all rules and create interventions', async () => {
      const mockRule: PlaybookRule = {
        id: 'rule-1',
        name: 'High Queue Alert',
        condition: {
          metric: 'queue_wait',
          operator: '>',
          threshold: 15,
        },
        intervention: {
          type: 'open_lane',
          description: 'Open additional lane',
          affectedZones: ['north'],
          priority: 'high',
        },
        autoExecute: false,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockFirestore = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: [{ data: () => mockRule, id: 'rule-1' }],
          }),
          doc: jest.fn().mockReturnValue({
            set: jest.fn().mockResolvedValue(undefined),
          }),
        }),
      };

      (db as jest.Mock).mockReturnValue(mockFirestore);

      const venueState = {
        queueWaitTimes: { gate_a: 20, gate_b: 10 },
        crowdDensity: { zone_1: 50 },
        incidentCount: 2,
        zoneCapacity: { zone_1: 70 },
      };

      const interventions = await PlaybookService.evaluateRules(venueState);

      expect(interventions).toHaveLength(1);
      expect(interventions[0].status).toBe('suggested');
    });

    it('should auto-execute interventions when rule has autoExecute enabled', async () => {
      const mockRule: PlaybookRule = {
        id: 'rule-1',
        name: 'High Queue Alert',
        condition: {
          metric: 'queue_wait',
          operator: '>',
          threshold: 15,
        },
        intervention: {
          type: 'open_lane',
          description: 'Open additional lane',
          affectedZones: ['north'],
          priority: 'high',
        },
        autoExecute: true,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const mockFirestore = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: [{ data: () => mockRule, id: 'rule-1' }],
          }),
          doc: jest.fn().mockReturnValue({
            set: jest.fn().mockResolvedValue(undefined),
            update: jest.fn().mockResolvedValue(undefined),
          }),
        }),
      };

      (db as jest.Mock).mockReturnValue(mockFirestore);

      const venueState = {
        queueWaitTimes: { gate_a: 20, gate_b: 10 },
        crowdDensity: { zone_1: 50 },
        incidentCount: 2,
        zoneCapacity: { zone_1: 70 },
      };

      const interventions = await PlaybookService.evaluateRules(venueState);

      expect(interventions).toHaveLength(1);
      expect(mockFirestore.collection().doc().update).toHaveBeenCalled();
    });
  });

  describe('evaluateRule', () => {
    it('should trigger rule when queue_wait exceeds threshold', () => {
      const rule: PlaybookRule = {
        id: 'rule-1',
        name: 'High Queue Alert',
        condition: {
          metric: 'queue_wait',
          operator: '>',
          threshold: 15,
        },
        intervention: {
          type: 'open_lane',
          description: 'Open additional lane',
          affectedZones: ['north'],
          priority: 'high',
        },
        autoExecute: false,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const venueState = {
        queueWaitTimes: { gate_a: 20, gate_b: 10 },
        crowdDensity: { zone_1: 50 },
        incidentCount: 2,
        zoneCapacity: { zone_1: 70 },
      };

      const triggered = PlaybookService.evaluateRule(rule, venueState);
      expect(triggered).toBe(true);
    });

    it('should not trigger rule when condition not met', () => {
      const rule: PlaybookRule = {
        id: 'rule-1',
        name: 'High Queue Alert',
        condition: {
          metric: 'queue_wait',
          operator: '>',
          threshold: 15,
        },
        intervention: {
          type: 'open_lane',
          description: 'Open additional lane',
          affectedZones: ['north'],
          priority: 'high',
        },
        autoExecute: false,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const venueState = {
        queueWaitTimes: { gate_a: 10, gate_b: 8 },
        crowdDensity: { zone_1: 50 },
        incidentCount: 1,
        zoneCapacity: { zone_1: 70 },
      };

      const triggered = PlaybookService.evaluateRule(rule, venueState);
      expect(triggered).toBe(false);
    });

    it('should handle crowd_density metric', () => {
      const rule: PlaybookRule = {
        id: 'rule-2',
        name: 'High Density Alert',
        condition: {
          metric: 'crowd_density',
          operator: '>=',
          threshold: 80,
        },
        intervention: {
          type: 'redirect_crowd',
          description: 'Redirect crowd to alternate zones',
          affectedZones: ['north', 'south'],
          priority: 'critical',
        },
        autoExecute: true,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const venueState = {
        queueWaitTimes: { gate_a: 5 },
        crowdDensity: { zone_1: 85, zone_2: 60 },
        incidentCount: 0,
        zoneCapacity: { zone_1: 85 },
      };

      const triggered = PlaybookService.evaluateRule(rule, venueState);
      expect(triggered).toBe(true);
    });

    it('should handle incident_count metric', () => {
      const rule: PlaybookRule = {
        id: 'rule-3',
        name: 'Multiple Incidents Alert',
        condition: {
          metric: 'incident_count',
          operator: '>=',
          threshold: 5,
        },
        intervention: {
          type: 'alert_ops',
          description: 'Alert operations team',
          affectedZones: [],
          priority: 'high',
        },
        autoExecute: false,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const venueState = {
        queueWaitTimes: {},
        crowdDensity: {},
        incidentCount: 6,
        zoneCapacity: {},
      };

      const triggered = PlaybookService.evaluateRule(rule, venueState);
      expect(triggered).toBe(true);
    });

    it('should handle zone_capacity metric', () => {
      const rule: PlaybookRule = {
        id: 'rule-4',
        name: 'Zone Capacity Alert',
        condition: {
          metric: 'zone_capacity',
          operator: '<',
          threshold: 20,
        },
        intervention: {
          type: 'deploy_staff',
          description: 'Deploy additional staff',
          affectedZones: ['north'],
          priority: 'medium',
        },
        autoExecute: false,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const venueState = {
        queueWaitTimes: {},
        crowdDensity: {},
        incidentCount: 0,
        zoneCapacity: { zone_1: 15, zone_2: 30 },
      };

      // Max capacity is 30, which is NOT < 20, so should be false
      const triggered = PlaybookService.evaluateRule(rule, venueState);
      expect(triggered).toBe(false);
    });

    it('should handle zone_capacity metric when max is below threshold', () => {
      const rule: PlaybookRule = {
        id: 'rule-4',
        name: 'Zone Capacity Alert',
        condition: {
          metric: 'zone_capacity',
          operator: '<',
          threshold: 20,
        },
        intervention: {
          type: 'deploy_staff',
          description: 'Deploy additional staff',
          affectedZones: ['north'],
          priority: 'medium',
        },
        autoExecute: false,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const venueState = {
        queueWaitTimes: {},
        crowdDensity: {},
        incidentCount: 0,
        zoneCapacity: { zone_1: 15, zone_2: 10 },
      };

      // Max capacity is 15, which IS < 20, so should be true
      const triggered = PlaybookService.evaluateRule(rule, venueState);
      expect(triggered).toBe(true);
    });

    it('should handle equality operator', () => {
      const rule: PlaybookRule = {
        id: 'rule-5',
        name: 'Exact Incident Count Alert',
        condition: {
          metric: 'incident_count',
          operator: '==',
          threshold: 3,
        },
        intervention: {
          type: 'alert_ops',
          description: 'Alert operations team',
          affectedZones: [],
          priority: 'high',
        },
        autoExecute: false,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const venueState = {
        queueWaitTimes: {},
        crowdDensity: {},
        incidentCount: 3,
        zoneCapacity: {},
      };

      const triggered = PlaybookService.evaluateRule(rule, venueState);
      expect(triggered).toBe(true);
    });

    it('should return false for unknown operator', () => {
      const rule: PlaybookRule = {
        id: 'rule-6',
        name: 'Unknown Operator Rule',
        condition: {
          metric: 'incident_count',
          operator: '!=' as any,
          threshold: 5,
        },
        intervention: {
          type: 'alert_ops',
          description: 'Alert operations team',
          affectedZones: [],
          priority: 'high',
        },
        autoExecute: false,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const venueState = {
        queueWaitTimes: {},
        crowdDensity: {},
        incidentCount: 6,
        zoneCapacity: {},
      };

      const triggered = PlaybookService.evaluateRule(rule, venueState);
      expect(triggered).toBe(false);
    });

    it('should handle empty venue state objects', () => {
      const rule: PlaybookRule = {
        id: 'rule-7',
        name: 'Empty State Rule',
        condition: {
          metric: 'queue_wait',
          operator: '>',
          threshold: 15,
        },
        intervention: {
          type: 'open_lane',
          description: 'Open additional lane',
          affectedZones: ['north'],
          priority: 'high',
        },
        autoExecute: false,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const venueState = {
        queueWaitTimes: {},
        crowdDensity: {},
        incidentCount: 0,
        zoneCapacity: {},
      };

      const triggered = PlaybookService.evaluateRule(rule, venueState);
      expect(triggered).toBe(false);
    });
  });

  describe('createIntervention', () => {
    it('should create intervention with correct status', async () => {
      const mockFirestore = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            set: jest.fn().mockResolvedValue(undefined),
          }),
        }),
      };

      (db as jest.Mock).mockReturnValue(mockFirestore);

      const rule: PlaybookRule = {
        id: 'rule-1',
        name: 'Test Rule',
        condition: {
          metric: 'queue_wait',
          operator: '>',
          threshold: 15,
        },
        intervention: {
          type: 'open_lane',
          description: 'Open additional lane',
          affectedZones: ['north'],
          priority: 'high',
        },
        autoExecute: false,
        enabled: true,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      const intervention = await PlaybookService.createIntervention(rule);

      expect(intervention.status).toBe('suggested');
      expect(intervention.ruleId).toBe('rule-1');
      expect(intervention.type).toBe('open_lane');
      expect(intervention.priority).toBe('high');
    });
  });

  describe('approveIntervention', () => {
    it('should approve intervention with user info', async () => {
      const mockFirestore = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            update: jest.fn().mockResolvedValue(undefined),
          }),
        }),
      };

      (db as jest.Mock).mockReturnValue(mockFirestore);

      await PlaybookService.approveIntervention('intervention-1', 'user-123');

      expect(mockFirestore.collection().doc().update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'approved',
          approvedBy: 'user-123',
        })
      );
    });
  });

  describe('executeIntervention', () => {
    it('should execute intervention with executor info', async () => {
      const mockFirestore = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            update: jest.fn().mockResolvedValue(undefined),
          }),
        }),
      };

      (db as jest.Mock).mockReturnValue(mockFirestore);

      await PlaybookService.executeIntervention('intervention-1', 'user-456');

      expect(mockFirestore.collection().doc().update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'executing',
          executedBy: 'user-456',
        })
      );
    });

    it('should default to system executor if not provided', async () => {
      const mockFirestore = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            update: jest.fn().mockResolvedValue(undefined),
          }),
        }),
      };

      (db as jest.Mock).mockReturnValue(mockFirestore);

      await PlaybookService.executeIntervention('intervention-1');

      expect(mockFirestore.collection().doc().update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'executing',
          executedBy: 'system',
        })
      );
    });
  });

  describe('completeIntervention', () => {
    it('should complete intervention with impact and notes', async () => {
      const mockFirestore = {
        collection: jest.fn().mockReturnValue({
          doc: jest.fn().mockReturnValue({
            update: jest.fn().mockResolvedValue(undefined),
          }),
        }),
      };

      (db as jest.Mock).mockReturnValue(mockFirestore);

      await PlaybookService.completeIntervention('intervention-1', 'Queue reduced by 30%', 'Successful');

      expect(mockFirestore.collection().doc().update).toHaveBeenCalledWith(
        expect.objectContaining({
          status: 'completed',
          actualImpact: 'Queue reduced by 30%',
          notes: 'Successful',
        })
      );
    });
  });

  describe('getRecentInterventions', () => {
    it('should fetch recent interventions with default limit', async () => {
      const mockIntervention = {
        id: 'intervention-1',
        status: 'completed',
        triggeredAt: { toDate: () => new Date() },
        approvedAt: { toDate: () => new Date() },
        completedAt: { toDate: () => new Date() },
      };

      const mockFirestore = {
        collection: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: [{ data: () => mockIntervention, id: 'intervention-1' }],
          }),
        }),
      };

      (db as jest.Mock).mockReturnValue(mockFirestore);

      const interventions = await PlaybookService.getRecentInterventions();

      expect(interventions).toHaveLength(1);
      expect(mockFirestore.collection().limit).toHaveBeenCalledWith(20);
    });

    it('should fetch recent interventions with custom limit', async () => {
      const mockIntervention = {
        id: 'intervention-1',
        status: 'completed',
        triggeredAt: { toDate: () => new Date() },
      };

      const mockFirestore = {
        collection: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: [{ data: () => mockIntervention, id: 'intervention-1' }],
          }),
        }),
      };

      (db as jest.Mock).mockReturnValue(mockFirestore);

      await PlaybookService.getRecentInterventions(50);

      expect(mockFirestore.collection().limit).toHaveBeenCalledWith(50);
    });

    it('should handle missing date fields in interventions', async () => {
      const mockIntervention = {
        id: 'intervention-1',
        status: 'suggested',
        triggeredAt: null,
        approvedAt: null,
        completedAt: null,
      };

      const mockFirestore = {
        collection: jest.fn().mockReturnValue({
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: [{ data: () => mockIntervention, id: 'intervention-1' }],
          }),
        }),
      };

      (db as jest.Mock).mockReturnValue(mockFirestore);

      const interventions = await PlaybookService.getRecentInterventions();

      expect(interventions).toHaveLength(1);
      expect(interventions[0].triggeredAt).toBeInstanceOf(Date);
    });
  });

  describe('getInterventionMetrics', () => {
    it('should calculate intervention metrics correctly', async () => {
      const mockFirestore = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: [
              {
                data: () => ({
                  status: 'completed',
                  triggeredAt: new Date(),
                  completedAt: new Date(Date.now() + 60000),
                  approvedAt: new Date(Date.now() + 30000),
                }),
              },
              {
                data: () => ({
                  status: 'suggested',
                  triggeredAt: new Date(),
                }),
              },
            ],
          }),
        }),
      };

      (db as jest.Mock).mockReturnValue(mockFirestore);

      const metrics = await PlaybookService.getInterventionMetrics();

      expect(metrics.totalTriggered).toBe(2);
      expect(metrics.totalCompleted).toBe(1);
      expect(metrics.successRate).toBeGreaterThan(0);
      expect(metrics.avgTimeToApprove).toBeGreaterThanOrEqual(0);
      expect(metrics.avgTimeToComplete).toBeGreaterThanOrEqual(0);
    });

    it('should handle empty interventions', async () => {
      const mockFirestore = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: [],
          }),
        }),
      };

      (db as jest.Mock).mockReturnValue(mockFirestore);

      const metrics = await PlaybookService.getInterventionMetrics();

      expect(metrics.totalTriggered).toBe(0);
      expect(metrics.totalCompleted).toBe(0);
      expect(metrics.successRate).toBe(0);
    });

    it('should handle interventions without approval dates', async () => {
      const mockFirestore = {
        collection: jest.fn().mockReturnValue({
          where: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: [
              {
                data: () => ({
                  status: 'approved',
                  triggeredAt: new Date(),
                  approvedAt: null,
                }),
              },
            ],
          }),
        }),
      };

      (db as jest.Mock).mockReturnValue(mockFirestore);

      const metrics = await PlaybookService.getInterventionMetrics();

      expect(metrics.totalApproved).toBe(1);
      expect(metrics.avgTimeToApprove).toBe(0);
    });
  });
});
