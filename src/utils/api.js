export const articles = [
    {
        slug: "introduction-kubernetes",
        title: "Introduction à Kubernetes : Le guide complet",
        description: "Découvrez les concepts fondamentaux de Kubernetes, l'orchestrateur de conteneurs qui a révolutionné le déploiement d'applications.",
        date: "2025-01-12",
        category: "DevOps",
        tags: ["kubernetes", "containers", "docker"],
        cover: "https://placehold.co/600x400/2563eb/ffffff?text=Kubernetes",
        content: `
# Introduction à Kubernetes

Kubernetes (K8s) est un système open-source permettant d'automatiser le déploiement, la mise à l'échelle et la gestion des applications conteneurisées. Il regroupe les conteneurs qui constituent une application dans des unités logiques pour une gestion et une découverte facilitées.

## Pourquoi Kubernetes ?

À l'ère du cloud native, les applications sont découpées en microservices. Gérer ces centaines de conteneurs manuellement est impossible. C'est là qu'intervient Kubernetes.

### Concepts Clés

1. **Pod** : L'unité de base. Un groupe d'un ou plusieurs conteneurs.
2. **Node** : Une machine (physique ou virtuelle) qui exécute les pods.
3. **Cluster** : Un ensemble de nodes gérés par un Control Plane.
4. **Service** : Une abstraction qui définit un jeu de pods et une politique d'accès.

## Architecture

Un cluster Kubernetes se compose de deux parties principales :
- **Le Control Plane** : Le cerveau du cluster (API Server, Scheduler, etcd...).
- **Les Nodes** : Les ouvriers (Kubelet, Kube-proxy, Container Runtime).

## Conclusion

Kubernetes est devenu le standard de facto pour l'orchestration de conteneurs. Sa courbe d'apprentissage est raide, mais la puissance qu'il offre est inégalée.
    `,
        html: `
<h1>Introduction à Kubernetes</h1>
<p>Kubernetes (K8s) est un système open-source permettant d'automatiser le déploiement, la mise à l'échelle et la gestion des applications conteneurisées. Il regroupe les conteneurs qui constituent une application dans des unités logiques pour une gestion et une découverte facilitées.</p>
<h2>Pourquoi Kubernetes ?</h2>
<p>À l'ère du cloud native, les applications sont découpées en microservices. Gérer ces centaines de conteneurs manuellement est impossible. C'est là qu'intervient Kubernetes.</p>
<h3>Concepts Clés</h3>
<ul>
<li><strong>Pod</strong> : L'unité de base. Un groupe d'un ou plusieurs conteneurs.</li>
<li><strong>Node</strong> : Une machine (physique ou virtuelle) qui exécute les pods.</li>
<li><strong>Cluster</strong> : Un ensemble de nodes gérés par un Control Plane.</li>
<li><strong>Service</strong> : Une abstraction qui définit un jeu de pods et une politique d'accès.</li>
</ul>
<h2>Architecture</h2>
<p>Un cluster Kubernetes se compose de deux parties principales :</p>
<ul>
<li><strong>Le Control Plane</strong> : Le cerveau du cluster (API Server, Scheduler, etcd...).</li>
<li><strong>Les Nodes</strong> : Les ouvriers (Kubelet, Kube-proxy, Container Runtime).</li>
</ul>
<h2>Conclusion</h2>
<p>Kubernetes est devenu le standard de facto pour l'orchestration de conteneurs. Sa courbe d'apprentissage est raide, mais la puissance qu'il offre est inégalée.</p>
    `
    },
    {
        slug: "astro-framework",
        title: "Pourquoi Astro est le futur du Web Statique",
        description: "Analyse approfondie d'Astro, le framework qui parie sur le 'Zero JS' par défaut pour des performances exceptionnelles.",
        date: "2025-02-15",
        category: "Frontend",
        tags: ["astro", "javascript", "performance"],
        cover: "https://placehold.co/600x400/f97316/ffffff?text=Astro",
        content: `
# Pourquoi Astro est le futur du Web Statique

Astro est un framework web tout-en-un conçu pour la vitesse. Il vous permet de construire votre site avec vos composants UI préférés (React, Vue, Svelte, etc.) et de livrer du HTML pur, sans JavaScript inutile.

## L'Architecture des Îles (Islands Architecture)

C'est la "killer feature" d'Astro. Au lieu d'hydrater toute la page (comme Next.js ou Nuxt), Astro hydrate uniquement les composants interactifs isolés.

### Avantages

- **Performance** : Moins de JS = chargement plus rapide.
- **Flexibilité** : Utilisez React pour le header, Svelte pour le slider, et du HTML statique pour le reste.
- **Simplicité** : Pas de complexité liée à l'état global complexe si ce n'est pas nécessaire.

## Exemple de Code

\`\`\`astro
---
import Header from './Header.astro';
import Counter from './Counter.jsx';
---
<html>
  <body>
    <Header />
    <h1>Hello World</h1>
    <Counter client:visible /> <!-- Seul ce composant charge du JS -->
  </body>
</html>
\`\`\`

## Conclusion

Pour les sites de contenu (blogs, portfolios, documentation), Astro est probablement le meilleur choix actuel en 2025.
    `,
        html: `
<h1>Pourquoi Astro est le futur du Web Statique</h1>
<p>Astro est un framework web tout-en-un conçu pour la vitesse. Il vous permet de construire votre site avec vos composants UI préférés (React, Vue, Svelte, etc.) et de livrer du HTML pur, sans JavaScript inutile.</p>
<h2>L'Architecture des Îles (Islands Architecture)</h2>
<p>C'est la "killer feature" d'Astro. Au lieu d'hydrater toute la page (comme Next.js ou Nuxt), Astro hydrate uniquement les composants interactifs isolés.</p>
<h3>Avantages</h3>
<ul>
<li><strong>Performance</strong> : Moins de JS = chargement plus rapide.</li>
<li><strong>Flexibilité</strong> : Utilisez React pour le header, Svelte pour le slider, et du HTML statique pour le reste.</li>
<li><strong>Simplicité</strong> : Pas de complexité liée à l'état global complexe si ce n'est pas nécessaire.</li>
</ul>
<h2>Exemple de Code</h2>
<pre><code>---
import Header from './Header.astro';
import Counter from './Counter.jsx';
---
&lt;html&gt;
  &lt;body&gt;
    &lt;Header /&gt;
    &lt;h1&gt;Hello World&lt;/h1&gt;
    &lt;Counter client:visible /&gt; &lt;!-- Seul ce composant charge du JS --&gt;
  &lt;/body&gt;
&lt;/html&gt;
</code></pre>
<h2>Conclusion</h2>
<p>Pour les sites de contenu (blogs, portfolios, documentation), Astro est probablement le meilleur choix actuel en 2025.</p>
    `
    },
    {
        slug: "react-hooks-guide",
        title: "Maîtriser les Hooks React en 2025",
        description: "Un guide avancé sur l'utilisation des Hooks React, de useState à useTransition, pour des applications fluides.",
        date: "2025-03-10",
        category: "Frontend",
        tags: ["react", "javascript", "hooks"],
        cover: "https://placehold.co/600x400/61dafb/000000?text=React+Hooks",
        content: `
# Maîtriser les Hooks React

Les Hooks ont transformé la façon dont nous écrivons du React. Fini les classes, place aux fonctions. Mais les maîtrisez-vous vraiment ?

## Les Fondamentaux

- **useState** : Pour l'état local.
- **useEffect** : Pour les effets de bord (API calls, subscriptions).
- **useContext** : Pour éviter le "prop drilling".

## Les Hooks Avancés

### useMemo et useCallback

Essentiels pour la performance, mais souvent mal utilisés. Ils servent à mémoriser des valeurs ou des fonctions pour éviter des re-rendus inutiles.

### useTransition

Introduit récemment, il permet de marquer une mise à jour d'état comme "non urgente", gardant l'interface réactive pendant un calcul lourd.

\`\`\`jsx
const [isPending, startTransition] = useTransition();

function handleClick() {
  startTransition(() => {
    // Mise à jour lourde
    setTab('comments');
  });
}
\`\`\`

## Conclusion

React continue d'évoluer. Rester à jour sur les patterns de Hooks est crucial pour tout développeur frontend.
    `,
        html: `
<h1>Maîtriser les Hooks React</h1>
<p>Les Hooks ont transformé la façon dont nous écrivons du React. Fini les classes, place aux fonctions. Mais les maîtrisez-vous vraiment ?</p>
<h2>Les Fondamentaux</h2>
<ul>
<li><strong>useState</strong> : Pour l'état local.</li>
<li><strong>useEffect</strong> : Pour les effets de bord (API calls, subscriptions).</li>
<li><strong>useContext</strong> : Pour éviter le "prop drilling".</li>
</ul>
<h2>Les Hooks Avancés</h2>
<h3>useMemo et useCallback</h3>
<p>Essentiels pour la performance, mais souvent mal utilisés. Ils servent à mémoriser des valeurs ou des fonctions pour éviter des re-rendus inutiles.</p>
<h3>useTransition</h3>
<p>Introduit récemment, il permet de marquer une mise à jour d'état comme "non urgente", gardant l'interface réactive pendant un calcul lourd.</p>
<pre><code class="language-jsx">const [isPending, startTransition] = useTransition();

function handleClick() {
  startTransition(() =&gt; {
    // Mise à jour lourde
    setTab('comments');
  });
}
</code></pre>
<h2>Conclusion</h2>
<p>React continue d'évoluer. Rester à jour sur les patterns de Hooks est crucial pour tout développeur frontend.</p>
    `
    },
    {
        slug: "serverless-aws",
        title: "Architecture Serverless sur AWS : Le Guide Pratique",
        description: "Comment construire une API robuste et scalable avec AWS Lambda, API Gateway et DynamoDB sans gérer un seul serveur.",
        date: "2025-04-05",
        category: "Cloud",
        tags: ["aws", "serverless", "lambda", "backend"],
        cover: "https://placehold.co/600x400/ff9900/000000?text=AWS+Serverless",
        content: `
# Architecture Serverless sur AWS

Le Serverless n'est pas une mode, c'est une évolution logique de l'infrastructure cloud. Plus de gestion d'OS, de patching, ou de scaling manuel.

## La Stack Classique

1. **AWS Lambda** : Le code (Node.js, Python, Go...).
2. **API Gateway** : La porte d'entrée HTTP.
3. **DynamoDB** : La base de données NoSQL ultra-rapide.

## Avantages

- **Coût** : Vous payez à l'usage (à la milliseconde). 0 trafic = 0 facture.
- **Scalabilité** : De 0 à 10 000 requêtes/seconde sans intervention.
- **Maintenance** : Réduite au minimum.

## Défis

Le "Cold Start" (démarrage à froid) est le principal ennemi. Lorsqu'une fonction n'a pas été utilisée depuis longtemps, AWS doit initialiser un conteneur, ce qui ajoute de la latence (100ms à quelques secondes).

### Solutions
- Utiliser des langages légers (Node.js, Go, Rust).
- Provisioned Concurrency (payant).

## Conclusion

Pour une startup ou un nouveau projet, démarrer en Serverless est souvent le choix le plus rationnel économiquement et techniquement.
    `,
        html: `
<h1>Architecture Serverless sur AWS</h1>
<p>Le Serverless n'est pas une mode, c'est une évolution logique de l'infrastructure cloud. Plus de gestion d'OS, de patching, ou de scaling manuel.</p>
<h2>La Stack Classique</h2>
<ol>
<li><strong>AWS Lambda</strong> : Le code (Node.js, Python, Go...).</li>
<li><strong>API Gateway</strong> : La porte d'entrée HTTP.</li>
<li><strong>DynamoDB</strong> : La base de données NoSQL ultra-rapide.</li>
</ol>
<h2>Avantages</h2>
<ul>
<li><strong>Coût</strong> : Vous payez à l'usage (à la milliseconde). 0 trafic = 0 facture.</li>
<li><strong>Scalabilité</strong> : De 0 à 10 000 requêtes/seconde sans intervention.</li>
<li><strong>Maintenance</strong> : Réduite au minimum.</li>
</ul>
<h2>Défis</h2>
<p>Le "Cold Start" (démarrage à froid) est le principal ennemi. Lorsqu'une fonction n'a pas été utilisée depuis longtemps, AWS doit initialiser un conteneur, ce qui ajoute de la latence (100ms à quelques secondes).</p>
<h3>Solutions</h3>
<ul>
<li>Utiliser des langages légers (Node.js, Go, Rust).</li>
<li>Provisioned Concurrency (payant).</li>
</ul>
<h2>Conclusion</h2>
<p>Pour une startup ou un nouveau projet, démarrer en Serverless est souvent le choix le plus rationnel économiquement et techniquement.</p>
    `
    },
    {
        slug: "tailwind-v4",
        title: "Tailwind CSS v4 : La Révolution CSS",
        description: "Tout ce qu'il faut savoir sur la nouvelle version de Tailwind : moteur Rust, performance accrue et simplification de la configuration.",
        date: "2025-05-20",
        category: "Frontend",
        tags: ["css", "tailwind", "design"],
        cover: "https://placehold.co/600x400/38bdf8/ffffff?text=Tailwind+v4",
        content: `
# Tailwind CSS v4

Tailwind v4 est là, et c'est une réécriture complète du framework.

## Nouveautés Majeures

### 1. Moteur Oxide (Rust)
Le cœur de Tailwind a été réécrit en Rust. Résultat : des builds jusqu'à 10x plus rapides.

### 2. Zéro Configuration
Plus besoin de \`tailwind.config.js\` pour la plupart des projets. Le framework détecte automatiquement vos fichiers.

### 3. CSS-first configuration
La configuration se fait désormais directement dans le CSS via des variables CSS.

\`\`\`css
@theme {
  --color-primary: #3b82f6;
  --font-sans: "Inter", sans-serif;
}
\`\`\`

## Migration

La migration depuis la v3 est facilitée par un outil dédié, mais attention aux plugins tiers qui pourraient ne pas être encore compatibles.

## Conclusion

Tailwind v4 confirme sa position de leader en rendant l'expérience développeur encore plus fluide et rapide.
    `,
        html: `
<h1>Tailwind CSS v4</h1>
<p>Tailwind v4 est là, et c'est une réécriture complète du framework.</p>
<h2>Nouveautés Majeures</h2>
<h3>1. Moteur Oxide (Rust)</h3>
<p>Le cœur de Tailwind a été réécrit en Rust. Résultat : des builds jusqu'à 10x plus rapides.</p>
<h3>2. Zéro Configuration</h3>
<p>Plus besoin de <code>tailwind.config.js</code> pour la plupart des projets. Le framework détecte automatiquement vos fichiers.</p>
<h3>3. CSS-first configuration</h3>
<p>La configuration se fait désormais directement dans le CSS via des variables CSS.</p>
<pre><code class="language-css">@theme {
  --color-primary: #3b82f6;
  --font-sans: "Inter", sans-serif;
}
</code></pre>
<h2>Migration</h2>
<p>La migration depuis la v3 est facilitée par un outil dédié, mais attention aux plugins tiers qui pourraient ne pas être encore compatibles.</p>
<h2>Conclusion</h2>
<p>Tailwind v4 confirme sa position de leader en rendant l'expérience développeur encore plus fluide et rapide.</p>
    `
    }
];

export const categories = ["DevOps", "Frontend", "Backend", "Cloud"];
export const tags = ["kubernetes", "containers", "astro", "javascript", "react", "aws"];

export async function getArticles() {
    return articles;
}

export async function getArticleBySlug(slug) {
    return articles.find(article => article.slug === slug);
}

export async function getCategories() {
    return categories;
}

export async function getTags() {
    return tags;
}
