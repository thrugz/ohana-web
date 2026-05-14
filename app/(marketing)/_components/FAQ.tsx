import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion"

const FAQS = [
  {
    q: "What makes Ohana different from other travel apps?",
    a: "Most travel apps are search engines with a nicer UI. Ohana builds a real picture of who you are — your taste, your travel style, the people you travel with — and every recommendation comes from that knowledge, not from what's trending or sponsored.",
  },
  {
    q: "Is Ohana free to use?",
    a: "Yes, Ohana is free to join and use. We're currently in beta. A premium plan with additional features is coming — but the core experience will always be free.",
  },
  {
    q: "How does the companion matching work?",
    a: "When you're open to it, Ohana can connect you with other travelers whose style, pace, and interests match yours. You control the visibility and can opt out entirely at any time.",
  },
  {
    q: "Will my data be sold or used for advertising?",
    a: "No. Your travel data, preferences, and history are yours. We don't sell it, we don't use it for advertising, and we don't share it with third parties. Full stop.",
  },
  {
    q: "Which platforms is Ohana available on?",
    a: "Ohana is available on iOS and Android. A web version is on the way. Sign up here to get early access.",
  },
  {
    q: "What is the giving-back programme?",
    a: "1% of every trip planned with Ohana goes toward humanitarian causes chosen by the community. We also build in optional volunteer opportunities alongside trips, and offer free access to NGO workers and humanitarian staff.",
  },
]

export function FAQ() {
  return (
    <section className="border-b border-[var(--color-line)] px-8 py-20 md:px-20">
      <p className="mb-3 text-[11px] uppercase tracking-widest" style={{ color: "var(--color-muted)" }}>
        Questions
      </p>
      <h2
        className="mb-12"
        style={{
          fontFamily: "var(--font-serif)",
          fontVariationSettings: '"opsz" 72',
          fontWeight: 400,
          fontSize: "clamp(1.8rem, 3.5vw, 2.8rem)",
          lineHeight: 1.15,
          letterSpacing: "-0.02em",
          color: "var(--color-ink)",
        }}
      >
        Common questions.
      </h2>

      <Accordion className="mx-auto max-w-2xl divide-y divide-[var(--color-line)]">
        {FAQS.map((faq, i) => (
          <AccordionItem key={i} value={`faq-${i}`} className="border-0">
            <AccordionTrigger
              className="py-5 text-left text-[15px] font-medium hover:no-underline"
              style={{ color: "var(--color-ink)" }}
            >
              {faq.q}
            </AccordionTrigger>
            <AccordionContent
              className="pb-5 text-[15px] leading-relaxed"
              style={{ color: "var(--color-muted)" }}
            >
              {faq.a}
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  )
}
