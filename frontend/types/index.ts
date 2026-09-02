export interface User {
  id: string;
  name: string;
  email: string;
  role: 'ADMIN' | 'USER';
  status: 'ACTIVE' | 'INACTIVE';
}

export interface DashboardStats {
  totalLogs: number;
  logsToday: number;
  totalAnomalies: number;
  criticalAnomalies: number;
  openIncidents: number;
  criticalIncidents: number;
  securityEvents: number;
  unreadNotifications: number;
}

export interface Log {
  id: string;
  timestamp: string;
  source: string;
  eventType: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: string;
  responseTime: number;
  ipAddress: string;
  endpoint: string;
  anomalyScore: number;
  // Extended fields for details page:
  userAgent?: string;
  metadata?: Record<string, any>;
  analysis?: string; // The backend's AI/rule-based analysis
}

export interface ApiResponse<T> {
  data: T;
  message?: string;
  status: number;
}

export interface AnomalyStats {
  totalAnomalies: number;
  criticalAnomalies: number;
  highRisk: number;
  averageScore: number;
  // Chart data expected from backend
  trendData?: { date: string; count: number }[];
  typeDistribution?: { type: string; count: number }[];
  scoreDistribution?: { range: string; count: number }[];
}

export interface Anomaly {
  id: string;
  timestamp: string;
  source: string;
  ipAddress: string;
  endpoint: string;
  type: string;
  score: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  reason: string;
  status: string;
}

export interface PaginatedAnomalies {
  anomalies: Anomaly[];
  total: number;
  page: number;
  totalPages: number;
}

export interface DetectionSignal {
  name: string; // e.g., "Frequency Analysis", "Latency Anomaly"
  score: number; // 0 to 100
}

export interface AnomalyDetail extends Anomaly {
  detectionSignals?: DetectionSignal[];
  aiAnalysis?: string;
  relatedLogs?: string[];
  relatedIncidentId?: string;
  userAgent?: string;
}


export interface AiAnalysisStats {
  totalAnalyses: number;
  highRiskFindings: number;
  criticalFindings: number;
  averageRiskScore: number;
}

export interface AiAnalysisResult {
  logId: string;
  riskScore: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  analysis: string;
  detectedIndicators: string[];
  recommendations: string[];
  analyzedAt: string;
}


export interface IncidentStats {
  totalIncidents: number;
  open: number;
  investigating: number;
  resolved: number;
  critical: number;
}

export interface IncidentTimelineEvent {
  id: string;
  timestamp: string;
  message: string;
  type: 'DETECTED' | 'CREATED' | 'ANALYSIS' | 'ASSIGNED' | 'RESOLVED' | 'SYSTEM';
}

export interface Incident {
  id: string;
  title: string;
  description: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  status: 'OPEN' | 'INVESTIGATING' | 'RESOLVED' | 'CLOSED';
  source: string;
  createdAt: string;
  updatedAt: string;
  assignedTo?: {
    id: string;
    name: string;
  };
  // Extended fields for details page
  relatedLogs?: string[];
  relatedAnomalies?: string[];
  securityEvents?: string[];
  aiAnalysis?: string;
  timeline?: IncidentTimelineEvent[];
}

export interface PaginatedIncidents {
  incidents: Incident[];
  total: number;
  page: number;
  totalPages: number;
}