import { useState, useRef, useEffect, useCallback } from 'react'
import { MessageCircle, X, Send, Bot, User, RefreshCw } from 'lucide-react'
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

// Storage key for persisting messages (Session Storage)
const MESSAGES_STORAGE_KEY = 'timescope_chat_session_messages'

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
        // Try to load from sessionStorage first
        try {
            const stored = sessionStorage.getItem(MESSAGES_STORAGE_KEY)
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
                ? `Bonjour ${user.firstName} ! Je suis votre assistant TimeScope.\n\nJe peux vous aider à créer des tâches, enregistrer du temps ou répondre à vos questions sur l'application.`
                : "Bonjour ! Je suis votre assistant TimeScope. Connectez-vous pour profiter de toutes mes fonctionnalités.",
            sender: 'bot',
            timestamp: new Date()
        }]
    }, [user])

    const [messages, setMessages] = useState<Message[]>(getInitialMessages)

    // Update welcome message when user changes, but only if it's the only message
    useEffect(() => {
        setMessages(prev => {
            const newWelcome: Message = {
                id: generateMessageId(),
                content: user
                    ? `Bonjour ${user.firstName} ! Je suis votre assistant TimeScope.\n\nJe peux vous aider à créer des tâches, enregistrer du temps ou répondre à vos questions sur l'application.`
                    : "Bonjour ! Je suis votre assistant TimeScope. Connectez-vous pour profiter de toutes mes fonctionnalités.",
                sender: 'bot',
                timestamp: new Date()
            }

            // If only welcome message exists, replace it to update name
            if (prev.length === 1 && prev[0].sender === 'bot') {
                return [newWelcome]
            }

            return prev
        })
    }, [user])

    // Persist messages to sessionStorage
    useEffect(() => {
        try {
            sessionStorage.setItem(MESSAGES_STORAGE_KEY, JSON.stringify(messages))
        } catch (error) {
            console.error('Failed to save messages to storage:', error)
        }
    }, [messages])

    // Clear session on window unload (tab close)
    useEffect(() => {
        const handleBeforeUnload = () => {
            sessionStorage.removeItem(MESSAGES_STORAGE_KEY)
        }

        window.addEventListener('beforeunload', handleBeforeUnload)

        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload)
        }
    }, [])

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
    }, [messages, isOpen, isLoading])

    // Focus input when chat opens
    useEffect(() => {
        if (isOpen && inputRef.current) {
            setTimeout(() => {
                inputRef.current?.focus()
            }, 300)
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
        // Clear storage first
        sessionStorage.removeItem(MESSAGES_STORAGE_KEY)
        // Generate fresh welcome message
        const welcomeMessage: Message = {
            id: generateMessageId(),
            content: user
                ? `Bonjour ${user.firstName} ! Je suis votre assistant TimeScope.\n\nJe peux vous aider à créer des tâches, enregistrer du temps ou répondre à vos questions sur l'application.`
                : "Bonjour ! Je suis votre assistant TimeScope. Connectez-vous pour profiter de toutes mes fonctionnalités.",
            sender: 'bot',
            timestamp: new Date()
        }
        setMessages([welcomeMessage])
    }, [user])

    return (
        <div className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-4 font-sans">
            {isOpen && (
                <Card
                    className={cn(
                        "w-[380px] h-[600px] shadow-xl border border-primary/10 bg-primary",
                        "animate-in slide-in-from-bottom-5 fade-in zoom-in-95 duration-200",
                        "flex flex-col overflow-hidden p-0"
                    )}
                    role="dialog"
                    aria-label="Assistant de chat TimeScope"
                >
                    {/* Header - Blue background */}
                    <CardHeader className="bg-primary text-primary-foreground p-4 flex flex-row items-center justify-between space-y-0 shrink-0 border-none">
                        <div className="flex items-center gap-3">
                            <div className="relative bg-primary-foreground/10 rounded-full p-2">
                                <Bot className="h-5 w-5" aria-hidden="true" />
                            </div>
                            <div className="flex flex-col">
                                <CardTitle className="text-sm font-semibold">TimeScope AI</CardTitle>
                                <span className="text-xs opacity-80 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-green-400"></span>
                                    En ligne
                                </span>
                            </div>
                        </div>
                        <div className="flex items-center gap-1">
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-full"
                                onClick={handleClearHistory}
                                title="Effacer l'historique"
                            >
                                <RefreshCw className="h-4 w-4" />
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-primary-foreground/80 hover:text-primary-foreground hover:bg-primary-foreground/10 rounded-full"
                                onClick={() => setIsOpen(false)}
                                aria-label="Fermer le chat"
                            >
                                <X className="h-5 w-5" />
                            </Button>
                        </div>
                    </CardHeader>

                    {/* Content Wrapper - White background with rounded top */}
                    <div className="flex-1 flex flex-col bg-background rounded-t-3xl overflow-hidden shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)]">
                        {/* Chat Area */}
                        <CardContent className="flex-1 p-0 overflow-hidden bg-muted/30">
                            <ScrollArea className="h-full w-full p-4" ref={scrollAreaRef}>
                                <div className="flex flex-col gap-4 pb-2">
                                    {messages.map((message, index) => (
                                        <div
                                            key={message.id}
                                            className={cn(
                                                "flex gap-3 max-w-[85%]",
                                                "animate-in fade-in slide-in-from-bottom-2 duration-300",
                                                message.sender === 'user' ? "ml-auto flex-row-reverse" : ""
                                            )}
                                        >
                                            <div className={cn(
                                                "h-8 w-8 rounded-full flex items-center justify-center shrink-0 border",
                                                message.sender === 'user'
                                                    ? "bg-primary text-primary-foreground border-primary"
                                                    : "bg-background text-foreground border-border"
                                            )}>
                                                {message.sender === 'user' ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
                                            </div>
                                            <div className={cn(
                                                "rounded-lg px-4 py-2.5 text-sm shadow-sm border",
                                                message.sender === 'user'
                                                    ? "bg-primary text-primary-foreground border-primary rounded-tr-none"
                                                    : "bg-background text-foreground border-border rounded-tl-none"
                                            )}>
                                                <div className="whitespace-pre-wrap leading-relaxed">
                                                    {message.content}
                                                </div>
                                                <div className={cn(
                                                    "text-[10px] mt-1 opacity-70 text-right",
                                                    message.sender === 'user' ? "text-primary-foreground/70" : "text-muted-foreground"
                                                )}>
                                                    {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    {isLoading && (
                                        <div className="flex gap-3 max-w-[85%] animate-in fade-in slide-in-from-bottom-2 duration-300">
                                            <div className="h-8 w-8 rounded-full flex items-center justify-center shrink-0 bg-background text-foreground border border-border">
                                                <Bot className="h-4 w-4" />
                                            </div>
                                            <div className="bg-background border border-border rounded-lg rounded-tl-none px-4 py-3 flex items-center gap-1.5 shadow-sm">
                                                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></span>
                                                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></span>
                                                <span className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></span>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </ScrollArea>
                        </CardContent>

                        {/* Footer */}
                        <CardFooter className="p-3 bg-background border-t">
                            <div className="flex w-full gap-2">
                                <Input
                                    ref={inputRef}
                                    placeholder="Posez une question..."
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={handleKeyDown}
                                    disabled={isLoading}
                                    className="flex-1"
                                    maxLength={500}
                                />
                                <Button
                                    size="icon"
                                    onClick={handleSendMessage}
                                    disabled={isLoading || !inputValue.trim()}
                                    className="shrink-0"
                                >
                                    <Send className="h-4 w-4" />
                                </Button>
                            </div>
                        </CardFooter>
                    </div>
                </Card>
            )}

            <Button
                size="icon"
                className={cn(
                    "h-14 w-14 rounded-full shadow-lg transition-all duration-300",
                    "bg-primary text-primary-foreground hover:bg-primary/90",
                    "hover:scale-105 active:scale-95",
                    isOpen ? "scale-0 opacity-0 rotate-90" : "scale-100 opacity-100 rotate-0"
                )}
                onClick={() => setIsOpen(true)}
                aria-label="Ouvrir l'assistant"
            >
                <MessageCircle className="h-7 w-7" />
                <span className="absolute -top-1 -right-1 flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
                </span>
            </Button>
        </div>
    )
}
