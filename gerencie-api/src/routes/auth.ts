import { Router, Response } from 'express';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import { z } from 'zod';
import { prisma, toTimestamp } from '../lib/prisma';
import { signToken } from '../lib/jwt';
import { authMiddleware, AuthRequest } from '../middleware/auth';
import { createAuditLog } from '../lib/auditLog';

const router = Router();

const loginSchema = z.object({
  email: z.string().email('Invalid email format.'),
  password: z.string().min(1),
});

const magicLinkSchema = z.object({
  magic_token: z.string().min(1),
  email: z.string().email('Invalid email format.'),
});

const updatePasswordSchema = z.object({
  password: z
    .string()
    .min(8, 'Input does not meet minimum length requirement of 8 characters.')
    .regex(/[A-Z]/, 'Input does not meet minimum length requirement of 8 characters.')
    .regex(/[a-z]/, 'Input does not meet minimum length requirement of 8 characters.')
    .regex(/[0-9]/, 'Input does not meet minimum length requirement of 8 characters.')
    .regex(/[^A-Za-z0-9]/, 'Input does not meet minimum length requirement of 8 characters.'),
  confirm_password: z.string(),
});

router.post('/auth/login', async (req, res) => {
  const parsed = loginSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  const { email, password } = parsed.data;
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ message: 'Invalid Credentials.', code: 'ERROR_CODE_ACCESS_DENIED' });
  }

  const authToken = signToken({
    userId: user.id,
    accountId: user.accountId,
    email: user.email,
    role: user.role,
  });

  // Registrar log de login
  await createAuditLog({
    userId: user.id,
    accountId: user.accountId,
    action: 'LOGIN',
    entity: 'User',
    entityId: user.id,
    ipAddress: req.ip,
    userAgent: req.headers['user-agent'],
  });

  return res.json({
    authToken,
    user_id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

router.get('/auth/me', authMiddleware, async (req: AuthRequest, res: Response) => {
  const user = await prisma.user.findUnique({ where: { id: req.user!.userId } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid Credentials.', code: 'ERROR_CODE_ACCESS_DENIED' });
  }

  return res.json({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

router.get('/reset/request-reset-link', async (req, res) => {
  const email = String(req.query.email || '');
  const parsed = z.string().email('Invalid email format.').safeParse(email);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  const user = await prisma.user.findUnique({ where: { email: parsed.data } });
  if (!user) {
    return res.status(404).json({ message: 'No user found for that email.' });
  }

  const token = crypto.randomBytes(32).toString('hex');
  const expiresAt = new Date(Date.now() + 60 * 60 * 1000);

  await prisma.passwordResetToken.create({
    data: { email: parsed.data, token, expiresAt },
  });

  const resetUrl = `${process.env.CORS_ORIGIN || 'http://localhost:3000'}/update-password?magic_token=${token}&email=${encodeURIComponent(parsed.data)}`;
  console.log(`[Password Reset] Link for ${parsed.data}: ${resetUrl}`);

  return res.json({ message: 'Reset link sent.' });
});

router.post('/reset/magic-link-login', async (req, res) => {
  const parsed = magicLinkSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ message: 'Invalid email format.' });
  }

  const { magic_token, email } = parsed.data;
  const resetToken = await prisma.passwordResetToken.findFirst({
    where: {
      token: magic_token,
      email,
      used: false,
      expiresAt: { gt: new Date() },
    },
  });

  if (!resetToken) {
    return res.status(401).json({ message: 'Invalid Credentials.', code: 'ERROR_CODE_ACCESS_DENIED' });
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    return res.status(401).json({ message: 'Invalid Credentials.', code: 'ERROR_CODE_ACCESS_DENIED' });
  }

  const authToken = signToken({
    userId: user.id,
    accountId: user.accountId,
    email: user.email,
    role: user.role,
  });

  return res.json({
    authToken,
    user_id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
  });
});

router.post('/reset/update_password', authMiddleware, async (req: AuthRequest, res: Response) => {
  const parsed = updatePasswordSchema.safeParse(req.body);
  if (!parsed.success) {
    const message = parsed.error.errors[0]?.message || 'Invalid password.';
    return res.status(400).json({ message });
  }

  const { password, confirm_password } = parsed.data;
  if (password !== confirm_password) {
    return res.status(400).json({ message: 'Passwords do not match.' });
  }

  const hashed = await bcrypt.hash(password, 10);
  await prisma.user.update({
    where: { id: req.user!.userId },
    data: { password: hashed },
  });

  await prisma.passwordResetToken.updateMany({
    where: { email: req.user!.email, used: false },
    data: { used: true },
  });

  return res.json({ message: 'Password updated.' });
});

export default router;
