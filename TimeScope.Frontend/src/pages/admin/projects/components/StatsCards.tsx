import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { FolderKanban, Layers, ListTodo } from 'lucide-react';

interface StatsCardsProps {
  projectsCount: number;
  groupsCount: number;
  tasksCount: number;
}

export function StatsCards({ projectsCount, groupsCount, tasksCount }: StatsCardsProps) {
  return (
    <div className="grid gap-3 md:gap-4 grid-cols-1 sm:grid-cols-3 mb-4 md:mb-8">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6">
          <CardTitle className="text-xs md:text-sm font-medium">Projets</CardTitle>
          <FolderKanban className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="text-xl md:text-2xl font-bold">{projectsCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6">
          <CardTitle className="text-xs md:text-sm font-medium">Sociétés</CardTitle>
          <Layers className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="text-xl md:text-2xl font-bold">{groupsCount}</div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6">
          <CardTitle className="text-xs md:text-sm font-medium">Tâches</CardTitle>
          <ListTodo className="h-4 w-4 text-muted-foreground shrink-0" />
        </CardHeader>
        <CardContent className="px-3 md:px-6">
          <div className="text-xl md:text-2xl font-bold">{tasksCount}</div>
        </CardContent>
      </Card>
    </div>
  );
}
