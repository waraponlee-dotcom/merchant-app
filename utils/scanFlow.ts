"use client";
// ─────────────────────────────────────────────────────────────────────────────
// Scan flow — ต่อ Token system (utils/token.ts) เข้ากับ store และหน้า "ผลการรับชำระ"
//
//   runScanMer("success" | "insufficient" | "disconnected")  ← ปุ่มจำลอง และตอนต่อเครื่องจริงก็เรียกตัวนี้
//   reconnectScanMer()                                       ← ปุ่ม "เชื่อมต่อ Scanner ใหม่"
//   useScanResultMer()                                       ← หน้า /scanner/result อ่านผลจากตรงนี้
// ─────────────────────────────────────────────────────────────────────────────
import { useSyncExternalStore } from "react";
import { actions, getStateMer } from "@/lib/store";
import {
  SIM_CUSTOMER_NAME_MER,
  UNKNOWN_PAYER_NAME_MER,
  buildScanResultMer,
  buildSimPaymentMer,
  calcTotalMer,
  checkPaymentMer,
  type ScanKindMer,
  type ScanResultMer,
  type TxStatusMer,
} from "./token";

// ปุ่มจำลองแสดงเสมอ (รวมบน Vercel) — ถ้าจะซ่อนตอนใช้งานจริง ตั้ง NEXT_PUBLIC_HIDE_SIM=1 แล้ว redeploy
export const SHOW_SIM_MER = process.env.NEXT_PUBLIC_HIDE_SIM !== "1";

// ── เก็บผลล่าสุดไว้ใน sessionStorage (refresh หน้าผลลัพธ์แล้วยังอยู่) ─────────────
const RESULT_KEY_MER = "merchant-app:last-scan";
let resultCacheMer: ScanResultMer | null | undefined;
const listenersMer = new Set<() => void>();

function readResultMer(): ScanResultMer | null {
  try {
    const rawMer = sessionStorage.getItem(RESULT_KEY_MER);
    return rawMer ? (JSON.parse(rawMer) as ScanResultMer) : null;
  } catch {
    return null;
  }
}
function writeResultMer(nextMer: ScanResultMer | null) {
  resultCacheMer = nextMer;
  try {
    if (nextMer) sessionStorage.setItem(RESULT_KEY_MER, JSON.stringify(nextMer));
    else sessionStorage.removeItem(RESULT_KEY_MER);
  } catch {}
  listenersMer.forEach((fnMer) => fnMer());
}
const getResultSnapshotMer = () => (resultCacheMer === undefined ? (resultCacheMer = readResultMer()) : resultCacheMer);
const subscribeResultMer = (cbMer: () => void) => {
  listenersMer.add(cbMer);
  return () => void listenersMer.delete(cbMer);
};

/** undefined = ยังโหลดอยู่ (server / first paint) · null = ไม่มีผล */
export const useScanResultMer = () => useSyncExternalStore(subscribeResultMer, getResultSnapshotMer, () => undefined);
export const clearScanResultMer = () => writeResultMer(null);

// ── Flow ─────────────────────────────────────────────────────────────────────
/**
 * จำลอง/รับผลการสแกน 1 ครั้ง → บันทึกรายการ + เก็บผลไว้ให้หน้าผลลัพธ์
 *  • success       → บันทึก Token เข้าร้านทันที
 *  • insufficient  → บันทึกเป็น "insufficient" (ยังไม่มีการหัก Token)
 *  • disconnected  → บันทึกเป็น "pending" รอยืนยัน (ห้ามส่งมอบสินค้า)
 */
export function runScanMer(kindMer: ScanKindMer, qtyOverrideMer?: number): ScanResultMer {
  if (qtyOverrideMer != null) actions.setQty(qtyOverrideMer);
  const stateMer = getStateMer();
  const { product: productMer, tokenSymbol: symbolMer } = stateMer.config;
  const qtyMer = stateMer.currentQty;
  const totalMer = calcTotalMer(qtyMer, productMer.unitPrice);

  const simMer = buildSimPaymentMer(kindMer, totalMer, productMer.unitPrice);
  const outcomeMer = checkPaymentMer({ total: totalMer, customerBalance: simMer.customerBalance, scannerConnected: simMer.scannerConnected });

  const nowMer = new Date();
  const sentAtMer = new Date(nowMer.getTime() - 60_000); // สมมุติว่าส่งยอดไปก่อนหน้า 1 นาที

  const statusMer: TxStatusMer = outcomeMer === "success"
    ? "success"
    : outcomeMer === "insufficient" ? "insufficient" : "pending";
  const payerNameMer = outcomeMer === "disconnected" ? UNKNOWN_PAYER_NAME_MER : SIM_CUSTOMER_NAME_MER;
  const txMer = actions.receiveTokens({ payerName: payerNameMer, qty: qtyMer, status: statusMer });

  const resultMer = buildScanResultMer({
    kind: outcomeMer,
    orderNo: txMer.orderNo,
    productName: productMer.name,
    unitPrice: productMer.unitPrice,
    qty: qtyMer,
    symbol: symbolMer,
    sentAt: sentAtMer,
    scannedAt: outcomeMer === "disconnected" ? undefined : nowMer,
    checkedAt: nowMer,
    txId: txMer.id,
    refNo: txMer.ref,
  });
  writeResultMer(resultMer);
  return resultMer;
}

/**
 * เชื่อมต่อ Scanner กลับมาแล้วตรวจผลรายการที่ค้างอยู่ (จำลองว่าเจอว่า "ชำระสำเร็จ")
 * ตอนต่อจริง: เปลี่ยนเป็นถามผลจาก backend แล้วส่งผลจริงเข้ามาแทน
 */
export function reconnectScanMer(): ScanResultMer | null {
  const currentMer = getResultSnapshotMer();
  if (!currentMer || currentMer.kind !== "disconnected") return currentMer;

  const nowMer = new Date();
  if (currentMer.txId) actions.updateTx(currentMer.txId, { status: "success", payerName: SIM_CUSTOMER_NAME_MER, at: nowMer.toISOString() });
  const resolvedMer: ScanResultMer = {
    ...currentMer,
    kind: "success",
    customerName: SIM_CUSTOMER_NAME_MER,
    scannedAt: nowMer.toISOString(),
    checkedAt: nowMer.toISOString(),
  };
  writeResultMer(resolvedMer);
  return resolvedMer;
}
