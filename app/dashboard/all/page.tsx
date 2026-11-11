"use client";
import { useState } from "react";
import { BackHeader, Hero, LoadingScreen, StatusBadge } from "@/components/ui";
import { fmtDate, fmtFullDate, fmtNum, fmtTime } from "@/lib/format";
import { summarize, useStore } from "@/lib/store";

const PAGE = 7; // rows shown first, then +10 per tap

export default function AllTransactionsPage() {
  const s = useStore();
  const [shown, setShown] = useState(PAGE);
  if (!s) return <LoadingScreen />;
  const { product: pr, tokenSymbol: tkn } = s.config;
  const sum = summarize(s);
  const list = sum.todayList;
  const rows = list.slice(0, shown);
  const cols = "grid grid-cols-[3.5rem_minmax(0,1fr)_2.5rem_4.75rem] items-center gap-2";

  return (
    <main className="min-h-dvh safe-bottom">
      <BackHeader title="รายการธุรกรรม" fallbackHref="/" />
      <div className="space-y-4 px-5 pt-5">
        <div className="flex items-end justify-between">
          <h2 className="text-base font-extrabold">วันนี้ · {fmtFullDate(new Date())}</h2>
          <span className="text-xs text-muted">ทั้งหมด {fmtNum(list.length)} รายการ</span>
        </div>

        <div className="rounded-3xl border border-line bg-white px-4 pb-3 pt-3 text-sm">
          <div className={`${cols} border-b border-line pb-2 text-xs text-muted`}>
            <span>วัน/เวลา</span><span>ชื่อลูกค้า</span><span className="text-right">จำนวน</span><span className="text-right">ราคารวม</span>
          </div>
          {rows.length === 0 && <p className="py-8 text-center text-xs text-muted">วันนี้ยังไม่มีรายการ</p>}
          <ul>
            {rows.map((t) => (
              <li key={t.id} className={`${cols} border-b border-line py-3 last:border-0`}>
                <span className="leading-tight"><span className="block text-[11px] text-muted">{fmtDate(t.at)}</span><span className="block font-bold">{fmtTime(t.at)}</span></span>
                <span className="min-w-0">
                  <span className="block truncate font-bold">{t.payerName}</span>
                  {t.status !== "success" && <StatusBadge status={t.status} className="mt-1 !px-2 !py-0.5 !text-[10px]" />}
                </span>
                <span className="text-right font-semibold">× {t.qty}</span>
                <span className="text-right font-bold">{fmtNum(t.tokens)} {tkn}</span>
              </li>
            ))}
          </ul>
          {list.length > 0 && (
            shown < list.length ? (
              <button type="button" onClick={() => setShown((n) => n + 10)}
                className="mt-1 w-full border-t border-line py-3 text-center text-xs text-muted transition active:bg-canvas">
                แสดง {rows.length} จาก {fmtNum(list.length)} รายการ · คลิกเพื่อดูเพิ่มเติม
              </button>
            ) : (
              <p className="mt-1 border-t border-line pt-3 text-center text-xs text-muted">แสดงครบ {fmtNum(list.length)} รายการ</p>
            )
          )}
        </div>

        <Hero className="rounded-3xl p-5">
          <div className="flex items-start justify-between">
            <h2 className="text-base font-bold">สรุปวันนี้</h2>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{fmtFullDate(new Date())}</span>
          </div>
          <p className="mt-4 text-sm opacity-90">ยอดรวมทั้งวัน</p>
          <p className="mt-1 text-[40px] font-extrabold leading-none">{fmtNum(sum.todayTokens)} {tkn}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/25 pt-4">
            <div>
              <p className="text-xs opacity-90">จำนวนรายการ</p>
              <p className="mt-1 text-2xl font-extrabold">{fmtNum(sum.todayCount)} <span className="text-xs font-semibold">รายการ</span></p>
            </div>
            <div>
              <p className="text-xs opacity-90">จำนวนที่ขาย</p>
              <p className="mt-1 text-2xl font-extrabold">{fmtNum(sum.todayQty)} <span className="text-xs font-semibold">{pr.unit}</span></p>
            </div>
          </div>
          <p className="mt-4 text-[11px] opacity-85">{pr.name} {pr.unitPrice} {tkn} ต่อ{pr.unit} · นับเฉพาะรายการที่ชำระสำเร็จ</p>
        </Hero>
      </div>
    </main>
  );
}
