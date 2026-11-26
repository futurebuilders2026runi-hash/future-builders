import { NextResponse } from "next/server";
import { getPoolIdeaUsage, saveWorkshopRegistration } from "@/lib/workshop-registrations";
import { POOL_IDEA_CAPACITY, validateWorkshop } from "@/lib/workshop-schema";

export const runtime = "nodejs";

export async function POST(request: Request) {
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "invalid_json" }, { status: 400 });
  }

  const validation = validateWorkshop(body);
  if (validation.error) {
    return NextResponse.json({ error: validation.error }, { status: 400 });
  }

  try {
    // Re-check on the server: the form's view of free seats may be stale.
    const { poolIdea } = validation.data;
    if (poolIdea && ((await getPoolIdeaUsage())[poolIdea]?.count ?? 0) >= POOL_IDEA_CAPACITY) {
      return NextResponse.json({ error: "idea_full" }, { status: 409 });
    }
    await saveWorkshopRegistration(validation.data);
  } catch (error) {
    console.error("[future-builders] failed to save workshop registration", error);
    return NextResponse.json({ error: "delivery_failed" }, { status: 502 });
  }

  return NextResponse.json({ ok: true });
}
