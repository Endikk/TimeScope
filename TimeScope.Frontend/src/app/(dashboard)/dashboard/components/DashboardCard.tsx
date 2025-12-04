import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { LucideIcon } from "lucide-react"
import { cn } from "@/lib/utils"

interface DashboardCardProps {
    title: string
    value: string | number
    description?: string
    icon: LucideIcon
    trend?: {
        value: number
        label: string
        positive?: boolean
    }
    className?: string
    loading?: boolean
}

export function DashboardCard({
    title,
    value,
    description,
    icon: Icon,
    trend,
    className,
    loading
}: DashboardCardProps) {
    return (
        <Card className={cn("hover:shadow-md transition-all duration-200", className)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                    {title}
                </CardTitle>
                <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
                {loading ? (
                    <div className="h-16 flex items-center">
                        <div className="h-8 w-24 bg-muted animate-pulse rounded" />
                    </div>
                ) : (
                    <div className="flex flex-col space-y-1">
                        <div className="text-2xl font-bold">{value}</div>
                        {description && (
                            <p className="text-xs text-muted-foreground">
                                {description}
                            </p>
                        )}
                        {trend && (
                            <div className={cn(
                                "text-xs font-medium flex items-center mt-1",
                                trend.positive ? "text-green-600" : "text-red-600"
                            )}>
                                {trend.positive ? "+" : ""}{trend.value}%
                                <span className="text-muted-foreground ml-1 font-normal">
                                    {trend.label}
                                </span>
                            </div>
                        )}
                    </div>
                )}
            </CardContent>
        </Card>
    )
}
