// Pure password and token helpers (no DB, no Next imports) so they can be unit tested.
import { createHash, randomBytes, scrypt, timingSafeEqual, type ScryptOptions } from "node:crypto";

const N = 16384;
const R = 8;
const P = 1;
const KEYLEN = 64;

// scrypt with options, wrapped in a promise (util.promisify loses the options overload types).
function scryptAsync(pw: string, salt: Buffer, keylen: number, opts: ScryptOptions): Promise<Buffer> {
  return new Promise((resolve, reject) => {
    scrypt(pw, salt, keylen, opts, (err, key) => (err ? reject(err) : resolve(key)));
  });
}

// Returns `scrypt$N$r$p$<saltB64>$<hashB64>`.
export async function hashPassword(pw: string): Promise<string> {
  const salt = randomBytes(16);
  const hash = await scryptAsync(pw, salt, KEYLEN, { N, r: R, p: P });
  return `scrypt$${N}$${R}$${P}$${salt.toString("base64")}$${hash.toString("base64")}`;
}

// Checks a password against a stored hash. Never throws; any bad format is false.
export async function verifyPassword(pw: string, stored: string): Promise<boolean> {
  try {
    const parts = typeof stored === "string" ? stored.split("$") : [];
    if (parts.length !== 6 || parts[0] !== "scrypt") {
      return false;
    }
    const [n, r, p] = parts.slice(1, 4).map((x) => Number(x));
    if (![n, r, p].every((x) => Number.isInteger(x) && x > 0) || n > 1 << 20 || r > 32 || p > 16) {
      return false;
    }
    const salt = Buffer.from(parts[4], "base64");
    const expected = Buffer.from(parts[5], "base64");
    if (salt.length === 0 || expected.length === 0) {
      return false;
    }
    const actual = await scryptAsync(pw, salt, expected.length, { N: n, r, p, maxmem: 256 * n * r + 1024 * 1024 });
    if (actual.length !== expected.length) {
      return false;
    }
    return timingSafeEqual(actual, expected);
  } catch {
    return false;
  }
}

// Returns a list of human readable errors; empty means valid.
export function validateSignup(input: { email: string; password: string }): string[] {
  const errors: string[] = [];
  const email = normalizeEmail(input.email ?? "");
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254) {
    errors.push("Enter a valid email address.");
  }
  const pw = input.password ?? "";
  if (pw.length < 8 || pw.length > 200) {
    errors.push("Password must be 8 to 200 characters.");
  }
  return errors;
}

export function normalizeEmail(e: string): string {
  return e.trim().toLowerCase();
}

// Session tokens are stored hashed so a DB leak can't be replayed as cookies.
export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
