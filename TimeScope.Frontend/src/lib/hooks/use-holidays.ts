import { useState, useEffect } from 'react'

interface HolidayEvent {
  date: string
  name: string
  type: 'user' | 'colleague' | 'holiday'
}

export function useHolidays(year: number) {
  const [holidays, setHolidays] = useState<Map<string, HolidayEvent[]>>(new Map())
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await fetch(
          `https://calendrier.api.gouv.fr/jours-feries/metropole/${year}.json`
        )

        if (response.ok) {
          const data = await response.json()
          const holidayMap = new Map<string, HolidayEvent[]>()

          Object.entries(data).forEach(([date, name]) => {
            holidayMap.set(date, [{
              date,
              name: name as string,
              type: 'holiday'
            }])
          })

          setHolidays(holidayMap)
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des jours fériés:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchHolidays()
  }, [year])

  return { holidays, loading }
}

export function getEventsForDate(holidays: Map<string, HolidayEvent[]>, date: string): HolidayEvent[] {
  return holidays.get(date) || []
}
