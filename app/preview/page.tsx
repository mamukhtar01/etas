"use client";

import {
  Suspense,
  useCallback,
  useMemo,
  useRef,
  useState,
  useEffect,
} from "react";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import { supabase } from "@/lib/supabase";
import { ETASPdfTemplate } from "@/components/EtasPdfTemplate";

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

export default function ETASOfficialPreviewPage() {
  return (
    <Suspense fallback={<PreviewFallback />}>
      <PreviewContent />
    </Suspense>
  );
}

function PreviewFallback() {
  return (
    <div className="min-h-screen bg-gray-200 flex items-center justify-center text-sm text-gray-600">
      <div className="flex flex-col items-center gap-2">
        <div className="w-6 h-6 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
        Loading official preview...
      </div>
    </div>
  );
}

function PreviewContent() {
  const params = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [dbData, setDbData] = useState<ApplicantRecord | null>(null);
  const [loading, setLoading] = useState(true);
  const preview = params.get("preview");

  useEffect(() => {
    const fetchRecord = async () => {
      const id = params.get("id");
      const passport = params.get("passport");

      if (!id && !passport) {
        setLoading(false);
        return;
      }

      try {
        let query = supabase.from("applicants").select("*");

        if (id && passport) {
          query = query.or(`id.eq.${id},passport_number.eq.${passport}`);
        } else if (id) {
          query = query.eq("id", id);
        } else {
          query = query.eq("passport_number", passport);
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
  }, [params]);

  const displayData = useMemo(() => {
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

  const handleDownload = useCallback(async () => {
    if (!containerRef.current || !displayData) return;
    try {
      setDownloading(true);
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
      });

      pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");
      pdf.save(`eTAS_${displayData.passport_number}.pdf`);
    } catch (error) {
      console.error("Print capture failed:", error);
    } finally {
      setDownloading(false);
    }
  }, [displayData]);

  if (loading) return <PreviewFallback />;
  if (!displayData)
    return <div className="p-10 text-center">Record not found.</div>;

  return (
    <div className="min-h-screen bg-gray-200 py-6 md:py-10 flex flex-col items-center font-sans overflow-x-hidden">
      {/* Action Buttons */}
      <div className="mb-6 flex gap-4 no-print z-50">
        {!preview && (
          <Link
            href={`/apply?id=${displayData.id}`}
            className="px-5 py-2 text-[#0056b3] bg-white rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 border transition-colors"
          >
            ← Edit Form
          </Link>
        )}
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-8 py-2 bg-[#0056b3] text-white rounded-md shadow-md font-bold text-sm hover:bg-blue-800 transition-all active:scale-95"
        >
          {downloading ? "Generating PDF..." : "Download PDF"}
        </button>
      </div>

      <div className="mobile-wrapper">
        <div className="scaling-node">
          {displayData && <ETASPdfTemplate displayData={displayData} />}
        </div>
      </div>
    </div>
  );
}
