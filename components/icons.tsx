import type { ReactNode } from "react";

const I = ({ children, size = 22 }: { children: ReactNode; size?: number }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" aria-hidden>{children}</svg>
);
type P = { size?: number };

export const IconDown = ({ size }: P) => <I size={size}><path d="M12 5v14M6 13l6 6 6-6" /></I>;
export const IconCup = ({ size }: P) => <I size={size}><path d="M6 8h12l-1.5 11a2 2 0 0 1-2 1.7h-5a2 2 0 0 1-2-1.7zM8 8l1-4h6l1 4" /></I>;
export const IconBag = ({ size }: P) => <I size={size}><path d="M6 8h12l1 12H5zM9 8a3 3 0 0 1 6 0" /></I>;
export const IconTrend = ({ size }: P) => <I size={size}><path d="M3 17l6-6 4 4 8-8M15 7h6v6" /></I>;
export const IconBox = ({ size }: P) => <I size={size}><path d="M12 3l8 4.5v9L12 21l-8-4.5v-9zM4 7.5l8 4.5 8-4.5M12 12v9" /></I>;
export const IconBack = ({ size }: P) => <I size={size}><path d="M15 5l-7 7 7 7" /></I>;
export const IconHome = () => <I><path d="M4 11l8-7 8 7v9H4z" /></I>;
export const IconChart = () => <I><path d="M5 20V10M12 20V4M19 20v-7" /></I>;
export const IconScan = ({ size }: P) => <I size={size}><path d="M4 8V5a1 1 0 0 1 1-1h3M16 4h3a1 1 0 0 1 1 1v3M20 16v3a1 1 0 0 1-1 1h-3M8 20H5a1 1 0 0 1-1-1v-3M4 12h16" /></I>;
export const IconHelp = () => <I><circle cx="12" cy="12" r="9" /><path d="M9.5 9.5a2.5 2.5 0 1 1 5 0c0 1.5-2.5 2-2.5 3.5M12 17v.01" /></I>;
export const IconLogout = () => <I><path d="M10 17l5-5-5-5M15 12H3M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7" /></I>;
export const IconLock = ({ size = 14 }: P) => <I size={size}><path d="M7 11V8a5 5 0 0 1 10 0v3M5 11h14v9H5z" /></I>;
export const IconSend = ({ size = 20 }: P) => <I size={size}><path d="M4 12l16-8-6 16-3-7z" /></I>;
export const IconPhone = ({ size }: P) => <I size={size}><path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A15 15 0 0 1 3 6a2 2 0 0 1 2-2z" /></I>;
export const IconChat = ({ size }: P) => <I size={size}><path d="M20 12a8 8 0 0 1-11.6 7.1L4 20l1-4A8 8 0 1 1 20 12z" /></I>;
export const IconMail = ({ size }: P) => <I size={size}><path d="M4 6h16v12H4zM4 7l8 6 8-6" /></I>;

/** Filled "i" badge used by the notice boxes. Colour comes from `currentColor`. */
export const IconInfo = ({ size = 20 }: P) => (
  <svg width={size} height={size} viewBox="0 0 24 24" aria-hidden>
    <circle cx="12" cy="12" r="10" fill="currentColor" />
    <path d="M12 11v5M12 7.6v.01" stroke="#fff" strokeWidth={2.4} strokeLinecap="round" fill="none" />
  </svg>
);
