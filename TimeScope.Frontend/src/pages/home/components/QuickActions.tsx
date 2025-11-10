
import { FileDown } from "lucide-react"

interface QuickActionsProps {
  onExport?: () => void
}

export function QuickActions({ onExport }: QuickActionsProps) {
  const goToToday = () => {
    const today = new Date().toISOString().split('T')[0]
    // Note: This would need to be passed up to parent or use a callback
    console.log('Go to today:', today)
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