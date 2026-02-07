"use client";

import { ChangeEvent, FormEvent, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { User, CreditCard, Calendar, Camera, Plane } from "lucide-react"; // Optional: lucide-react for icons

const initialState = {
  givenName: "Paula Christyanne",
  surname: "Kitto",
  dateOfBirth: "1976-11-21",
  nationality: "Australia",
  passportNumber: "RA3922300",
  passportIssuePlace: "AUS",
  passportIssueDate: "2024-03-06",
  passportExpiryDate: "2034-03-06",
  sex: "Female",
  visitPurpose: "Holiday",
  sponsor: "Edna Adan University",
  etasNumber: "176" + Math.floor(1000000 + Math.random() * 9000000).toString(),
  etasIssueDate: "2025-11-29",
  etasExpiryDate: "2026-02-27",
};

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState(initialState);
  const [applicantPhoto, setApplicantPhoto] = useState<string>("");
  const [photoError, setPhotoError] = useState("");

  const handleChange = (field: keyof typeof initialState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPhotoError("");
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setPhotoError("Image must be under 2MB");
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setApplicantPhoto(result);
      // Store in localStorage because URL strings have length limits
      localStorage.setItem("applicantPhoto", result);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(formData).toString();
    router.push(`/preview?${params}`);
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-12 md:px-6">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <header className="bg-slate-900 px-8 py-10 text-white">
          <h1 className="text-3xl font-bold tracking-tight">eTAS Application</h1>
          <p className="mt-2 text-slate-400">Electronic Travel Authorization System Portal</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8 p-8">
          {/* Section 1: Personal Details */}
          <section>
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField label="Given Name" value={formData.givenName} onChange={handleChange("givenName")} />
              <FormField label="Surname" value={formData.surname} onChange={handleChange("surname")} />
              <FormField label="Date of Birth" type="date" value={formData.dateOfBirth} onChange={handleChange("dateOfBirth")} />
              <FormField label="Sex" value={formData.sex} onChange={handleChange("sex")} />
            </div>
          </section>

          {/* Section 2: Passport Details */}
          <section>
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">Passport Details</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField label="Passport Number" value={formData.passportNumber} onChange={handleChange("passportNumber")} />
              <FormField label="Nationality" value={formData.nationality} onChange={handleChange("nationality")} />
              <FormField label="Issue Date" type="date" value={formData.passportIssueDate} onChange={handleChange("passportIssueDate")} />
              <FormField label="Expiry Date" type="date" value={formData.passportExpiryDate} onChange={handleChange("passportExpiryDate")} />
            </div>
          </section>

          {/* Section 3: Photo Upload */}
          <section>
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Camera className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">Applicant Photo</h2>
            </div>
            <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-slate-200 p-6 transition-colors hover:border-blue-400 md:flex-row">
              <div className="h-32 w-28 overflow-hidden rounded-lg border bg-slate-50">
                {applicantPhoto ? (
                  <img src={applicantPhoto} alt="Preview" className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full items-center justify-center text-xs text-slate-400">No Photo</div>
                )}
              </div>
              <div className="flex-1">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handlePhotoChange}
                  className="block w-full text-sm text-slate-500 file:mr-4 file:rounded-full file:border-0 file:bg-blue-50 file:px-4 file:py-2 file:text-sm file:font-semibold file:text-blue-700 hover:file:bg-blue-100"
                />
                <p className="mt-2 text-xs text-slate-500">Upload a professional passport-style photo (JPEG/PNG, max 2MB).</p>
                {photoError && <p className="mt-1 text-sm font-medium text-red-500">{photoError}</p>}
              </div>
            </div>
          </section>

          <button
            type="submit"
            className="w-full rounded-xl bg-blue-600 py-4 text-lg font-bold text-white transition-all hover:bg-blue-700 hover:shadow-lg focus:ring-4 focus:ring-blue-200 active:scale-[0.98]"
          >
            Generate eTAS Document
          </button>
        </form>
      </div>
    </div>
  );
}

// Reusable Sub-component
function FormField({ label, value, onChange, type = "text" }: any) {
  return (
    <div className="flex flex-col">
      <label className="mb-1.5 text-sm font-semibold text-slate-700">{label}</label>
      <input
        type={type}
        value={value}
        onChange={onChange}
        className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 transition-all focus:border-blue-500 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-100"
        required
      />
    </div>
  );
}