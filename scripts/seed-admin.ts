/**
 * Seed script to create the initial admin user.
 *
 * Usage:
 *   npx tsx scripts/seed-admin.ts
 *
 * Requires DATABASE_URL and ADMIN_EMAIL / ADMIN_PASSWORD env vars.
 */
import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { hash } from "bcryptjs";
import { adminUsers } from "../src/lib/db/schema";

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error("Set ADMIN_EMAIL and ADMIN_PASSWORD environment variables");
    process.exit(1);
  }

  const sql = neon(process.env.DATABASE_URL!);
  const db = drizzle(sql);

  const passwordHash = await hash(password, 12);

  await db
    .insert(adminUsers)
    .values({ email, passwordHash, name: "Rose Horowitz" })
    .onConflictDoNothing();

  console.log(`Admin user created: ${email}`);
}

main().catch(console.error);
