import { Request, Response, NextFunction } from 'express';
import { extractBearerToken, verifyToken, JwtPayload } from '../lib/jwt';

export type AuthRequest = Request & { user?: JwtPayload };

export function authMiddleware(req: AuthRequest, res: Response, next: NextFunction) {
  const token = extractBearerToken(req.headers.authorization);
  if (!token) {
    return res.status(401).json({ message: 'Unauthorized', code: 'ERROR_CODE_ACCESS_DENIED' });
  }

  try {
    req.user = verifyToken(token);
    next();
  } catch {
    return res.status(401).json({ message: 'Invalid Credentials.', code: 'ERROR_CODE_ACCESS_DENIED' });
  }
}

export function getAccountId(req: AuthRequest): number {
  return req.user?.accountId ?? 0;
}

export function getUserId(req: AuthRequest): number {
  return req.user?.userId ?? 0;
}
