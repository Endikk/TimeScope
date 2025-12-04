
import { FileDown } from "lucide-react"

interface QuickActionsProps {
  onExport?: () => void
  onGoToToday?: () => void
}

export function QuickActions({ onExport, onGoToToday }: QuickActionsProps) {
  const goToToday = () => {
    if (onGoToToday) {
      onGoToToday()
      return
    }

    // Fallback behaviour if no callback provided: log the ISO date
    const today = new Date().toISOString().split('T')[0]
    console.log('Go to today (no handler):', today)
  }

  return (
    <div className="mb-6">
      <div className="flex items-center justify-between">
        <button
          onClick={goToToday}
           className="px-4 py-2 text-sm border rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-2">
            Aujourd'hui
          </button>
        <div className="flex items-center gap-2">
          {onExport && (
            <button
              onClick={onExport}
              className="px-4 py-2 text-sm border border-green-600 text-green-600 rounded-lg transition-colors flex items-center gap-2 hover:bg-green-50"
            >
              <FileDown className="h-4 w-4" />
              Exporter PDF
            </button>
          )}
        </div>
      </div>
    </div>
  )
}