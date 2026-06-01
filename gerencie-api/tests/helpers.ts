import './setup';
import request from 'supertest';
import { createApp } from '../src/app';

export const app = createApp();

export async function loginAdmin() {
  const res = await request(app)
    .post('/auth/login')
    .send({ email: 'admin@stocksync.com', password: 'Admin@123' });
  return res.body.authToken as string;
}

export function bearer(token: string) {
  return { Authorization: `Bearer ${token}` };
}
