import { signToken, verifyToken } from "./jwt";
import { cookies } from "next/headers";

const TOKEN_NAME = "app_session";

export async function createSession(userId: string) {
  const token = signToken({ _id: userId });
  cookies().set(TOKEN_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 60 * 60 * 24 * 7, // 7 days
  });
  return token;
}

export async function getSession() {
  const token = cookies().get(TOKEN_NAME)?.value;
  if (!token) return null;
  const decoded = verifyToken(token);
  return decoded ? (decoded as any) : null;
}

export async function destroySession() {
  cookies().delete(TOKEN_NAME);
}
