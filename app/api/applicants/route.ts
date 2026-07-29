import { findUserById, getSessionUser } from "@/lib/auth";
import { NextRequest, NextResponse } from "next/server";
import {
  ensureApplicantsOwnershipSchema,
  ensureApplicantsSchema,
  turso,
} from "@/lib/turso";
import { ApplicantRecord, ApplicantUpsertInput } from "@/lib/applicants";

export const runtime = "nodejs";

let indexInitPromise: Promise<void> | null = null;

async function ensureApplicantsIndexes() {
  if (!indexInitPromise) {
    indexInitPromise = (async () => {
      // Build unique indexes once; duplicates in legacy data will skip index creation
      // so the API remains available while data is cleaned up.
      try {
        await turso.execute(
          "CREATE UNIQUE INDEX IF NOT EXISTS applicants_passport_number_uq ON applicants(passport_number)"
        );
      } catch (error) {
        console.warn(
          "Skipping passport unique index creation due to existing duplicates.",
          error
        );
      }

      try {
        await turso.execute(
          "CREATE UNIQUE INDEX IF NOT EXISTS applicants_etas_number_uq ON applicants(etas_number)"
        );
      } catch (error) {
        console.warn(
          "Skipping ETAS unique index creation due to existing duplicates.",
          error
        );
      }
    })();
  }

  await indexInitPromise;
}

function rowToApplicant(row: Record<string, unknown>): ApplicantRecord {
  return {
    id: String(row.id ?? ""),
    given_name: String(row.given_name ?? ""),
    surname: String(row.surname ?? ""),
    date_of_birth: String(row.date_of_birth ?? ""),
    nationality: String(row.nationality ?? ""),
    passport_number: String(row.passport_number ?? ""),
    passport_issue_date: String(row.passport_issue_date ?? ""),
    passport_expiry_date: String(row.passport_expiry_date ?? ""),
    sex: String(row.sex ?? ""),
    visit_purpose: String(row.visit_purpose ?? ""),
    sponsor: String(row.sponsor ?? ""),
    etas_number: String(row.etas_number ?? ""),
    applicant_photo_url: String(row.applicant_photo_url ?? ""),
    user_id: String(row.user_id ?? ""),
    created_by_username: String(row.created_by_username ?? ""),
    user_updated: String(row.user_updated ?? ""),
    created_at: String(row.created_at ?? ""),
    etas_issue_date: String(row.etas_issue_date ?? ""),
    etas_expiry_date: String(row.etas_expiry_date ?? ""),
  };
}

async function getApplicantByFilter(filters: {
  id?: string;
  passport?: string;
  etas?: string;
  userId: string;
  isAdmin: boolean;
}) {
  const conditions: string[] = [];
  const args: string[] = [];

  if (filters.id) {
    conditions.push("id = ?");
    args.push(filters.id);
  }

  if (filters.passport) {
    conditions.push("passport_number = ?");
    args.push(filters.passport.toUpperCase());
  }

  if (filters.etas) {
    conditions.push("etas_number = ?");
    args.push(filters.etas);
  }

  if (conditions.length === 0) {
    return null;
  }

  const result = filters.isAdmin
    ? await turso.execute({
        sql: `SELECT * FROM applicants WHERE (${conditions.join(" OR ")}) LIMIT 1`,
        args,
      })
    : await turso.execute({
        sql: `SELECT * FROM applicants WHERE user_id = ? AND (${conditions.join(" OR ")}) LIMIT 1`,
        args: [filters.userId, ...args],
      });

  const row = result.rows[0] as unknown as Record<string, unknown> | undefined;
  return row ? rowToApplicant(row) : null;
}

const LIST_COLUMNS = [
  "id",
  "given_name",
  "surname",
  "date_of_birth",
  "nationality",
  "passport_number",
  "passport_issue_date",
  "passport_expiry_date",
  "sex",
  "visit_purpose",
  "sponsor",
  "etas_number",
  "user_id",
  "created_by_username",
  "user_updated",
  "created_at",
  "etas_issue_date",
  "etas_expiry_date",
].join(", ");

async function listApplicantsByRole(filters: {
  userId: string;
  isAdmin: boolean;
}) {
  // Photo data is stored as a base64 data URL and can be large; the list
  // view doesn't render photos, so exclude that column to keep the
  // response small and avoid timeouts/size limits with many applicants.
  const result = filters.isAdmin
    ? await turso.execute({
        sql: `SELECT ${LIST_COLUMNS} FROM applicants ORDER BY created_at DESC`,
      })
    : await turso.execute({
        sql: `SELECT ${LIST_COLUMNS} FROM applicants WHERE user_id = ? ORDER BY created_at DESC`,
        args: [filters.userId],
      });

  return result.rows.map((row) =>
    rowToApplicant(row as unknown as Record<string, unknown>),
  );
}

export async function GET(request: NextRequest) {
  try {
    const sessionUser = getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureApplicantsSchema();
    await ensureApplicantsOwnershipSchema();
    await ensureApplicantsIndexes();
    const user = await findUserById(sessionUser.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAdmin = user.role === "admin";

    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id")?.trim();
    const passport = searchParams.get("passport")?.trim();
    const etas = searchParams.get("etas")?.trim();

    if (!id && !passport && !etas) {
      const data = await listApplicantsByRole({
        userId: sessionUser.id,
        isAdmin,
      });
      return NextResponse.json({ data });
    }

    const data = await getApplicantByFilter({
      id,
      passport,
      etas,
      userId: sessionUser.id,
      isAdmin,
    });

    if (!data) {
      return NextResponse.json({ error: "Applicant not found" }, { status: 404 });
    }

    return NextResponse.json({ data });
  } catch (error) {
    console.error("GET /api/applicants failed", error);
    return NextResponse.json(
      { error: "Failed to fetch applicant" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const sessionUser = getSessionUser(request);
    if (!sessionUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await ensureApplicantsSchema();
    await ensureApplicantsOwnershipSchema();
    await ensureApplicantsIndexes();
    const user = await findUserById(sessionUser.id);

    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isAdmin = user.role === "admin";

    const input = (await request.json()) as ApplicantUpsertInput;

    const requiredFields: Array<keyof ApplicantUpsertInput> = [
      "given_name",
      "surname",
      "date_of_birth",
      "nationality",
      "passport_number",
      "passport_issue_date",
      "passport_expiry_date",
      "sex",
      "visit_purpose",
      "sponsor",
      "etas_number",
      "applicant_photo_url",
    ];

    const missing = requiredFields.filter((field) => !String(input[field] ?? "").trim());
    if (missing.length > 0) {
      return NextResponse.json(
        { error: `Missing required fields: ${missing.join(", ")}` },
        { status: 400 }
      );
    }

    const id = input.id?.trim() || crypto.randomUUID();
    const normalizedPassport = input.passport_number.trim().toUpperCase();

    // Every save (new application or edit) is treated as a fresh issuance.
    const etasIssueDate = new Date();
    const etasExpiryDate = new Date(etasIssueDate);
    etasExpiryDate.setMonth(etasExpiryDate.getMonth() + 1);

    const existing = await turso.execute({
      sql: isAdmin
        ? "SELECT id, user_id, created_by_username FROM applicants WHERE id = ? LIMIT 1"
        : "SELECT id, user_id, created_by_username FROM applicants WHERE id = ? AND user_id = ? LIMIT 1",
      args: isAdmin ? [id] : [id, sessionUser.id],
    });

    if (existing.rows.length > 0) {
      const existingRow = existing.rows[0] as
        | { user_id?: unknown; created_by_username?: unknown }
        | undefined;
      const ownerUserId = String(existingRow?.user_id ?? sessionUser.id);
      const createdByUsername = String(
        existingRow?.created_by_username ?? user.username,
      );

      await turso.execute({
        sql: `
          UPDATE applicants
          SET
            given_name = ?,
            surname = ?,
            date_of_birth = ?,
            nationality = ?,
            passport_number = ?,
            passport_issue_date = ?,
            passport_expiry_date = ?,
            sex = ?,
            visit_purpose = ?,
            sponsor = ?,
            etas_number = ?,
            applicant_photo_url = ?,
            user_id = ?,
            created_by_username = ?,
            user_updated = ?,
            etas_issue_date = ?,
            etas_expiry_date = ?
          WHERE id = ?
        `,
        args: [
          input.given_name,
          input.surname,
          input.date_of_birth,
          input.nationality,
          normalizedPassport,
          input.passport_issue_date,
          input.passport_expiry_date,
          input.sex,
          input.visit_purpose,
          input.sponsor,
          input.etas_number,
          input.applicant_photo_url,
          ownerUserId,
          createdByUsername,
          user.username,
          etasIssueDate.toISOString(),
          etasExpiryDate.toISOString(),
          id,
        ],
      });
    } else {
      await turso.execute({
        sql: `
          INSERT INTO applicants (
            id,
            given_name,
            surname,
            date_of_birth,
            nationality,
            passport_number,
            passport_issue_date,
            passport_expiry_date,
            sex,
            visit_purpose,
            sponsor,
            etas_number,
            applicant_photo_url,
            user_id,
            created_by_username,
            user_updated,
            etas_issue_date,
            etas_expiry_date
          ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `,
        args: [
          id,
          input.given_name,
          input.surname,
          input.date_of_birth,
          input.nationality,
          normalizedPassport,
          input.passport_issue_date,
          input.passport_expiry_date,
          input.sex,
          input.visit_purpose,
          input.sponsor,
          input.etas_number,
          input.applicant_photo_url,
          sessionUser.id,
          user.username,
          user.username,
          etasIssueDate.toISOString(),
          etasExpiryDate.toISOString(),
        ],
      });
    }

    const result = await turso.execute({
      sql: isAdmin
        ? "SELECT * FROM applicants WHERE id = ? LIMIT 1"
        : "SELECT * FROM applicants WHERE id = ? AND user_id = ? LIMIT 1",
      args: isAdmin ? [id] : [id, sessionUser.id],
    });

    const row = result.rows[0] as unknown as Record<string, unknown> | undefined;
    if (!row) {
      return NextResponse.json(
        { error: "Applicant was saved but could not be reloaded" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: rowToApplicant(row) });
  } catch (error) {
    if (
      error instanceof Error &&
      /UNIQUE constraint failed: applicants\.(passport_number|etas_number)/i.test(
        error.message
      )
    ) {
      return NextResponse.json(
        {
          error:
            "Applicant with the same passport number or ETAS number already exists.",
        },
        { status: 409 }
      );
    }

    console.error("POST /api/applicants failed", error);
    return NextResponse.json(
      { error: "Failed to save applicant" },
      { status: 500 }
    );
  }
}