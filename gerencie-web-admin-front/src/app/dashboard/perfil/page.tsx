import { ComingSoon } from '@/components/common/coming-soon';
import { UserCog } from 'lucide-react';

export default function PerfilPage() {
  return (
    <ComingSoon
        pageTitle="Meu Perfil"
        title="Área do Usuário em Desenvolvimento"
        description="Aqui você poderá gerenciar seus dados pessoais, alterar senha e configurar preferências de notificações do sistema."
        icon={UserCog}
    />
  );
}
