import { createHash, timingSafeEqual } from "node:crypto";
import { importRadar } from "@/lib/radar/importer";
import { invalidateRadar } from "@/lib/radar/data";
export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;

export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET;
  const digest = (value: string) => createHash("sha256").update(value).digest();
  if (
    !expected ||
    expected.length < 32 ||
    !timingSafeEqual(
      digest(request.headers.get("authorization") || ""),
      digest(`Bearer ${expected}`),
    )
  )
    return Response.json({ error: "unauthorized" }, { status: 401 });
  try {
    const job = await importRadar();
    invalidateRadar();
    return Response.json(
      { job },
      {
        status: !job ? 409 : job.status === "failed" ? 502 : 200,
        headers: { "Cache-Control": "no-store" },
      },
    );
  } catch {
    return Response.json({ error: "import_failed" }, { status: 503 });
  }
}
