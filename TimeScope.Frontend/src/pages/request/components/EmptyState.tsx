import { Card, CardContent } from "@/components/ui/card"
import { Inbox } from "lucide-react"

interface EmptyStateProps {
  statusFilter: string
  STATUS_CONFIG: Record<string, { label: string }>
}

export function EmptyState({ statusFilter, STATUS_CONFIG }: EmptyStateProps) {
  return (
    <Card>
      <CardContent className="pt-6">
        <div className="flex flex-col items-center justify-center py-12 text-center">
          <Inbox className="h-12 w-12 text-muted-foreground mb-4" />
          <h3 className="text-lg font-semibold mb-2">Aucune demande</h3>
          <p className="text-muted-foreground">
            {statusFilter === "all"
              ? "Aucune demande n'a encore été soumise."
              : `Aucune demande avec le statut "${STATUS_CONFIG[statusFilter]?.label.toLowerCase()}".`}
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
