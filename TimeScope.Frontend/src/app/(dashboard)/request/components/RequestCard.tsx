import { createElement } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { UserRequest } from "@/lib/api/services/requests.service"
import {
    CheckCircle2,
    User,
    Mail,
    Calendar,
    MessageSquare,
    AlertTriangle,
    LucideIcon
} from "lucide-react"

interface RequestCardProps {
    request: UserRequest
    isAdmin: boolean
    isUpdating: boolean
    statusChanges: Record<string, string>
    onViewDetails: (request: UserRequest) => void
    onStatusChange: (requestId: string, status: string) => void
    onStatusUpdate: (requestId: string) => void
    onDelete: (id: string) => void
    getRequestIcon: (requestType: string) => LucideIcon
    getAvailableStatusOptions: (currentStatus: string) => { value: string; label: string }[]
    REQUEST_TYPE_LABELS: Record<string, string>
    PRIORITY_CONFIG: Record<string, { label: string; variant: "default" | "secondary" | "destructive" }>
    STATUS_CONFIG: Record<string, { label: string; icon: LucideIcon; color: string }>
}

export function RequestCard({
    request,
    isAdmin,
    isUpdating,
    statusChanges,
    onViewDetails,
    onStatusChange,
    onStatusUpdate,
    onDelete,
    getRequestIcon,
    getAvailableStatusOptions,
    REQUEST_TYPE_LABELS,
    PRIORITY_CONFIG,
    STATUS_CONFIG
}: RequestCardProps) {
    const StatusIcon = STATUS_CONFIG[request.status]?.icon || AlertTriangle
    const icon = getRequestIcon(request.requestType)

    return (
        <Card className="hover:shadow-md transition-shadow">
            <CardHeader className="px-3 md:px-6 py-3 md:py-6">
                <div className="flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
                    <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                            {createElement(icon, { className: "h-4 w-4 md:h-5 md:w-5 text-primary shrink-0" })}
                            <CardTitle className="text-base md:text-xl truncate">{request.title}</CardTitle>
                        </div>
                        <CardDescription className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-wrap text-xs md:text-sm">
                            <span className="flex items-center gap-1">
                                <User className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                                <span className="truncate">{request.name}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <Mail className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                                <span className="truncate">{request.email}</span>
                            </span>
                            <span className="flex items-center gap-1">
                                <Calendar className="h-3 w-3 md:h-4 md:w-4 shrink-0" />
                                {new Date(request.createdAt).toLocaleDateString("fr-FR")}
                            </span>
                        </CardDescription>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                        <Badge variant={PRIORITY_CONFIG[request.priority]?.variant || "default"} className="text-xs">
                            <AlertTriangle className="h-3 w-3 mr-1" />
                            {PRIORITY_CONFIG[request.priority]?.label || request.priority}
                        </Badge>
                        <Badge
                            variant="outline"
                            className={`${STATUS_CONFIG[request.status]?.color} text-xs`}
                        >
                            <StatusIcon className="h-3 w-3 mr-1" />
                            {STATUS_CONFIG[request.status]?.label || request.status}
                        </Badge>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="px-3 md:px-6">
                <div className="space-y-3 md:space-y-4">
                    <div>
                        <p className="text-xs md:text-sm font-semibold mb-1">Type de demande:</p>
                        <p className="text-xs md:text-sm text-muted-foreground">
                            {REQUEST_TYPE_LABELS[request.requestType] || request.requestType}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs md:text-sm font-semibold mb-1">Description:</p>
                        <p className="text-xs md:text-sm text-muted-foreground line-clamp-2">
                            {request.description}
                        </p>
                    </div>
                    {request.adminResponse && (
                        <div className="bg-muted/50 p-2 md:p-3 rounded-md">
                            <p className="text-xs md:text-sm font-semibold mb-1 flex items-center gap-1">
                                <MessageSquare className="h-3 w-3 md:h-4 md:w-4" />
                                Réponse de l'administration:
                            </p>
                            <p className="text-xs md:text-sm text-muted-foreground">
                                {request.adminResponse}
                            </p>
                        </div>
                    )}
                    <div className="flex gap-2 pt-2 flex-wrap items-center">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => onViewDetails(request)}
                            className="text-xs md:text-sm w-full sm:w-auto"
                        >
                            Voir les détails
                        </Button>
                        {isAdmin && getAvailableStatusOptions(request.status).length > 0 && (
                            <>
                                <Select
                                    value={statusChanges[request.id] || ""}
                                    onValueChange={(value) => onStatusChange(request.id, value)}
                                >
                                    <SelectTrigger className="w-full sm:w-[160px] md:w-[180px] h-9 text-xs md:text-sm">
                                        <SelectValue placeholder="Changer statut" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {getAvailableStatusOptions(request.status).map((option) => (
                                            <SelectItem key={option.value} value={option.value} className="text-xs md:text-sm">
                                                {option.label}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <Button
                                    variant="default"
                                    size="sm"
                                    className="bg-focustime-primary hover:opacity-90 text-xs md:text-sm w-full sm:w-auto"
                                    onClick={() => onStatusUpdate(request.id)}
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
                                className="text-red-600 dark:text-red-400 hover:text-red-700 dark:hover:text-red-300 hover:bg-red-50 dark:hover:bg-red-900/20 text-xs md:text-sm w-full sm:w-auto"
                                onClick={() => onDelete(request.id)}
                            >
                                Supprimer
                            </Button>
                        )}
                    </div>
                </div>
            </CardContent>
        </Card>
    )
}
