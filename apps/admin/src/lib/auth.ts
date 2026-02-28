import { cookies } from "next/headers";
import { SignJWT, jwtVerify } from "jose";

const SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET ?? "dev-secret-change-in-production"
);
const COOKIE_NAME = "admin_session";

export interface Session {
  userId: string;
  email: string;
  name?: string;
}

export async function getSession(): Promise<Session | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;

  try {
    const { payload } = await jwtVerify(token, SECRET);
    return {
      userId: payload.userId as string,
      email: payload.email as string,
      name: payload.name as string | undefined,
    };
  } catch {
    return null;
  }
}

export async function createSession(session: Session): Promise<void> {
  const token = await new SignJWT({
    userId: session.userId,
    email: session.email,
    name: session.name,
  })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d")
    .sign(SECRET);

  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7,
    path: "/",
  });
}

export async function destroySession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}
