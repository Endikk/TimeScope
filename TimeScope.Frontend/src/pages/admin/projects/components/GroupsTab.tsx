import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Trash2 } from 'lucide-react';
import type { Group, CreateGroupDto } from '@/lib/api/services/projects.service';

interface GroupsTabProps {
  groups: Group[];
  loading: boolean;
  isAddOpen: boolean;
  onAddOpenChange: (open: boolean) => void;
  newGroup: CreateGroupDto;
  onNewGroupChange: (group: CreateGroupDto) => void;
  onCreateGroup: () => void;
  onDeleteGroup: (id: string) => void;
}

export function GroupsTab({
  groups,
  loading,
  isAddOpen,
  onAddOpenChange,
  newGroup,
  onNewGroupChange,
  onCreateGroup,
  onDeleteGroup
}: GroupsTabProps) {
  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>Sociétés</CardTitle>
            <CardDescription>{groups.length} groupe(s)</CardDescription>
          </div>
          <Dialog open={isAddOpen} onOpenChange={onAddOpenChange}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Nouveau groupe
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Créer un groupe</DialogTitle>
              </DialogHeader>
              <div className="grid gap-4 py-4">
                <div className="grid gap-2">
                  <Label>Nom</Label>
                  <Input
                    value={newGroup.name}
                    onChange={(e) => onNewGroupChange({ ...newGroup, name: e.target.value })}
                  />
                </div>
                <div className="grid gap-2">
                  <Label>Description</Label>
                  <Textarea
                    value={newGroup.description}
                    onChange={(e) => onNewGroupChange({ ...newGroup, description: e.target.value })}
                  />
                </div>
              </div>
              <DialogFooter>
                <Button variant="outline" onClick={() => onAddOpenChange(false)}>
                  Annuler
                </Button>
                <Button onClick={onCreateGroup}>Créer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent>
        {loading ? (
          <p className="text-center py-8 text-muted-foreground">Chargement...</p>
        ) : groups.length === 0 ? (
          <p className="text-center py-8 text-muted-foreground">Aucun groupe</p>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nom</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map((group) => (
                <TableRow key={group.id}>
                  <TableCell className="font-medium">{group.name}</TableCell>
                  <TableCell className="text-muted-foreground">{group.description || '-'}</TableCell>
                  <TableCell className="text-right">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onDeleteGroup(group.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
