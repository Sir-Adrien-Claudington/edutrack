// ---------------------------------------------------------------------------
// EduTrack — Learning Accessories catalogue
// ---------------------------------------------------------------------------
// "Learning accessories" are explorative apps and learning games that sit
// alongside the core academic tools. They are grouped by subject. The first
// subjects are Space (StarScape) and Geology (GeoScape), embedded from their
// public site. All accessories are public, auth-free, and carry no student
// data.
// ---------------------------------------------------------------------------

export const STARSCAPE_BASE = 'https://starscape-desktop.netlify.app'

export type AccessorySubject = 'Space' | 'Geology'
export type AccessoryCategory = 'Explorative App' | 'Learning Game'
export type AccessoryLevel = 'Beginner' | 'Intermediate' | 'Knowledgeable'

export interface Accessory {
  slug: string
  title: string
  blurb: string
  subject: AccessorySubject
  category: AccessoryCategory
  level?: AccessoryLevel
  emoji: string
  /** path on the StarScape/GeoScape site, including the ?embed=1 chrome-less flag */
  path: string
  /** subject tags shown on the card */
  tags: string[]
}

export const SUBJECTS: Array<{ id: AccessorySubject; label: string; blurb: string }> = [
  {
    id: 'Space',
    label: 'Space Science',
    blurb: 'Explore the solar system, track the night sky, and play space games by level.',
  },
  {
    id: 'Geology',
    label: 'Geology',
    blurb: 'Descend through Earth’s layers and inspect minerals as interactive 3D crystals.',
  },
]

export const ACCESSORIES: Accessory[] = [
  // --- Space: explorative apps ------------------------------------------------
  {
    slug: 'explorer',
    title: 'Solar System Explorer',
    blurb:
      'Fly through a 3D universe — spin the planets, zoom from Earth out to the Kuiper Belt, nearby stars and the Milky Way’s black hole.',
    subject: 'Space',
    category: 'Explorative App',
    emoji: '🪐',
    path: '/explorer?embed=1',
    tags: ['Science', '3D', 'Free explore'],
  },
  {
    slug: 'dashboard',
    title: 'Celestial Dashboard',
    blurb:
      'See where the planets and Moon are right now — altitude, rise and set times — calculated live for any location on Earth.',
    subject: 'Space',
    category: 'Explorative App',
    emoji: '📡',
    path: '/dashboard?embed=1',
    tags: ['Science', 'Live data'],
  },
  {
    slug: 'journey',
    title: 'The Grand Tour',
    blurb:
      'A scroll-driven journey past all eight planets — now with interactive high-resolution 3D models you can rotate and zoom.',
    subject: 'Space',
    category: 'Explorative App',
    emoji: '🌍',
    path: '/journey?embed=1',
    tags: ['Science', '3D', 'Reading'],
  },
  {
    slug: 'sky',
    title: 'Sky Compass',
    blurb:
      'Point your phone at the sky to identify the stars, planets and constellations overhead — calculated live for your location and the current time.',
    subject: 'Space',
    category: 'Explorative App',
    emoji: '🧭',
    path: '/sky?embed=1',
    tags: ['Science', 'AR', 'Best on phone'],
  },
  // --- Space: learning games (tiered) -----------------------------------------
  {
    slug: 'games-beginner',
    title: 'Space Games — Beginner',
    blurb:
      'First steps into space: name the planets, order them from the Sun, and compare their sizes.',
    subject: 'Space',
    category: 'Learning Game',
    level: 'Beginner',
    emoji: '🚀',
    path: '/games?embed=1&level=beginner',
    tags: ['Quiz', 'Ordering', 'Level 1'],
  },
  {
    slug: 'games-intermediate',
    title: 'Space Games — Intermediate',
    blurb: 'Use clues to identify mystery planets, match the stats, and tell fact from fiction.',
    subject: 'Space',
    category: 'Learning Game',
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
    subject: 'Space',
    category: 'Learning Game',
    level: 'Knowledgeable',
    emoji: '🌌',
    path: '/games?embed=1&level=knowledgeable',
    tags: ['Quiz', 'Ordering', 'Level 3'],
  },
  // --- Geology: explorative apps ----------------------------------------------
  {
    slug: 'geo-strata',
    title: 'Strata Journey',
    blurb:
      'A scroll-driven descent through Earth’s crust, mantle and core, the rock cycle, and 4.6 billion years of geologic time.',
    subject: 'Geology',
    category: 'Explorative App',
    emoji: '⛰️',
    path: '/geology?embed=1',
    tags: ['Earth science', 'Scroll', 'Free explore'],
  },
  {
    slug: 'geo-minerals',
    title: 'Mineral Lab',
    blurb:
      'Inspect minerals as physically-rendered 3D crystals — rotate quartz, pyrite, garnet and more, with their real properties.',
    subject: 'Geology',
    category: 'Explorative App',
    emoji: '💎',
    path: '/minerals?embed=1',
    tags: ['Mineralogy', '3D', 'Interactive'],
  },
  // --- Geology: learning game -------------------------------------------------
  {
    slug: 'mine-game',
    title: 'Mine Game',
    blurb:
      'Click a real Australian mine site on the map, zoom into the tunnel, and tap mineral veins to discover the geology behind gold, copper, diamonds and more.',
    subject: 'Geology',
    category: 'Learning Game',
    emoji: '⛏️',
    path: '/mine-game?embed=1',
    tags: ['Geology', 'Game', 'Australia'],
  },
]

export function findAccessory(slug: string | undefined): Accessory | undefined {
  return ACCESSORIES.find((a) => a.slug === slug)
}
