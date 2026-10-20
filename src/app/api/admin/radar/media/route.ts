import { isAdmin, sameOrigin } from "@/lib/admin-auth";
import { uploadImage } from "@/lib/radar/media";
export const runtime = "nodejs";

export async function POST(request: Request) {
  if (!sameOrigin(request))
    return Response.json({ error: "forbidden" }, { status: 403 });
  if (!(await isAdmin()))
    return Response.json({ error: "unauthorized" }, { status: 401 });
  const length = Number(request.headers.get("content-length"));
  if (!length || length > 5_300_000)
    return Response.json({ error: "image_too_large" }, { status: 413 });
  try {
    const form = await request.formData();
    const file = form.get("file");
    if (
      !(file instanceof File) ||
      !file.size ||
      file.size > 5_242_880 ||
      form.get("rightsConfirmed") !== "true"
    )
      return Response.json(
        { error: "invalid_image_or_permission" },
        { status: 400 },
      );
    const image = await uploadImage(new Uint8Array(await file.arrayBuffer()));
    return Response.json(
      { image },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch {
    return Response.json({ error: "image_upload_failed" }, { status: 400 });
  }
}
