import { SiteNav } from "./_components/SiteNav"

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteNav />
      <main>{children}</main>
    </>
  )
}
