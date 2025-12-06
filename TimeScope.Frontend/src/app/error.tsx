'use client'

import { useEffect } from 'react'
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"

export default function Error({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    useEffect(() => {
        // Log the error to an error reporting service
        console.error(error)
    }, [error])

    return (
        <div className="flex h-full w-full flex-col items-center justify-center gap-4 min-h-[50vh]">
            <div className="flex flex-col items-center gap-2 text-center">
                <div className="rounded-full bg-red-100 p-3 text-red-600 dark:bg-red-900/30 dark:text-red-400">
                    <AlertTriangle className="h-6 w-6" />
                </div>
                <h2 className="text-2xl font-bold tracking-tight">Une erreur est survenue !</h2>
                <p className="text-muted-foreground">
                    Nous n'avons pas pu charger cette partie de l'application.
                </p>
            </div>
            <div className="flex gap-2">
                <Button onClick={() => reset()}>
                    Réessayer
                </Button>
                <Button variant="outline" onClick={() => window.location.reload()}>
                    Recharger
                </Button>
            </div>
        </div>
    )
}
