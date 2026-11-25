"use client";

import { FormEvent, useState } from "react";
import { Eye, EyeOff, LoaderCircle, LockKeyhole } from "lucide-react";
import { AdminSession, adminLogin } from "../../lib/admin";

export function AdminLogin({
  notice,
  onLogin,
}: {
  notice?: string;
  onLogin: (session: AdminSession) => void;
}) {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    if (!username.trim() || !password) {
      setError("Isi username dan password.");
      return;
    }

    setError("");
    setSubmitting(true);

    try {
      onLogin(await adminLogin(username, password));
    } catch (loginError) {
      setError(
        loginError instanceof Error
          ? loginError.message
          : "Login gagal. Coba lagi.",
      );
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-screen px-4 py-10">
      <div className="w-full max-w-sm">
        <div className="relative overflow-hidden rounded-[28px] bg-primary px-6 pb-12 pt-7">
          <div
            className="absolute -right-10 -top-12 size-40 rounded-full border-[18px] border-white/25"
            aria-hidden="true"
          />
          <span className="relative grid size-12 place-items-center rounded-full bg-ink text-white">
            <LockKeyhole size={20} strokeWidth={1.8} />
          </span>
          <h1 className="relative mt-4 text-xl font-bold tracking-[-0.02em] text-on-primary">
            Admin Promoin
          </h1>
          <p className="relative mt-1 text-sm leading-5 text-ink/70">
            Atur brand, diskon, dan pantau penjualan.
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="relative -mt-6 space-y-4 rounded-[28px] bg-surface p-5 shadow-float"
          noValidate
        >
          {notice && !error && (
            <p className="rounded-2xl bg-primary-light px-4 py-2.5 text-xs leading-5 text-primary-strong">
              {notice}
            </p>
          )}

          <div>
            <label
              htmlFor="admin-username"
              className="mb-2 block text-xs font-medium text-secondary"
            >
              Username
            </label>
            <input
              id="admin-username"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              autoComplete="username"
              autoCapitalize="none"
              spellCheck={false}
              className="h-12 w-full rounded-full border border-border-subtle bg-surface px-5 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/20"
              placeholder="admin"
            />
          </div>

          <div>
            <label
              htmlFor="admin-password"
              className="mb-2 block text-xs font-medium text-secondary"
            >
              Password
            </label>
            <div className="relative">
              <input
                id="admin-password"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                autoComplete="current-password"
                className="h-12 w-full rounded-full border border-border-subtle bg-surface pl-5 pr-12 text-sm text-ink outline-none transition placeholder:text-muted focus:border-primary focus:ring-4 focus:ring-primary/20"
                placeholder="••••••••"
              />
              <button
                type="button"
                onClick={() => setShowPassword((value) => !value)}
                className="absolute right-2 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-full text-secondary transition hover:bg-surface-alt focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
                aria-label={
                  showPassword ? "Sembunyikan password" : "Tampilkan password"
                }
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {error && (
            <p
              role="alert"
              className="rounded-2xl bg-red-50 px-4 py-2.5 text-xs leading-5 text-red-600"
            >
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-full bg-primary text-sm font-bold text-on-primary shadow-primary transition hover:bg-primary-dark focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ink focus-visible:ring-offset-2 disabled:cursor-wait disabled:opacity-80"
          >
            {submitting && (
              <LoaderCircle size={18} className="animate-spin" />
            )}
            {submitting ? "Memeriksa..." : "Masuk"}
          </button>
        </form>
      </div>
    </main>
  );
}
