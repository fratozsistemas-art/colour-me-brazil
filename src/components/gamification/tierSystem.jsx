// Tier-based progression system with cosmetic rewards

export const TIER_DEFINITIONS = [
  {
    tier: 1,
    name: 'Explorer',
    minPoints: 0,
    maxPoints: 499,
    color: 'from-gray-400 to-gray-600',
    borderStyle: 'border-2 border-gray-400',
    icon: '🌱',
    rewards: {
      profileBorder: 'simple',
      badge: 'explorer_badge',
      title: 'Young Explorer'
    }
  },
  {
    tier: 2,
    name: 'Adventurer',
    minPoints: 500,
    maxPoints: 1499,
    color: 'from-green-400 to-green-600',
    borderStyle: 'border-3 border-green-500 shadow-lg',
    icon: '🌿',
    rewards: {
      profileBorder: 'bronze',
      badge: 'adventurer_badge',
      title: 'Brave Adventurer'
    }
  },
  {
    tier: 3,
    name: 'Scholar',
    minPoints: 1500,
    maxPoints: 3499,
    color: 'from-blue-400 to-blue-600',
    borderStyle: 'border-3 border-blue-500 shadow-xl',
    icon: '📚',
    rewards: {
      profileBorder: 'silver',
      badge: 'scholar_badge',
      title: 'Wise Scholar',
      avatarFrame: 'silver_frame'
    }
  },
  {
    tier: 4,
    name: 'Champion',
    minPoints: 3500,
    maxPoints: 6999,
    color: 'from-purple-400 to-purple-600',
    borderStyle: 'border-4 border-purple-500 shadow-2xl',
    icon: '⚡',
    rewards: {
      profileBorder: 'gold',
      badge: 'champion_badge',
      title: 'Cultural Champion',
      avatarFrame: 'gold_frame'
    }
  },
  {
    tier: 5,
    name: 'Master',
    minPoints: 7000,
    maxPoints: 11999,
    color: 'from-yellow-400 to-yellow-600',
    borderStyle: 'border-4 border-yellow-500 shadow-2xl animate-pulse',
    icon: '👑',
    rewards: {
      profileBorder: 'platinum',
      badge: 'master_badge',
      title: 'Grand Master',
      avatarFrame: 'platinum_frame',
      specialEffect: 'sparkle'
    }
  },
  {
    tier: 6,
    name: 'Legend',
    minPoints: 12000,
    maxPoints: 19999,
    color: 'from-pink-400 via-purple-500 to-indigo-600',
    borderStyle: 'border-4 border-pink-500 shadow-2xl animate-pulse',
    icon: '⭐',
    rewards: {
      profileBorder: 'diamond',
      badge: 'legend_badge',
      title: 'Living Legend',
      avatarFrame: 'diamond_frame',
      specialEffect: 'rainbow'
    }
  },
  {
    tier: 7,
    name: 'Mythic',
    minPoints: 20000,
    maxPoints: 34999,
    color: 'from-red-400 via-orange-500 to-yellow-500',
    borderStyle: 'border-4 border-orange-500 shadow-2xl animate-pulse',
    icon: '🔥',
    rewards: {
      profileBorder: 'mythic',
      badge: 'mythic_badge',
      title: 'Mythic Hero',
      avatarFrame: 'mythic_frame',
      specialEffect: 'fire'
    }
  },
  {
    tier: 8,
    name: 'Celestial',
    minPoints: 35000,
    maxPoints: 59999,
    color: 'from-cyan-400 via-blue-500 to-purple-600',
    borderStyle: 'border-4 border-cyan-400 shadow-2xl animate-pulse',
    icon: '✨',
    rewards: {
      profileBorder: 'celestial',
      badge: 'celestial_badge',
      title: 'Celestial Being',
      avatarFrame: 'celestial_frame',
      specialEffect: 'stars'
    }
  },
  {
    tier: 9,
    name: 'Divine',
    minPoints: 60000,
    maxPoints: 99999,
    color: 'from-yellow-300 via-yellow-400 to-yellow-500',
    borderStyle: 'border-4 border-yellow-300 shadow-2xl animate-pulse',
    icon: '☀️',
    rewards: {
      profileBorder: 'divine',
      badge: 'divine_badge',
      title: 'Divine Guardian',
      avatarFrame: 'divine_frame',
      specialEffect: 'aurora'
    }
  },
  {
    tier: 10,
    name: 'Transcendent',
    minPoints: 100000,
    maxPoints: Infinity,
    color: 'from-white via-purple-300 to-pink-400',
    borderStyle: 'border-4 border-white shadow-2xl animate-pulse',
    icon: '🌟',
    rewards: {
      profileBorder: 'transcendent',
      badge: 'transcendent_badge',
      title: 'Transcendent Master',
      avatarFrame: 'transcendent_frame',
      specialEffect: 'cosmic'
    }
  }
];

export const MASTERY_BADGES = [
  {
    id: 'folklore_master',
    name_en: 'Folklore Master',
    name_pt: 'Mestre do Folclore',
    description_en: 'Complete all folklore-themed books',
    description_pt: 'Complete todos os livros de folclore',
    icon: '🦜',
    requirement: 'Complete all books with "folklore" tags',
    requiredProgress: 10
  },
  {
    id: 'culture_master',
    name_en: 'Culture Master',
    name_pt: 'Mestre da Cultura',
    description_en: 'Complete all culture-themed books',
    description_pt: 'Complete todos os livros culturais',
    icon: '🎭',
    requirement: 'Complete all books with "culture" tags',
    requiredProgress: 10
  },
  {
    id: 'amazon_explorer',
    name_en: 'Amazon Explorer',
    name_pt: 'Explorador da Amazônia',
    description_en: 'Complete all Amazon collection books',
    description_pt: 'Complete toda a coleção Amazônica',
    icon: '🌿',
    requirement: 'Complete all Amazon collection books',
    requiredProgress: 6
  },
  {
    id: 'linguist',
    name_en: 'Linguist',
    name_pt: 'Linguista',
    description_en: 'Interact with 100+ cultural words',
    description_pt: 'Interaja com mais de 100 palavras culturais',
    icon: '🗣️',
    requirement: 'Click on 100 interactive words',
    requiredProgress: 100
  },
  {
    id: 'quiz_genius',
    name_en: 'Quiz Genius',
    name_pt: 'Gênio dos Quiz',
    description_en: 'Answer 50 quizzes correctly',
    description_pt: 'Responda 50 questionários corretamente',
    icon: '🧠',
    requirement: 'Get 50 quiz answers correct',
    requiredProgress: 50
  },
  {
    id: 'speed_reader',
    name_en: 'Speed Reader',
    name_pt: 'Leitor Veloz',
    description_en: 'Complete 20 books in under 30 days',
    description_pt: 'Complete 20 livros em menos de 30 dias',
    icon: '⚡',
    requirement: 'Complete 20 books within 30 days',
    requiredProgress: 20
  },
  {
    id: 'art_virtuoso',
    name_en: 'Art Virtuoso',
    name_pt: 'Virtuoso da Arte',
    description_en: 'Color 100 pages',
    description_pt: 'Pinte 100 páginas',
    icon: '🎨',
    requirement: 'Complete coloring 100 pages',
    requiredProgress: 100
  },
  {
    id: 'community_leader',
    name_en: 'Community Leader',
    name_pt: 'Líder Comunitário',
    description_en: 'Create 10 forum topics with 50+ replies total',
    description_pt: 'Crie 10 tópicos no fórum com 50+ respostas no total',
    icon: '👥',
    requirement: 'Create popular forum topics',
    requiredProgress: 10
  },
  {
    id: 'storyteller',
    name_en: 'Master Storyteller',
    name_pt: 'Mestre Contador',
    description_en: 'Contribute to 25 collaborative stories',
    description_pt: 'Contribua para 25 histórias colaborativas',
    icon: '📖',
    requirement: 'Contribute to collaborative stories',
    requiredProgress: 25
  },
  {
    id: 'curator',
    name_en: 'Path Curator',
    name_pt: 'Curador de Caminhos',
    description_en: 'Create 5 reading paths with 20+ followers',
    description_pt: 'Crie 5 caminhos de leitura com 20+ seguidores',
    icon: '🗺️',
    requirement: 'Create popular reading paths',
    requiredProgress: 5
  }
];

export function getTierFromPoints(points) {
  return TIER_DEFINITIONS.find(tier => 
    points >= tier.minPoints && points <= tier.maxPoints
  ) || TIER_DEFINITIONS[0];
}

export function getNextTier(currentPoints) {
  const currentTier = getTierFromPoints(currentPoints);
  const currentIndex = TIER_DEFINITIONS.findIndex(t => t.tier === currentTier.tier);
  return TIER_DEFINITIONS[currentIndex + 1] || null;
}

export function getTierProgress(points) {
  const tier = getTierFromPoints(points);
  const progress = points - tier.minPoints;
  const total = tier.maxPoints - tier.minPoints;
  return Math.min((progress / total) * 100, 100);
}