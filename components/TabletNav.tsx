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

export default function TabletNav() {
  const path = usePathname();
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[88px] border-r border-line bg-white px-3 py-6 md:block lg:w-[224px] lg:px-5" aria-label="เมนูร้านค้า">
      <Link href="/" className="mb-10 flex items-center justify-center gap-3 lg:justify-start">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-brand text-xl font-extrabold text-white">M</span>
        <span className="hidden text-lg font-extrabold text-ink lg:block">Merchant</span>
      </Link>
      <nav aria-label="เมนูหลัก">
        <ul className="space-y-2">
          {items.map((item) => {
            const active = item.href === "/" ? path === "/" : path.startsWith(item.href);
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  aria-current={active ? "page" : undefined}
                  className={`flex min-h-14 flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[10px] font-semibold transition lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:text-sm ${active ? "bg-brand/10 text-brand" : "text-muted hover:bg-canvas"}`}
                >
                  {item.icon}
                  <span className="lg:block">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
        <div className="mt-2">
          <LogoutButton className="flex min-h-14 w-full flex-col items-center justify-center gap-1 rounded-2xl px-2 text-[10px] font-semibold text-muted transition hover:bg-canvas lg:flex-row lg:justify-start lg:gap-3 lg:px-4 lg:text-sm" labelClassName="hidden lg:inline" />
        </div>
      </nav>
    </aside>
  );
}
