import { MomentFlow } from "@/components/moment/MomentFlow"

// Server entry for the Moment flow. The anonymous session is created by the
// client hook's first call to /api/moment/session.
export default function MomentPage() {
  return <MomentFlow />
}
