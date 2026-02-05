"use client";

import { useCallback, useMemo, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import QRCode from "react-qr-code";
import html2canvas from "html2canvas-pro";
import { jsPDF } from "jspdf";

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

export default function ETASOfficialPreview() {
  const params = useSearchParams();
  const containerRef = useRef<HTMLDivElement>(null);
  const [downloading, setDownloading] = useState(false);

  const data = useMemo<DocumentData>(
    () => ({
      givenName: params.get("givenName")?.toUpperCase() || "SUSHIL",
      surname: params.get("surname")?.toUpperCase() || "KUMAR",
      applicantPhoto: params.get("applicantPhoto") || "/applicant.jpg",
      dateOfBirth: params.get("dateOfBirth") || "07 Jan 1986",
      sex: params.get("sex")?.toUpperCase() || "MALE",
      nationality: params.get("nationality")?.toUpperCase() || "INDIA",
      passportNumber: params.get("passportNumber")?.toUpperCase() || "X7610849",
      passportIssuePlace: params.get("passportIssuePlace")?.toUpperCase() || "IND",
      passportIssueDate: params.get("passportIssueDate") || "03 Apr 2023",
      passportExpiryDate: params.get("passportExpiryDate") || "02 Apr 2033",
      visitPurpose: params.get("visitPurpose")?.toUpperCase() || "TOURIST",
      sponsor: params.get("sponsor")?.toUpperCase() || "SAFARI TOURISM",
      etasNumber: "https://immigration.gov.so/verify/etas/" + (params.get("etasNumber") || "FGS - 1768293848"),
      etasIssueDate: params.get("etasIssueDate") || "01 Feb 2026",
      etasExpiryDate: params.get("etasExpiryDate") || "02 May 2026",
    }),
    [params],
  );

  const watermarkLine = `${data.nationality} ${data.passportNumber} ${data.visitPurpose} ${data.givenName} ${data.surname} ${data.dateOfBirth} `;

  const handleDownload = useCallback(async () => {
    if (!containerRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(containerRef.current, { scale: 4, useCORS: true });
      const imgData = canvas.toDataURL("image/jpeg", 1.0);
      const pdf = new jsPDF("p", "mm", "a4");
      pdf.addImage(imgData, "JPEG", 0, 0, 210, 297);
      pdf.save(`eTAS_${data.passportNumber}.pdf`);
    } finally {
      setDownloading(false);
    }
  }, [data]);

  return (
    <div className="min-h-screen bg-gray-200 py-10 flex flex-col items-center font-sans">
      <div className="mb-6 flex gap-4 no-print">
        <Link href="/" className="px-5 py-2 bg-white rounded-md shadow-sm text-sm font-medium hover:bg-gray-50">← Edit Form</Link>
        <button
          onClick={handleDownload}
          disabled={downloading}
          className="px-8 py-2 bg-[#0056b3] text-white rounded-md shadow-md font-bold text-sm hover:bg-blue-800 transition-colors"
        >
          {downloading ? "Generating Document..." : "Download Official PDF"}
        </button>
      </div>

      <div
        ref={containerRef}
        className="relative bg-white shadow-2xl overflow-hidden"
        style={{ width: "210mm", height: "297mm", padding: "12mm 16mm" }}
      >
        {/* WATERMARK OVERLAY */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.08] rotate-[-30deg] scale-[1.7] origin-center z-0">
          {Array.from({ length: 80 }).map((_, i) => (
            <div key={i} className="whitespace-nowrap text-[9.5px] font-bold leading-[1.7] tracking-[0.15em] text-black">
              {Array(6).fill(watermarkLine).join("   ")}
            </div>
          ))}
        </div>

        <div className="relative z-10 flex flex-col h-full text-black">
          {/* HEADER */}
          <header className="text-center mb-5">
            <div className="flex justify-center mb-2">
              <Image src="/logo.svg" alt="Coat of Arms" width={82} height={82} priority />
            </div>
            <h1 className="text-[13px] font-bold tracking-tight uppercase">JAMHUURIYADDA FEDERAALKA SOOMAALIYA</h1>
            <h1 className="text-[17px] font-bold my-0.5 font-arabic">جمهورية الصومال الفيدرالية</h1>
            <h2 className="text-[14px] font-bold tracking-tight">Federal Republic of Somalia</h2>
          </header>

          {/* BANNER WITH BARCODE SAMPLE */}
          <div className="bg-[#D1D3D4] h-[75px] flex items-center mb-8 border border-gray-300 rounded-[8px] overflow-hidden">
            <div className="w-[25%] h-full flex items-center px-4">
              <div className="w-full h-12 bg-black/5 blur-[3px] rotate-[-5deg]"></div>
            </div>
            <div className="w-[45%] text-center">
              <div className="text-[38px] font-bold leading-none tracking-tighter italic text-gray-800">eTAS</div>
              <div className="text-[10px] font-bold mt-1 text-black">
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
            <div className="w-[30%] flex flex-col items-end pr-5">
              {/* STYLIZED BARCODE SAMPLE */}
              <div className="flex gap-[1px] h-9 bg-white p-1 mb-1 items-stretch w-44">
                {[...Array(40)].map((_, i) => (
                  <div 
                    key={i} 
                    className="bg-black h-full" 
                    style={{ width: `${Math.floor(Math.random() * 3) + 1}px`, opacity: Math.random() > 0.1 ? 1 : 0 }} 
                  />
                ))}
              </div>
              <div className="text-[11.5px] font-bold tracking-tight text-black">
                {data.etasNumber.split("/").slice(-1)[0]}
              </div>
            </div>
          </div>

          {/* APPLICANT PHOTO & DATA */}
          <div className="flex gap-10 mb-8 px-2">
            <div className="w-[155px] flex-shrink-0">
              <div className="aspect-[3.5/4.5] border-[1.5px] border-gray-400 bg-white p-[1px] shadow-sm overflow-hidden relative">
                <Image src={data.applicantPhoto} alt="Applicant Photo" fill className="object-cover" />
              </div>
            </div>
            <div className="flex-1 grid grid-cols-2 gap-x-10 gap-y-2 pt-1">
              <DetailField label="Given Name" value={data.givenName} />
              <DetailField label="Surname" value={data.surname} />
              <DetailField label="Date of Birth" value={data.dateOfBirth} />
              <DetailField label="Sex" value={data.sex} />
              <DetailField label="Current Nationality" value={data.nationality} />
              <DetailField label="Passport No." value={data.passportNumber} />
              <DetailField label="Passport Issue Place" value={data.passportIssuePlace} />
              <DetailField label="Passport Issue Date" value={data.passportIssueDate} />
              <DetailField label="Passport Expiry Date" value={data.passportExpiryDate} />
              <DetailField label="Purpose of Visit" value={data.visitPurpose} />
              <div className="col-span-2"><DetailField label="Sponsored By" value={data.sponsor} /></div>
            </div>
          </div>

          {/* NOTES AND QR CODE ON SAME ROW */}
          <div className="flex justify-between items-start mb-4 px-2 gap-8">
            <div className="flex-1">
              <h3 className="font-bold text-[13px] mb-3 underline underline-offset-2">Notes</h3>
              <ol className="text-[11.5px] leading-[1.3] text-black space-y-3">
                <li className="flex gap-3">
                  <span className="font-bold min-w-[15px]">1.</span>
                  <span>A colored copy of this eTAS, along with your passport, must be presented to the immigration officer upon arrival at the designated point of entry.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold min-w-[15px]">2.</span>
                  <span>This Travel Authorization allows for a single entry and is valid for 90 days from the date of approval.</span>
                </li>
                <li className="flex gap-3">
                  <span className="font-bold min-w-[15px]">3.</span>
                  <span>Providing false information to immigration authorities constitutes a criminal offense and is punishable by law.</span>
                </li>
              </ol>
            </div>

            {/* BORDER REMOVED FROM QR CODE */}
            <div className="bg-white shrink-0 mt-2">
              <QRCode value={data.etasNumber} size={135} />
            </div>
          </div>

          {/* AUTHORITY BLOCK CENTERED */}
          <div className="text-center mt-6 mb-4">
            <p className="text-[10.5px] font-bold uppercase leading-tight tracking-tight">
              THIS DOCUMENT WAS ISSUED UNDER THE AUTHORITY OF IMMIGRATION AND CITIZENSHIP AGENCY
            </p>
            <p className="text-[11.5px] font-bold mt-1 tracking-[0.1em] underline underline-offset-2 uppercase">ETAS.GOV.SO</p>
          </div>

          {/* FOOTER */}
          <footer className="mt-auto relative pb-6">
            <div className="absolute bottom-16 left-0 right-0 flex justify-center opacity-85 pointer-events-none">
              <Image src="/camels.png" alt="Camel Silhouette" width={680} height={130} className="object-contain" />
            </div>
            <div className="relative text-center text-[12px] font-bold z-10 pt-20">
              <div className="uppercase tracking-widest text-black/80">Immigration and Citizenship Agency</div>
              <div className="text-[11px] font-medium text-gray-600 mt-1">
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
    <div className="flex gap-2 items-baseline border-b border-gray-100 pb-1">
      <span className="text-[12.5px] text-gray-500 whitespace-nowrap font-medium">{label}:</span>
      <span className="text-[13px] font-bold text-black uppercase tracking-tight">{value}</span>
    </div>
  );
}