import api from './api';
import { AiAnalysisStats, AiAnalysisResult } from '../types';

export const getAiStats = async (): Promise<AiAnalysisStats> => {
  const response = await api.get('/ai/statistics');
  return response.data;
};

export const analyzeLog = async (logId: string): Promise<AiAnalysisResult> => {
  // Sends the log ID to your backend to perform the actual AI analysis
  const response = await api.post('/ai/analyze', { logId });
  return response.data;
};