"use client";
import { useEffect } from "react";
import { actions } from "@/lib/store";

/** Mount once in the root layout: pulls config from Super Admin on load, every minute, and when the app returns to the foreground. */
export default function ConfigSync({ intervalMs = 60_000 }: { intervalMs?: number }) {
  useEffect(() => {
    const run = () => void actions.refreshConfig();
    const onVisible = () => { if (document.visibilityState === "visible") run(); };
    run();
    const id = setInterval(run, intervalMs);
    document.addEventListener("visibilitychange", onVisible);
    return () => { clearInterval(id); document.removeEventListener("visibilitychange", onVisible); };
  }, [intervalMs]);
  return null;
}
