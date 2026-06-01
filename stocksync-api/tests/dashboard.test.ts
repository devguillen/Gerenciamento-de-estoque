import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, bearer, loginAdmin } from './helpers';

describe('Dashboard', () => {
  it('stats', async () => {
    const token = await loginAdmin();
    const res = await request(app).get('/dashboard/stats').set(bearer(token));
    assert.equal(res.status, 200);
    assert.ok(res.body.totalProducts > 0);
  });
});
