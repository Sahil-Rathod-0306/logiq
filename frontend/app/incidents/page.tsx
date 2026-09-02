'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { getIncidentStats, getIncidents, IncidentQueryParams } from '@/services/incident.service';
import { IncidentStats, PaginatedIncidents } from '@/types';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  ShieldAlert, Activity, Search, Eye, AlertTriangle, 
  Database, ChevronLeft, ChevronRight, CheckCircle, Clock 
} from 'lucide-react';

export default function IncidentsPage() {
  const [stats, setStats] = useState<IncidentStats | null>(null);
  const [data, setData] = useState<PaginatedIncidents | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  const [filters, setFilters] = useState<IncidentQueryParams>({
    page: 1,
    limit: 15,
    search: '',
  });

  const fetchData = async () => {
    try {
      setLoading(true);
      setError(false);
      const [statsRes, incidentsRes] = await Promise.all([
        getIncidentStats(),
        getIncidents(filters)
      ]);
      setStats(statsRes);
      setData(incidentsRes);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.severity, filters.status]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchData();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-white">Incident Response</h1>
          <p className="text-sm text-slate-400 mt-1">Investigate and manage security incidents</p>
        </div>
      </div>

      {/* Top Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
        <StatCard title="Total" value={stats?.totalIncidents ?? '-'} icon={<Database className="text-blue-400" />} />
        <StatCard title="Open" value={stats?.open ?? '-'} icon={<AlertTriangle className="text-red-400" />} />
        <StatCard title="Investigating" value={stats?.investigating ?? '-'} icon={<Activity className="text-yellow-400" />} />
        <StatCard title="Resolved" value={stats?.resolved ?? '-'} icon={<CheckCircle className="text-emerald-400" />} />
        <StatCard title="Critical" value={stats?.critical ?? '-'} icon={<ShieldAlert className="text-red-500" />} />
      </div>

      {/* Data Table Section */}
      <div className="bg-[#111827] border border-slate-800 rounded-xl shadow-sm overflow-hidden">
        {/* Table Toolbar */}
        <div className="p-4 border-b border-slate-800 flex flex-col md:flex-row gap-4 justify-between items-center bg-slate-800/20">
          <form onSubmit={handleSearch} className="flex-1 w-full max-w-md relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
            <input
              type="text"
              placeholder="Search incidents by ID or title..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full bg-[#0B0F19] border border-slate-700 text-slate-200 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500"
            />
          </form>
          <div className="flex gap-2 w-full md:w-auto">
             <select
              value={filters.status}
              onChange={(e) => setFilters({ ...filters, status: e.target.value, page: 1 })}
              className="bg-[#0B0F19] border border-slate-700 text-sm text-slate-300 rounded-md px-3 py-2 focus:outline-none"
            >
              <option value="">All Statuses</option>
              <option value="OPEN">Open</option>
              <option value="INVESTIGATING">Investigating</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
            </select>
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value, page: 1 })}
              className="bg-[#0B0F19] border border-slate-700 text-sm text-slate-300 rounded-md px-3 py-2 focus:outline-none"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
        </div>

        {/* Data Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3 font-medium">Incident ID</th>
                <th className="px-6 py-3 font-medium">Title</th>
                <th className="px-6 py-3 font-medium">Severity</th>
                <th className="px-6 py-3 font-medium">Status</th>
                <th className="px-6 py-3 font-medium">Created At</th>
                <th className="px-6 py-3 font-medium">Assigned To</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading && !data ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">Loading...</td></tr>
              ) : error ? (
                 <tr><td colSpan={7} className="px-6 py-12 text-center text-red-400">Error connecting to backend API.</td></tr>
              ) : !data || data.incidents.length === 0 ? (
                <tr><td colSpan={7} className="px-6 py-12 text-center text-slate-500">No incidents found.</td></tr>
              ) : (
                data.incidents.map((incident) => (
                  <tr key={incident.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{incident.id}</td>
                    <td className="px-6 py-4">
                      <p className="text-slate-200 font-medium truncate max-w-[250px]" title={incident.title}>
                        {incident.title}
                      </p>
                    </td>
                    <td className="px-6 py-4"><SeverityBadge level={incident.severity as any} /></td>
                    <td className="px-6 py-4"><StatusBadge status={incident.status} /></td>
                    <td className="px-6 py-4 text-slate-300">{new Date(incident.createdAt).toLocaleString()}</td>
                    <td className="px-6 py-4 text-slate-400">{incident.assignedTo?.name || 'Unassigned'}</td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/incidents/${incident.id}`}
                        className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                      >
                        <Eye className="w-4 h-4" />
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function StatCard({ title, value, icon }: { title: string; value: string | number; icon: React.ReactNode }) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 shadow-sm flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
        <h4 className="text-xl font-bold text-slate-100">{value}</h4>
      </div>
      <div className="p-2 bg-slate-800/50 rounded-lg">{icon}</div>
    </div>
  );
}