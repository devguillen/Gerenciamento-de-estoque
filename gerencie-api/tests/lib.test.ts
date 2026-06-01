import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { paginate, parseIntParam, parseScope, parseCategories } from '../src/lib/prisma';
import { ownerScopeWhere, canModifyResource } from '../src/lib/scope';

describe('lib/prisma', () => {
  it('paginate', () => {
    const r = paginate([1, 2], 1, 10, 25);
    assert.equal(r.nextPage, 2);
    assert.equal(r.items.length, 2);
  });

  it('parseIntParam', () => {
    assert.equal(parseIntParam('abc', 5), 5);
    assert.equal(parseIntParam('3', 5), 3);
  });

  it('parseScope', () => {
    assert.equal(parseScope('mine'), 'mine');
    assert.equal(parseScope('x'), 'all');
  });

  it('parseCategories', () => {
    assert.deepEqual(parseCategories('1,2'), [1, 2]);
  });
});

describe('lib/scope', () => {
  it('ownerScopeWhere', () => {
    assert.equal(ownerScopeWhere(1, 'system'), 0);
    assert.deepEqual(ownerScopeWhere(1, 'all'), { in: [0, 1] });
  });

  it('canModifyResource', () => {
    assert.equal(canModifyResource(1, 1), true);
    assert.equal(canModifyResource(0, 1), false);
  });
});
