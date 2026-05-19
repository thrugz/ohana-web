"use client"

import { startRegistration, startAuthentication } from "@simplewebauthn/browser"

// These helpers call the WebAuthn endpoints added by travellerPasskeyPlugin.
// They handle the two-step WebAuthn dance (options fetch + credential creation).
// Both return true on success, false on failure or user cancellation.
// They do NOT navigate; callers own that decision.

export async function passkeyRegister(email: string, name: string): Promise<boolean> {
  if (!window.PublicKeyCredential) return false

  const optRes = await fetch("/api/auth/passkey/register-options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email }),
  })
  if (!optRes.ok) return false
  const options = await optRes.json()

  const credential = await startRegistration({ optionsJSON: options })

  const regRes = await fetch("/api/auth/passkey/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, name, credential }),
  })
  return regRes.ok
}

export async function passkeyAuthenticate(): Promise<boolean> {
  if (!window.PublicKeyCredential) return false

  const optRes = await fetch("/api/auth/passkey/auth-options", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
  })
  if (!optRes.ok) return false
  const { challengeId, ...options } = await optRes.json()

  const credential = await startAuthentication({ optionsJSON: options })

  const authRes = await fetch("/api/auth/passkey/authenticate", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ challengeId, credential }),
  })
  return authRes.ok
}
