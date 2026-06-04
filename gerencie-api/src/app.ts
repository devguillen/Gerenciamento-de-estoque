import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth';
import categoryRoutes from './routes/categories';
import productRoutes from './routes/products';
import brandRoutes from './routes/brands';
import supplierRoutes from './routes/suppliers';
import inventoryRoutes from './routes/inventory';
import dashboardRoutes from './routes/dashboard';
import auditLogRoutes from './routes/audit-logs';

export function createApp() {
  const app = express();

  app.use(
    cors({
      origin: process.env.CORS_ORIGIN || 'http://localhost:3000',
      credentials: true,
    })
  );
  app.use(express.json());

  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'gerencie-api' });
  });

  app.use(authRoutes);
  app.use(categoryRoutes);
  app.use(productRoutes);
  app.use(brandRoutes);
  app.use(supplierRoutes);
  app.use(inventoryRoutes);
  app.use(dashboardRoutes);
  app.use('/audit-logs', auditLogRoutes);

  return app;
}
