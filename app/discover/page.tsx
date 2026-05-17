import { DiscoverFlow } from "@/components/discover/DiscoverFlow"

// Server entry for the Discover flow. The anonymous session is loaded by the
// client hook's first call to /api/moment/session.
export default function DiscoverPage() {
  return <DiscoverFlow />
}
