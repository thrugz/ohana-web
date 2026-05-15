// Shared pg pool for the Moment Site API routes. Singleton across hot
// reloads in dev. Connects via DATABASE_URL.
import { Pool } from "pg"

const globalForPg = globalThis as unknown as { momentPgPool?: Pool }

export function getPool(): Pool {
  if (!globalForPg.momentPgPool) {
    globalForPg.momentPgPool = new Pool({ connectionString: process.env.DATABASE_URL })
  }
  return globalForPg.momentPgPool
}

const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

export function isUuid(value: unknown): value is string {
  return typeof value === "string" && UUID_RE.test(value)
}
