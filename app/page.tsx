"use client";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { IconBag, IconCup, IconDown } from "@/components/icons";
import { Hero, LoadingScreen, Unit } from "@/components/ui";
import { fmtNum, fmtTime, maskName } from "@/lib/format";
import { summarize, useStore } from "@/lib/store";

export default function Home() {
  const s = useStore();
  if (!s) return <LoadingScreen />;
  const { profile: p, product: pr, tokenSymbol: tkn, maxQty, shopOpen } = s.config;
  const qty = Math.min(s.currentQty, maxQty);
  const sum = summarize(s);

  return (
    <main className="min-h-dvh pb-32">
      <Hero className="safe-top-hero rounded-b-[32px] px-5 pb-14">
        <p className="text-sm opacity-90">{p.shopName} · บูธ {p.booth}</p>
        <p className="mt-4 text-sm">Token ที่ได้รับทั้งหมด</p>
        <p className="mt-1 text-[44px] font-extrabold leading-none">
          {fmtNum(sum.totalTokens)} <span className="ml-1 text-lg font-bold">{tkn}</span>
        </p>
        <p className="mt-3 flex items-center gap-2 text-sm">
          <span className={`h-2 w-2 rounded-full ${shopOpen ? "bg-mint" : "bg-white/50"}`} />
          {shopOpen ? "กำลังเปิดร้าน · รับ Token ได้ตลอดงาน" : "ปิดร้านชั่วคราว"}
        </p>
      </Hero>

      <div className="relative -mt-9 space-y-4 px-5">
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-3xl border border-line bg-white p-4">
            <p className="flex items-center gap-2 text-xs text-muted">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-mint/25 text-mintink"><IconDown size={16} /></span>Token วันนี้
            </p>
            <p className="mt-3 text-[22px] font-extrabold text-mintink">+{fmtNum(sum.todayTokens)} <Unit>{tkn}</Unit></p>
          </div>
          <div className="rounded-3xl border border-line bg-white p-4">
            <p className="flex items-center gap-2 text-xs text-muted">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-brand/15 text-brand"><IconBag size={16} /></span>ขายได้วันนี้
            </p>
            <p className="mt-3 text-[22px] font-extrabold">{fmtNum(sum.todayQty)} <Unit>{pr.unit}</Unit></p>
          </div>
        </div>

        {/* Product strip — multiplier comes from the Scanner quantity page */}
        <div className="flex items-center gap-3 rounded-3xl border border-line bg-white p-3">
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-gradient-to-br from-sun to-rose text-white"><IconCup size={22} /></span>
          <div className="min-w-0 flex-1">
            <p className="truncate font-bold">{pr.name}{qty > 1 && <span> × {qty}</span>}</p>
            <p className="truncate text-xs text-muted">
              {qty > 1
                ? `${pr.unitPrice} ${tkn} / ${pr.unit} · รวม ${fmtNum(qty * pr.unitPrice)} ${tkn}`
                : `สินค้าเดียว · ${pr.unitPrice} ${tkn} / ${pr.unit}`}
            </p>
          </div>
          <Link href="/scanner" className="shrink-0 rounded-full bg-ink px-4 py-2.5 text-sm font-bold text-white transition active:scale-95">ปรับจำนวน</Link>
        </div>

        <div className="flex items-end justify-between pt-2">
          <h2 className="text-lg font-extrabold">Token ที่ได้รับล่าสุด</h2>
          <Link href="/dashboard/all" className="py-1 text-sm font-semibold text-brand">ดูทั้งหมด</Link>
        </div>
        {sum.recent.length === 0 ? (
          <p className="rounded-3xl border border-dashed border-line px-4 py-8 text-center text-sm text-muted">
            ยังไม่มีรายการ — Token จะแสดงที่นี่เมื่อลูกค้าสแกนจ่ายที่เครื่อง
          </p>
        ) : (
          <ul className="space-y-3">
            {sum.recent.map((t) => (
              <li key={t.id} className="flex items-center gap-3">
                <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-mint/25 text-mintink"><IconDown /></span>
                <div className="min-w-0 flex-1">
                  <p className="truncate font-bold">{pr.name} ×{t.qty}</p>
                  <p className="truncate text-xs text-muted">ออเดอร์ {t.orderNo} · จาก {maskName(t.payerName)}</p>
                </div>
                <div className="text-right">
                  <p className="font-extrabold text-mintink">+{fmtNum(t.tokens)} {tkn}</p>
                  <p className="text-xs text-muted">{fmtTime(t.at)}</p>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
      <BottomNav />
    </main>
  );
}
