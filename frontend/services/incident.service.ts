import api from './api';
import { IncidentStats, PaginatedIncidents, Incident } from '../types';

export interface IncidentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  severity?: string;
  status?: string;
}

export const getIncidentStats = async (): Promise<IncidentStats> => {
  const result = await getIncidents({ limit: 100 });
  const count = (status: string) => result.incidents.filter((incident) => incident.status === status).length;
  return { totalIncidents: result.total, open: count("OPEN"), investigating: count("INVESTIGATING"), resolved: count("RESOLVED"), critical: result.incidents.filter((incident) => incident.severity === "CRITICAL").length };
};

export const getIncidents = async (params: IncidentQueryParams): Promise<PaginatedIncidents> => {
  const { search, ...apiParams } = params;
  const response = await api.get('/incidents', { params: apiParams });
  let incidents = (response.data.data as BackendIncident[]).map(normalizeIncident);
  if (search) { const needle = search.toLowerCase(); incidents = incidents.filter((item) => `${item.id} ${item.title}`.toLowerCase().includes(needle)); }
  return { incidents, total: search ? incidents.length : response.data.total, page: response.data.page, totalPages: search ? 1 : response.data.totalPages };
};

export const getIncidentById = async (id: string): Promise<Incident> => {
  const response = await api.get(`/incidents/${id}`);
  return normalizeIncident(response.data.data as BackendIncident);
};
interface BackendIncident { _id: string; title: string; description: string; severity: Incident["severity"]; status: Incident["status"] | "FALSE_POSITIVE"; source?: string; createdAt: string; updatedAt: string; assignedTo?: { _id: string; name: string }; relatedLogIds?: string[]; aiAnalysis?: { explanation?: string } }
const normalizeIncident = (item: BackendIncident): Incident => ({ id: item._id, title: item.title, description: item.description, severity: item.severity, status: item.status === "FALSE_POSITIVE" ? "CLOSED" : item.status, source: item.source || "—", createdAt: item.createdAt, updatedAt: item.updatedAt, assignedTo: item.assignedTo ? { id: item.assignedTo._id, name: item.assignedTo.name } : undefined, relatedLogs: item.relatedLogIds, aiAnalysis: item.aiAnalysis?.explanation });
