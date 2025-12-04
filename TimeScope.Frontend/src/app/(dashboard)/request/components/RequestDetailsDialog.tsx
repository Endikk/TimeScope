import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Textarea } from "@/components/ui/textarea"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { UserRequest } from "@/lib/api/services/requests.service"
import { CheckCircle2, XCircle, Clock, LucideIcon } from "lucide-react"

interface RequestDetailsDialogProps {
    open: boolean
    onOpenChange: (open: boolean) => void
    selectedRequest: UserRequest | null
    isAdmin: boolean
    isUpdating: boolean
    adminResponse: string
    onAdminResponseChange: (value: string) => void
    onUpdateStatus: (status: string) => void
    REQUEST_TYPE_LABELS: Record<string, string>
    PRIORITY_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }>
    STATUS_CONFIG: Record<string, { label: string; icon: LucideIcon; color: string }>
}

export function RequestDetailsDialog({
    open,
    onOpenChange,
    selectedRequest,
    isAdmin,
    isUpdating,
    adminResponse,
    onAdminResponseChange,
    onUpdateStatus,
    REQUEST_TYPE_LABELS,
    PRIORITY_CONFIG,
    STATUS_CONFIG
}: RequestDetailsDialogProps) {
    return (
        <Dialog open={open} onOpenChange={onOpenChange}>
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
                                    onChange={(e) => onAdminResponseChange(e.target.value)}
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
                            onClick={() => onOpenChange(false)}
                            disabled={isUpdating}
                        >
                            Fermer
                        </Button>
                        {selectedRequest.status === "pending" && (
                            <>
                                <Button
                                    variant="default"
                                    className="bg-green-600 hover:bg-green-700"
                                    onClick={() => onUpdateStatus("approved")}
                                    disabled={isUpdating}
                                >
                                    <CheckCircle2 className="h-4 w-4 mr-1" />
                                    {isUpdating ? "Traitement..." : "Approuver"}
                                </Button>
                                <Button
                                    variant="destructive"
                                    onClick={() => onUpdateStatus("rejected")}
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
                                onClick={() => onUpdateStatus("completed")}
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
                                onClick={() => onUpdateStatus("pending")}
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
    )
}
