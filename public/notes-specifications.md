# Spécifications Techniques et Fonctionnelles : Module "Espace Notes"

**Date** : Avril 2026
**Style de Design** : "Le Technicien Lumineux" (Minecraft Moderne / Gaming)
**Objectif** : Guide de rétro-ingénierie et charte fonctionnelle permettant de recréer le module "Notes" à l'identique.

---

## 1. Règles de Gestion et Sécurité (Dual-Context)

L'application repose sur un principe de code mutualisé pour le public et l'administration. La sécurité et l'interface s'adaptent selon un booléen `isAdmin`.

### 1.1 Mode Public (`isAdmin = false`)
- **Lecture seule** : Les visiteurs nagivent le contenu, utilisent la barre de recherche et lisent les markdown.
- **Désactivations** :
  - Pas d'options d'édition (`Éditer`, `Supprimer`).
  - Blocage strict du glisser-déposer (Drag & Drop) dans la Sidebar.
  - Boutons de création de Dossiers / Notes masqués (+N, +G, etc.).

### 1.2 Mode Administration (`isAdmin = true`)
- **Contexte Sécurisé** : L'accès passe par `/admin/notes`, protégé par Kinde Auth (Composant `AdminGuard`).
- **Droits complets** : L'interface active les événements d'édition, les formulaires de création et le refactoring dynamique de l'arborescence.

---

## 2. Style et Ergonomie (Le Style "Minecraft Moderne")

Le système exploite le thème "Technicien Lumineux", mêlant une esthétique Minecraft/Gaming ultra-moderne avec des lignes inspirées d'interfaces techniques (Console Hacker).

### 2.1 Ergonomie et "Game Feel" (Comportement Interactif)

Afin que l'application ne "paraisse" pas être une simple page web, mais ressemble à une interface *in-game*, les interactions obéissent à des règles matérielles précises :

- **Le Survol (Hover) à Sensation Block** : Les cartes de notes (`NoteViewer`) réagissent au survol par une translation négative (`hover:-translate-y-1`) combinée avec une grosse ombre asymétrique pleine de 4px (`shadow-[4px_4px_0]`). Cela donne l'impression d'un bloc Minecraft 3D qui s'extrude de l'écran.
- **Enfoncement Physique des Boutons** : Les boutons d'interface (ex: `+Note`, `Éditer`) possèdent une bordure épaisse (2px) et une ombre franche de 2px `shadow-[2px_2px_0]`. Au moment du clic (pseudo-sélecteur `active:`), l'ombre disparaît et l'élément glisse pour remplacer l'espace de l'ombre (`active:translate-y-0.5 active:translate-x-0.5`). C'est l'essence même de l'ergonomie "retro gaming" d'appui sur un bouton plastique.
- **Animations de Pulsation** : Les bullets de liste (les carrés `■` devant les titres) utilisent les classes `animate-pulse` (au ralenti pour les dossiers) ou `animate-bounce` (notes) au survol, simulant le focus d'un jeu vidéo ou d'une ligne de commande de chargement.
- **Indicateurs de Hiérarchie Bruts** : Pas d'icônes lisses (de type Heroicons). La typographie elle-même trace l'arborescence : `[+]`, `[-]`, `└─`, créant une ergonomie technique instantanée similaire à "l'Inventory System" des jeux de survie logiques.

### 2.2 Choix Chromatiques Alternatifs
- **Mode Clair ("L'Atelier en Bois / Pierre")** : L'interface repose sur des teintes sable/bois (`#fdfaf6`, `#f4eee4`) et des ombres nettes vert émeraude (`#48bb78` et `#2f855a`). Les bordures sont grèges (`#d4c5b0`).
- **Mode Sombre ("Le Command Block Obscur")** : Le fond devient transparent/noir, l'interface est éteinte de tout "bruit" blanc. Le vert émeraude s'y maintient pour faire office d'effet "Néon". Les cartes noircissent et se parent de bordures grises industrielles (`dark:border-gray-800`).

### 2.3 Traitements Typographiques et Visuels
- **Typographie Dominante** : La police `JetBrains Mono` orchestre la totalité de l'interface `sys.NOTES`, des titres de boutons jusqu'aux métadonnées systèmes du type `// TARGET: DEVOPS`. 
- **La Grille Blueprint (Conception)** : Le système de fichiers repose visuellement sur une grille modulaire générée de manière native par CSS (superposition de `linear-gradient` transparent vert avec un step de 20px). Cela évoque l'aspect "Table de craft" ou "Grille d'architecture logiciel".

---

## 3. Architecture des Composants React Modulaires

Le module utilise des concepts de décomposition stricts pour faciliter la réutilisation et les appels API optimisés :

### 3.1 Orchestrateur `NotesApp.jsx`
Le State Manager global. Il instancie l'arbre, stocke le *nœud actuellement actif*, récupère de la Data asynchrone (`api.getNotesTree(lang)`) et gère passivement le passage des directives (`isAdmin`) à ses deux sous-parties visuelles. Maintient silencieusement l'URL via `?n=` pour le bookmarking.

### 3.2 L'Arborescence : `NotesSidebar.jsx` & `TreeNode`
- **Flexibilité Récursive** : Le composant de rendu `TreeNode` implémente un système récursif (il s'appelle lui-même si le nœud `isFolder`). 
- **Algorithmique du Drag and Drop** : La fonctionnalité la plus complexe mathématiquement. Utilise les events `onDragOver` sur chaque nœud pour déduire selon le pointeur (X/Y local) si l'élément survolé sera au "top", "bottom" ou "inside" (création de hiérarchie parente). 
- **Optimistic UI** : Sur déplacement, l'arbre React se met à jour immédiatement à l'écran, tandis que la tâche asynchrone `api.updateNotesTree()` tourne en fond sans "loader" bloquant pour fluidifier la perception utilisateur.

### 3.3 Présentoirs `NoteViewer.jsx`
- Évolutif selon la nature du `node` :
  - **Vue Dossier** : Fournit un dashboard regroupant tous les éléments enfants dans des capsules "style Minecraft", doté d'une fonction récursive de recherche en texte natif pour filtrer l'ensemble des branches sous-jacentes.
  - **Vue Éditoriale** : Effectue un Fetch en `lazy` d'une note unique. Charge fièrement les tags et le Markdown préformaté. Contient les verrous stricts pour l'apparition des boutons structurants (Supprimer/Modifier).

### 3.4 Modal de Forge `NoteEditorModal.jsx` et `ArticleEditor.jsx`
- L'éditeur de note n'a pas été re-développé : le composant massif de rédaction du blog `ArticleEditor` est recyclé. 
- Il a été découplé du Hook de login Kinde (via suppression du `useKindeAuth()` et utilisation d'une simple variable de props statique). Il sert ainsi de moteur Markdown polyvalent aux capacités asynchrones communes de Création et d'Édition (POST, PUT).
