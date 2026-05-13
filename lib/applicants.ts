export type ApplicantRecord = {
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

export type ApplicantUpsertInput = {
  id?: string;
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
};