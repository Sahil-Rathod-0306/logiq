import api from './api';
import { AnomalyStats, PaginatedAnomalies } from '../types';
import { AnomalyDetail } from '../types';

export const getAnomalyStats = async (): Promise<AnomalyStats> => {
  const response = await api.get('/anomalies/statistics');
  return response.data;
};

export interface AnomalyQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  severity?: string;
  type?: string;
}

export const getAnomalies = async (params: AnomalyQueryParams): Promise<PaginatedAnomalies> => {
  const response = await api.get('/anomalies', { params });
  return response.data;
};



// Add this to your existing anomaly.service.ts
export const getAnomalyById = async (id: string): Promise<AnomalyDetail> => {
  const response = await api.get(`/anomalies/${id}`);
  return response.data;
};