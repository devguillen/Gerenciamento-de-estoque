import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, bearer, loginAdmin } from './helpers';

describe('Auth', () => {
  it('login sucesso', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@stocksync.com', password: 'Admin@123' });
    assert.equal(res.status, 200);
    assert.ok(res.body.authToken);
  });

  it('login inválido', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ email: 'admin@stocksync.com', password: 'wrong' });
    assert.equal(res.status, 401);
  });

  it('auth/me', async () => {
    const token = await loginAdmin();
    const res = await request(app).get('/auth/me').set(bearer(token));
    assert.equal(res.status, 200);
    assert.equal(res.body.email, 'admin@stocksync.com');
  });
});
