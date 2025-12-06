'use client'

import { Button } from "@/components/ui/button"

export default function GlobalError({
    error,
    reset,
}: {
    error: Error & { digest?: string }
    reset: () => void
}) {
    return (
        <html lang="fr">
            <body>
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-4">
                    <div className="space-y-4 text-center">
                        <h2 className="text-3xl font-extrabold text-slate-900">Une erreur critique est survenue</h2>
                        <p className="text-slate-600">L'application a rencontré un problème inattendu.</p>
                        <div className="pt-4 flex gap-4 justify-center">
                            <Button onClick={() => reset()} variant="default">
                                Réessayer
                            </Button>
                            <Button onClick={() => window.location.reload()} variant="outline">
                                Recharger la page
                            </Button>
                        </div>
                        {process.env.NODE_ENV === 'development' && (
                            <pre className="mt-8 p-4 bg-red-50 text-red-800 rounded-lg text-left overflow-auto max-w-2xl mx-auto text-sm">
                                {error.message}
                                {error.stack}
                            </pre>
                        )}
                    </div>
                </div>
            </body>
        </html>
    )
}
