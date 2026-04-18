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
