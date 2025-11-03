"use client"

import React from "react"
import { Button } from "@/components/ui/button"
import { Copy, Repeat, Zap, ArrowLeft } from "lucide-react"

interface QuickActionsProps {
  selectedDate: string | null
  copyPreviousDay: () => void
  repeatLastEntry: () => void
  applyQuickTemplate: () => void
}

export function QuickActions({
  selectedDate,
  copyPreviousDay,
  repeatLastEntry,
  applyQuickTemplate
}: QuickActionsProps) {
  return (
    <div className="mb-4 p-3 bg-gray-50 rounded-lg border">
      <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
        <Zap className="h-4 w-4 text-orange-500" />
        Raccourcis rapides
      </h3>
      <div className="flex flex-wrap gap-2">
        <Button 
          onClick={copyPreviousDay}
          variant="outline" 
          size="sm"
          className="flex items-center gap-1.5 text-xs"
          disabled={!selectedDate}
        >
          <Copy className="h-3.5 w-3.5" />
          Copier jour précédent
        </Button>
        <Button 
          onClick={repeatLastEntry}
          variant="outline" 
          size="sm"
          className="flex items-center gap-1.5 text-xs"
          disabled={!selectedDate}
        >
          <Repeat className="h-3.5 w-3.5" />
          Répéter dernière entrée
        </Button>
        <Button 
          onClick={applyQuickTemplate}
          variant="outline" 
          size="sm"
          className="flex items-center gap-1.5 text-xs"
          disabled={!selectedDate}
        >
          <ArrowLeft className="h-3.5 w-3.5" />
          Template journée
        </Button>
      </div>
    </div>
  )
}