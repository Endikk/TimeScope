"use client"

import { useAuth } from "@/contexts/AuthContext"
import { UserDashboard } from "./components/UserDashboard"

export default function DashboardPage() {
    const { user } = useAuth()

    if (!user) {
        return null
    }

    return (
        <div className="container mx-auto p-6 space-y-8">
            <UserDashboard userId={user.id} />
        </div>
    )
}
