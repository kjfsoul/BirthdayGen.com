'use client'

import React, { useState, useRef, useCallback, useMemo } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Tilt } from 'react-tilt'
import { useDroppable, useDraggable } from '@dnd-kit/core'
import { Snowfall } from '@/components/generator/Snowfall'
import { getTemplate, type TemplateConfig } from '@/config/templates'
import {
    PartyPopper,
    Cake,
    Gift,
    RotateCcw,
    Sparkles,
    X
} from 'lucide-react'

export interface Sticker {
    id: string
    x: number
    y: number
    src: string
    scale?: number
}

// Helper component for draggable stickers
interface DraggableStickerProps {
    sticker: Sticker
    isSelected: boolean
    onClick: (id: string, e: React.MouseEvent) => void
    onRemove: (id: string) => void
}

function DraggableSticker({ sticker, isSelected, onClick, onRemove }: DraggableStickerProps) {
    const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
        id: `sticker-${sticker.id}`,
        data: { stickerId: sticker.id }
    })

    const style = {
        left: `${sticker.x}%`,
        top: `${sticker.y}%`,
        transform: transform
            ? `translate(-50%, -50%) translate3d(${transform.x}px, ${transform.y}px, 0)`
            : `translate(-50%, -50%)`,
        cursor: isDragging ? 'grabbing' : 'grab',
        zIndex: isSelected ? 30 : 25, // Delete button will be z-31
    }

    return (
        <div
            ref={setNodeRef}
            className="absolute pointer-events-auto group"
            style={style}
            {...attributes}
            {...listeners}
        >
            {/* Sticker */}
            <div
                className={`transition-transform ${isSelected ? 'scale-125' : 'hover:scale-110'
                    }`}
                style={{
                    fontSize: '2rem',
                    transform: `scale(${sticker.scale || 1})`,
                }}
                onClick={(e) => onClick(sticker.id, e)}
            >
                {sticker.src}
            </div>

            {/* Delete Button - Shown when selected with higher z-index */}
            {isSelected && (
                <button
                    onClick={(e) => {
                        e.stopPropagation()
                        onRemove(sticker.id)
                    }}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:bg-red-600 transition-colors z-[31]"
                    title="Remove sticker"
                >
                    <X className="h-3 w-3" />
                </button>
            )}
        </div>
    )
}

interface CardStageProps {

    templateId: string
    recipientName: string
    senderName: string
    customMessage: string
    selectedImage: string | null
    selectedColors: {
        primary: string
        secondary: string
        accent: string
    }
    stickers: Sticker[]
    onStickersChange: (stickers: Sticker[]) => void
    onMessageChange: (message: string) => void
    isDragging?: boolean
}

export function CardStage({
    templateId,
    recipientName,
    senderName,
    customMessage,
    selectedImage,
    selectedColors,
    stickers,
    onStickersChange,
    onMessageChange,
    isDragging = false,
}: CardStageProps) {
    const [isFlipped, setIsFlipped] = useState(false)
    const [isPreviewMode, setIsPreviewMode] = useState(false)
    const [selectedStickerId, setSelectedStickerId] = useState<string | null>(null)
    const cardRef = useRef<HTMLDivElement>(null)

    const template = useMemo(() => getTemplate(templateId), [templateId])

    // Set up droppable area for stickers
    const { setNodeRef, isOver } = useDroppable({
        id: 'card-stage-drop-zone',
    })

    // Handle sticker selection
    const handleStickerClick = useCallback((stickerId: string, e: React.MouseEvent) => {
        e.stopPropagation()
        setSelectedStickerId(stickerId)
    }, [])

    // Handle sticker removal
    const handleStickerRemove = useCallback((stickerId: string) => {
        onStickersChange(stickers.filter(s => s.id !== stickerId))
        setSelectedStickerId(null)
    }, [stickers, onStickersChange])

    // Deselect sticker when clicking elsewhere
    const handleCardClick = useCallback(() => {
        setSelectedStickerId(null)
    }, [])

    // Calculate background based on template and user selections
    const cardBackground = useMemo(() => {
        if (selectedImage) {
            return `url(${selectedImage}) center/cover no-repeat`
        }
        return template.gradient
    }, [selectedImage, template.gradient])

    // Get pattern class based on template
    const patternClass = useMemo(() => {
        if (selectedImage) return ''
        switch (template.backgroundPattern) {
            case 'confetti': return 'bg-confetti'
            case 'gold-cream': return 'bg-gold-cream'
            case 'balloons': return 'bg-balloons'
            default: return ''
        }
    }, [selectedImage, template.backgroundPattern])

    // Tilt options - controlled by preview mode, dragging state, and flip state
    const tiltOptions = {
        max: (isDragging || !isPreviewMode || isFlipped) ? 0 : 5, // 5deg max in preview front only
        scale: (isDragging || !isPreviewMode || isFlipped) ? 1 : 1.01, // Subtle scale in preview
        speed: 400,
        glare: !isDragging && isPreviewMode && !isFlipped, // Glare only in preview mode on front
        'max-glare': 0.15,
        perspective: 1000, // Perspective setting
    }


    return (
        <div className="perspective-1000 w-full">
            {/* 3D Card Container - Always in Preview Mode */}
            <Tilt options={tiltOptions} className="w-full">
                <div
                    ref={cardRef}
                    className="relative w-full preserve-3d"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <motion.div
                        className="relative w-full"
                        animate={{ rotateY: isFlipped ? 180 : 0 }}
                        transition={{ duration: 0.6, ease: 'easeInOut' }}
                        style={{ transformStyle: 'preserve-3d' }}
                    >
                        {/* Front of Card */}
                        <div
                            id="card-stage"
                            ref={setNodeRef}
                            onClick={handleCardClick}
                            className={`
                relative aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden
                backface-hidden ${template.fontClass}
                ${patternClass}
                ${isOver ? 'ring-4 ring-purple-400 ring-opacity-50' : ''}
              `}
                            style={{
                                background: cardBackground,
                                backfaceVisibility: 'hidden',
                            }}
                        >
                            {/* Overlay for readability with images */}
                            {selectedImage && (
                                <div
                                    className="absolute inset-0"
                                    style={{ backgroundColor: `rgba(0,0,0,${template.overlayOpacity + 0.3})` }}
                                />
                            )}

                            {/* Pattern overlay when no image */}
                            {!selectedImage && (
                                <div className={`absolute inset-0 ${patternClass} opacity-30`} />
                            )}

                            {/* Card Content */}
                            <div
                                className="absolute inset-0 p-8 flex flex-col justify-between z-10"
                                style={{ color: template.textColor }}
                            >
                                {/* Header with decorations */}
                                <div className="text-center">
                                    <div className="flex justify-center items-center space-x-2 mb-4">
                                        <PartyPopper
                                            className="h-8 w-8"
                                            style={{ color: selectedImage ? '#fff' : template.accentColor }}
                                        />
                                        <Cake
                                            className="h-10 w-10"
                                            style={{ color: selectedImage ? '#fff' : template.accentColor }}
                                        />
                                        <Gift
                                            className="h-8 w-8"
                                            style={{ color: selectedImage ? '#fff' : template.accentColor }}
                                        />
                                    </div>
                                    <h2
                                        className="text-4xl font-bold mb-2 drop-shadow-lg"
                                        style={{ fontFamily: template.fontFamily }}
                                    >
                                        Happy Birthday
                                    </h2>
                                    {recipientName && (
                                        <h3
                                            className="text-3xl font-semibold drop-shadow-lg"
                                            style={{
                                                fontFamily: template.fontFamily,
                                                color: selectedImage ? '#fff' : template.accentColor
                                            }}
                                        >
                                            {recipientName}!
                                        </h3>
                                    )}
                                </div>

                                {/* Sparkles decoration */}
                                <div className="text-center px-4 flex items-center justify-center gap-2">
                                    <Sparkles className="h-5 w-5 opacity-75" />
                                    <p className="text-lg leading-relaxed drop-shadow-md font-medium line-clamp-4 italic">
                                        {customMessage.slice(0, 100)}{customMessage.length > 100 ? '...' : ''}
                                    </p>
                                    <Sparkles className="h-5 w-5 opacity-75" />
                                </div>

                                {/* Footer */}
                                <div className="text-center">
                                    {senderName && (
                                        <p
                                            className="text-lg font-medium drop-shadow-lg"
                                            style={{ color: selectedImage ? '#fff' : template.accentColor }}
                                        >
                                            With love, {senderName}
                                        </p>
                                    )}
                                </div>
                            </div>

                            {/* Stickers Layer */}
                            <div className="absolute inset-0 z-20 pointer-events-none">
                                {stickers.map((sticker) => (
                                    <DraggableSticker
                                        key={sticker.id}
                                        sticker={sticker}
                                        isSelected={selectedStickerId === sticker.id}
                                        onClick={handleStickerClick}
                                        onRemove={handleStickerRemove}
                                    />
                                ))}
                            </div>

                            {/* Drop indicator */}
                            <AnimatePresence>
                                {isOver && (
                                    <motion.div
                                        initial={{ opacity: 0 }}
                                        animate={{ opacity: 1 }}
                                        exit={{ opacity: 0 }}
                                        className="absolute inset-0 bg-purple-500/10 flex items-center justify-center z-30"
                                    >
                                        <span className="text-white text-lg font-medium drop-shadow-lg">
                                            Drop here!
                                        </span>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Back of Card */}
                        <div
                            className={`
                absolute inset-0 aspect-[3/4] rounded-2xl shadow-2xl overflow-hidden
                backface-hidden ${template.fontClass}
              `}
                            style={{
                                background: template.gradient,
                                transform: 'rotateY(180deg)',
                                backfaceVisibility: 'hidden',
                            }}
                        >
                            {/* Pattern overlay */}
                            <div className={`absolute inset-0 ${patternClass} opacity-20`} />

                            {/* Back Content - Message Editor */}
                            <div className="absolute inset-0 p-8 flex flex-col z-10">
                                <h3
                                    className="text-2xl font-bold mb-4 text-center drop-shadow-lg"
                                    style={{
                                        fontFamily: template.fontFamily,
                                        color: template.textColor
                                    }}
                                >
                                    ✨ Your Message ✨
                                </h3>

                                <div className="flex-1 flex flex-col gap-4">
                                    <textarea
                                        value={customMessage}
                                        onChange={(e) => onMessageChange(e.target.value)}
                                        placeholder="Write your heartfelt birthday message here..."
                                        disabled={isPreviewMode}
                                        className={`flex-1 w-full p-4 rounded-xl bg-white/90 backdrop-blur-sm text-gray-800
                      placeholder-gray-500 resize-none border-2 border-white/50
                      focus:border-white focus:ring-4 focus:ring-white/30 focus:outline-none
                      shadow-inner text-lg ${isPreviewMode ? 'opacity-75 cursor-not-allowed' : ''
                                            }`}
                                        style={{ fontFamily: "'Inter', sans-serif" }}
                                    />

                                    <div className="text-center">
                                        <p
                                            className="text-sm opacity-80 drop-shadow"
                                            style={{ color: template.textColor }}
                                        >
                                            {customMessage.length}/500 characters
                                        </p>
                                    </div>
                                </div>

                                <div className="mt-4 text-center">
                                    <p
                                        className="text-lg font-medium drop-shadow-lg"
                                        style={{ color: template.textColor }}
                                    >
                                        {senderName ? `From: ${senderName}` : 'Add your name in the sidebar'}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </motion.div>
                </div>
            </Tilt>
        </div>
    )
}

export default CardStage
