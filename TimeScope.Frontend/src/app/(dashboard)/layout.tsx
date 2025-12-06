"use client"

import { AppSidebar, SidebarInset, SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { Separator } from "@/components/ui/separator"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { usePathname } from "next/navigation"
import { ProfileDropdown } from "@/components/ui/profile-dropdown"
import { AnimatedThemeToggler } from "@/components/ui/animated-theme-toggler"
import { useMaintenance } from "@/contexts/MaintenanceContext"
import { useAuth } from "@/contexts/AuthContext"
import { useRouter } from "next/navigation"
import { useEffect } from "react"

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()

    // Génération du fil d'ariane depuis le chemin actuel
    const generateBreadcrumbs = () => {
        const paths = pathname.split("/").filter(Boolean)

        if (paths.length === 0 || (paths.length === 1 && paths[0] === "home")) {
            return [{ label: "Home", path: "/home" }]
        }

        const breadcrumbs = paths.map((path, index) => {
            const fullPath = "/" + paths.slice(0, index + 1).join("/")
            const label = path.charAt(0).toUpperCase() + path.slice(1).replace(/_/g, " ")
            return { label, path: fullPath }
        })

        return breadcrumbs
    }

    const breadcrumbs = generateBreadcrumbs()


    const { isMaintenanceMode, isLoading: isMaintenanceLoading } = useMaintenance()
    const { user, isLoading: isAuthLoading, hasRole } = useAuth()
    const router = useRouter()

    useEffect(() => {
        if (!isAuthLoading) {
            if (!user) {
                router.push('/login')
                return
            }
        }

        if (!isMaintenanceLoading && !isAuthLoading && isMaintenanceMode) {
            // Si le mode maintenance est actif et que l'utilisateur n'est pas admin
            if (user && !hasRole(['Admin'])) {
                router.push('/maintenance')
            }
        }
    }, [isMaintenanceMode, isMaintenanceLoading, isAuthLoading, user, hasRole, router])

    if (isMaintenanceLoading || isAuthLoading) {
        return null // Ou un composant de chargement
    }

    return (
        <SidebarProvider>
            <AppSidebar />
            <SidebarInset>
                <header className="sticky top-0 z-20 flex h-16 shrink-0 items-center gap-2 border-b bg-background/95 backdrop-blur-md supports-[backdrop-filter]:bg-background/60 transition-all duration-300 ease-in-out group-has-[[data-collapsible=icon]]/sidebar-wrapper:h-12 shadow-sm hover:shadow-md">
                    <div className="flex items-center gap-3 px-4 flex-1 animate-in fade-in slide-in-from-top-2 duration-500">
                        <SidebarTrigger className="-ml-1 hover:bg-accent/50 rounded-md transition-all duration-200 hover:scale-105 active:scale-95" />
                        <Separator orientation="vertical" className="mr-2 h-4 bg-border/50" />
                        <Breadcrumb>
                            <BreadcrumbList>
                                {breadcrumbs.map((crumb, index) => (
                                    <div key={crumb.path} className="flex items-center gap-2 animate-in fade-in slide-in-from-left-1 duration-300" style={{ animationDelay: `${index * 50}ms` }}>
                                        {index > 0 && <BreadcrumbSeparator className="text-muted-foreground/50" />}
                                        <BreadcrumbItem>
                                            {index === breadcrumbs.length - 1 ? (
                                                <BreadcrumbPage className="font-semibold text-foreground bg-accent/30 px-2 py-1 rounded-md">
                                                    {crumb.label}
                                                </BreadcrumbPage>
                                            ) : (
                                                <BreadcrumbLink
                                                    href={crumb.path}
                                                    className="transition-all duration-200 hover:text-foreground hover:bg-accent/50 px-2 py-1 rounded-md hover:scale-105"
                                                >
                                                    {crumb.label}
                                                </BreadcrumbLink>
                                            )}
                                        </BreadcrumbItem>
                                    </div>
                                ))}
                            </BreadcrumbList>
                        </Breadcrumb>
                    </div>
                    <div className="flex items-center gap-3 px-4 animate-in fade-in slide-in-from-right-2 duration-500">
                        <AnimatedThemeToggler />
                        <ProfileDropdown variant="header" align="end" />
                    </div>
                </header>
                <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
                    {children}
                </div>
            </SidebarInset>
        </SidebarProvider>
    )
}
