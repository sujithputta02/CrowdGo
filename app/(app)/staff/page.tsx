"use client";

import { useEffect, useState } from 'react';
import { useAuth } from '@/components/AuthProvider';
import { AlertCircle, CheckCircle, Clock, MapPin, Phone, Plus } from 'lucide-react';

interface StaffTask {
  id: string;
  incidentId: string;
  assignedTo: string;
  type: string;
  description: string;
  location: string;
  zone: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'acknowledged' | 'in_progress' | 'completed';
  createdAt: Date;
  acknowledgedAt?: Date;
  completedAt?: Date;
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
  createdAt: Date;
}

export default function StaffPage() {
  const { user } = useAuth();
  const [tasks, setTasks] = useState<StaffTask[]>([]);
  const [showReportForm, setShowReportForm] = useState(false);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    type: 'safety',
    description: '',
    location: '',
    zone: '',
    severity: 'medium',
  });

  useEffect(() => {
    if (user?.uid) {
      fetchTasks();
      const interval = setInterval(fetchTasks, 15000);
      return () => clearInterval(interval);
    }
  }, [user?.uid]);

  const fetchTasks = async () => {
    try {
      const res = await fetch(`/api/v1/staff/tasks?staffId=${user?.uid}`);
      if (res.ok) {
        const data = await res.json();
        setTasks(data.data.tasks || []);
      }
    } catch (error) {
      console.error('Failed to fetch tasks:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportIncident = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const res = await fetch('/api/v1/ops/incidents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          reportedBy: user?.uid,
          reportedByRole: 'staff',
          status: 'open',
        }),
      });

      if (res.ok) {
        setFormData({ type: 'safety', description: '', location: '', zone: '', severity: 'medium' });
        setShowReportForm(false);
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to report incident:', error);
    }
  };

  const handleAcknowledgeTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/v1/staff/tasks/${taskId}/acknowledge`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to acknowledge task:', error);
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    try {
      const res = await fetch(`/api/v1/staff/tasks/${taskId}/complete`, {
        method: 'POST',
      });

      if (res.ok) {
        fetchTasks();
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'critical':
        return 'bg-red-100 text-red-800 border-red-300';
      case 'high':
        return 'bg-orange-100 text-orange-800 border-orange-300';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'low':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-green-500" />;
      case 'in_progress':
        return <Clock className="w-5 h-5 text-blue-500" />;
      case 'acknowledged':
        return <AlertCircle className="w-5 h-5 text-yellow-500" />;
      default:
        return <AlertCircle className="w-5 h-5 text-red-500" />;
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Loading tasks...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-3xl font-black uppercase tracking-wider mb-2">
            Staff Dashboard
          </h1>
          <p className="text-text-muted">Your assigned tasks and incident reports</p>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-surface rounded-lg p-4 border border-border text-center">
            <p className="text-2xl font-black text-primary">{tasks.filter(t => t.status === 'pending').length}</p>
            <p className="text-xs text-text-muted uppercase font-bold">Pending</p>
          </div>
          <div className="bg-surface rounded-lg p-4 border border-border text-center">
            <p className="text-2xl font-black text-yellow-500">{tasks.filter(t => t.status === 'in_progress').length}</p>
            <p className="text-xs text-text-muted uppercase font-bold">In Progress</p>
          </div>
          <div className="bg-surface rounded-lg p-4 border border-border text-center">
            <p className="text-2xl font-black text-green-500">{tasks.filter(t => t.status === 'completed').length}</p>
            <p className="text-xs text-text-muted uppercase font-bold">Completed</p>
          </div>
        </div>

        {/* Report Incident Button */}
        <button
          onClick={() => setShowReportForm(!showReportForm)}
          className="w-full mb-6 px-4 py-3 bg-primary text-white rounded-lg font-bold uppercase tracking-wider hover:bg-primary/90 transition-colors flex items-center justify-center gap-2"
        >
          <Plus className="w-5 h-5" />
          Report Incident
        </button>

        {/* Report Form */}
        {showReportForm && (
          <div className="bg-surface rounded-lg border border-border p-6 mb-6">
            <h2 className="text-lg font-bold uppercase mb-4">Report Incident</h2>
            <form onSubmit={handleReportIncident} className="space-y-4">
              <div>
                <label className="block text-sm font-bold uppercase mb-2">Type</label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text"
                >
                  <option value="safety">Safety Issue</option>
                  <option value="facility">Facility Problem</option>
                  <option value="queue">Queue Issue</option>
                  <option value="medical">Medical</option>
                  <option value="other">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Severity</label>
                <select
                  value={formData.severity}
                  onChange={(e) => setFormData({ ...formData, severity: e.target.value })}
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Location</label>
                <input
                  type="text"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="e.g., Gate A, Level 2"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Zone</label>
                <input
                  type="text"
                  value={formData.zone}
                  onChange={(e) => setFormData({ ...formData, zone: e.target.value })}
                  placeholder="e.g., North, South"
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-bold uppercase mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  placeholder="Describe the incident..."
                  className="w-full px-3 py-2 border border-border rounded-lg bg-background text-text h-24"
                  required
                />
              </div>

              <div className="flex gap-3">
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-primary text-white rounded-lg font-bold uppercase hover:bg-primary/90 transition-colors"
                >
                  Submit Report
                </button>
                <button
                  type="button"
                  onClick={() => setShowReportForm(false)}
                  className="flex-1 px-4 py-2 bg-surface border border-border text-text rounded-lg font-bold uppercase hover:border-primary/50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Tasks List */}
        <div className="space-y-4">
          <h2 className="text-lg font-bold uppercase mb-4">My Tasks</h2>

          {tasks.length === 0 ? (
            <div className="bg-surface rounded-lg border border-border p-8 text-center">
              <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
              <p className="font-bold mb-1">All caught up!</p>
              <p className="text-sm text-text-muted">No pending tasks at the moment</p>
            </div>
          ) : (
            tasks.map((task) => (
              <div
                key={task.id}
                className="bg-surface rounded-lg border border-border p-4 hover:border-primary/50 transition-colors"
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(task.status)}
                    <div>
                      <span className={`inline-block px-2 py-1 rounded text-xs font-bold uppercase border ${getPriorityColor(task.priority)}`}>
                        {task.priority}
                      </span>
                      <p className="font-bold mt-1">{task.type}</p>
                    </div>
                  </div>
                  <span className="text-xs text-text-muted">
                    {new Date(task.createdAt).toLocaleTimeString()}
                  </span>
                </div>

                <p className="text-sm text-text-muted mb-3">{task.description}</p>

                <div className="flex items-center gap-4 text-sm mb-4">
                  <div className="flex items-center gap-1 text-text-muted">
                    <MapPin className="w-4 h-4" />
                    {task.location} • {task.zone}
                  </div>
                </div>

                <div className="flex gap-2">
                  {task.status === 'pending' && (
                    <button
                      onClick={() => handleAcknowledgeTask(task.id)}
                      className="flex-1 px-3 py-2 bg-primary text-white rounded font-bold text-sm uppercase hover:bg-primary/90 transition-colors"
                    >
                      Acknowledge
                    </button>
                  )}
                  {(task.status === 'acknowledged' || task.status === 'in_progress') && (
                    <button
                      onClick={() => handleCompleteTask(task.id)}
                      className="flex-1 px-3 py-2 bg-green-500 text-white rounded font-bold text-sm uppercase hover:bg-green-600 transition-colors"
                    >
                      Mark Complete
                    </button>
                  )}
                  {task.status === 'completed' && (
                    <div className="flex-1 px-3 py-2 bg-green-100 text-green-800 rounded font-bold text-sm uppercase text-center">
                      ✓ Completed
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
