import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Bot, User, Trash2, Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from '@/components/ui/card'
import { ScrollArea } from '@/components/ui/scroll-area'
import { cn } from '@/lib/utils'
import axios from 'axios'
import { useAuth } from '@/contexts/AuthContext'
import { tokenStorage } from '@/lib/api/services/auth.service'

interface Message {
    id: string
    content: string
    sender: 'user' | 'bot'
    timestamp: Date
}

// Generate unique ID for messages
const generateMessageId = () => `msg_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`

// Storage key for persisting messages
const MESSAGES_STORAGE_KEY = 'timescope_chat_messages'

export function ChatWidget() {
    const { user, isAuthenticated } = useAuth()
    const [isOpen, setIsOpen] = useState(false)
    const [inputValue, setInputValue] = useState('')
    const [isLoading, setIsLoading] = useState(false)
    const [sessionId] = useState(() => Math.random().toString(36).substring(7))
    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    // Initialize messages with welcome message
    const getInitialMessages = useCallback((): Message[] => {
        // Try to load from localStorage first
        try {
            const stored = localStorage.getItem(MESSAGES_STORAGE_KEY)
            if (stored) {
                const parsed = JSON.parse(stored)
                // Convert timestamp strings back to Date objects
                return parsed.map((msg: any) => ({
                    ...msg,
                    timestamp: new Date(msg.timestamp)
                }))
            }
        } catch (error) {
            console.error('Failed to load messages from storage:', error)
        }

        // Return default welcome message
        return [{
            id: generateMessageId(),
            content: user
                ? `Bonjour ${user.firstName} ! Je suis votre assistant TimeScope.\n\nPour enregistrer du temps, précisez :\n• Le PROJET (obligatoire)\n• La TÂCHE (obligatoire)\n• La DURÉE (obligatoire)\n• La date (optionnel, par défaut aujourd'hui)\n\nExemple : "Mettre 2h sur le projet TimeScope pour la tâche développement"\n\nSi un projet n'existe pas, contactez le support via la page Support/Contact.`
                : "Bonjour ! Je suis votre assistant TimeScope. Veuillez vous connecter pour que je puisse vous aider.",
            sender: 'bot',
            timestamp: new Date()
        }]
    }, [user])

    const [messages, setMessages] = useState<Message[]>(getInitialMessages)

    // Update welcome message when user changes
    useEffect(() => {
        setMessages(prev => {
            const newWelcome: Message = {
                id: generateMessageId(),
                content: user
                    ? `Bonjour ${user.firstName} ! Je suis votre assistant TimeScope.\n\nPour enregistrer du temps, précisez :\n• Le PROJET (obligatoire)\n• La TÂCHE (obligatoire)\n• La DURÉE (obligatoire)\n• La date (optionnel, par défaut aujourd'hui)\n\nExemple : "Mettre 2h sur le projet TimeScope pour la tâche développement"\n\nSi un projet n'existe pas, contactez le support via la page Support/Contact.`
                    : "Bonjour ! Je suis votre assistant TimeScope. Veuillez vous connecter pour que je puisse vous aider.",
                sender: 'bot',
                timestamp: new Date()
            }

            // If only welcome message exists, replace it
            if (prev.length === 1 && prev[0].sender === 'bot') {
                return [newWelcome]
            }

            return prev
        })
    }, [user])

    // Persist messages to localStorage
    useEffect(() => {
        try {
            localStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages))
        } catch (error) {
            console.error('Failed to save messages to storage:', error)
        }
    }, [messages])

    // Auto-scroll to bottom when messages change with smooth animation
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (scrollContainer) {
                setTimeout(() => {
                    scrollContainer.scrollTo({
                        top: scrollContainer.scrollHeight,
                        behavior: 'smooth'
                    })
                }, 100)
            }
        }
    }, [messages, isOpen])

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            // Small delay to ensure the animation completes
            setTimeout(() => {
                inputRef.current?.focus()
            }, 100)
        }
    }, [isOpen])

    const handleSendMessage = async () => {
        const trimmedInput = inputValue.trim()
        if (!trimmedInput) return

        // Check if user is authenticated
        if (!isAuthenticated || !user) {
            const errorMessage: Message = {
                id: generateMessageId(),
                content: "Vous devez être connecté pour utiliser l'assistant. Veuillez vous connecter.",
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorMessage])
            setInputValue('')
            return
        }

        const userMessage: Message = {
            id: generateMessageId(),
            content: trimmedInput,
            sender: 'user',
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMessage])
        setInputValue('')
        setIsLoading(true)

        try {
            // Use relative path for Vite proxy to bypass CORS
            const webhookUrl = '/webhook/chat'

            // Get JWT token for authentication
            const token = tokenStorage.getToken()

            if (!token) {
                throw new Error('No authentication token found')
            }

            const response = await axios.post(webhookUrl, {
                message: userMessage.content,
                sessionId: sessionId,
                userId: user.id,
                userName: `${user.firstName} ${user.lastName}`,
                userEmail: user.email,
                authToken: token,
                timestamp: userMessage.timestamp.toISOString()
            }, {
                timeout: 30000, // 30 second timeout
                headers: {
                    'Content-Type': 'application/json'
                }
            })

            const botResponse: Message = {
                id: generateMessageId(),
                content: response.data.output || "Je n'ai pas compris votre demande.",
                sender: 'bot',
                timestamp: new Date()
            }

            setMessages(prev => [...prev, botResponse])
        } catch (error) {
            console.error('Error sending message:', error)

            let errorMessage = "Désolé, je rencontre des difficultés pour communiquer avec le serveur."

            if (axios.isAxiosError(error)) {
                if (error.code === 'ECONNABORTED') {
                    errorMessage = "La requête a pris trop de temps. Veuillez réessayer."
                } else if (error.response?.status === 401) {
                    errorMessage = "Votre session a expiré. Veuillez vous reconnecter."
                } else if (error.response?.status === 503) {
                    errorMessage = "Le service d'IA est temporairement indisponible. Veuillez réessayer dans quelques instants."
                } else if (!error.response) {
                    errorMessage = "Impossible de joindre le serveur. Vérifiez votre connexion internet."
                }
            }

            const errorResponse: Message = {
                id: generateMessageId(),
                content: errorMessage,
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages(prev => [...prev, errorResponse])
        } finally {
            setIsLoading(false)
        }
    }

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            handleSendMessage()
        }
    }

    const handleClearHistory = useCallback(() => {
        const confirmClear = window.confirm('Êtes-vous sûr de vouloir effacer l\'historique de conversation ?')
        if (confirmClear) {
            // Clear storage first
            localStorage.removeItem(MESSAGES_STORAGE_KEY)
            // Generate fresh welcome message
            const welcomeMessage: Message = {
                id: generateMessageId(),
                content: user
                    ? `Bonjour ${user.firstName} ! Je suis votre assistant TimeScope.\n\nPour enregistrer du temps, précisez :\n• Le PROJET (obligatoire)\n• La TÂCHE (obligatoire)\n• La DURÉE (obligatoire)\n• La date (optionnel, par défaut aujourd'hui)\n\nExemple : "Mettre 2h sur le projet TimeScope pour la tâche développement"\n\nSi un projet n'existe pas, contactez le support via la page Support/Contact.`
                    : "Bonjour ! Je suis votre assistant TimeScope. Veuillez vous connecter pour que je puisse vous aider.",
                sender: 'bot',
                timestamp: new Date()
            }
            setMessages([welcomeMessage])
        }
    }, [user])

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4">
            {isOpen && (
                <Card
                    className={cn(
                        "w-[400px] h-[600px] shadow-2xl border-primary/20 backdrop-blur-sm",
                        "animate-in slide-in-from-bottom-5 fade-in zoom-in-95 duration-300",
                        "transition-all"
                    )}
                    role="dialog"
                    aria-label="Assistant de chat TimeScope"
                >
                    <CardHeader className="bg-gradient-to-r from-primary to-primary/90 text-primary-foreground rounded-t-lg p-4 flex flex-row items-center justify-between space-y-0 shadow-md">
                        <div className="flex items-center gap-2">
                            <div className="relative">
                                <Bot className="h-6 w-6 animate-in zoom-in duration-500" aria-hidden="true" />
                                <Sparkles className="h-3 w-3 absolute -top-1 -right-1 text-yellow-300 animate-pulse" />
                            </div>
                            <div className="flex flex-col">
                                <CardTitle className="text-base font-semibold">Assistant TimeScope</CardTitle>
                                {isAuthenticated && user && (
                                    <span className="text-xs opacity-90">Connecté · {user.firstName}</span>
                                )}
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 transition-colors rounded-full"
                                onClick={handleClearHistory}
                                title="Effacer l'historique"
                                aria-label="Effacer l'historique de conversation"
                            >
                                <Trash2 className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary-foreground hover:bg-primary-foreground/20 transition-colors rounded-full"
                                onClick={() => setIsOpen(false)}
                                aria-label="Fermer le chat"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </CardHeader>
                    <CardContent className="p-0 h-[calc(600px-140px)] flex flex-col bg-gradient-to-b from-background to-muted/20 overflow-hidden">
                        <ScrollArea className="h-full w-full p-4" ref={scrollAreaRef}>
                            <div className="flex flex-col gap-4 pr-4" role="log" aria-live="polite" aria-label="Messages de conversation">
                                {messages.map((message, index) => (
                                    <div
                                        key={message.id}
                                        className={cn(
                                            "flex gap-3 max-w-[85%]",
                                            "animate-in fade-in slide-in-from-bottom-3 duration-500",
                                            message.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                                        )}
                                        style={{
                                            animationDelay: `${index * 50}ms`
                                        }}
                                    >
                                        <div className={cn(
                                            "h-9 w-9 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                            "transition-transform hover:scale-110 duration-200",
                                            message.sender === 'user'
                                                ? "bg-gradient-to-br from-primary to-primary/80 text-primary-foreground"
                                                : "bg-gradient-to-br from-muted to-muted/60 text-foreground ring-2 ring-border"
                                        )} aria-hidden="true">
                                            {message.sender === 'user' ? <User className="h-5 w-5" /> : <Bot className="h-5 w-5" />}
                                        </div>
                                        <div className={cn(
                                            "rounded-2xl p-3 text-sm break-words shadow-sm",
                                            "transition-all duration-200 hover:shadow-md",
                                            message.sender === 'user'
                                                ? "bg-gradient-to-br from-primary to-primary/90 text-primary-foreground rounded-tr-sm"
                                                : "bg-gradient-to-br from-muted to-muted/80 text-foreground rounded-tl-sm border border-border/50"
                                        )}>
                                            {message.content}
                                        </div>
                                    </div>
                                ))}
                                {isLoading && (
                                    <div className="flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-3 duration-300">
                                        <div className="h-9 w-9 rounded-full flex items-center justify-center shrink-0 bg-gradient-to-br from-muted to-muted/60 shadow-sm ring-2 ring-border" aria-hidden="true">
                                            <Bot className="h-5 w-5 animate-pulse" />
                                        </div>
                                        <div className="bg-gradient-to-br from-muted to-muted/80 rounded-2xl rounded-tl-sm p-3 flex items-center gap-1.5 shadow-sm border border-border/50" role="status" aria-label="L'assistant réfléchit">
                                            <span className="w-2 h-2 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                            <span className="w-2 h-2 bg-primary/70 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                            <span className="w-2 h-2 bg-primary/70 rounded-full animate-bounce"></span>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </ScrollArea>
                    </CardContent>
                    <CardFooter className="p-4 bg-muted/30 border-t backdrop-blur-sm">
                        <div className="flex w-full gap-2">
                            <Input
                                ref={inputRef}
                                placeholder="Écrivez votre message..."
                                value={inputValue}
                                onChange={(e) => setInputValue(e.target.value)}
                                onKeyDown={handleKeyDown}
                                disabled={isLoading}
                                className="bg-background border-border/50 focus-visible:ring-primary transition-all"
                                aria-label="Message à envoyer"
                                maxLength={500}
                            />
                            <Button
                                size="icon"
                                onClick={handleSendMessage}
                                disabled={isLoading || !inputValue.trim()}
                                aria-label="Envoyer le message"
                                className="shrink-0 transition-all hover:scale-105 disabled:scale-100"
                            >
                                <Send className="h-4 w-4" />
                            </Button>
                        </div>
                    </CardFooter>
                </Card>
            )}

            <Button
                size="icon"
                className={cn(
                    "h-16 w-16 rounded-full shadow-2xl transition-all duration-300",
                    "bg-gradient-to-br from-primary to-primary/80 hover:from-primary/90 hover:to-primary/70",
                    "hover:scale-110 hover:rotate-12 active:scale-95",
                    "ring-4 ring-background ring-offset-2 ring-offset-background",
                    isOpen ? "hidden" : "flex",
                    "animate-in zoom-in-50 fade-in duration-300"
                )}
                onClick={() => setIsOpen(true)}
                aria-label="Ouvrir l'assistant de chat"
            >
                <MessageCircle className="h-8 w-8 transition-transform group-hover:scale-110" />
                <span className="absolute -top-1 -right-1 h-4 w-4 bg-green-500 rounded-full animate-pulse ring-2 ring-background"></span>
            </Button>
        </div>
    )
}
