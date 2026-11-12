"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { clearCredential } from "@/lib/credential";
import { IconLogout } from "./icons";

export default function LogoutButton({
  className = "",
  labelClassName = "sr-only",
}: {
  className?: string;
  labelClassName?: string;
}) {
  const router = useRouter();
  const [error, setError] = useState("");

  const logout = () => {
    setError("");
    try {
      clearCredential();
      router.replace("/");
      router.refresh();
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      setError(`ออกจากระบบไม่สำเร็จ: ${error.message}`);
    }
  };

  return (
    <>
      <button type="button" onClick={logout} aria-label="ออกจากระบบ" title="ออกจากระบบ" className={className}>
        <IconLogout />
        <span className={labelClassName}>ออกจากระบบ</span>
      </button>
      {error && (
        <p role="alert" className="fixed bottom-20 left-4 right-4 z-50 rounded-xl bg-roseink px-4 py-3 text-center text-sm font-semibold text-white">
          {error}
        </p>
      )}
    </>
  );
}
