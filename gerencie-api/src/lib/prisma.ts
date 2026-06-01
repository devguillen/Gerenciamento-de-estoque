import { PrismaClient } from '@prisma/client';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  });

if (process.env.NODE_ENV !== 'production') {
  globalForPrisma.prisma = prisma;
}

export function toTimestamp(date: Date): number {
  return Math.floor(date.getTime() / 1000);
}

export type PaginatedResult<T> = {
  itemsReceived: number;
  curPage: number;
  nextPage: number | null;
  prevPage: number | null;
  offset: number;
  perPage: number;
  items: T[];
};

export function paginate<T>(
  items: T[],
  page: number,
  perPage: number,
  total: number
): PaginatedResult<T> {
  const totalPages = Math.max(1, Math.ceil(total / perPage));
  const curPage = Math.min(Math.max(page, 1), totalPages);
  const offset = (curPage - 1) * perPage;

  return {
    itemsReceived: items.length,
    curPage,
    nextPage: curPage < totalPages ? curPage + 1 : null,
    prevPage: curPage > 1 ? curPage - 1 : null,
    offset,
    perPage,
    items,
  };
}

export function parseIntParam(value: unknown, fallback: number): number {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed > 0 ? Math.floor(parsed) : fallback;
}

export function parseSortDir(value: unknown): 'asc' | 'desc' {
  return value === 'asc' ? 'asc' : 'desc';
}

export function parseScope(value: unknown): 'all' | 'system' | 'mine' {
  if (value === 'system' || value === 'mine') return value;
  return 'all';
}

export function parseCategories(value: unknown): number[] {
  if (Array.isArray(value)) {
    return value.map(Number).filter((n) => Number.isFinite(n));
  }
  if (typeof value === 'string' && value.length > 0) {
    return value.split(',').map(Number).filter((n) => Number.isFinite(n));
  }
  return [];
}
