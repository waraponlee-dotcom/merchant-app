"use client";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { BackHeader, InfoNote, LoadingScreen, StatusBadge } from "@/components/ui";
import { fmtDate, fmtFullDate, fmtNum, fmtTime } from "@/lib/format";
import { summarize, useStore } from "@/lib/store";

export default function DashboardDetailPage() {
  const s = useStore();
  if (!s) return <LoadingScreen />;
  const { product: pr, tokenSymbol: tkn, notice } = s.config;
  const sum = summarize(s);
  const cols = "grid grid-cols-[3.5rem_minmax(0,1fr)_4.25rem_4.5rem] items-center gap-2";
  const repCols = "grid grid-cols-[minmax(0,1fr)_3.5rem_5.5rem] items-center gap-2";

  return (
    <main className="min-h-dvh pb-32">
      <BackHeader title="แดชบอร์ดร้าน" fallbackHref="/dashboard" />
      <div className="space-y-3 px-5 pt-5">
        <div className="flex items-end justify-between">
          <h2 className="text-base font-extrabold">รายการล่าสุด</h2>
          <Link href="/dashboard/all" className="py-1 text-sm font-semibold text-brand">ดูทั้งหมด</Link>
        </div>
        <div className="rounded-3xl border border-line bg-white px-4 pb-1 pt-3 text-sm">
          <div className={`${cols} border-b border-line pb-2 text-xs text-muted`}>
            <span>วัน/เวลา</span><span>จำนวนสินค้า</span><span className="text-right">Token ที่ใช้</span><span className="text-center">สถานะ</span>
          </div>
          {sum.latest.length === 0 && <p className="py-6 text-center text-xs text-muted">ยังไม่มีรายการ</p>}
          <ul>
            {sum.latest.map((t) => (
              <li key={t.id} className={`${cols} border-b border-line py-3 last:border-0`}>
                <span className="leading-tight"><span className="block text-[11px] text-muted">{fmtDate(t.at)}</span><span className="block font-bold">{fmtTime(t.at)}</span></span>
                <span className="truncate font-bold">{pr.name} ×{t.qty}</span>
                <span className="text-right font-semibold">{fmtNum(t.tokens)} {tkn}</span>
                <StatusBadge status={t.status} />
              </li>
            ))}
          </ul>
        </div>

        <div className="flex items-end justify-between pt-3">
          <h2 className="text-base font-extrabold">รายงานสรุป</h2>
          <span className="text-xs text-muted">ตรวจสอบหลังจบงาน</span>
        </div>
        <div className="rounded-3xl border border-line bg-white px-4 py-3 text-sm">
          <div className={`${repCols} pb-2 text-xs text-muted`}>
            <span>วัน</span><span className="text-right">{pr.unit}</span><span className="text-right">Token</span>
          </div>
          <ul className="space-y-2.5">
            {sum.report.map((d, i) => (
              <li key={d.key} className={repCols}>
                <span className="truncate">วันที่ {i + 1} · {fmtFullDate(d.date)}</span>
                <span className="text-right font-bold">{fmtNum(d.qty)}</span>
                <span className="text-right font-bold">{fmtNum(d.tokens)}</span>
              </li>
            ))}
          </ul>
          <div className={`${repCols} mt-3 border-t border-line pt-3`}>
            <span className="font-bold">รวมทั้งงาน</span>
            <span className="text-right font-bold">{fmtNum(sum.totalQty)}</span>
            <span className="text-right font-extrabold text-brand">{fmtNum(sum.totalTokens)} {tkn}</span>
          </div>
        </div>

        <InfoNote>{notice}</InfoNote>
      </div>
      <BottomNav />
    </main>
  );
}
