import type { ReactNode } from "react";

// ไอคอนเพิ่มสำหรับหน้า Scanner / ผลการรับชำระ (สไตล์เดียวกับ components/icons.tsx)
const SvgMer = ({ children, size = 22, stroke = 2 }: { children: ReactNode; size?: number; stroke?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={stroke} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
);
type PropsMer = { size?: number };

export const IconMinusMer = ({ size }: PropsMer) => <SvgMer size={size} stroke={2.4}><path d="M5 12h14" /></SvgMer>;
export const IconPlusMer = ({ size }: PropsMer) => <SvgMer size={size} stroke={2.4}><path d="M12 5v14M5 12h14" /></SvgMer>;
export const IconCheckMer = ({ size }: PropsMer) => <SvgMer size={size} stroke={2.6}><path d="M5 12.5l4.5 4.5L19 7.5" /></SvgMer>;
export const IconCrossMer = ({ size }: PropsMer) => <SvgMer size={size} stroke={2.6}><path d="M6 6l12 12M18 6L6 18" /></SvgMer>;
export const IconWalletMer = ({ size }: PropsMer) => (
  <SvgMer size={size}>
    <path d="M4 7.5A2.5 2.5 0 0 1 6.5 5H18v3M4 7.5V17a2 2 0 0 0 2 2h12a1 1 0 0 0 1-1V9a1 1 0 0 0-1-1H6.5A2.5 2.5 0 0 1 4 7.5z" />
    <circle cx="15.5" cy="13.5" r="1" fill="currentColor" />
  </SvgMer>
);
/** Bluetooth ที่มีเส้นขีดฆ่า */
export const IconBluetoothOffMer = ({ size }: PropsMer) => (
  <SvgMer size={size}>
    <path d="M7 7l10 10-5 4.5V9.5M12 9.5V3l5 4.5-3 2.7M7 17l5-4M3 3l18 18" />
  </SvgMer>
);
export const IconRefreshMer = ({ size }: PropsMer) => (
  <SvgMer size={size}>
    <path d="M20 11a8 8 0 0 0-14.5-4M4 4v3.5h3.5M4 13a8 8 0 0 0 14.5 4M20 20v-3.5h-3.5" />
  </SvgMer>
);
/** วงกลม "!" สำหรับกล่องเตือน */
export const IconAlertMer = ({ size = 20 }: PropsMer) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <path d="M12 7v6M12 16.4v.01" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" fill="none" />
  </svg>
);
