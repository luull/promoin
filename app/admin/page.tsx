"use client";

import dynamic from "next/dynamic";
import { LoaderCircle } from "lucide-react";

// Sesi admin disimpan di localStorage, jadi halaman ini hanya dirender di browser.
const AdminApp = dynamic(
  () => import("./_components/AdminApp").then((m) => m.AdminApp),
  {
    ssr: false,
    loading: () => (
      <main className="grid min-h-screen place-items-center bg-screen">
        <LoaderCircle className="animate-spin text-primary-strong" size={28} />
      </main>
    ),
  },
);

export default function AdminPage() {
  return <AdminApp />;
}
