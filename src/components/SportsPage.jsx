import F1Section from './F1Section'
import IndyCarSection from './IndyCarSection'
import MLBSection from './MLBSection'

export default function SportsPage() {
  return (
    <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
      <h1 className="text-3xl font-bold text-white">Sports Dashboard</h1>
      <F1Section />
      <IndyCarSection />
      <MLBSection />
    </div>
  )
}
