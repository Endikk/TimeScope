import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3, CheckCircle2, Clock, ListTodo, TrendingUp } from 'lucide-react';

interface ActivityStatsCardProps {
    stats: {
        tasksCompleted: number;
        tasksInProgress: number;
        totalHours: number;
        projectsCount: number;
    };
}

export function ActivityStatsCard({ stats }: ActivityStatsCardProps) {
    return (
        <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
            <CardHeader className="pb-2">
                <div className="flex items-center gap-2">
                    <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <TrendingUp className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                    </div>
                    <div>
                        <CardTitle className="text-xl">Activité</CardTitle>
                        <CardDescription className="mt-1.5">
                            Vos performances sur 30 jours
                        </CardDescription>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="p-6 pt-0">
                <div className="grid grid-cols-2 gap-4">
                    <div className="flex flex-col p-4 rounded-xl bg-indigo-50 dark:bg-indigo-900/10 border border-indigo-100 dark:border-indigo-800/30 hover:bg-indigo-100/50 dark:hover:bg-indigo-900/20 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-indigo-600/80 dark:text-indigo-400">Terminées</span>
                            <CheckCircle2 className="h-4 w-4 text-indigo-600 dark:text-indigo-400" />
                        </div>
                        <p className="text-3xl font-bold text-indigo-700 dark:text-indigo-300">{stats.tasksCompleted}</p>
                        <p className="text-xs text-indigo-600/60 dark:text-indigo-400/60 mt-1">tâches</p>
                    </div>

                    <div className="flex flex-col p-4 rounded-xl bg-blue-50 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-800/30 hover:bg-blue-100/50 dark:hover:bg-blue-900/20 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-blue-600/80 dark:text-blue-400">En cours</span>
                            <ListTodo className="h-4 w-4 text-blue-600 dark:text-blue-400" />
                        </div>
                        <p className="text-3xl font-bold text-blue-700 dark:text-blue-300">{stats.tasksInProgress}</p>
                        <p className="text-xs text-blue-600/60 dark:text-blue-400/60 mt-1">tâches</p>
                    </div>

                    <div className="flex flex-col p-4 rounded-xl bg-violet-50 dark:bg-violet-900/10 border border-violet-100 dark:border-violet-800/30 hover:bg-violet-100/50 dark:hover:bg-violet-900/20 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-violet-600/80 dark:text-violet-400">Heures</span>
                            <Clock className="h-4 w-4 text-violet-600 dark:text-violet-400" />
                        </div>
                        <p className="text-3xl font-bold text-violet-700 dark:text-violet-300">{stats.totalHours}h</p>
                        <p className="text-xs text-violet-600/60 dark:text-violet-400/60 mt-1">travaillées</p>
                    </div>

                    <div className="flex flex-col p-4 rounded-xl bg-cyan-50 dark:bg-cyan-900/10 border border-cyan-100 dark:border-cyan-800/30 hover:bg-cyan-100/50 dark:hover:bg-cyan-900/20 transition-colors">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-sm font-medium text-cyan-600/80 dark:text-cyan-400">Projets</span>
                            <BarChart3 className="h-4 w-4 text-cyan-600 dark:text-cyan-400" />
                        </div>
                        <p className="text-3xl font-bold text-cyan-700 dark:text-cyan-300">{stats.projectsCount}</p>
                        <p className="text-xs text-cyan-600/60 dark:text-cyan-400/60 mt-1">actifs</p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
