import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface MonthlyStatsProps {
  selectedMonth: number
  selectedYear: number
  setSelectedMonth: (month: number) => void
  setSelectedYear: (year: number) => void
  monthlyTotal: number
  workingDays: number
  monthNames: string[]
}

interface MonthlyStatsPropsExtended extends MonthlyStatsProps {
  viewMode: 'week' | 'month'
  setViewMode: (mode: 'week' | 'month') => void
  selectedWeek: number
  setSelectedWeek: (week: number) => void
}

export function MonthlyStats({
  selectedMonth,
  selectedYear,
  setSelectedMonth,
  setSelectedYear,
  monthNames,
  viewMode,
  setViewMode,
  selectedWeek,
  setSelectedWeek,
}: MonthlyStatsPropsExtended) {
  // Calculer le nombre de semaines dans le mois
  const getWeeksInMonth = (year: number, month: number) => {
    const firstDay = new Date(year, month, 1)
    const lastDay = new Date(year, month + 1, 0)
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7 // Lundi = 0
    const daysInMonth = lastDay.getDate()
    return Math.ceil((daysInMonth + firstDayOfWeek) / 7)
  }

  const weeksInMonth = getWeeksInMonth(selectedYear, selectedMonth)

  const handlePreviousMonth = () => {
    if (selectedMonth === 0) {
      setSelectedMonth(11)
      setSelectedYear(selectedYear - 1)
    } else {
      setSelectedMonth(selectedMonth - 1)
    }
    setSelectedWeek(0) // Reset à la semaine 1
  }

  const handleNextMonth = () => {
    if (selectedMonth === 11) {
      setSelectedMonth(0)
      setSelectedYear(selectedYear + 1)
    } else {
      setSelectedMonth(selectedMonth + 1)
    }
    setSelectedWeek(0) // Reset à la semaine 1
  }

  const handlePrevious = () => {
    if (viewMode === 'week') {
      if (selectedWeek > 0) {
        setSelectedWeek(selectedWeek - 1)
      } else {
        // Passer au mois précédent, dernière semaine
        handlePreviousMonth()
        const prevMonth = selectedMonth === 0 ? 11 : selectedMonth - 1
        const prevYear = selectedMonth === 0 ? selectedYear - 1 : selectedYear
        const weeksInPrevMonth = getWeeksInMonth(prevYear, prevMonth)
        setSelectedWeek(weeksInPrevMonth - 1)
      }
    } else {
      handlePreviousMonth()
    }
  }

  const handleNext = () => {
    if (viewMode === 'week') {
      if (selectedWeek < weeksInMonth - 1) {
        setSelectedWeek(selectedWeek + 1)
      } else {
        // Passer au mois suivant, première semaine
        handleNextMonth()
        setSelectedWeek(0)
      }
    } else {
      handleNextMonth()
    }
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={handlePrevious}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
            aria-label={viewMode === 'week' ? 'Semaine précédente' : 'Mois précédent'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <button
            onClick={handleNext}
            className="p-2 hover:bg-muted rounded-lg transition-colors text-foreground"
            aria-label={viewMode === 'week' ? 'Semaine suivante' : 'Mois suivant'}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <div className="flex items-center gap-2">
            {viewMode === 'week' && (
              <Select value={selectedWeek.toString()} onValueChange={(value) => setSelectedWeek(parseInt(value))}>
                <SelectTrigger className="w-auto border-none shadow-none text-xl font-semibold hover:bg-muted p-2 text-foreground">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: weeksInMonth }, (_, i) => (
                    <SelectItem key={i} value={i.toString()}>Semaine {i + 1}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}

            <Select value={selectedMonth.toString()} onValueChange={(value) => setSelectedMonth(parseInt(value))}>
              <SelectTrigger className="w-auto border-none shadow-none text-xl font-semibold hover:bg-muted p-2 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {monthNames.map((month, index) => (
                  <SelectItem key={index} value={index.toString()}>{month}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={selectedYear.toString()} onValueChange={(value) => setSelectedYear(parseInt(value))}>
              <SelectTrigger className="w-auto border-none shadow-none text-xl font-semibold hover:bg-muted p-2 text-foreground">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Array.from({ length: 5 }, (_, i) => selectedYear - 2 + i).map((year) => (
                  <SelectItem key={year} value={year.toString()}>{year}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setViewMode('week')}
            className={`px-4 py-2 text-sm border rounded-lg transition-colors flex items-center gap-2 ${viewMode === 'week' ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' : 'hover:bg-muted text-foreground border-border'
              }`}
          >
            Semaine
          </button>
          <button
            onClick={() => setViewMode('month')}
            className={`px-4 py-2 text-sm border rounded-lg transition-colors flex items-center gap-2 ${viewMode === 'month' ? 'bg-blue-600 text-white hover:bg-blue-700 border-blue-600' : 'hover:bg-muted text-foreground border-border'
              }`}
          >
            Mois
          </button>
          {/* Export button moved to QuickActions (right side) */}
        </div>
      </div>
    </div>
  )
}