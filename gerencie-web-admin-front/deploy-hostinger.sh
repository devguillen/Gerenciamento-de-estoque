#!/bin/bash

# Script de Deploy para Hostinger
# Uso: ./deploy-hostinger.sh

echo "🚀 Iniciando deploy para Hostinger..."

# Configurações
SERVER="deploy@72.61.35.107"
REMOTE_PATH="/home/deploy/apps/gerencie-web-admin-front"
APP_NAME="gerencie-web-admin-front"

# Cores para output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo ""
echo "${YELLOW}📦 Passo 1: Fazendo build da aplicação...${NC}"
npm run build

if [ $? -ne 0 ]; then
    echo "${RED}❌ Erro no build! Verifique os erros acima.${NC}"
    exit 1
fi

echo ""
echo "${GREEN}✅ Build concluído com sucesso!${NC}"

echo ""
echo "${YELLOW}📤 Passo 2: Compactando e enviando arquivos...${NC}"
echo "Servidor: $SERVER"
echo "Destino: $REMOTE_PATH"
echo ""

# Nome do arquivo temporário
DEPLOY_FILE="gerencie-web-admin-front-deploy-$(date +%Y%m%d-%H%M%S).tar.gz"

echo "📦 Criando arquivo tar.gz..."
tar -czf ${DEPLOY_FILE} \
  --exclude='node_modules' \
  --exclude='.git' \
  --exclude='.next/cache' \
  --exclude='.env.local' \
  --exclude='.env' \
  --exclude='*.log' \
  --exclude='.DS_Store' \
  --exclude='.vscode' \
  --exclude='.idea' \
  --exclude='deploy-*.tar.gz' \
  .next src public \
  package.json package-lock.json \
  server.js next.config.ts tsconfig.json \
  tailwind.config.ts postcss.config.mjs components.json \
  ecosystem.config.js

if [ $? -ne 0 ]; then
    echo "${RED}❌ Erro ao criar arquivo tar.gz!${NC}"
    exit 1
fi

echo "${GREEN}✅ Arquivo ${DEPLOY_FILE} criado!${NC}"

echo ""
echo "📁 Criando diretório no servidor (se não existir)..."
ssh -T ${SERVER} "mkdir -p ${REMOTE_PATH}"

echo ""
echo "📤 Enviando arquivo para o servidor..."
scp ${DEPLOY_FILE} ${SERVER}:${REMOTE_PATH}/

if [ $? -ne 0 ]; then
    echo "${RED}❌ Erro ao enviar arquivo!${NC}"
    rm ${DEPLOY_FILE}
    exit 1
fi

echo "${GREEN}✅ Arquivo enviado com sucesso!${NC}"

# Remover arquivo local
rm ${DEPLOY_FILE}
echo "🗑️  Arquivo local removido"

echo ""
echo "${YELLOW}📦 Descompactando no servidor...${NC}"

ssh -T ${SERVER} "cd ${REMOTE_PATH} && tar -xzf ${DEPLOY_FILE} && rm ${DEPLOY_FILE} && echo '✅ Arquivos extraídos!'"

if [ $? -ne 0 ]; then
    echo "${RED}❌ Erro ao descompactar no servidor!${NC}"
    exit 1
fi

echo ""
echo "${GREEN}✅ Descompactação concluída!${NC}"

echo ""
echo "${YELLOW}📥 Passo 3: Instalando dependências no servidor...${NC}"

ssh -T ${SERVER} "source ~/.nvm/nvm.sh && cd ${REMOTE_PATH} && echo '📦 Instalando dependências...' && npm install --production --force && echo '✅ Dependências instaladas!'"

if [ $? -ne 0 ]; then
    echo "${RED}❌ Erro ao instalar dependências!${NC}"
    exit 1
fi

echo ""
echo "${GREEN}✅ Dependências instaladas com sucesso!${NC}"

echo ""
echo "${YELLOW}🔄 Passo 4: Reiniciando aplicação com PM2...${NC}"

# Verificar se a aplicação já está rodando e reiniciar ou iniciar
ssh -T ${SERVER} "source ~/.nvm/nvm.sh && cd ${REMOTE_PATH} && \
if pm2 list | grep -q ${APP_NAME}; then \
  echo '🔄 Reiniciando aplicação existente...'; \
  pm2 restart ${APP_NAME}; \
else \
  echo '🚀 Iniciando nova aplicação...'; \
  pm2 start ecosystem.config.js --name ${APP_NAME}; \
fi && \
pm2 save && \
echo '✅ Aplicação rodando com PM2!'"

if [ $? -ne 0 ]; then
    echo "${RED}❌ Erro ao gerenciar aplicação no PM2!${NC}"
    echo "${YELLOW}💡 Dica: Conecte via SSH e execute manualmente:${NC}"
    echo "   ssh ${SERVER}"
    echo "   cd ${REMOTE_PATH}"
    echo "   pm2 start ecosystem.config.js --name ${APP_NAME}"
    exit 1
fi

echo ""
echo "${GREEN}✅ Aplicação reiniciada com sucesso!${NC}"

echo ""
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo "${GREEN}🎉 Deploy concluído com sucesso!${NC}"
echo "${GREEN}━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━${NC}"
echo ""
echo "📝 Informações da aplicação:"
echo "  - Nome: ${APP_NAME}"
echo "  - Servidor: ${SERVER}"
echo "  - Caminho: ${REMOTE_PATH}"
echo "  - Gerenciado por: PM2"
echo ""
echo "🔍 Comandos úteis do PM2:"
echo "  pm2 list              - Listar aplicações"
echo "  pm2 logs ${APP_NAME}       - Ver logs"
echo "  pm2 restart ${APP_NAME}    - Reiniciar"
echo "  pm2 stop ${APP_NAME}       - Parar"
echo "  pm2 monit             - Monitor em tempo real"
echo ""
echo "📊 Arquivos enviados:"
echo "  - .next/ (build da aplicação)"
echo "  - src/ (código fonte)"
echo "  - public/ (arquivos estáticos)"
echo "  - package.json e outros configs"
echo "  - server.js (arquivo de entrada)"
echo ""

