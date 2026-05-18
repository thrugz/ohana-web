import { drizzle } from "drizzle-orm/node-postgres"
import { Pool } from "pg"
import * as schema from "./schema"

declare global {
  var __travellerPgPool: Pool | undefined
}

// Pool is created lazily on first access. DATABASE_URL absence only causes a
// connection error when a query is actually executed (not at module load).
const pool =
  globalThis.__travellerPgPool ??
  new Pool({ connectionString: process.env.DATABASE_URL ?? "", max: 10 })

if (process.env.NODE_ENV !== "production") {
  globalThis.__travellerPgPool = pool
}

export const db = drizzle(pool, { schema })
export type DB = typeof db
export { schema }
