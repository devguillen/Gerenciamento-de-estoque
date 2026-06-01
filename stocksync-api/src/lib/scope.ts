import type { Prisma } from '@prisma/client';

export type Scope = 'all' | 'system' | 'mine';

export function ownerScopeWhere(accountId: number, scope: Scope): number | Prisma.IntFilter {
  if (scope === 'system') return 0;
  if (scope === 'mine') return accountId;
  return { in: [0, accountId] };
}

export function canModifyResource(ownerAccountId: number, accountId: number): boolean {
  return ownerAccountId === accountId;
}
