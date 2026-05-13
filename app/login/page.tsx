"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { KeyRound, ShieldCheck, UserRound } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [pin, setPin] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, pin }),
      });

      const payload = (await response.json().catch(() => null)) as
        | { error?: string }
        | null;

      if (!response.ok) {
        throw new Error(payload?.error ?? "Request failed.");
      }

      router.push("/");
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-100 flex items-center justify-center px-4 py-10">
      <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white shadow-lg p-7 sm:p-8">
        <div className="flex flex-col items-center text-center">
          <div className="inline-flex items-center justify-center w-11 h-11 rounded-xl bg-blue-50 text-blue-600 mb-4">
            <ShieldCheck className="h-5 w-5" />
          </div>
          <h1 className="text-xl font-semibold text-slate-900">ETAS Login</h1>
          <p className="mt-1 text-sm text-slate-500">
            Sign in with your username and PIN.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-6 space-y-4">
          <label className="block text-sm font-medium text-slate-700">
            Username
            <div className="relative mt-1.5">
              <UserRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                placeholder="Username"
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                required
              />
            </div>
          </label>

          <label className="block text-sm font-medium text-slate-700">
            PIN
            <div className="relative mt-1.5">
              <KeyRound className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <input
                value={pin}
                onChange={(event) => setPin(event.target.value)}
                placeholder="PIN"
                type="password"
                className="w-full rounded-xl border border-slate-300 pl-9 pr-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                required
              />
            </div>
          </label>

          {error && (
            <p className="text-sm text-red-700 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {error}
            </p>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-xl bg-slate-900 text-white py-2.5 font-medium hover:bg-slate-800 disabled:opacity-60 transition-colors"
          >
            {loading ? "Signing in..." : "Login"}
          </button>
        </form>
      </div>
    </main>
  );
}