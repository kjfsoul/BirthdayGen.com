'use client'

import { useState, useRef, useEffect, useMemo } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
    Heart,
    Star,
    Gift,
    Volume2,
    VolumeX,
    RotateCcw,
    Share2
} from "lucide-react"
import { useCanvas } from '@/hooks/use-canvas'
import { ParticleSystem } from '@/lib/particles'

interface AnimatedCardProps {
    frontImage?: string
    frontMessage?: string
    insideImage?: string
    insideMessage?: string
    recipientName?: string
    senderName?: string
    theme?: 'birthday' | 'holiday' | 'anniversary' | 'custom'
    includeGame?: boolean
}

export function AnimatedCard({
    frontImage = 'https://images.unsplash.com/photo-1464349095431-e9a21285b5f3?w=400',
    frontMessage = 'Happy Birthday!',
    insideImage = 'https://images.unsplash.com/photo-1530103862676-de8c9debad1d?w=400',
    insideMessage = 'Wishing you all the happiness in the world on your special day!',
    recipientName = 'Friend',
    senderName = 'Your Secret Admirer',
    theme = 'birthday',
    includeGame = true
}: AnimatedCardProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [showScratchOff, setShowScratchOff] = useState(false)
    const [scratchRevealed, setScratchRevealed] = useState(false)
    const [soundEnabled, setSoundEnabled] = useState(true)
    const scratchCanvasRef = useRef<HTMLCanvasElement>(null)

    // Particle System
    const particleSystem = useMemo(() => new ParticleSystem(50), [])

    const onDrawParticles = (ctx: CanvasRenderingContext2D, deltaTime: number) => {
        particleSystem.update(deltaTime)
        particleSystem.draw(ctx)
    }

    // const particleCanvasRef = useCanvas({
    //     animate: isOpen,
    //     onDraw: onDrawParticles,
    //     onResize: (w, h) => {
    //         // Optional: adjust particle system bounds if needed
    //     }
    // })
    const particleCanvasRef = useRef<HTMLCanvasElement>(null)

    // Emit particles when opened
    useEffect(() => {
        if (isOpen) {
            const interval = setInterval(() => {
                if (particleCanvasRef.current) {
                    const { width, height } = particleCanvasRef.current
                    particleSystem.emit(Math.random() * width, Math.random() * height)
                }
            }, 100)
            return () => clearInterval(interval)
        }
    }, [isOpen, particleSystem, particleCanvasRef])

    // Scratch-off canvas logic
    useEffect(() => {
        if (showScratchOff && scratchCanvasRef.current) {
            const canvas = scratchCanvasRef.current
            const ctx = canvas.getContext('2d')
            if (!ctx) return

            // Set canvas size
            canvas.width = 300
            canvas.height = 150

            // Draw scratch-off overlay
            ctx.fillStyle = '#C0C0C0'
            ctx.fillRect(0, 0, canvas.width, canvas.height)

            // Add texture
            ctx.fillStyle = '#A0A0A0'
            for (let i = 0; i < 100; i++) {
                ctx.fillRect(
                    Math.random() * canvas.width,
                    Math.random() * canvas.height,
                    2, 2
                )
            }

            // Add "Scratch Here" text
            ctx.fillStyle = '#666'
            ctx.font = 'bold 16px Arial'
            ctx.textAlign = 'center'
            ctx.fillText('🎁 Scratch to reveal your gift! 🎁', canvas.width / 2, canvas.height / 2)

            let isScratching = false

            const scratch = (e: MouseEvent | TouchEvent) => {
                if (!isScratching) return

                const rect = canvas.getBoundingClientRect()
                const x = ('touches' in e ? e.touches[0].clientX : e.clientX) - rect.left
                const y = ('touches' in e ? e.touches[0].clientY : e.clientY) - rect.top

                ctx.globalCompositeOperation = 'destination-out'
                ctx.beginPath()
                ctx.arc(x, y, 15, 0, 2 * Math.PI)
                ctx.fill()

                // Check if enough has been scratched
                // Debounce this check in a real app, or use a counter
                if (Math.random() > 0.9) { // Optimization: only check 10% of the time
                    const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height)
                    const pixels = imageData.data
                    let transparent = 0
                    for (let i = 3; i < pixels.length; i += 4) {
                        if (pixels[i] === 0) transparent++
                    }
                    if (transparent > pixels.length / 4 / 3) { // 30% scratched
                        setScratchRevealed(true)
                        setTimeout(() => setShowScratchOff(false), 1500)
                    }
                }
            }

            canvas.addEventListener('mousedown', () => isScratching = true)
            canvas.addEventListener('mouseup', () => isScratching = false)
            canvas.addEventListener('mousemove', scratch)
            canvas.addEventListener('touchstart', () => isScratching = true)
            canvas.addEventListener('touchend', () => isScratching = false)
            canvas.addEventListener('touchmove', scratch)

            return () => {
                canvas.removeEventListener('mousedown', () => isScratching = true)
                canvas.removeEventListener('mouseup', () => isScratching = false)
                canvas.removeEventListener('mousemove', scratch)
                canvas.removeEventListener('touchstart', () => isScratching = true)
                canvas.removeEventListener('touchend', () => isScratching = false)
                canvas.removeEventListener('touchmove', scratch)
            }
        }
    }, [showScratchOff])

    const openCard = () => {
        setIsOpen(true)
        if (soundEnabled) {
            console.log('🎵 Playing magical card opening sound')
        }

        setTimeout(() => {
            if (includeGame) {
                setShowScratchOff(true)
            }
        }, 1500)
    }

    const resetCard = () => {
        setIsOpen(false)
        setShowScratchOff(false)
        setScratchRevealed(false)
    }

    const getThemeColors = () => {
        switch (theme) {
            case 'birthday':
                return {
                    primary: 'from-pink-500 to-purple-600',
                    secondary: 'from-yellow-400 to-orange-500',
                    accent: '#ec4899'
                }
            case 'holiday':
                return {
                    primary: 'from-red-500 to-green-600',
                    secondary: 'from-gold to-yellow-500',
                    accent: '#dc2626'
                }
            case 'anniversary':
                return {
                    primary: 'from-rose-500 to-pink-600',
                    secondary: 'from-red-400 to-pink-500',
                    accent: '#f43f5e'
                }
            default:
                return {
                    primary: 'from-blue-500 to-purple-600',
                    secondary: 'from-cyan-400 to-blue-500',
                    accent: '#3b82f6'
                }
        }
    }

    const themeColors = getThemeColors()

    return (
        <div className="relative w-full max-w-lg mx-auto">
            {/* Magical Particles Canvas */}
            <canvas
                ref={particleCanvasRef}
                className="absolute inset-0 pointer-events-none z-50"
                style={{ display: isOpen ? 'block' : 'none' }}
            />

            {/* Card Container */}
            <div
                className={`relative transition-all duration-1000 transform-gpu ${isOpen ? 'scale-105' : 'hover:scale-105'
                    }`}
                style={{ perspective: '1000px' }}
            >
                {/* Card Front/Back */}
                <div
                    className={`relative w-full transition-all duration-1000 transform-gpu ${isOpen ? 'rotateY-180' : ''
                        }`}
                    style={{
                        transformStyle: 'preserve-3d',
                        aspectRatio: '3/4'
                    }}
                >
                    {/* Front of Card */}
                    <div
                        className={`absolute inset-0 backface-hidden rounded-xl shadow-2xl overflow-hidden cursor-pointer ${!isOpen ? 'block' : 'hidden'
                            }`}
                        onClick={openCard}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${themeColors.primary}`} />
                        <div
                            className="absolute inset-0 bg-cover bg-center opacity-60"
                            style={{ backgroundImage: `url(${frontImage})` }}
                        />
                        <div className="absolute inset-0 flex flex-col justify-center items-center text-white p-8">
                            <div className="text-center space-y-4">
                                <h2 className="text-4xl font-display font-bold mb-4 drop-shadow-lg">
                                    {frontMessage}
                                </h2>
                                <div className="flex justify-center space-x-2">
                                    <Heart className="h-8 w-8 animate-bounce" />
                                    <Star className="h-10 w-10 animate-bounce [animation-delay:0.2s]" />
                                    <Gift className="h-8 w-8 animate-bounce [animation-delay:0.4s]" />
                                </div>
                                <p className="text-lg font-medium opacity-90">Click to open!</p>
                            </div>
                        </div>
                    </div>

                    {/* Inside of Card */}
                    <div
                        className={`absolute inset-0 bg-white rounded-xl shadow-2xl overflow-hidden ${isOpen ? 'block' : 'hidden'
                            }`}
                        style={{ transform: 'rotateY(180deg)' }}
                    >
                        <div className="h-full flex">
                            {/* Left Side - Image */}
                            <div className="w-1/2 relative">
                                <div
                                    className="absolute inset-0 bg-cover bg-center"
                                    style={{ backgroundImage: `url(${insideImage})` }}
                                />
                                <div className={`absolute inset-0 bg-gradient-to-r ${themeColors.secondary} opacity-20`} />
                            </div>

                            {/* Right Side - Message */}
                            <div className="w-1/2 p-6 flex flex-col justify-center relative">
                                <div className="space-y-4">
                                    <h3 className="text-2xl font-display font-bold text-gray-800">
                                        Dear {recipientName},
                                    </h3>
                                    <p className="text-gray-700 leading-relaxed">
                                        {insideMessage}
                                    </p>
                                    <div className="pt-4">
                                        <p className="text-lg font-medium" style={{ color: themeColors.accent }}>
                                            With love,<br />
                                            {senderName}
                                        </p>
                                    </div>
                                </div>

                                {/* Decorative elements */}
                                <div className="absolute top-4 right-4">
                                    <Star className="h-6 w-6" style={{ color: themeColors.accent }} />
                                </div>
                                <div className="absolute bottom-4 left-4">
                                    <Heart className="h-5 w-5" style={{ color: themeColors.accent }} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Scratch-Off Game Overlay */}
                {showScratchOff && (
                    <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 rounded-xl z-40">
                        <Card className="bg-white p-6 m-4">
                            <CardContent className="text-center space-y-4">
                                <h3 className="text-xl font-bold">Surprise Gift!</h3>
                                <div className="relative">
                                    <canvas
                                        ref={scratchCanvasRef}
                                        className="border rounded-lg cursor-pointer"
                                        style={{ touchAction: 'none' }}
                                    />
                                    {scratchRevealed && (
                                        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-yellow-400 to-orange-500 rounded-lg">
                                            <div className="text-center text-white">
                                                <Gift className="h-12 w-12 mx-auto mb-2" />
                                                <p className="font-bold">$50 Coffee Gift Card!</p>
                                                <p className="text-sm">Check your email for details</p>
                                            </div>
                                        </div>
                                    )}
                                </div>
                                {scratchRevealed && (
                                    <p className="text-sm text-green-600 font-medium">
                                        🎉 Congratulations! Your gift has been revealed!
                                    </p>
                                )}
                            </CardContent>
                        </Card>
                    </div>
                )}
            </div>

            {/* Controls */}
            <div className="mt-6 flex justify-center space-x-3">
                <Button
                    onClick={resetCard}
                    variant="outline"
                    size="sm"
                    disabled={!isOpen}
                >
                    <RotateCcw className="h-4 w-4 mr-2" />
                    Reset
                </Button>

                <Button
                    onClick={() => setSoundEnabled(!soundEnabled)}
                    variant="outline"
                    size="sm"
                >
                    {soundEnabled ? (
                        <Volume2 className="h-4 w-4 mr-2" />
                    ) : (
                        <VolumeX className="h-4 w-4 mr-2" />
                    )}
                    Sound
                </Button>

                <Button
                    variant="outline"
                    size="sm"
                >
                    <Share2 className="h-4 w-4 mr-2" />
                    Share
                </Button>
            </div>

            {/* Card Instructions */}
            {!isOpen && (
                <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                        ✨ Click the card to experience the magic ✨
                    </p>
                </div>
            )}
        </div>
    )
}
