import { Card, CardContent } from "@/components/ui/card"
import { Building2, Target, Calendar, MessageSquare } from "lucide-react"

export const REQUEST_TYPES = [
  { value: "projet", label: "Nouveau Projet", icon: Building2, color: "bg-purple-500" },
  { value: "activite", label: "Nouvelle Activité", icon: Target, color: "bg-green-500" },
  { value: "template", label: "Nouveau Template", icon: Calendar, color: "bg-purple-500" },
  { value: "autre", label: "Autre Demande", icon: MessageSquare, color: "bg-gray-500" },
]

export function RequestTypeCards() {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
      {REQUEST_TYPES.map((type) => (
        <Card key={type.value} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 text-center">
            <div className={`w-12 h-12 ${type.color} rounded-lg flex items-center justify-center mx-auto mb-3`}>
              <type.icon className="h-6 w-6 text-white" />
            </div>
            <h3 className="font-semibold text-sm">{type.label}</h3>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}