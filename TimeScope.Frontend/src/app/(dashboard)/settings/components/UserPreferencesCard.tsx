import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Settings, Palette, Globe, Loader2, AlertCircle } from 'lucide-react';
import { useState, useEffect } from 'react';
import { settingsService } from '@/lib/api/services/settings.service';
import { profileApiService } from '@/lib/api/services/profile.service';
import { useAuth } from '@/contexts/AuthContext';
// import { useTheme } from 'next-themes';

interface UserPreferences {
    profile: {
        showProfilePicture: boolean;
        showEmail: boolean;
        showPhone: boolean;
    };
    appearance: {
        colorScheme: string;
        compactView: boolean;
    };
    regional: {
        language: string;
        dateFormat: string;
    };
}

interface AllowedSettings {
    profile: {
        allowProfilePicture: boolean;
        allowShowEmail: boolean;
        allowShowPhone: boolean;
    };
    appearance: {
        allowColorScheme: boolean;
        allowCompactView: boolean;
    };
    regional: {
        allowLanguage: boolean;
        allowDateFormat: boolean;
    };
}

export function UserPreferencesCard() {
    const { user } = useAuth();
    // const { setTheme } = useTheme();
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [preferences, setPreferences] = useState<UserPreferences>({
        profile: {
            showProfilePicture: true,
            showEmail: true,
            showPhone: true,
        },
        appearance: {
            colorScheme: 'blue',
            compactView: false,
        },
        regional: {
            language: 'fr',
            dateFormat: 'DD/MM/YYYY',
        },
    });

    const [allowedSettings, setAllowedSettings] = useState<AllowedSettings>({
        profile: {
            allowProfilePicture: true,
            allowShowEmail: true,
            allowShowPhone: true,
        },
        appearance: {
            allowColorScheme: true,
            allowCompactView: true,
        },
        regional: {
            allowLanguage: true,
            allowDateFormat: true,
        },
    });

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);
            const settings = await settingsService.getAllSettings();

            // Parse allowed settings
            const newAllowedSettings = { ...allowedSettings };

            const updateAllowed = (category: keyof AllowedSettings, key: string, settingKey: string) => {
                const setting = settings.find(s => s.key === settingKey);
                if (setting) {
                    // @ts-expect-error - Dynamic assignment to typed object
                    newAllowedSettings[category][key] = setting.value === 'true';
                }
            };

            updateAllowed('profile', 'allowProfilePicture', 'profile.allowProfilePicture');
            updateAllowed('profile', 'allowShowEmail', 'profile.allowShowEmail');
            updateAllowed('profile', 'allowShowPhone', 'profile.allowShowPhone');

            updateAllowed('appearance', 'allowColorScheme', 'appearance.allowColorScheme');
            updateAllowed('appearance', 'allowCompactView', 'appearance.allowCompactView');

            updateAllowed('regional', 'allowLanguage', 'regional.allowLanguage');
            updateAllowed('regional', 'allowDateFormat', 'regional.allowDateFormat');

            setAllowedSettings(newAllowedSettings);

            // Load user preferences from backend (user.preferences) or localStorage as fallback
            if (user?.preferences) {
                try {
                    const parsedPrefs = JSON.parse(user.preferences);
                    // Merge with defaults to ensure all keys exist
                    setPreferences(prev => ({
                        ...prev,
                        ...parsedPrefs,
                        // Deep merge for nested objects
                        profile: { ...prev.profile, ...parsedPrefs.profile },
                        appearance: { ...prev.appearance, ...parsedPrefs.appearance },
                        regional: { ...prev.regional, ...parsedPrefs.regional },
                    }));
                } catch (e) {
                    console.error('Failed to parse user preferences', e);
                }
            } else {
                const savedPrefs = localStorage.getItem(`user_prefs_${user?.id}`);
                if (savedPrefs) {
                    setPreferences(JSON.parse(savedPrefs));
                }
            }
        } catch (error) {
            console.error('Failed to load settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const handlePreferenceUpdate = (key: string, value: any) => {
        const [category, setting] = key.split('.');
        setPreferences(prev => ({
            ...prev,
            [category]: {
                // @ts-expect-error - Dynamic assignment to typed object
                ...prev[category],
                [setting]: value
            }
        }));
    };

    const savePreferences = async () => {
        if (!user?.id) return;

        try {
            setSaving(true);

            // Call API
            await profileApiService.updatePreferences(user.id, preferences);

            // Save to localStorage as backup/cache
            localStorage.setItem(`user_prefs_${user?.id}`, JSON.stringify(preferences));

            // Apply theme changes if needed (e.g. reload or context update)
            // Ideally we should update the user context here

            alert('Préférences enregistrées avec succès');

            // Reload page to apply changes everywhere (simple solution)
            // window.location.reload(); 
        } catch (error) {
            console.error('Failed to save preferences:', error);
            alert('Erreur lors de l\'enregistrement');
        } finally {
            setSaving(false);
        }
    };

    const hasAnyAllowed = (category: keyof AllowedSettings) => {
        return Object.values(allowedSettings[category]).some(value => value);
    };

    const noOptionsAvailable = !hasAnyAllowed('profile') && !hasAnyAllowed('appearance') && !hasAnyAllowed('regional');

    if (loading) {
        return (
            <Card>
                <CardContent className="flex items-center justify-center py-8">
                    <Loader2 className="w-6 h-6 animate-spin text-indigo-600" />
                </CardContent>
            </Card>
        );
    }

    if (noOptionsAvailable) {
        return (
            <Card>
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Settings className="h-5 w-5 text-indigo-600" />
                        Mes Préférences
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex items-center gap-3 text-muted-foreground">
                        <AlertCircle className="h-5 w-5" />
                        <p>Aucune option de personnalisation n'est disponible actuellement.</p>
                    </div>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Profil */}
            {hasAnyAllowed('profile') && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Settings className="h-5 w-5 text-indigo-600" />
                            Préférences de Profil
                        </CardTitle>
                        <CardDescription>
                            Personnalisez l'affichage de vos informations
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {allowedSettings.profile.allowProfilePicture && (
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="show-profile-picture">Afficher ma photo de profil</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Rendre votre photo visible aux autres utilisateurs
                                    </p>
                                </div>
                                <Switch
                                    id="show-profile-picture"
                                    checked={preferences.profile.showProfilePicture}
                                    onCheckedChange={(checked) => handlePreferenceUpdate('profile.showProfilePicture', checked)}
                                />
                            </div>
                        )}

                        {allowedSettings.profile.allowShowEmail && (
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="show-email">Afficher mon email</Label>

                                </div>
                                <Switch
                                    id="show-email"
                                    checked={preferences.profile.showEmail}
                                    onCheckedChange={(checked) => handlePreferenceUpdate('profile.showEmail', checked)}
                                />
                            </div>
                        )}

                        {allowedSettings.profile.allowShowPhone && (
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="show-phone">Afficher mon téléphone</Label>

                                </div>
                                <Switch
                                    id="show-phone"
                                    checked={preferences.profile.showPhone}
                                    onCheckedChange={(checked) => handlePreferenceUpdate('profile.showPhone', checked)}
                                />
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}



            {/* Apparence */}
            {hasAnyAllowed('appearance') && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Palette className="h-5 w-5 text-indigo-600" />
                            Apparence
                        </CardTitle>
                        <CardDescription>
                            Personnalisez l'interface
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">


                        {allowedSettings.appearance.allowColorScheme && (
                            <div className="space-y-2">
                                <Label htmlFor="color-scheme">Palette de couleurs</Label>
                                <Select
                                    value={preferences.appearance.colorScheme}
                                    onValueChange={(value) => handlePreferenceUpdate('appearance.colorScheme', value)}
                                >
                                    <SelectTrigger className="max-w-xs">
                                        <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="blue">Bleu</SelectItem>
                                        <SelectItem value="green">Vert</SelectItem>
                                        <SelectItem value="purple">Violet</SelectItem>
                                        <SelectItem value="orange">Orange</SelectItem>
                                        <SelectItem value="red">Rouge</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}

                        {allowedSettings.appearance.allowCompactView && (
                            <div className="flex items-center justify-between">
                                <div className="space-y-0.5">
                                    <Label htmlFor="compact-view">Vue compacte</Label>
                                    <p className="text-sm text-muted-foreground">
                                        Réduire l'espacement pour afficher plus d'informations
                                    </p>
                                </div>
                                <Switch
                                    id="compact-view"
                                    checked={preferences.appearance.compactView}
                                    onCheckedChange={(checked) => handlePreferenceUpdate('appearance.compactView', checked)}
                                />
                            </div>
                        )}


                    </CardContent>
                </Card>
            )}

            {/* Préférences régionales */}
            {hasAnyAllowed('regional') && (
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Globe className="h-5 w-5 text-indigo-600" />
                            Préférences Régionales
                        </CardTitle>
                        <CardDescription>
                            Langue et formats d'affichage
                        </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-6">
                        {allowedSettings.regional.allowLanguage && (
                            <div className="space-y-2">
                                <Label htmlFor="language">Langue</Label>
                                <Select
                                    value={preferences.regional.language}
                                    onValueChange={(value) => handlePreferenceUpdate('regional.language', value)}
                                >
                                    <SelectTrigger className="max-w-xs">
                                        <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="fr">Français</SelectItem>
                                        <SelectItem value="en">English</SelectItem>
                                        <SelectItem value="es">Español</SelectItem>
                                        <SelectItem value="de">Deutsch</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}



                        {allowedSettings.regional.allowDateFormat && (
                            <div className="space-y-2">
                                <Label htmlFor="date-format">Format de date</Label>
                                <Select
                                    value={preferences.regional.dateFormat}
                                    onValueChange={(value) => handlePreferenceUpdate('regional.dateFormat', value)}
                                >
                                    <SelectTrigger className="max-w-xs">
                                        <SelectValue placeholder="Sélectionner" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="DD/MM/YYYY">JJ/MM/AAAA</SelectItem>
                                        <SelectItem value="MM/DD/YYYY">MM/JJ/AAAA</SelectItem>
                                        <SelectItem value="YYYY-MM-DD">AAAA-MM-JJ</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        )}


                    </CardContent>
                </Card>
            )}

            <div className="flex justify-end">
                <Button
                    size="lg"
                    className="w-full md:w-auto bg-indigo-600 hover:bg-indigo-700 text-white"
                    onClick={savePreferences}
                    disabled={saving}
                >
                    {saving ? (
                        <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Enregistrement...
                        </>
                    ) : (
                        'Enregistrer mes préférences'
                    )}
                </Button>
            </div>
        </div>
    );
}
