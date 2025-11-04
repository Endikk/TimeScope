import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import {
  Settings,
  Building2,
  Mail,
  Bell,
  Shield,
  Clock,
  Database,
  Palette,
  Users,
  Key,
  Globe
} from 'lucide-react';

export default function SettingsPage() {
  const [emailNotifications, setEmailNotifications] = useState(true);
  const [pushNotifications, setPushNotifications] = useState(false);
  const [autoBackup, setAutoBackup] = useState(true);
  const [twoFactorAuth, setTwoFactorAuth] = useState(false);
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Paramètres</h1>
        <p className="text-muted-foreground">
          Configurez les paramètres globaux de l'application
        </p>
      </div>

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList>
          <TabsTrigger value="general">
            <Settings className="mr-2 h-4 w-4" />
            Général
          </TabsTrigger>
          <TabsTrigger value="notifications">
            <Bell className="mr-2 h-4 w-4" />
            Notifications
          </TabsTrigger>
          <TabsTrigger value="security">
            <Shield className="mr-2 h-4 w-4" />
            Sécurité
          </TabsTrigger>
          <TabsTrigger value="system">
            <Database className="mr-2 h-4 w-4" />
            Système
          </TabsTrigger>
          <TabsTrigger value="appearance">
            <Palette className="mr-2 h-4 w-4" />
            Apparence
          </TabsTrigger>
        </TabsList>

        {/* General Settings */}
        <TabsContent value="general" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Informations de l'entreprise</CardTitle>
              <CardDescription>
                Gérez les informations principales de votre organisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyName">Nom de l'entreprise</Label>
                  <Input id="companyName" placeholder="TimeScope Inc." defaultValue="TimeScope Inc." />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyEmail">Email de contact</Label>
                  <Input id="companyEmail" type="email" placeholder="contact@timescope.com" defaultValue="contact@timescope.com" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="companyAddress">Adresse</Label>
                <Input id="companyAddress" placeholder="123 rue de la Tech, Paris" defaultValue="123 rue de la Tech, Paris" />
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="companyPhone">Téléphone</Label>
                  <Input id="companyPhone" type="tel" placeholder="+33 1 23 45 67 89" defaultValue="+33 1 23 45 67 89" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="companyWebsite">Site web</Label>
                  <Input id="companyWebsite" type="url" placeholder="https://timescope.com" defaultValue="https://timescope.com" />
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="timezone">Fuseau horaire</Label>
                <Select defaultValue="paris">
                  <SelectTrigger id="timezone">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="paris">Europe/Paris (GMT+1)</SelectItem>
                    <SelectItem value="london">Europe/London (GMT+0)</SelectItem>
                    <SelectItem value="newyork">America/New_York (GMT-5)</SelectItem>
                    <SelectItem value="tokyo">Asia/Tokyo (GMT+9)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Langue par défaut</Label>
                <Select defaultValue="fr">
                  <SelectTrigger id="language">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="fr">Français</SelectItem>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="es">Español</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button>Enregistrer les modifications</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Paramètres de temps de travail</CardTitle>
              <CardDescription>
                Définissez les paramètres par défaut pour le suivi du temps
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="workHoursPerDay">Heures de travail par jour</Label>
                  <Input id="workHoursPerDay" type="number" defaultValue="8" min="1" max="24" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="workDaysPerWeek">Jours de travail par semaine</Label>
                  <Input id="workDaysPerWeek" type="number" defaultValue="5" min="1" max="7" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="fiscalYearStart">Début de l'année fiscale</Label>
                <Select defaultValue="january">
                  <SelectTrigger id="fiscalYearStart">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="january">Janvier</SelectItem>
                    <SelectItem value="april">Avril</SelectItem>
                    <SelectItem value="july">Juillet</SelectItem>
                    <SelectItem value="october">Octobre</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button>Enregistrer</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Notifications Settings */}
        <TabsContent value="notifications" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de notifications</CardTitle>
              <CardDescription>
                Gérez les notifications système et utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications par email</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des notifications par email pour les événements importants
                  </p>
                </div>
                <Switch checked={emailNotifications} onCheckedChange={setEmailNotifications} />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Notifications push</Label>
                  <p className="text-sm text-muted-foreground">
                    Recevoir des notifications push dans le navigateur
                  </p>
                </div>
                <Switch checked={pushNotifications} onCheckedChange={setPushNotifications} />
              </div>

              <Separator />

              <div className="space-y-4">
                <Label>Types de notifications</Label>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Nouvelles entrées de temps</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Projets terminés</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Dépassement de budget</Label>
                    <Switch defaultChecked />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Nouveaux utilisateurs</Label>
                    <Switch />
                  </div>
                  <div className="flex items-center justify-between">
                    <Label className="font-normal">Rapports hebdomadaires</Label>
                    <Switch defaultChecked />
                  </div>
                </div>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="emailTemplate">Modèle d'email</Label>
                <Textarea
                  id="emailTemplate"
                  placeholder="Template HTML pour les emails..."
                  className="min-h-[100px]"
                />
              </div>

              <div className="flex justify-end">
                <Button>Enregistrer les préférences</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Security Settings */}
        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Paramètres de sécurité</CardTitle>
              <CardDescription>
                Configurez les options de sécurité et d'authentification
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Authentification à deux facteurs (2FA)</Label>
                  <p className="text-sm text-muted-foreground">
                    Requiert un code de vérification lors de la connexion
                  </p>
                </div>
                <Switch checked={twoFactorAuth} onCheckedChange={setTwoFactorAuth} />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="sessionTimeout">Délai d'expiration de session (minutes)</Label>
                <Input id="sessionTimeout" type="number" defaultValue="60" min="5" max="1440" />
                <p className="text-sm text-muted-foreground">
                  Les utilisateurs seront déconnectés après cette période d'inactivité
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordPolicy">Politique de mot de passe</Label>
                <Select defaultValue="medium">
                  <SelectTrigger id="passwordPolicy">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="low">Faible (6 caractères min.)</SelectItem>
                    <SelectItem value="medium">Moyenne (8 caractères, lettres et chiffres)</SelectItem>
                    <SelectItem value="high">Forte (12 caractères, lettres, chiffres et symboles)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="passwordExpiry">Expiration du mot de passe (jours)</Label>
                <Input id="passwordExpiry" type="number" defaultValue="90" min="0" max="365" />
                <p className="text-sm text-muted-foreground">
                  0 = jamais. Les utilisateurs devront changer leur mot de passe après cette période
                </p>
              </div>

              <Separator />

              <div className="space-y-3">
                <Label>Restrictions d'accès</Label>
                <div className="flex items-center justify-between">
                  <Label className="font-normal">Limiter les connexions par IP</Label>
                  <Switch />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-normal">Bloquer après échecs de connexion</Label>
                  <Switch defaultChecked />
                </div>
                <div className="flex items-center justify-between">
                  <Label className="font-normal">Forcer HTTPS</Label>
                  <Switch defaultChecked />
                </div>
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Voir les logs de sécurité</Button>
                <Button>Enregistrer</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Clés API</CardTitle>
              <CardDescription>
                Gérez les clés d'accès API pour les intégrations externes
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Clé API principale</Label>
                <div className="flex gap-2">
                  <Input type="password" value="sk_live_••••••••••••••••" readOnly />
                  <Button variant="outline">Copier</Button>
                  <Button variant="outline">Regénérer</Button>
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Créer une nouvelle clé</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* System Settings */}
        <TabsContent value="system" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Configuration système</CardTitle>
              <CardDescription>
                Paramètres avancés du système
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Sauvegardes automatiques</Label>
                  <p className="text-sm text-muted-foreground">
                    Effectuer une sauvegarde quotidienne de la base de données
                  </p>
                </div>
                <Switch checked={autoBackup} onCheckedChange={setAutoBackup} />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="backupTime">Heure de sauvegarde</Label>
                <Input id="backupTime" type="time" defaultValue="02:00" />
              </div>

              <div className="space-y-2">
                <Label htmlFor="backupRetention">Rétention des sauvegardes (jours)</Label>
                <Input id="backupRetention" type="number" defaultValue="30" min="1" max="365" />
              </div>

              <Separator />

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Mode maintenance</Label>
                  <p className="text-sm text-muted-foreground">
                    Désactiver temporairement l'accès à l'application
                  </p>
                </div>
                <Switch checked={maintenanceMode} onCheckedChange={setMaintenanceMode} />
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="logLevel">Niveau de logs</Label>
                <Select defaultValue="info">
                  <SelectTrigger id="logLevel">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="debug">Debug (très verbeux)</SelectItem>
                    <SelectItem value="info">Info (standard)</SelectItem>
                    <SelectItem value="warning">Warning (avertissements uniquement)</SelectItem>
                    <SelectItem value="error">Error (erreurs uniquement)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="cacheTimeout">Durée du cache (minutes)</Label>
                <Input id="cacheTimeout" type="number" defaultValue="15" min="1" max="1440" />
              </div>

              <div className="flex justify-end gap-2">
                <Button variant="outline">Vider le cache</Button>
                <Button variant="outline">Redémarrer les services</Button>
                <Button>Enregistrer</Button>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Limites et quotas</CardTitle>
              <CardDescription>
                Définissez les limites d'utilisation
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxUsers">Nombre maximum d'utilisateurs</Label>
                  <Input id="maxUsers" type="number" defaultValue="50" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxProjects">Nombre maximum de projets</Label>
                  <Input id="maxProjects" type="number" defaultValue="100" />
                </div>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="maxUploadSize">Taille max upload (MB)</Label>
                  <Input id="maxUploadSize" type="number" defaultValue="10" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="apiRateLimit">Limite API (req/min)</Label>
                  <Input id="apiRateLimit" type="number" defaultValue="60" />
                </div>
              </div>

              <div className="flex justify-end">
                <Button>Enregistrer</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Appearance Settings */}
        <TabsContent value="appearance" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Apparence de l'application</CardTitle>
              <CardDescription>
                Personnalisez l'interface utilisateur
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="theme">Thème</Label>
                <Select defaultValue="light">
                  <SelectTrigger id="theme">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="light">Clair</SelectItem>
                    <SelectItem value="dark">Sombre</SelectItem>
                    <SelectItem value="auto">Automatique (système)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="primaryColor">Couleur principale</Label>
                <div className="flex gap-2">
                  <Input id="primaryColor" type="color" defaultValue="#3b82f6" className="w-20" />
                  <Input defaultValue="#3b82f6" className="flex-1" />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="logo">Logo de l'entreprise</Label>
                <Input id="logo" type="file" accept="image/*" />
                <p className="text-sm text-muted-foreground">
                  Format recommandé: PNG ou SVG, dimensions: 200x50px
                </p>
              </div>

              <Separator />

              <div className="space-y-2">
                <Label htmlFor="dateFormat">Format de date</Label>
                <Select defaultValue="dd-mm-yyyy">
                  <SelectTrigger id="dateFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="dd-mm-yyyy">DD/MM/YYYY (31/12/2025)</SelectItem>
                    <SelectItem value="mm-dd-yyyy">MM/DD/YYYY (12/31/2025)</SelectItem>
                    <SelectItem value="yyyy-mm-dd">YYYY-MM-DD (2025-12-31)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="timeFormat">Format d'heure</Label>
                <Select defaultValue="24h">
                  <SelectTrigger id="timeFormat">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="24h">24 heures (14:30)</SelectItem>
                    <SelectItem value="12h">12 heures (2:30 PM)</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end">
                <Button>Enregistrer les changements</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
