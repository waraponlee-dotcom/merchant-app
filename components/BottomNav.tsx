"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { IconChart, IconHelp, IconHome, IconScan } from "./icons";
import LogoutButton from "./LogoutButton";

const items = [
  { href: "/", label: "หน้าหลัก", icon: <IconHome /> },
  { href: "/dashboard", label: "แดชบอร์ด", icon: <IconChart /> },
  { href: "/scanner", label: "Scanner", icon: <IconScan /> },
  { href: "/help", label: "ขอความช่วยเหลือ", icon: <IconHelp /> },
];

export default function BottomNav() {
  const path = usePathname();
  return (
    <nav className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[430px] px-4 pb-[max(1rem,env(safe-area-inset-bottom))] md:hidden" aria-label="เมนูหลัก">
      <ul className="flex items-center justify-around rounded-[26px] bg-ink/95 p-2 text-white shadow-xl backdrop-blur">
        {items.map((it) => {
          const active = it.href === "/" ? path === "/" : path.startsWith(it.href);
          return (
            <li key={it.href}>
              <Link href={it.href} aria-label={it.label} aria-current={active ? "page" : undefined}
                className={`grid h-12 w-12 place-items-center rounded-2xl transition active:scale-95 ${active ? "bg-white/15" : "hover:bg-white/10"}`}>
                {it.icon}
              </Link>
            </li>
          );
        })}
        <li>
          <LogoutButton className="grid h-12 w-12 place-items-center rounded-2xl text-white transition hover:bg-white/10 active:scale-95" />
        </li>
      </ul>
    </nav>
  );
}
