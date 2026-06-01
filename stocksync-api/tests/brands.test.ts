import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, bearer, loginAdmin } from './helpers';

describe('Brands', () => {
  it('listar e criar', async () => {
    const token = await loginAdmin();
    const list = await request(app).get('/brand').set(bearer(token));
    assert.equal(list.status, 200);

    const name = `Marca ${Date.now()}`;
    const c = await request(app).post('/brand').set(bearer(token)).send({ name });
    assert.equal(c.status, 201);

    const dup = await request(app).post('/brand').set(bearer(token)).send({ name });
    assert.equal(dup.status, 409);
  });
});
