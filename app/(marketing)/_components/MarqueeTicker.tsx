const DESTINATIONS_A = [
  "Alfama, Lisbon",
  "Shimokitazawa, Tokyo",
  "Sacred Valley, Peru",
  "Yeonnam-dong, Seoul",
  "Croix-Rousse, Lyon",
  "Roma Norte, Mexico City",
  "Kotor, Montenegro",
  "Hauz Khas, Delhi",
  "Le Marais, Paris",
  "Karaköy, Istanbul",
]

const DESTINATIONS_B = [
  "Trastevere, Rome",
  "Paarel, Cape Town",
  "Pigneto, Rome",
  "Prenzlauer Berg, Berlin",
  "Wynwood, Miami",
  "Williamsburg, New York",
  "Fushimi, Kyoto",
  "Vila Madalena, São Paulo",
  "Hackney, London",
  "Palermo Soho, Buenos Aires",
]

function Track({ items, reverse = false, speed = 40 }: { items: string[]; reverse?: boolean; speed?: number }) {
  const doubled = [...items, ...items]
  return (
    <div className="relative overflow-hidden">
      <div
        className="flex w-max gap-8"
        style={{
          animation: `marquee-scroll ${speed}s linear infinite`,
          animationDirection: reverse ? "reverse" : "normal",
        }}
      >
        {doubled.map((d, i) => (
          <span key={i} className="flex shrink-0 items-center gap-4 text-[13px] tracking-wide whitespace-nowrap">
            <span
              className="h-1 w-1 rounded-full shrink-0"
              style={{ background: "var(--color-clay)", opacity: 0.5 }}
            />
            <span style={{ color: "var(--color-muted)" }}>{d}</span>
          </span>
        ))}
      </div>
    </div>
  )
}

export function MarqueeTicker() {
  return (
    <div
      className="border-b border-[var(--color-line)] py-4 overflow-hidden"
      style={{ background: "var(--color-surface)" }}
    >
      <div className="flex flex-col gap-3">
        <Track items={DESTINATIONS_A} speed={50} />
        <Track items={DESTINATIONS_B} reverse speed={45} />
      </div>
    </div>
  )
}
