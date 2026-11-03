import { connection } from "next/server";
import { dbHealth } from "@/lib/db";

export async function GET() {
  await connection();
  const db = await dbHealth();
  return Response.json(
    { ok: db.status !== "error", service: "socialapp", db },
    { status: db.status === "error" ? 503 : 200 }
  );
}
