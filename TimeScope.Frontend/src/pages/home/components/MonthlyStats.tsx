import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Timer, Activity, Target } from "lucide-react"

interface MonthlyStatsProps {
  selectedMonth: number
  selectedYear: number
  setSelectedMonth: (month: number) => void
  setSelectedYear: (year: number) => void
  monthlyTotal: number
  workingDays: number
  monthNames: string[]
}

export function MonthlyStats({
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
  monthlyTotal,
  workingDays,
  monthNames
}: MonthlyStatsProps) {
  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-primary" />
            <CardTitle>Vue Mensuelle - {monthNames[selectedMonth]} {selectedYear}</CardTitle>
          </div>
          <div className="flex gap-3">
            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="2024">2024</SelectItem>
                <SelectItem value="2025">2025</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-3 gap-6 mb-6">
          <div className="text-center p-4 bg-accent rounded-lg">
            <Timer className="h-8 w-8 text-primary mx-auto mb-2" />
            <div className="text-2xl font-bold text-foreground">{monthlyTotal.toFixed(1)}h</div>
            <div className="text-sm text-muted-foreground">Total du mois</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <Activity className="h-8 w-8 text-green-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-green-900">{workingDays}</div>
            <div className="text-sm text-green-600">Jours travaillés</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <Target className="h-8 w-8 text-purple-600 mx-auto mb-2" />
            <div className="text-2xl font-bold text-purple-900">
              {workingDays > 0 ? (monthlyTotal / workingDays).toFixed(1) : 0}h
            </div>
            <div className="text-sm text-purple-600">Moyenne/jour</div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}