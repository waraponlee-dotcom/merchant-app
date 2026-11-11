// ─────────────────────────────────────────────────────────────────────────────
// Token system (pure logic — ไม่ผูกกับ React / Next / localStorage)
// ใครอยากใช้ก็ import ไปได้เลย:  import { calcTotalMer, checkPaymentMer } from "@/utils/token";
// ตัวแปร / ฟังก์ชัน / type ทุกตัวลงท้ายด้วย "Mer"
// ─────────────────────────────────────────────────────────────────────────────

export type TxStatusMer = "success" | "pending" | "cancelled";

/** หนึ่งรายการ Token ที่ร้านค้าได้รับ (tokens = qty × ราคา *ณ ตอนนั้น*) */
export interface TokenTxMer {
  id: string;
  ref?: string;               // เลขที่รายการที่โชว์ให้คนอ่าน เช่น TX-20418
  at: string;                 // ISO
  qty: number;
  tokens: number;
  payerName: string;
  payerEmail?: string;
  status: TxStatusMer;
}

/** ผลของการสแกนจ่าย 1 ครั้ง */
export type ScanKindMer = "success" | "insufficient" | "disconnected";

/** ข้อมูลที่หน้า "ผลการรับชำระ" ใช้แสดง */
export interface ScanResultMer {
  kind: ScanKindMer;
  productName: string;
  unitPrice: number;
  qty: number;
  total: number;
  symbol: string;
  customerName: string;
  channel: string;
  sentAt: string;             // ส่งยอดไปที่เครื่อง
  scannedAt?: string;         // ลูกค้าสแกนที่เครื่อง
  checkedAt: string;          // ตรวจสอบ / ชำระสำเร็จ
  txId?: string;
  refNo?: string;
}

export const CHANNEL_NAME_MER = "Handheld Scanner";
export const SIM_CUSTOMER_NAME_MER = "สมชาย ใจดี";
export const UNKNOWN_PAYER_NAME_MER = "ลูกค้า (รอยืนยัน)";

// ── ตัวเลข ───────────────────────────────────────────────────────────────────
export const clampQtyMer = (nMer: number, maxMer: number) => Math.min(maxMer, Math.max(1, Math.round(nMer)));

/** ยอดที่ลูกค้าต้องจ่าย */
export const calcTotalMer = (qtyMer: number, unitPriceMer: number) => qtyMer * unitPriceMer;

/** "120 TKN" */
export const fmtTokenMer = (amountMer: number, symbolMer: string) => `${amountMer.toLocaleString("en-US")} ${symbolMer}`;

// ── รหัสรายการ ───────────────────────────────────────────────────────────────
export const makeTxIdMer = () => `tx_${Date.now().toString(36)}${Math.random().toString(36).slice(2, 6)}`;

/** TX-20418 — เลขรันต่อจากจำนวนรายการที่มีอยู่ */
export const makeRefNoMer = (existingCountMer: number) => `TX-${20000 + existingCountMer + 1}`;

export function buildTxMer(inputMer: {
  qty: number;
  unitPrice: number;
  payerName: string;
  payerEmail?: string;
  status?: TxStatusMer;
  existingCount: number;
  at?: string;
}): TokenTxMer {
  return {
    id: makeTxIdMer(),
    ref: makeRefNoMer(inputMer.existingCount),
    at: inputMer.at ?? new Date().toISOString(),
    qty: inputMer.qty,
    tokens: calcTotalMer(inputMer.qty, inputMer.unitPrice),
    payerName: inputMer.payerName,
    payerEmail: inputMer.payerEmail,
    status: inputMer.status ?? "success",
  };
}

// ── ตรวจผลการชำระ ────────────────────────────────────────────────────────────
/**
 * ตัดสินผลจากสถานะเครื่อง + ยอดคงเหลือของลูกค้า
 * (ตอนต่อเครื่องจริง ให้ส่งค่าที่ได้จาก Handheld Scanner / backend มาที่นี่)
 */
export function checkPaymentMer(inputMer: { total: number; customerBalance: number; scannerConnected: boolean }): ScanKindMer {
  if (!inputMer.scannerConnected) return "disconnected";
  if (inputMer.customerBalance < inputMer.total) return "insufficient";
  return "success";
}

/** ค่าจำลองของลูกค้า/เครื่อง สำหรับปุ่มทดสอบ 3 แบบ */
export function buildSimPaymentMer(kindMer: ScanKindMer, totalMer: number, unitPriceMer: number) {
  return {
    scannerConnected: kindMer !== "disconnected",
    customerBalance: kindMer === "insufficient" ? Math.max(0, totalMer - unitPriceMer) : totalMer + unitPriceMer * 5,
  };
}

export function buildScanResultMer(inputMer: {
  kind: ScanKindMer;
  productName: string;
  unitPrice: number;
  qty: number;
  symbol: string;
  customerName?: string;
  sentAt: Date;
  scannedAt?: Date;
  checkedAt: Date;
  txId?: string;
  refNo?: string;
}): ScanResultMer {
  return {
    kind: inputMer.kind,
    productName: inputMer.productName,
    unitPrice: inputMer.unitPrice,
    qty: inputMer.qty,
    total: calcTotalMer(inputMer.qty, inputMer.unitPrice),
    symbol: inputMer.symbol,
    customerName: inputMer.customerName ?? SIM_CUSTOMER_NAME_MER,
    channel: CHANNEL_NAME_MER,
    sentAt: inputMer.sentAt.toISOString(),
    scannedAt: inputMer.scannedAt?.toISOString(),
    checkedAt: inputMer.checkedAt.toISOString(),
    txId: inputMer.txId,
    refNo: inputMer.refNo,
  };
}
