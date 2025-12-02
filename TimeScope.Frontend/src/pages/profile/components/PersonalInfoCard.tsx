import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { User as UserIcon, Mail, Phone, Save, X, PenLine } from 'lucide-react';
import { useState, useEffect } from 'react';
import { User } from '@/lib/api/services/auth.service';
import { motion, AnimatePresence } from 'framer-motion';

interface PersonalInfoCardProps {
  user: User | null;
  isEditing: boolean;
  onSave: (data: PersonalInfoData) => Promise<void>;
  onEdit: () => void;
}

export interface PersonalInfoData {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
}

export function PersonalInfoCard({ user, isEditing, onSave, onEdit }: PersonalInfoCardProps) {
  const [formData, setFormData] = useState<PersonalInfoData>({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    phoneNumber: user?.phoneNumber || '',
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Update form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user]);

  const handleSave = async () => {
    setError('');
    setIsLoading(true);

    try {
      await onSave(formData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur lors de la sauvegarde');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data
    if (user) {
      setFormData({
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        phoneNumber: user.phoneNumber || '',
      });
    }
    setError('');
    onEdit();
  };

  return (
    <Card className="overflow-hidden border-border/50 shadow-sm hover:shadow-md transition-shadow duration-300">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2 text-xl">
              <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                <UserIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
              </div>
              Informations Personnelles
            </CardTitle>
            <CardDescription className="mt-1.5 ml-1">
              Vos informations de contact et détails personnels
            </CardDescription>
          </div>
          {!isEditing && (
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="hover:bg-indigo-50 hover:text-indigo-600 hover:border-indigo-200 transition-colors"
            >
              <PenLine className="h-4 w-4 mr-2" />
              Modifier
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="p-6 pt-0 space-y-6">
        <AnimatePresence mode="wait">
          {error && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="text-sm text-red-600 bg-red-50 dark:bg-red-900/20 p-3 rounded-md border border-red-200 dark:border-red-800"
            >
              {error}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2.5">
            <Label htmlFor="firstName" className="text-sm font-medium text-muted-foreground">
              Prénom
            </Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="firstName"
                value={formData.firstName}
                onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                disabled={!isEditing || isLoading}
                className={`pl-9 ${!isEditing ? 'bg-muted/50 border-transparent' : 'bg-background'}`}
              />
            </div>
          </div>
          <div className="space-y-2.5">
            <Label htmlFor="lastName" className="text-sm font-medium text-muted-foreground">
              Nom
            </Label>
            <div className="relative">
              <UserIcon className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                id="lastName"
                value={formData.lastName}
                onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                disabled={!isEditing || isLoading}
                className={`pl-9 ${!isEditing ? 'bg-muted/50 border-transparent' : 'bg-background'}`}
              />
            </div>
          </div>
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="email" className="text-sm font-medium text-muted-foreground">
            Email
          </Label>
          <div className="relative">
            <Mail className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({ ...formData, email: e.target.value })}
              disabled={!isEditing || isLoading}
              className={`pl-9 ${!isEditing ? 'bg-muted/50 border-transparent' : 'bg-background'}`}
            />
          </div>
        </div>

        <div className="space-y-2.5">
          <Label htmlFor="phone" className="text-sm font-medium text-muted-foreground">
            Téléphone
          </Label>
          <div className="relative">
            <Phone className="absolute left-3 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              id="phone"
              type="tel"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              disabled={!isEditing || isLoading}
              placeholder="+33 6 12 34 56 78"
              className={`pl-9 ${!isEditing ? 'bg-muted/50 border-transparent' : 'bg-background'}`}
            />
          </div>
        </div>

        <AnimatePresence>
          {isEditing && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="flex justify-end gap-3 pt-4 border-t border-border/50"
            >
              <Button
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
                className="hover:bg-red-50 hover:text-red-600 hover:border-red-200 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Annuler
              </Button>
              <Button
                onClick={handleSave}
                disabled={isLoading}
                className="bg-indigo-600 hover:bg-indigo-700 text-white"
              >
                <Save className="h-4 w-4 mr-2" />
                {isLoading ? 'Enregistrement...' : 'Enregistrer'}
              </Button>
            </motion.div>
          )}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}
