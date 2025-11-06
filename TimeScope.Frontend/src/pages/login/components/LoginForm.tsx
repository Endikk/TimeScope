import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { ApiError } from '@/lib/api/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Eye, EyeOff, LogIn, AlertCircle } from 'lucide-react';

export default function LoginForm() {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    email: '',
    password: ''
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    if (!formData.email || !formData.password) {
      setError('Veuillez remplir tous les champs');
      setIsLoading(false);
      return;
    }

    try {
      await login({
        email: formData.email,
        password: formData.password
      });

      // Redirection vers la page d'accueil après connexion réussie
      navigate('/home');
    } catch (err) {
      console.error('Login error:', err);

      // Gérer les erreurs API transformées par notre client
      const apiError = err as ApiError | Error;

      let errorMessage = 'Identifiants incorrects. Veuillez réessayer.';

      if ('message' in apiError) {
        errorMessage = apiError.message;
      }

      // Messages d'erreur spécifiques selon le code
      if ('status' in apiError) {
        switch (apiError.status) {
          case 401:
            errorMessage = 'Email ou mot de passe incorrect.';
            break;
          case 500:
            errorMessage = 'Erreur serveur. Veuillez réessayer plus tard.';
            break;
          case undefined:
            errorMessage = 'Impossible de contacter le serveur. Vérifiez votre connexion.';
            break;
        }
      }

      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = () => {
    alert('Fonctionnalité de récupération de mot de passe à venir !');
  };

  return (
    <Card className="border-0 shadow-xl bg-white">
      <CardHeader className="pb-3 pt-4">
        <CardTitle className="font-heading text-gray-900 text-lg">Connexion</CardTitle>
        <CardDescription className="font-body text-gray-600 text-xs">
          Saisissez vos identifiants pour accéder à votre espace
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-4">
        <form onSubmit={handleSubmit} className="space-y-2.5">
          {error && (
            <Alert variant="destructive">
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}

          <div className="space-y-1">
            <Label htmlFor="email" className="font-body font-semibold text-gray-800 text-xs">
              Email
            </Label>
            <Input
              id="email"
              type="email"
              placeholder="john.doe@timescope.com"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={isLoading}
              className="h-9 text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
              autoComplete="email"
              required
            />
          </div>

          <div className="space-y-1">
            <Label htmlFor="password" className="font-body font-semibold text-gray-800 text-xs">
              Mot de passe
            </Label>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? 'text' : 'password'}
                placeholder="********"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                disabled={isLoading}
                className="h-9 pr-10 text-sm border-gray-300 focus:border-indigo-500 focus:ring-indigo-500"
                autoComplete="current-password"
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors"
                disabled={isLoading}
                aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
              >
                {showPassword ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <label className="flex items-center gap-1.5 cursor-pointer">
              <input
                type="checkbox"
                className="w-3.5 h-3.5 rounded border-gray-300 text-indigo-600 focus:ring-indigo-500"
              />
              <span className="text-xs text-gray-700 font-body">Se souvenir de moi</span>
            </label>

            <button
              type="button"
              onClick={handleForgotPassword}
              className="text-xs text-indigo-600 hover:text-indigo-700 font-semibold font-body transition-colors"
            >
              Mot de passe oublié ?
            </button>
          </div>

          <Button
            type="submit"
            className="w-full h-9 bg-indigo-600 hover:bg-indigo-700 text-white font-body font-semibold text-sm shadow-md hover:shadow-lg transition-all"
            disabled={isLoading}
          >
            {isLoading ? (
              <div className="flex items-center gap-2">
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Connexion en cours...
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <LogIn className="h-3.5 w-3.5" />
                Se connecter
              </div>
            )}
          </Button>

          <div className="relative my-3">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-[10px]">
              <span className="px-2 bg-white text-fp-text/50 font-body">Ou</span>
            </div>
          </div>

          <Button
            type="button"
            variant="outline"
            className="w-full h-9 border-gray-300 text-gray-700 hover:bg-gray-50 font-body font-medium text-sm"
            disabled={isLoading}
          >
            <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24">
              <path
                fill="currentColor"
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
              />
              <path
                fill="currentColor"
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
              />
              <path
                fill="currentColor"
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
              />
              <path
                fill="currentColor"
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
              />
            </svg>
            Continuer avec Google
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
