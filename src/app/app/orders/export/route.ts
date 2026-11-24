
import { isDbConfigured } from "@/lib/db";
import { listOrders, ordersCsv } from "@/lib/orders";
import { getWorkspaceUserAtLeast } from "@/lib/workspace";

// CSV of the newest 10,000 orders, same conventions as the contacts export.
export async function GET(request: Request) {
  const user = await getWorkspaceUserAtLeast("admin");
  if (!user) return new Response("Unauthorized", { status: 401 });
  if (!isDbConfigured()) return new Response("Orders are not available right now.", { status: 503 });
  try {
    const orders = await listOrders(user.id, 10_000, 0);
    const csv = ordersCsv(orders, new URL(request.url).searchParams.get("tz"));
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": 'attachment; filename="orders.csv"',
        "Cache-Control": "no-store",
      },
    });
  } catch (err) {
    console.error("orders export failed for user", user.id, err instanceof Error ? err.message : err);
    return new Response("Could not export orders. Please try again.", { status: 500 });
  }
}
