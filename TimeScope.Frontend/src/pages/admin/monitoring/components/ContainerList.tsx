import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { ContainerMetrics } from "@/lib/api/services/monitoring.service";
import { useEffect, useRef, useState } from "react";
import { Line, LineChart, ResponsiveContainer, YAxis } from "recharts";
import { Activity, Box } from "lucide-react";

interface ContainerListProps {
    containers: ContainerMetrics[];
}

interface ContainerHistory {
    [id: string]: { cpu: number; memory: number }[];
}

export function ContainerList({ containers }: ContainerListProps) {
    const [history, setHistory] = useState<ContainerHistory>({});
    const historyRef = useRef<ContainerHistory>({});

    useEffect(() => {
        const next = { ...historyRef.current };
        let hasChanges = false;

        containers.forEach(c => {
            if (!next[c.id]) {
                next[c.id] = [];
                hasChanges = true;
            }
            // Keep last 20 points
            const newHistory = [...next[c.id], { cpu: c.cpuUsage || 0, memory: c.memoryUsagePercent || 0 }];
            if (newHistory.length > 20) newHistory.shift();
            next[c.id] = newHistory;
            hasChanges = true;
        });

        if (hasChanges) {
            historyRef.current = next;
            setHistory(next);
        }
    }, [containers]);

    return (
        <Card className="border shadow-sm">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Activity className="h-5 w-5 text-blue-500" />
                    Active Containers
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="rounded-md border">
                    <Table>
                        <TableHeader>
                            <TableRow className="bg-muted/50">
                                <TableHead className="w-[250px]">Container</TableHead>
                                <TableHead>State</TableHead>
                                <TableHead>CPU Usage</TableHead>
                                <TableHead>Memory Usage</TableHead>
                                <TableHead className="w-[120px]">Activity</TableHead>
                            </TableRow>
                        </TableHeader>
                        <TableBody>
                            {containers.map((container) => (
                                <TableRow key={container.id} className="hover:bg-muted/50 transition-colors">
                                    <TableCell>
                                        <div className="flex flex-col">
                                            <span className="font-semibold flex items-center gap-2">
                                                <Box className="h-4 w-4 text-muted-foreground" />
                                                {container.name.replace('/', '')}
                                            </span>
                                            <span className="text-xs text-muted-foreground truncate max-w-[200px]" title={container.image}>
                                                {container.image}
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <Badge
                                            variant="outline"
                                            className={`
                        ${container.state === 'running' ? 'border-green-500 text-green-600 bg-green-50 dark:bg-green-950/20' : ''}
                        ${container.state === 'exited' ? 'border-red-500 text-red-600 bg-red-50 dark:bg-red-950/20' : ''}
                        ${container.state === 'paused' ? 'border-yellow-500 text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20' : ''}
                      `}
                                        >
                                            {container.state}
                                        </Badge>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium">{(container.cpuUsage ?? 0).toFixed(2)}%</span>
                                            <div className="w-24 h-1.5 bg-secondary rounded-full overflow-hidden">
                                                <div
                                                    className="h-full bg-blue-500 transition-all duration-500"
                                                    style={{ width: `${Math.min(container.cpuUsage ?? 0, 100)}%` }}
                                                />
                                            </div>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="flex flex-col gap-1">
                                            <span className="font-medium">{(container.memoryUsagePercent ?? 0).toFixed(2)}%</span>
                                            <span className="text-xs text-muted-foreground">
                                                {((container.memoryUsage ?? 0) / 1024 / 1024).toFixed(0)} MB
                                            </span>
                                        </div>
                                    </TableCell>
                                    <TableCell>
                                        <div className="h-[35px] w-[100px]">
                                            <ResponsiveContainer width="100%" height="100%">
                                                <LineChart data={history[container.id] || []}>
                                                    <Line
                                                        type="monotone"
                                                        dataKey="cpu"
                                                        stroke="#3b82f6"
                                                        strokeWidth={2}
                                                        dot={false}
                                                        isAnimationActive={false}
                                                    />
                                                    <YAxis domain={[0, 100]} hide />
                                                </LineChart>
                                            </ResponsiveContainer>
                                        </div>
                                    </TableCell>
                                </TableRow>
                            ))}
                            {containers.length === 0 && (
                                <TableRow>
                                    <TableCell colSpan={5} className="h-24 text-center text-muted-foreground">
                                        No active containers found
                                    </TableCell>
                                </TableRow>
                            )}
                        </TableBody>
                    </Table>
                </div>
            </CardContent>
        </Card>
    );
}
