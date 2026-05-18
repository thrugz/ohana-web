import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { db, schema } from "@/lib/db/client"
import { travellerPasskeyPlugin } from "./passkey-plugin"

const rpID = process.env.NEXT_PUBLIC_PASSKEY_RP_ID ?? "localhost"
const origin = process.env.NEXT_PUBLIC_SITE_ORIGIN ?? `https://${rpID}`

export const auth = betterAuth({
  // UUID id generation — load-bearing (see ohana-admin/src/server/auth/config.ts comment).
  // Without "uuid" Better-Auth uses base62 ids that Postgres rejects on UUID columns.
  advanced: {
    database: {
      generateId: "uuid",
    },
  },
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: schema.travellerUsers,
      session: schema.travellerSessions,
      account: schema.travellerAccounts,
      verification: schema.travellerVerifications,
    },
  }),
  emailAndPassword: {
    enabled: true,
  },
  plugins: [
    travellerPasskeyPlugin({ rpID, rpName: "Ohana", origin }),
  ],
})
