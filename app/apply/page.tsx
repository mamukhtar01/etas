"use client";

import { ChangeEvent, FormEvent, useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { User, CreditCard, Camera, Loader2, Globe, Plane } from "lucide-react";
import { supabase } from "@/lib/supabase";

const initialState = {
  given_name: "",
  surname: "",
  date_of_birth: "",
  nationality: "",
  passport_number: "",
  passport_issue_date: "",
  passport_expiry_date: "",
  sex: "",
  visit_purpose: "",
  sponsor: "",
};

export default function Home() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading Form...</div>}>
      <ApplicationForm />
    </Suspense>
  );
}

function ApplicationForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // State
  const [formData, setFormData] = useState(initialState);
  const [existingId, setExistingId] = useState<string | null>(null);
  const [existingEtas, setExistingEtas] = useState<string | null>(null);
  const [applicantPhoto, setApplicantPhoto] = useState<File | null>(null);
  const [photoPreview, setPhotoPreview] = useState<string>("");
  const [photoError, setPhotoError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(false);

  // Load data if editing
  useEffect(() => {
    const id = searchParams.get("id");
    const passport = searchParams.get("passport");

    if (id || passport) {
      const loadData = async () => {
        setFetching(true);
        let query = supabase.from("applicants").select("*");
        
        if (id) query = query.eq("id", id);
        else if (passport) query = query.eq("passport_number", passport);

        const { data, error } = await query.single();

        if (data && !error) {
          setExistingId(data.id);
          setExistingEtas(data.etas_number);
          setPhotoPreview(data.applicant_photo_url);
          setFormData({
            given_name: data.given_name,
            surname: data.surname,
            date_of_birth: data.date_of_birth,
            nationality: data.nationality,
            passport_number: data.passport_number,
            passport_issue_date: data.passport_issue_date,
            passport_expiry_date: data.passport_expiry_date,
            sex: data.sex,
            visit_purpose: data.visit_purpose,
            sponsor: data.sponsor,
          });
        }
        setFetching(false);
      };
      loadData();
    }
  }, [searchParams]);

  const handleChange =
    (field: keyof typeof initialState) =>
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

    setApplicantPhoto(file);
    const reader = new FileReader();
    reader.onload = () => {
      setPhotoPreview(reader.result as string);
    };
    reader.readAsDataURL(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setLoading(true);

    try {
      let photoUrl = photoPreview; // Keep existing if no new file uploaded

      if (applicantPhoto) {
        const fileExt = applicantPhoto.name.split(".").pop();
        const fileName = `${formData.passport_number.trim()}_${Date.now()}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from("photos")
          .upload(fileName, applicantPhoto);

        if (uploadError) throw uploadError;

        const { data: publicUrlData } = supabase.storage
          .from("photos")
          .getPublicUrl(fileName);

        photoUrl = publicUrlData.publicUrl;
      }

      // Generate new ETAS only if it doesn't exist
      const etasNumber = existingEtas || "176" + Math.floor(1000000 + Math.random() * 9000000).toString();

      const { data: savedData, error: dbError } = await supabase
        .from("applicants")
        .upsert({
          ...(existingId ? { id: existingId } : {}), // Key to updating vs creating
          ...formData,
          passport_number: formData.passport_number.toUpperCase(),
          etas_number: etasNumber,
          applicant_photo_url: photoUrl,
        })
        .select()
        .single();

      if (dbError) throw dbError;
      router.push(`/preview?id=${savedData.id}`);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (error: any) {
      console.error("Error saving:", error);
      alert(error.message || "An error occurred.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) return (
    <div className="min-h-screen flex items-center justify-center text-slate-500 font-medium">
       <Loader2 className="mr-2 h-5 w-5 animate-spin" /> Retrieving application data...
    </div>
  );

  return (
    <div className="min-h-screen bg-[#f8fafc] px-4 py-12 md:px-6">
      <div className="mx-auto max-w-3xl overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-xl">
        <header className="bg-slate-900 px-8 py-10 text-white">
          <h1 className="text-3xl font-bold tracking-tight">
            {existingId ? "Edit eTAS Application" : "eTAS Application"}
          </h1>
          <p className="mt-2 text-slate-400">Official Immigration & Citizenship Portal</p>
        </header>

        <form onSubmit={handleSubmit} className="space-y-8 p-8">
          {/* Section 1: Personal */}
          <section>
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <User className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">Personal Information</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField label="Given Name" value={formData.given_name} onChange={handleChange("given_name")} />
              <FormField label="Surname" value={formData.surname} onChange={handleChange("surname")} />
              <FormField label="Date of Birth" type="date" value={formData.date_of_birth} onChange={handleChange("date_of_birth")} />
              <div className="flex flex-col">
                <label className="mb-1.5 text-sm font-semibold text-slate-700">Sex</label>
                <select 
                  value={formData.sex} 
                  onChange={handleChange("sex")}
                  className="rounded-lg border border-slate-300 bg-slate-50 px-4 py-2.5 text-slate-900 focus:border-blue-500 focus:ring-2 focus:ring-blue-100 outline-none"
                  required
                >
                  <option value="">Select...</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                </select>
              </div>
            </div>
          </section>

          {/* Section 2: Passport */}
          <section>
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <CreditCard className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">Passport Details</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField label="Passport Number" value={formData.passport_number} onChange={handleChange("passport_number")} />
              <FormField label="Nationality" value={formData.nationality} onChange={handleChange("nationality")} />
              <FormField label="Issue Date" type="date" value={formData.passport_issue_date} onChange={handleChange("passport_issue_date")} />
              <FormField label="Expiry Date" type="date" value={formData.passport_expiry_date} onChange={handleChange("passport_expiry_date")} />
            </div>
          </section>

          {/* Section 3: Travel Purpose */}
          <section>
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Plane className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">Travel Details</h2>
            </div>
            <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
              <FormField label="Visit Purpose" value={formData.visit_purpose} onChange={handleChange("visit_purpose")} />
              <FormField label="Sponsor / Institution" value={formData.sponsor} onChange={handleChange("sponsor")} />
            </div>
          </section>

          {/* Section 4: Photo */}
          <section>
            <div className="mb-4 flex items-center gap-2 border-b border-slate-100 pb-2">
              <Camera className="h-5 w-5 text-blue-600" />
              <h2 className="text-lg font-semibold text-slate-800">Applicant Photo</h2>
            </div>
            <div className="flex flex-col items-center gap-6 rounded-xl border-2 border-dashed border-slate-200 p-6 hover:border-blue-400 md:flex-row">
              <div className="h-32 w-28 overflow-hidden rounded-lg border bg-slate-50 relative">
                {photoPreview ? (
                  <img src={photoPreview} alt="Preview" className="h-full w-full object-cover" />
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
                  required={!existingId} // Photo required only for new apps
                />
                <p className="mt-2 text-xs text-slate-400">
                  {existingId ? "Leave empty to keep existing photo" : "Upload a clear passport-style photo"}
                </p>
                {photoError && <p className="mt-1 text-sm font-medium text-red-500">{photoError}</p>}
              </div>
            </div>
          </section>

          <button
            type="submit"
            disabled={loading}
            className="flex w-full items-center justify-center gap-2 rounded-xl bg-blue-600 py-4 text-lg font-bold text-white hover:bg-blue-700 disabled:bg-blue-400 transition-all shadow-lg shadow-blue-200"
          >
            {loading ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Updating Records...
              </>
            ) : (
              existingId ? "Save Changes" : "Generate eTAS Document"
            )}
          </button>
        </form>
      </div>
    </div>
  );
}

// Sub-component
type FormFieldProps = {
  label: string;
  value: string;
  onChange: (event: ChangeEvent<HTMLInputElement>) => void;
  type?: string;
};

function FormField({ label, value, onChange, type = "text" }: FormFieldProps) {
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