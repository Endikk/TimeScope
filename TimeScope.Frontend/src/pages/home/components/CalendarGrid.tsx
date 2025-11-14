import { useState } from 'react'
import { useHolidays, getEventsForDate } from '@/lib/hooks/use-holidays'
import {
  Popover,
  PopoverContent,
  PopoverAnchor,
} from '@/components/ui/popover'
import DayDetailsPopover from './DayDetailsPopover'

interface CalendarGridProps {
  monthDays: (number | null)[]
  selectedMonth: number
  selectedYear: number
  selectedDate: string | null
  setSelectedDate: (date: string) => void
  getDailyTotal?: (date: string) => number
  getIntensityClass?: (hours: number) => string
  getTextColorClass?: (hours: number) => string
  isNonWorkingDay: (year: number, month: number, day: number) => boolean
  getEntriesForDate: (date: string) => any[]
  viewMode: 'week' | 'month'
  selectedWeek?: number
  selectedDates?: Set<string>
  onDateClick?: (dateStr: string, ctrlKey: boolean) => void
  isMultiSelectMode?: boolean
}

export function CalendarGrid({
  monthDays,
  selectedMonth,
  selectedYear,
  selectedDate,
  setSelectedDate,
  isNonWorkingDay,
  getEntriesForDate,
  viewMode,
  selectedWeek = 0,
  selectedDates = new Set(),
  onDateClick,
  isMultiSelectMode = false
}: CalendarGridProps) {
  const weekDays = ["Lun.", "Mar.", "Mer.", "Jeu.", "Ven.", "Sam.", "Dim."]
  const { holidays } = useHolidays(selectedYear)
  const [popoverOpen, setPopoverOpen] = useState<string | null>(null)

  // Générer les jours de la semaine sélectionnée
  const getWeekDays = (weekIndex: number) => {
    const firstDay = new Date(selectedYear, selectedMonth, 1)
    const firstDayOfWeek = (firstDay.getDay() + 6) % 7 // Lundi = 0

    // Calculer le premier lundi de la grille du calendrier
    const firstMonday = new Date(firstDay)
    firstMonday.setDate(1 - firstDayOfWeek)

    // Ajouter les semaines pour arriver à la semaine sélectionnée
    const startOfWeek = new Date(firstMonday)
    startOfWeek.setDate(firstMonday.getDate() + (weekIndex * 7))

    const weekDays: (number | null)[] = []
    for (let i = 0; i < 7; i++) {
      const day = new Date(startOfWeek)
      day.setDate(startOfWeek.getDate() + i)

      // Ne garder que les jours du mois sélectionné
      if (day.getMonth() === selectedMonth && day.getFullYear() === selectedYear) {
        weekDays.push(day.getDate())
      } else {
        weekDays.push(null)
      }
    }
    return weekDays
  }

  // Choisir les jours à afficher selon le mode
  const daysToDisplay = viewMode === 'week' ? getWeekDays(selectedWeek) : monthDays

  // Calculer le total d'heures pour une journée
  const getDailyTotal = (dateStr: string) => {
    const entries = getEntriesForDate(dateStr)
    return entries.reduce((sum, entry) => sum + (entry.heures || 0), 0)
  }

  return (
    <div className="mt-4">
      <div className={`grid ${viewMode === 'week' ? 'grid-cols-7' : 'grid-cols-7'} gap-px bg-gray-200 border border-gray-200 rounded-lg overflow-hidden`}>
        {weekDays.map((day) => (
          <div key={day} className="bg-gray-50 text-center text-xs font-medium text-gray-700 py-3">
            {day}
          </div>
        ))}

        {daysToDisplay.map((day, index) => {
          if (!day) {
            return <div key={index} className="bg-white min-h-[100px]"></div>
          }

          const dateStr = `${selectedYear}-${String(selectedMonth + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`
          const isSelected = selectedDate === dateStr
          const isMultiSelected = selectedDates.has(dateStr)
          const isToday = dateStr === new Date().toISOString().split('T')[0]
          const isDisabled = isNonWorkingDay(selectedYear, selectedMonth, day)
          const events = getEventsForDate(holidays, dateStr)
          const timeEntries = getEntriesForDate(dateStr)
          const totalHours = getDailyTotal(dateStr)
          const holidayName = events.length > 0 ? events[0].name : undefined
          const isPopoverOpen = popoverOpen === dateStr

          return (
            <Popover key={`${selectedYear}-${selectedMonth}-${day}-${index}`} open={isPopoverOpen} onOpenChange={(open) => setPopoverOpen(open ? dateStr : null)}>
              <PopoverAnchor asChild>
                <div
                  className={`
                    bg-white min-h-[100px] p-2 transition-all cursor-pointer relative
                    ${isMultiSelected ? 'ring-2 ring-green-500 ring-inset bg-green-50' : ''}
                    ${isSelected && !isMultiSelected ? 'ring-2 ring-blue-500 ring-inset' : ''}
                    ${isToday && !isSelected && !isMultiSelected ? 'ring-1 ring-blue-300 ring-inset' : ''}
                    ${isDisabled ? 'bg-gray-50 opacity-50' : 'hover:bg-gray-50'}
                    ${isMultiSelectMode ? 'hover:ring-2 hover:ring-green-300' : ''}
                  `}
                  onClick={(e) => {
                    if (!isDisabled) {
                      if (onDateClick) {
                        onDateClick(dateStr, e.ctrlKey || e.metaKey)
                      } else {
                        setSelectedDate(dateStr)
                      }
                    }
                  }}
                  onContextMenu={(e) => {
                    e.preventDefault()
                    if (!isDisabled) {
                      setPopoverOpen(dateStr)
                    }
                  }}
                >
                  <div className="flex justify-between items-start mb-1">
                    <span className={`text-sm font-medium ${isToday ? 'bg-blue-600 text-white rounded-full w-6 h-6 flex items-center justify-center' : 'text-gray-700'}`}>
                      {day}
                    </span>
                    {isMultiSelected && (
                      <div className="bg-green-500 text-white rounded-full p-0.5">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                        </svg>
                      </div>
                    )}
                  </div>

                  <div className="space-y-1">
                    {events.map((event, idx) => (
                      <div key={idx} className="text-xs bg-red-100 text-red-800 px-2 py-1 rounded flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                        </svg>
                        <span className="font-medium truncate">{event.name}</span>
                      </div>
                    ))}

                    {timeEntries.slice(0, 3).map((entry, idx) => (
                      <div key={`entry-${idx}`} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded flex items-center gap-1">
                        <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        <span className="font-medium truncate">{entry.taskName}</span>
                      </div>
                    ))}

                    {timeEntries.length > 3 && (
                      <div className="text-xs text-gray-500 px-2 py-1">
                        +{timeEntries.length - 3} autre{timeEntries.length - 3 > 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                </div>
              </PopoverAnchor>
              <PopoverContent
                side="right"
                align="start"
                className="p-0 w-auto border-0 shadow-none bg-transparent"
                onInteractOutside={() => setPopoverOpen(null)}
              >
                <DayDetailsPopover
                  date={dateStr}
                  entries={timeEntries}
                  totalHours={totalHours}
                  isHoliday={events.length > 0}
                  holidayName={holidayName}
                />
              </PopoverContent>
            </Popover>
          )
        })}
      </div>

    </div>
  )
}