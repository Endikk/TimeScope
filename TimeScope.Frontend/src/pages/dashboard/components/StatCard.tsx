import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, LucideIcon } from 'lucide-react';

type ColorType = "blue" | "green" | "purple" | "orange" | "pink" | "cyan";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description: string;
  trend?: string;
  color?: ColorType;
}

const colorClasses: Record<ColorType, {
  bg: string;
  icon: string;
  text: string;
  trend: string;
}> = {
  blue: {
    bg: "bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 border-blue-200 dark:border-blue-800",
    icon: "text-blue-600",
    text: "text-blue-900 dark:text-blue-100",
    trend: "text-blue-600"
  },
  green: {
    bg: "bg-gradient-to-br from-green-50 to-emerald-50 dark:from-green-950/30 dark:to-emerald-950/30 border-green-200 dark:border-green-800",
    icon: "text-green-600",
    text: "text-green-900 dark:text-green-100",
    trend: "text-green-600"
  },
  purple: {
    bg: "bg-gradient-to-br from-purple-50 to-violet-50 dark:from-purple-950/30 dark:to-violet-950/30 border-purple-200 dark:border-purple-800",
    icon: "text-purple-600",
    text: "text-purple-900 dark:text-purple-100",
    trend: "text-purple-600"
  },
  orange: {
    bg: "bg-gradient-to-br from-orange-50 to-amber-50 dark:from-orange-950/30 dark:to-amber-950/30 border-orange-200 dark:border-orange-800",
    icon: "text-orange-600",
    text: "text-orange-900 dark:text-orange-100",
    trend: "text-orange-600"
  },
  pink: {
    bg: "bg-gradient-to-br from-pink-50 to-rose-50 dark:from-pink-950/30 dark:to-rose-950/30 border-pink-200 dark:border-pink-800",
    icon: "text-pink-600",
    text: "text-pink-900 dark:text-pink-100",
    trend: "text-pink-600"
  },
  cyan: {
    bg: "bg-gradient-to-br from-cyan-50 to-sky-50 dark:from-cyan-950/30 dark:to-sky-950/30 border-cyan-200 dark:border-cyan-800",
    icon: "text-cyan-600",
    text: "text-cyan-900 dark:text-cyan-100",
    trend: "text-cyan-600"
  }
};

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  color = "blue"
}: StatCardProps) {
  const colors = colorClasses[color];

  return (
    <Card className={`${colors.bg} border-2 shadow-sm hover:shadow-lg transition-all hover:scale-[1.02] active:scale-[0.98]`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2 px-3 md:px-6 pt-3 md:pt-6">
        <CardTitle className="text-xs sm:text-sm font-medium font-body text-muted-foreground truncate pr-2">{title}</CardTitle>
        <div className="p-1.5 md:p-2 bg-background/50 rounded-lg shrink-0">
          <Icon className={`h-4 w-4 sm:h-5 sm:w-5 ${colors.icon}`} />
        </div>
      </CardHeader>
      <CardContent className="px-3 md:px-6 pb-3 md:pb-6">
        <div className={`text-2xl sm:text-3xl font-bold font-heading ${colors.text} mb-1`}>{value}</div>
        <p className="text-xs md:text-sm text-muted-foreground font-body leading-tight">{description}</p>
        {trend && (
          <div className={`text-xs ${colors.trend} mt-2 font-body font-medium flex items-center gap-1 px-2 py-1 bg-background/50 rounded-md w-fit`}>
            <TrendingUp className="h-3 w-3 shrink-0" />
            <span className="truncate">{trend}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
