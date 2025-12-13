# CloudNive Blog - Configuration API

## 🔌 Intégration API Backend

L'API backend est accessible via : **`https://cloudnive-api.nivekaa.com`**

### Configuration

1. **Copier le fichier d'environnement** :
   ```bash
   cp .env.example .env
   ```

2. **L'URL de l'API est déjà configurée** dans `.env` :
   ```env
   PUBLIC_API_URL=https://cloudnive-api.nivekaa.com
   ```

### Utilisation dans le code

Importez les helpers API depuis `src/lib/api.js` :

```javascript
import { api } from '@/lib/api';

// Récupérer tous les articles
const { items } = await api.getArticles({ page: 1, limit: 10 });

// Récupérer un article
const article = await api.getArticle('mon-article');

// Créer un article
const result = await api.createArticle({
  title: 'Mon article',
  content: '# Contenu...',
  category: 'DevOps',
  tags: ['kubernetes', 'docker']
});

// Upload une image
const image = await api.uploadImage({
  filename: 'cover.jpg',
  content: base64Content,
  contentType: 'image/jpeg'
});

// Supprimer une image
await api.deleteImage('1234567890-cover.jpg');
```

### Endpoints API

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| `GET` | `/articles` | Liste des articles (avec filtres) |
| `GET` | `/articles/:slug` | Détail d'un article |
| `POST` | `/articles` | Créer un article |
| `POST` | `/images` | Upload image de couverture |
| `DELETE` | `/images/:filename` | Supprimer une image |

### Variables d'environnement

- `PUBLIC_API_URL` : URL de l'API backend (préfixé `PUBLIC_` pour être accessible côté client)

### Configuration locale

Pour le développement local avec API Gateway Local :

```env
PUBLIC_API_URL=http://localhost:3000
```
