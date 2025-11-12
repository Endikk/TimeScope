interface LocalTimeEntry {
  id: string
  date: string
  groupeId: string
  groupeName: string
  projetId: string
  projetName: string
  themeId: string
  themeName: string
  taskId: string
  taskName: string
  heures: number
  description: string
  status: 'draft' | 'saved'
}

export function toggleDateSelection(
  dateStr: string,
  ctrlKey: boolean,
  isMultiSelectMode: boolean,
  selectedDates: Set<string>,
  setSelectedDates: React.Dispatch<React.SetStateAction<Set<string>>>,
  setSelectedDate: (date: string) => void
) {
  if (ctrlKey || isMultiSelectMode) {
    // Mode multi-sélection
    setSelectedDates((prev: Set<string>) => {
      const newSet = new Set(prev)
      if (newSet.has(dateStr)) {
        newSet.delete(dateStr)
      } else {
        newSet.add(dateStr)
      }
      return newSet
    })

    // Si on a des dates sélectionnées, on prend la dernière comme date active
    if (selectedDates.size > 0 || !selectedDates.has(dateStr)) {
      setSelectedDate(dateStr)
    }
  } else {
    // Mode sélection simple
    setSelectedDate(dateStr)
    setSelectedDates(new Set([dateStr]))
  }
}

export function copySelectedEntries(
  selectedDates: Set<string>,
  localEntries: LocalTimeEntry[],
  setCopiedEntries: (entries: LocalTimeEntry[]) => void
): boolean {
  if (selectedDates.size === 0) {
    return false
  }

  const entriesToCopy = localEntries.filter(entry =>
    selectedDates.has(entry.date)
  )

  if (entriesToCopy.length === 0) {
    return false
  }

  setCopiedEntries(entriesToCopy)
  return true
}

export function clearSelection(
  setSelectedDates: (dates: Set<string>) => void,
  setSelectedDate: (date: string | null) => void
) {
  setSelectedDates(new Set())
  setSelectedDate(null)
}

export function toggleMultiSelectMode(
  isMultiSelectMode: boolean,
  setIsMultiSelectMode: (mode: boolean) => void,
  setSelectedDates: (dates: Set<string>) => void
) {
  setIsMultiSelectMode(!isMultiSelectMode)
  if (isMultiSelectMode) {
    // Désactiver le mode multi-sélection
    setSelectedDates(new Set())
  }
}
