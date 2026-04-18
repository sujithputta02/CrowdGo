import { IncidentService } from '@/lib/services/incident.service';

// Mock Firebase Admin
jest.mock('@/lib/firebase-admin', () => ({
  db: jest.fn(() => ({
    collection: jest.fn(() => ({
      doc: jest.fn(() => ({
        id: 'test-incident-id',
        set: jest.fn().mockResolvedValue(undefined),
        update: jest.fn().mockResolvedValue(undefined),
      })),
      where: jest.fn().mockReturnThis(),
      orderBy: jest.fn().mockReturnThis(),
      limit: jest.fn().mockReturnThis(),
      get: jest.fn().mockResolvedValue({
        docs: [],
      }),
    })),
  })),
}));

describe('IncidentService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createIncident', () => {
    it('should create a new incident', async () => {
      const incident = await IncidentService.createIncident({
        type: 'queue',
        severity: 'high',
        location: 'Gate 1',
        zone: 'North',
        description: 'Long queue at gate',
        reportedBy: 'staff-123',
        reportedByRole: 'staff',
        status: 'open',
      });

      expect(incident).toBeDefined();
      expect(incident.id).toBe('test-incident-id');
      expect(incident.type).toBe('queue');
      expect(incident.severity).toBe('high');
      expect(incident.status).toBe('open');
      expect(incident.createdAt).toBeInstanceOf(Date);
    });

    it('should create incident with optional fields', async () => {
      const incident = await IncidentService.createIncident({
        type: 'safety',
        severity: 'critical',
        location: 'Concourse B',
        zone: 'South',
        description: 'Safety hazard detected',
        reportedBy: 'system',
        reportedByRole: 'system',
        status: 'open',
        estimatedImpact: 'High crowd impact',
        affectedCapacity: 500,
      });

      expect(incident.estimatedImpact).toBe('High crowd impact');
      expect(incident.affectedCapacity).toBe(500);
    });
  });

  describe('getActiveIncidents', () => {
    it('should return active incidents', async () => {
      const mockIncidents = [
        {
          id: 'inc-1',
          type: 'queue',
          severity: 'medium',
          status: 'open',
        },
        {
          id: 'inc-2',
          type: 'facility',
          severity: 'low',
          status: 'assigned',
        },
      ];

      const { db } = require('@/lib/firebase-admin');
      db.mockReturnValueOnce({
        collection: jest.fn(() => ({
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          limit: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: mockIncidents.map((inc) => ({ data: () => inc })),
          }),
        })),
      });

      const incidents = await IncidentService.getActiveIncidents();

      expect(incidents).toHaveLength(2);
      expect(incidents[0].id).toBe('inc-1');
    });

    it('should return empty array when no incidents', async () => {
      const incidents = await IncidentService.getActiveIncidents();
      expect(incidents).toEqual([]);
    });
  });

  describe('updateIncidentStatus', () => {
    it('should update incident status', async () => {
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn(() => ({
        update: mockUpdate,
      }));

      const { db } = require('@/lib/firebase-admin');
      db.mockReturnValueOnce({
        collection: jest.fn(() => ({
          doc: mockDoc,
        })),
      });

      await IncidentService.updateIncidentStatus('inc-1', 'in_progress', 'staff-456');
      
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          assignedTo: 'staff-456',
          status: 'in_progress',
        })
      );
    });

    it('should set resolvedAt when status is resolved', async () => {
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn(() => ({
        update: mockUpdate,
      }));

      const { db } = require('@/lib/firebase-admin');
      db.mockReturnValueOnce({
        collection: jest.fn(() => ({
          doc: mockDoc,
        })),
      });

      await IncidentService.updateIncidentStatus('inc-1', 'resolved');
      
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          resolvedAt: expect.any(Date),
          status: 'resolved',
        })
      );
    });
  });

  describe('createTask', () => {
    it('should create a staff task', async () => {
      const task = await IncidentService.createTask({
        title: 'Clear queue at Gate 1',
        description: 'Redirect crowd to Gate 3',
        priority: 'high',
        assignedTo: 'staff-789',
        assignedBy: 'manager-123',
        zone: 'North',
        status: 'pending',
      });

      expect(task).toBeDefined();
      expect(task.id).toBe('test-incident-id');
      expect(task.title).toBe('Clear queue at Gate 1');
      expect(task.priority).toBe('high');
      expect(task.createdAt).toBeInstanceOf(Date);
    });

    it('should create task with incident reference', async () => {
      const task = await IncidentService.createTask({
        title: 'Fix restroom',
        description: 'Restroom out of order',
        priority: 'urgent',
        assignedTo: 'staff-111',
        assignedBy: 'manager-222',
        zone: 'East',
        status: 'pending',
        incidentId: 'inc-123',
      });

      expect(task.incidentId).toBe('inc-123');
    });
  });

  describe('getTasksForStaff', () => {
    it('should return tasks for specific staff member', async () => {
      const mockTasks = [
        {
          id: 'task-1',
          title: 'Task 1',
          status: 'pending',
        },
        {
          id: 'task-2',
          title: 'Task 2',
          status: 'in_progress',
        },
      ];

      const { db } = require('@/lib/firebase-admin');
      db.mockReturnValueOnce({
        collection: jest.fn(() => ({
          where: jest.fn().mockReturnThis(),
          orderBy: jest.fn().mockReturnThis(),
          get: jest.fn().mockResolvedValue({
            docs: mockTasks.map((task) => ({ data: () => task })),
          }),
        })),
      });

      const tasks = await IncidentService.getTasksForStaff('staff-123');

      expect(tasks).toHaveLength(2);
      expect(tasks[0].id).toBe('task-1');
    });
  });

  describe('updateTaskStatus', () => {
    it('should update task to acknowledged', async () => {
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn(() => ({
        update: mockUpdate,
      }));

      const { db } = require('@/lib/firebase-admin');
      db.mockReturnValueOnce({
        collection: jest.fn(() => ({
          doc: mockDoc,
        })),
      });

      await IncidentService.updateTaskStatus('task-1', 'acknowledged');
      
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          acknowledgedAt: expect.any(Date),
          status: 'acknowledged',
        })
      );
    });

    it('should update task to completed', async () => {
      const mockUpdate = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn(() => ({
        update: mockUpdate,
      }));

      const { db } = require('@/lib/firebase-admin');
      db.mockReturnValueOnce({
        collection: jest.fn(() => ({
          doc: mockDoc,
        })),
      });

      await IncidentService.updateTaskStatus('task-1', 'completed');
      
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          completedAt: expect.any(Date),
          status: 'completed',
        })
      );
    });
  });

  describe('getVenueHealth', () => {
    it('should calculate venue health metrics', async () => {
      const mockIncidents = [
        { severity: 'critical' },
        { severity: 'high' },
        { severity: 'medium' },
      ];

      const mockQueues = [
        { waitTime: 10, zone: 'North' },
        { waitTime: 20, zone: 'South' },
      ];

      const { db } = require('@/lib/firebase-admin');
      db.mockReturnValue({
        collection: jest.fn((name) => {
          if (name === 'incidents') {
            return {
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              get: jest.fn().mockResolvedValue({
                docs: mockIncidents.map((inc) => ({ data: () => inc })),
              }),
            };
          }
          if (name === 'queue_snapshots') {
            return {
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              get: jest.fn().mockResolvedValue({
                docs: mockQueues.map((q) => ({ data: () => q })),
              }),
            };
          }
          return {};
        }),
      });

      const health = await IncidentService.getVenueHealth();

      expect(health).toBeDefined();
      expect(health.activeIncidents).toBe(3);
      expect(health.criticalIncidents).toBe(1);
      expect(health.averageQueueTime).toBe(15);
      expect(health.overallStatus).toBeDefined();
      expect(health.crowdLevel).toBeGreaterThan(0);
    });

    it('should return optimal status with no incidents', async () => {
      const { db } = require('@/lib/firebase-admin');
      db.mockReturnValue({
        collection: jest.fn((name) => {
          if (name === 'incidents') {
            return {
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              get: jest.fn().mockResolvedValue({
                docs: [], // No incidents
              }),
            };
          }
          if (name === 'queue_snapshots') {
            return {
              where: jest.fn().mockReturnThis(),
              orderBy: jest.fn().mockReturnThis(),
              limit: jest.fn().mockReturnThis(),
              get: jest.fn().mockResolvedValue({
                docs: [], // No queue data
              }),
            };
          }
          return {};
        }),
      });

      const health = await IncidentService.getVenueHealth();

      expect(health.overallStatus).toBe('optimal');
      expect(health.activeIncidents).toBe(0);
      expect(health.criticalIncidents).toBe(0);
    });
  });

  describe('autoCreateIncident', () => {
    it('should auto-create system incident', async () => {
      const mockSet = jest.fn().mockResolvedValue(undefined);
      const mockDoc = jest.fn(() => ({
        id: 'test-incident-id',
        set: mockSet,
      }));

      const { db } = require('@/lib/firebase-admin');
      db.mockReturnValueOnce({
        collection: jest.fn(() => ({
          doc: mockDoc,
        })),
      });

      const incident = await IncidentService.autoCreateIncident(
        'crowd',
        'high',
        'Concourse A',
        'West',
        'High crowd density detected',
        'May cause delays'
      );

      expect(incident.reportedBy).toBe('system');
      expect(incident.reportedByRole).toBe('system');
      expect(incident.status).toBe('open');
      expect(incident.estimatedImpact).toBe('May cause delays');
    });
  });
});
