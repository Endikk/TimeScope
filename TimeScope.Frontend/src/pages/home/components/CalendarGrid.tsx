import React from "react"

interface CalendarGridProps {
  monthDays: (number | null)[]
  selectedMonth: number
  selectedYear: number
  selectedDate: string | null
  setSelectedDate: (date: string) => void
  getDailyTotal: (date: string) => number
  getIntensityClass: (hours: number) => string
  getTextColorClass: (hours: number) => string
}

export function CalendarGrid({
  monthDays,
  selectedMonth,
  selectedYear,
  selectedDate,
  setSelectedDate,
  getDailyTotal,
  getIntensityClass,
  getTextColorClass
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

          return (
            <div
              key={`${selectedYear}-${selectedMonth}-${day}-${index}`}
              className={`
                h-12 w-full p-1.5 rounded border transition-all cursor-pointer flex flex-col items-center justify-center
                ${getIntensityClass(dayTotal)}
                ${isSelected ? 'border-blue-500 ring-1 ring-blue-200' : 'border-gray-200 hover:border-gray-300'}
                ${isToday ? 'border-orange-400 ring-1 ring-orange-200' : ''}
              `}
              onClick={() => setSelectedDate(dateStr)}
              title={`${day}/${selectedMonth + 1}/${selectedYear} - ${dayTotal}h travaillées`}
            >
              <div className={`text-xs font-semibold ${getTextColorClass(dayTotal)} leading-none`}>
                {day}
              </div>
              {dayTotal > 0 && (
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