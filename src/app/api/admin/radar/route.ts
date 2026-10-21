import { randomUUID } from "node:crypto";
import { isAdmin, sameOrigin } from "@/lib/admin-auth";
import { recordSchema, collections, type Collection } from "@/lib/radar/schema";
import { get, list, put, localStorage } from "@/lib/radar/store";
import { canonicalUrl } from "@/lib/radar/domain";
import { invalidateRadar } from "@/lib/radar/data";
import { importRadar } from "@/lib/radar/importer";
import { seedRadar } from "@/lib/radar/seed";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 300;
const headers = { "Cache-Control": "no-store" };

export async function GET() {
  if (!(await isAdmin()))
    return Response.json({ error: "unauthorized" }, { status: 401, headers });
  try {
    const values = await Promise.all(
      [...collections, "jobs", "reviews", "audit"].map((name) =>
        list(name as Collection | "jobs" | "reviews" | "audit"),
      ),
    );
    const data = Object.fromEntries(
      [...collections, "jobs", "reviews", "audit"].map((name, i) => [
        name,
        values[i],
      ]),
    );
    return Response.json(
      { ...data, storage: localStorage() ? "local" : "supabase" },
      { headers },
    );
  } catch {
    return Response.json(
      { error: "storage_unavailable" },
      { status: 503, headers },
    );
  }
}

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json({ error: "forbidden" }, { status: 403, headers });
  if (!(await isAdmin()))
    return Response.json({ error: "unauthorized" }, { status: 401, headers });
  if (Number(request.headers.get("content-length")) > 64000)
    return Response.json({ error: "too_large" }, { status: 413, headers });
  let input: { action?: string; record?: unknown };
  try {
    const reader = request.body?.getReader();
    if (!reader) throw new Error("Empty body");
    const chunks: Uint8Array[] = [];
    let bytes = 0;
    try {
      for (;;) {
        const { done, value } = await reader.read();
        if (done) break;
        bytes += value.length;
        if (bytes > 64000) throw new RangeError("Body too large");
        chunks.push(value);
      }
    } finally {
      await reader.cancel().catch(() => {});
    }
    input = JSON.parse(Buffer.concat(chunks).toString("utf8"));
    if (!input || typeof input !== "object") throw new Error();
  } catch (error) {
    return Response.json(
      { error: error instanceof RangeError ? "too_large" : "invalid_json" },
      { status: error instanceof RangeError ? 413 : 400, headers },
    );
  }
  try {
    if (input.action === "import") {
      const job = await importRadar();
      invalidateRadar();
      return Response.json({ job }, { status: job ? 200 : 409, headers });
    }
    if (input.action === "seed") {
      const result = await seedRadar();
      invalidateRadar();
      return Response.json(result, { headers });
    }
    if (input.action !== "save")
      return Response.json(
        { error: "unknown_action" },
        { status: 400, headers },
      );
    const parsed = recordSchema.safeParse(input.record);
    if (!parsed.success)
      return Response.json(
        {
          error: "validation",
          issues: parsed.error.issues.map((v) => ({
            path: v.path.join("."),
            message: v.message,
          })),
        },
        { status: 400, headers },
      );
    const record = parsed.data;
    if (record.kind === "models")
      record.companyIds = [
        ...new Set([...record.companyIds, record.companyId]),
      ];
    if ("sourceUrl" in record) {
      record.sourceUrl = canonicalUrl(record.sourceUrl);
      const now = new Date().toISOString();
      if (Date.parse(record.publishedAt) > Date.now())
        return Response.json(
          { error: "Publication date cannot be in the future" },
          { status: 400, headers },
        );
      record.updatedAt = now;
      const before = await get(record.kind, record.id);
      record.discoveredAt =
        before && "discoveredAt" in before ? before.discoveredAt : now;
      // A URL already represented by a different record cannot be published twice.
      if (
        record.kind === "news" &&
        (await list("news")).some(
          (v) => v.id !== record.id && v.sourceUrl === record.sourceUrl,
        )
      )
        return Response.json(
          { error: "duplicate_source_url" },
          { status: 409, headers },
        );
    }
    const before = await get(record.kind, record.id);
    // Persist an audit snapshot first. Previous versions can be restored in admin.
    await put("audit", {
      id: randomUUID(),
      at: new Date().toISOString(),
      action: before ? "update" : "create",
      kind: record.kind,
      contentId: record.id,
      before: before || null,
      after: record,
      actor: "admin",
    });
    await put(record.kind, record);
    if ("status" in record)
      await put("reviews", {
        id: record.id,
        contentId: record.id,
        kind: record.kind,
        status:
          record.status === "published"
            ? "approved"
            : record.status === "hidden"
              ? "hidden"
              : "pending",
        reason: "Editorial decision by an authenticated site administrator",
        updatedAt: record.updatedAt,
      });
    invalidateRadar();
    return Response.json({ ok: true, record }, { headers });
  } catch {
    return Response.json(
      { error: "storage_unavailable" },
      { status: 503, headers },
    );
  }
}
