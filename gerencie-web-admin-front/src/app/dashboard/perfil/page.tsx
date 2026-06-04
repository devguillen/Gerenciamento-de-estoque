'use client';

import { useEffect, useState } from 'react';
import { auditLogService, AuditLog } from '@/services/auditLogService';
import { ChevronRight, Home, Eye, LogOut, LogIn, Package, FolderTree, Trash2, Edit, Plus } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const actionIcons: Record<string, any> = {
  LOGIN: LogIn,
  LOGOUT: LogOut,
  CREATE: Plus,
  UPDATE: Edit,
  DELETE: Trash2,
};

const entityLabels: Record<string, string> = {
  User: 'Usuário',
  Product: 'Produto',
  Category: 'Categoria',
  Brand: 'Marca',
  Supplier: 'Fornecedor',
  Purchase: 'Compra',
  StockMovement: 'Movimento de Estoque',
};

const actionLabels: Record<string, string> = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  CREATE: 'Criação',
  UPDATE: 'Atualização',
  DELETE: 'Exclusão',
};

export default function PerfilPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    loadLogs();
  }, [page]);

  const loadLogs = async () => {
    try {
      setLoading(true);
      const response = await auditLogService.getAuditLogs(page, 20);
      setLogs(response.data);
      setTotalPages(response.pagination.totalPages);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
    } finally {
      setLoading(false);
    }
  };

  const getActionIcon = (action: string) => {
    return actionIcons[action] || Edit;
  };

  const getActionLabel = (action: string) => {
    return actionLabels[action] || action;
  };

  const getEntityLabel = (entity: string) => {
    return entityLabels[entity] || entity;
  };

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), {
      addSuffix: true,
      locale: ptBR,
    });
  };

  const parseJsonSafely = (jsonString: string | null) => {
    if (!jsonString) return null;
    try {
      return JSON.parse(jsonString);
    } catch {
      return null;
    }
  };

  const renderReadableValues = (values: any) => {
    if (!values) return null;
    return Object.entries(values).map(([key, value]) => {
      const label = getFieldLabel(key);
      const displayValue = formatFieldValue(key, value);
      return (
        <div key={key} className="flex justify-between">
          <span className="text-muted-foreground">{label}:</span>
          <span className="font-medium">{displayValue}</span>
        </div>
      );
    });
  };

  const getFieldLabel = (key: string) => {
    const labels: Record<string, string> = {
      name: 'Nome',
      brand_id: 'Marca',
      unit_type: 'Unidade',
      category_ids: 'Categorias',
      min_limit: 'Estoque Mínimo',
      max_limit: 'Estoque Máximo',
      priority: 'Prioridade',
      email: 'E-mail',
      password: 'Senha',
      role: 'Função',
    };
    return labels[key] || key;
  };

  const formatFieldValue = (key: string, value: any) => {
    if (value === null || value === undefined) return 'N/A';
    if (Array.isArray(value)) {
      if (key === 'category_ids') return `${value.length} categorias`;
      return value.join(', ');
    }
    if (typeof value === 'boolean') return value ? 'Sim' : 'Não';
    if (key === 'password') return '••••••••';
    return String(value);
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="flex flex-col mb-6">
        <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
          <Home className="h-4 w-4" />
          <ChevronRight className="h-4 w-4" />
          <span>Meu Perfil</span>
        </div>
        <h1 className="text-3xl font-bold">Histórico de Atividades</h1>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Registro de Ações</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="text-center py-8">Carregando...</div>
          ) : logs.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma atividade registrada ainda.
            </div>
          ) : (
            <div className="space-y-4">
              {logs.map((log) => {
                const ActionIcon = getActionIcon(log.action);
                return (
                  <div
                    key={log.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      <div className="p-2 bg-primary/10 rounded-full">
                        <ActionIcon className="h-5 w-5 text-primary" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="font-medium">{getActionLabel(log.action)}</span>
                          <span className="text-muted-foreground">em</span>
                          <span className="font-medium">{getEntityLabel(log.entity)}</span>
                        </div>
                        <div className="text-sm text-muted-foreground">
                          Por {log.user.name} • {formatTimestamp(log.createdAt)}
                        </div>
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setSelectedLog(log)}
                    >
                      <Eye className="h-4 w-4" />
                    </Button>
                  </div>
                );
              })}
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex justify-center gap-2 mt-6">
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
              >
                Anterior
              </Button>
              <span className="flex items-center px-4">
                Página {page} de {totalPages}
              </span>
              <Button
                variant="outline"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page === totalPages}
              >
                Próxima
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedLog} onOpenChange={() => setSelectedLog(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes da Atividade</DialogTitle>
          </DialogHeader>
          {selectedLog && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Ação</label>
                  <p className="font-medium">{getActionLabel(selectedLog.action)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Entidade</label>
                  <p className="font-medium">{getEntityLabel(selectedLog.entity)}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Usuário</label>
                  <p className="font-medium">{selectedLog.user.name}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Data</label>
                  <p className="font-medium">{new Date(selectedLog.createdAt).toLocaleString('pt-BR')}</p>
                </div>
              </div>

              {selectedLog.oldValues && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Valores Anteriores</label>
                  <div className="p-3 bg-muted rounded text-sm space-y-1">
                    {renderReadableValues(parseJsonSafely(selectedLog.oldValues))}
                  </div>
                </div>
              )}

              {selectedLog.newValues && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground mb-2 block">Valores Atuais</label>
                  <div className="p-3 bg-muted rounded text-sm space-y-1">
                    {renderReadableValues(parseJsonSafely(selectedLog.newValues))}
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
