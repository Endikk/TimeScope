"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Plus, Inbox } from "lucide-react"

export default function RequestPage() {
    return (
        <div className="container mx-auto p-6 space-y-8 animate-in fade-in duration-500">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">Mes Demandes</h1>
                    <p className="text-muted-foreground">
                        Gérez vos demandes (congés, matériel, accès, etc.)
                    </p>
                </div>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Nouvelle demande
                </Button>
            </div>

            <Card className="flex flex-col items-center justify-center py-12 text-center">
                <div className="flex h-20 w-20 items-center justify-center rounded-full bg-muted">
                    <Inbox className="h-10 w-10 text-muted-foreground" />
                </div>
                <CardHeader>
                    <CardTitle>Aucune demande en cours</CardTitle>
                    <CardDescription>
                        Vous n'avez pas encore créé de demande. Cliquez sur le bouton "Nouvelle demande" pour commencer.
                    </CardDescription>
                </CardHeader>
                <CardContent>
                    <Button variant="outline">Voir l'historique</Button>
                </CardContent>
            </Card>
        </div>
    )
}
