// Server-only auth: users, DB-backed sessions and the current-user helpers.
import { randomBytes } from "node:crypto";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { isDbConfigured, query } from "@/lib/db";
import { hashPassword, hashToken, normalizeEmail, verifyPassword } from "@/lib/password";

const COOKIE = "pf_session";
const MAX_AGE = 60 * 60 * 24 * 30; // 30 days, in seconds

// Fixed hash of a random string, used when no user matches so login timing stays similar.
const DUMMY_HASH =
  "scrypt$16384$8$1$AAAAAAAAAAAAAAAAAAAAAA==$AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA==";

export type CurrentUser = { id: string; email: string; name: string | null };

// Creates a user; returns null if the email is already taken.
export async function createUser(email: string, password: string, name?: string): Promise<CurrentUser | null> {
  const passwordHash = await hashPassword(password);
  const rows = await query<CurrentUser>(
    "insert into users (email, password_hash, name) values ($1, $2, $3) on conflict (email) do nothing returning id, email, name",
    [normalizeEmail(email), passwordHash, name ?? null]
  );
  return rows[0] ?? null;
}

// Returns the user when the email and password match, otherwise null.
export async function verifyLogin(email: string, password: string): Promise<CurrentUser | null> {
  const rows = await query<CurrentUser & { password_hash: string }>(
    "select id, email, name, password_hash from users where email = $1",
    [normalizeEmail(email)]
  );
  const row = rows[0];
  if (!row) {
    await verifyPassword(password, DUMMY_HASH);
    return null;
  }
  if (!(await verifyPassword(password, row.password_hash))) {
    return null;
  }
  return { id: row.id, email: row.email, name: row.name };
}

// Stores a hashed session token in the DB and the raw token in an httpOnly cookie.
export async function startSession(userId: string, userAgent?: string): Promise<void> {
  const token = randomBytes(32).toString("base64url");
  await query(
    "insert into sessions (id, user_id, expires_at, user_agent) values ($1, $2, now() + interval '30 days', $3)",
    [hashToken(token), userId, userAgent ?? null]
  );
  const jar = await cookies();
  jar.set(COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: MAX_AGE,
  });
}

// The logged-in user, or null. Never throws.
export async function getCurrentUser(): Promise<CurrentUser | null> {
  if (!isDbConfigured()) {
    return null;
  }
  try {
    const jar = await cookies();
    const token = jar.get(COOKIE)?.value;
    if (!token) {
      return null;
    }
    const rows = await query<CurrentUser>(
      "select u.id, u.email, u.name from sessions s join users u on u.id = s.user_id where s.id = $1 and s.expires_at > now()",
      [hashToken(token)]
    );
    return rows[0] ?? null;
  } catch {
    return null;
  }
}

// Use in server components/actions that need a login; sends guests to /login.
export async function requireUser(): Promise<CurrentUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }
  return user;
}

// Logs out: removes the session row and the cookie.
export async function endSession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(COOKIE)?.value;
  if (token && isDbConfigured()) {
    await query("delete from sessions where id = $1", [hashToken(token)]);
  }
  jar.delete(COOKIE);
}
