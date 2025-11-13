import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';

interface WeeklyData {
  day: string;
  hours: number;
}

interface WeeklyHoursChartProps {
  data: WeeklyData[];
}

export function WeeklyHoursChart({ data }: WeeklyHoursChartProps) {
  return (
    <Card className="bg-white border-fp-text/10">
      <CardHeader>
        <CardTitle className="font-heading text-fp-text">Heures par jour - Cette semaine</CardTitle>
        <CardDescription className="font-body text-fp-text/70">Répartition de votre temps hebdomadaire</CardDescription>
      </CardHeader>
      <CardContent className="h-[300px]">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="day" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="hours" fill="#3B82F6" name="Heures" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
