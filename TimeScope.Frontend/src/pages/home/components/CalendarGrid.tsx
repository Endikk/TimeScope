
interface CalendarGridProps {
  monthDays: (number | null)[]
  selectedMonth: number
  selectedYear: number
  selectedDate: string | null
  setSelectedDate: (date: string) => void
  getDailyTotal: (date: string) => number
  getIntensityClass: (hours: number) => string
  getTextColorClass: (hours: number) => string
  isNonWorkingDay: (year: number, month: number, day: number) => boolean
}

export function CalendarGrid({
  monthDays,
  selectedMonth,
  selectedYear,
  selectedDate,
  setSelectedDate,
  getDailyTotal,
  getIntensityClass,
  getTextColorClass,
  isNonWorkingDay
}: CalendarGridProps) {
  return (
    <div className="bg-white border rounded-lg p-3">
      <div className="grid grid-cols-7 gap-1 mb-1">
        {["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"].map(day => (
          <div key={day} className="text-center text-xs font-medium text-gray-500 py-1.5">
            {day}
          </div>
        ))}
      </div>
      
      <div className="grid grid-cols-7 gap-1">
        {monthDays.map((day, index) => {
          if (!day) {
            return <div key={index} className="h-12"></div>
          }

          const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const dayTotal = getDailyTotal(dateStr)
          const isSelected = selectedDate === dateStr
          const isToday = dateStr === new Date().toISOString().split('T')[0]
          const isDisabled = isNonWorkingDay(selectedYear, selectedMonth, day)

          return (
            <div
              key={`${selectedYear}-${selectedMonth}-${day}-${index}`}
              className={`
                h-12 w-full p-1.5 rounded border transition-all flex flex-col items-center justify-center
                ${isDisabled
                  ? 'bg-gray-200 text-gray-400 cursor-not-allowed opacity-60'
                  : `cursor-pointer ${getIntensityClass(dayTotal)}`
                }
                ${!isDisabled && isSelected ? 'border-primary ring-1' : 'border-gray-200'}
                ${!isDisabled && !isSelected ? 'hover:border-gray-300' : ''}
                ${isToday && !isDisabled ? 'border-orange-400 ring-1 ring-orange-200' : ''}
              `}
              onClick={() => !isDisabled && setSelectedDate(dateStr)}
              title={isDisabled
                ? `${day}/${selectedMonth + 1}/${selectedYear} - Jour non-travaillé (weekend ou férié)`
                : `${day}/${selectedMonth + 1}/${selectedYear} - ${dayTotal}h travaillées`
              }
            >
              <div className={`text-xs font-semibold leading-none ${
                isDisabled ? 'text-gray-400' : getTextColorClass(dayTotal)
              }`}>
                {day}
              </div>
              {dayTotal > 0 && !isDisabled && (
                <div className={`text-xs ${getTextColorClass(dayTotal)} leading-none mt-0.5`}>
                  {dayTotal}h
                </div>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}