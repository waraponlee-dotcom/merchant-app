"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { IconCup, IconLock, IconScan } from "@/components/icons";
import { IconMinusMer, IconPlusMer } from "@/components/iconsMer";
import ScanFrameMer from "@/components/ScanFrameMer";
import { LoadingScreen } from "@/components/ui";
import { actions, useStore } from "@/lib/store";
import { SHOW_SIM_MER, runScanMer } from "@/utils/scanFlow";
import { calcTotalMer, clampQtyMer, fmtTokenMer, type ScanKindMer } from "@/utils/token";

const SIM_BUTTONS_MER: { kind: ScanKindMer; label: string; dot: string }[] = [
  { kind: "success", label: "ชำระสำเร็จ", dot: "bg-mintink" },
  { kind: "insufficient", label: "Token ไม่พอ", dot: "bg-sun" },
  { kind: "disconnected", label: "Scanner หลุด", dot: "bg-roseink" },
];

export default function ScannerPageMer() {
  const storeMer = useStore();
  const routerMer = useRouter();
  const [draftMer, setDraftMer] = useState<number | null>(null);
  const [noteMer, setNoteMer] = useState("");
  if (!storeMer) return <LoadingScreen />;

  const { product: productMer, tokenSymbol: symbolMer, maxQty: maxQtyMer } = storeMer.config;
  const qtyMer = Math.min(draftMer ?? storeMer.currentQty, maxQtyMer);
  const totalMer = calcTotalMer(qtyMer, productMer.unitPrice);

  const stepMer = (deltaMer: number) => { setDraftMer(clampQtyMer(qtyMer + deltaMer, maxQtyMer)); setNoteMer(""); };
  const confirmMer = () => {
    actions.setQty(qtyMer); // หน้าหลักอ่าน currentQty → "× qty"
    setNoteMer(`ส่งยอด ${fmtTokenMer(totalMer, symbolMer)} ไปที่เครื่องแล้ว · รอลูกค้าสแกน`);
  };
  const simulateMer = (kindMer: ScanKindMer) => { runScanMer(kindMer, qtyMer); routerMer.push("/scanner/result"); };

  return (
    <main className="min-h-dvh pb-40">
      <h1 className="safe-top-bar border-b border-line pb-4 text-center font-bold">Scanner</h1>

      <div className="space-y-3 px-5 pt-4">
        {/* สินค้า */}
        <section className="flex items-center gap-3 rounded-3xl border border-line bg-white p-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-sun to-rose text-white"><IconCup size={22} /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{productMer.name}</p>
            <p className="flex items-center gap-1 text-xs text-muted"><IconLock size={12} />ราคากำหนดโดย Super Admin</p>
          </div>
          <div className="shrink-0 text-right">
            <p className="text-lg font-extrabold text-brand">{productMer.unitPrice} {symbolMer}</p>
            <p className="text-xs text-muted">ต่อชิ้น</p>
          </div>
        </section>

        {/* จำนวน */}
        <section className="rounded-3xl border border-line bg-white px-4 py-3">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold">จำนวน</h2>
            <span className="text-xs text-muted">ปรับได้ก่อนสแกน</span>
          </div>
          <div className="mt-2 flex items-center justify-center gap-8">
            <button type="button" onClick={() => stepMer(-1)} disabled={qtyMer <= 1} aria-label="ลดจำนวน"
              className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white transition active:scale-95 disabled:opacity-30"><IconMinusMer /></button>
            <p className="flex min-w-16 items-baseline justify-center text-[40px] font-extrabold leading-none" aria-live="polite">
              {qtyMer}<span className="ml-1.5 text-xs font-semibold text-muted">ชิ้น</span>
            </p>
            <button type="button" onClick={() => stepMer(1)} disabled={qtyMer >= maxQtyMer} aria-label="เพิ่มจำนวน"
              className="grid h-10 w-10 place-items-center rounded-full bg-ink text-white transition active:scale-95 disabled:opacity-30"><IconPlusMer /></button>
          </div>
        </section>

        {/* กล้อง + ยอดที่ต้องจ่าย */}
        <section className="rounded-3xl border border-line bg-white p-3">
          <ScanFrameMer />
          <div className="flex items-center justify-between px-1 pb-1 pt-3">
            <span className="text-sm font-bold">ยอดที่ลูกค้าต้องจ่าย</span>
            <span className="text-[26px] font-extrabold leading-none text-brand">{fmtTokenMer(totalMer, symbolMer)}</span>
          </div>
        </section>

        <div className="flex gap-3">
          <button type="button" onClick={() => { setDraftMer(1); setNoteMer(""); }}
            className="rounded-2xl border border-line bg-white px-5 py-3.5 text-sm font-bold transition active:scale-95">ล้างรายการ</button>
          <button type="button" onClick={confirmMer}
            className="flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink py-3.5 text-sm font-bold text-white transition active:scale-[0.98]"><IconScan size={20} />ยืนยันจำนวน</button>
        </div>
        {noteMer && <p role="status" className="text-center text-xs font-semibold text-mintink">{noteMer}</p>}

        {/* ปุ่มจำลองสแกน 3 แบบ — แสดงเสมอ ซ่อนได้ด้วย NEXT_PUBLIC_HIDE_SIM=1 (ดู SHOW_SIM_MER ใน utils/scanFlow.ts) */}
        {SHOW_SIM_MER && (
          <section className="rounded-2xl border border-dashed border-line p-3">
            <p className="text-xs font-bold text-muted">dev · จำลองผลการสแกน ({qtyMer} ชิ้น · {fmtTokenMer(totalMer, symbolMer)})</p>
            <div className="mt-2 grid grid-cols-3 gap-2">
              {SIM_BUTTONS_MER.map((btnMer) => (
                <button key={btnMer.kind} type="button" onClick={() => simulateMer(btnMer.kind)}
                  className="flex flex-col items-center gap-1.5 rounded-xl bg-white px-1 py-2.5 text-xs font-bold ring-1 ring-line transition active:scale-95">
                  <span className={`h-2 w-2 rounded-full ${btnMer.dot}`} aria-hidden />{btnMer.label}
                </button>
              ))}
            </div>
          </section>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
