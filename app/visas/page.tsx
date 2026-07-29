"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Eye, Pencil } from "lucide-react";
import { ApplicantRecord } from "@/lib/applicants";
import { fetchApplicants } from "@/lib/applicants-client";

type CurrentUser = {
  id: string;
  username: string;
  role: string;
};

export default function VisasPage() {
  const router = useRouter();
  const [items, setItems] = useState<ApplicantRecord[]>([]);
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [passportSearch, setPassportSearch] = useState("");

  useEffect(() => {
    const load = async () => {
      try {
        const [applicants, meResponse] = await Promise.all([
          fetchApplicants(),
          fetch("/api/auth/me", { cache: "no-store" }),
        ]);

        if (!meResponse.ok) {
          throw new Error("Failed to load current user.");
        }

        const mePayload = (await meResponse.json()) as { data: CurrentUser };
        setUser(mePayload.data);
        setItems(applicants);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to load visas.");
      } finally {
        setLoading(false);
      }
    };

    load();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const filteredItems = items.filter((item) =>
    item.passport_number
      ?.toLowerCase()
      .includes(passportSearch.trim().toLowerCase())
  );

  return (
    <main className="min-h-screen bg-slate-50 px-4 py-8 md:px-8">
      <header className="bg-white border rounded-xl px-5 py-4 flex flex-col gap-3 md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900">Existing Visas</h1>
          <p className="text-sm text-slate-500 mt-1">
            {user
              ? `Logged in as ${user.username} (${user.role})`
              : "Loading user..."}
          </p>
        </div>

        <div className="flex gap-2">
          <Link
            href="/"
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Home
          </Link>
          <Link
            href="/apply"
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700"
          >
            New Visa
          </Link>
          <button
            onClick={handleLogout}
            className="px-4 py-2 rounded-lg border border-slate-300 text-slate-700 hover:bg-slate-100"
          >
            Logout
          </button>
        </div>
      </header>

      {loading && (
        <div className="bg-white border rounded-xl px-5 py-8 text-slate-500">
          Loading visas...
        </div>
      )}

      {!loading && error && (
        <div className="bg-red-50 border border-red-200 text-red-700 rounded-xl px-5 py-4">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="bg-white border rounded-xl">
          <div className="px-5 py-4 border-b">
            <input
              type="text"
              value={passportSearch}
              onChange={(e) => setPassportSearch(e.target.value)}
              placeholder="Search by passport number..."
              className="w-full md:w-80 px-3 py-2 rounded-lg border border-slate-300 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="bg-slate-100 text-slate-700">
              <tr>
                <th className="text-left px-4 py-3">ETAS</th>
                <th className="text-left px-4 py-3">Name</th>
                <th className="text-left px-4 py-3">Passport</th>
                <th className="text-left px-4 py-3">Nationality</th>
                <th className="text-left px-4 py-3">Created By</th>
                <th className="text-left px-4 py-3">Last Updated By</th>
                <th className="text-left px-4 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredItems.map((item) => (
                <tr key={item.id} className="border-t">
                  <td className="px-4 py-3 font-medium text-slate-800">{item.etas_number}</td>
                  <td className="px-4 py-3">{item.given_name} {item.surname}</td>
                  <td className="px-4 py-3">{item.passport_number}</td>
                  <td className="px-4 py-3">{item.nationality}</td>
                  <td className="px-4 py-3">{item.created_by_username || "-"}</td>
                  <td className="px-4 py-3">{item.user_updated || "-"}</td>
                  <td className="px-4 py-3">
                    <div className="flex gap-2">
                      <Link
                        href={`/apply?id=${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100"
                      >
                        <Pencil size={14} /> Edit
                      </Link>
                      <Link
                        href={`/preview?id=${item.id}`}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-md bg-slate-800 text-white hover:bg-slate-900"
                      >
                        <Eye size={14} /> View
                      </Link>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredItems.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-slate-500">
                    {items.length === 0
                      ? "No visas found."
                      : "No visas match that passport number."}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </main>
  );
}
