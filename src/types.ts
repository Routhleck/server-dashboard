export interface Server {
  name: string;
  ip: string;
  port: number;
}

export interface ServerStatus {
  name: string;
  status: 'online' | 'offline' | 'unknown';
  responseTime: number;
  lastChecked: string;
}

export interface StatusData {
  lastUpdate: string;
  servers: ServerStatus[];
}

export interface HistoryPoint {
  timestamp: string;
  status: 'online' | 'offline';
  responseTime: number;
}

export interface HistoryData {
  [serverName: string]: HistoryPoint[];
}
