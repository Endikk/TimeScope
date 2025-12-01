# Installation TimeScope

## Prérequis
- [Docker Desktop](https://www.docker.com/products/docker-desktop)
- [Git](https://git-scm.com/downloads)

## Démarrage Rapide

1. **Cloner le projet**
   ```bash
   git clone https://github.com/Endikk/TimeScope.git
   cd TimeScope
   ```

2. **Lancer l'application**
   Double-cliquez sur le script `start-all.ps1` (Windows) ou lancez-le via PowerShell.
   
   *Ce script s'occupe de tout : il détecte votre environnement et lance tous les conteneurs Docker (API, Frontend, BDD) proprement.*

3. **Accès**
   - **App :** [http://localhost:3000](http://localhost:3000)
   - **API :** [http://localhost:8080/swagger](http://localhost:8080/swagger)
   - **BDD :** [http://localhost:5050](http://localhost:5050) (Login: `admin@timescope.com` / `admin`)

## Commandes Utiles
- **Arrêter :** `docker-compose down`
- **Logs :** `docker-compose logs -f`
