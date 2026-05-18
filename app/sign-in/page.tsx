"use client"

import { useState, useCallback } from "react"
import Link from "next/link"
import Image from "next/image"
import { Fingerprint } from "lucide-react"
import { motion, AnimatePresence } from "motion/react"
import { useRouter } from "next/navigation"

// ── WebAuthn helpers ──────────────────────────────────────────────────────────

function getPasskeyRpId(): string {
  return process.env.NEXT_PUBLIC_PASSKEY_RP_ID ?? window.location.hostname
}

async function passkeyRegister(email: string, displayName: string): Promise<boolean> {
  if (!window.PublicKeyCredential) return false
  const rpId = getPasskeyRpId()
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "Ohana", id: rpId },
      user: {
        id: crypto.getRandomValues(new Uint8Array(16)),
        name: email,
        displayName,
      },
      pubKeyCredParams: [
        { alg: -7, type: "public-key" },   // ES256
        { alg: -257, type: "public-key" }, // RS256
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        requireResidentKey: true,
        residentKey: "required",
        userVerification: "required",
      },
      timeout: 60_000,
      attestation: "none",
    },
  }) as PublicKeyCredential | null
  if (!credential) return false
  // TODO: send credential to backend when Better Auth is wired up
  localStorage.setItem("ohana_passkey_id", credential.id)
  return true
}

async function passkeyAuthenticate(): Promise<boolean> {
  if (!window.PublicKeyCredential) return false
  const rpId = getPasskeyRpId()
  const assertion = await navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rpId,
      userVerification: "required",
      timeout: 60_000,
    },
  }) as PublicKeyCredential | null
  if (!assertion) return false
  // TODO: verify assertion on backend when Better Auth is wired up
  return true
}

// ── FloatingInput ─────────────────────────────────────────────────────────────

function FloatingInput({
  id,
  label,
  type,
  value,
  onChange,
}: {
  id: string
  label: string
  type: string
  value: string
  onChange: (v: string) => void
}) {
  const [focused, setFocused] = useState(false)
  const raised = focused || value.length > 0
  return (
    <div className="relative pt-5">
      <label
        htmlFor={id}
        className="pointer-events-none absolute left-0 transition-all duration-200"
        style={{
          top: raised ? "0" : "19px",
          fontSize: raised ? "10px" : "14px",
          letterSpacing: raised ? "0.07em" : "0",
          textTransform: raised ? "uppercase" : "none",
          color: focused ? "var(--color-clay)" : "var(--color-muted)",
        }}
      >
        {label}
      </label>
      <input
        id={id}
        type={type}
        value={value}
        autoComplete={
          type === "email" ? "email" :
          type === "password" ? "current-password" :
          "name"
        }
        onChange={(e) => onChange(e.target.value)}
        onFocus={() => setFocused(true)}
        onBlur={() => setFocused(false)}
        className="w-full bg-transparent pb-2 pt-1 text-[15px] outline-none"
        style={{
          borderBottom: `1px solid ${focused ? "var(--color-clay)" : "var(--color-line)"}`,
          color: "var(--color-ink)",
          transition: "border-color 0.2s",
        }}
      />
    </div>
  )
}

// ── Divider ───────────────────────────────────────────────────────────────────

function Divider() {
  return (
    <div className="flex items-center gap-3 my-1">
      <span className="flex-1 h-px" style={{ background: "var(--color-line)" }} />
      <span className="text-[11px] uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>or</span>
      <span className="flex-1 h-px" style={{ background: "var(--color-line)" }} />
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────

type Mode = "signin" | "signup"
type PasskeyState = "idle" | "pending" | "error" | "unsupported"

export default function SignInPage() {
  const [mode, setMode] = useState<Mode>("signin")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [name, setName] = useState("")
  const [loading, setLoading] = useState(false)
  const [passkeyState, setPasskeyState] = useState<PasskeyState>("idle")
  const router = useRouter()

  const handlePasskey = useCallback(async () => {
    if (!window.PublicKeyCredential) {
      setPasskeyState("unsupported")
      return
    }
    setPasskeyState("pending")
    try {
      let ok: boolean
      if (mode === "signup") {
        ok = await passkeyRegister(email, name || email)
      } else {
        ok = await passkeyAuthenticate()
      }
      if (ok) router.push("/moment")
      else setPasskeyState("idle")
    } catch (err) {
      // NotAllowedError = user cancelled — treat as idle, not an error
      if (err instanceof DOMException && err.name === "NotAllowedError") {
        setPasskeyState("idle")
      } else {
        setPasskeyState("error")
      }
    }
  }, [mode, email, name, router])

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    await new Promise((r) => setTimeout(r, 900))
    router.push("/moment")
  }

  const passkeyDisabled = mode === "signup" && email.trim() === ""

  return (
    <div className="flex min-h-screen">
      {/* ── Left panel ── */}
      <div className="relative hidden lg:flex lg:w-[52%] flex-col">
        <Image
          src="/bali.jpg"
          alt=""
          fill
          preload
          className="object-cover"
          style={{ filter: "saturate(0.88) brightness(0.94)" }}
        />
        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, oklch(0.18 0.03 55 / 0.96) 0%, oklch(0.18 0.03 55 / 0.52) 38%, oklch(0.18 0.03 55 / 0.18) 100%)",
          }}
        />
        <Link href="/" className="absolute top-10 left-12 z-10 flex items-center gap-2 no-underline">
          <motion.span animate={{ rotate: -10 }} className="inline-block text-base"
            style={{ filter: "drop-shadow(0 3px 6px oklch(0.62 0.14 45 / 0.35))" }}>
            🌺
          </motion.span>
          <span className="text-[18px] italic"
            style={{ fontFamily: "var(--font-serif)", fontVariationSettings: '"opsz" 40', color: "white" }}>
            Ohana
          </span>
        </Link>
        <div className="relative z-10 mt-auto p-14 pb-16">
          <p className="mb-5 text-[10px] uppercase tracking-[0.18em]"
            style={{ color: "oklch(0.82 0.1 48)" }}>
            Ohana Travel
          </p>
          <h2 style={{
            fontFamily: "var(--font-serif)",
            fontVariationSettings: '"opsz" 144',
            fontWeight: 400,
            fontStyle: "italic",
            fontSize: "clamp(2.2rem, 3.2vw, 3rem)",
            color: "white",
            lineHeight: 1.08,
            letterSpacing: "-0.03em",
          }}>
            Your kind<br />of place,<br />found.
          </h2>
          <p className="mt-5 text-[13px] leading-relaxed"
            style={{ color: "rgba(255,255,255,0.52)", maxWidth: "28ch" }}>
            Join the travellers who found their corner of the world — not from an algorithm, but from who they are.
          </p>
        </div>
      </div>

      {/* ── Right panel ── */}
      <div className="flex flex-1 flex-col" style={{ background: "var(--color-surface)" }}>
        {/* Mobile logo */}
        <div className="flex items-center px-8 py-6 lg:hidden">
          <Link href="/" className="flex items-center gap-2 no-underline">
            <span className="text-base" style={{ filter: "drop-shadow(0 2px 5px oklch(0.62 0.14 45 / 0.3))" }}>🌺</span>
            <span className="text-[18px] italic"
              style={{ fontFamily: "var(--font-serif)", fontVariationSettings: '"opsz" 40', color: "var(--color-ink)" }}>
              Ohana
            </span>
          </Link>
        </div>

        <div className="flex flex-1 items-center justify-center px-8 pb-16 pt-4 md:px-14 lg:px-20">
          <div className="w-full max-w-[22rem]">

            {/* Heading */}
            <AnimatePresence mode="wait">
              <motion.h1
                key={mode}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
                style={{
                  fontFamily: "var(--font-serif)",
                  fontVariationSettings: '"opsz" 72',
                  fontWeight: 400,
                  fontStyle: "italic",
                  fontSize: "clamp(1.7rem, 3.5vw, 2.3rem)",
                  color: "var(--color-ink)",
                  letterSpacing: "-0.03em",
                  marginBottom: "2rem",
                  lineHeight: 1.1,
                }}
              >
                {mode === "signin" ? "Welcome back." : "Join the journey."}
              </motion.h1>
            </AnimatePresence>

            {/* Tab switcher */}
            <div className="flex mb-7 border-b" style={{ borderColor: "var(--color-line)" }}>
              {(["signin", "signup"] as const).map((m) => (
                <button key={m} type="button" onClick={() => { setMode(m); setPasskeyState("idle") }}
                  className="relative bg-transparent border-none cursor-pointer"
                  style={{
                    color: mode === m ? "var(--color-ink)" : "var(--color-muted)",
                    fontWeight: mode === m ? 500 : 400,
                    fontSize: "13px",
                    paddingBottom: "12px",
                    paddingRight: "24px",
                  }}>
                  {m === "signin" ? "Sign in" : "Create account"}
                  {mode === m && (
                    <motion.span layoutId="tab-indicator"
                      className="absolute left-0 right-6"
                      style={{ bottom: "-1px", height: "1.5px", background: "var(--color-clay)" }}
                      transition={{ type: "spring", stiffness: 400, damping: 30 }}
                    />
                  )}
                </button>
              ))}
            </div>

            {/* ── Email fields (sign-up only above passkey) ── */}
            <AnimatePresence>
              {mode === "signup" && (
                <motion.div
                  key="signup-fields"
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
                  style={{ overflow: "hidden" }}
                  className="flex flex-col gap-5 mb-6"
                >
                  <FloatingInput id="name" label="Your name" type="text" value={name} onChange={setName} />
                  <FloatingInput id="email-top" label="Email address" type="email" value={email} onChange={setEmail} />
                </motion.div>
              )}
            </AnimatePresence>

            {/* ── Passkey button ── */}
            <div className="flex flex-col gap-3">
              <motion.button
                type="button"
                disabled={passkeyState === "pending" || passkeyDisabled}
                onClick={handlePasskey}
                whileHover={passkeyState !== "pending" && !passkeyDisabled ? { y: -1 } : {}}
                whileTap={passkeyState !== "pending" && !passkeyDisabled ? { scale: 0.98 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 20 }}
                className="relative w-full flex items-center justify-center gap-2.5 rounded-full py-3.5 text-[13px] font-medium cursor-pointer border overflow-hidden"
                style={{
                  borderColor: passkeyState === "error" ? "oklch(0.62 0.18 25)" : "var(--color-line)",
                  color: passkeyState === "error" ? "oklch(0.62 0.18 25)" :
                         passkeyDisabled ? "var(--color-muted)" : "var(--color-ink)",
                  background: "transparent",
                  opacity: passkeyDisabled ? 0.5 : 1,
                  transition: "border-color 0.2s, color 0.2s, opacity 0.2s",
                }}
              >
                {passkeyState === "pending" ? (
                  <>
                    <span className="inline-block h-3.5 w-3.5 rounded-full border-2 animate-spin"
                      style={{ borderColor: "var(--color-line)", borderTopColor: "var(--color-clay)" }} />
                    Waiting for passkey…
                  </>
                ) : passkeyState === "error" ? (
                  <>
                    <Fingerprint size={15} />
                    Something went wrong — try again
                  </>
                ) : passkeyState === "unsupported" ? (
                  <>
                    <Fingerprint size={15} />
                    Passkeys not supported in this browser
                  </>
                ) : (
                  <>
                    <Fingerprint size={15} />
                    {mode === "signin" ? "Continue with passkey" : "Create passkey account"}
                    {mode === "signup" && passkeyDisabled && (
                      <span className="text-[11px] ml-0.5" style={{ color: "var(--color-muted)" }}>
                        (enter email first)
                      </span>
                    )}
                  </>
                )}
              </motion.button>

              <Divider />
            </div>

            {/* ── Email / password form ── */}
            <form onSubmit={handlePasswordSubmit} className="flex flex-col gap-5 mt-1">
              {mode === "signin" && (
                <FloatingInput id="email" label="Email address" type="email" value={email} onChange={setEmail} />
              )}
              <FloatingInput id="password" label="Password" type="password" value={password} onChange={setPassword} />

              {mode === "signin" && (
                <div className="flex justify-end -mt-2">
                  <button type="button" className="text-[12px] bg-transparent border-none p-0 cursor-pointer"
                    style={{ color: "var(--color-muted)" }}>
                    Forgot password?
                  </button>
                </div>
              )}

              <motion.button
                type="submit"
                disabled={loading}
                whileHover={!loading ? { scale: 1.02, y: -1 } : {}}
                whileTap={!loading ? { scale: 0.98 } : {}}
                transition={{ type: "spring", stiffness: 400, damping: 17 }}
                className="relative mt-1 w-full rounded-full py-3.5 text-[13px] font-medium text-white cursor-pointer overflow-hidden"
                style={{
                  background: loading ? "var(--color-muted)" : "var(--color-clay)",
                  boxShadow: loading ? "none" : "0 2px 16px var(--color-clay-glow)",
                  transition: "background 0.2s, box-shadow 0.2s",
                  border: "none",
                }}
              >
                <AnimatePresence mode="wait">
                  {loading ? (
                    <motion.span key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                      className="flex items-center justify-center gap-2">
                      <span className="inline-block h-3.5 w-3.5 rounded-full border-2 animate-spin"
                        style={{ borderColor: "rgba(255,255,255,0.3)", borderTopColor: "white" }} />
                      {mode === "signin" ? "Signing in…" : "Creating account…"}
                    </motion.span>
                  ) : (
                    <motion.span key="i" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                      {mode === "signin" ? "Sign in with password" : "Create account with password"}
                    </motion.span>
                  )}
                </AnimatePresence>
              </motion.button>
            </form>

            {/* Footer switch */}
            <p className="mt-7 text-center text-[12px]" style={{ color: "var(--color-muted)" }}>
              {mode === "signin" ? (
                <>New to Ohana?{" "}
                  <button type="button" onClick={() => setMode("signup")}
                    className="bg-transparent border-none p-0 cursor-pointer underline"
                    style={{ color: "var(--color-clay)", fontSize: "12px" }}>
                    Create an account
                  </button>
                </>
              ) : (
                <>Already have an account?{" "}
                  <button type="button" onClick={() => setMode("signin")}
                    className="bg-transparent border-none p-0 cursor-pointer underline"
                    style={{ color: "var(--color-clay)", fontSize: "12px" }}>
                    Sign in
                  </button>
                </>
              )}
            </p>

          </div>
        </div>
      </div>
    </div>
  )
}
