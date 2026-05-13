"use client";

import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import { FilePlus, ListChecks, Search, ShieldCheck } from "lucide-react";

type CurrentUser = {
  id: string;
  username: string;
  role: string;
};

export default function HomePage() {
  const router = useRouter();
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [query, setQuery] = useState("");

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
      description: "Start a new eTAS application for your upcoming visit to Somalia.",
      icon: FilePlus,
      iconClass: "bg-blue-600",
    },
    {
      href: "/visas",
      title: "Existing Visas",
      description: "Browse current visas and use quick edit/view actions.",
      icon: ListChecks,
      iconClass: "bg-emerald-700",
    },
    {
      href: "/verify",
      title: "Check Application",
      description: "View your travel document or track progress using your passport number.",
      icon: Search,
      iconClass: "bg-slate-800",
    },
  ];

  const normalizedQuery = query.trim().toLowerCase();
  const filteredCards = actionCards.filter((card) => {
    if (!normalizedQuery) return true;
    return (
      card.title.toLowerCase().includes(normalizedQuery) ||
      card.description.toLowerCase().includes(normalizedQuery)
    );
  });

  return (
    <main className="min-h-screen w-full flex flex-col bg-slate-50 font-sans">
      {/* Navigation Header */}
      <nav className="w-full px-8 py-4 bg-white border-b flex justify-between items-center shadow-sm">
        <div className="flex items-center gap-3">
          <Image src="/logo.svg" alt="FGS Logo" width={50} height={50} />
          <div>
            <h1 className="text-[14px] font-bold text-slate-900 leading-tight">
              JAMHUURIYADDA FEDERAALKA SOOMAALIYA
            </h1>
            <p className="text-[12px] text-slate-500 font-medium">
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
      <section className="flex-1 flex flex-col items-center justify-center px-4 text-center">
        <div className="mb-8 p-4 bg-blue-50 rounded-full">
          <ShieldCheck className="w-12 h-12 text-blue-600" />
        </div>
        
        <h2 className="text-4xl md:text-5xl font-extrabold text-slate-900 mb-4 tracking-tight">
          Electronic Travel Authorization <span className="text-blue-600">(eTAS)</span>
        </h2>
        <p className="text-lg text-slate-600 max-w-2xl mb-12 leading-relaxed">
          Welcome to the official portal for the Federal Republic of Somalia. 
          Apply for your travel authorization online or track your current status in seconds.
        </p>

        <div className="w-full max-w-2xl mb-8">
          <div className="relative">
            <Search className="absolute left-3 top-3.5 h-4 w-4 text-slate-400" />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Quick search actions (e.g. new, visa, check)"
              className="w-full rounded-xl border border-slate-300 bg-white pl-9 pr-3 py-2.5 text-slate-900 outline-none focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
            />
          </div>
        </div>

        {/* Action Cards */}
        <div className="grid md:grid-cols-3 gap-8 w-full max-w-5xl">
          {filteredCards.map((card) => {
            const Icon = card.icon;
            return (
              <Link
                key={card.href}
                href={card.href}
                className="group flex flex-col items-center p-10 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-300"
              >
                <div className={`mb-6 p-4 ${card.iconClass} rounded-xl text-white group-hover:scale-110 transition-transform`}>
                  <Icon size={32} />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 mb-2">{card.title}</h3>
                <p className="text-slate-500 text-center">{card.description}</p>
              </Link>
            );
          })}
        </div>
        {filteredCards.length === 0 && (
          <p className="mt-6 text-sm text-slate-500">No actions matched your search.</p>
        )}
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