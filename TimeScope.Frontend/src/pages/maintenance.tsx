import { motion } from 'framer-motion';
import { Wrench, Clock, ShieldAlert } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';

export default function MaintenancePage() {
    const navigate = useNavigate();
    const { logout } = useAuth();

    return (
        <div className="min-h-screen w-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center p-4 overflow-hidden relative">
            {/* Background Effects */}
            <div className="absolute inset-0 overflow-hidden pointer-events-none">
                <div className="absolute top-0 left-0 w-full h-full bg-[url('/grid.svg')] opacity-[0.03]" />
                <div className="absolute -top-[20%] -left-[10%] w-[50%] h-[50%] bg-blue-500/10 rounded-full blur-[100px]" />
                <div className="absolute -bottom-[20%] -right-[10%] w-[50%] h-[50%] bg-purple-500/10 rounded-full blur-[100px]" />
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="relative z-10 max-w-2xl w-full"
            >
                <div className="bg-slate-900/50 backdrop-blur-xl border border-slate-800 rounded-3xl p-8 md:p-12 shadow-2xl text-center">

                    {/* Logo / Icon */}
                    <motion.div
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        transition={{ delay: 0.2, duration: 0.5 }}
                        className="w-24 h-24 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mx-auto mb-8 flex items-center justify-center shadow-lg shadow-blue-500/20"
                    >
                        <Wrench className="w-12 h-12 text-white" />
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.3 }}
                        className="text-4xl md:text-5xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400 mb-6"
                    >
                        Maintenance en cours
                    </motion.h1>

                    {/* Description */}
                    <motion.p
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.4 }}
                        className="text-lg text-slate-400 mb-8 leading-relaxed max-w-lg mx-auto"
                    >
                        Nous effectuons actuellement une mise à jour importante pour améliorer votre expérience.
                        Le service sera de retour très bientôt.
                    </motion.p>

                    {/* Info Cards */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 }}
                        className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-10"
                    >
                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 text-left">
                            <div className="p-2 bg-blue-500/10 rounded-lg">
                                <Clock className="w-5 h-5 text-blue-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-200">Durée estimée</h3>
                                <p className="text-xs text-slate-400">Quelques minutes</p>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 border border-slate-700/50 rounded-xl p-4 flex items-center gap-4 text-left">
                            <div className="p-2 bg-purple-500/10 rounded-lg">
                                <ShieldAlert className="w-5 h-5 text-purple-400" />
                            </div>
                            <div>
                                <h3 className="text-sm font-semibold text-slate-200">Accès Admin</h3>
                                <p className="text-xs text-slate-400">Toujours disponible</p>
                            </div>
                        </div>
                    </motion.div>

                    {/* Action Button */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                    >
                        <Button
                            onClick={async () => {
                                await logout();
                                navigate('/login');
                            }}
                            variant="outline"
                            className="border-slate-700 text-slate-300 hover:bg-slate-800 hover:text-white transition-all duration-300"
                        >
                            Connexion Administrateur
                        </Button>
                    </motion.div>

                </div>

                {/* Footer */}
                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.8 }}
                    className="text-center text-slate-500 text-sm mt-8"
                >
                    &copy; {new Date().getFullYear()} TimeScope. Tous droits réservés.
                </motion.p>
            </motion.div>
        </div>
    );
}
