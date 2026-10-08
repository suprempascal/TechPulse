'use strict';

const db = require('../models/db');
const User = require('../models/User');
const Article = require('../models/Article');
const Comment = require('../models/Comment');
const Like = require('../models/Like');

const ARTICLES = [
  {
    title: 'iPhone 17 Pro : l’année de la maturité',
    category: 'Smartphone',
    excerpt: 'Un chat-caméra décalé, un aluminium renforcé et enfin une autonomie qui tient la journée.',
    image: 'https://images.unsplash.com/photo-1592899677977-9c10ca588bbd?w=1200&q=70',
    content: `La iPhone 17 Pro arrive avec un changement de design assumé : le module photo passe sur le côté gauche et libère de la place pour un écran toujours allumé plus généreux.

Le châssis en aluminium anodisé résiste nettement mieux aux chutes que l’acier poli de la génération précédente, tout en allégeant l’appareil de près de 20 g.

Sur le plan photographique, le capteur principal de 48 Mpx conserve sa place mais le téléobjectif passe enfin à 5× natif, ce qui se sent immédiatement en conditions lumineuses.

Point faible : le prix de départ, inchangé malgré l’inflation, et un chargeur toujours vendu séparément.`,
  },
  {
    title: 'MacBook Air M4 : le rapport qualité-prix imbattable',
    category: 'Laptop',
    excerpt: 'Silencieux, léger, et assez puissant pour du développement quotidien sans jamais souffler.',
    image: 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=1200&q=70',
    content: `Le MacBook Air M4 conserve l’élégance de sa prédécesseur tout en gagnant 15 % de performances CPU et un effet PLM qui double les performances en rafale.

Sans ventilateur, l’appareil reste parfaitement silencieux, même sous charge soutenue lors d’un build Webpack complet.

L’autonomie réelle tourne autour de 13 h d’usage mixte, soit largement une journée de travail sans chargeur.

À moins de travailler sur du 3D ou du montage vidéo 4K continu, c’est aujourd’hui l’ordinateur portable le plus équilibré du marché.`,
  },
  {
    title: 'Sony WH-1000XM6 : le silence au sommet',
    category: 'Audio',
    excerpt: 'La réduction de bruit active reste la référence, avec un micro téléphonique enfin correct.',
    image: 'https://images.unsplash.com/photo-1618366712010-f4ae9c647dcb?w=1200&q=70',
    content: `Sony peaufine une recette qui fonctionne : les XM6 gardent le confort des XM5 tout en améliorant l’isolation dans les graves.

Le nouveau processeur gère mieux les voix aiguës, ce qui réduit nettement le sifflement lors des appels en environnement bruyant.

Côté son, la signature reste neutre avec une légère accentuation des basses, parfaitement corrigeable dans l’application.

Autonomie annoncée à 30 h, mesurée à 27 h avec l’ANC active : encore une fois, les promesses sont tenues.`,
  },
  {
    title: 'Keychron Q1 Max : le clavier mécanique qui décoiffe',
    category: 'Périphérique',
    excerpt: 'Gasket mount, triple connexion et finition aluminium : le rapport qualité-prix est déraisonnable.',
    image: 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=1200&q=70',
    content: `Le Q1 Max reprend la base 75 % gasket mount de la série Q et l’équipe en Bluetooth 5.2 + 2.4 GHz filaire.

La qualité de fabrication est irréprochable : coque en aluminium usinée, keycaps PBT double shot, et un son de frappe profond dès la sortie de boîte.

La latence en mode filaire mesurée sous les 3 ms, ce qui le rend utilisable en jeu compétitif sans compromis.

Seul regret : les stabilisateurs gagneraient à être lubrifiés en usine, une opération de 10 minutes pour les puristes.`,
  },
  {
    title: 'RTX 5070 : la carte graphique qui divise',
    category: 'Composant',
    excerpt: 'Performances 4K convaincantes mais un prix et une consommation qui laissent perplexe.',
    image: 'https://images.unsplash.com/photo-1587202372775-e229f172b9d7?w=1200&q=70',
    content: `La RTX 5070 vise la 4K à 60 fps avec l’ensemble des technologies de rendu du moment, et y arrive dans la majorité des titres récents.

Le DLSS 4 reste l’argument majeur : la génération de frames comble efficacement les manques, au prix d’une latence légèrement supérieure.

Consommation relevée à 265 W en pic, ce qui impose une alimentation de 750 W minimum pour un système serein.

Réservée aux joueurs déjà équipés d’un écran 4K, elle a moins de sens en 1440p où sa devancière reste pertinente.`,
  },
  {
    title: 'Galaxy Watch 8 : le retour de la rondeur',
    category: 'Wearable',
    excerpt: 'Un design circulaire élégant, des capteurs santé précis, mais une batterie en retrait.',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=1200&q=70',
    content: `Samsung revient au boîtier rond après deux générations carrées, et c’est un vrai plaisir visuel comme ergonomique.

Le capteur bio-électrique ajoute la mesure d’impédance corporelle, avec des résultats étonnamment proches d’une balance connectée.

Wear OS 6 apporte des animations fluides et un mode Always-On Display enfin lisible en extérieur.

La batterie plafonne à 36 h réelles avec l’AOD activé : il faudra recharger tous les jours, ce qui reste son talon d’Achille.`,
  },
  {
    title: 'LG 32GS95UE : l’OLED 4K 240 Hz ultime ?',
    category: 'Écran',
    excerpt: 'Un moniteur qui bascule entre 4K 240 Hz et 1080p 480 Hz, sans aucune concession.',
    image: 'https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=1200&q=70',
    content: `L’astuce du dual-mode permet de passer de 4K 240 Hz à 1080p 480 Hz en une touche : idéal pour alterner FPS compétitifs et jeux solo.

Le panneau MLA+ réduit nettement le voile gris typique des OLED, avec un contraste quasi infini en usage sombre.

La dalle mate diffuse les reflets sans sacrifier la vivacité des couleurs, un choix rare et bienvenu.

Le prix reste prohibitif pour la majorité des joueurs, mais technologiquement, c’est l’un des meilleurs moniteurs du marché.`,
  },
  {
    title: 'DJI Mini 4 Pro : 249 g de liberté',
    category: 'Drone',
    excerpt: 'Évite les obstacles dans toutes les directions et tient 34 min de vol, sans dépasser le seuil réglementaire.',
    image: 'https://images.unsplash.com/photo-1473968512647-3e447244af8f?w=1200&q=70',
    content: `Le Mini 4 Pro reste sous les 249 g, une limite qui allège considérablement les contraintes de déclaration en Europe.

Le système d’évitement d’obstacles omnidirectionnel fonctionne réellement en forêt dense, une première sur cette gamme.

L’autonomie annoncée à 34 min se tient à 28-30 min en conditions ventées, avec une marge de sécurité correcte.

Le mode Spotlight et le suivi actif sont désormais au niveau des modèles Pro, ce qui en fait l’outil idéal pour les créateurs solo.`,
  },
];

function seed() {
  const existing = User.count();
  if (existing > 0) {
    console.log(`Base déjà initialisée (${existing} utilisateur(s)) — seed ignoré.`);
    return;
  }

  const admin = User.create({
    username: 'admin',
    email: 'admin@techpulse.dev',
    password: 'admin123',
    isAdmin: true,
  });
  const demo = User.create({
    username: 'demo',
    email: 'demo@techpulse.dev',
    password: 'demo123',
    isAdmin: false,
  });
  const lea = User.create({
    username: 'lea',
    email: 'lea@techpulse.dev',
    password: 'lea12345',
    isAdmin: false,
  });
  const sam = User.create({
    username: 'sam',
    email: 'sam@techpulse.dev',
    password: 'sam12345',
    isAdmin: false,
  });

  const authors = [admin, demo, lea, sam];
  const articles = ARTICLES.map((a, i) =>
    Article.create({
      title: a.title,
      excerpt: a.excerpt,
      content: a.content,
      imageUrl: a.image,
      category: a.category,
      authorId: authors[i % authors.length].id,
    })
  );

  const COMMENTS = [
    ['Lea', "Testé deux semaines, l'autonomie annoncée est franchement réaliste. De bonnes surprises."],
    ['Sam', "Prix un peu élevé au lancement, mais ça se stabilise toujours après 3 mois."],
    ['demo', "Je partage l'avis général : qualité de fabrication au-dessus de la moyenne."],
    ['admin', "On refera un test longue durée dans six mois pour voir la fiabilité dans le temps."],
    ['Lea', "Attention aux accessoires vendus séparément, ça pèse vite sur la facture."],
    ['Sam', "Comparé à la génération précédente, le bond est réel côté performances."],
    ['demo', "Le support logiciel fait toute la différence sur la durée, et là c'est bon point."],
    ['Lea', "Je recommande sans hésiter, meilleur rapport qualité-prix de l'année."],
    ['Sam', "Un défaut : la notice reste vague sur certains réglages avancés."],
    ['admin', "N'hésitez pas à poster vos mesures personnelles, ça aide toujours les autres."],
    ['demo', "Design discret, rien à redire. Parfait pour un usage quotidien."],
    ['Lea', "J'ai renchéris sur ce point dans mon propre avis, mais je suis d'accord."],
  ];

  let ci = 0;
  articles.forEach((article, idx) => {
    const nb = 3 + (idx % 3);
    for (let k = 0; k < nb; k++) {
      const [name, content] = COMMENTS[ci++ % COMMENTS.length];
      const user = authors.find((u) => u.username === name.toLowerCase()) || demo;
      Comment.create({ articleId: article.id, userId: user.id, content });
    }
    // likes : dégressif selon l'index pour un classement varié
    const likers = authors.filter((u) => u.id !== article.author_id);
    const extra = 6 - idx;
    likers.forEach((u, k) => {
      if (k < Math.max(1, Math.min(likers.length, extra % (likers.length + 1)))) {
        Like.toggle(u.id, article.id);
      }
    });
    // l'auteur aime souvent son propre article
    if (idx % 2 === 0) Like.toggle(article.author_id, article.id);
  });

  console.log(`Seed terminé : ${User.count()} utilisateurs, ${Article.count()} articles.`);
  console.log('Comptes : admin/admin123 (admin), demo/demo123, lea/lea12345, sam/sam12345');
}

if (require.main === module) {
  db.connect();
  seed();
  db.close();
}

module.exports = { seed };
