import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Edit, Trash2 } from 'lucide-react';
import { AppSetting } from '@/lib/api/services';

interface SettingsTabsProps {
  categories: string[];
  settingsByCategory: Record<string, AppSetting[]>;
  onEdit: (setting: AppSetting) => void;
  onDelete: (key: string) => void;
}

export function SettingsTabs({ categories, settingsByCategory, onEdit, onDelete }: SettingsTabsProps) {
  return (
    <Tabs defaultValue={categories[0] || ''} className="space-y-4">
      <TabsList>
        {categories.map((category) => (
          <TabsTrigger key={category} value={category}>
            {category}
            <Badge variant="secondary" className="ml-2">
              {settingsByCategory[category]?.length || 0}
            </Badge>
          </TabsTrigger>
        ))}
      </TabsList>

      {categories.map((category) => (
        <TabsContent key={category} value={category}>
          <Card>
            <CardHeader>
              <CardTitle>{category}</CardTitle>
              <CardDescription>
                Paramètres de la catégorie {category}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {settingsByCategory[category]?.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">
                  Aucun paramètre dans cette catégorie
                </p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Clé</TableHead>
                      <TableHead>Valeur</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Visibilité</TableHead>
                      <TableHead className="text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {settingsByCategory[category]?.map((setting) => (
                      <TableRow key={setting.id}>
                        <TableCell className="font-mono text-sm">{setting.key}</TableCell>
                        <TableCell className="font-semibold">{setting.value}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{setting.dataType}</Badge>
                        </TableCell>
                        <TableCell className="text-muted-foreground">{setting.description}</TableCell>
                        <TableCell>
                          <Badge variant={setting.isPublic ? 'default' : 'secondary'}>
                            {setting.isPublic ? 'Public' : 'Privé'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onEdit(setting)}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => onDelete(setting.key)}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      ))}
    </Tabs>
  );
}
