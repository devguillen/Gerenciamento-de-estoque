import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, bearer, loginAdmin } from './helpers';

describe('Suppliers', () => {
  it('listar e CRUD', async () => {
    const token = await loginAdmin();
    const list = await request(app).get('/account/suppliers').set(bearer(token));
    assert.equal(list.status, 200);

    const name = `Forn ${Date.now()}`;
    const c = await request(app)
      .post('/suppliers')
      .set(bearer(token))
      .send({ name, address: 'Rua 1' });
    assert.equal(c.status, 201);

    const u = await request(app)
      .patch('/suppliers')
      .set(bearer(token))
      .send({ suppliers_id: c.body.id, name: `${name} SA`, address: 'Rua 2' });
    assert.equal(u.status, 200);

    const d = await request(app)
      .delete('/suppliers')
      .set(bearer(token))
      .send({ suppliers_id: c.body.id });
    assert.equal(d.status, 204);
  });
});
