/**
 * push-schema-turso.ts
 * Crée toutes les tables de la base Turso Cloud via @libsql/client.
 * Utiliser uniquement pour la création initiale ou les migrations manuelles.
 *
 * Usage (PowerShell) :
 *   $env:TURSO_DATABASE_URL="libsql://..."; $env:TURSO_AUTH_TOKEN="eyJ..."; npx ts-node --compiler-options '{"module":"CommonJS"}' prisma/push-schema-turso.ts
 */

import { createClient } from '@libsql/client'

const url = process.env.TURSO_DATABASE_URL
const authToken = process.env.TURSO_AUTH_TOKEN

if (!url || !authToken) {
  console.error('❌ TURSO_DATABASE_URL and TURSO_AUTH_TOKEN must be set.')
  process.exit(1)
}

const client = createClient({ url, authToken })

const SQL_STATEMENTS = [
  // ── User ──────────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "User" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "name"      TEXT NOT NULL,
    "email"     TEXT NOT NULL UNIQUE,
    "password"  TEXT NOT NULL,
    "role"      TEXT NOT NULL DEFAULT 'USER',
    "status"    TEXT NOT NULL DEFAULT 'ACTIVE',
    "phone"     TEXT,
    "company"   TEXT,
    "avatar"    TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
  )`,

  // ── Service ───────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "Service" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "title"       TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price"       REAL NOT NULL,
    "duration"    TEXT NOT NULL,
    "category"    TEXT,
    "imageUrl"    TEXT,
    "isActive"    INTEGER NOT NULL DEFAULT 1,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL
  )`,

  // ── Program ───────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "Program" (
    "id"          TEXT NOT NULL PRIMARY KEY,
    "title"       TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "price"       REAL NOT NULL,
    "duration"    TEXT NOT NULL,
    "level"       TEXT,
    "sessions"    INTEGER NOT NULL DEFAULT 6,
    "imageUrl"    TEXT,
    "isActive"    INTEGER NOT NULL DEFAULT 1,
    "createdAt"   DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"   DATETIME NOT NULL
  )`,

  // ── ServiceRequest ────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "ServiceRequest" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "userId"    TEXT NOT NULL,
    "serviceId" TEXT NOT NULL,
    "message"   TEXT NOT NULL,
    "status"    TEXT NOT NULL DEFAULT 'PENDING',
    "adminNote" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("userId")    REFERENCES "User"("id")    ON DELETE CASCADE,
    FOREIGN KEY ("serviceId") REFERENCES "Service"("id") ON DELETE CASCADE
  )`,

  // ── Booking ───────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "Booking" (
    "id"               TEXT NOT NULL PRIMARY KEY,
    "userId"           TEXT NOT NULL,
    "serviceId"        TEXT NOT NULL,
    "serviceRequestId" TEXT,
    "date"             TEXT NOT NULL,
    "time"             TEXT NOT NULL,
    "status"           TEXT NOT NULL DEFAULT 'PENDING',
    "notes"            TEXT,
    "createdAt"        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"        DATETIME NOT NULL,
    FOREIGN KEY ("userId")           REFERENCES "User"("id")           ON DELETE CASCADE,
    FOREIGN KEY ("serviceId")        REFERENCES "Service"("id")        ON DELETE CASCADE,
    FOREIGN KEY ("serviceRequestId") REFERENCES "ServiceRequest"("id") ON DELETE SET NULL
  )`,

  // ── SubscriptionPlan ──────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "SubscriptionPlan" (
    "id"            TEXT NOT NULL PRIMARY KEY,
    "name"          TEXT NOT NULL UNIQUE,
    "price"         REAL NOT NULL,
    "billingPeriod" TEXT NOT NULL DEFAULT 'MONTHLY',
    "features"      TEXT NOT NULL,
    "isActive"      INTEGER NOT NULL DEFAULT 1,
    "createdAt"     DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"     DATETIME NOT NULL
  )`,

  // ── Subscription ──────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "Subscription" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "userId"    TEXT NOT NULL,
    "planId"    TEXT NOT NULL,
    "status"    TEXT NOT NULL DEFAULT 'ACTIVE',
    "startDate" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "endDate"   DATETIME NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id")             ON DELETE CASCADE,
    FOREIGN KEY ("planId") REFERENCES "SubscriptionPlan"("id")
  )`,

  // ── Payment ───────────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "Payment" (
    "id"             TEXT NOT NULL PRIMARY KEY,
    "userId"         TEXT NOT NULL,
    "amount"         REAL NOT NULL,
    "paymentType"    TEXT NOT NULL,
    "referenceId"    TEXT,
    "status"         TEXT NOT NULL DEFAULT 'PENDING',
    "transactionRef" TEXT,
    "createdAt"      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt"      DATETIME NOT NULL,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  )`,

  // ── Transaction ───────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "Transaction" (
    "id"               TEXT NOT NULL PRIMARY KEY,
    "paymentId"        TEXT NOT NULL UNIQUE,
    "grossAmount"      REAL NOT NULL,
    "commissionRate"   REAL NOT NULL DEFAULT 10,
    "commissionAmount" REAL NOT NULL,
    "netAmount"        REAL NOT NULL,
    "createdAt"        DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("paymentId") REFERENCES "Payment"("id")
  )`,

  // ── Notification ──────────────────────────────────────────────────────
  `CREATE TABLE IF NOT EXISTS "Notification" (
    "id"        TEXT NOT NULL PRIMARY KEY,
    "userId"    TEXT NOT NULL,
    "title"     TEXT NOT NULL,
    "message"   TEXT NOT NULL,
    "type"      TEXT NOT NULL DEFAULT 'INFO',
    "isRead"    INTEGER NOT NULL DEFAULT 0,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
  )`,
]

async function main() {
  console.log(`\n🚀 Connecting to Turso: ${url}\n`)

  for (const stmt of SQL_STATEMENTS) {
    const tableName = stmt.match(/CREATE TABLE IF NOT EXISTS "([^"]+)"/)?.[1] ?? '?'
    try {
      await client.execute(stmt)
      console.log(`  ✅ Table "${tableName}" ready`)
    } catch (err) {
      console.error(`  ❌ Failed on "${tableName}":`, err)
      throw err
    }
  }

  // Verify
  const result = await client.execute(
    `SELECT name FROM sqlite_master WHERE type='table' ORDER BY name`
  )
  console.log(`\n📋 Tables in Turso database:`)
  result.rows.forEach((row) => console.log(`   • ${row.name}`))
  console.log(`\n✅ Schema pushed to Turso successfully!\n`)
}

main().catch((e) => {
  console.error(e)
  process.exit(1)
})
