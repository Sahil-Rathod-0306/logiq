'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { getIncidentById } from '@/services/incident.service';
import { Incident } from '@/types';
import { SeverityBadge } from '@/components/ui/SeverityBadge';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { 
  ArrowLeft, ShieldAlert, Activity, User, Clock, 
  BrainCircuit, Database, Network, FileText, AlertTriangle 
} from 'lucide-react';

export default function IncidentDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  
  const [incident, setIncident] = useState<Incident | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    const fetchIncident = async () => {
      try {
        const data = await getIncidentById(id);
        setIncident(data);
      } catch (err) {
        setError(true);
      } finally {
        setLoading(false);
      }
    };
    if (id) fetchIncident();
  }, [id]);

  if (loading) return <div className="p-12 text-center text-slate-400">Loading Incident Details...</div>;
  if (error || !incident) return <div className="p-12 text-center text-red-400">Failed to load incident.</div>;

  return (
    <div className="space-y-6 max-w-6xl">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <button onClick={() => router.back()} className="p-2 bg-slate-800 hover:bg-slate-700 rounded-md text-slate-300">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              {incident.title}
            </h1>
            <p className="text-sm text-slate-400 font-mono mt-1">Incident ID: {incident.id}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <SeverityBadge level={incident.severity as any} />
          <StatusBadge status={incident.status} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Overview & Links */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <FileText className="w-4 h-4 text-blue-400" /> Incident Overview
            </h3>
            <p className="text-sm text-slate-300 leading-relaxed bg-[#0B0F19] p-4 rounded-lg border border-slate-800">
              {incident.description}
            </p>
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
              <DetailItem label="Source" value={incident.source} icon={<Network className="w-4 h-4" />} />
              <DetailItem label="Created At" value={new Date(incident.createdAt).toLocaleDateString()} icon={<Clock className="w-4 h-4" />} />
              <DetailItem label="Updated At" value={new Date(incident.updatedAt).toLocaleDateString()} icon={<Clock className="w-4 h-4" />} />
              <DetailItem label="Assigned To" value={incident.assignedTo?.name || 'Unassigned'} icon={<User className="w-4 h-4" />} />
            </div>
          </div>

          {/* AI Analysis (If exists) */}
          {incident.aiAnalysis && (
            <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <BrainCircuit className="w-4 h-4 text-purple-400" /> AI Root Cause Analysis
              </h3>
              <div className="p-4 bg-purple-950/10 border border-purple-900/20 rounded-lg text-sm text-slate-300 leading-relaxed whitespace-pre-wrap">
                {incident.aiAnalysis}
              </div>
            </div>
          )}

          {/* Related Entities Links */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-orange-400" /> Related Anomalies
                </h3>
                {incident.relatedAnomalies && incident.relatedAnomalies.length > 0 ? (
                  <ul className="space-y-2">
                    {incident.relatedAnomalies.map((id) => (
                      <li key={id}>
                        <Link href={`/anomalies/${id}`} className="text-sm text-blue-400 hover:underline font-mono">
                          {id}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No linked anomalies.</p>
                )}
             </div>
             <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm">
                <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                  <Database className="w-4 h-4 text-emerald-400" /> Related Logs
                </h3>
                {incident.relatedLogs && incident.relatedLogs.length > 0 ? (
                  <ul className="space-y-2">
                    {incident.relatedLogs.map((id) => (
                      <li key={id}>
                        <Link href={`/logs/${id}`} className="text-sm text-blue-400 hover:underline font-mono">
                          {id}
                        </Link>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">No linked logs.</p>
                )}
             </div>
          </div>

        </div>

        {/* Right Column: Visual Timeline */}
        <div className="lg:col-span-1 space-y-6">
          <div className="bg-[#111827] border border-slate-800 rounded-xl p-6 shadow-sm h-full">
            <h3 className="text-sm font-semibold text-slate-300 mb-6 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Incident Timeline
            </h3>
            
            {incident.timeline && incident.timeline.length > 0 ? (
              <div className="relative border-l border-slate-700 ml-3 space-y-6">
                {incident.timeline.map((event, index) => {
                  
                  // Map event types to visual dots
                  const getTimelineIcon = (type: string) => {
                    switch(type) {
                      case 'DETECTED': return <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-red-500 ring-4 ring-[#111827]"></div>;
                      case 'CREATED': return <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-orange-500 ring-4 ring-[#111827]"></div>;
                      case 'ANALYSIS': return <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-purple-500 ring-4 ring-[#111827]"></div>;
                      case 'ASSIGNED': return <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-blue-500 ring-4 ring-[#111827]"></div>;
                      case 'RESOLVED': return <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-[#111827]"></div>;
                      default: return <div className="absolute -left-[5px] top-1 w-2.5 h-2.5 rounded-full bg-slate-500 ring-4 ring-[#111827]"></div>;
                    }
                  };

                  return (
                    <div key={event.id} className="relative pl-6">
                      {getTimelineIcon(event.type)}
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-slate-300">{event.message}</span>
                        <span className="text-xs text-slate-500 mt-0.5">
                          {new Date(event.timestamp).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-sm text-slate-500 text-center py-8 border border-dashed border-slate-700 rounded-lg">
                No timeline data provided by backend.
              </div>
            )}
          </div>
        </div>

      </div>
    </div>
  );
}

function DetailItem({ label, value, icon }: { label: string; value: React.ReactNode; icon: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-slate-500 mb-1 flex items-center gap-1.5">
        <span className="text-slate-600">{icon}</span> {label}
      </p>
      <p className="text-sm text-slate-200 truncate">{value}</p>
    </div>
  );
}