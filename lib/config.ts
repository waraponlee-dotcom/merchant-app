// Everything the Super Admin controls. The app never hardcodes these — it reads them
// from `MerchantConfig` (fetched in lib/api.ts, cached in the store).
import { dayKey } from "./format";

export interface Profile { email: string; fullName: string; shopName: string; booth: string }
export interface Product {
  name: string;
  unit: string;                 // e.g. "แก้ว"
  unitPrice: number;            // fixed by Super Admin
  initialStock: number | null;  // null → not set yet, UI shows "--"
}
/** Sales from event days that already finished (before this device started counting). */
export interface OpeningDay { date: string; qty: number; tokens: number } // date: "YYYY-MM-DD" or ISO
export interface Support { name: string; phone?: string; lineId?: string; email?: string; hours?: string }

export interface MerchantConfig {
  tokenSymbol: string;   // "TKN"
  shopOpen: boolean;
  profile: Profile;
  product: Product;
  maxQty: number;        // max quantity per order on /scanner
  openingDays: OpeningDay[];
  support: Support;
  notice: string;        // shown under the summary report
}

/** Used when no Super Admin API is configured, and as a per-field fallback for partial responses. */
export function defaultConfig(): MerchantConfig {
  const yesterday = new Date();
  yesterday.setDate(yesterday.getDate() - 1);
  return {
    tokenSymbol: "TKN",
    shopOpen: true,
    profile: { email: "merchant@example.com", fullName: "นราวดี ชัยสิทธิ์", shopName: "ร้านชานมนราวดี", booth: "B12" },
    product: { name: "ชานมไข่มุก", unit: "แก้ว", unitPrice: 40, initialStock: null },
    maxQty: 20,
    openingDays: [{ date: dayKey(yesterday), qty: 249, tokens: 9960 }],
    support: { name: "Super Admin", phone: "02-000-0000", lineId: "@superadmin", email: "admin@example.com", hours: "ทุกวัน 09:00 – 22:00" },
    notice: "Token ใช้ภายในงาน หากต้องการแลกเป็นเงินสด โปรดติดต่อ Super Admin หลังจบงาน",
  };
}

type Rec = Record<string, unknown>;
const rec = (v: unknown): Rec => (v && typeof v === "object" && !Array.isArray(v) ? (v as Rec) : {});
const str = (v: unknown, d: string) => (typeof v === "string" && v.trim() ? v.trim() : d);
const optStr = (v: unknown) => (typeof v === "string" && v.trim() ? v.trim() : undefined);
const num = (v: unknown, d: number, min = 0) => (typeof v === "number" && Number.isFinite(v) && v >= min ? v : d);

/** Accepts whatever the API returns and always gives back a safe, complete config. */
export function normalizeConfig(raw: unknown): MerchantConfig {
  const d = defaultConfig();
  const r = rec(raw), p = rec(r.profile), pr = rec(r.product), su = rec(r.support);
  const openingDays = Array.isArray(r.openingDays)
    ? (r.openingDays as unknown[]).map(rec)
        .filter((o) => typeof o.date === "string" && !Number.isNaN(Date.parse(o.date)))
        .map((o) => ({ date: o.date as string, qty: num(o.qty, 0), tokens: num(o.tokens, 0) }))
    : d.openingDays;

  return {
    tokenSymbol: str(r.tokenSymbol, d.tokenSymbol),
    shopOpen: typeof r.shopOpen === "boolean" ? r.shopOpen : d.shopOpen,
    profile: {
      email: str(p.email, d.profile.email),
      fullName: str(p.fullName, d.profile.fullName),
      shopName: str(p.shopName, d.profile.shopName),
      booth: str(p.booth, d.profile.booth),
    },
    product: {
      name: str(pr.name, d.product.name),
      unit: str(pr.unit, d.product.unit),
      unitPrice: num(pr.unitPrice, d.product.unitPrice, 1),
      initialStock: pr.initialStock == null ? null : num(pr.initialStock, 0),
    },
    maxQty: Math.floor(num(r.maxQty, d.maxQty, 1)),
    openingDays,
    support: {
      name: str(su.name, d.support.name),
      phone: optStr(su.phone) ?? d.support.phone,
      lineId: optStr(su.lineId) ?? d.support.lineId,
      email: optStr(su.email) ?? d.support.email,
      hours: optStr(su.hours) ?? d.support.hours,
    },
    notice: str(r.notice, d.notice),
  };
}
