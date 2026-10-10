"use client";
import Image from "next/image";

import { useState } from "react";
import { useRouter } from "next/navigation";

const inputCls =
  "w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900 focus:border-slate-500 focus:ring-2 focus:ring-slate-300 focus:outline-none";

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<"login" | "register">("login");
  const [error, setError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSaving(true);

    const endpoint = mode === "login" ? "/api/auth/login" : "/api/auth/register";
    const body = mode === "login" ? { email, password } : { name, email, password };

    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });

    setSaving(false);
    if (res.ok) {
      router.push("/");
      router.refresh();
    } else {
      const data = await res.json().catch(() => null);
      setError(data?.error ?? "Something went wrong. Please try again.");
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-sm">
        <div className="mb-6 text-center">
          <Image src="/logo.png" alt="AXS Modern" className="mx-auto h-10 w-auto" />
          <h1 className="mt-3 text-xl font-semibold text-slate-900">TaskFlow</h1>
          <p className="mt-1 text-sm text-slate-500">
            {mode === "login" ? "Log in to continue" : "Create the first account"}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4 rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
          {mode === "register" && (
            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Full name</label>
              <input value={name} onChange={(e) => setName(e.target.value)} required placeholder="e.g. John Brooks" className={inputCls} />
            </div>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Email</label>
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required placeholder="you@company.com" className={inputCls} />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
              placeholder="At least 6 characters"
              className={inputCls}
            />
          </div>

          {error && <p className="text-sm font-medium text-red-600">{error}</p>}

          <button
            type="submit"
            disabled={saving}
            className="w-full rounded-md bg-slate-900 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-slate-700 disabled:opacity-50"
          >
            {saving ? "Please wait…" : mode === "login" ? "Log in" : "Create account"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          {mode === "login" ? (
            <>
              First time here?{" "}
              <button onClick={() => { setMode("register"); setError(null); }} className="font-medium text-slate-800 hover:underline">
                Create the first account
              </button>
            </>
          ) : (
            <>
              Already set up?{" "}
              <button onClick={() => { setMode("login"); setError(null); }} className="font-medium text-slate-800 hover:underline">
                Log in instead
              </button>
            </>
          )}
        </p>
        {mode === "register" && (
          <p className="mt-3 text-center text-xs text-slate-400">
            The first account becomes the admin. New team members are added later from the Team page.
          </p>
        )}
      </div>
    </main>
  );
}
