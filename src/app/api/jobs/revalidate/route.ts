import { revalidatePath } from "next/cache";
import { handleRevalidate } from "@/lib/revalidateSite";

// Deploy hook: curl -X POST -H "x-cron-secret: $CRON_SECRET" http://127.0.0.1:4338/api/jobs/revalidate
export async function POST(request: Request) {
  return handleRevalidate(request, revalidatePath);
}
