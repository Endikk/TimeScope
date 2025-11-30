import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { DockerMetrics } from "@/lib/api/services/monitoring.service";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { Box, PlayCircle, StopCircle, PauseCircle } from "lucide-react";

interface DockerStatsProps {
    metrics: DockerMetrics | null;
    loading: boolean;
}

export function DockerStats({ metrics, loading }: DockerStatsProps) {
    if (loading || !metrics) {
        return (
            <Card className="h-full">
                <CardHeader>
                    <CardTitle>Docker Overview</CardTitle>
                </CardHeader>
                <CardContent className="h-[300px] flex items-center justify-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                </CardContent>
            </Card>
        );
    }

    const data = [
        { name: "Running", value: metrics.runningContainers ?? 0, color: "#22c55e" },
        { name: "Stopped", value: metrics.stoppedContainers ?? 0, color: "#ef4444" },
        { name: "Paused", value: metrics.pausedContainers ?? 0, color: "#eab308" },
    ];

    const total = metrics.totalContainers ?? 0;

    return (
        <Card className="h-full border shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Box className="h-5 w-5 text-blue-500" />
                    Docker Overview
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Chart Section */}
                    <div className="h-[200px] relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={data}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={80}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {data.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                                />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-3xl font-bold">{total}</span>
                            <span className="text-xs text-muted-foreground uppercase tracking-wider">Total</span>
                        </div>
                    </div>

                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 gap-4 content-center">
                        <div className="flex items-center justify-between p-3 bg-green-50/50 dark:bg-green-950/20 rounded-lg border border-green-100 dark:border-green-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-green-100 dark:bg-green-900/50 rounded-full">
                                    <PlayCircle className="h-4 w-4 text-green-600 dark:text-green-400" />
                                </div>
                                <span className="font-medium text-sm">Running</span>
                            </div>
                            <span className="text-xl font-bold text-green-600 dark:text-green-400">
                                {metrics.runningContainers ?? 0}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-red-50/50 dark:bg-red-950/20 rounded-lg border border-red-100 dark:border-red-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-red-100 dark:bg-red-900/50 rounded-full">
                                    <StopCircle className="h-4 w-4 text-red-600 dark:text-red-400" />
                                </div>
                                <span className="font-medium text-sm">Stopped</span>
                            </div>
                            <span className="text-xl font-bold text-red-600 dark:text-red-400">
                                {metrics.stoppedContainers ?? 0}
                            </span>
                        </div>

                        <div className="flex items-center justify-between p-3 bg-yellow-50/50 dark:bg-yellow-950/20 rounded-lg border border-yellow-100 dark:border-yellow-900/50">
                            <div className="flex items-center gap-3">
                                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/50 rounded-full">
                                    <PauseCircle className="h-4 w-4 text-yellow-600 dark:text-yellow-400" />
                                </div>
                                <span className="font-medium text-sm">Paused</span>
                            </div>
                            <span className="text-xl font-bold text-yellow-600 dark:text-yellow-400">
                                {metrics.pausedContainers ?? 0}
                            </span>
                        </div>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
