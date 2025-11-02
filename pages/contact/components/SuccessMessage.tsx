"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2 } from "lucide-react"

interface SuccessMessageProps {
  ticketNumber: string
}

export function SuccessMessage({ ticketNumber }: SuccessMessageProps) {
  return (
    <Card className="border-green-200 bg-green-50">
      <CardContent className="pt-6">
        <div className="flex flex-col items-center text-center space-y-4">
          <div className="rounded-full bg-green-500 p-3">
            <CheckCircle2 className="h-6 w-6 text-white" />
          </div>
          <h3 className="text-xl font-semibold text-green-900">
            Demande envoyée avec succès !
          </h3>
          <p className="text-green-700 max-w-md">
            Votre demande a été transmise à l'équipe d'administration. 
            Vous recevrez une réponse sous 24-48h par email.
          </p>
          <Badge className="bg-green-100 text-green-800">
            Ticket #{ticketNumber}
          </Badge>
        </div>
      </CardContent>
    </Card>
  )
}