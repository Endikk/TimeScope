"use client";

import { motion } from 'framer-motion';
import { Wrench, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';

export default function MaintenancePage() {
    const router = useRouter();
    const { logout } = useAuth();

    return (
        <div className="min-h-screen w-full bg-slate-950 flex flex-col items-center justify-center p-4 relative overflow-hidden">
            {/* Background Gradient */}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-slate-900 via-slate-950 to-slate-950" />

            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[url('/grid.svg')] opacity-[0.02] pointer-events-none" />

            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5, ease: "easeOut" }}
                className="relative z-10 max-w-md w-full text-center"
            >
                {/* Icon */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.2 }}
                    className="mx-auto mb-8 w-16 h-16 rounded-2xl bg-slate-900 border border-slate-800 flex items-center justify-center shadow-2xl shadow-blue-900/10"
                >
                    <Wrench className="w-8 h-8 text-slate-200" />
                </motion.div>

                {/* Content */}
                <motion.div
                    initial={{ y: 20, opacity: 0 }}
                    animate={{ y: 0, opacity: 1 }}
                    transition={{ delay: 0.3 }}
                    className="space-y-6"
                >
                    <h1 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
                        Maintenance en cours
                    </h1>

                    <p className="text-slate-400 text-lg leading-relaxed">
                        Nous mettons à jour TimeScope pour vous offrir une meilleure expérience.
                        L'accès sera rétabli dans quelques instants.
                    </p>

                    <div className="pt-8">
                        <Button
                            onClick={async () => {
                                await logout();
                                router.push('/login');
                            }}
                            variant="ghost"
                            className="text-slate-500 hover:text-white hover:bg-slate-900 transition-colors group"
                        >
                            Connexion Administrateur
                            <ArrowRight className="w-4 h-4 ml-2 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                        </Button>
                    </div>
                </motion.div>
            </motion.div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
                className="absolute bottom-8 text-center"
            >
                <p className="text-xs text-slate-600 font-medium tracking-wider uppercase">
                    TimeScope &copy; {new Date().getFullYear()}
                </p>
            </motion.div>
        </div>
    );
}
