import { ComingSoon } from '@/components/common/coming-soon';
import { History } from 'lucide-react';

export default function EstoqueHistoricoPage() {
  return (
    <ComingSoon
      pageTitle="Histórico de Estoque"
      title="Em breve: histórico de movimentações"
      description="Aqui você poderá consultar todas as entradas, saídas e ajustes do estoque em um só lugar."
      icon={History}
    />
  );
}
