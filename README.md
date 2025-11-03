# TimeScope

Application de gestion intelligente du temps et de productivité. TimeScope calcule automatiquement les heures de travail des employés en fonction des tâches qu'ils accomplissent, facilite le suivi de la productivité et génère des rapports précis.

## Structure du Projet

```
TimeScope/
├── TimeScope.Frontend/      # Application Next.js 15 + React 19 + TypeScript
│   ├── components/          # Composants UI avec shadcn/ui
│   ├── pages/              # Pages et routing Next.js
│   ├── lib/                # Utilitaires et types TypeScript
│   └── public/             # Assets statiques
│
├── TimeScope.API/          # API REST ASP.NET Core 8
│   ├── Controllers/        # Contrôleurs API
│   ├── Program.cs          # Configuration de l'application
│   └── appsettings.json    # Configuration
│
├── TimeScope.Core/         # Domain Layer - Clean Architecture
│   ├── Entities/           # Entités métier
│   └── Interfaces/         # Contrats/Interfaces
│
├── TimeScope.Infrastructure/ # Infrastructure Layer
│   ├── Data/               # DbContext et configuration EF Core
│   └── Repositories/       # Implémentations des repositories
│
├── docker-compose.yml      # PostgreSQL + pgAdmin
└── TimeScope.sln          # Solution .NET
```

## Stack Technologique

### Frontend
- **[Next.js 15](https://nextjs.org/)** - Framework React avec App Router
- **[React 19](https://react.dev/)** - Bibliothèque UI avec Server Components
- **[TypeScript](https://www.typescriptlang.org/)** - JavaScript typé (mode strict)
- **[TailwindCSS v4](https://tailwindcss.com/)** - Framework CSS utility-first
- **[shadcn/ui](https://ui.shadcn.com/)** - Composants UI de haute qualité

### Backend
- **[.NET 8](https://dotnet.microsoft.com/)** - Framework backend haute performance
- **[ASP.NET Core 8](https://learn.microsoft.com/aspnet/core/)** - API Web moderne
- **[Entity Framework Core 8](https://learn.microsoft.com/ef/core/)** - ORM avec LINQ
- **[PostgreSQL 16](https://www.postgresql.org/)** - Base de données relationnelle
- **[MediatR](https://github.com/jbogard/MediatR)** - Pattern CQRS
- **[FluentValidation](https://fluentvalidation.net/)** - Validation élégante
- **[AutoMapper](https://automapper.org/)** - Mapping objet-objet
- **[Serilog](https://serilog.net/)** - Logging structuré

### Architecture & Patterns
- **Clean Architecture** - Séparation des couches
- **Repository Pattern** - Abstraction de l'accès aux données
- **Unit of Work Pattern** - Gestion transactionnelle
- **CQRS** - Séparation Command/Query

## Prérequis

### Pour le Frontend
- Node.js 18+ (LTS recommandé)
- npm, yarn ou pnpm

### Pour le Backend
- .NET 8 SDK ou supérieur
- PostgreSQL 16+ (ou Docker)
- dotnet-ef CLI tool

## Installation

### 1. Cloner le Projet

```bash
git clone https://github.com/Endikk/TimeScope.git
cd TimeScope
```

### 2. Démarrer PostgreSQL avec Docker

```bash
docker-compose up -d
```

Cela démarrera :
- PostgreSQL sur le port 5432
- pgAdmin sur le port 5050 (http://localhost:5050)
  - Email: admin@timescope.local
  - Password: admin

### 3. Configurer et Démarrer le Backend

```bash
# Restaurer les packages
dotnet restore

# Appliquer les migrations
cd TimeScope.Infrastructure
dotnet ef database update --startup-project ../TimeScope.API

# Démarrer l'API
cd ../TimeScope.API
dotnet run
```

L'API sera disponible sur :
- HTTPS: https://localhost:5001
- HTTP: http://localhost:5000
- Swagger: https://localhost:5001/swagger

### 4. Démarrer le Frontend

```bash
cd TimeScope.Frontend

# Installer les dépendances
npm install

# Démarrer le serveur de développement
npm run dev
```

Le frontend sera disponible sur http://localhost:3000

## Documentation

- **[README Backend](./README-BACKEND.md)** - Documentation complète du backend .NET
- **[Documentation API](http://localhost:5001/swagger)** - Documentation interactive Swagger (quand l'API est lancée)

## Modèle de Données

### Entités Principales

- **User** - Utilisateurs du système (Admin, Manager, Employee)
- **WorkTask** - Tâches de travail avec statut et priorité
- **TimeEntry** - Enregistrements de temps passé sur les tâches
- **Theme** - Thèmes pour catégoriser les tâches
- **Group** - Groupes de travail
- **Project** - Projets associés aux thèmes

Pour plus de détails, voir [README-BACKEND.md](./README-BACKEND.md)

## Scripts Disponibles

### Frontend (dans TimeScope.Frontend/)
```bash
npm run dev      # Démarrer le serveur de développement
npm run build    # Build de production
npm run start    # Démarrer le serveur de production
npm run lint     # Lancer ESLint
```

### Backend
```bash
dotnet build                    # Compiler la solution
dotnet run --project TimeScope.API    # Lancer l'API
dotnet test                     # Lancer les tests (à venir)

# Entity Framework
dotnet ef migrations add <MigrationName> --startup-project TimeScope.API
dotnet ef database update --startup-project TimeScope.API
dotnet ef migrations remove --startup-project TimeScope.API
```

## Endpoints API Principaux

### Users
- `GET /api/users` - Liste des utilisateurs
- `GET /api/users/{id}` - Détails d'un utilisateur
- `POST /api/users` - Créer un utilisateur
- `PUT /api/users/{id}` - Modifier un utilisateur
- `DELETE /api/users/{id}` - Supprimer un utilisateur

### Tasks
- `GET /api/tasks` - Liste des tâches
- `GET /api/tasks/{id}` - Détails d'une tâche
- `POST /api/tasks` - Créer une tâche
- `PUT /api/tasks/{id}` - Modifier une tâche
- `DELETE /api/tasks/{id}` - Supprimer une tâche

Pour la documentation complète de l'API, visitez http://localhost:5001/swagger

## Sécurité

- Authentification JWT (à implémenter)
- Hachage des mots de passe avec BCrypt
- Validation côté serveur avec FluentValidation
- Protection CSRF
- CORS configuré pour le frontend

## Fonctionnalités

### Actuelles
- Architecture backend Clean Architecture
- API REST avec .NET 8
- Base de données PostgreSQL avec EF Core
- Frontend Next.js avec TailwindCSS
- Composants UI avec shadcn/ui
- Logging avec Serilog
- Documentation API avec Swagger

### À Venir
- Authentification et autorisation JWT
- Dashboard de statistiques en temps réel
- Rapports et exports (PDF, Excel)
- Notifications en temps réel
- Mode hors ligne (PWA)
- Tests unitaires et d'intégration
- CI/CD Pipeline
- Déploiement Docker

## Déploiement

### Production Build

**Backend**
```bash
dotnet publish -c Release -o ./publish
```

**Frontend**
```bash
cd TimeScope.Frontend
npm run build
```

### Docker (à venir)
```bash
docker-compose -f docker-compose.prod.yml up -d
```

## Contribution

1. Fork le projet
2. Créer une branche feature (`git checkout -b feature/AmazingFeature`)
3. Commit les changements (`git commit -m 'Add some AmazingFeature'`)
4. Push vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrir une Pull Request

## Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## Auteurs

- **Endikk** - *Travail initial* - [GitHub](https://github.com/Endikk)

## Remerciements

- [shadcn/ui](https://ui.shadcn.com/) pour les composants UI
- [Clean Architecture](https://blog.cleancoder.com/uncle-bob/2012/08/13/the-clean-architecture.html) par Uncle Bob
- La communauté .NET et React
