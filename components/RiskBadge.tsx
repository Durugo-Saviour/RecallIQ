import { Badge } from "@/components/ui/badge"

interface RiskBadgeProps {
  score: number
}

export function RiskBadge({ score }: RiskBadgeProps) {
  if (score >= 70) {
    return <Badge className="bg-green-100 text-green-800 hover:bg-green-100 border-green-200">Low Risk</Badge>
  }
  if (score >= 40) {
    return <Badge className="bg-amber-100 text-amber-800 hover:bg-amber-100 border-amber-200">Medium Risk</Badge>
  }
  return <Badge className="bg-red-100 text-red-800 hover:bg-red-100 border-red-200">High Risk</Badge>
}
