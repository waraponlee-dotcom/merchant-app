"use client";
import { useRouter } from "next/navigation";
import type { ReactNode } from "react";
import type { TxStatus } from "@/lib/store";
import { IconBack, IconInfo } from "./icons";

export function LoadingScreen() {
  return <main className="min-h-dvh animate-pulse bg-canvas" aria-busy="true" aria-label="กำลังโหลด" />;
}

/** Purple gradient with the yellow / pink glows used on Home, Dashboard and the daily summary. */
export function Hero({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <section className={`relative overflow-hidden bg-gradient-to-br from-[#3b2fd6] via-[#5b4bff] to-[#8a6bff] text-white ${className}`}>
      <div className="pointer-events-none absolute -right-10 -top-10 h-56 w-56 rounded-full bg-sun/70 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-16 -left-10 h-56 w-56 rounded-full bg-rose/60 blur-3xl" />
      <div className="relative">{children}</div>
    </section>
  );
}

/** Sticky header for inner pages: round back button + centred title. */
export function BackHeader({ title, fallbackHref }: { title: string; fallbackHref: string }) {
  const router = useRouter();
  const back = () => (window.history.length > 1 ? router.back() : router.push(fallbackHref));
  return (
    <header className="safe-top-bar sticky top-0 z-10 border-b border-line bg-canvas/90 px-4 pb-3 backdrop-blur">
      <div className="relative flex min-h-11 items-center justify-center">
        <button type="button" onClick={back} aria-label="ย้อนกลับ"
          className="absolute left-0 grid h-11 w-11 place-items-center rounded-full bg-[#e6e3f5] text-ink transition active:scale-95">
          <IconBack />
        </button>
        <h1 className="text-base font-bold">{title}</h1>
      </div>
    </header>
  );
}

const STATUS: Record<TxStatus, { label: string; cls: string }> = {
  success: { label: "สำเร็จ", cls: "bg-mint/25 text-mintink" },
  pending: { label: "รอชำระ", cls: "bg-sun/30 text-amberink" },
  cancelled: { label: "ยกเลิก", cls: "bg-rose/15 text-roseink" },
};
export function StatusBadge({ status, className = "" }: { status: TxStatus; className?: string }) {
  const m = STATUS[status];
  return <span className={`inline-block rounded-full px-3 py-1 text-center text-xs font-bold ${m.cls} ${className}`}>{m.label}</span>;
}

export function InfoNote({ children }: { children: ReactNode }) {
  return (
    <p className="flex items-center gap-3 rounded-2xl border border-brand/40 bg-brand/10 px-4 py-3 text-xs font-semibold leading-relaxed">
      <span className="shrink-0 text-brand"><IconInfo size={18} /></span>
      <span>{children}</span>
    </p>
  );
}

/** Small muted unit next to a number, e.g. `TKN`, `แก้ว`. */
export const Unit = ({ children }: { children: ReactNode }) => (
  <span className="ml-0.5 text-xs font-semibold text-muted">{children}</span>
);
