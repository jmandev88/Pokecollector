import { db } from "../neon";

export type UserRow = {
  id: string;
  email: string;
  name: string | null;
  image: string | null;
  created_at: string;
};

/**
 * Get user by email
 */
export async function fetchUserByEmail(email: string) {
  const result = await db.query(
    `
    SELECT *
    FROM mcc_users
    WHERE email = $1
    LIMIT 1
    `,
    [email]
  );

  return (result.rows?.[0] as UserRow) ?? null;
}

/**
 * Get user by ID
 */
export async function fetchUserById(id: string) {
  const result = await db.query(
    `
    SELECT *
    FROM mcc_users
    WHERE id = $1
    LIMIT 1
    `,
    [id]
  );

  return (result.rows?.[0] as UserRow) ?? null;
}

/**
 * Create user (Google sign-in)
 */
export async function createUser(user: {
  email: string;
  name: string;
  image?: string;
}) {
  const result = await db.query(
    `
    INSERT INTO mcc_users (email, name, image)
    VALUES ($1, $2, $3)
    RETURNING *
    `,
    [user.email, user.name, user.image ?? null]
  );

  return result.rows[0] as UserRow;
}