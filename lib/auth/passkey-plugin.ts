import { z } from "zod"
import { APIError, createAuthEndpoint } from "better-auth/api"
import { setSessionCookie } from "better-auth/cookies"
import {
  generateRegistrationOptions,
  verifyRegistrationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from "@simplewebauthn/server"
import { eq } from "drizzle-orm"
import { db, schema } from "@/lib/db/client"
import { getPool } from "@/lib/moment/db"
import { isUuid } from "@/lib/moment/db"

interface PluginOptions {
  rpID: string
  rpName: string
  origin: string
}

// Better-Auth plugin: adds four WebAuthn endpoints to the auth handler.
// Registration: register-options → register
// Authentication: auth-options → authenticate
// Both paths create a proper Better-Auth signed session cookie on success
// and link the anonymous Moment session to the new traveller account.
export function travellerPasskeyPlugin(opts: PluginOptions) {
  return {
    id: "traveller-passkey",
    endpoints: {
      passkeyRegisterOptions: createAuthEndpoint(
        "/passkey/register-options",
        { method: "POST", requireHeaders: true, body: z.object({ email: z.string().email() }) },
        async (ctx) => {
          const existing = await ctx.context.internalAdapter.findUserByEmail(ctx.body.email)
          const existingCreds = existing
            ? await db
                .select({ credentialId: schema.travellerPasskey.credentialId })
                .from(schema.travellerPasskey)
                .where(eq(schema.travellerPasskey.userId, existing.user.id))
            : []

          const options = await generateRegistrationOptions({
            rpName: opts.rpName,
            rpID: opts.rpID,
            userName: ctx.body.email,
            userID: new TextEncoder().encode(ctx.body.email),
            attestationType: "none",
            authenticatorSelection: {
              authenticatorAttachment: "platform",
              requireResidentKey: true,
              residentKey: "required",
              userVerification: "required",
            },
            excludeCredentials: existingCreds.map((c) => ({ id: c.credentialId })),
          })

          await ctx.context.internalAdapter.createVerificationValue({
            identifier: `passkey-reg:${ctx.body.email}`,
            value: options.challenge,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          })

          return ctx.json(options)
        },
      ),

      passkeyRegister: createAuthEndpoint(
        "/passkey/register",
        {
          method: "POST",
          requireHeaders: true,
          body: z.object({
            email: z.string().email(),
            name: z.string().optional(),
            credential: z.any(),
          }),
        },
        async (ctx) => {
          const challengeRecord = await ctx.context.internalAdapter.consumeVerificationValue(
            `passkey-reg:${ctx.body.email}`,
          )
          if (!challengeRecord) throw new APIError("BAD_REQUEST", { message: "Challenge expired — please try again" })

          const verification = await verifyRegistrationResponse({
            response: ctx.body.credential,
            expectedChallenge: challengeRecord.value,
            expectedOrigin: opts.origin,
            expectedRPID: opts.rpID,
          })

          if (!verification.verified || !verification.registrationInfo) {
            throw new APIError("BAD_REQUEST", { message: "Passkey verification failed" })
          }

          const { credential, credentialDeviceType, credentialBackedUp, aaguid } = verification.registrationInfo

          let userResult = await ctx.context.internalAdapter.findUserByEmail(ctx.body.email)
          let user = userResult?.user
          if (!user) {
            user = await ctx.context.internalAdapter.createUser({
              email: ctx.body.email,
              name: ctx.body.name ?? ctx.body.email.split("@")[0],
              emailVerified: false,
              createdAt: new Date(),
              updatedAt: new Date(),
            })
          }
          if (!user) throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to create user" })

          await db
            .insert(schema.travellerPasskey)
            .values({
              userId: user.id,
              credentialId: credential.id,
              publicKey: Buffer.from(credential.publicKey).toString("base64"),
              counter: credential.counter,
              deviceType: credentialDeviceType,
              backedUp: credentialBackedUp,
              transports: credential.transports ?? null,
              aaguid,
            })
            .onConflictDoNothing()

          const session = await ctx.context.internalAdapter.createSession(user.id)
          if (!session) throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to create session" })

          await setSessionCookie(ctx, { session, user })
          await linkAnonymousSession(ctx, user.id)

          return ctx.json({ token: session.token, user: { id: user.id, email: user.email, name: user.name } })
        },
      ),

      passkeyAuthOptions: createAuthEndpoint(
        "/passkey/auth-options",
        { method: "POST", requireHeaders: true },
        async (ctx) => {
          const challengeId = crypto.randomUUID()
          const options = await generateAuthenticationOptions({
            rpID: opts.rpID,
            userVerification: "required",
          })

          await ctx.context.internalAdapter.createVerificationValue({
            identifier: `passkey-auth:${challengeId}`,
            value: options.challenge,
            expiresAt: new Date(Date.now() + 5 * 60 * 1000),
          })

          return ctx.json({ ...options, challengeId })
        },
      ),

      passkeyAuthenticate: createAuthEndpoint(
        "/passkey/authenticate",
        {
          method: "POST",
          requireHeaders: true,
          body: z.object({ challengeId: z.string(), credential: z.any() }),
        },
        async (ctx) => {
          const challengeRecord = await ctx.context.internalAdapter.consumeVerificationValue(
            `passkey-auth:${ctx.body.challengeId}`,
          )
          if (!challengeRecord) throw new APIError("BAD_REQUEST", { message: "Challenge expired — please try again" })

          const credentialId: string = ctx.body.credential.id
          const [passkey] = await db
            .select()
            .from(schema.travellerPasskey)
            .where(eq(schema.travellerPasskey.credentialId, credentialId))
            .limit(1)
          if (!passkey) throw new APIError("UNAUTHORIZED", { message: "Passkey not registered" })

          const verification = await verifyAuthenticationResponse({
            response: ctx.body.credential,
            expectedChallenge: challengeRecord.value,
            expectedOrigin: opts.origin,
            expectedRPID: opts.rpID,
            credential: {
              id: passkey.credentialId,
              publicKey: new Uint8Array(Buffer.from(passkey.publicKey, "base64")),
              counter: passkey.counter,
            },
          })

          if (!verification.verified) throw new APIError("UNAUTHORIZED", { message: "Passkey authentication failed" })

          await db
            .update(schema.travellerPasskey)
            .set({ counter: verification.authenticationInfo.newCounter })
            .where(eq(schema.travellerPasskey.credentialId, credentialId))

          const [userRow] = await db
            .select()
            .from(schema.travellerUsers)
            .where(eq(schema.travellerUsers.id, passkey.userId))
            .limit(1)
          if (!userRow) throw new APIError("UNAUTHORIZED", { message: "User not found" })

          const session = await ctx.context.internalAdapter.createSession(userRow.id)
          if (!session) throw new APIError("INTERNAL_SERVER_ERROR", { message: "Failed to create session" })

          const safeUserRow = { ...userRow, name: userRow.name ?? "" }
          await setSessionCookie(ctx, { session, user: safeUserRow })
          await linkAnonymousSession(ctx, userRow.id)

          return ctx.json({ token: session.token, user: { id: userRow.id, email: userRow.email, name: userRow.name } })
        },
      ),
    },
  }
}

// Read moment_session cookie and link that anonymous session row to the new user.
// Idempotent — skips if already linked or cookie is absent.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function linkAnonymousSession(ctx: any, userId: string) {
  const sid = ctx.getCookie?.("moment_session") ?? null
  if (!sid || !isUuid(sid)) return
  try {
    await getPool().query(
      "UPDATE anonymous_session SET linked_user_id = $1 WHERE id = $2 AND linked_user_id IS NULL",
      [userId, sid],
    )
  } catch {
    // Non-fatal — twin home still works without a linked session
  }
}
