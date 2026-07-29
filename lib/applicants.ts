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
  user_id: string;
  created_by_username: string;
  user_updated: string;
  created_at: string;
  etas_issue_date: string;
  etas_expiry_date: string;
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