"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
  // Note snippet reference:
  //           userPassword: displayData.passport_number,
import { useSearchParams } from "next/navigation";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { supabase } from "@/lib/supabase";
import { ETASDisplayData, ETASPdfTemplate } from "@/components/EtasPdfTemplate";


type ApplicantRecord = {
  id: string;
  given_name: string;
  surname: string;
  date_of_birth: string;
  nationality: string;
  passport_number: string;
  passport_issue_date: string;
  passport_expiry_date: string;
  sex: string;
  visit_purpose: string;
  sponsor: string;
  etas_number: string;
  applicant_photo_url: string;
  created_at: string;
};

export default function VerifyPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <VerificationBox />
    </Suspense>
  );
}

function VerificationBox() {
  const params = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [dbData, setDbData] = useState<ApplicantRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const [generating, setGenerating] = useState(false);

  const passportParam = params.get("passport") || "";
  const idParam = params.get("id");

  useEffect(() => {
    const fetchRecord = async () => {
      if (!idParam && !passportParam) {
        setLoading(false);
        return;
      }
      try {
        let query = supabase.from("applicants").select("*");
        if (idParam && passportParam) {
          query = query.or(`id.eq.${idParam},passport_number.eq.${passportParam}`);
        } else if (idParam) {
          query = query.eq("id", idParam);
        } else {
          query = query.eq("passport_number", passportParam);
        }
        const { data, error } = await query.single();
        if (error) throw error;
        setDbData(data);
      } catch (err) {
        console.error("Search error:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchRecord();
  }, [idParam, passportParam]);

  const displayData = useMemo<ETASDisplayData | null>(() => {
    if (!dbData) return null;
    const issueDateObj = new Date(dbData.created_at);
    const expiryDateObj = new Date(issueDateObj);
    expiryDateObj.setDate(expiryDateObj.getDate() + 90);
    return {
      ...dbData,
      formatted_issue_date: issueDateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      formatted_expiry_date: expiryDateObj.toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    };
  }, [dbData]);

  const handleOpenPdf = useCallback(async () => {
    if (!containerRef.current || !displayData) {
      alert("Record not found or still loading.");
      return;
    }
    if (!displayData.passport_number) {
      alert("Missing passport number for PDF password.");
      return;
    }

    try {
      setGenerating(true);
      const element = containerRef.current;

      const canvas = await html2canvas(element, {
        scale: 4,
        useCORS: true,
        allowTaint: true,
        backgroundColor: "#ffffff",
        logging: false,
        width: element.offsetWidth,
        height: element.offsetHeight,
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        compress: true,
        encryption: {
          userPassword: displayData.passport_number,
          ownerPassword: displayData.passport_number,
          userPermissions: ["print"],
        },
      });

      pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");

      const blob = pdf.output("blob");
      const url = URL.createObjectURL(blob);
      window.location.href = url;
      setTimeout(() => URL.revokeObjectURL(url), 60_000);
    } catch (error) {
      console.error("Failed to generate/open PDF:", error);
      alert("Unable to generate the PDF. See console for details.");
    } finally {
      setGenerating(false);
    }
  }, [displayData]);

  return (
    <div className="min-h-screen bg-gray-200 flex flex-col items-center justify-center">
      <div className="bg-[#4189dd] text-center p-14 flex flex-col items-center justify-center">
        <h1 className="text-black text-2xl font-serif font-semibold leading-snug">
          You will require your Passport Number to open the
          <br />
          Verification PDF
        </h1>

        <button
          onClick={handleOpenPdf}
          disabled={loading || generating || !displayData}
          className="mt-6 block text-2xl text-purple-900 font-serif font-bold underline text-center disabled:opacity-60"
        >
          {generating ? "Generating PDF..." : "CLICK HERE TO PROCEED"}
        </button>
      </div>

      {/* Hidden render target for html2canvas */}
      <div
        ref={containerRef}
        style={{
          position: "absolute",
          left: "-99999px",
          top: 0,
          width: "210mm",
          height: "297mm",
          padding: "4mm 8mm",
          background: "white",
        }}
      >
        {displayData && <ETASPdfTemplate displayData={displayData} />}
      </div>
    </div>
  );
}