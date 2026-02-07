"use client";

import Image from "next/image";
import Link from "next/link";
import { FilePlus, Search, ShieldCheck } from "lucide-react";

export default function HomePage() {
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
        <div className="hidden md:flex gap-6 text-sm font-semibold text-slate-600">
          <Link href="/contact" className="hover:text-blue-600">Contact Support</Link>
          <Link href="/guidelines" className="hover:text-blue-600">Guidelines</Link>
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

        {/* Action Cards */}
        <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Apply Card */}
          <Link 
            href="/apply" 
            className="group flex flex-col items-center p-10 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="mb-6 p-4 bg-blue-600 rounded-xl text-white group-hover:scale-110 transition-transform">
              <FilePlus size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">New Application</h3>
            <p className="text-slate-500 text-center">
              Start a new eTAS application for your upcoming visit to Somalia.
            </p>
          </Link>

          {/* Check Status Card */}
          <Link 
            href="/verify" 
            className="group flex flex-col items-center p-10 bg-white rounded-2xl shadow-md border-2 border-transparent hover:border-blue-500 hover:shadow-xl transition-all duration-300"
          >
            <div className="mb-6 p-4 bg-slate-800 rounded-xl text-white group-hover:scale-110 transition-transform">
              <Search size={32} />
            </div>
            <h3 className="text-2xl font-bold text-slate-900 mb-2">Check Application</h3>
            <p className="text-slate-500 text-center">
              View your travel document or track progress using your passport number.
            </p>
          </Link>
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