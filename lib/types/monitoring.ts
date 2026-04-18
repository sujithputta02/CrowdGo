// Monitoring Types
export interface LogEntry {
  timestamp: number;
  level: 'INFO' | 'WARNING' | 'ERROR';
  message: string;
  context?: Record<string, any>;
}

// Notification Types
export interface Notification {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'info' | 'warning' | 'error' | 'success';
  read: boolean;
  createdAt: number;
  expiresAt?: number;
}

// Analytics Types
export interface KPI {
  name: string;
  value: number;
  unit: string;
  trend: number;
  timestamp: number;
}

export interface AnalyticsData {
  kpis: KPI[];
  period: {
    start: number;
    end: number;
  };
}
