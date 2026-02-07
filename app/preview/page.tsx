"use client";

import { Suspense, useCallback, useMemo, useRef, useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";
import Barcode from "react-barcode";

type DocumentData = {
  givenName: string;
  surname: string;
  dateOfBirth: string;
  nationality: string;
  passportNumber: string;
  passportIssuePlace: string;
  passportIssueDate: string;
  passportExpiryDate: string;
  sex: string;
  visitPurpose: string;
  sponsor: string;
  etasNumber: string;
  etasIssueDate: string;
  etasExpiryDate: string;
  applicantPhoto: string;
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
      Loading preview...
    </div>
  );
}

function PreviewContent() {
  const params = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);
  const [storedPhoto, setStoredPhoto] = useState<string>("/applicant.jpg");

  // Retrieve the photo from localStorage on mount
  useEffect(() => {
    const photo = localStorage.getItem("applicantPhoto");
    if (photo) {
      setStoredPhoto(photo);
    }
  }, []);

  const data = useMemo<DocumentData>(
    () => ({
      givenName: params.get("givenName")?.toUpperCase() || "SUSHIL",
      surname: params.get("surname")?.toUpperCase() || "KUMAR",
      applicantPhoto: storedPhoto,
      dateOfBirth: params.get("dateOfBirth") || "07 Jan 1986",
      sex: params.get("sex")?.toUpperCase() || "MALE",
      nationality: params.get("nationality")?.toUpperCase() || "INDIA",
      passportNumber: params.get("passportNumber")?.toUpperCase() || "",
      passportIssuePlace:
        params.get("nationality")?.toUpperCase().slice(0, 3) || "",
      passportIssueDate: params.get("passportIssueDate") || "03 Apr 2023",
      passportExpiryDate: params.get("passportExpiryDate") || "02 Apr 2033",
      visitPurpose: params.get("visitPurpose")?.toUpperCase() || "TOURIST",
      sponsor: params.get("sponsor")?.toUpperCase() || "SAFARI TOURISM",
      etasNumber: params.get("etasNumber")?.toUpperCase() || "1763645287",
      etasIssueDate: new Date().toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
      etasExpiryDate: new Date(
        Date.now() + 90 * 24 * 60 * 60 * 1000,
      ).toLocaleDateString("en-GB", {
        day: "2-digit",
        month: "short",
        year: "numeric",
      }),
    }),
    [params, storedPhoto],
  );

  const watermarkLine = `${data.nationality} ${data.passportNumber} ${data.visitPurpose} ${data.givenName} ${data.surname} ${data.dateOfBirth} `;

  const separatorText =
    "Federal Republic of Somalia Immigration and Citizenship Agency ";

  const handleDownload = useCallback(async () => {
    if (!containerRef.current) return;
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
        windowWidth: 1600,
        scrollX: 0,
        scrollY: -window.scrollY,
        onclone: (clonedDoc) => {
          const printEl = clonedDoc.getElementById("print-container");
          if (printEl) {
            printEl.style.boxShadow = "none";
          }
        },
      });

      const imgData = canvas.toDataURL("image/png", 1.0);
      const pdf = new jsPDF({
        orientation: "p",
        unit: "mm",
        format: "a4",
        compress: true,
      });

      pdf.addImage(imgData, "PNG", 0, 0, 210, 297, undefined, "FAST");
      pdf.save(`eTAS_${data.passportNumber}.pdf`);
    } catch (error) {
      console.error("Print capture failed:", error);
    } finally {
      setDownloading(false);
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-200 py-10 flex flex-col items-center font-sans">
      <style jsx global>{`
        @import url("https://fonts.googleapis.com/css2?family=Tinos:wght@400;700&family=Noto+Naskh+Arabic:wght@700&display=swap");

        @media print {
          body {
            background: white !important;
          }
          .no-print {
            display: none !important;
          }
          #print-container {
            box-shadow: none !important;
            margin: 0 !important;
          }
        }

        .font-serif-official {
          font-family: "Tinos", "Times New Roman", serif;
        }
        .font-arabic {
          font-family: "Noto Naskh Arabic", serif;
        }

        .security-text-line {
          width: calc(100% + 16mm);
          margin-left: -8mm;
          white-space: nowrap;

          font-size: 3px;
          font-weight: 900;
          color: #333;
          text-transform: uppercase;
          line-height: 0.1;
          letter-spacing: 0.1px;
        }
      `}</style>

      <div className="mb-6 flex gap-4 no-print">
        <Link
          href="/"
          className="px-5 py-2 bg-white rounded-md shadow-sm text-sm font-medium hover:bg-gray-50 border"
        >
          ← Edit Form
        </Link>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-8 py-2 bg-[#0056b3] text-white rounded-md shadow-md font-bold text-sm hover:bg-blue-800 transition-colors"
        >
          {downloading ? "Formatting PDF..." : "Download PDF"}
        </button>
      </div>

      <div
        id="print-container"
        ref={containerRef}
        className="relative bg-white shadow-2xl overflow-hidden"
        style={{ width: "210mm", height: "297mm", padding: "4mm 8mm" }}
      >
        <div className="watermark-container absolute -inset-[35%] pointer-events-none opacity-[0.14] rotate-[-50deg] origin-center z-0">
          {Array.from({ length: 120 }).map((_, i) => (
            <div
              key={i}
              className="watermark-text whitespace-nowrap text-[20px] font-bold leading-[2] tracking-[0.02em] text-black"
            >
              {Array(8).fill(watermarkLine).join("   ")}
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col h-full text-black">
          <header className="text-center mb-5">
            <div className="flex justify-center mb-2">
              <Image
                src="/logo.svg"
                alt="Coat of Arms"
                width={82}
                height={82}
                priority
              />
            </div>
            <h1 className="text-[14px] font-bold tracking-wider uppercase font-serif-official">
              JAMHUURIYADDA FEDERAALKA SOOMAALIYA
            </h1>
            <h1 className="text-[16px] font-bold my-0.5 font-arabic">
              جمهورية الصومال الفيدرالية
            </h1>
            <h2 className="text-[16px] font-bold tracking-wide font-serif-official">
              Federal Republic of Somalia
            </h2>
          </header>

          <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.08] z-0">
            <Image
              src="/emblem.svg"
              alt="Security Emblem"
              width={600}
              height={600}
              className="object-contain pt-20"
            />
          </div>

          <div className="security-text-line mb-4">
            {Array(15).fill(separatorText).join("")}
          </div>

          <div className="bg-[#dde0e1] h-[85px] flex items-center mb-8 border border-gray-300 rounded-[15px] overflow-hidden">
            <div className="w-[25%] h-10 flex pt-4 px-2 mb-auto">
              <Image
                src={"/shade.png"}
                alt="Applicant Photo"
                width={600}
                height={40}
              />
            </div>
            <div className="w-[45%] text-center py-3">
              <div className="text-[34px] font-bold leading-none tracking-tight text-gray-900 font-serif-official">
                eTAS
              </div>
              <div className="text-[12px] font-bold mt-1 text-black font-sans">
                <div className="flex justify-center gap-3">
                  <span className="text-gray-700">Etas Issued On:</span>
                  <span className="w-24 text-left">{data.etasIssueDate}</span>
                </div>
                <div className="flex justify-center gap-3">
                  <span className="text-gray-700">Etas Expires On:</span>
                  <span className="w-24 text-left">{data.etasExpiryDate}</span>
                </div>
              </div>
            </div>
            <div className="w-[30%] flex flex-col pr-5">
              <div className="flex h-10 bg-white mb-1 items-center justify-center w-44 border border-gray-200 overflow-hidden">
                <Barcode
                  value={data.etasNumber || "1768293848"}
                  format="CODE128"
                  width={1.8}
                  height={32}
                  displayValue={false}
                  margin={0}
                  background="transparent"
                />
              </div>
              <div className="text-[14.5px] font-bold tracking-tight text-black font-serif-official">
                FGS <span className="px-1">-</span>
                {data.etasNumber}
              </div>
            </div>
          </div>

          <div className="flex gap-10 mb-8 px-2">
            <div className="w-[155px] flex-shrink-0">
              <div className="aspect-[3.5/4.5] bg-white p-[1px] shadow-sm overflow-hidden relative">
                <Image
                  src={data.applicantPhoto}
                  alt="Applicant Photo"
                  fill
                  unoptimized // Important for base64/local data URLs
                  className="object-cover"
                />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-x-10 gap-y-2 pt-1 font-sans">
              <DetailField label="Given Name" value={data.givenName} />
              <DetailField label="Surname" value={data.surname} />
              <DetailField label="Date of Birth" value={formatDate(data.dateOfBirth)} />
              <DetailField label="Sex" value={data.sex} />
              <DetailField
                label="Current Nationality"
                value={data.nationality}
              />
              <DetailField label="Passport No." value={data.passportNumber} />
              <DetailField
                label="Passport Issue Place"
                value={data.passportIssuePlace}
              />
              <DetailField
                label="Passport Issue Date"
                value={formatDate(data.passportIssueDate)}
              />
              <DetailField
                label="Passport Expiry Date"
                value={formatDate(data.passportExpiryDate)}
              />
              <DetailField label="Purpose of Visit" value={data.visitPurpose} />
              <div className="col-span-2">
                <DetailField label="Sponsored By" value={data.sponsor} />
              </div>
            </div>
          </div>

          <div className=" px-2 font-serif-official">
            <h3 className="font-bold text-[16px] mb-3 ">Notes</h3>
            <div className="flex justify-between items-start mb-4  gap-8 ">
              <div className="flex-1">
                <ol className="text-[15.5px] leading-[1.5] text-black space-y-2">
                  <li className="flex gap-4">
                    <span className=" min-w-[15px]">1.</span>
                    <span>
                      A colored copy of this eTAS, along with your passport,
                      must be presented to the immigration officer upon arrival
                      at the designated point of entry.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className=" min-w-[15px]">2.</span>
                    <span>
                      This Travel Authorization allows for a single entry and is
                      valid for 90 days from the date of approval.
                    </span>
                  </li>
                  <li className="flex gap-4">
                    <span className=" min-w-[15px]">3.</span>
                    <span>
                      Providing false information to immigration authorities
                      constitutes a criminal offense and is punishable by law.
                    </span>
                  </li>
                </ol>
              </div>
              <div className="shrink-0 mt-2">
                <QRCode
                  value={
                    "https://immigration.gov.so/verify/etas/" + data.etasNumber
                  }
                  size={135}
                />
              </div>
            </div>
          </div>
          <div className="text-center mt-6 font-semibold text-gray-800 text-[13px]">
            <p className="  uppercase leading-tight tracking-wider font-serif-official">
              THIS DOCUMENT WAS ISSUED UNDER THE AUTHORITY OF IMMIGRATION AND
              CITIZENSHIP AGENCY
            </p>
            <p className="mt-1 tracking-[0.05em] uppercase font-serif-official">
              ETAS.GOV.SO
            </p>
          </div>

          {/* footer */}
          <footer className=" font-sans relative mt-auto mb-2 -top-10">
            <div className=" bottom-16 left-0 right-0  flex justify-center opacity-85 pointer-events-none">
              <Image
                src="/camels.png"
                alt="Camel Silhouette"
                width={800}
                height={80}
                className="object-contain"
              />
            </div>
            <div className="relative mt-[-10px] text-center text-[12px] font-bold z-10">
              <div className="uppercase tracking-widest text-black/80">
                Immigration and Citizenship Agency
              </div>
              <div className="text-[12px] font-medium text-gray-800 mt-1">
                Email: visa.dept@immigration.gov.so | www.immigration.gov.so
              </div>
            </div>
          </footer>
        </div>
      </div>
    </div>
  );
}

function DetailField({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex gap-2 items-baseline pb-1.5">
      <span className="text-[14.5px] text-gray-800 whitespace-nowrap">
        {label}:
      </span>
      <span className="text-[14px] font-bold text-black whitespace-nowrap uppercase tracking-tight">
        {value}
      </span>
    </div>
  );
}



function formatDate(dateStr: string) {
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return dateStr;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}