import { Settings } from 'lucide-react';

export function SettingsHeader() {
  return (
    <div className="flex flex-col gap-3 md:flex-row md:justify-between md:items-center">
      <div className="min-w-0 flex-1">
        <h1 className="text-2xl md:text-3xl font-bold tracking-tight flex items-center gap-2">
          <Settings className="h-8 w-8 text-primary" />
          Paramètres
        </h1>
        <p className="text-sm md:text-base text-muted-foreground mt-2">
          Configuration de l'application pour les administrateurs et les employés
        </p>
      </div>
    </div>
  );
}
