import api from './api';
import { DashboardStats } from '../types';

export const getDashboardStats = async (): Promise<DashboardStats> => {
  const response = await api.get('/dashboard/statistics');
  return response.data;
};