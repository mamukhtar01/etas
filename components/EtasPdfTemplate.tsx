"use client";

import Image from "next/image";
import QRCode from "react-qr-code";
import Barcode from "react-barcode";

export type ETASDisplayData = {
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
  formatted_issue_date: string;
  formatted_expiry_date: string;
};

export function ETASPdfTemplate({
  displayData,
}: {
  displayData: ETASDisplayData;
}) {
  const watermarkLine = `${displayData.nationality} ${displayData.passport_number} ${displayData.visit_purpose} ${displayData.given_name} ${displayData.surname} ${displayData.date_of_birth} `;
  const separatorText =
    "Federal Republic of Somalia Immigration and Citizenship Agency ";

  return (
    <div
      id="print-container"
      className="relative bg-white shadow-2xl overflow-hidden"
      style={{ width: "210mm", height: "297mm", padding: "4mm 8mm" }}
    >
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

      {/* Watermark Pattern */}
      <div className="watermark-container absolute -inset-[35%] pointer-events-none opacity-[0.14] rotate-[-50deg] origin-center z-0">
        {Array.from({ length: 120 }).map((_, i) => (
          <div
            key={i}
            className="watermark-text whitespace-nowrap text-[20px] font-bold leading-loose tracking-[0.02em] text-black"
          >
            {Array(8).fill(watermarkLine).join("   ")}
          </div>
        ))}
      </div>

      <div className="relative z-10 flex flex-col h-full text-black">
        {/* Official Header */}
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

        {/* Security Emblem Background */}
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

        {/* eTAS Header Bar */}
        <div className="bg-[#dde0e1] h-21.25 flex items-center mb-8 border border-gray-300 rounded-[15px] overflow-hidden">
          <div className="w-[25%] h-10 flex pt-4 px-2 mb-auto">
            <Image src={"/shade.png"} alt="Security" width={600} height={40} />
          </div>
          <div className="w-[45%] text-center py-3">
            <div className="text-[34px] font-bold leading-none tracking-tight text-gray-900 font-serif-official">
              eTAS
            </div>
            <div className="text-[12px] font-bold mt-1 text-black font-sans">
              <div className="flex justify-center gap-3">
                <span className="text-gray-700">Etas Issued On:</span>
                <span className="w-24 text-left">
                  {displayData.formatted_issue_date}
                </span>
              </div>
              <div className="flex justify-center gap-3">
                <span className="text-gray-700">Etas Expires On:</span>
                <span className="w-24 text-left">
                  {displayData.formatted_expiry_date}
                </span>
              </div>
            </div>
          </div>
          <div className="w-[30%] flex flex-col pr-5">
            <div className="flex h-10 bg-white mb-1 items-center justify-center w-44 border border-gray-200 overflow-hidden">
              <Barcode
                value={displayData.etas_number}
                format="CODE128"
                width={1.8}
                height={32}
                displayValue={false}
                margin={0}
                background="transparent"
              />
            </div>
            <div className="text-[14.5px] font-bold tracking-tight text-black font-serif-official">
              FGS <span className="px-1">-</span> {displayData.etas_number}
            </div>
          </div>
        </div>

        {/* Applicant Details */}
        <div className="flex gap-10 mb-8 px-2">
          <div className="w-38.75 shrink-0">
            <div className="aspect-[3.5/4.5] bg-white p-px shadow-sm overflow-hidden relative">
              <Image
                src={displayData.applicant_photo_url}
                alt="Applicant"
                fill
                unoptimized
                className="object-cover"
              />
            </div>
          </div>
          <div className="flex-1 grid grid-cols-2 gap-x-10 gap-y-2 pt-1 font-sans">
            <DetailField label="Given Name" value={displayData.given_name} />
            <DetailField label="Surname" value={displayData.surname} />
            <DetailField
              label="Date of Birth"
              value={formatDate(displayData.date_of_birth)}
            />
            <DetailField label="Sex" value={displayData.sex} />
            <DetailField
              label="Current Nationality"
              value={displayData.nationality}
            />
            <DetailField
              label="Passport No."
              value={displayData.passport_number}
            />
            <DetailField
              label="Passport Issue Place"
              value={displayData.nationality.slice(0, 3)}
            />
            <DetailField
              label="Passport Issue Date"
              value={formatDate(displayData.passport_issue_date)}
            />
            <DetailField
              label="Passport Expiry Date"
              value={formatDate(displayData.passport_expiry_date)}
            />
            <DetailField
              label="Purpose of Visit"
              value={displayData.visit_purpose}
            />
            <div className="col-span-2">
              <DetailField label="Sponsored By" value={displayData.sponsor} />
            </div>
          </div>
        </div>

        {/* Notes */}
        <div className="px-2 font-serif-official">
          <h3 className="font-bold text-[16px] mb-3">Notes</h3>
          <div className="flex justify-between items-start mb-4 gap-8">
            <div className="flex-1">
              <ol className="text-[15.5px] leading-normal text-black space-y-2">
                <li className="flex gap-4">
                  <span className="min-w-3.75">1.</span>
                  <span>
                    A colored copy of this eTAS, along with your passport, must
                    be presented to the immigration officer upon arrival at the
                    designated point of entry.
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="min-w-3.75">2.</span>
                  <span>
                    This Travel Authorization allows for a single entry and is
                    valid for 90 days from the date of approval.
                  </span>
                </li>
                <li className="flex gap-4">
                  <span className="min-w-3.75">3.</span>
                  <span>
                    Providing false information to immigration authorities
                    constitutes a criminal offense and is punishable by law.
                  </span>
                </li>
              </ol>
            </div>
            <div className="shrink-0 mt-2 relative">
              <QRCode
                value={`https://immigration-etas-gov-so.vercel.app/verify?etas=${displayData.etas_number}`}
                size={135}
              />
              <div className="absolute -bottom-5 left-1/2 transform -translate-x-1/2 ">
                <span className="block text-center text-[4px] mt-1 font-bold text-gray-900 uppercase">
                  {displayData.given_name}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Authority Footer */}
        <div className="text-center mt-6 font-semibold text-gray-800 text-[13px]">
          <p className="uppercase leading-tight tracking-wider font-serif-official">
            THIS DOCUMENT WAS ISSUED UNDER THE AUTHORITY OF IMMIGRATION AND
            CITIZENSHIP AGENCY
          </p>
          <p className="mt-1 tracking-[0.05em] uppercase font-serif-official">
            ETAS.GOV.SO
          </p>
        </div>

        <footer className="font-sans relative mt-auto mb-2 -top-10">
          <div className="bottom-16 left-0 right-0 flex justify-center opacity-85 pointer-events-none">
            <Image
              src="/camels.png"
              alt="Camels"
              width={800}
              height={80}
              className="object-contain"
            />
          </div>
          <div className="relative -mt-2.5 text-center text-[12px] font-bold z-10">
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