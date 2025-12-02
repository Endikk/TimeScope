import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface TaskData {
  status: string;
  value: number;
  color: string;
}

interface TaskCompletionChartProps {
  data: TaskData[];
}

export function TaskCompletionChart({ data }: TaskCompletionChartProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-heading text-foreground">Statut des tâches</CardTitle>
        <CardDescription className="font-body text-muted-foreground">Répartition de vos tâches par statut</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {data.some(d => d.value > 0) ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                labelLine={false}
                label={({ status, value }) => `${status}: ${value}`}
                labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="value"
                style={{ fill: 'hsl(var(--foreground))' }}
              >
                {data.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--card))',
                  borderColor: 'hsl(var(--border))',
                  color: 'hsl(var(--foreground))'
                }}
                itemStyle={{ color: 'hsl(var(--foreground))' }}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-full text-muted-foreground">
            Aucune tâche disponible
          </div>
        )}
      </CardContent>
    </Card>
  );
}
