import axiosInstance from '../axios.config';

// Interfaces
export interface SystemMetrics {
  cpuUsage: number;
  memoryUsed: number;
  memoryTotal: number;
  diskUsage: number;
  uptime: string;
  uptimeFormatted: string;
  threadCount: number;
  handleCount: number;
  timestamp: string;
}

export interface SystemInfo {
  hostName: string;
  operatingSystem: string;
  architecture: string;
  framework: string;
  processorCount: number;
  workingDirectory: string;
  is64BitOperatingSystem: boolean;
  is64BitProcess: boolean;
  applicationVersion: string;
  startTime: string;
  currentTime: string;
}

export interface HealthCheck {
  name: string;
  status: string;
  value: string;
  message: string;
}

export interface HealthStatus {
  status: string;
  checks: HealthCheck[];
  timestamp: string;
}

export interface LogEntry {
  timestamp: string;
  level: string;
  message: string;
  source: string;
}

export interface LogsResponse {
  logs: LogEntry[];
  total: number;
}

export interface GarbageCollectionResult {
  message: string;
  memoryBeforeMB: number;
  memoryAfterMB: number;
  freedMB: number;
}

// Service
class MonitoringService {
  private readonly BASE_URL = '/monitoring';

  /**
   * Récupère les métriques système
   */
  async getSystemMetrics(): Promise<SystemMetrics> {
    const response = await axiosInstance.get<SystemMetrics>(`${this.BASE_URL}/metrics`);
    return response.data;
  }

  /**
   * Récupère les informations système
   */
  async getSystemInfo(): Promise<SystemInfo> {
    const response = await axiosInstance.get<SystemInfo>(`${this.BASE_URL}/info`);
    return response.data;
  }

  /**
   * Récupère l'état de santé du système
   */
  async getHealthStatus(): Promise<HealthStatus> {
    const response = await axiosInstance.get<HealthStatus>(`${this.BASE_URL}/health`);
    return response.data;
  }

  /**
   * Récupère les logs récents
   */
  async getLogs(limit: number = 100): Promise<LogsResponse> {
    const response = await axiosInstance.get<LogsResponse>(`${this.BASE_URL}/logs`, {
      params: { limit }
    });
    return response.data;
  }

  /**
   * Force le garbage collection
   */
  async forceGarbageCollection(): Promise<GarbageCollectionResult> {
    const response = await axiosInstance.post<GarbageCollectionResult>(`${this.BASE_URL}/gc`);
    return response.data;
  }
}

export const monitoringService = new MonitoringService();
export default monitoringService;
