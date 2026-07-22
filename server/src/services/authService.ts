import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { prisma } from '../utils/prisma';
import { config } from '../config';
import { NotFoundError, ConflictError, UnauthorizedError, ValidationError } from '../utils/errors';

interface TokenPayload {
  userId: string;
  email: string;
  role: string;
  organizationId?: string;
}

interface AuthResult {
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
    avatar?: string | null;
  };
  accessToken: string;
  refreshToken: string;
}

function generateAccessToken(payload: TokenPayload): string {
  return jwt.sign(payload, config.jwt.secret, { expiresIn: config.jwt.expiresIn } as jwt.SignOptions);
}

function generateRefreshToken(): string {
  return uuidv4();
}

const REFRESH_TOKEN_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000;

export async function register(email: string, password: string, firstName: string, lastName: string): Promise<AuthResult> {
  if (!email || !password || !firstName || !lastName) {
    throw new ValidationError('Email, password, first name, and last name are required');
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    throw new ConflictError('A user with this email already exists');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const user = await prisma.user.create({
    data: { email, passwordHash, firstName, lastName, role: 'MEMBER' },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, createdAt: true },
  });

  const accessToken = generateAccessToken({ userId: user.id, email: user.email, role: user.role });
  const refreshToken = generateRefreshToken();

  await prisma.session.create({
    data: { userId: user.id, refreshToken, expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS) },
  });

  return { user, accessToken, refreshToken };
}

export async function login(email: string, password: string): Promise<AuthResult> {
  if (!email || !password) {
    throw new ValidationError('Email and password are required');
  }

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const isValid = await bcrypt.compare(password, user.passwordHash);
  if (!isValid) {
    throw new UnauthorizedError('Invalid email or password');
  }

  const accessToken = generateAccessToken({
    userId: user.id,
    email: user.email,
    role: user.role,
    organizationId: user.organizationId || undefined,
  });

  const refreshToken = generateRefreshToken();

  await prisma.session.create({
    data: { userId: user.id, refreshToken, expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS) },
  });

  return {
    user: {
      id: user.id,
      email: user.email,
      firstName: user.firstName,
      lastName: user.lastName,
      role: user.role,
      avatar: user.avatar,
    },
    accessToken,
    refreshToken,
  };
}

export async function logout(refreshToken?: string): Promise<void> {
  if (refreshToken) {
    await prisma.session.deleteMany({ where: { refreshToken } });
  }
}

export async function refreshTokens(token: string): Promise<{ accessToken: string; refreshToken: string }> {
  if (!token) {
    throw new ValidationError('Refresh token is required');
  }

  const stored = await prisma.session.findUnique({
    where: { refreshToken: token },
    include: { user: true },
  });

  if (!stored || stored.expiresAt < new Date()) {
    if (stored) {
      await prisma.session.delete({ where: { id: stored.id } });
    }
    throw new UnauthorizedError('Invalid or expired refresh token');
  }

  const accessToken = generateAccessToken({
    userId: stored.user.id,
    email: stored.user.email,
    role: stored.user.role,
    organizationId: stored.user.organizationId || undefined,
  });

  const newRefreshToken = generateRefreshToken();

  await prisma.session.delete({ where: { id: stored.id } });
  await prisma.session.create({
    data: {
      userId: stored.user.id,
      refreshToken: newRefreshToken,
      expiresAt: new Date(Date.now() + REFRESH_TOKEN_EXPIRY_MS),
    },
  });

  return { accessToken, refreshToken: newRefreshToken };
}

export async function getProfile(userId: string) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true, organizationId: true, createdAt: true, updatedAt: true },
  });

  if (!user) throw new NotFoundError('User');
  return user;
}

export async function updateProfile(userId: string, data: { firstName?: string; lastName?: string; avatar?: string }) {
  return prisma.user.update({
    where: { id: userId },
    data: {
      ...(data.firstName !== undefined && { firstName: data.firstName }),
      ...(data.lastName !== undefined && { lastName: data.lastName }),
      ...(data.avatar !== undefined && { avatar: data.avatar }),
    },
    select: { id: true, email: true, firstName: true, lastName: true, role: true, avatar: true, organizationId: true, createdAt: true, updatedAt: true },
  });
}

export async function changePassword(userId: string, currentPassword: string, newPassword: string): Promise<void> {
  if (!currentPassword || !newPassword) {
    throw new ValidationError('Current password and new password are required');
  }

  if (newPassword.length < 8) {
    throw new ValidationError('New password must be at least 8 characters');
  }

  const user = await prisma.user.findUnique({ where: { id: userId } });
  if (!user) throw new NotFoundError('User');

  const isValid = await bcrypt.compare(currentPassword, user.passwordHash);
  if (!isValid) throw new UnauthorizedError('Current password is incorrect');

  const passwordHash = await bcrypt.hash(newPassword, 12);
  await prisma.user.update({ where: { id: user.id }, data: { passwordHash } });
}
