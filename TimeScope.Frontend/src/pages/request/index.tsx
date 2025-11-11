import React, { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { PageHeader } from "@/components/layout/PageHeader"
import { useRequests } from "@/lib/hooks/use-requests"
import { UserRequest } from "@/lib/api/services/requests.service"
import { CURRENT_USER } from "@/lib/config/user"
import {
  Inbox,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  Mail,
  Calendar,
  User,
  FileText,
  MessageSquare,
  Filter,
  AlertTriangle,
} from "lucide-react"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

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

const STATUS_CONFIG: Record<string, { label: string; icon: React.ComponentType<{ className?: string }>; color: string }> = {
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
      // Clear the selection after successful update
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
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette demande ?")) return

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
        <div className="min-h-[100vh] flex-1 rounded-xl bg-white md:min-h-min">
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
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl bg-white md:min-h-min">
        <div className="max-w-7xl mx-auto space-y-6 p-6">

          {/* Header */}
          <PageHeader
            icon={Inbox}
            title="Gestion des Demandes"
            description="Visualisez et gérez les demandes des utilisateurs"
          />

          {/* Filtres */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtres
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4 flex-wrap">
                <div className="flex-1 max-w-xs">
                  <Select value={statusFilter} onValueChange={handleFilterChange}>
                    <SelectTrigger>
                      <SelectValue placeholder="Filtrer par statut" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Tous les statuts</SelectItem>
                      <SelectItem value="pending">En attente</SelectItem>
                      <SelectItem value="approved">Approuvées</SelectItem>
                      <SelectItem value="rejected">Rejetées</SelectItem>
                      <SelectItem value="completed">Terminées</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Inbox className="h-4 w-4" />
                  {filteredRequests.length} demande{filteredRequests.length !== 1 ? "s" : ""}
                </div>
                {isAdmin && (
                  <div className="flex gap-2 ml-auto">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => fetchAllRequests()}
                      disabled={loading}
                    >
                      Actualiser
                    </Button>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Liste des demandes */}
          {filteredRequests.length === 0 ? (
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
          ) : (
            <div className="space-y-4">
              {filteredRequests.map((request) => {
                const StatusIcon = STATUS_CONFIG[request.status]?.icon || AlertCircle
                const RequestIcon = getRequestIcon(request.requestType)

                return (
                  <Card key={request.id} className="hover:shadow-md transition-shadow">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <RequestIcon className="h-5 w-5 text-primary" />
                            <CardTitle className="text-xl">{request.title}</CardTitle>
                          </div>
                          <CardDescription className="flex items-center gap-4 flex-wrap">
                            <span className="flex items-center gap-1">
                              <User className="h-4 w-4" />
                              {request.name}
                            </span>
                            <span className="flex items-center gap-1">
                              <Mail className="h-4 w-4" />
                              {request.email}
                            </span>
                            <span className="flex items-center gap-1">
                              <Calendar className="h-4 w-4" />
                              {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                          </CardDescription>
                        </div>
                        <div className="flex items-center gap-2">
                          <Badge variant={PRIORITY_CONFIG[request.priority]?.variant || "default"}>
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {PRIORITY_CONFIG[request.priority]?.label || request.priority}
                          </Badge>
                          <Badge
                            variant="outline"
                            className={STATUS_CONFIG[request.status]?.color}
                          >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {STATUS_CONFIG[request.status]?.label || request.status}
                          </Badge>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm font-semibold mb-1">Type de demande:</p>
                          <p className="text-sm text-muted-foreground">
                            {REQUEST_TYPE_LABELS[request.requestType] || request.requestType}
                          </p>
                        </div>
                        <div>
                          <p className="text-sm font-semibold mb-1">Description:</p>
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            {request.description}
                          </p>
                        </div>
                        {request.adminResponse && (
                          <div className="bg-muted/50 p-3 rounded-md">
                            <p className="text-sm font-semibold mb-1 flex items-center gap-1">
                              <MessageSquare className="h-4 w-4" />
                              Réponse de l'administration:
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {request.adminResponse}
                            </p>
                          </div>
                        )}
                        <div className="flex gap-2 pt-2 flex-wrap items-center">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleViewDetails(request)}
                          >
                            Voir les détails
                          </Button>
                          {isAdmin && getAvailableStatusOptions(request.status).length > 0 && (
                            <>
                              <Select
                                value={statusChanges[request.id] || ""}
                                onValueChange={(value) =>
                                  setStatusChanges(prev => ({ ...prev, [request.id]: value }))
                                }
                              >
                                <SelectTrigger className="w-[180px] h-9">
                                  <SelectValue placeholder="Changer statut" />
                                </SelectTrigger>
                                <SelectContent>
                                  {getAvailableStatusOptions(request.status).map((option) => (
                                    <SelectItem key={option.value} value={option.value}>
                                      {option.label}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                              <Button
                                variant="default"
                                size="sm"
                                className="bg-focustime-primary hover:opacity-90"
                                onClick={() => handleStatusChangeFromCard(request.id)}
                                disabled={!statusChanges[request.id] || isUpdating}
                              >
                                <CheckCircle2 className="h-4 w-4 mr-1" />
                                Valider
                              </Button>
                            </>
                          )}
                          {isAdmin && (
                            <Button
                              variant="ghost"
                              size="sm"
                              className="text-red-600 hover:text-red-700 hover:bg-red-50"
                              onClick={() => handleDelete(request.id)}
                            >
                              Supprimer
                            </Button>
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </div>
      </div>

      {/* Dialog pour les détails et la réponse */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{selectedRequest?.title}</DialogTitle>
            <DialogDescription>
              Demande soumise par {selectedRequest?.name} le{" "}
              {selectedRequest && new Date(selectedRequest.createdAt).toLocaleDateString("fr-FR")}
            </DialogDescription>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4 py-4">
              <div>
                <p className="text-sm font-semibold mb-1">Type de demande:</p>
                <p className="text-sm text-muted-foreground">
                  {REQUEST_TYPE_LABELS[selectedRequest.requestType] || selectedRequest.requestType}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold mb-1">Description:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedRequest.description}
                </p>
              </div>

              <div>
                <p className="text-sm font-semibold mb-1">Justification:</p>
                <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                  {selectedRequest.justification}
                </p>
              </div>

              <div className="flex items-center gap-4">
                <div>
                  <p className="text-sm font-semibold mb-1">Priorité:</p>
                  <Badge variant={PRIORITY_CONFIG[selectedRequest.priority]?.variant || "default"}>
                    {PRIORITY_CONFIG[selectedRequest.priority]?.label || selectedRequest.priority}
                  </Badge>
                </div>
                <div>
                  <p className="text-sm font-semibold mb-1">Statut:</p>
                  <Badge variant="outline" className={STATUS_CONFIG[selectedRequest.status]?.color}>
                    {STATUS_CONFIG[selectedRequest.status]?.label || selectedRequest.status}
                  </Badge>
                </div>
              </div>

              {isAdmin && (
                <div>
                  <p className="text-sm font-semibold mb-2">Réponse de l'administration:</p>
                  <Textarea
                    value={adminResponse}
                    onChange={(e) => setAdminResponse(e.target.value)}
                    placeholder="Entrez votre réponse ou commentaires..."
                    className="min-h-[100px]"
                  />
                </div>
              )}

              {!isAdmin && selectedRequest.adminResponse && (
                <div>
                  <p className="text-sm font-semibold mb-1">Réponse de l'administration:</p>
                  <div className="bg-muted p-3 rounded-md">
                    <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                      {selectedRequest.adminResponse}
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}

          {isAdmin && selectedRequest && (
            <DialogFooter className="flex-col sm:flex-row gap-2">
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={isUpdating}
              >
                Fermer
              </Button>
              {selectedRequest.status === "pending" && (
                <>
                  <Button
                    variant="default"
                    className="bg-green-600 hover:bg-green-700"
                    onClick={() => handleUpdateStatus("approved")}
                    disabled={isUpdating}
                  >
                    <CheckCircle2 className="h-4 w-4 mr-1" />
                    {isUpdating ? "Traitement..." : "Approuver"}
                  </Button>
                  <Button
                    variant="destructive"
                    onClick={() => handleUpdateStatus("rejected")}
                    disabled={isUpdating}
                  >
                    <XCircle className="h-4 w-4 mr-1" />
                    {isUpdating ? "Traitement..." : "Rejeter"}
                  </Button>
                </>
              )}
              {selectedRequest.status === "approved" && (
                <Button
                  variant="default"
                  className="bg-blue-600 hover:bg-blue-700"
                  onClick={() => handleUpdateStatus("completed")}
                  disabled={isUpdating}
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  {isUpdating ? "Traitement..." : "Marquer comme terminée"}
                </Button>
              )}
              {selectedRequest.status === "rejected" && (
                <Button
                  variant="default"
                  className="bg-orange-600 hover:bg-orange-700"
                  onClick={() => handleUpdateStatus("pending")}
                  disabled={isUpdating}
                >
                  <Clock className="h-4 w-4 mr-1" />
                  {isUpdating ? "Traitement..." : "Remettre en attente"}
                </Button>
              )}
            </DialogFooter>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
