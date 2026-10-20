import { radarData, queryFromParams } from "@/lib/radar/data";

export const runtime = "nodejs";
export async function GET(request: Request) {
  try {
    const data = await radarData(
      queryFromParams(new URL(request.url).searchParams),
    );
    return Response.json(data, {
      headers: {
        "Cache-Control": data.unavailable
          ? "no-store"
          : "public, max-age=15, s-maxage=30, stale-while-revalidate=60",
      },
    });
  } catch {
    return Response.json({ error: "temporarily_unavailable" }, { status: 503 });
  }
}
