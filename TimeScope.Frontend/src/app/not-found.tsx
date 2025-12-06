import Link from 'next/link'
import { Button } from "@/components/ui/button"

export default function NotFound() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-background text-foreground p-4">
            <div className="space-y-4 text-center">
                <h1 className="text-9xl font-extrabold tracking-tight text-primary">404</h1>
                <h2 className="text-3xl font-bold">Page Introuvable</h2>
                <p className="text-muted-foreground max-w-md mx-auto">
                    Désolé, nous ne trouvons pas la page que vous recherchez. Elle a peut-être été déplacée ou supprimée.
                </p>
                <div className="pt-6">
                    <Button asChild size="lg">
                        <Link href="/dashboard">
                            Retour au tableau de bord
                        </Link>
                    </Button>
                </div>
            </div>
        </div>
    )
}
