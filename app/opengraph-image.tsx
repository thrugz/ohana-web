import { ImageResponse } from "next/og"
import { readFile } from "node:fs/promises"
import { join } from "node:path"

export const alt = "Ohana — Your kind of place, found for you"
export const size = { width: 1200, height: 630 }
export const contentType = "image/png"

async function loadFont(): Promise<Buffer | null> {
  try {
    return await readFile(join(process.cwd(), "public/fonts/fraunces-italic.ttf"))
  } catch {
    return null
  }
}

export default async function Image() {
  const font = await loadFont()

  return new ImageResponse(
    (
      <div
        style={{
          width: 1200,
          height: 630,
          display: "flex",
          background: "#FAF7F2",
          position: "relative",
          overflow: "hidden",
        }}
      >
        {/* Ambient glow */}
        <div
          style={{
            position: "absolute",
            top: 0,
            right: 0,
            bottom: 0,
            left: 0,
            background:
              "radial-gradient(ellipse 55% 60% at 30% 60%, rgba(197,106,63,0.12) 0%, transparent 70%)",
          }}
        />

        {/* Ghost watermark "Ohana" */}
        <div
          style={{
            position: "absolute",
            right: -40,
            bottom: -60,
            fontFamily: font ? "Fraunces" : "Georgia",
            fontStyle: "italic",
            fontSize: 380,
            fontWeight: 400,
            color: "rgba(197,106,63,0.07)",
            letterSpacing: "-0.04em",
            lineHeight: 1,
          }}
        >
          Ohana
        </div>

        {/* Top clay bar */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: 4,
            background: "#C56A3F",
          }}
        />

        {/* Content */}
        <div
          style={{
            position: "relative",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "72px 80px",
            maxWidth: 680,
          }}
        >
          {/* Logo row */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 12,
              marginBottom: 40,
            }}
          >
            <span style={{ fontSize: 28 }}>🌺</span>
            <span
              style={{
                fontFamily: font ? "Fraunces" : "Georgia",
                fontStyle: "italic",
                fontSize: 28,
                fontWeight: 400,
                color: "#2A241F",
                letterSpacing: "-0.01em",
              }}
            >
              Ohana
            </span>
          </div>

          {/* Headline */}
          <div
            style={{
              fontFamily: font ? "Fraunces" : "Georgia",
              fontStyle: "italic",
              fontSize: 72,
              fontWeight: 400,
              lineHeight: 1.05,
              letterSpacing: "-0.03em",
              color: "#2A241F",
              marginBottom: 28,
              display: "flex",
              flexWrap: "wrap",
            }}
          >
            <span>Your kind of place,&nbsp;</span>
            <span style={{ color: "#C56A3F" }}>found for you.</span>
          </div>

          {/* Subtext */}
          <div
            style={{
              fontSize: 22,
              color: "#7A6F66",
              lineHeight: 1.6,
              marginBottom: 40,
              maxWidth: 520,
              fontFamily: "system-ui, sans-serif",
            }}
          >
            A travel companion that knows who you are. Not an algorithm.
            Not a search engine. Something better.
          </div>

          {/* Badge */}
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              background: "rgba(197,106,63,0.1)",
              border: "1px solid rgba(197,106,63,0.25)",
              borderRadius: 100,
              padding: "8px 16px",
              width: "fit-content",
            }}
          >
            <div
              style={{
                width: 6,
                height: 6,
                borderRadius: "50%",
                background: "#C56A3F",
              }}
            />
            <span
              style={{
                fontSize: 13,
                letterSpacing: "0.12em",
                textTransform: "uppercase",
                color: "#C56A3F",
                fontFamily: "system-ui, sans-serif",
                fontWeight: 500,
              }}
            >
              Travel companion · In beta
            </span>
          </div>
        </div>

        {/* Right side — destination stack */}
        <div
          style={{
            position: "absolute",
            right: 80,
            top: "50%",
            transform: "translateY(-50%)",
            display: "flex",
            flexDirection: "column",
            gap: 10,
            alignItems: "flex-end",
          }}
        >
          {[
            { name: "Alfama", city: "Lisbon", opacity: 1, offset: 0 },
            { name: "Shimokitazawa", city: "Tokyo", opacity: 0.8, offset: 12 },
            { name: "Sacred Valley", city: "Peru", opacity: 0.6, offset: 24 },
          ].map((d) => (
            <div
              key={d.name}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 10,
                background: "white",
                border: "1px solid rgba(197,106,63,0.15)",
                borderRadius: 100,
                padding: "10px 18px",
                opacity: d.opacity,
                transform: `translateX(${d.offset}px)`,
                boxShadow: "0 2px 12px rgba(42,36,31,0.06)",
              }}
            >
              <div
                style={{
                  width: 6,
                  height: 6,
                  borderRadius: "50%",
                  background: "#C56A3F",
                }}
              />
              <span
                style={{
                  fontSize: 15,
                  fontFamily: "system-ui, sans-serif",
                  color: "#2A241F",
                  fontWeight: 500,
                }}
              >
                {d.name}
              </span>
              <span
                style={{
                  fontSize: 13,
                  fontFamily: "system-ui, sans-serif",
                  color: "#7A6F66",
                }}
              >
                {d.city}
              </span>
            </div>
          ))}
        </div>
      </div>
    ),
    {
      ...size,
      fonts: font
        ? [{ name: "Fraunces", data: font, style: "italic", weight: 400 }]
        : [],
    }
  )
}
