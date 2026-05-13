"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FilePlus, ListChecks, ShieldCheck } from "lucide-react";

type CurrentUser = {
  id: string;
  username: string;
  role: string;
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);

  useEffect(() => {
    const loadUser = async () => {
      const response = await fetch("/api/auth/me", { cache: "no-store" });
      if (!response.ok) return;
      const payload = (await response.json()) as { data: CurrentUser };
      setUser(payload.data);
    };

    loadUser();
  }, []);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  };

  const roleBadgeClass =
    user?.role === "admin"
      ? "bg-red-100 text-red-700 border border-red-200"
      : "bg-slate-100 text-slate-700 border border-slate-200";

  const actionCards = [
    {
      href: "/apply",
      title: "New Application",
      icon: FilePlus,
      iconClass: "bg-blue-600",
    },
    {
      href: "/visas",
      title: "Existing Visas",
      icon: ListChecks,
      iconClass: "bg-emerald-700",
    },
  ];

  return (
    <main className="min-h-screen w-full flex flex-col bg-slate-50 font-sans">
      {/* Navigation Header */}
      <nav className="w-full px-5 md:px-8 py-3.5 bg-white border-b flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="FGS Logo" width={44} height={44} />
          <div>
            <h1 className="text-[13px] md:text-[14px] font-bold text-slate-900 leading-tight">
              JAMHUURIYADDA FEDERAALKA SOOMAALIYA
            </h1>
            <p className="text-[11px] md:text-[12px] text-slate-500 font-medium">
              Immigration and Citizenship Agency
            </p>
          </div>
        </div>
        <div className="hidden md:flex gap-4 text-sm font-semibold text-slate-600 items-center">
          {user ? (
            <div className="flex items-center gap-2">
              <span className="text-slate-600 font-medium">User: {user.username}</span>
              <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${roleBadgeClass}`}>
                {user.role}
              </span>
            </div>
          ) : (
            <div className="text-slate-500 font-medium">Loading user...</div>
          )}
          <Link
            href="/visas"
            className="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 text-slate-700"
          >
            Existing Visas
          </Link>
          <button
            onClick={handleLogout}
            className="px-3 py-1.5 rounded-md border border-slate-300 hover:bg-slate-100 text-slate-700"
          >
            Logout
          </button>
        </div>
      </nav>

      {/* Hero Section - Full Page Content */}
      <section className="flex-1 flex flex-col items-center justify-center px-4 py-10 text-center">
        <div className="mb-5 p-3.5 bg-blue-50 rounded-full">
          <ShieldCheck className="w-10 h-10 text-blue-600" />
        </div>
        
        <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 mb-2 tracking-tight">
          Electronic Travel Authorization <span className="text-blue-600">(eTAS)</span>
        </h2>
        <div className="mb-8" />

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-6 w-full max-w-3xl">
          {actionCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col items-center p-8 md:p-9 bg-white rounded-2xl shadow-md border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all duration-300"
              >
                <div className={`mb-5 p-3.5 ${card.iconClass} rounded-xl text-white group-hover:scale-110 transition-transform`}>
                  <Icon size={26} />
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-slate-900">{card.title}</h3>
              </Link>
            );
          })}
        </div>
      </section>

      {/* Simple Footer */}
      <footer className="w-full py-8 border-t bg-white text-center">
        <div className="flex justify-center gap-8 mb-4">
            <div className="flex items-center gap-2 text-xs font-bold text-slate-400">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span> SYSTEM OPERATIONAL
            </div>
        </div>
        <p className="text-slate-400 text-xs">
          © {new Date().getFullYear()} Federal Republic of Somalia. All Rights Reserved.
        </p>
      </footer>
    </main>
  );
}