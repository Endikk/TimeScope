import { useState, useMemo } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { MonthData, ThemeRow, DayEntry, MonthlyProgress } from "@/lib/types"
import { ChevronLeft, ChevronRight, Calendar, Target, Clock, TrendingUp, Save } from "lucide-react"

interface MonthlyTrackerProps {
  userId: string
}

export function MonthlyTracker({ userId }: MonthlyTrackerProps) {
  const [currentDate, setCurrentDate] = useState(new Date())
  
  // Structure organisationnelle : Groupe(société) > Projet > Activité
  const workStructure = [
    // Groupe TechCorp
    { id: "techcorp-crm-dev", groupe: "TechCorp", projet: "CRM System", activite: "Développement", color: "bg-blue-500" },
    { id: "techcorp-crm-test", groupe: "TechCorp", projet: "CRM System", activite: "Testing", color: "bg-green-500" },
    { id: "techcorp-crm-maintenance", groupe: "TechCorp", projet: "CRM System", activite: "Maintenance", color: "bg-gray-500" },
    
    // Groupe DigitalFlow
    { id: "digital-ecom-dev", groupe: "DigitalFlow", projet: "E-commerce", activite: "Développement", color: "bg-purple-500" },
    { id: "digital-ecom-design", groupe: "DigitalFlow", projet: "E-commerce", activite: "Design", color: "bg-pink-500" },
    
    // Activités transversales
    { id: "general-meetings", groupe: "Général", projet: "Administration", activite: "Réunions", color: "bg-red-500" },
    { id: "general-formation", groupe: "Général", projet: "RH", activite: "Formation", color: "bg-orange-500" },
    { id: "general-docs", groupe: "Général", projet: "Documentation", activite: "Documentation", color: "bg-yellow-500" },
    
    // Freelance
    { id: "freelance-web-dev", groupe: "Freelance", projet: "Site Web", activite: "Développement", color: "bg-indigo-500" },
    { id: "freelance-mobile-dev", groupe: "Freelance", projet: "App Mobile", activite: "Développement", color: "bg-cyan-500" }
  ]

  // Génération des données du mois
  const monthData: MonthData = useMemo(() => {
    const year = currentDate.getFullYear()
    const month = currentDate.getMonth()
    const monthNames = [
      "Janvier", "Février", "Mars", "Avril", "Mai", "Juin",
      "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"
    ]
    
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    const firstDayOfWeek = new Date(year, month, 1).getDay()
    const today = new Date()
    
    const themeRows: ThemeRow[] = workStructure.map(item => {
      const days: DayEntry[] = []
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day)
        const dayOfWeek = date.getDay()
        const isWeekend = dayOfWeek === 0 || dayOfWeek === 6
        const isToday = date.toDateString() === today.toDateString()
        
        // Données exemple - à remplacer par vraies données utilisateur
        const value = Math.random() > 0.7 ? Math.random() * 1 : 0
        
        days.push({
          day,
          value: parseFloat(value.toFixed(2)),
          isWeekend,
          isToday
        })
      }
      
      return {
        id: item.id,
        name: item.activite,
        groupe: item.groupe,
        projet: item.projet,
        color: item.color,
        days
      }
    })
    
    return {
      year,
      month,
      monthName: monthNames[month],
      daysInMonth,
      firstDayOfWeek,
      themes: themeRows
    }
  }, [currentDate, workStructure])

  // Calcul des statistiques mensuelles
  const monthlyProgress: MonthlyProgress = useMemo(() => {
    const totalHours = monthData.themes.reduce((sum, theme) => {
      return sum + theme.days.reduce((daySum, day) => daySum + day.value * 7, 0)
    }, 0)
    
    const totalDays = monthData.daysInMonth
    const completedDays = monthData.themes[0].days.filter(day => 
      monthData.themes.some(theme => 
        theme.days[day.day - 1]?.value > 0
      )
    ).length
    
    return {
      totalHours,
      totalDays,
      averageHoursPerDay: totalHours / totalDays,
      completedDays,
      progressPercentage: (completedDays / totalDays) * 100
    }
  }, [monthData])

  const navigateMonth = (direction: 'prev' | 'next') => {
    const newDate = new Date(currentDate)
    if (direction === 'prev') {
      newDate.setMonth(newDate.getMonth() - 1)
    } else {
      newDate.setMonth(newDate.getMonth() + 1)
    }
    setCurrentDate(newDate)
  }

  const updateDayValue = (themeId: string, day: number, value: string) => {
    const numValue = Math.min(1, Math.max(0, parseFloat(value) || 0))
    // Ici on mettrait à jour la base de données
    console.log(`Update ${themeId} day ${day}: ${numValue}`)
  }

  const getCellBackground = (value: number, isWeekend: boolean, isToday: boolean) => {
    if (isWeekend) return 'bg-gray-100'
    if (isToday) return 'bg-yellow-50 border-yellow-300'
    
    const opacity = value * 0.8 + 0.1
    return value > 0 ? `bg-green-500` : 'bg-gray-50'
  }

  return (
    <div className="space-y-6">
      {/* Header avec navigation */}
      <Card className="border-0 shadow-lg">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="p-2 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl shadow-lg">
                <Calendar className="h-6 w-6 text-white" />
              </div>
              <div>
                <CardTitle className="text-2xl font-bold">
                  Suivi Mensuel - {monthData.monthName} {monthData.year}
                </CardTitle>
                <CardDescription>
                  Saisissez vos heures par groupe/projet/activité (max 1 = 7h de travail)
                </CardDescription>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" onClick={() => navigateMonth('prev')}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" onClick={() => navigateMonth('next')}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Statistiques du mois */}
      <div className="grid gap-6 md:grid-cols-4">
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Clock className="h-8 w-8 text-blue-600" />
              <div>
                <p className="text-sm text-gray-600">Total heures</p>
                <p className="text-2xl font-bold">{monthlyProgress.totalHours.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Target className="h-8 w-8 text-green-600" />
              <div>
                <p className="text-sm text-gray-600">Jours complétés</p>
                <p className="text-2xl font-bold">{monthlyProgress.completedDays}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <TrendingUp className="h-8 w-8 text-purple-600" />
              <div>
                <p className="text-sm text-gray-600">Progression</p>
                <p className="text-2xl font-bold">{monthlyProgress.progressPercentage.toFixed(1)}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
        
        <Card className="border-0 shadow-lg">
          <CardContent className="p-6">
            <div className="flex items-center space-x-3">
              <Calendar className="h-8 w-8 text-orange-600" />
              <div>
                <p className="text-sm text-gray-600">Moyenne/jour</p>
                <p className="text-2xl font-bold">{monthlyProgress.averageHoursPerDay.toFixed(1)}h</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Calendrier de suivi - Pleine largeur */}
      <div className="w-screen relative left-1/2 right-1/2 -mx-[50vw] px-4">
        <Card className="border-0 shadow-lg overflow-hidden">
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <table className="w-full table-fixed" style={{ minWidth: 'calc(300px + 31 * 45px)' }}>
                <thead>
                  <tr className="bg-gray-50">
                    <th className="sticky left-0 bg-gray-50 px-2 py-2 text-left font-semibold text-gray-900 border-r w-[100px]">
                      Groupe
                    </th>
                    <th className="sticky bg-gray-50 px-2 py-2 text-left font-semibold text-gray-900 border-r w-[100px]" style={{ left: '100px' }}>
                      Projet
                    </th>
                    <th className="sticky bg-gray-50 px-2 py-2 text-left font-semibold text-gray-900 border-r w-[100px]" style={{ left: '200px' }}>
                      Activité
                    </th>
                    {Array.from({ length: monthData.daysInMonth }, (_, i) => {
                      const day = i + 1
                      const date = new Date(monthData.year, monthData.month, day)
                      const isWeekend = date.getDay() === 0 || date.getDay() === 6
                      const isToday = date.toDateString() === new Date().toDateString()
                      
                      return (
                        <th 
                          key={day} 
                          className={`px-1 py-2 text-center text-xs font-medium w-[45px] ${
                            isWeekend ? 'text-gray-400 bg-gray-100' : 
                            isToday ? 'text-blue-600 bg-blue-50' : 'text-gray-700'
                          }`}
                        >
                          {day}
                        </th>
                      )
                    })}
                  </tr>
                </thead>
                <tbody>
                  {monthData.themes.map((theme, themeIndex) => (
                    <tr key={theme.id} className={themeIndex % 2 === 0 ? 'bg-white' : 'bg-gray-50/50'}>
                      <td className="sticky left-0 bg-inherit px-2 py-2 border-r w-[100px]">
                        <div className="flex items-center space-x-1">
                          <div className={`w-2 h-2 rounded-full ${theme.color} flex-shrink-0`}></div>
                          <span className="font-semibold text-blue-700 text-xs truncate" title={theme.groupe}>
                            {theme.groupe}
                          </span>
                        </div>
                      </td>
                      <td className="sticky bg-inherit px-2 py-2 border-r w-[100px]" style={{ left: '100px' }}>
                        <span className="font-medium text-purple-700 text-xs truncate" title={theme.projet}>
                          {theme.projet}
                        </span>
                      </td>
                      <td className="sticky bg-inherit px-2 py-2 border-r w-[100px]" style={{ left: '200px' }}>
                        <span className="font-medium text-gray-900 text-xs truncate" title={theme.name}>
                          {theme.name}
                        </span>
                      </td>
                      {theme.days.map((dayEntry) => (
                        <td key={dayEntry.day} className="p-0.5 w-[45px]">
                          <Input
                            type="number"
                            min="0"
                            max="1"
                            step="0.1"
                            value={dayEntry.value || ''}
                            onChange={(e) => updateDayValue(theme.id, dayEntry.day, e.target.value)}
                            className={`
                              w-full h-8 text-center text-xs border-0 
                              ${getCellBackground(dayEntry.value, dayEntry.isWeekend, dayEntry.isToday)}
                              ${dayEntry.isWeekend ? 'cursor-not-allowed' : 'hover:bg-blue-50'}
                              ${dayEntry.value > 0 ? 'text-white font-bold' : 'text-gray-700'}
                            `}
                            disabled={dayEntry.isWeekend}
                            style={{
                              backgroundColor: dayEntry.value > 0 ? 
                                `rgba(34, 197, 94, ${dayEntry.value * 0.8 + 0.2})` : 
                                dayEntry.isWeekend ? '#f3f4f6' : 
                                dayEntry.isToday ? '#fefce8' : '#f9fafb'
                            }}
                          />
                        </td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Boutons d'actions */}
      <div className="flex justify-between items-center">
        <div className="text-sm text-gray-600">
          💡 Saisissez une valeur entre 0 et 1 (1 = 7h de travail)
        </div>
        <Button className="bg-green-600 hover:bg-green-700">
          <Save className="mr-2 h-4 w-4" />
          Sauvegarder
        </Button>
      </div>
    </div>
  )
}