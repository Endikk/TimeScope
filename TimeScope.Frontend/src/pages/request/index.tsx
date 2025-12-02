import { useState } from "react"
import { PageHeader } from "@/components/layout/PageHeader"
import { useRequests } from "@/lib/hooks/use-requests"
import { UserRequest } from "@/lib/api/services/requests.service"
import { CURRENT_USER } from "@/lib/config/user"
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  FileText,
  MessageSquare,
  LucideIcon,
} from "lucide-react"
import { RequestCard, RequestFilters, RequestDetailsDialog, EmptyState } from './components'

const REQUEST_TYPE_LABELS: Record<string, string> = {
  project: "Nouveau projet",
  activity: "Nouvelle activité",
  template: "Nouveau template",
  other: "Autre demande",
}

const PRIORITY_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }> = {
  low: { label: "Faible", variant: "secondary" },
  medium: { label: "Moyenne", variant: "default" },
  high: { label: "Élevée", variant: "destructive" },
}

const STATUS_CONFIG: Record<string, { label: string; icon: LucideIcon; color: string }> = {
  pending: { label: "En attente", icon: Clock, color: "text-yellow-600" },
  approved: { label: "Approuvée", icon: CheckCircle2, color: "text-green-600" },
  rejected: { label: "Rejetée", icon: XCircle, color: "text-red-600" },
  completed: { label: "Terminée", icon: CheckCircle2, color: "text-blue-600" },
}

export default function RequestsPage() {
  const { requests, loading, fetchRequestsByStatus, fetchAllRequests, updateRequestStatus, deleteRequest } = useRequests()
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [selectedRequest, setSelectedRequest] = useState<UserRequest | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [adminResponse, setAdminResponse] = useState("")
  const [isUpdating, setIsUpdating] = useState(false)
  const [statusChanges, setStatusChanges] = useState<Record<string, string>>({})

  const isAdmin = CURRENT_USER.role === "Admin" || CURRENT_USER.role === "Manager"

  const handleFilterChange = async (value: string) => {
    setStatusFilter(value)
    if (value === "all") {
      await fetchAllRequests()
    } else {
      await fetchRequestsByStatus(value)
    }
  }

  const handleViewDetails = (request: UserRequest) => {
    setSelectedRequest(request)
    setAdminResponse(request.adminResponse || "")
    setIsDialogOpen(true)
  }

  const handleUpdateStatus = async (status: string) => {
    if (!selectedRequest) return

    setIsUpdating(true)
    try {
      await updateRequestStatus(selectedRequest.id, {
        status,
        adminResponse: adminResponse.trim() || undefined,
        reviewedBy: CURRENT_USER.id,
      })
      setIsDialogOpen(false)
      setSelectedRequest(null)
      setAdminResponse("")
    } catch (error) {
      console.error("Failed to update request:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const handleStatusChangeFromCard = async (requestId: string) => {
    const newStatus = statusChanges[requestId]
    if (!newStatus) return

    setIsUpdating(true)
    try {
      await updateRequestStatus(requestId, {
        status: newStatus,
        reviewedBy: CURRENT_USER.id,
      })
      setStatusChanges(prev => {
        const updated = { ...prev }
        delete updated[requestId]
        return updated
      })
    } catch (error) {
      console.error("Failed to update request:", error)
    } finally {
      setIsUpdating(false)
    }
  }

  const getAvailableStatusOptions = (currentStatus: string) => {
    switch (currentStatus) {
      case "pending":
        return [
          { value: "approved", label: "Valider" },
          { value: "rejected", label: "Refuser" },
        ]
      case "approved":
        return [
          { value: "completed", label: "Terminer" },
        ]
      case "rejected":
        return [
          { value: "pending", label: "Remettre en attente" },
        ]
      case "completed":
        return []
      default:
        return []
    }
  }

  const handleDelete = async (id: string) => {
    try {
      await deleteRequest(id)
    } catch (error) {
      console.error("Failed to delete request:", error)
    }
  }

  const filteredRequests = statusFilter === "all"
    ? requests
    : requests.filter(r => r.status === statusFilter)

  const getRequestIcon = (requestType: string) => {
    switch (requestType) {
      case "project":
        return FileText
      case "activity":
        return Clock
      case "template":
        return FileText
      default:
        return MessageSquare
    }
  }

  if (loading && requests.length === 0) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl bg-card md:min-h-min">
          <div className="max-w-7xl mx-auto space-y-6 p-6">
            <PageHeader
              icon={Inbox}
              title="Gestion des Demandes"
              description="Visualisez et gérez les demandes des utilisateurs"
            />
            <div className="flex items-center justify-center h-64">
              <p className="text-muted-foreground">Chargement des demandes...</p>
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-2 md:p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl bg-card md:min-h-min">
        <div className="max-w-7xl mx-auto space-y-4 md:space-y-6 p-3 md:p-6">

          <PageHeader
            icon={Inbox}
            title="Gestion des Demandes"
            description="Visualisez et gérez les demandes des utilisateurs"
          />

          <RequestFilters
            statusFilter={statusFilter}
            onFilterChange={handleFilterChange}
            filteredCount={filteredRequests.length}
            isAdmin={isAdmin}
            loading={loading}
            onRefresh={fetchAllRequests}
          />

          {filteredRequests.length === 0 ? (
            <EmptyState statusFilter={statusFilter} STATUS_CONFIG={STATUS_CONFIG} />
          ) : (
            <div className="space-y-3 md:space-y-4">
              {filteredRequests.map((request) => (
                <RequestCard
                  key={request.id}
                  request={request}
                  isAdmin={isAdmin}
                  isUpdating={isUpdating}
                  statusChanges={statusChanges}
                  onViewDetails={handleViewDetails}
                  onStatusChange={(id, status) => setStatusChanges(prev => ({ ...prev, [id]: status }))}
                  onStatusUpdate={handleStatusChangeFromCard}
                  onDelete={handleDelete}
                  getRequestIcon={getRequestIcon}
                  getAvailableStatusOptions={getAvailableStatusOptions}
                  REQUEST_TYPE_LABELS={REQUEST_TYPE_LABELS}
                  PRIORITY_CONFIG={PRIORITY_CONFIG}
                  STATUS_CONFIG={STATUS_CONFIG}
                />
              ))}
            </div>
          )}
        </div>
      </div>

      <RequestDetailsDialog
        open={isDialogOpen}
        onOpenChange={setIsDialogOpen}
        selectedRequest={selectedRequest}
        isAdmin={isAdmin}
        isUpdating={isUpdating}
        adminResponse={adminResponse}
        onAdminResponseChange={setAdminResponse}
        onUpdateStatus={handleUpdateStatus}
        REQUEST_TYPE_LABELS={REQUEST_TYPE_LABELS}
        PRIORITY_CONFIG={PRIORITY_CONFIG}
        STATUS_CONFIG={STATUS_CONFIG}
      />
    </div>
  )
}
