import { notFound } from 'next/navigation'

// This catch-all route triggers the not-found.tsx page
// for any unmatched routes within the [locale] segment
export default function CatchAllPage() {
  notFound()
}
