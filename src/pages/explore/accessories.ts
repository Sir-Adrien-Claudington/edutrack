// ---------------------------------------------------------------------------
// EduTrack — Learning Accessories catalogue
// ---------------------------------------------------------------------------
// "Learning accessories" are explorative apps and learning games that sit
// alongside the core academic tools. The first set is StarScape — a universe
// explorer and tiered space-learning games — embedded from its public site.
// All accessories are public, auth-free, and carry no student data.
// ---------------------------------------------------------------------------

export const STARSCAPE_BASE = 'https://starscape-desktop.netlify.app'

export type AccessoryCategory = 'Explorative Apps' | 'Learning Games'
export type AccessoryLevel = 'Beginner' | 'Intermediate' | 'Knowledgeable'

export interface Accessory {
  slug: string
  title: string
  blurb: string
  category: AccessoryCategory
  level?: AccessoryLevel
  emoji: string
  /** path on the StarScape site, including the ?embed=1 chrome-less flag */
  path: string
  /** subject tags shown on the card */
  tags: string[]
}

export const ACCESSORIES: Accessory[] = [
  // --- Explorative apps -------------------------------------------------------
  {
    slug: 'explorer',
    title: 'Solar System Explorer',
    blurb:
      'Fly through a 3D universe — spin the planets, zoom from Earth out to the Kuiper Belt, nearby stars and the Milky Way’s black hole.',
    category: 'Explorative Apps',
    emoji: '🪐',
    path: '/explorer?embed=1',
    tags: ['Science', '3D', 'Free explore'],
  },
  {
    slug: 'dashboard',
    title: 'Celestial Dashboard',
    blurb:
      'See where the planets and Moon are right now — altitude, rise and set times — calculated live for any location on Earth.',
    category: 'Explorative Apps',
    emoji: '📡',
    path: '/dashboard?embed=1',
    tags: ['Science', 'Live data'],
  },
  {
    slug: 'journey',
    title: 'The Grand Tour',
    blurb:
      'A scroll-driven journey past all eight planets with key facts, sizes and scale comparisons.',
    category: 'Explorative Apps',
    emoji: '🌍',
    path: '/journey?embed=1',
    tags: ['Science', 'Reading'],
  },

  // --- Learning games (tiered) ------------------------------------------------
  {
    slug: 'games-beginner',
    title: 'Space Games — Beginner',
    blurb:
      'First steps into space: name the planets, order them from the Sun, and compare their sizes.',
    category: 'Learning Games',
    level: 'Beginner',
    emoji: '🚀',
    path: '/games?embed=1&level=beginner',
    tags: ['Quiz', 'Ordering', 'Level 1'],
  },
  {
    slug: 'games-intermediate',
    title: 'Space Games — Intermediate',
    blurb: 'Use clues to identify mystery planets, match the stats, and tell fact from fiction.',
    category: 'Learning Games',
    level: 'Intermediate',
    emoji: '🛰️',
    path: '/games?embed=1&level=intermediate',
    tags: ['Quiz', 'Reasoning', 'Level 2'],
  },
  {
    slug: 'games-knowledgeable',
    title: 'Space Games — Knowledgeable',
    blurb:
      'Go deep: stars and black holes, classify cosmic objects, and order the true scale of the universe.',
    category: 'Learning Games',
    level: 'Knowledgeable',
    emoji: '🌌',
    path: '/games?embed=1&level=knowledgeable',
    tags: ['Quiz', 'Ordering', 'Level 3'],
  },
]

export function findAccessory(slug: string | undefined): Accessory | undefined {
  return ACCESSORIES.find((a) => a.slug === slug)
}
