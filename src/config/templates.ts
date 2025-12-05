/**
 * Template Engine Configuration
 * Defines styles for birthday card templates
 */

export interface TemplateConfig {
    id: string
    name: string
    description: string
    fontFamily: string
    fontClass: string
    gradient: string
    previewGradient: string
    backgroundPattern: 'confetti' | 'gold-cream' | 'balloons' | 'none'
    accentColor: string
    textColor: string
    overlayOpacity: number
}

export const TEMPLATES: Record<string, TemplateConfig> = {
    'birthday-blast': {
        id: 'birthday-blast',
        name: 'Birthday Blast',
        description: 'Vibrant and explosive birthday celebration',
        fontFamily: "'Fredoka One', cursive",
        fontClass: 'font-fredoka',
        gradient: 'linear-gradient(135deg, #ec4899 0%, #a855f7 50%, #3b82f6 100%)',
        previewGradient: 'bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500',
        backgroundPattern: 'confetti',
        accentColor: '#f59e0b',
        textColor: '#ffffff',
        overlayOpacity: 0.1,
    },
    'elegant-wishes': {
        id: 'elegant-wishes',
        name: 'Elegant Wishes',
        description: 'Sophisticated and classy birthday greeting',
        fontFamily: "'Playfair Display', serif",
        fontClass: 'font-playfair',
        gradient: 'linear-gradient(135deg, #d4af37 0%, #f5e6c8 50%, #d4af37 100%)',
        previewGradient: 'bg-gradient-to-r from-amber-400 via-amber-100 to-amber-400',
        backgroundPattern: 'gold-cream',
        accentColor: '#92400e',
        textColor: '#1f2937',
        overlayOpacity: 0.05,
    },
    'fun-party': {
        id: 'fun-party',
        name: 'Fun Party',
        description: 'Playful and colorful party theme',
        fontFamily: "'Chewy', cursive",
        fontClass: 'font-chewy',
        gradient: 'linear-gradient(135deg, #f97316 0%, #eab308 50%, #22c55e 100%)',
        previewGradient: 'bg-gradient-to-r from-orange-500 via-yellow-500 to-green-500',
        backgroundPattern: 'balloons',
        accentColor: '#ef4444',
        textColor: '#ffffff',
        overlayOpacity: 0.15,
    },
}

export const DEFAULT_TEMPLATE = 'birthday-blast'

/**
 * Get template by ID with fallback to default
 */
export function getTemplate(id: string): TemplateConfig {
    return TEMPLATES[id] || TEMPLATES[DEFAULT_TEMPLATE]
}

/**
 * Get all templates as an array for rendering
 */
export function getAllTemplates(): TemplateConfig[] {
    return Object.values(TEMPLATES)
}

/**
 * Default sticker emojis organized by category
 */
export const STICKER_CATEGORIES = {
    celebration: ['🎂', '🎉', '🎊', '🎈', '🎁', '🥳', '🎆', '🎇'],
    love: ['❤️', '💕', '💖', '💝', '💗', '🥰', '😍', '💋'],
    decorations: ['⭐', '✨', '🌟', '💫', '🌈', '🦋', '🌸', '🌺'],
    sweets: ['🍰', '🧁', '🍭', '🍬', '🍫', '🍪', '🎂', '🍩'],
} as const

export type StickerCategory = keyof typeof STICKER_CATEGORIES
