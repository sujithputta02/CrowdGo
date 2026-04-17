"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';

interface VenueHealth {
  overallStatus: 'optimal' | 'good' | 'warning' | 'critical';
  crowdLevel: number;
  activeIncidents: number;
  criticalIncidents: number;
  averageQueueTime: number;
  zonesAtCapacity: string[];
  lastUpdated: string;
}

interface Incident {
  id: string;
  type: string;
  severity: string;
  location: string;
  zone: string;
  description: string;
  status: string;
  reportedBy: string;
  createdAt: any;
}

export default function OperationsDashboard() {
  const { user } = useAuth();
  const [health, setHealth] = useState<VenueHealth | null>(null);
  const [incidents, setIncidents] = useState<Incident[]>([]);
  const [loading, setLoading] = useState(true);
  const [showNewIncident, setShowNewIncident] = useState(false);

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      const [healthRes, incidentsRes] = await Promise.all([
        fetch('/api/v1/ops/venue-health'),
        fetch('/api/v1/ops/incidents'),
      ]);

      if (healthRes.ok) {
        const healthData = await healthRes.json();
        setHealth(healthData.data);
      }

      if (incidentsRes.ok) {
        const incidentsData = await incidentsRes.json();
        setIncidents(incidentsData.data.incidents);
      }
    } catch (error) {
      console.error('Failed to fetch ops data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'optimal': return 'bg-green-500';
      case 'good': return 'bg-blue-500';
      case 'warning': return 'bg-yellow-500';
      case 'critical': return 'bg-red-500';
      default: return 'bg-gray-500';
    }
  };

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case 'low': return 'bg-blue-100 text-blue-800';
      case 'medium': return 'bg-yellow-100 text-yellow-800';
      case 'high': return 'bg-orange-100 text-orange-800';
      case 'critical': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Loading Operations Dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-black uppercase tracking-wider mb-2">
            Operations Control
          </h1>
          <p className="text-text-muted">Wankhede Stadium - Live Venue Intelligence</p>
        </div>

        {/* Venue Health Overview */}
        {health && (
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Overall Status */}
            <div className="bg-surface rounded-2xl p-6 border border-border">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted">
                  Venue Status
                </h3>
                <div className={`w-3 h-3 rounded-full ${getStatusColor(health.overallStatus)} animate-pulse`} />
              </div>
              <p className="text-3xl font-black uppercase mb-2">
                {health.overallStatus}
              </p>
              <p className="text-xs text-text-muted">
                Last updated: {new Date(health.lastUpdated).toLocaleTimeString()}
              </p>
            </div>

            {/* Crowd Level */}
            <div className="bg-surface rounded-2xl p-6 border border-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
                Crowd Level
              </h3>
              <div className="flex items-end gap-2 mb-2">
                <p className="text-3xl font-black">{health.crowdLevel}%</p>
                <p className="text-sm text-text-muted mb-1">capacity</p>
              </div>
              <div className="w-full bg-border rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${
                    health.crowdLevel > 80 ? 'bg-red-500' :
                    health.crowdLevel > 60 ? 'bg-yellow-500' :
                    'bg-green-500'
                  }`}
                  style={{ width: `${health.crowdLevel}%` }}
                />
              </div>
            </div>

            {/* Active Incidents */}
            <div className="bg-surface rounded-2xl p-6 border border-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
                Active Incidents
              </h3>
              <p className="text-3xl font-black mb-2">{health.activeIncidents}</p>
              {health.criticalIncidents > 0 && (
                <p className="text-sm text-red-500 font-bold">
                  {health.criticalIncidents} CRITICAL
                </p>
              )}
            </div>

            {/* Average Queue Time */}
            <div className="bg-surface rounded-2xl p-6 border border-border">
              <h3 className="text-sm font-bold uppercase tracking-wider text-text-muted mb-4">
                Avg Queue Time
              </h3>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-black">{health.averageQueueTime}</p>
                <p className="text-sm text-text-muted mb-1">minutes</p>
              </div>
              {health.zonesAtCapacity.length > 0 && (
                <p className="text-xs text-yellow-500 mt-2">
                  {health.zonesAtCapacity.length} zones at capacity
                </p>
              )}
            </div>
          </div>
        )}

        {/* Incidents Feed */}
        <div className="bg-surface rounded-2xl p-6 border border-border">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-black uppercase tracking-wider">
              Live Incidents
            </h2>
            <button
              onClick={() => setShowNewIncident(true)}
              className="px-4 py-2 bg-primary text-white rounded-lg font-bold text-sm hover:bg-primary/90 transition-colors"
            >
              + Report Incident
            </button>
          </div>

          {incidents.length === 0 ? (
            <div className="text-center py-12">
              <p className="text-text-muted">No active incidents</p>
              <p className="text-sm text-text-muted mt-2">All systems operational ✓</p>
            </div>
          ) : (
            <div className="space-y-4">
              {incidents.map((incident) => (
                <div
                  key={incident.id}
                  className="border border-border rounded-xl p-4 hover:border-primary/50 transition-colors"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center gap-3">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase ${getSeverityColor(incident.severity)}`}>
                        {incident.severity}
                      </span>
                      <span className="text-sm font-bold uppercase tracking-wider text-text-muted">
                        {incident.type}
                      </span>
                    </div>
                    <span className="text-xs text-text-muted">
                      {new Date(incident.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  
                  <h3 className="font-bold mb-1">{incident.location}</h3>
                  <p className="text-sm text-text-muted mb-2">{incident.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs">
                    <span className="text-text-muted">Zone: {incident.zone}</span>
                    <span className="text-text-muted">Status: {incident.status}</span>
                    <span className="text-text-muted">Reported by: {incident.reportedBy}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Quick Actions */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-8">
          <button className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-colors text-left">
            <h3 className="font-bold mb-2">Staff Dispatch</h3>
            <p className="text-sm text-text-muted">Assign tasks to ground staff</p>
          </button>
          
          <button className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-colors text-left">
            <h3 className="font-bold mb-2">Queue Management</h3>
            <p className="text-sm text-text-muted">View and manage all queues</p>
          </button>
          
          <button className="bg-surface border border-border rounded-xl p-6 hover:border-primary/50 transition-colors text-left">
            <h3 className="font-bold mb-2">Analytics</h3>
            <p className="text-sm text-text-muted">View KPIs and reports</p>
          </button>
        </div>
      </div>
    </div>
  );
}
