"use client";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState, type ReactNode } from "react";
import { IconScan } from "@/components/icons";
import { IconAlertMer, IconBluetoothOffMer, IconCheckMer, IconCrossMer, IconRefreshMer, IconWalletMer } from "@/components/iconsMer";
import { BackHeader, LoadingScreen } from "@/components/ui";
import { fmtFullDate, fmtTime } from "@/lib/format";
import { actions } from "@/lib/store";
import { clearScanResultMer, reconnectScanMer, useScanResultMer } from "@/utils/scanFlow";
import { fmtTokenMer, type ScanResultMer } from "@/utils/token";

const timeMer = (isoMer: string) => `${fmtTime(isoMer)} น.`;
const dateTimeMer = (isoMer: string) => `${fmtFullDate(isoMer)} · ${timeMer(isoMer)}`;

/** วงกลมไอคอนใหญ่ (วงนอกจาง + วงในเข้มขึ้น) */
function BadgeMer({ outerMer, innerMer, children }: { outerMer: string; innerMer: string; children: ReactNode }) {
  return (
    <span className={`grid h-[84px] w-[84px] place-items-center rounded-full ${outerMer}`}>
      <span className={`grid h-14 w-14 place-items-center rounded-full ${innerMer}`}>{children}</span>
    </span>
  );
}

type StepStateMer = "done" | "fail" | "idle";
function StepMer({ stateMer, titleMer, subMer, lastMer }: { stateMer: StepStateMer; titleMer: string; subMer: string; lastMer?: boolean }) {
  const dotMer = stateMer === "done" ? "bg-mintink text-white"
    : stateMer === "fail" ? "bg-roseink text-white ring-4 ring-rose/20"
    : "border-2 border-line bg-white";
  return (
    <li className="flex gap-3">
      <div className="flex flex-col items-center">
        <span className={`grid h-6 w-6 shrink-0 place-items-center rounded-full ${dotMer}`}>
          {stateMer === "done" && <IconCheckMer size={14} />}
          {stateMer === "fail" && <IconCrossMer size={14} />}
        </span>
        {!lastMer && <span className={`my-0.5 w-0.5 flex-1 ${stateMer === "done" ? "bg-mintink" : "bg-line"}`} />}
      </div>
      <div className={lastMer ? "" : "pb-3.5"}>
        <p className={`text-sm font-bold leading-6 ${stateMer === "idle" ? "text-muted" : ""}`}>{titleMer}</p>
        <p className={`text-xs ${stateMer === "fail" ? "text-roseink" : "text-muted"}`}>{subMer}</p>
      </div>
    </li>
  );
}

function RowMer({ labelMer, valueMer }: { labelMer: string; valueMer: string }) {
  return (
    <div className="flex justify-between gap-4 py-1.5 text-sm">
      <dt className="shrink-0 text-muted">{labelMer}</dt>
      <dd className="text-right font-bold">{valueMer}</dd>
    </div>
  );
}

const cardMer = "rounded-3xl border border-line bg-white p-4";

function DetailMer({ resultMer }: { resultMer: ScanResultMer }) {
  const itemMer = `${resultMer.productName} × ${resultMer.qty} ชิ้น`;
  const okMer = resultMer.kind === "success";
  return (
    <section className={cardMer}>
      <h2 className="font-bold">รายละเอียดรายการ</h2>
      <dl className="mt-2">
        {okMer
          ? <RowMer labelMer="เลขที่รายการ" valueMer={resultMer.refNo ?? "-"} />
          : <RowMer labelMer="ยอดที่ต้องชำระ" valueMer={fmtTokenMer(resultMer.total, resultMer.symbol)} />}
        <RowMer labelMer="รายการ" valueMer={itemMer} />
        <RowMer labelMer="ลูกค้า" valueMer={resultMer.customerName} />
        <RowMer labelMer={okMer ? "ชำระเมื่อ" : "ตรวจสอบเมื่อ"} valueMer={dateTimeMer(resultMer.checkedAt)} />
        {okMer && <RowMer labelMer="ช่องทาง" valueMer={resultMer.channel} />}
      </dl>
    </section>
  );
}

/** แถบปุ่มด้านล่างของหน้า (ติดขอบจอ) */
function FooterMer({ children, hintMer }: { children: ReactNode; hintMer?: string }) {
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 mx-auto w-full max-w-[430px] border-t border-line bg-canvas px-5 pb-[max(1rem,env(safe-area-inset-bottom))] pt-4">
      {children}
      {hintMer && <p className="mt-3 text-center text-xs text-muted">{hintMer}</p>}
    </div>
  );
}

const primaryBtnMer = "flex flex-1 items-center justify-center gap-2 rounded-2xl bg-ink py-4 text-sm font-bold text-white transition active:scale-[0.98] disabled:opacity-60";

export default function ScanResultPageMer() {
  const resultMer = useScanResultMer();
  const routerMer = useRouter();
  const [connectingMer, setConnectingMer] = useState(false);
  const timerMer = useRef<ReturnType<typeof setTimeout>>();
  useEffect(() => () => clearTimeout(timerMer.current), []);

  if (resultMer === undefined) return <LoadingScreen />;
  if (resultMer === null) {
    return (
      <main className="min-h-dvh">
        <BackHeader title="ผลการรับชำระ" fallbackHref="/scanner" />
        <div className="px-5 pt-16 text-center">
          <p className="font-bold">ยังไม่มีผลการรับชำระ</p>
          <p className="mt-1 text-sm text-muted">กลับไปสแกนรายการใหม่ที่หน้า Scanner</p>
          <Link href="/scanner" className="mt-6 inline-block rounded-2xl bg-ink px-6 py-3.5 text-sm font-bold text-white">ไปหน้า Scanner</Link>
        </div>
      </main>
    );
  }

  const amountMer = fmtTokenMer(resultMer.total, resultMer.symbol);
  const newScanMer = () => { clearScanResultMer(); routerMer.push("/scanner"); };
  const cancelMer = () => { actions.setQty(1); newScanMer(); };
  const reconnectMer = () => {
    setConnectingMer(true);
    timerMer.current = setTimeout(() => { reconnectScanMer(); setConnectingMer(false); }, 1600); // จำลองเวลาเชื่อมต่อ
  };

  // ───────── Scanner หลุดการเชื่อมต่อ ─────────
  if (resultMer.kind === "disconnected") {
    return (
      <main className="min-h-dvh pb-52">
        <BackHeader title="ผลการรับชำระ" fallbackHref="/scanner" />
        <div className="space-y-3 px-5 pt-4">
          <section className="flex items-center gap-3 rounded-3xl border border-line bg-white p-3">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-full bg-rose/15 text-roseink"><IconScan size={22} /></span>
            <div className="min-w-0 flex-1">
              <p className="font-bold">{resultMer.channel}</p>
              <p className="text-xs text-muted">ขาดการเชื่อมต่อ Bluetooth</p>
            </div>
            <span className="shrink-0 rounded-full bg-rose/20 px-3 py-1 text-xs font-bold text-roseink">หลุดการเชื่อมต่อ</span>
          </section>

          <section className={`${cardMer} flex flex-col items-center py-6 text-center`}>
            <BadgeMer outerMer="bg-rose/15" innerMer="bg-rose/30 text-roseink"><IconBluetoothOffMer size={26} /></BadgeMer>
            <h2 className="mt-4 text-lg font-bold text-roseink">Scanner หลุดการเชื่อมต่อ</h2>
            <p className="mt-1 text-sm text-muted">ยังไม่ทราบผลชำระของรายการนี้</p>
            <p className="mt-2 text-[36px] font-extrabold leading-none">{amountMer}</p>
            <p className="mt-2 text-xs text-muted">{resultMer.productName} × {resultMer.qty} ชิ้น · {fmtTokenMer(resultMer.unitPrice, resultMer.symbol)} ต่อชิ้น</p>
          </section>

          <p role="alert" className="flex items-center gap-3 rounded-2xl border border-roseink/60 bg-rose/10 px-4 py-3 text-sm font-semibold">
            <span className="shrink-0 text-roseink"><IconAlertMer size={20} /></span>
            ห้ามส่งมอบสินค้า จนกว่าจะยืนยันผลชำระได้
          </p>

          <section className={cardMer}>
            <h2 className="font-bold">ลองแก้ไขเบื้องต้น</h2>
            <ol className="mt-3 space-y-3 text-sm">
              {["เปิดเครื่อง Scanner และตรวจสอบแบตเตอรี่", "เปิด Bluetooth บนมือถือ", "ถือเครื่องให้อยู่ใกล้มือถือ (ไม่เกิน 10 ม.)"].map((tipMer, idxMer) => (
                <li key={tipMer} className="flex items-center gap-3">
                  <span className="grid h-6 w-6 shrink-0 place-items-center rounded-full bg-brand/15 text-xs font-bold text-brand">{idxMer + 1}</span>{tipMer}
                </li>
              ))}
            </ol>
          </section>
        </div>
        <FooterMer hintMer="เมื่อเชื่อมต่อได้ ระบบจะตรวจสอบผลรายการนี้อัตโนมัติ">
          <button type="button" onClick={reconnectMer} disabled={connectingMer} className={`${primaryBtnMer} w-full`}>
            <span className={connectingMer ? "animate-spin" : ""}><IconRefreshMer size={20} /></span>
            {connectingMer ? "กำลังเชื่อมต่อ…" : "เชื่อมต่อ Scanner ใหม่"}
          </button>
        </FooterMer>
      </main>
    );
  }

  // ───────── ชำระสำเร็จ / Token ลูกค้าไม่พอ ─────────
  const okMer = resultMer.kind === "success";
  return (
    <main className="min-h-dvh pb-52">
      <BackHeader title="ผลการรับชำระ" fallbackHref="/scanner" />
      <div className="space-y-3 px-5 pt-4">
        <section className={`${cardMer} flex flex-col items-center py-6 text-center`}>
          {okMer ? (
            <>
              <BadgeMer outerMer="bg-mint/20" innerMer="bg-mint/40 text-mintink"><IconCheckMer size={26} /></BadgeMer>
              <h2 className="mt-4 text-lg font-bold text-mintink">ชำระสำเร็จ</h2>
              <p className="mt-1 text-sm text-muted">รับ Token จากลูกค้าเรียบร้อยแล้ว</p>
              <p className="mt-2 text-[36px] font-extrabold leading-none">+{amountMer}</p>
            </>
          ) : (
            <>
              <BadgeMer outerMer="bg-sun/25" innerMer="bg-sun/50 text-amberink"><IconWalletMer size={26} /></BadgeMer>
              <h2 className="mt-4 text-lg font-bold text-amberink">Token ลูกค้าไม่พอ</h2>
              <p className="mt-1 text-sm text-muted">ยังไม่มีการหัก Token จากลูกค้า</p>
              <p className="mt-2 text-[36px] font-extrabold leading-none">{amountMer}</p>
            </>
          )}
        </section>

        <section className={cardMer}>
          <ol>
            <StepMer stateMer="done" titleMer="ส่งยอดไปที่เครื่องแล้ว" subMer={timeMer(resultMer.sentAt)} />
            {okMer ? (
              <>
                <StepMer stateMer="done" titleMer="ลูกค้าสแกนที่เครื่องแล้ว" subMer={timeMer(resultMer.scannedAt ?? resultMer.checkedAt)} />
                <StepMer stateMer="done" titleMer="ชำระสำเร็จ" subMer={`${timeMer(resultMer.checkedAt)} · บันทึกรายการอัตโนมัติ`} lastMer />
              </>
            ) : (
              <>
                <StepMer stateMer="fail" titleMer="ตรวจสอบ Token ลูกค้า" subMer={`${timeMer(resultMer.checkedAt)} · ยอดคงเหลือไม่เพียงพอ`} />
                <StepMer stateMer="idle" titleMer="ชำระสำเร็จ" subMer="ยังไม่ได้ทำรายการ" lastMer />
              </>
            )}
          </ol>
        </section>

        <DetailMer resultMer={resultMer} />
      </div>

      {okMer ? (
        <FooterMer>
          <button type="button" onClick={newScanMer} className={`${primaryBtnMer} w-full`}><IconScan size={20} />รับชำระรายการใหม่</button>
          <Link href="/dashboard/detail" className="mt-3 block text-center text-sm font-bold text-brand">ดูรายการนี้ในรายงานธุรกรรม</Link>
        </FooterMer>
      ) : (
        <FooterMer hintMer="ให้ลูกค้าเติม Token ก่อน แล้วสแกนอีกครั้ง">
          <div className="flex gap-3">
            <button type="button" onClick={cancelMer} className="rounded-2xl border border-line bg-white px-5 py-4 text-sm font-bold transition active:scale-95">ยกเลิกรายการ</button>
            <button type="button" onClick={newScanMer} className={primaryBtnMer}>ให้ลูกค้าสแกนอีกครั้ง</button>
          </div>
        </FooterMer>
      )}
    </main>
  );
}
