# StockSync API

Backend REST em Node.js para o sistema de gerenciamento de estoque.

## Setup

```bash
npm install
npm run db:setup
npm run dev
```

## Seed

O seed cria:
- Conta principal
- Usuário admin (`admin@stocksync.com` / `Admin@123`)
- Marcas, categorias, produtos e fornecedores de exemplo

## Produção

Para produção, troque `DATABASE_URL` para PostgreSQL e defina um `JWT_SECRET` forte.
