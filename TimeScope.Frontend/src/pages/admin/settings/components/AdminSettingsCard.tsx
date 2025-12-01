import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Shield, Clock, Users, Database, Mail, Loader2 } from 'lucide-react';

interface Settings {
  security?: {
    requireStrongPassword?: boolean;
    twoFactorAuth?: boolean;
    sessionTimeout?: number;
    maxLoginAttempts?: number;
  };
  timeTracking?: {
    workStartTime?: string;
    workEndTime?: string;
    defaultBreakDuration?: number;
    requireTimeEntry?: boolean;
    autoClockOut?: boolean;
  };
  users?: {
    allowSelfRegistration?: boolean;
    emailVerification?: boolean;
    defaultRole?: string;
  };
  notifications?: {
    emailEnabled?: boolean;
    taskReminders?: boolean;
    dailySummary?: boolean;
  };
  system?: {
    maintenanceMode?: boolean;
    logRetentionDays?: number;
    autoBackup?: boolean;
  };
}

interface AdminSettingsCardProps {
  settings: Settings;
  onUpdate: (key: string, value: string | number | boolean) => void;
  onSave: () => Promise<void>;
  saving: boolean;
}

export function AdminSettingsCard({ settings, onUpdate, onSave, saving }: AdminSettingsCardProps) {
  return (
    <div className="space-y-6">
      {/* Sécurité */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            Sécurité et Authentification
          </CardTitle>
          <CardDescription>
            Paramètres de sécurité et de connexion pour tous les utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require-strong-password">Mot de passe fort requis</Label>
              <p className="text-sm text-muted-foreground">
                Exiger un mot de passe avec majuscules, chiffres et caractères spéciaux
              </p>
            </div>
            <Switch
              id="require-strong-password"
              checked={settings?.security?.requireStrongPassword ?? true}
              onCheckedChange={(checked) => onUpdate('security.requireStrongPassword', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="two-factor-auth">Authentification à deux facteurs</Label>
              <p className="text-sm text-muted-foreground">
                Activer l'authentification à deux facteurs pour tous les comptes
              </p>
            </div>
            <Switch
              id="two-factor-auth"
              checked={settings?.security?.twoFactorAuth ?? false}
              onCheckedChange={(checked) => onUpdate('security.twoFactorAuth', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="session-timeout">Durée de session (minutes)</Label>
            <Input
              id="session-timeout"
              type="number"
              min="5"
              max="1440"
              value={settings?.security?.sessionTimeout ?? 60}
              onChange={(e) => onUpdate('security.sessionTimeout', parseInt(e.target.value))}
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">
              Durée avant déconnexion automatique par inactivité
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="max-login-attempts">Tentatives de connexion maximum</Label>
            <Input
              id="max-login-attempts"
              type="number"
              min="3"
              max="10"
              value={settings?.security?.maxLoginAttempts ?? 5}
              onChange={(e) => onUpdate('security.maxLoginAttempts', parseInt(e.target.value))}
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">
              Nombre de tentatives avant blocage du compte
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Gestion du temps */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="h-5 w-5 text-primary" />
            Gestion du Temps de Travail
          </CardTitle>
          <CardDescription>
            Configuration des horaires et du suivi du temps
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="work-start-time">Heure de début de journée</Label>
              <Input
                id="work-start-time"
                type="time"
                value={settings?.timeTracking?.workStartTime ?? '08:00'}
                onChange={(e) => onUpdate('timeTracking.workStartTime', e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="work-end-time">Heure de fin de journée</Label>
              <Input
                id="work-end-time"
                type="time"
                value={settings?.timeTracking?.workEndTime ?? '17:00'}
                onChange={(e) => onUpdate('timeTracking.workEndTime', e.target.value)}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-break-duration">Durée de pause par défaut (minutes)</Label>
            <Input
              id="default-break-duration"
              type="number"
              min="0"
              max="120"
              value={settings?.timeTracking?.defaultBreakDuration ?? 60}
              onChange={(e) => onUpdate('timeTracking.defaultBreakDuration', parseInt(e.target.value))}
              className="max-w-xs"
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="require-time-entry">Saisie du temps obligatoire</Label>
              <p className="text-sm text-muted-foreground">
                Exiger que tous les employés enregistrent leur temps de travail
              </p>
            </div>
            <Switch
              id="require-time-entry"
              checked={settings?.timeTracking?.requireTimeEntry ?? true}
              onCheckedChange={(checked) => onUpdate('timeTracking.requireTimeEntry', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-clock-out">Déconnexion automatique</Label>
              <p className="text-sm text-muted-foreground">
                Déconnecter automatiquement les employés à la fin de la journée
              </p>
            </div>
            <Switch
              id="auto-clock-out"
              checked={settings?.timeTracking?.autoClockOut ?? false}
              onCheckedChange={(checked) => onUpdate('timeTracking.autoClockOut', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Gestion des utilisateurs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5 text-primary" />
            Gestion des Utilisateurs
          </CardTitle>
          <CardDescription>
            Paramètres de création et gestion des comptes utilisateurs
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="allow-self-registration">Inscription libre</Label>
              <p className="text-sm text-muted-foreground">
                Permettre aux utilisateurs de créer leur propre compte
              </p>
            </div>
            <Switch
              id="allow-self-registration"
              checked={settings?.users?.allowSelfRegistration ?? false}
              onCheckedChange={(checked) => onUpdate('users.allowSelfRegistration', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-verification">Vérification email obligatoire</Label>
              <p className="text-sm text-muted-foreground">
                Exiger la vérification de l'email lors de l'inscription
              </p>
            </div>
            <Switch
              id="email-verification"
              checked={settings?.users?.emailVerification ?? true}
              onCheckedChange={(checked) => onUpdate('users.emailVerification', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="default-role">Rôle par défaut</Label>
            <Select
              value={settings?.users?.defaultRole ?? 'Employee'}
              onValueChange={(value) => onUpdate('users.defaultRole', value)}
            >
              <SelectTrigger className="max-w-xs">
                <SelectValue placeholder="Sélectionner un rôle" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Employee">Employé</SelectItem>
                <SelectItem value="Manager">Manager</SelectItem>
                <SelectItem value="Admin">Administrateur</SelectItem>
              </SelectContent>
            </Select>
            <p className="text-sm text-muted-foreground">
              Rôle attribué automatiquement aux nouveaux utilisateurs
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Notifications */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Mail className="h-5 w-5 text-primary" />
            Notifications et Emails
          </CardTitle>
          <CardDescription>
            Configuration des notifications système
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="email-notifications">Notifications par email</Label>
              <p className="text-sm text-muted-foreground">
                Envoyer des notifications par email aux utilisateurs
              </p>
            </div>
            <Switch
              id="email-notifications"
              checked={settings?.notifications?.emailEnabled ?? true}
              onCheckedChange={(checked) => onUpdate('notifications.emailEnabled', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="task-reminders">Rappels de tâches</Label>
              <p className="text-sm text-muted-foreground">
                Envoyer des rappels pour les tâches à échéance proche
              </p>
            </div>
            <Switch
              id="task-reminders"
              checked={settings?.notifications?.taskReminders ?? true}
              onCheckedChange={(checked) => onUpdate('notifications.taskReminders', checked)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="daily-summary">Résumé quotidien</Label>
              <p className="text-sm text-muted-foreground">
                Envoyer un résumé quotidien de l'activité
              </p>
            </div>
            <Switch
              id="daily-summary"
              checked={settings?.notifications?.dailySummary ?? false}
              onCheckedChange={(checked) => onUpdate('notifications.dailySummary', checked)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Système */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-primary" />
            Système et Performance
          </CardTitle>
          <CardDescription>
            Paramètres système et optimisations
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="maintenance-mode">Mode maintenance</Label>
              <p className="text-sm text-muted-foreground">
                Activer le mode maintenance (seuls les admins peuvent se connecter)
              </p>
            </div>
            <Switch
              id="maintenance-mode"
              checked={settings?.system?.maintenanceMode ?? false}
              onCheckedChange={(checked) => onUpdate('system.maintenanceMode', checked)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="log-retention">Rétention des logs (jours)</Label>
            <Input
              id="log-retention"
              type="number"
              min="7"
              max="365"
              value={settings?.system?.logRetentionDays ?? 90}
              onChange={(e) => onUpdate('system.logRetentionDays', parseInt(e.target.value))}
              className="max-w-xs"
            />
            <p className="text-sm text-muted-foreground">
              Durée de conservation des logs d'audit
            </p>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-backup">Sauvegarde automatique</Label>
              <p className="text-sm text-muted-foreground">
                Effectuer des sauvegardes automatiques quotidiennes
              </p>
            </div>
            <Switch
              id="auto-backup"
              checked={settings?.system?.autoBackup ?? true}
              onCheckedChange={(checked) => onUpdate('system.autoBackup', checked)}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end">
        <Button
          size="lg"
          className="w-full md:w-auto"
          onClick={onSave}
          disabled={saving}
        >
          {saving ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Enregistrement...
            </>
          ) : (
            'Enregistrer tous les paramètres'
          )}
        </Button>
      </div>
    </div>
  );
}
