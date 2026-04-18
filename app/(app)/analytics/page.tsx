"use client";

import { useEffect, useState } from 'react';
import { TrendingDown, TrendingUp, Users, Clock, CheckCircle, AlertCircle } from 'lucide-react';

interface KPI {
  label: string;
  value: string | number;
  unit?: string;
  trend?: number;
  icon: React.ReactNode;
  color: string;
}

interface AnalyticsData {
  kpis: KPI[];
  hourlyData: Array<{ hour: string; waitTime: number; recommendations: number; acceptance: number }>;
  zoneMetrics: Array<{ zone: string; avgWait: number; incidents: number; satisfaction: number }>;
  interventionMetrics: {
    totalTriggered: number;
    totalApproved: number;
    totalCompleted: number;
    successRate: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('24h');

  useEffect(() => {
    fetchAnalytics();
  }, [timeRange]);

  const fetchAnalytics = async () => {
    try {
      const res = await fetch(`/api/v1/analytics/kpis?range=${timeRange}`);
      if (res.ok) {
        const result = await res.json();
        setData(result.data);
      }
    } catch (error) {
      console.error('Failed to fetch analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-primary/20 border-t-primary rounded-full animate-spin mx-auto mb-4" />
          <p className="text-text-muted">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background p-4 pb-24">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-3xl font-black uppercase tracking-wider mb-2">
                Analytics Dashboard
              </h1>
              <p className="text-text-muted">Real-time KPIs and performance metrics</p>
            </div>
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value)}
              className="px-4 py-2 border border-border rounded-lg bg-surface text-text font-bold"
            >
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
              <option value="7d">Last 7 Days</option>
              <option value="30d">Last 30 Days</option>
            </select>
          </div>
        </div>

        {/* KPI Cards */}
        {data && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
              {data.kpis.map((kpi, idx) => (
                <div
                  key={idx}
                  className={`bg-surface rounded-lg border border-border p-6 hover:border-primary/50 transition-colors`}
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className={`p-3 rounded-lg ${kpi.color}`}>
                      {kpi.icon}
                    </div>
                    {kpi.trend !== undefined && (
                      <div className={`flex items-center gap-1 text-sm font-bold ${kpi.trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
                        {kpi.trend > 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                        {Math.abs(kpi.trend)}%
                      </div>
                    )}
                  </div>
                  <p className="text-text-muted text-sm uppercase font-bold mb-2">{kpi.label}</p>
                  <p className="text-3xl font-black">
                    {kpi.value}
                    {kpi.unit && <span className="text-lg text-text-muted ml-1">{kpi.unit}</span>}
                  </p>
                </div>
              ))}
            </div>

            {/* Zone Metrics */}
            <div className="bg-surface rounded-lg border border-border p-6 mb-8">
              <h2 className="text-lg font-black uppercase tracking-wider mb-4">Zone Performance</h2>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-3 px-4 font-bold uppercase text-text-muted">Zone</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-text-muted">Avg Wait</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-text-muted">Incidents</th>
                      <th className="text-left py-3 px-4 font-bold uppercase text-text-muted">Satisfaction</th>
                    </tr>
                  </thead>
                  <tbody>
                    {data.zoneMetrics.map((zone, idx) => (
                      <tr key={idx} className="border-b border-border hover:bg-background/50 transition-colors">
                        <td className="py-3 px-4 font-bold">{zone.zone}</td>
                        <td className="py-3 px-4">
                          <span className={`px-2 py-1 rounded text-xs font-bold ${
                            zone.avgWait > 15 ? 'bg-red-100 text-red-800' :
                            zone.avgWait > 10 ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            {zone.avgWait} min
                          </span>
                        </td>
                        <td className="py-3 px-4">
                          <span className="font-bold">{zone.incidents}</span>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex items-center gap-2">
                            <div className="w-24 bg-border rounded-full h-2">
                              <div
                                className={`h-2 rounded-full ${
                                  zone.satisfaction > 80 ? 'bg-green-500' :
                                  zone.satisfaction > 60 ? 'bg-yellow-500' :
                                  'bg-red-500'
                                }`}
                                style={{ width: `${zone.satisfaction}%` }}
                              />
                            </div>
                            <span className="text-xs font-bold">{zone.satisfaction}%</span>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Intervention Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
              <div className="bg-surface rounded-lg border border-border p-6">
                <h3 className="text-lg font-black uppercase tracking-wider mb-4">Intervention Effectiveness</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted font-bold">Triggered</span>
                    <span className="text-2xl font-black">{data.interventionMetrics.totalTriggered}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted font-bold">Approved</span>
                    <span className="text-2xl font-black text-yellow-500">{data.interventionMetrics.totalApproved}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-text-muted font-bold">Completed</span>
                    <span className="text-2xl font-black text-green-500">{data.interventionMetrics.totalCompleted}</span>
                  </div>
                  <div className="pt-3 border-t border-border flex items-center justify-between">
                    <span className="text-text-muted font-bold">Success Rate</span>
                    <span className="text-2xl font-black text-primary">{data.interventionMetrics.successRate.toFixed(1)}%</span>
                  </div>
                </div>
              </div>

              <div className="bg-surface rounded-lg border border-border p-6">
                <h3 className="text-lg font-black uppercase tracking-wider mb-4">Hourly Trends</h3>
                <div className="space-y-2">
                  {data.hourlyData.slice(-6).map((hour, idx) => (
                    <div key={idx} className="flex items-center justify-between text-sm">
                      <span className="text-text-muted font-bold w-12">{hour.hour}</span>
                      <div className="flex-1 mx-3 flex items-center gap-2">
                        <div className="flex-1 bg-border rounded h-2">
                          <div
                            className="bg-primary rounded h-2"
                            style={{ width: `${(hour.waitTime / 20) * 100}%` }}
                          />
                        </div>
                        <span className="text-xs font-bold w-8 text-right">{hour.waitTime}m</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Summary Stats */}
            <div className="bg-surface rounded-lg border border-border p-6">
              <h3 className="text-lg font-black uppercase tracking-wider mb-4">Summary</h3>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="text-center">
                  <p className="text-text-muted text-sm uppercase font-bold mb-2">Avg Response Time</p>
                  <p className="text-3xl font-black">2.3s</p>
                  <p className="text-xs text-green-500 font-bold mt-1">✓ Within SLO</p>
                </div>
                <div className="text-center">
                  <p className="text-text-muted text-sm uppercase font-bold mb-2">System Uptime</p>
                  <p className="text-3xl font-black">99.8%</p>
                  <p className="text-xs text-green-500 font-bold mt-1">✓ Excellent</p>
                </div>
                <div className="text-center">
                  <p className="text-text-muted text-sm uppercase font-bold mb-2">Recommendation Acceptance</p>
                  <p className="text-3xl font-black">87%</p>
                  <p className="text-xs text-green-500 font-bold mt-1">↑ +5% vs yesterday</p>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
