"use client";

import { useSearchParams } from "next/navigation";

export default function VerificationPage() {
     const params = useSearchParams();
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center">
      <div className="bg-[#4189dd]   text-center p-14">
        
        <h1 className="text-black text-2xl  font-serif font-semibold leading-snug">
          You will require your Passport Number to open the
          <br />
          Verification PDF
        </h1>

        <a
          href={`verify/${params.get("etas") ?? "1"}`}
          className="block text-2xl text-purple-900 font-serif font-bold underline"
        >
          CLICK HERE TO PROCEED
        </a>

      </div>
    </div>
  );
}