import { ApplicantRecord, ApplicantUpsertInput } from "@/lib/applicants";

type ApplicantFilters = {
  id?: string;
  passport?: string;
  etas?: string;
};

export async function fetchApplicant(
  filters: ApplicantFilters
): Promise<ApplicantRecord | null> {
  const params = new URLSearchParams();

  if (filters.id) params.set("id", filters.id);
  if (filters.passport) params.set("passport", filters.passport);
  if (filters.etas) params.set("etas", filters.etas);

  const response = await fetch(`/api/applicants?${params.toString()}`, {
    cache: "no-store",
  });

  if (response.status === 404) {
    return null;
  }

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(payload?.error ?? "Failed to fetch applicant");
  }

  const payload = (await response.json()) as { data: ApplicantRecord };
  return payload.data;
}

export async function upsertApplicant(
  input: ApplicantUpsertInput
): Promise<ApplicantRecord> {
  const response = await fetch("/api/applicants", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(input),
  });

  if (!response.ok) {
    const payload = (await response.json().catch(() => null)) as
      | { error?: string }
      | null;
    throw new Error(payload?.error ?? "Failed to save applicant");
  }

  const payload = (await response.json()) as { data: ApplicantRecord };
  return payload.data;
}