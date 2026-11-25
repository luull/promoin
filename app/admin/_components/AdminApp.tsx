"use client";

import { useCallback, useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";
import {
  AdminAuthError,
  AdminSession,
  adminLogout,
  adminMe,
  clearAdminSession,
  loadAdminSession,
  saveAdminSession,
} from "../../lib/admin";
import { AdminDashboard } from "./AdminDashboard";
import { AdminLogin } from "./AdminLogin";

export function AdminApp() {
  const [session, setSession] = useState<AdminSession | null>(() =>
    loadAdminSession(),
  );
  const [verified, setVerified] = useState(false);
  const [notice, setNotice] = useState("");

  const handleExpired = useCallback(() => {
    clearAdminSession();
    setSession(null);
    setVerified(false);
    setNotice("Sesi admin berakhir. Silakan login lagi.");
  }, []);

  // Pastikan token tersimpan masih berlaku sebelum dashboard dimuat.
  useEffect(() => {
    if (!session || verified) return;

    let cancelled = false;

    adminMe(session.token)
      .then((me) => {
        if (cancelled) return;
        if (!me) {
          handleExpired();
          return;
        }
        setVerified(true);
      })
      .catch((error) => {
        if (cancelled) return;
        if (error instanceof AdminAuthError) {
          handleExpired();
          return;
        }
        // Gangguan jaringan: tetap buka dashboard, error tampil di sana.
        setVerified(true);
      });

    return () => {
      cancelled = true;
    };
  }, [session, verified, handleExpired]);

  const handleLogin = (next: AdminSession) => {
    saveAdminSession(next);
    setNotice("");
    setSession(next);
    setVerified(true);
  };

  const handleLogout = () => {
    const token = session?.token;
    clearAdminSession();
    setSession(null);
    setVerified(false);
    setNotice("");
    if (token) adminLogout(token).catch(() => undefined);
  };

  if (!session) {
    return <AdminLogin notice={notice} onLogin={handleLogin} />;
  }

  if (!verified) {
    return (
      <main className="grid min-h-screen place-items-center bg-screen">
        <LoaderCircle className="animate-spin text-primary-strong" size={28} />
      </main>
    );
  }

  return (
    <AdminDashboard
      session={session}
      onLogout={handleLogout}
      onSessionExpired={handleExpired}
    />
  );
}
