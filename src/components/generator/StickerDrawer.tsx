'use client'

import React, { useState } from 'react'
import { useDraggable } from '@dnd-kit/core'
import { CSS } from '@dnd-kit/utilities'
import { motion, AnimatePresence } from 'framer-motion'
import { STICKER_CATEGORIES, type StickerCategory } from '@/config/templates'
import {
    Smile,
    Heart,
    Sparkles,
    Cake,
    ChevronLeft,
    ChevronRight,
    Grip
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'

// Draggable Sticker Item Component
function DraggableSticker({ emoji, id }: { emoji: string; id: string }) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id,
        data: { emoji },
    })

    const style = {
        transform: CSS.Transform.toString(transform),
        opacity: isDragging ? 0.5 : 1,
    }

    return (
        <button
            ref={setNodeRef}
            {...listeners}
            {...attributes}
            className={`
        w-12 h-12 flex items-center justify-center text-2xl rounded-xl
        bg-white/80 hover:bg-white shadow-md hover:shadow-lg
        transition-all duration-200 cursor-grab active:cursor-grabbing
        hover:scale-110 border border-gray-100
        ${isDragging ? 'z-50 ring-2 ring-purple-400' : ''}
      `}
            style={style}
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

interface StickerDrawerProps {
    isOpen?: boolean
    onToggle?: () => void
}

export function StickerDrawer({
    isOpen = true,
    onToggle
}: StickerDrawerProps) {
    const [activeCategory, setActiveCategory] = useState<StickerCategory>('celebration')
    const [isCollapsed, setIsCollapsed] = useState(!isOpen)

    const categories = Object.keys(STICKER_CATEGORIES) as StickerCategory[]

    const handleToggle = () => {
        setIsCollapsed(!isCollapsed)
        onToggle?.()
    }

    return (
        <div className="relative h-full">
            {/* Toggle Button */}
            <button
                onClick={handleToggle}
                className="absolute -left-3 top-1/2 -translate-y-1/2 z-10
          w-6 h-16 bg-gradient-to-r from-purple-500 to-pink-500
          rounded-l-lg shadow-lg text-white flex items-center justify-center
          hover:from-purple-600 hover:to-pink-600 transition-colors"
            >
                {isCollapsed ? (
                    <ChevronLeft className="h-4 w-4" />
                ) : (
                    <ChevronRight className="h-4 w-4" />
                )}
            </button>

            {/* Drawer Content */}
            <AnimatePresence>
                {!isCollapsed && (
                    <motion.div
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 'auto', opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        transition={{ duration: 0.3, ease: 'easeInOut' }}
                        className="h-full overflow-hidden"
                    >
                        <div className="w-64 h-full bg-white/95 backdrop-blur-sm rounded-2xl shadow-xl border border-gray-100 p-4 flex flex-col">
                            {/* Header */}
                            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                                <div className="p-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg text-white">
                                    <Grip className="h-4 w-4" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">Stickers</h3>
                                    <p className="text-xs text-gray-500">Drag onto card</p>
                                </div>
                            </div>

                            {/* Category Tabs */}
                            <div className="flex flex-wrap gap-1 mb-4">
                                {categories.map((category) => (
                                    <Button
                                        key={category}
                                        variant={activeCategory === category ? 'default' : 'ghost'}
                                        size="sm"
                                        onClick={() => setActiveCategory(category)}
                                        className={`
                      flex-1 min-w-[70px] text-xs p-2
                      ${activeCategory === category
                                                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white'
                                                : 'text-gray-600 hover:text-gray-900'
                                            }
                    `}
                                    >
                                        <span className="flex items-center gap-1">
                                            {CATEGORY_ICONS[category]}
                                            <span className="hidden sm:inline">{CATEGORY_LABELS[category]}</span>
                                        </span>
                                    </Button>
                                ))}
                            </div>

                            {/* Sticker Grid */}
                            <ScrollArea className="flex-1">
                                <motion.div
                                    key={activeCategory}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.2 }}
                                    className="grid grid-cols-4 gap-2 pb-4"
                                >
                                    {STICKER_CATEGORIES[activeCategory].map((emoji, index) => (
                                        <DraggableSticker
                                            key={`${activeCategory}-${emoji}-${index}`}
                                            id={`sticker-${activeCategory}-${index}`}
                                            emoji={emoji}
                                        />
                                    ))}
                                </motion.div>
                            </ScrollArea>

                            {/* Help Text */}
                            <div className="mt-3 pt-3 border-t border-gray-100">
                                <p className="text-xs text-gray-400 text-center">
                                    💡 Tip: Click a sticker on the card to remove it
                                </p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Collapsed State - Mini Indicators */}
            <AnimatePresence>
                {isCollapsed && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="flex flex-col gap-2 p-2"
                    >
                        {['🎂', '❤️', '⭐', '🧁'].map((emoji, index) => (
                            <div
                                key={index}
                                className="w-8 h-8 flex items-center justify-center text-lg
                  bg-white/80 rounded-lg shadow-sm border border-gray-100"
                            >
                                {emoji}
                            </div>
                        ))}
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

export default StickerDrawer
