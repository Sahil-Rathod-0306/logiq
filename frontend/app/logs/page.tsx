'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { getLogs, LogQueryParams, PaginatedLogs } from '@/services/log.service';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Search, Filter, ChevronLeft, ChevronRight, Eye, AlertTriangle, Database } from 'lucide-react';
import Link from 'next/link';
import { LogUpload } from '@/components/logs/LogUpload';

export default function LogsPage() {
  const router = useRouter();
  const [data, setData] = useState<PaginatedLogs | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  
  // Filter States
  const [filters, setFilters] = useState<LogQueryParams>({
    page: 1,
    limit: 15,
    search: '',
    severity: '',
  });

  const fetchLogs = async () => {
    try {
      setLoading(true);
      setError(false);
      const result = await getLogs(filters);
      setData(result);
    } catch (err) {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLogs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filters.page, filters.severity]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setFilters({ ...filters, page: 1 });
    fetchLogs();
  };

  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && (!data || newPage <= data.totalPages)) {
      setFilters({ ...filters, page: newPage });
    }
  };

  return (
    <div className="space-y-6">
      <LogUpload onComplete={fetchLogs} />
      {/* Header & Filter Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-[#111827] p-4 rounded-lg border border-slate-800 shadow-sm">
        <form onSubmit={handleSearch} className="flex-1 max-w-lg relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search logs by IP, endpoint, or message..."
            value={filters.search}
            onChange={(e) => setFilters({ ...filters, search: e.target.value })}
            className="w-full bg-[#0B0F19] border border-slate-700 text-slate-200 rounded-md pl-9 pr-4 py-2 text-sm focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
          />
        </form>
        
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-[#0B0F19] border border-slate-700 rounded-md px-3 py-2">
            <Filter className="text-slate-500 w-4 h-4" />
            <select
              value={filters.severity}
              onChange={(e) => setFilters({ ...filters, severity: e.target.value, page: 1 })}
              className="bg-transparent text-sm text-slate-300 focus:outline-none cursor-pointer"
            >
              <option value="">All Severities</option>
              <option value="CRITICAL">Critical</option>
              <option value="HIGH">High</option>
              <option value="MEDIUM">Medium</option>
              <option value="LOW">Low</option>
            </select>
          </div>
          <button 
            onClick={fetchLogs}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm px-4 py-2 rounded-md transition-colors border border-slate-700"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-[#111827] border border-slate-800 rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead className="bg-slate-800/50 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="px-6 py-3 font-medium">Timestamp</th>
                <th className="px-6 py-3 font-medium">Source</th>
                <th className="px-6 py-3 font-medium">Severity</th>
                <th className="px-6 py-3 font-medium">Event Type</th>
                <th className="px-6 py-3 font-medium">IP Address</th>
                <th className="px-6 py-3 font-medium">Score</th>
                <th className="px-6 py-3 font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <tr key={i} className="animate-pulse">
                    <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-20"></div></td>
                    <td className="px-6 py-4"><div className="h-5 bg-slate-700 rounded-full w-16"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-32"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-24"></div></td>
                    <td className="px-6 py-4"><div className="h-4 bg-slate-700 rounded w-8"></div></td>
                    <td className="px-6 py-4 text-right"><div className="h-8 w-8 bg-slate-700 rounded inline-block"></div></td>
                  </tr>
                ))
              ) : error ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <AlertTriangle className="w-8 h-8 mb-2 text-red-500/70" />
                      <p>Error connecting to backend API to fetch logs.</p>
                    </div>
                  </td>
                </tr>
              ) : !data?.logs || data.logs.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-slate-500">
                      <Database className="w-8 h-8 mb-2 text-slate-600" />
                      <p>No logs found matching your criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="px-6 py-4 text-slate-300">
                      {new Date(log.timestamp).toLocaleString()}
                    </td>
                    <td className="px-6 py-4 text-slate-300 font-mono text-xs">{log.source}</td>
                    <td className="px-6 py-4">
                      <SeverityBadge level={log.severity as any} />
                    </td>
                    <td className="px-6 py-4 text-slate-300">{log.eventType}</td>
                    <td className="px-6 py-4 text-slate-400 font-mono text-xs">{log.ipAddress}</td>
                    <td className="px-6 py-4">
                      <span className={`font-semibold ${log.anomalyScore > 80 ? 'text-red-400' : log.anomalyScore > 50 ? 'text-yellow-400' : 'text-emerald-400'}`}>
                        {log.anomalyScore || 0}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        href={`/logs/${log.id}`}
                        className="inline-flex items-center justify-center p-2 rounded-md text-slate-400 hover:text-white hover:bg-slate-700 transition-colors"
                        title="View Details"
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

        {/* Pagination */}
        {!loading && !error && data && data.total > 0 && (
          <div className="flex items-center justify-between px-6 py-4 border-t border-slate-800 bg-[#111827]">
            <span className="text-sm text-slate-400">
              Showing {(filters.page! - 1) * filters.limit! + 1} to {Math.min(filters.page! * filters.limit!, data.total)} of <span className="font-medium text-slate-200">{data.total}</span> logs
            </span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(filters.page! - 1)}
                disabled={filters.page === 1}
                className="p-1.5 rounded-md border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <span className="text-sm text-slate-300 px-2">
                Page {data.page} of {data.totalPages}
              </span>
              <button
                onClick={() => handlePageChange(filters.page! + 1)}
                disabled={filters.page === data.totalPages}
                className="p-1.5 rounded-md border border-slate-700 text-slate-400 hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
