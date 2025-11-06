import { useEffect } from 'react';
import { LoginVideoSection, LoginFormSection } from './components';

export default function LoginPage() {
  useEffect(() => {
    // Bloquer le scroll sur la page de login
    document.body.style.overflow = 'hidden';

    // Nettoyer au démontage du composant
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, []);

  return (
    <div className="h-screen w-screen flex flex-col lg:flex-row overflow-hidden fixed inset-0">
      <LoginVideoSection />
      <LoginFormSection />
    </div>
  );
}
