import "server-only";
import { randomUUID } from "node:crypto";
import { mkdir, writeFile, readFile } from "node:fs/promises";
import path from "node:path";
import sharp from "sharp";
import { localStorage } from "./store";

const directory = () => path.join(process.cwd(), ".data", "radar", "media");
export const validMediaName = (name: string) =>
  /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}\.webp$/.test(
    name,
  );
async function storageRequest(name: string, init: RequestInit = {}) {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key) throw new Error("Media storage unavailable");
  const headers: Record<string, string> = {
    apikey: key,
    "Content-Type": "image/webp",
  };
  if (!key.startsWith("sb_secret_")) headers.Authorization = `Bearer ${key}`;
  return fetch(
    `${url.replace(/\/$/, "")}/storage/v1/object/ai-radar-media/${name}`,
    { ...init, headers, signal: AbortSignal.timeout(15000), cache: "no-store" },
  );
}
export async function uploadImage(input: Uint8Array) {
  const image = sharp(input, { limitInputPixels: 25_000_000, animated: false });
  const metadata = await image.metadata();
  if (!["png", "jpeg", "webp", "avif"].includes(metadata.format || ""))
    throw new Error("Unsupported image format");
  const bytes = await image
    .rotate()
    .resize(1600, 1600, { fit: "inside", withoutEnlargement: true })
    .webp({ quality: 82 })
    .toBuffer();
  const name = `${randomUUID()}.webp`;
  if (localStorage()) {
    await mkdir(directory(), { recursive: true, mode: 0o700 });
    await writeFile(path.join(directory(), name), bytes, { mode: 0o600 });
  } else {
    const response = await storageRequest(name, {
      method: "POST",
      body: new Uint8Array(bytes),
    });
    if (!response.ok) throw new Error("Media upload failed");
  }
  return `/api/radar/media/${name}`;
}
export async function readImage(name: string) {
  if (!validMediaName(name)) return null;
  if (localStorage()) {
    try {
      return new Uint8Array(await readFile(path.join(directory(), name)));
    } catch {
      return null;
    }
  }
  const response = await storageRequest(name);
  if (!response.ok) return null;
  return new Uint8Array(await response.arrayBuffer());
}
