import type { Metadata, Viewport } from "next";
import type { ReactNode } from "react";
import { Noto_Sans_Thai } from "next/font/google";
import ConfigSync from "@/components/ConfigSync";
import "./globals.css";

const thai = Noto_Sans_Thai({
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700", "800"],
  display: "swap",
  variable: "--font-thai",
});

// Shop name comes from Super Admin at runtime, so the static title stays generic.
export const metadata: Metadata = {
  title: "Merchant",
  description: "ระบบจัดการร้านค้าสำหรับงาน",
  formatDetection: { telephone: false },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: "#f6f4ff",
};

export default function RootLayout({ children }: Readonly<{ children: ReactNode }>) {
  return (
    <html lang="th" className={thai.variable}>
      <body>
        {/* overflow-x-clip (not hidden) so sticky headers keep working */}
        <div className="relative min-h-dvh w-full overflow-x-clip bg-[#e8e7ed]">
          <ConfigSync />
          <div className="app-frame mx-auto min-h-dvh w-full max-w-[430px] bg-canvas">{children}</div>
        </div>
      </body>
    </html>
  );
}
