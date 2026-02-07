"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabase";

export default function PassportSearchPage() {
  const [passportNumber, setPassportNumber] = useState("");
  const [isErrorState, setIsErrorState] = useState(false);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!passportNumber.trim()) return;

    setLoading(true);
    try {
      const { data, error } = await supabase
        .from("applicants")
        .select("id")
        .eq("passport_number", passportNumber.trim().toUpperCase())
        .single();

      if (error || !data) {
        setIsErrorState(true);
      } else {
        router.push(`/preview?id=${data.id}`);
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (err) {
      setIsErrorState(true);
    } finally {
      setLoading(false);
    }
  };

  // View 2: "We can't open this file" (Triggered by Cancel or Error)
  if (isErrorState) {
    return (
      <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 font-sans">
        <div className="w-full max-w-110 bg-[#333333] rounded-sm shadow-2xl p-10 border border-white/5">
          <h1 className="text-white text-[22px] font-semibold mb-2">
            We can&apos;t open this file
          </h1>
          <p className="text-gray-300 text-sm mb-8">
            Something went wrong.
          </p>
          <div className="flex justify-end">
            <button
              onClick={() => {
                setIsErrorState(false);
                setPassportNumber("");
              }}
              className="bg-[#0078d4] hover:bg-[#106ebe] text-white py-2 px-10 text-sm font-medium transition-colors"
            >
              Refresh
            </button>
          </div>
        </div>
      </div>
    );
  }

  // View 1: "Enter a password" (Search State)
  return (
    <div className="min-h-screen bg-[#1a1a1a] flex items-center justify-center p-4 font-sans">
      <div className="w-full max-w-120 bg-[#333333] rounded-sm shadow-2xl p-8 border border-white/5">
        <h1 className="text-white text-xl font-semibold mb-4">
          Enter a passport number
        </h1>
        
        <p className="text-gray-300 text-[13px] leading-relaxed mb-6">
          This file is password protected. Please enter a passport number to open the file.
        </p>

        <form onSubmit={handleSearch} className="space-y-6">
          <input
            type="text"
            value={passportNumber}
            onChange={(e) => setPassportNumber(e.target.value)}
            autoFocus
            className="w-full bg-[#3d3d3d] border border-[#555555] text-white px-3 py-1.5 outline-none focus:border-[#0078d4] transition-colors text-base"
          />

          <div className="flex gap-2 pt-2">
            <button
              type="submit"
              disabled={loading || !passportNumber}
              className="flex-1 bg-[#2c5270] hover:bg-[#366385] text-white py-1.5 text-sm font-medium transition-colors disabled:opacity-50"
            >
              {loading ? "Opening..." : "Open file"}
            </button>
            <button
              type="button"
              onClick={() => setIsErrorState(true)}
              className="flex-1 bg-[#4d4d4d] hover:bg-[#5a5a5a] text-white py-1.5 text-sm font-medium transition-colors"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}