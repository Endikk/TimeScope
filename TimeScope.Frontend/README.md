# TimeScope Frontend

Frontend Next.js pour l'application TimeScope avec connexion API via Axios.

## 🚀 Technologies

- **Next.js 15** - Framework React
- **React 19** - Bibliothèque UI
- **TypeScript** - Typage statique
- **TailwindCSS v4** - Framework CSS
- **shadcn/ui** - Composants UI
- **Axios** - Client HTTP pour les appels API

## 📁 Structure des Dossiers

```
TimeScope.Frontend/
├── components/          # Composants React réutilisables
│   └── ui/             # Composants shadcn/ui
├── pages/              # Pages Next.js
├── lib/
│   ├── api/            # Configuration et services API
│   │   ├── axios.config.ts      # Configuration Axios
│   │   └── services/            # Services API
│   │       ├── tasks.service.ts
│   │       ├── users.service.ts
│   │       ├── timeentries.service.ts
│   │       └── index.ts
│   ├── hooks/          # Hooks React personnalisés
│   │   ├── use-tasks.ts
│   │   ├── use-users.ts
│   │   └── index.ts
│   ├── types.ts        # Types TypeScript
│   └── utils.ts        # Fonctions utilitaires
└── public/             # Assets statiques
```

## 🔧 Installation

```bash
# Installer les dépendances
npm install

# Copier le fichier d'environnement
cp .env.example .env.local

# Démarrer le serveur de développement
npm run dev
```

L'application sera disponible sur http://localhost:3000

## 🌐 Configuration API

### Variables d'Environnement

Créez un fichier `.env.local` à la racine du projet :

```env
NEXT_PUBLIC_API_URL=https://localhost:5001/api
NEXT_PUBLIC_APP_NAME=TimeScope
NEXT_PUBLIC_APP_VERSION=1.0.0
```

### Configuration Axios

La configuration Axios se trouve dans [lib/api/axios.config.ts](lib/api/axios.config.ts) :

- **Base URL** : Définie par `NEXT_PUBLIC_API_URL`
- **Timeout** : 10 secondes
- **Credentials** : Activés pour les cookies/authentification
- **Intercepteurs** : Gestion automatique des tokens JWT et des erreurs

## 📡 Utilisation des Services API

### Méthode 1 : Utiliser les Hooks (Recommandé)

Les hooks simplifient l'utilisation des services API avec gestion automatique du state :

```typescript
import { useTasks, useTaskMutations } from '@/lib/hooks';

function MyComponent() {
  // Récupérer les tâches
  const { tasks, loading, error, refetch } = useTasks();

  // Mutations (create, update, delete)
  const { createTask, updateTask, deleteTask } = useTaskMutations();

  // Créer une tâche
  const handleCreate = async () => {
    const newTask = await createTask({
      name: 'Ma nouvelle tâche',
      status: 'EnAttente',
      precision: 'High',
      priority: 'High',
      themeId: 'xxx',
      estimatedTime: '02:00:00',
    });
    refetch(); // Rafraîchir la liste
  };

  if (loading) return <div>Chargement...</div>;
  if (error) return <div>Erreur: {error}</div>;

  return (
    <div>
      {tasks.map(task => (
        <div key={task.id}>{task.name}</div>
      ))}
    </div>
  );
}
```

### Méthode 2 : Utiliser les Services Directement

Pour plus de contrôle, utilisez les services directement :

```typescript
import { tasksService } from '@/lib/api/services';

async function fetchTasks() {
  try {
    const tasks = await tasksService.getAllTasks();
    console.log(tasks);
  } catch (error) {
    console.error('Erreur:', error);
  }
}
```

## 📚 Services Disponibles

### Tasks Service

```typescript
import { tasksService } from '@/lib/api/services';

// CRUD de base
await tasksService.getAllTasks();
await tasksService.getTaskById(id);
await tasksService.createTask(taskData);
await tasksService.updateTask(id, taskData);
await tasksService.deleteTask(id);

// Requêtes spécifiques
await tasksService.getTasksByUser(userId);
await tasksService.getTasksByStatus('EnCours');
await tasksService.getTasksByTheme(themeId);
```

### Users Service

```typescript
import { usersService } from '@/lib/api/services';

// CRUD de base
await usersService.getAllUsers();
await usersService.getUserById(id);
await usersService.createUser(userData);
await usersService.updateUser(id, userData);
await usersService.deleteUser(id);

// Utilisateur actuel
await usersService.getCurrentUser();
```

### Time Entries Service

```typescript
import { timeEntriesService } from '@/lib/api/services';

// CRUD de base
await timeEntriesService.getAllTimeEntries();
await timeEntriesService.getTimeEntryById(id);
await timeEntriesService.createTimeEntry(entryData);
await timeEntriesService.updateTimeEntry(id, entryData);
await timeEntriesService.deleteTimeEntry(id);

// Requêtes spécifiques
await timeEntriesService.getTimeEntriesByUser(userId);
await timeEntriesService.getTimeEntriesByTask(taskId);
await timeEntriesService.getTimeEntriesByDateRange(startDate, endDate);
```

## 🎣 Hooks Disponibles

### useTasks()
Récupère toutes les tâches avec gestion du loading/error.

```typescript
const { tasks, loading, error, refetch } = useTasks();
```

### useTask(id)
Récupère une tâche spécifique par ID.

```typescript
const { task, loading, error, refetch } = useTask(taskId);
```

### useTaskMutations()
Fournit les fonctions pour créer, modifier et supprimer des tâches.

```typescript
const { createTask, updateTask, deleteTask, loading, error } = useTaskMutations();
```

### useUsers()
Récupère tous les utilisateurs.

```typescript
const { users, loading, error, refetch } = useUsers();
```

### useCurrentUser()
Récupère l'utilisateur connecté.

```typescript
const { user, loading, error, refetch } = useCurrentUser();
```

## 🔐 Authentification

### Stocker le Token JWT

```typescript
// Lors de la connexion
const token = 'votre-jwt-token';
localStorage.setItem('token', token);
```

### Le Token est Automatiquement Inclus

L'intercepteur Axios ajoute automatiquement le token à chaque requête :

```typescript
// Dans axios.config.ts
axiosInstance.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
```

### Gestion des Erreurs 401 (Non Authentifié)

En cas d'erreur 401, l'utilisateur est automatiquement redirigé vers la page de connexion :

```typescript
// Dans axios.config.ts
if (error.response?.status === 401) {
  localStorage.removeItem('token');
  window.location.href = '/login';
}
```

## 📄 Exemple Complet

Voir [pages/api-example.tsx](pages/api-example.tsx) pour un exemple complet d'utilisation.

## 🛠️ Scripts Disponibles

```bash
# Développement
npm run dev

# Build de production
npm run build

# Lancer la version de production
npm start

# Linting
npm run lint
```

## 🐛 Débogage

### Problèmes CORS

Si vous rencontrez des erreurs CORS, vérifiez que :
1. Le backend est bien lancé
2. L'URL dans `.env.local` est correcte
3. Le backend autorise `http://localhost:3000` dans sa configuration CORS

### Erreurs de Connexion

```typescript
// Vérifier que l'API est accessible
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);

// Tester la connexion
import axiosInstance from '@/lib/api/axios.config';
axiosInstance.get('/tasks').then(console.log).catch(console.error);
```

## 📖 Documentation Complète

- [Documentation Principale](../README.md)
- [Documentation Backend](../README-BACKEND.md)
- [Guide de Démarrage Rapide](../QUICKSTART.md)

## 🤝 Contribution

Les contributions sont les bienvenues ! Consultez le [README principal](../README.md) pour les guidelines.

---

⏰ **TimeScope Frontend** - Gestion intelligente du temps
