import { Card, CardContent } from "@/components/ui/card"
import { Building2, Target, Calendar, MessageSquare } from "lucide-react"


export const REQUEST_TYPES = [
    { value: "project", label: "Nouveau Projet", icon: Building2, color: "bg-gradient-to-br from-purple-500 to-indigo-600 shadow-lg shadow-purple-200" },
    { value: "activity", label: "Nouvelle Activité", icon: Target, color: "bg-gradient-to-br from-green-500 to-emerald-600 shadow-lg shadow-green-200" },
    { value: "template", label: "Nouveau Template", icon: Calendar, color: "bg-gradient-to-br from-blue-500 to-cyan-600 shadow-lg shadow-blue-200" },
    { value: "other", label: "Autre Demande", icon: MessageSquare, color: "bg-gradient-to-br from-orange-500 to-amber-600 shadow-lg shadow-orange-200" },
]

export function RequestTypeCards() {
    return (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            {REQUEST_TYPES.map((type) => (
                <Card key={type.value} className="hover:shadow-xl hover:scale-105 transition-all duration-300 border-2 border-gray-100">
                    <CardContent className="p-4 text-center">
                        <div className={`w-14 h-14 ${type.color} rounded-xl flex items-center justify-center mx-auto mb-3 transform transition-transform hover:rotate-6`}>
                            <type.icon className="h-7 w-7 text-white" />
                        </div>
                        <h3 className="font-semibold text-sm text-gray-800">{type.label}</h3>
                    </CardContent>
                </Card>
            ))}
        </div>
    )
}
