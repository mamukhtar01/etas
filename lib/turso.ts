import "server-only";

import { createClient } from "@libsql/client";

const tursoUrl = process.env.TURSO_DATABASE_URL;

const tursoAuthToken = process.env.TURSO_AUTH_TOKEN;

if (!tursoUrl) {
  throw new Error(
    "Missing Turso database URL. Set TURSO_DATABASE_URL",
  );
}

export const turso = createClient({
  url: tursoUrl,
  authToken: tursoAuthToken,
});

let schemaInitPromise: Promise<void> | null = null;

export async function ensureApplicantsSchema() {
  if (!schemaInitPromise) {
    schemaInitPromise = turso
      .execute(
        `
        CREATE TABLE IF NOT EXISTS applicants (
          id TEXT PRIMARY KEY,
          given_name TEXT NOT NULL,
          surname TEXT NOT NULL,
          date_of_birth TEXT NOT NULL,
          nationality TEXT NOT NULL,
          passport_number TEXT NOT NULL,
          passport_issue_date TEXT NOT NULL,
          passport_expiry_date TEXT NOT NULL,
          sex TEXT NOT NULL,
          visit_purpose TEXT NOT NULL,
          sponsor TEXT NOT NULL,
          etas_number TEXT NOT NULL,
          applicant_photo_url TEXT NOT NULL,
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `,
      )
      .then(() => undefined);
  }

  await schemaInitPromise;
}
