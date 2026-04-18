import { PlaybookService, PlaybookRule, Intervention } from '@/lib/services/playbook.service';
import { db } from '@/lib/firebase-admin';

jest.mock('@/lib/firebase-admin');
jest.mock('@/lib/logger');

describe('PlaybookService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
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
    });
  });
});
