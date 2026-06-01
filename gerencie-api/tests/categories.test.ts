import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, bearer, loginAdmin } from './helpers';

describe('Categories', () => {
  it('listar', async () => {
    const token = await loginAdmin();
    const res = await request(app).get('/account/categories').set(bearer(token));
    assert.equal(res.status, 200);
    assert.ok(res.body.items.length > 0);
  });

  it('CRUD', async () => {
    const token = await loginAdmin();
    const name = `Cat ${Date.now()}`;
    const c = await request(app).post('/category').set(bearer(token)).send({ name, priority: 2 });
    assert.equal(c.status, 201);
    const u = await request(app)
      .patch(`/category/${c.body.id}`)
      .set(bearer(token))
      .send({ name: `${name} X`, priority: 3 });
    assert.equal(u.status, 200);
    const d = await request(app).delete(`/category/${c.body.id}`).set(bearer(token));
    assert.equal(d.status, 204);
  });
});
