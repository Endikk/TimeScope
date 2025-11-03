import { useState } from 'react';
import { useTasks, useTaskMutations } from '@/lib/hooks';
import { CreateTaskDto } from '@/lib/api/services';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';

/**
 * Page d'exemple montrant comment utiliser les hooks et services API
 */
export default function ApiExamplePage() {
  const { tasks, loading, error, refetch } = useTasks();
  const { createTask, deleteTask, loading: mutationLoading } = useTaskMutations();
  const [message, setMessage] = useState<string>('');

  // Exemple de création de tâche
  const handleCreateTask = async () => {
    try {
      const newTask: CreateTaskDto = {
        name: 'Nouvelle tâche de test',
        description: 'Ceci est une tâche créée depuis le frontend',
        themeId: '00000000-0000-0000-0000-000000000000', // ID fictif pour l'exemple
        status: 'EnAttente',
        precision: 'Medium',
        priority: 'Medium',
        estimatedTime: '02:00:00', // 2 heures
      };

      await createTask(newTask);
      setMessage('Tâche créée avec succès !');
      refetch(); // Recharger la liste
    } catch (err) {
      setMessage(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  // Exemple de suppression de tâche
  const handleDeleteTask = async (taskId: string) => {
    try {
      await deleteTask(taskId);
      setMessage('Tâche supprimée avec succès !');
      refetch(); // Recharger la liste
    } catch (err) {
      setMessage(`Erreur: ${err instanceof Error ? err.message : 'Erreur inconnue'}`);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-lg">Chargement des tâches...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card className="w-96">
          <CardHeader>
            <CardTitle className="text-red-600">Erreur</CardTitle>
          </CardHeader>
          <CardContent>
            <p>{error}</p>
            <Button onClick={() => refetch()} className="mt-4">
              Réessayer
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Exemple d'utilisation de l'API</h1>

      {/* Message de feedback */}
      {message && (
        <div className="mb-4 p-4 bg-blue-100 text-blue-800 rounded">
          {message}
        </div>
      )}

      {/* Bouton pour créer une tâche */}
      <div className="mb-6">
        <Button
          onClick={handleCreateTask}
          disabled={mutationLoading}
          className="mr-2"
        >
          {mutationLoading ? 'Création...' : 'Créer une tâche de test'}
        </Button>
        <Button onClick={() => refetch()} variant="outline">
          Rafraîchir la liste
        </Button>
      </div>

      {/* Liste des tâches */}
      <div className="space-y-4">
        <h2 className="text-2xl font-semibold">
          Tâches ({tasks.length})
        </h2>

        {tasks.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500">
                Aucune tâche trouvée. Créez-en une pour commencer !
              </p>
            </CardContent>
          </Card>
        ) : (
          tasks.map((task) => (
            <Card key={task.id}>
              <CardHeader>
                <CardTitle className="flex justify-between items-center">
                  <span>{task.name}</span>
                  <Button
                    onClick={() => handleDeleteTask(task.id)}
                    variant="destructive"
                    size="sm"
                    disabled={mutationLoading}
                  >
                    Supprimer
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-gray-600">
                  <strong>Statut:</strong> {task.status}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Priorité:</strong> {task.priority || 'Non définie'}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Temps passé:</strong> {task.timeSpent || '0h'}
                </p>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
