"use client"

import { useMemo } from "react"
import { useTimeEntries } from "@/lib/hooks/use-timeentries"
import { useTasks } from "@/lib/hooks/use-tasks"
import { useProjects } from "@/lib/hooks/use-projects"
import { useUsageStatistics } from "@/lib/hooks/use-usage-statistics"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { DashboardCard } from "./DashboardCard"
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend, AreaChart, Area
} from "recharts"
import {
    Clock, TrendingUp, Calendar, FolderOpen, RefreshCw
} from "lucide-react"
import {
    startOfWeek, endOfWeek, eachDayOfInterval, format, isSameDay, subDays,
    startOfMonth, eachWeekOfInterval, subWeeks, addDays
} from "date-fns"
import { fr } from "date-fns/locale"

interface UserDashboardProps {
    userId: string
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899']
const STATUS_COLORS = {
    'EnAttente': '#94a3b8',
    'EnCours': '#f59e0b',
    'Termine': '#10b981'
}

export function UserDashboard({ userId }: UserDashboardProps) {
    // Fetch data for the last 30 days for general stats
    const startDate = format(subDays(new Date(), 30), 'yyyy-MM-dd')
    const endDate = format(new Date(), 'yyyy-MM-dd')

    const { timeEntries, loading: loadingEntries, refetch: refetchEntries } = useTimeEntries({ startDate, endDate })
    const { tasks, loading: loadingTasks, refetch: refetchTasks } = useTasks()
    const { projects, loading: loadingProjects, refetch: refetchProjects } = useProjects()
    const { stats: usageStats, loading: loadingStats, refetch: refetchStats } = useUsageStatistics()

    const loading = loadingEntries || loadingTasks || loadingProjects || loadingStats

    const handleRefresh = () => {
        refetchEntries()
        refetchTasks()
        refetchProjects()
        refetchStats()
    }

    const stats = useMemo(() => {
        if (!timeEntries || !tasks || !projects) return null

        const today = new Date()

        // --- 1. Top Cards Stats ---

        // Hours Today
        const todayEntries = timeEntries.filter(e => isSameDay(new Date(e.date), today))
        const hoursToday = todayEntries.reduce((sum, e) => {
            const [h, m] = e.duration.split(':').map(Number)
            return sum + h + (m / 60)
        }, 0)

        // Hours This Week
        const startOfCurrentWeek = startOfWeek(today, { weekStartsOn: 1 })
        const weekEntries = timeEntries.filter(e => new Date(e.date) >= startOfCurrentWeek)
        const hoursWeek = weekEntries.reduce((sum, e) => {
            const [h, m] = e.duration.split(':').map(Number)
            return sum + h + (m / 60)
        }, 0)
        const weekProgress = Math.min((hoursWeek / 35) * 100, 100)

        // Hours This Month
        const startOfCurrentMonth = startOfMonth(today)
        const monthEntries = timeEntries.filter(e => new Date(e.date) >= startOfCurrentMonth)
        const hoursMonth = monthEntries.reduce((sum, e) => {
            const [h, m] = e.duration.split(':').map(Number)
            return sum + h + (m / 60)
        }, 0)
        const monthProgress = Math.min((hoursMonth / 140) * 100, 100)

        // Active Projects (Use global stats if available, else local count)
        const activeProjectsCount = usageStats ? usageStats.totalProjects : projects.length

        // --- 2. Charts Data ---

        // Weekly Activity (Bar Chart)
        const startOfCurrentWorkWeek = startOfWeek(today, { weekStartsOn: 1 })
        const endOfWorkWeek = addDays(startOfCurrentWorkWeek, 4) // Friday

        const workWeekDays = eachDayOfInterval({
            start: startOfCurrentWorkWeek,
            end: endOfWorkWeek
        })

        const weeklyData = workWeekDays.map(day => {
            const dayEntries = timeEntries.filter(e => isSameDay(new Date(e.date), day))
            const totalHours = dayEntries.reduce((sum, e) => {
                const [h, m] = e.duration.split(':').map(Number)
                return sum + h + (m / 60)
            }, 0)
            return {
                name: format(day, 'EEE', { locale: fr }), // lun., mar.
                fullDate: format(day, 'dd MMM', { locale: fr }),
                hours: parseFloat(totalHours.toFixed(2))
            }
        })

        // Monthly Trend (Area Chart) - Last 4 weeks
        const last4Weeks = eachWeekOfInterval({
            start: subWeeks(today, 3),
            end: today
        }, { weekStartsOn: 1 })

        const monthlyTrendData = last4Weeks.map((weekStart, index) => {
            const weekEnd = endOfWeek(weekStart, { weekStartsOn: 1 })
            const weekEntries = timeEntries.filter(e => {
                const d = new Date(e.date)
                return d >= weekStart && d <= weekEnd
            })
            const totalHours = weekEntries.reduce((sum, e) => {
                const [h, m] = e.duration.split(':').map(Number)
                return sum + h + (m / 60)
            }, 0)

            let name = `Sem. - ${3 - index} `
            if (index === 3) name = "Cette sem."

            return {
                name,
                hours: parseFloat(totalHours.toFixed(2))
            }
        })

        // Project Distribution (Pie Chart)
        const projectMap = new Map<string, number>()
        const taskProjectMap = new Map(tasks.map(t => [t.id, t.projectId]))
        const projectNameMap = new Map(projects.map(p => [p.id, p.name]))

        timeEntries.forEach(e => {
            const [h, m] = e.duration.split(':').map(Number)
            const duration = h + (m / 60)
            const projectId = taskProjectMap.get(e.taskId)
            const projectName = projectId ? projectNameMap.get(projectId) : "Inconnu"
            const label = projectName || "Inconnu"
            projectMap.set(label, (projectMap.get(label) || 0) + duration)
        })

        const projectData = Array.from(projectMap.entries())
            .map(([name, value]) => ({ name, value: parseFloat(value.toFixed(2)) }))
            .sort((a, b) => b.value - a.value)

        // Task Status (Pie Chart)
        const statusMap = new Map<string, number>()
        tasks.forEach(t => {
            statusMap.set(t.status, (statusMap.get(t.status) || 0) + 1)
        })
        const taskStatusData = Array.from(statusMap.entries())
            .map(([name, value]) => ({ name, value }))

        return {
            hoursToday,
            hoursWeek,
            weekProgress,
            hoursMonth,
            monthProgress,
            activeProjectsCount,
            weeklyData,
            monthlyTrendData,
            projectData,
            taskStatusData
        }
    }, [timeEntries, tasks, projects, usageStats])

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
            </div>
        )
    }

    if (!stats) {
        return null
    }

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col space-y-2">
                <div className="flex items-center justify-between">
                    <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
                    <Button variant="outline" size="sm" onClick={handleRefresh} className="hover:bg-primary/10">
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Actualiser
                    </Button>
                </div>
                <p className="text-muted-foreground">
                    Vue d'ensemble de votre activité et de vos performances
                </p>
            </div>

            {/* Top Stats Cards */}
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                <DashboardCard
                    title="Heures aujourd'hui"
                    value={`${stats.hoursToday.toFixed(1)} h`}
                    description="Temps enregistré"
                    icon={Clock}
                />
                <DashboardCard
                    title="Heures cette semaine"
                    value={`${stats.hoursWeek.toFixed(1)} h`}
                    description="Sur 35h prévues"
                    icon={Calendar}
                    trend={{
                        value: parseFloat(stats.weekProgress.toFixed(0)),
                        label: "complété",
                        positive: true
                    }}
                />
                <DashboardCard
                    title="Heures ce mois"
                    value={`${stats.hoursMonth.toFixed(1)} h`}
                    description="Sur 140h prévues"
                    icon={TrendingUp}
                    trend={{
                        value: parseFloat(stats.monthProgress.toFixed(0)),
                        label: "complété",
                        positive: true
                    }}
                />
                <DashboardCard
                    title="Projets actifs"
                    value={stats.activeProjectsCount}
                    description="En cours"
                    icon={FolderOpen}
                />
            </div>

            {/* Middle Row: Charts */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Weekly Activity */}
                <Card className="col-span-1 border shadow-sm hover:shadow-md transition-all">
                    <CardHeader>
                        <CardTitle>Heures par jour - Cette semaine</CardTitle>
                        <CardDescription>Répartition de votre temps hebdomadaire</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={stats.weeklyData}>
                                    <defs>
                                        <linearGradient id="colorBar" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.3} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value} `}
                                    />
                                    <Tooltip
                                        cursor={{ fill: 'transparent' }}
                                        contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                    />
                                    <Bar
                                        dataKey="hours"
                                        fill="url(#colorBar)"
                                        radius={[4, 4, 0, 0]}
                                        name="Heures"
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Monthly Trend */}
                <Card className="col-span-1 border shadow-sm hover:shadow-md transition-all">
                    <CardHeader>
                        <CardTitle>Tendance mensuelle</CardTitle>
                        <CardDescription>Évolution du temps de travail par semaine</CardDescription>
                    </CardHeader>
                    <CardContent className="pl-2">
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={stats.monthlyTrendData}>
                                    <defs>
                                        <linearGradient id="colorTrend" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e5e7eb" />
                                    <XAxis
                                        dataKey="name"
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                    />
                                    <YAxis
                                        stroke="#888888"
                                        fontSize={12}
                                        tickLine={false}
                                        axisLine={false}
                                        tickFormatter={(value) => `${value} `}
                                    />
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Area
                                        type="monotone"
                                        dataKey="hours"
                                        stroke="#3b82f6"
                                        strokeWidth={3}
                                        fillOpacity={1}
                                        fill="url(#colorTrend)"
                                        name="Heures"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Bottom Row: Distribution & Status */}
            <div className="grid gap-4 md:grid-cols-2">
                {/* Project Distribution */}
                <Card className="col-span-1 border shadow-sm hover:shadow-md transition-all">
                    <CardHeader>
                        <CardTitle>Répartition par projet</CardTitle>
                        <CardDescription>Distribution des heures ce mois-ci</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.projectData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.projectData.map((entry, index) => (
                                            <Cell key={`cell - ${index} `} fill={COLORS[index % COLORS.length]} />
                                        ))}
                                    </Pie>
                                    <Tooltip formatter={(value: number) => [`${value} h`, 'Durée']} contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                {/* Task Status */}
                <Card className="col-span-1 border shadow-sm hover:shadow-md transition-all">
                    <CardHeader>
                        <CardTitle>Statut des tâches</CardTitle>
                        <CardDescription>Répartition de vos tâches par statut</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="h-[300px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={stats.taskStatusData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={5}
                                        dataKey="value"
                                    >
                                        {stats.taskStatusData.map((entry, index) => (
                                            <Cell
                                                key={`cell - ${index} `}
                                                fill={STATUS_COLORS[entry.name as keyof typeof STATUS_COLORS] || COLORS[index % COLORS.length]}
                                            />
                                        ))}
                                    </Pie>
                                    <Tooltip contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }} />
                                    <Legend />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
