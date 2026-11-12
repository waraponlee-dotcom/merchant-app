"use client";
import { useState } from "react";
import { BackHeader, Hero, LoadingScreen, StatusBadge } from "@/components/ui";
import { dayKey, fmtDate, fmtFullDate, fmtNum, fmtTime, toDate } from "@/lib/format";
import { summarize, useStore } from "@/lib/store";

const PAGE = 7; // rows shown first, then +10 per tap

export default function AllTransactionsPage() {
  const s = useStore();
  const [shown, setShown] = useState(PAGE);
  const [selectedDay, setSelectedDay] = useState(() => dayKey(new Date()));
  if (!s) return <LoadingScreen />;
  const { product: pr, tokenSymbol: tkn } = s.config;
  const todayKey = dayKey(new Date());
  const sum = summarize(s);
  const list = s.txs.filter((tx) => dayKey(tx.at) === selectedDay);
  const rows = list.slice(0, shown);
  const daySummary = sum.report.find((day) => day.key === selectedDay);
  const successfulCount = list.filter((tx) => tx.status === "success").length;
  const otherCount = list.length - successfulCount;
  const cols = "grid grid-cols-[5.5rem_minmax(0,1fr)_2.5rem_4.75rem] items-center gap-2";
  const moveDay = (delta: number) => {
    const date = toDate(selectedDay);
    date.setDate(date.getDate() + delta);
    const nextDay = dayKey(date);
    setSelectedDay(nextDay > todayKey ? todayKey : nextDay);
    setShown(PAGE);
  };
  const selectDay = (date: string) => {
    setSelectedDay(date || todayKey);
    setShown(PAGE);
  };

  return (
    <main className="min-h-dvh safe-bottom">
      <BackHeader title="รายการธุรกรรม" fallbackHref="/" />
      <div className="space-y-4 px-5 pt-5">
        <div className="flex items-end justify-between gap-2">
          <h2 className="text-base font-extrabold">{fmtFullDate(toDate(selectedDay))}</h2>
          <span className="text-xs text-muted">ทั้งหมด {fmtNum(list.length)} รายการ</span>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" onClick={() => moveDay(-1)} aria-label="วันก่อนหน้า"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white text-lg font-bold transition active:scale-95">‹</button>
          <input type="date" value={selectedDay} max={todayKey} onChange={(event) => selectDay(event.currentTarget.value)}
            aria-label="เลือกวันที่ดูย้อนหลัง" className="h-10 min-w-0 flex-1 rounded-xl border border-line bg-white px-3 text-sm" />
          <button type="button" onClick={() => moveDay(1)} disabled={selectedDay >= todayKey} aria-label="วันถัดไป"
            className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-line bg-white text-lg font-bold transition active:scale-95 disabled:opacity-40">›</button>
          {selectedDay !== todayKey && (
            <button type="button" onClick={() => selectDay(todayKey)}
              className="shrink-0 rounded-xl bg-ink px-3 py-2.5 text-xs font-bold text-white transition active:scale-95">วันนี้</button>
          )}
        </div>

        <div className="rounded-3xl border border-line bg-white px-4 pb-3 pt-3 text-sm">
          <div className={`${cols} border-b border-line pb-2 text-xs text-muted`}>
            <span>ออเดอร์ / เวลา</span><span>ชื่อลูกค้า</span><span className="text-right">จำนวน</span><span className="text-right">ราคารวม</span>
          </div>
          {rows.length === 0 && <p className="py-8 text-center text-xs text-muted">วันที่เลือกไม่มีรายการย่อยในเครื่องนี้ ยอดรวมด้านล่างอาจมาจากข้อมูลสรุปของ Super Admin</p>}
          <ul>
            {rows.map((t) => (
              <li key={t.id} className={`${cols} border-b border-line py-3 last:border-0`}>
                <span className="leading-tight"><span className="block truncate text-[11px] font-bold">{t.orderNo}</span><span className="block text-[10px] text-muted">{fmtDate(t.at)} {fmtTime(t.at)}</span></span>
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
            <h2 className="text-base font-bold">สรุปรายวัน</h2>
            <span className="rounded-full bg-white/20 px-3 py-1 text-xs font-semibold">{fmtFullDate(toDate(selectedDay))}</span>
          </div>
          <p className="mt-4 text-sm opacity-90">ยอดรวมของวันที่เลือก</p>
          <p className="mt-1 text-[40px] font-extrabold leading-none">{fmtNum(daySummary?.tokens ?? 0)} {tkn}</p>
          <div className="mt-4 grid grid-cols-2 gap-3 border-t border-white/25 pt-4">
            <div>
              <p className="text-xs opacity-90">ชำระสำเร็จ</p>
              <p className="mt-1 text-2xl font-extrabold">{fmtNum(successfulCount)} <span className="text-xs font-semibold">รายการ</span></p>
            </div>
            <div>
              <p className="text-xs opacity-90">จำนวนที่ขาย</p>
              <p className="mt-1 text-2xl font-extrabold">{fmtNum(daySummary?.qty ?? 0)} <span className="text-xs font-semibold">{pr.unit}</span></p>
            </div>
          </div>
          <p className="mt-3 text-xs opacity-90">รายการอื่นที่ยังไม่สำเร็จ/รอยืนยัน: {fmtNum(otherCount)}</p>
          <p className="mt-3 text-[11px] opacity-85">{pr.name} {pr.unitPrice} {tkn} ต่อ{pr.unit} · ยอดรวมคิดจากรายการสำเร็จและยอดรายวันที่นำเข้าจาก Super Admin</p>
        </Hero>
      </div>
    </main>
  );
}
