'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getLogById } from '@/services/log.service';
import { Log } from '@/types';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  ArrowLeft, Activity, Server, Clock, ShieldAlert, 
  Terminal, Globe, Network, Cpu, FileJson, AlertTriangle 
} from 'lucide-react';
import Link from 'next/link';

export default function LogDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [log, setLog] = useState<Log | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchLogDetails = async () => {
      try {
        setLoading(true);
        const data = await getLogById(id);
        setLog(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchLogDetails();
  }, [id]);

  if (loading) {
    return <LogDetailsSkeleton />;
  }

  if (error || !log) {
    return (
      <div className="flex flex-col items-center justify-center h-[60vh] border border-slate-800 rounded-xl bg-[#111827]">
        <AlertTriangle className="text-red-500 mb-4 w-12 h-12" />
        <h3 className="text-lg font-semibold text-white mb-2">Failed to load log details</h3>
        <p className="text-slate-400 mb-6">The requested log could not be found or the backend is unreachable.</p>
        <button onClick={() => router.back()} className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-md transition-colors">
          Go Back
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/logs" className="p-2 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-300 transition-colors">
            <ArrowLeft className="w-5 h-5" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              Log Details
              <span className="text-sm font-normal text-slate-500 font-mono ml-2">#{log.id}</span>
            </h1>
            <p className="text-sm text-slate-400">
              {new Date(log.timestamp).toLocaleString()}
            </p>
          </div>
        </div>
      </div>

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <StatCard title="Severity" value={<SeverityBadge level={log.severity as any} />} icon={<ShieldAlert className="text-slate-400" />} />
        <StatCard title="Status" value={<StatusBadge status={log.status} />} icon={<Activity className="text-slate-400" />} />
        <StatCard 
          title="Anomaly Score" 
          value={
            <span className={`text-xl font-bold ${log.anomalyScore > 80 ? 'text-red-400' : log.anomalyScore > 50 ? 'text-yellow-400' : 'text-emerald-400'}`}>
              {log.anomalyScore} / 100
            </span>
          } 
          icon={<Cpu className="text-slate-400" />} 
        />
        <StatCard title="Response Time" value={<span className="text-xl font-bold text-slate-200">{log.responseTime} ms</span>} icon={<Clock className="text-slate-400" />} />
      </div>

      {/* Detailed Information */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Network & Source (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-400" /> Network & Request Info
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-y-6 gap-x-8">
              <DetailItem label="Source" value={log.source} icon={<Server className="w-4 h-4" />} />
              <DetailItem label="Event Type" value={log.eventType} icon={<Activity className="w-4 h-4" />} />
              <DetailItem label="IP Address" value={log.ipAddress} icon={<Globe className="w-4 h-4" />} fontMono />
              <DetailItem label="Endpoint" value={log.endpoint} icon={<Terminal className="w-4 h-4" />} fontMono />
              <div className="md:col-span-2">
                <DetailItem label="User Agent" value={log.userAgent || 'Not provided'} icon={<Globe className="w-4 h-4" />} />
              </div>
            </div>
          </div>

          {/* Backend Analysis Section */}
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
             <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <Cpu className="w-4 h-4 text-purple-400" /> Backend Analysis
            </h3>
            {log.analysis ? (
               <div className="p-4 bg-[#0B0F19] rounded-lg border border-slate-800 text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                 {log.analysis}
               </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-32 border border-dashed border-slate-700 rounded-lg bg-slate-900/30">
                <p className="text-sm text-slate-500">No analysis provided by backend for this log.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Raw Metadata (1/3 width) */}
        <div className="space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm h-full max-h-[800px] flex flex-col">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <FileJson className="w-4 h-4 text-emerald-400" /> Raw Metadata
            </h3>
            <div className="flex-1 bg-[#0B0F19] p-4 rounded-lg border border-slate-800 overflow-auto">
              {log.metadata && Object.keys(log.metadata).length > 0 ? (
                <pre className="text-xs text-emerald-400/90 font-mono whitespace-pre-wrap">
                  {JSON.stringify(log.metadata, null, 2)}
                </pre>
              ) : (
                <p className="text-sm text-slate-600 text-center mt-10">No metadata attached</p>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}

// Subcomponents for cleaner code

function StatCard({ title, value, icon }: { title: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div className="bg-[#111827] border border-slate-800 rounded-xl p-4 flex items-center justify-between">
      <div>
        <p className="text-xs font-medium text-slate-500 mb-1">{title}</p>
        <div>{value}</div>
      </div>
      <div className="p-2 bg-slate-800/50 rounded-lg">{icon}</div>
    </div>
  );
}

function DetailItem({ label, value, icon, fontMono = false }: { label: string; value: string; icon: React.ReactNode; fontMono?: boolean }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 mb-1.5 flex items-center gap-1.5">
        <span className="text-slate-600">{icon}</span> {label}
      </p>
      <p className={`text-sm text-slate-200 ${fontMono ? 'font-mono bg-slate-800/50 px-2 py-1 rounded inline-block' : 'break-words'}`}>
        {value}
      </p>
    </div>
  );
}

function LogDetailsSkeleton() {
  return (
    <div className="space-y-6 animate-pulse">
      <div className="flex gap-4 items-center">
        <div className="w-10 h-10 bg-slate-800 rounded-md"></div>
        <div className="space-y-2">
          <div className="w-48 h-6 bg-slate-800 rounded"></div>
          <div className="w-32 h-4 bg-slate-800 rounded"></div>
        </div>
      </div>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => <div key={i} className="h-20 bg-slate-800 rounded-xl"></div>)}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-6">
          <div className="h-64 bg-slate-800 rounded-xl"></div>
          <div className="h-48 bg-slate-800 rounded-xl"></div>
        </div>
        <div className="h-full min-h-[400px] bg-slate-800 rounded-xl"></div>
      </div>
    </div>
  );
}