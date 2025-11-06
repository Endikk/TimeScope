import { Calendar } from "lucide-react"
import { CURRENT_USER } from "@/lib/config/user"

export function HomeHeader() {
  return (
    <div className="text-center lg:text-left mb-6">
      <div className="flex items-center justify-center lg:justify-start space-x-3 mb-4">
        <div className="p-2 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-lg shadow-lg">
          <Calendar className="h-6 w-6 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-heading font-bold tracking-tight text-fp-text">
             Suivi Temps Personnel
          </h1>
          <p className="text-sm text-gray-500 mt-1">
            Bonjour {CURRENT_USER.name} 👋
          </p>
        </div>
      </div>
      <p className="text-lg text-gray-600 max-w-2xl mx-auto lg:mx-0">
        Suivez votre progression mois par mois avec notre système de suivi personnalisé. 
        Visualisez votre avancement par thème et optimisez votre productivité.
      </p>
    </div>
  )
}