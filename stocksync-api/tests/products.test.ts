import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import request from 'supertest';
import { app, bearer, loginAdmin } from './helpers';

describe('Products', () => {
  it('listar', async () => {
    const token = await loginAdmin();
    const res = await request(app).get('/account/products').set(bearer(token));
    assert.equal(res.status, 200);
    assert.ok(res.body.items.length > 0);
  });

  it('CRUD', async () => {
    const token = await loginAdmin();
    const brands = await request(app).get('/brand').set(bearer(token));
    const cats = await request(app).get('/account/categories').set(bearer(token));
    const brandId = brands.body.items[0].id;
    const categoryId = cats.body.items[0].id;

    const c = await request(app)
      .post('/product')
      .set(bearer(token))
      .send({
        name: `P ${Date.now()}`,
        brand_id: brandId,
        unit_type: 'UN',
        category_ids: [categoryId],
        min_limit: 5,
        max_limit: 50,
      });
    assert.equal(c.status, 201);

    const u = await request(app)
      .patch(`/product/${c.body.id}`)
      .set(bearer(token))
      .send({
        name: 'Atualizado',
        brand_id: brandId,
        unit_type: 'CX',
        category_ids: [categoryId],
        min_limit: 10,
        max_limit: 100,
      });
    assert.equal(u.status, 200);

    const d = await request(app).delete(`/product/${c.body.id}`).set(bearer(token));
    assert.equal(d.status, 204);
  });

  it('validação max < min', async () => {
    const token = await loginAdmin();
    const res = await request(app)
      .post('/product')
      .set(bearer(token))
      .send({
        name: 'X',
        brand_id: 1,
        unit_type: 'UN',
        category_ids: [1],
        min_limit: 100,
        max_limit: 1,
      });
    assert.equal(res.status, 400);
  });
});
