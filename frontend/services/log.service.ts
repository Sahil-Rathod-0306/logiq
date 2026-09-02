import api from './api';
import { Log } from '../types';

export interface LogQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  severity?: string;
  status?: string;
  source?: string;
}

export interface PaginatedLogs {
  logs: Log[];
  total: number;
  page: number;
  totalPages: number;
}

export const getLogs = async (params: LogQueryParams): Promise<PaginatedLogs> => {
  const response = await api.get('/logs');
  const all = response.data.data as BackendLog[];
  const query = params.search?.toLowerCase().trim();
  const filtered = all.filter((log) => (!params.severity || log.severity === params.severity) && (!query || [log.source, log.ip, log.endpoint, log.message, log.eventType].some((value) => value?.toLowerCase().includes(query))));
  const limit = params.limit || 20, page = params.page || 1, totalPages = Math.max(1, Math.ceil(filtered.length / limit));
  return { logs: filtered.slice((page - 1) * limit, page * limit).map(normalizeLog), total: filtered.length, page, totalPages };
};

export interface BackendLog { _id: string; timestamp: string; source: string; ip?: string | null; endpoint?: string | null; eventType: string; severity: Log["severity"] | "INFO" | "WARNING" | "ERROR"; statusCode?: number; message?: string; responseTime?: number; anomaly?: { detected?: boolean; score?: number; reasons?: string[] }; aiAnalysis?: { explanation?: string; summary?: string } }
export const normalizeLog = (log: BackendLog): Log => ({ id: log._id, timestamp: log.timestamp, source: log.source, eventType: log.eventType, severity: (["LOW", "MEDIUM", "HIGH", "CRITICAL"].includes(log.severity) ? log.severity : "LOW") as Log["severity"], status: log.statusCode ? String(log.statusCode) : "—", responseTime: log.responseTime ?? 0, ipAddress: log.ip ?? "—", endpoint: log.endpoint ?? "—", anomalyScore: log.anomaly?.score ?? 0, metadata: log as unknown as Record<string, unknown>, analysis: log.aiAnalysis?.explanation || log.aiAnalysis?.summary });
export const getLogById = async (id: string): Promise<Log> => {
  const response = await api.get("/logs");
  const found = (response.data.data as BackendLog[]).find((log) => log._id === id);
  if (!found) throw new Error("Log not found");
  return normalizeLog(found);
};
export interface UploadResult { totalRecords: number; processedRecords: number; failedRecords: number; anomaliesDetected: number; incidentsCreated: number; securityEventsCreated: number; errors: { row: number; message: string }[] }
export async function uploadLogFile(file: File): Promise<UploadResult> {
  const data = new FormData(); data.append("file", file);
  const response = await api.post("/logs/upload", data);
  return response.data.data;
}
