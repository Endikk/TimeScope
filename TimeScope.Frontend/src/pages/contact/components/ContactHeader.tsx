import { MessageSquare } from "lucide-react"

export function ContactHeader() {
  return (
    <div className="mb-8">
      <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
  <MessageSquare className="h-8 w-8 text-primary" />
        📧 Demandes à l&apos;Administration
      </h1>
      <p className="text-gray-600">
        💼 Demandez l&apos;ajout de nouveaux projets, activités ou templates à votre espace de travail
      </p>
    </div>
  )
}