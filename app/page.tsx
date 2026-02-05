"use client";

import { ChangeEvent, FormEvent, useState } from "react";
import { useRouter } from "next/navigation";

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
  etasNumber: "FGS-1764079668",
  etasIssueDate: "2025-11-29",
  etasExpiryDate: "2026-02-27",
  notes: `A colored copy of this eTAS, along with your passport, must be presented to the immigration officer upon arrival at the designated point of entry. This Travel Authorization allows for a single entry and is valid for 90 days from the date of approval. Providing false information to immigration authorities constitutes a criminal offense and is punishable by law.`,
  applicantPhoto: "",
};

type FormState = typeof initialState;

export default function Home() {
  const router = useRouter();
  const [formData, setFormData] = useState<FormState>(initialState);
  const [photoError, setPhotoError] = useState("");

  const handleChange = (field: keyof FormState) =>
    (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
      setFormData((prev) => ({ ...prev, [field]: event.target.value }));
    };

  const handlePhotoChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    setPhotoError("");
    if (!file) {
      setFormData((prev) => ({ ...prev, applicantPhoto: "" }));
      return;
    }
    if (!file.type.startsWith("image/")) {
      setPhotoError("Please select an image file.");
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === "string" ? reader.result : "";
      setFormData((prev) => ({ ...prev, applicantPhoto: result }));
    };
    reader.onerror = () => setPhotoError("Could not read the file.");
    reader.readAsDataURL(file);
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const params = new URLSearchParams(formData).toString();
    router.push(`/preview?${params}`);
  };

  return (
    <div className="min-h-screen bg-slate-100 py-10">
      <div className="mx-auto max-w-4xl rounded-xl bg-white p-8 shadow-sm">
        <header className="mb-8 border-b pb-4">
          <h1 className="text-2xl font-semibold text-slate-900">
            eTAS Generator
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            Fill in the traveller details below and continue to preview and download the generated authorization document.
          </p>
        </header>
        <form className="grid grid-cols-1 gap-6 md:grid-cols-2" onSubmit={handleSubmit}>
          <FormField
            label="Given Name"
            value={formData.givenName}
            onChange={handleChange("givenName")}
          />
          <FormField
            label="Surname"
            value={formData.surname}
            onChange={handleChange("surname")}
          />
          <FormField
            label="Date of Birth"
            type="date"
            value={formData.dateOfBirth}
            onChange={handleChange("dateOfBirth")}
          />
          <FormField
            label="Nationality"
            value={formData.nationality}
            onChange={handleChange("nationality")}
          />
          <FormField
            label="Passport Number"
            value={formData.passportNumber}
            onChange={handleChange("passportNumber")}
          />
          <FormField
            label="Passport Issue Place"
            value={formData.passportIssuePlace}
            onChange={handleChange("passportIssuePlace")}
          />
          <FormField
            label="Passport Issue Date"
            type="date"
            value={formData.passportIssueDate}
            onChange={handleChange("passportIssueDate")}
          />
          <FormField
            label="Passport Expiry Date"
            type="date"
            value={formData.passportExpiryDate}
            onChange={handleChange("passportExpiryDate")}
          />
          <FormField
            label="Sex"
            value={formData.sex}
            onChange={handleChange("sex")}
          />
          <FormField
            label="Purpose of Visit"
            value={formData.visitPurpose}
            onChange={handleChange("visitPurpose")}
          />
          <FormField
            label="Sponsor"
            value={formData.sponsor}
            onChange={handleChange("sponsor")}
          />
          <FormField
            label="eTAS Number"
            value={formData.etasNumber}
            onChange={handleChange("etasNumber")}
          />
          <FormField
            label="eTAS Issue Date"
            type="date"
            value={formData.etasIssueDate}
            onChange={handleChange("etasIssueDate")}
          />
          <FormField
            label="eTAS Expiry Date"
            type="date"
            value={formData.etasExpiryDate}
            onChange={handleChange("etasExpiryDate")}
          />
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Applicant Photo
            </label>
            <input
              type="file"
              accept="image/*"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-700 shadow-sm file:mr-3 file:rounded-md file:border-0 file:bg-slate-200 file:px-3 file:py-1 file:text-sm file:font-semibold"
              onChange={handlePhotoChange}
            />
            {photoError && (
              <p className="mt-2 text-xs text-rose-600">{photoError}</p>
            )}
            {formData.applicantPhoto && (
              <img
                src={formData.applicantPhoto}
                alt="Applicant preview"
                className="mt-3 h-24 w-20 rounded border border-slate-200 object-cover"
              />
            )}
          </div>
          <div className="md:col-span-2">
            <label className="mb-2 block text-sm font-medium text-slate-700">
              Notes
            </label>
            <textarea
              className="h-32 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
              value={formData.notes}
              onChange={handleChange("notes")}
            />
          </div>
          <div className="md:col-span-2 flex justify-end">
            <button
              type="submit"
              className="rounded-lg bg-slate-900 px-6 py-2 text-sm font-semibold text-white shadow hover:bg-slate-700 focus:outline-none focus:ring-2 focus:ring-slate-500"
            >
              Preview Document
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

type FieldProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
};

function FormField({ label, value, onChange, type = "text" }: FieldProps) {
  return (
    <div className="flex flex-col">
      <label className="mb-2 text-sm font-medium text-slate-700">{label}</label>
      <input
        type={type}
        className="rounded-lg border border-slate-300 px-3 py-2 text-sm text-slate-900 shadow-sm focus:border-slate-500 focus:outline-none focus:ring-2 focus:ring-slate-200"
        value={value}
        onChange={onChange}
        required
      />
    </div>
  );
}