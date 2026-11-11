/** กรอบกล้องสแกน QR ตามดีไซน์ — ตอนต่อกล้องจริงให้ใส่ <video> ไว้ใต้ overlay นี้ */
export default function ScanFrameMer({ hintMer = "จัด QR ของลูกค้าให้อยู่ในกรอบ" }: { hintMer?: string }) {
  const cornerMer = "absolute h-9 w-9 border-mint";
  const finderMer = "absolute grid h-[26px] w-[26px] place-items-center rounded-[7px] border-2 border-white/30";
  return (
    <div className="relative aspect-square w-full overflow-hidden rounded-2xl bg-gradient-to-br from-[#2b2266] via-[#201a4f] to-[#15122e]" role="img" aria-label="กล้องสแกน QR ของลูกค้า">
      <span className="absolute left-2.5 top-2.5 h-2.5 w-2.5 rounded-full bg-rose" aria-hidden />
      <span className="pointer-events-none absolute -right-10 -top-12 h-44 w-44 rounded-full bg-white/[0.05]" aria-hidden />

      <div className="absolute left-1/2 top-[19%] aspect-square w-[62%] -translate-x-1/2">
        <span className={`${cornerMer} left-0 top-0 rounded-tl-2xl border-l-4 border-t-4`} />
        <span className={`${cornerMer} right-0 top-0 rounded-tr-2xl border-r-4 border-t-4`} />
        <span className={`${cornerMer} bottom-0 left-0 rounded-bl-2xl border-b-4 border-l-4`} />
        <span className={`${cornerMer} bottom-0 right-0 rounded-br-2xl border-b-4 border-r-4`} />

        <span className={`${finderMer} left-[16%] top-[16%]`}><i className="h-2.5 w-2.5 rounded-[3px] bg-white/40" /></span>
        <span className={`${finderMer} right-[16%] top-[16%]`}><i className="h-2.5 w-2.5 rounded-[3px] bg-white/40" /></span>
        <span className={`${finderMer} bottom-[16%] left-[16%]`}><i className="h-2.5 w-2.5 rounded-[3px] bg-white/40" /></span>

        <div className="absolute left-1/2 top-1/2 -mt-3.5 h-7 w-[78%] -translate-x-1/2">
          <div className="animate-scan-sweep-mer relative h-full w-full bg-mint/10">
            <span className="absolute inset-x-0 top-1/2 h-0.5 -translate-y-1/2 bg-mint shadow-[0_0_10px_2px_rgba(79,209,181,0.6)]" />
          </div>
        </div>
      </div>

      <p className="absolute inset-x-0 bottom-3 text-center text-xs text-white/60">{hintMer}</p>
    </div>
  );
}
