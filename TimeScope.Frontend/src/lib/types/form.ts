import { z } from 'zod'

export const contactFormSchema = z.object({
  name: z.string().min(2, 'Le nom doit contenir au moins 2 caractères'),
  email: z.string().email('Veuillez entrer une adresse email valide'),
  requestType: z.enum(['project', 'activity', 'template', 'other']),
  title: z.string().min(3, 'Le titre doit contenir au moins 3 caractères'),
  description: z.string().min(10, 'La description doit contenir au moins 10 caractères'),
  priority: z.enum(['low', 'medium', 'high']),
  justification: z.string().min(10, 'La justification doit contenir au moins 10 caractères')
})

export type ContactFormValues = z.infer<typeof contactFormSchema>

export const PRIORITY_LEVELS = [
  { value: 'low', label: 'Faible', variant: 'secondary' as const },
  { value: 'medium', label: 'Moyenne', variant: 'default' as const },
  { value: 'high', label: 'Élevée', variant: 'destructive' as const }
]