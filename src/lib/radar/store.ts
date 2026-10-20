import {
  mkdir,
  readFile,
  writeFile,
  rename,
  open,
  unlink,
} from "node:fs/promises";
import path from "node:path";
import type { StoreMap, Table } from "./schema";

// Local storage is explicit and development-only. Configured production storage
// errors are never replaced by seed data or an ephemeral filesystem.
export const localStorage = () =>
  process.env.NODE_ENV !== "production" &&
  process.env.RADAR_STORAGE !== "supabase";
const dataDir = () =>
  path.join(process.cwd(), ".data", process.env.RADAR_DATA_SUBDIR || "radar");
const file = (table: Table) => path.join(dataDir(), `${table}.json`);

function config() {
  const url = process.env.SUPABASE_URL;
  const key =
    process.env.SUPABASE_SECRET_KEY || process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!url || !key)
    throw new Error("AI Radar requires Supabase configuration in production");
  const headers: Record<string, string> = {
    apikey: key,
    "Content-Type": "application/json",
  };
  if (!key.startsWith("sb_secret_")) headers.Authorization = `Bearer ${key}`;
  return { url: `${url.replace(/\/$/, "")}/rest/v1`, headers };
}

export async function rest(endpoint: string, init: RequestInit = {}) {
  const { url, headers } = config();
  const response = await fetch(`${url}/${endpoint}`, {
    ...init,
    headers: { ...headers, ...init.headers },
    cache: "no-store",
    signal: AbortSignal.timeout(15000),
  });
  if (!response.ok)
    throw new Error(
      `Radar storage request failed (${response.status}). Check supabase/ai-radar.sql.`,
    );
  return response;
}

// Atomic per-table file writes plus exclusive lock also work across dev workers.
async function exclusive<T>(
  name: string,
  action: () => Promise<T>,
  staleMs = 30000,
): Promise<T> {
  await mkdir(dataDir(), { recursive: true, mode: 0o700 });
  const lockPath = path.join(dataDir(), `${name}.lock`);
  for (let attempt = 0; attempt < 100; attempt++) {
    try {
      const lock = await open(lockPath, "wx", 0o600);
      await lock.writeFile(String(Date.now()));
      await lock.close();
      try {
        return await action();
      } finally {
        await unlink(lockPath).catch(() => {});
      }
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code !== "EEXIST") throw error;
      const timestamp = Number(
        await readFile(lockPath, "utf8").catch(() => "0"),
      );
      if (timestamp && Date.now() - timestamp > staleMs)
        await unlink(lockPath).catch(() => {});
      await new Promise((resolve) => setTimeout(resolve, 25));
    }
  }
  throw new Error("Radar storage is busy");
}

export async function list<K extends Table>(table: K): Promise<StoreMap[K][]> {
  if (localStorage()) {
    try {
      return JSON.parse(await readFile(file(table), "utf8"));
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") return [];
      throw error;
    }
  }
  const result: StoreMap[K][] = [];
  for (let offset = 0; ; offset += 500) {
    const params = new URLSearchParams({
      select: "data",
      order: "id.asc",
      limit: "500",
      offset: String(offset),
    });
    const rows: { data: StoreMap[K] }[] = await (
      await rest(`radar_${table}?${params}`)
    ).json();
    result.push(...rows.map((row) => row.data));
    if (rows.length < 500) return result;
  }
}

export async function get<K extends Table>(
  table: K,
  id: string,
): Promise<StoreMap[K] | undefined> {
  if (localStorage()) return (await list(table)).find((v) => v.id === id);
  const params = new URLSearchParams({
    id: `eq.${id}`,
    select: "data",
    limit: "1",
  });
  const rows = await (await rest(`radar_${table}?${params}`)).json();
  return rows[0]?.data;
}

export async function newsByUrl(url: string) {
  if (localStorage())
    return (await list("news")).find((item) => item.sourceUrl === url);
  const params = new URLSearchParams({
    "data->>sourceUrl": `eq.${url}`,
    select: "data",
    limit: "1",
  });
  const rows = await (await rest(`radar_news?${params}`)).json();
  return rows[0]?.data as StoreMap["news"] | undefined;
}

// insertOnly is important: refreshes never overwrite editorial decisions.
export async function put<K extends Table>(
  table: K,
  value: StoreMap[K],
  insertOnly = false,
): Promise<boolean> {
  if (localStorage())
    return exclusive(table, async () => {
      const rows = await list(table);
      const index = rows.findIndex(
        (row) =>
          row.id === value.id ||
          (table === "news" &&
            "sourceUrl" in row &&
            "sourceUrl" in value &&
            row.sourceUrl === value.sourceUrl),
      );
      if (index >= 0 && insertOnly) return false;
      if (index >= 0) rows[index] = value;
      else rows.push(value);
      const temporary = `${file(table)}.${process.pid}.tmp`;
      await writeFile(temporary, JSON.stringify(rows), { mode: 0o600 });
      await rename(temporary, file(table));
      return true;
    });
  const params = new URLSearchParams({ on_conflict: "id" });
  const response = await rest(`radar_${table}?${params}`, {
    method: "POST",
    headers: {
      Prefer: `resolution=${insertOnly ? "ignore" : "merge"}-duplicates,return=representation`,
    },
    body: JSON.stringify({
      id: value.id,
      data: value,
      updated_at: new Date().toISOString(),
    }),
  });
  return (await response.json()).length > 0;
}

export async function withImportLock<T>(
  owner: string,
  action: () => Promise<T>,
): Promise<T | null> {
  if (localStorage()) {
    try {
      return await exclusive("import", action, 600000);
    } catch (error) {
      if (error instanceof Error && error.message === "Radar storage is busy")
        return null;
      throw error;
    }
  }
  const body = JSON.stringify({ lock_owner: owner });
  const acquired = await (
    await rest("rpc/radar_acquire_lock", { method: "POST", body })
  ).json();
  if (!acquired) return null;
  try {
    return await action();
  } finally {
    await rest("rpc/radar_release_lock", { method: "POST", body });
  }
}
