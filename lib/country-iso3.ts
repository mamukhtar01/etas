import countryISO3Codes from "@/shared/countryISO3Codes.json";

type CountryISO3Entry = {
  NAME: string;
  CODE: string;
};

const entries = countryISO3Codes as CountryISO3Entry[];

const countryNameToCode = new Map(entries.map((entry) => [entry.NAME, entry.CODE]));
const countryCodeToName = new Map(entries.map((entry) => [entry.CODE, entry.NAME]));

export const countryOptions = [...entries].sort((a, b) => a.NAME.localeCompare(b.NAME));

export function normalizeNationalityInput(value: string): string {
  const upper = value.trim().toUpperCase();
  if (!upper) return "";

  if (countryNameToCode.has(upper)) {
    return upper;
  }

  return countryCodeToName.get(upper) ?? upper;
}

export function getPassportIssuePlace(nationality: string): string {
  const normalizedNationality = normalizeNationalityInput(nationality);
  if (!normalizedNationality) return "";

  return (
    countryNameToCode.get(normalizedNationality) ??
    normalizedNationality.slice(0, 3).toUpperCase()
  );
}