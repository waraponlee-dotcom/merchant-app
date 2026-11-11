"use client";
import type { ReactNode } from "react";
import BottomNav from "@/components/BottomNav";
import { IconChat, IconMail, IconPhone } from "@/components/icons";
import { LoadingScreen } from "@/components/ui";
import { useStore } from "@/lib/store";

function Contact({ href, icon, label, value }: { href?: string; icon: ReactNode; label: string; value: string }) {
  const body = (
    <>
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-brand/15 text-brand">{icon}</span>
      <span className="min-w-0 flex-1"><span className="block text-xs text-muted">{label}</span><span className="block truncate font-bold">{value}</span></span>
    </>
  );
  const cls = "flex items-center gap-3 py-3";
  return href ? <a href={href} className={`${cls} transition active:opacity-60`}>{body}</a> : <div className={cls}>{body}</div>;
}

export default function HelpPage() {
  const s = useStore();
  if (!s) return <LoadingScreen />;
  const { support: su, product: pr, tokenSymbol: tkn, notice, profile: p } = s.config;
  const hasContact = su.phone || su.lineId || su.email;

  const faqs = [
    { q: "ปรับราคาสินค้าเองได้ไหม", a: `ไม่ได้ ราคา ${pr.unitPrice} ${tkn} ต่อชิ้นถูกกำหนดโดย ${su.name} หากต้องการเปลี่ยนโปรดติดต่อทีมงาน` },
    { q: "ลูกค้าจ่ายอย่างไร", a: "ลูกค้าสแกนจ่ายที่เครื่อง Handheld Scanner เท่านั้น เลือกจำนวนที่หน้า Scanner แล้วกด “ยืนยันและส่งไปเครื่อง” ก่อนทุกครั้ง" },
    { q: "รายการไม่ขึ้นในหน้าหลัก", a: "ตรวจสอบว่าเครื่อง Handheld Scanner เชื่อมต่อ Bluetooth อยู่ และอินเทอร์เน็ตของโทรศัพท์ใช้งานได้ ถ้ายังไม่ขึ้นให้ติดต่อทีมงานพร้อมแจ้งเวลาที่ลูกค้าจ่าย" },
    { q: "แลก Token เป็นเงินสดได้อย่างไร", a: notice },
  ];

  return (
    <main className="min-h-dvh pb-32">
      <h1 className="safe-top-bar border-b border-line pb-4 text-center font-bold">ขอความช่วยเหลือ</h1>
      <div className="space-y-4 px-5 pt-5">
        <section className="rounded-3xl border border-line bg-white px-4 pt-4">
          <h2 className="font-bold">ติดต่อ {su.name}</h2>
          <p className="mt-0.5 text-xs text-muted">{su.hours ? `เวลาทำการ ${su.hours}` : `ร้าน ${p.shopName} · บูธ ${p.booth}`}</p>
          {hasContact ? (
            <div className="mt-2 divide-y divide-line">
              {su.phone && <Contact href={`tel:${su.phone.replace(/[^\d+]/g, "")}`} icon={<IconPhone size={20} />} label="โทร" value={su.phone} />}
              {su.lineId && <Contact icon={<IconChat size={20} />} label="LINE" value={su.lineId} />}
              {su.email && <Contact href={`mailto:${su.email}`} icon={<IconMail size={20} />} label="อีเมล" value={su.email} />}
            </div>
          ) : (
            <p className="py-6 text-center text-sm text-muted">ยังไม่มีช่องทางติดต่อ โปรดแจ้งทีมงานที่หน้างาน</p>
          )}
        </section>

        <h2 className="pt-2 text-base font-extrabold">คำถามที่พบบ่อย</h2>
        <div className="divide-y divide-line rounded-3xl border border-line bg-white px-4">
          {faqs.map((f) => (
            <details key={f.q} className="group py-3.5">
              <summary className="flex cursor-pointer list-none items-center justify-between gap-3 text-sm font-bold [&::-webkit-details-marker]:hidden">
                {f.q}<span className="text-lg text-muted transition group-open:rotate-45" aria-hidden>+</span>
              </summary>
              <p className="mt-2 text-sm leading-relaxed text-muted">{f.a}</p>
            </details>
          ))}
        </div>
      </div>
      <BottomNav />
    </main>
  );
}
