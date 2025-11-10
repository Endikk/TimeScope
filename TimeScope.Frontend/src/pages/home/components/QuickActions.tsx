
interface QuickActionsProps {
  selectedDate: string | null
  copyPreviousDay: () => void
  repeatLastEntry: () => void
  applyQuickTemplate: () => void
}

export function QuickActions({
  }: QuickActionsProps) {
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
        </div>
      </div>
    </div>
  )
}