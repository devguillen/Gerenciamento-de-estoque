import { api } from './api';

export interface AuditLog {
  id: number;
  userId: number;
  accountId: number;
  action: string;
  entity: string;
  entityId: number | null;
  oldValues: string | null;
  newValues: string | null;
  ipAddress: string | null;
  userAgent: string | null;
  createdAt: string;
  user: {
    id: number;
    name: string;
    email: string;
  };
}

export interface AuditLogResponse {
  data: AuditLog[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export const auditLogService = {
  async getAuditLogs(page: number = 1, limit: number = 20): Promise<AuditLogResponse> {
    const response = await api.app.get<AuditLogResponse>('/audit-logs', {
      params: { page, limit },
    });
    return response.data;
  },

  async getAuditLogById(id: number): Promise<AuditLog> {
    const response = await api.app.get<AuditLog>(`/audit-logs/${id}`);
    return response.data;
  },
};
