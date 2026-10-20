import { readImage } from "@/lib/radar/media";
export const runtime = "nodejs";
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> },
) {
  try {
    const { name } = await params;
    const bytes = await readImage(name);
    if (!bytes) return new Response(null, { status: 404 });
    return new Response(bytes, {
      headers: {
        "Content-Type": "image/webp",
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        "Content-Security-Policy": "default-src 'none'; sandbox",
      },
    });
  } catch {
    return new Response(null, { status: 503 });
  }
}
