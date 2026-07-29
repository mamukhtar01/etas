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
      .then(() => undefined)
      .catch((error) => {
        // Don't cache a transient failure (e.g. a network blip) forever;
        // let the next call retry instead of failing every request.
        schemaInitPromise = null;
        throw error;
      });
  }

  await schemaInitPromise;
}

let applicantsOwnershipInitPromise: Promise<void> | null = null;

export async function ensureApplicantsOwnershipSchema() {
  if (!applicantsOwnershipInitPromise) {
    applicantsOwnershipInitPromise = (async () => {
      // Migrate existing table to include ownership columns.
      try {
        await turso.execute("ALTER TABLE applicants ADD COLUMN user_id TEXT");
      } catch {
        // Column already exists.
      }

      try {
        await turso.execute(
          "ALTER TABLE applicants ADD COLUMN created_by_username TEXT",
        );
      } catch {
        // Column already exists.
      }

      try {
        await turso.execute(
          "ALTER TABLE applicants ADD COLUMN user_updated TEXT",
        );
      } catch {
        // Column already exists.
      }

      try {
        await turso.execute(
          "ALTER TABLE applicants ADD COLUMN etas_issue_date TEXT",
        );
      } catch {
        // Column already exists.
      }

      try {
        await turso.execute(
          "ALTER TABLE applicants ADD COLUMN etas_expiry_date TEXT",
        );
      } catch {
        // Column already exists.
      }

      await turso.execute(
        "CREATE INDEX IF NOT EXISTS applicants_user_id_idx ON applicants(user_id)",
      );
    })()
      .then(() => undefined)
      .catch((error) => {
        applicantsOwnershipInitPromise = null;
        throw error;
      });
  }

  await applicantsOwnershipInitPromise;
}

let usersSchemaInitPromise: Promise<void> | null = null;

export async function ensureUsersSchema() {
  if (!usersSchemaInitPromise) {
    usersSchemaInitPromise = turso
      .execute(
        `
        CREATE TABLE IF NOT EXISTS users (
          id TEXT PRIMARY KEY,
          username TEXT NOT NULL,
          pin TEXT,
          role TEXT NOT NULL DEFAULT 'user',
          created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        )
      `,
      )
      .then(async () => {
        try {
          await turso.execute(
            "ALTER TABLE users ADD COLUMN role TEXT NOT NULL DEFAULT 'user'",
          );
        } catch {
          // Column already exists.
        }

        await turso.execute(
          "CREATE UNIQUE INDEX IF NOT EXISTS users_username_uq ON users(username)",
        );
      })
      .then(() => undefined)
      .catch((error) => {
        usersSchemaInitPromise = null;
        throw error;
      });
  }

  await usersSchemaInitPromise;
}
