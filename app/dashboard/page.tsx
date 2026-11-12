"use client";
import Link from "next/link";
import type { ReactNode } from "react";
import { useState } from "react";
import BottomNav from "@/components/BottomNav";
import { IconBag, IconBox, IconDown, IconLock, IconTrend } from "@/components/icons";
import { Hero, LoadingScreen, Unit } from "@/components/ui";
import { dayKey, fmtNum } from "@/lib/format";
import { toCsv } from "@/lib/csv";
import { summarize, useStore, type TxStatus } from "@/lib/store";

const TONES = {
  brand: "bg-brand/15 text-brand",
  rose: "bg-rose/15 text-roseink",
  amber: "bg-sun/30 text-amberink",
  mint: "bg-mint/25 text-mintink",
};

const STATUS_LABELS: Record<TxStatus, string> = {
  success: "สำเร็จ",
  pending: "รอยืนยัน",
  insufficient: "Token ไม่พอ",
  cancelled: "ยกเลิก",
};

function Stat({ icon, tone, label, children }: { icon: ReactNode; tone: keyof typeof TONES; label: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-line bg-white p-4">
      <p className="flex items-center gap-2 text-xs text-muted">
        <span className={`grid h-8 w-8 shrink-0 place-items-center rounded-full ${TONES[tone]}`}>{icon}</span>{label}
      </p>
      <p className="mt-3 text-[22px] font-extrabold leading-tight">{children}</p>
    </div>
  );
}

export default function DashboardPage() {
  const s = useStore();
  const [exportError, setExportError] = useState("");
  if (!s) return <LoadingScreen />;
  const { profile: p, product: pr, tokenSymbol: tkn } = s.config;
  const sum = summarize(s);
  const none = <span className="text-muted">--</span>;
  const exportCsv = () => {
    setExportError("");
    try {
      const rows = [
        ["เลขออเดอร์", "เลขที่รายการ", "วันที่และเวลา (ISO)", "บูธ", "ร้านค้า", "สินค้า", "จำนวน", "ยอด Token", "ชื่อลูกค้า", "อีเมล", "สถานะ"],
        ...s.txs.map((tx) => [
          tx.orderNo,
          tx.ref ?? "",
          tx.at,
          p.booth,
          p.shopName,
          pr.name,
          tx.qty,
          tx.tokens,
          tx.payerName,
          tx.payerEmail ?? "",
          STATUS_LABELS[tx.status],
        ]),
      ];
      const blob = new Blob([toCsv(rows)], { type: "text/csv;charset=utf-8" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `merchant-orders-${dayKey(new Date())}.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      setExportError(`ส่งออก CSV ไม่สำเร็จ: ${error.message}`);
    }
  };

  return (
    <main className="min-h-dvh pb-32">
      <Hero className="safe-top-hero px-5 pb-10">
        <h1 className="text-[32px] font-extrabold leading-tight">แดชบอร์ดร้าน</h1>
        <p className="mt-1 text-sm text-white/85">{p.shopName}</p>
      </Hero>

      <div className="relative -mt-6 space-y-3 rounded-t-[28px] bg-canvas px-5 pt-5">
        <div className="flex items-center justify-between">
          <h2 className="text-base font-extrabold">สรุปภาพรวม</h2>
          <div className="flex items-center gap-2">
            <button type="button" onClick={exportCsv} className="rounded-full border border-line bg-white px-4 py-2.5 text-sm font-bold transition active:scale-95">ส่งออก CSV</button>
            <Link href="/dashboard/detail" className="rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white transition active:scale-95">ดูเพิ่มเติม</Link>
          </div>
        </div>
        <Link href="/dashboard/all" className="block w-fit py-1 text-sm font-semibold text-brand">ดูธุรกรรมย้อนหลังตามวันที่ →</Link>
        {exportError && <p role="alert" className="rounded-xl bg-rose/10 px-4 py-2 text-sm font-semibold text-roseink">{exportError}</p>}

        <div className="grid grid-cols-2 gap-3">
          <Stat icon={<IconTrend size={16} />} tone="brand" label="ยอดขายรวม">{fmtNum(sum.totalTokens)} <Unit>{tkn}</Unit></Stat>
          <Stat icon={<IconBag size={16} />} tone="rose" label="จำนวนที่ขายแล้ว">{fmtNum(sum.totalQty)} <Unit>{pr.unit}</Unit></Stat>
          <Stat icon={<IconBox size={16} />} tone="amber" label="สินค้าคงเหลือ">
            {sum.stockLeft == null ? none : <>{fmtNum(sum.stockLeft)} <Unit>{pr.unit}</Unit></>}
          </Stat>
          <Stat icon={<IconDown size={16} />} tone="mint" label="Token ที่รับวันนี้">+{fmtNum(sum.todayTokens)} <Unit>{tkn}</Unit></Stat>
        </div>

        <section className="pt-3">
        <h2 className="mb-3 text-base font-extrabold">ข้อมูลร้านค้า</h2>
        <dl className="divide-y divide-line rounded-3xl border border-line bg-white px-4 text-sm">
          <div className="flex items-center justify-between gap-4 py-3"><dt className="text-muted">ชื่อร้าน</dt><dd className="truncate font-bold">{p.shopName}</dd></div>
          <div className="flex items-center justify-between gap-4 py-3"><dt className="text-muted">ชื่อสินค้า</dt><dd className="truncate font-bold">{pr.name}</dd></div>
          <div className="flex items-center justify-between gap-4 py-3">
            <dt className="text-muted">ราคาต่อชิ้น</dt>
            <dd className="flex items-center gap-2 font-bold">{pr.unitPrice} {tkn}<span className="text-muted" title="กำหนดโดย Super Admin"><IconLock size={14} /></span></dd>
          </div>
        </dl>
        </section>

        <section className="pt-3">
        <h2 className="mb-3 text-base font-extrabold">คลังสินค้า</h2>
        <div className="grid grid-cols-2 gap-3 rounded-3xl border border-line bg-white p-4">
          <div>
            <p className="text-xs text-muted">สินค้าคงเหลือ</p>
            <p className="mt-1 text-[22px] font-extrabold">{sum.initialStock == null ? none : <>{fmtNum(sum.initialStock)} <Unit>{pr.unit}</Unit></>}</p>
          </div>
          <div>
            <p className="text-xs text-muted">จำนวนขายแล้ว</p>
            <p className="mt-1 text-[22px] font-extrabold text-roseink">{fmtNum(sum.totalQty)} <span className="text-xs font-semibold text-muted">{pr.unit}</span></p>
          </div>
        </div>
        </section>
      </div>
      <BottomNav />
    </main>
  );
}
