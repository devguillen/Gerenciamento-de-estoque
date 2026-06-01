import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'stocksync-dev-secret';

export type JwtPayload = {
  userId: number;
  accountId: number;
  email: string;
  role: string;
};

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
}

export function verifyToken(token: string): JwtPayload {
  return jwt.verify(token, JWT_SECRET) as JwtPayload;
}

export function extractBearerToken(header?: string): string | null {
  if (!header?.startsWith('Bearer ')) return null;
  return header.slice(7);
}
