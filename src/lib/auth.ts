import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import { prisma } from "./db";

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || "healthai-super-secret-key-change-in-production-2026"
);

const COOKIE_NAME = "healthai-session";

export interface JWTPayload {
  userId: string;
  email: string;
  role: string;
}

export async function signToken(payload: JWTPayload): Promise<string> {
  return new SignJWT(payload as unknown as Record<string, unknown>)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("7d")
    .sign(JWT_SECRET);
}

export async function verifyToken(token: string): Promise<JWTPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);
    return payload as unknown as JWTPayload;
  } catch {
    return null;
  }
}

export async function setSessionCookie(payload: JWTPayload): Promise<string> {
  const token = await signToken(payload);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: "/",
  });
  return token;
}

export async function clearSessionCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function getSessionFromCookie(): Promise<JWTPayload | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME);
  if (!token?.value) return null;
  return verifyToken(token.value);
}

export async function getCurrentUser() {
  const session = await getSessionFromCookie();
  if (!session) return null;
  
  const user = await prisma.user.findUnique({
    where: { id: session.userId },
  });
  
  if (!user || !user.isActive) return null;
  return user;
}

export async function requireAuth() {
  const user = await getCurrentUser();
  if (!user) {
    throw new Error("Unauthorized");
  }
  return user;
}

export async function requireAdmin() {
  const user = await requireAuth();
  if (user.role !== "admin") {
    throw new Error("Forbidden");
  }
  return user;
}

// Helper to serialize user for frontend (strip password)
export function sanitizeUser(user: {
  id: string;
  slug: string;
  email: string;
  firstName: string;
  lastName: string;
  role: string;
  institution: string;
  city: string;
  country: string;
  expertise: string;
  bio: string;
  avatarUrl: string;
  profileCompleteness: number;
  isActive: boolean;
  lastLogin: Date | null;
  createdAt: Date;
  password?: string;
}) {
  const { password: _, ...safe } = user;
  return {
    ...safe,
    expertise: JSON.parse(safe.expertise || "[]"),
    lastLogin: safe.lastLogin?.toISOString() || null,
    createdAt: safe.createdAt.toISOString(),
  };
}
