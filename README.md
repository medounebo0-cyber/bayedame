# Portfolio — Vidéaste & Photographe

Single-page portfolio HTML/CSS/JS pur. Aucune dépendance, aucun build.

## Structure

```
v2/
├── index.html       ← Toutes les sections (hero, work, photo, cv, contact)
├── styles.css       ← Design créatif & expérimental
├── main.js          ← Curseur custom, scroll reveal, lightbox, filtres
├── README.md
└── assets/
    ├── photos/      ← Vos photos : 01.jpg, 02.jpg, …, 08.jpg
    ├── videos/      ← Showreel : showreel.mp4
    └── cv/          ← cv.pdf
```

## À personnaliser (rapide)

Cherchez/remplacez dans `index.html` :

| Placeholder | Remplacer par |
|---|---|
| `VOTRE NOM` | Votre vrai nom |
| `VN` (logo) | Vos initiales |
| `contact@votrenom.com` | Votre email |
| `+221 77 000 00 00` | Votre téléphone |
| `@votrenom` | Vos handles Instagram / Vimeo / YouTube |
| `Dakar, Sénégal` | Votre localisation |
| `Titre du projet 01..04` | Vos vrais projets vidéo |
| `https://www.youtube.com/embed/dQw4w9WgXcQ` | Vos vraies URLs YouTube/Vimeo embed |
| `Client 01..06` | Vos vrais clients |
| Section CV (timeline) | Vos vraies expériences |

## Ajouter vos médias

### Photos
Glissez vos photos dans `assets/photos/` en les nommant `01.jpg` à `08.jpg`. Elles remplaceront automatiquement les placeholders dégradés.

Pour plus de 8 photos : dupliquez un bloc `<figure class="photo__item">…` dans `index.html` et ajustez `data-cat` (portrait, paysage, evenement, street).

### Showreel (vidéo de fond du hero)
1. Mettez `showreel.mp4` dans `assets/videos/`
2. Dans `index.html`, dans `.hero__bg`, décommentez la balise `<video>` et supprimez la div `.hero__bg-fallback`.

### CV PDF
Mettez votre CV dans `assets/cv/cv.pdf` — le bouton "CV ↓" le télécharge directement.

## Formulaire de contact

Par défaut, le formulaire ouvre le client mail de l'utilisateur (mailto). Pour un envoi automatique sans intervention :

- **Formspree** (gratuit, recommandé) : remplacer la logique JS par `<form action="https://formspree.io/f/VOTRE_ID" method="POST">`
- **Netlify Forms** : si vous hébergez sur Netlify, ajoutez `netlify` à la balise `<form>`
- **EmailJS** : pour un envoi côté client via votre Gmail/Outlook

## Personnaliser les couleurs

Dans `styles.css`, modifiez les variables CSS en haut :

```css
:root {
  --bg: #0a0a0a;        /* fond */
  --fg: #f5f5f0;        /* texte */
  --accent: #ff4d1a;    /* orange — couleur signature */
  --accent-2: #d4ff00;  /* vert lime — accent secondaire */
}
```

## Déployer (gratuit)

### Option 1 — Netlify (le plus simple)
1. Allez sur [netlify.com](https://netlify.com)
2. Glissez-déposez le dossier `v2/` dans la zone "Drag & drop"
3. Votre site est en ligne en 30 secondes

### Option 2 — GitHub Pages
```bash
cd v2/
git init
git add .
git commit -m "Portfolio v1"
# créer un repo sur github.com, puis :
git remote add origin https://github.com/votrenom/portfolio.git
git push -u origin main
# Settings → Pages → branche main → /root
```

### Option 3 — Vercel
1. [vercel.com](https://vercel.com), connectez votre GitHub
2. Importez le repo, déployez. Zéro config.

## Tester en local

Ouvrez simplement `index.html` dans votre navigateur. Pour un serveur local (recommandé pour tester le formulaire) :

```bash
# Python
python3 -m http.server 8000

# Node
npx serve

# PHP
php -S localhost:8000
```

Puis ouvrez `http://localhost:8000`.

## Fonctionnalités

- ✦ Curseur custom (desktop)
- ✦ Loader d'entrée
- ✦ Animations au scroll (IntersectionObserver)
- ✦ Galerie filtrable + lightbox clavier (← → Esc)
- ✦ Modal vidéo plein écran avec embed YouTube/Vimeo
- ✦ Marquee défilant
- ✦ Timeline animée (CV)
- ✦ Barres de compétences animées au scroll
- ✦ Responsive mobile
- ✦ Accessibilité : `prefers-reduced-motion` respecté

## Compatibilité

Tous navigateurs modernes (Chrome, Firefox, Safari, Edge — versions des 2 dernières années).
