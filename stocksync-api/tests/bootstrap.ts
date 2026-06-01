import { execSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

const root = path.resolve(__dirname, '..');
const testDb = path.join(root, 'prisma', 'test.db');

for (const file of [testDb, `${testDb}-journal`]) {
  if (fs.existsSync(file)) fs.unlinkSync(file);
}

process.env.DATABASE_URL = 'file:./prisma/test.db';
process.env.JWT_SECRET = 'vitest-jwt-secret-key-min-32-chars';
process.env.CORS_ORIGIN = 'http://localhost:3000';
process.env.NODE_ENV = 'test';

execSync('npx prisma db push', { cwd: root, stdio: 'inherit', env: process.env });
execSync('npx tsx prisma/seed.ts', { cwd: root, stdio: 'inherit', env: process.env });
