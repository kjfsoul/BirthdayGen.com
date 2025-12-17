'use client'

import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { STICKER_CATEGORIES, type StickerCategory } from '@/config/templates'
import {
    Smile,
    Heart,
    Sparkles,
    Cake,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

// Draggable Sticker Item Component
function DraggableSticker({ emoji, id }: { emoji: string; id: string }) {
    const { attributes, listeners, setNodeRef, isDragging } = useDraggable({
        id,
        data: {
            type: 'sticker',
            src: emoji
        },
    })

    return (
        <button
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`
        w-16 h-16 flex items-center justify-center text-4xl rounded-xl
        bg-white hover:bg-gray-50 shadow-sm border border-gray-100
        transition-all duration-200 cursor-grab active:cursor-grabbing
        ${isDragging ? 'opacity-30' : 'hover:scale-105 hover:shadow-md'}
      `}
        >
            {emoji}
        </button>
    )
}

// Category icon mapping
const CATEGORY_ICONS: Record<StickerCategory, React.ReactNode> = {
    celebration: <Cake className="h-4 w-4" />,
    love: <Heart className="h-4 w-4" />,
    decorations: <Sparkles className="h-4 w-4" />,
    sweets: <Smile className="h-4 w-4" />,
}

const CATEGORY_LABELS: Record<StickerCategory, string> = {
    celebration: 'Celebration',
    love: 'Love',
    decorations: 'Decorations',
    sweets: 'Sweets',
}

export function StickerDrawer() {
    const [activeCategory, setActiveCategory] = useState<StickerCategory>('celebration')
    const categories = Object.keys(STICKER_CATEGORIES) as StickerCategory[]

    return (
        <div className="h-full flex flex-col">
            {/* Category Tabs */}
            <div className="flex flex-wrap gap-2 mb-4">
                {categories.map((category) => (
                    <Button
                        key={category}
                        variant={activeCategory === category ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => setActiveCategory(category)}
                        className={`
                      flex-grow text-xs px-3 py-2 h-auto
                      ${activeCategory === category
                                ? 'bg-purple-600 hover:bg-purple-700 text-white border-transparent'
                                : 'text-gray-600 border-gray-200 hover:bg-gray-50'
                            }
                    `}
                    >
                        <span className="flex items-center gap-1.5">
                            {CATEGORY_ICONS[category]}
                            <span>{CATEGORY_LABELS[category]}</span>
                        </span>
                    </Button>
                ))}
            </div>

            {/* Sticker Grid */}
            <ScrollArea className="flex-1 pr-4">
                <div className="grid grid-cols-4 gap-3 pb-4">
                    {STICKER_CATEGORIES[activeCategory].map((emoji, index) => (
                        <DraggableSticker
                            key={`${activeCategory}-${emoji}-${index}`}
                            id={`sticker-${activeCategory}-${index}`}
                            emoji={emoji}
                        />
                    ))}
                </div>
            </ScrollArea>

            {/* Help Text */}
            <div className="mt-2 pt-3 border-t border-gray-100">
                <p className="text-xs text-gray-400 text-center">
                    💡 Drag stickers to your card
                </p>
            </div>
        </div>
    )
}

export default StickerDrawer
