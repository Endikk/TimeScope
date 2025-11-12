import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Badge } from "@/components/ui/badge"
import { PageHeader } from "@/components/layout/PageHeader"
import { REQUEST_TYPES } from "@/pages/contact/components/RequestTypeCards"
import { contactFormSchema, ContactFormValues, PRIORITY_LEVELS } from "@/lib/types/form"
import { CURRENT_USER } from "@/lib/config/user"
import { requestsService } from "@/lib/api/services/requests.service"
import {
  Send,
  AlertTriangle,
  User,
  CheckCircle2,
  MessageSquare
} from "lucide-react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"



export default function Contact() {
  const [isSubmitted, setIsSubmitted] = React.useState(false)
  const [isSubmitting, setIsSubmitting] = React.useState(false)
  const [ticketId, setTicketId] = React.useState<string>("")

  const form = useForm<ContactFormValues>({
    resolver: zodResolver(contactFormSchema),
    defaultValues: {
      requestType: "project" as const,
      title: "",
      description: "",
      justification: "",
      priority: "medium" as const,
      name: CURRENT_USER.name,
      email: CURRENT_USER.email,
    },
  })

  async function onSubmit(data: ContactFormValues) {
    setIsSubmitting(true)
    try {
      const result = await requestsService.createRequest({
        name: data.name,
        email: data.email,
        requestType: data.requestType,
        title: data.title,
        description: data.description,
        justification: data.justification,
        priority: data.priority,
      })

      setTicketId(result.id.substring(0, 8).toUpperCase())
      setIsSubmitted(true)

      setTimeout(() => {
        form.reset({
          requestType: "project" as const,
          title: "",
          description: "",
          justification: "",
          priority: "medium" as const,
          name: CURRENT_USER.name,
          email: CURRENT_USER.email,
        })
        setIsSubmitted(false)
        setTicketId("")
      }, 5000)
    } catch (error) {
      console.error("Failed to submit request:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isSubmitted) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <div className="min-h-[100vh] flex-1 rounded-xl bg-white md:min-h-min">
          <div className="max-w-4xl mx-auto space-y-6 p-6">
            <Card className="border-green-200 bg-green-50">
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="rounded-full bg-green-500 p-3">
                    <CheckCircle2 className="h-6 w-6 text-white" />
                  </div>
                  <h3 className="text-xl font-semibold text-green-900">
                    Demande envoyée avec succès !
                  </h3>
                  <p className="text-green-700 max-w-md">
                    Votre demande a été transmise à l&apos;équipe d&apos;administration.
                    Vous recevrez une réponse sous 24-48h par email.
                  </p>
                  <Badge className="bg-green-100 text-green-800">
                    Ticket #{ticketId || "PENDING"}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    )
  }
  
  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="min-h-[100vh] flex-1 rounded-xl bg-white md:min-h-min">
        <div className="max-w-4xl mx-auto space-y-6 p-6">
          
          {/* Header */}
          <PageHeader
            icon={MessageSquare}
            title="Demandes à l'Administration"
            description="Demandez l'ajout de nouveaux projets, activités ou templates à votre espace de travail"
          />

          {/* Formulaire principal */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Send className="h-5 w-5 text-primary" />
                Nouvelle Demande
              </CardTitle>
              <CardDescription>
                Remplissez ce formulaire pour demander l&apos;ajout d&apos;éléments à votre système de suivi
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...form}>
                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                  
                  {/* Informations personnelles */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel className="flex items-center gap-2">
                            <User className="h-4 w-4" />
                            Votre nom *
                          </FormLabel>
                          <FormControl>
                            <Input placeholder="John Doe" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={form.control}
                      name="email"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Email *</FormLabel>
                          <FormControl>
                            <Input placeholder="john@entreprise.com" type="email" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  {/* Type de demande */}
                  <FormField
                    control={form.control}
                    name="requestType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type de demande *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez le type de demande" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {REQUEST_TYPES.map((type) => (
                              <SelectItem key={type.value} value={type.value}>
                                <div className="flex items-center gap-2">
                                  <type.icon className="h-4 w-4" />
                                  {type.label}
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Choisissez ce que vous souhaitez ajouter au système
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Titre */}
                  <FormField
                    control={form.control}
                    name="title"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Titre de la demande *</FormLabel>
                        <FormControl>
                          <Input placeholder="Ex: Ajouter le projet 'Site E-commerce'" {...field} />
                        </FormControl>
                        <FormDescription>
                          Donnez un titre clair et descriptif à votre demande
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Description */}
                  <FormField
                    control={form.control}
                    name="description"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Description détaillée *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Décrivez en détail ce que vous souhaitez ajouter..."
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Expliquez clairement ce qui doit être ajouté
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Justification */}
                  <FormField
                    control={form.control}
                    name="justification"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Justification *</FormLabel>
                        <FormControl>
                          <Textarea
                            placeholder="Pourquoi cette demande est-elle nécessaire ?"
                            className="resize-none"
                            {...field}
                          />
                        </FormControl>
                        <FormDescription>
                          Expliquez l'importance et l'utilité de votre demande
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Priorité */}
                  <FormField
                    control={form.control}
                    name="priority"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel className="flex items-center gap-2">
                          <AlertTriangle className="h-4 w-4" />
                          Niveau de priorité *
                        </FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Sélectionnez la priorité" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            {PRIORITY_LEVELS.map((priority) => (
                              <SelectItem key={priority.value} value={priority.value}>
                                <div className="flex items-center gap-2">
                                  <Badge variant={priority.variant}>
                                    {priority.label}
                                  </Badge>
                                </div>
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormDescription>
                          Indiquez l'urgence de votre demande
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  {/* Boutons */}
                  <div className="flex justify-end space-x-4 pt-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => form.reset()}
                      disabled={isSubmitting}
                    >
                      Effacer
                    </Button>
                    <Button
                      type="submit"
                      className="bg-focustime-primary hover:opacity-90 flex items-center gap-2"
                      disabled={isSubmitting}
                    >
                      <Send className="h-4 w-4" />
                      {isSubmitting ? "Envoi en cours..." : "Envoyer la demande"}
                    </Button>
                  </div>
                  
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
