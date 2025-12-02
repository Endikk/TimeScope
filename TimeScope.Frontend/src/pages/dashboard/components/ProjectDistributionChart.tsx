import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from 'recharts';

interface ProjectData {
  name: string;
  hours: number;
  color: string;
}

interface ProjectDistributionChartProps {
  data: ProjectData[];
}

export function ProjectDistributionChart({ data }: ProjectDistributionChartProps) {
  return (
    <Card className="bg-card border-border">
      <CardHeader>
        <CardTitle className="font-heading text-foreground">Répartition par projet</CardTitle>
        <CardDescription className="font-body text-muted-foreground">Distribution des heures ce mois-ci</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        {data.length > 0 ? (
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                labelLine={{ stroke: 'hsl(var(--muted-foreground))' }}
                outerRadius={80}
                fill="#8884d8"
                dataKey="hours"
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
            Aucune donnée disponible
          </div>
        )}
      </CardContent>
    </Card>
  );
}
