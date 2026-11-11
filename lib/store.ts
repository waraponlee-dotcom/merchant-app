"use client";
// Local state. Two kinds of data live here:
//  • config  — owned by Super Admin, refreshed via `actions.refreshConfig()`, cached for offline use
//  • txs     — tokens received from the Handheld Scanner (swap `persist`/`load` for an API later)
import { useSyncExternalStore } from "react";
import { fetchMerchantConfig, hasAdminApi } from "./api";
import { defaultConfig, type MerchantConfig } from "./config";
import { dayKey, isToday } from "./format";
// Token logic อยู่ที่ utils/token.ts (ใช้ร่วมกับทีมอื่นได้)
import { buildTxMer, clampQtyMer, makeTxIdMer, type TokenTxMer, type TxStatusMer } from "@/utils/token";

export type { MerchantConfig, Product, Profile } from "./config";
export type TxStatus = TxStatusMer;
export type TokenTx = TokenTxMer; // tokens = qty × price *at that time*
export interface AppState {
  config: MerchantConfig;
  currentQty: number;          // quantity sent to the Handheld Scanner
  txs: TokenTx[];              // newest first
  configSyncedAt: string | null;
}

const KEY = "merchant-app:v2";
const uid = makeTxIdMer;
const clampQty = clampQtyMer;

function seed(): AppState {
  const config = defaultConfig();
  const at = (h: number, m: number) => { const d = new Date(); d.setHours(h, m, 0, 0); return d.toISOString(); };
  const first: [number, number, string, number][] = [
    [21, 46, "สมชาย ใจดี", 3], [21, 42, "ปรียา แสงทอง", 2], [21, 38, "ธนากร วงศ์สกุล", 1], [21, 31, "กมลชนก รัตนพันธ์", 3],
    [21, 19, "วิชัย เพ็ญศรี", 2], [21, 12, "ณัฐธิดา สุขใจ", 4], [21, 5, "พิมพ์ลดา ศรีสุข", 5],
  ];
  const names = ["อนันต์ มีสุข", "สุดา ทองดี", "ภานุ เจริญผล", "มาลี รุ่งเรือง", "ชัยวัฒน์ พรหมมา", "อรทัย สายบุญ", "ศิริพร คงดี", "ธีรพงษ์ ใจเย็น"];
  const qtys = [2, 2, 3, 1, 2, 3, 2, 2, 3, 2, 1, 2, 3, 2, 2, 1, 3, 2, 2, 3];
  const rest: [number, number, string, number][] = qtys.map((q, i) => {
    const mins = 20 * 60 + 58 - 7 * i;
    return [Math.floor(mins / 60), mins % 60, names[i % names.length], q];
  });
  return {
    config, currentQty: 1, configSyncedAt: null,
    txs: [...first, ...rest].map(([h, m, payerName, qty]) => ({
      id: uid(), at: at(h, m), qty, tokens: qty * config.product.unitPrice, payerName, status: "success" as const,
    })),
  };
}

let cache: AppState | null = null;
const listeners = new Set<() => void>();
const persist = (s: AppState) => { try { localStorage.setItem(KEY, JSON.stringify(s)); } catch {} };
function load(): AppState {
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) { const s = JSON.parse(raw) as AppState; if (s?.config && Array.isArray(s.txs)) return s; }
  } catch {}
  const s = seed(); persist(s); return s;
}
const getSnapshot = () => (cache ??= load());
/** อ่าน state ปัจจุบันแบบไม่ใช้ hook (สำหรับ utils/scanFlow.ts) */
export const getStateMer = getSnapshot;
function commit(next: AppState) { cache = next; persist(next); listeners.forEach((l) => l()); }
function subscribe(cb: () => void) {
  listeners.add(cb);
  const onStorage = (e: StorageEvent) => { if (e.key === KEY) { cache = null; cb(); } };
  window.addEventListener("storage", onStorage);
  return () => { listeners.delete(cb); window.removeEventListener("storage", onStorage); };
}

/** null on the server / first paint — render a skeleton until it resolves. */
export const useStore = () => useSyncExternalStore(subscribe, getSnapshot, () => null);

export const actions = {
  setQty(n: number) { const s = getSnapshot(); commit({ ...s, currentQty: clampQty(n, s.config.maxQty) }); },

  /** Pull the latest values from Super Admin. Keeps the cached config if the request fails. */
  async refreshConfig(): Promise<boolean> {
    if (!hasAdminApi) return false;
    try {
      const config = await fetchMerchantConfig();
      const s = getSnapshot();
      if (JSON.stringify(config) === JSON.stringify(s.config)) return true;
      commit({ ...s, config, currentQty: clampQty(s.currentQty, config.maxQty), configSyncedAt: new Date().toISOString() });
      return true;
    } catch (e) {
      console.warn("[merchant-app] ดึงค่าจาก Super Admin ไม่สำเร็จ — ใช้ค่าล่าสุดที่เก็บไว้", e);
      return false;
    }
  },

  /** Call when the Handheld Scanner reports a paid order (status "pending" = ยังไม่ทราบผล). */
  receiveTokens(o: { payerName: string; payerEmail?: string; qty?: number; status?: TxStatusMer }) {
    const s = getSnapshot(); const qty = o.qty ?? s.currentQty;
    const tx = buildTxMer({ qty, unitPrice: s.config.product.unitPrice, payerName: o.payerName,
      payerEmail: o.payerEmail, status: o.status, existingCount: s.txs.length });
    commit({ ...s, txs: [tx, ...s.txs] }); return tx;
  },
  /** แก้รายการเดิม เช่น pending → success หลังเครื่อง Scanner เชื่อมต่อกลับมา */
  updateTx(idMer: string, patchMer: Partial<Omit<TokenTxMer, "id">>) {
    const s = getSnapshot();
    commit({ ...s, txs: s.txs.map((txMer) => (txMer.id === idMer ? { ...txMer, ...patchMer } : txMer)) });
  },
  reset() { commit(seed()); },
};

export function summarize(s: AppState) {
  const { openingDays, product } = s.config;
  const ok = s.txs.filter((t) => t.status === "success");
  const today = ok.filter((t) => isToday(t.at));
  const sum = (a: { tokens: number; qty: number }[], k: "tokens" | "qty") => a.reduce((n, t) => n + t[k], 0);

  // per-day report: finished days from Super Admin + days counted on this device
  const days = new Map<string, { key: string; date: string; qty: number; tokens: number }>();
  const add = (date: string, qty: number, tokens: number) => {
    const key = dayKey(date), d = days.get(key);
    if (d) { d.qty += qty; d.tokens += tokens; } else days.set(key, { key, date, qty, tokens });
  };
  openingDays.forEach((o) => add(o.date, o.qty, o.tokens));
  ok.forEach((t) => add(t.at, t.qty, t.tokens));

  const totalQty = sum(openingDays, "qty") + sum(ok, "qty");
  return {
    totalTokens: sum(openingDays, "tokens") + sum(ok, "tokens"), totalQty,
    todayTokens: sum(today, "tokens"), todayQty: sum(today, "qty"), todayCount: today.length,
    recent: ok.slice(0, 5),                         // home: received tokens
    latest: s.txs.slice(0, 5),                      // dashboard: any status
    todayList: s.txs.filter((t) => isToday(t.at)),  // all of today, any status
    report: [...days.values()].sort((a, b) => a.key.localeCompare(b.key)),
    initialStock: product.initialStock,
    stockLeft: product.initialStock == null ? null : Math.max(0, product.initialStock - totalQty),
  };
}
