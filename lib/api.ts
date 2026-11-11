// Super Admin API client.
// Set NEXT_PUBLIC_ADMIN_API_URL (see .env.example). Without it the app runs on the demo defaults.
import { defaultConfig, normalizeConfig, type MerchantConfig } from "./config";

const BASE = (process.env.NEXT_PUBLIC_ADMIN_API_URL ?? "").replace(/\/$/, "");
const TOKEN = process.env.NEXT_PUBLIC_ADMIN_API_TOKEN; // TODO: replace with the real login/session token

export const hasAdminApi = Boolean(BASE);

/** GET {BASE}/merchant/config → MerchantConfig (see README for the JSON shape). */
export async function fetchMerchantConfig(signal?: AbortSignal): Promise<MerchantConfig> {
  if (!BASE) return defaultConfig();
  const res = await fetch(`${BASE}/merchant/config`, {
    cache: "no-store",
    signal: signal ?? AbortSignal.timeout(8000),
    headers: { Accept: "application/json", ...(TOKEN ? { Authorization: `Bearer ${TOKEN}` } : {}) },
  });
  if (!res.ok) throw new Error(`Super Admin config responded ${res.status}`);
  const json: unknown = await res.json();
  return normalizeConfig(json && typeof json === "object" && "data" in json ? (json as { data: unknown }).data : json);
}
