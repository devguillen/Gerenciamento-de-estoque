# Gerencie+ — Gerenciamento de Estoque

Sistema completo de gerenciamento de estoque com frontend Next.js e backend Node.js próprio (sem Xano).

## Estrutura

```
├── stocksync-api/              # Backend Node.js + Express + Prisma
└── stocksync-web-admin-front/  # Frontend Next.js 15
```

## Pré-requisitos

- Node.js 20+
- npm

## Início rápido

### 1. Backend

```bash
cd stocksync-api
npm install
npm run db:setup
npm run dev
```

API disponível em **http://localhost:3001**

### 2. Frontend

```bash
cd gerencie-web-admin-front
npm install
npm run dev
```

App disponível em **http://localhost:3000**

## Credenciais padrão

| Campo | Valor |
|-------|-------|
| E-mail | `admin@gerencie.com` |
| Senha | `Admin@123` |

## API — Endpoints principais

| Método | Rota | Descrição |
|--------|------|-----------|
| POST | `/auth/login` | Login |
| GET | `/auth/me` | Usuário autenticado |
| GET | `/account/products` | Listar produtos |
| POST | `/product` | Criar produto |
| GET | `/account/categories` | Listar categorias |
| POST | `/category` | Criar categoria |
| GET | `/brand` | Listar marcas |
| GET | `/account/suppliers` | Listar fornecedores |
| GET | `/dashboard/stats` | Estatísticas da dashboard |

## Variáveis de ambiente

### Backend (`gerencie-api/.env`)

```
DATABASE_URL="file:./dev.db"
JWT_SECRET="sua-chave-secreta"
PORT=3001
CORS_ORIGIN="http://localhost:3000"
```

### Frontend (`gerencie-web-admin-front/.env.local`)

```
AUTH_API_URL=http://localhost:3001
APP_API_URL=http://localhost:3001
```

## Scripts úteis

```bash
# Backend
npm run dev          # Desenvolvimento
npm run db:setup     # Criar banco + seed
npm run build        # Build produção

# Frontend
npm run dev          # Desenvolvimento
npm run build        # Build produção
```

## Stack

**Backend:** Node.js, Express, TypeScript, Prisma, SQLite, JWT, bcrypt  
**Frontend:** Next.js 15, React 18, TypeScript, Tailwind, shadcn/ui, Axios
