## Amiseo Client Dashboard

Application Next.js (App Router + Tailwind v4) qui fournit :

- Un cockpit admin pour mettre à jour les données de chaque client (résumé, KPIs, actions passées / futures, initiatives, bloc e‑commerce).
- Une vue client ultra visuelle synchronisée en temps réel avec vos mises à jour.
- Authentification simplifiée par rôle (admin vs client), stockée via cookie JWT.

### Lancer le projet

```bash
npm install
npm run dev
```

Puis ouvrez `http://localhost:3000`.

| Rôle  | Identifiant | Mot de passe |
| ----- | ----------- | ------------ |
| Admin | `Maxim`     | `Maxim2009`  |
| Client démo | `test` | `test` |

L’admin est redirigé vers `/admin`, les clients vers `/dashboard`.

### Gestion des données

Les données sont persistées dans deux fichiers JSON faciles à éditer :

- `data/users.json` : comptes et rôles. Ajoutez un objet `{ "username": "...", "password": "...", "role": "client", "clientId": "<id client>" }` pour donner l’accès à un nouveau client.
- `data/clients.json` : contenu affiché côté client + champs éditables dans le cockpit admin.

> **Tips** : vous pouvez dupliquer l’objet du client `test` pour créer un nouveau dossier, puis l’associer à un compte dans `data/users.json`.

### Personnalisation dans l’admin

Dans `/admin` vous pouvez :

1. Sélectionner un client dans la colonne de gauche.
2. Modifier nom, secteur, pitch, KPIs, highlights, actions du mois, pipeline à venir et initiatives.
3. Activer/désactiver le bloc e‑commerce (ex. réservé au client `test`).
4. Sauvegarder → les données sont immédiatement persistées sur disque (`PUT /api/clients/[id]`) et visibles par le client.

Chaque section dispose de boutons “Ajouter” pour créer de nouveaux items (bullets, KPIs, initiatives). Le bouton “Revenir aux données sauvegardées” recharge le dernier état persisté.

### Architecture rapide

- `src/app/login/page.tsx` : onboarding + formulaire de connexion.
- `src/app/admin/page.tsx` + `components/admin-dashboard.tsx` : interface éditoriale.
- `src/app/dashboard/page.tsx` + `components/client-dashboard.tsx` : vue consultative.
- API routes (`src/app/api/*`) : login/logout + lecture/écriture des fiches clients.
- Utilitaires `src/lib/*` : gestion des fichiers JSON + helpers d’auth.

### Roadmap / idées

1. Ajouter un historique des modifications (timestamp + auteur).
2. Brancher un vrai SGBD (PostgreSQL/Planetscale) quand vous aurez besoin d’un hébergement cloud.
3. Plugger des widgets additionnels (performance ads, courbes GA4) via embed ou appels API réels.
