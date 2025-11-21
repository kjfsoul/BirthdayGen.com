'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { AnimatedCard } from "@/components/AnimatedCard"
import {
    Sparkles,
    Send,
    Download,
    Share2,
    Palette,
    Wand2,
    ArrowLeft,
    Settings,
    Eye,
    EyeOff
} from "lucide-react"
import { cn } from "@/lib/utils"

interface CardData {
    id: string
    recipientName: string
    senderName: string
    frontMessage: string
    insideMessage: string
    theme: 'birthday' | 'holiday' | 'anniversary' | 'custom'
    frontImage?: string
    insideImage?: string
    includeGame?: boolean
}

export default function CardPage() {
    const params = useParams()
    const router = useRouter()
    const cardId = params.cardId as string

    const [cardData, setCardData] = useState<CardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [showTools, setShowTools] = useState(true)
    const [livePreview, setLivePreview] = useState(true)
    const [auraEnabled, setAuraEnabled] = useState(false)

    // Fetch card data
    useEffect(() => {
        const fetchCard = async () => {
            try {
                // TODO: Replace with actual API call
                // const response = await fetch(`/api/cards/${cardId}`)
                // const data = await response.json()

                // Mock data for now
                setCardData({
                    id: cardId,
                    recipientName: 'Sarah',
                    senderName: 'John',
                    frontMessage: 'Happy Birthday!',
                    insideMessage: 'Wishing you all the happiness in the world on your special day!',
                    theme: 'birthday',
                    includeGame: true
                })
            } catch (error) {
                console.error('Error fetching card:', error)
            } finally {
                setLoading(false)
            }
        }

        fetchCard()
    }, [cardId])

    const handleSend = async () => {
        try {
            const response = await fetch(`/api/cards/${cardId}/send`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ cardId })
            })

            if (response.ok) {
                alert('Card sent successfully!')
            }
        } catch (error) {
            console.error('Error sending card:', error)
            alert('Failed to send card')
        }
    }

    const handleExport = (format: 'png' | 'pdf' | 'gif') => {
        console.log(`Exporting card as ${format}`)
        // TODO: Implement export functionality
    }

    const handleAIPersonalize = () => {
        setAuraEnabled(!auraEnabled)
        console.log('AI Personalization toggled:', !auraEnabled)
        // TODO: Implement AI personalization
    }

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <Sparkles className="h-12 w-12 mx-auto animate-spin text-purple-600" />
                    <p className="text-muted-foreground">Loading your card...</p>
                </div>
            </div>
        )
    }

    if (!cardData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="text-center space-y-4">
                    <p className="text-xl text-muted-foreground">Card not found</p>
                    <Button onClick={() => router.push('/generator')}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back to Generator
                    </Button>
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-purple-50 via-pink-50 to-orange-50">
            {/* Header */}
            <div className="sticky top-0 z-50 bg-white/80 backdrop-blur-md border-b">
                <div className="max-w-7xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-4">
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => router.push('/generator')}
                            >
                                <ArrowLeft className="h-4 w-4 mr-2" />
                                Back
                            </Button>
                            <div>
                                <h1 className="text-xl font-display font-bold text-purple-600">
                                    {cardData.frontMessage}
                                </h1>
                                <p className="text-sm text-muted-foreground">
                                    For {cardData.recipientName}
                                </p>
                            </div>
                        </div>

                        <div className="flex items-center space-x-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setShowTools(!showTools)}
                            >
                                <Settings className="h-4 w-4 mr-2" />
                                {showTools ? 'Hide' : 'Show'} Tools
                            </Button>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={() => setLivePreview(!livePreview)}
                            >
                                {livePreview ? (
                                    <Eye className="h-4 w-4 mr-2" />
                                ) : (
                                    <EyeOff className="h-4 w-4 mr-2" />
                                )}
                                Preview
                            </Button>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Tools Panel */}
                    {showTools && (
                        <div className="lg:col-span-1 space-y-4">
                            {/* AI Personalization */}
                            <Card className={cn(
                                "transition-all duration-300",
                                auraEnabled && "ring-2 ring-purple-500 shadow-lg shadow-purple-200"
                            )}>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <Wand2 className="h-5 w-5 mr-2 text-purple-600" />
                                        AI Personalization
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <Button
                                        onClick={handleAIPersonalize}
                                        className={cn(
                                            "w-full",
                                            auraEnabled
                                                ? "bg-gradient-to-r from-purple-600 to-pink-600"
                                                : "bg-gradient-to-r from-purple-500 to-pink-500"
                                        )}
                                    >
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        {auraEnabled ? 'Aura Active' : 'Enable Aura'}
                                    </Button>
                                    {auraEnabled && (
                                        <div className="p-3 bg-purple-50 rounded-lg border border-purple-200">
                                            <p className="text-sm text-purple-700">
                                                ✨ AI is personalizing your card based on recipient's aura
                                            </p>
                                        </div>
                                    )}
                                </CardContent>
                            </Card>

                            {/* Color Palette */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center text-lg">
                                        <Palette className="h-5 w-5 mr-2 text-green-600" />
                                        Customize
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div className="grid grid-cols-3 gap-2">
                                        {['pink', 'purple', 'blue', 'green', 'orange', 'red'].map((color) => (
                                            <button
                                                key={color}
                                                className={cn(
                                                    "h-12 rounded-lg border-2 border-white shadow-sm hover:scale-110 transition-transform",
                                                    `bg-${color}-500`
                                                )}
                                                style={{ backgroundColor: `var(--${color}-500)` }}
                                            />
                                        ))}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="text-lg">Actions</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <Button
                                        onClick={handleSend}
                                        className="w-full bg-gradient-to-r from-green-500 to-emerald-600"
                                    >
                                        <Send className="h-4 w-4 mr-2" />
                                        Send Card
                                    </Button>

                                    <div className="grid grid-cols-2 gap-2">
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport('png')}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            PNG
                                        </Button>
                                        <Button
                                            variant="outline"
                                            size="sm"
                                            onClick={() => handleExport('pdf')}
                                        >
                                            <Download className="h-4 w-4 mr-2" />
                                            PDF
                                        </Button>
                                    </div>

                                    <Button variant="outline" className="w-full">
                                        <Share2 className="h-4 w-4 mr-2" />
                                        Share
                                    </Button>
                                </CardContent>
                            </Card>

                            {/* Performance Badge */}
                            <div className="flex items-center justify-center space-x-2 text-sm text-muted-foreground">
                                <Sparkles className="h-4 w-4 text-green-500" />
                                <span>60fps • Mobile Optimized</span>
                            </div>
                        </div>
                    )}

                    {/* Live Preview */}
                    <div className={cn(
                        "transition-all duration-300",
                        showTools ? "lg:col-span-2" : "lg:col-span-3"
                    )}>
                        <Card className="sticky top-24">
                            <CardHeader>
                                <div className="flex items-center justify-between">
                                    <CardTitle className="flex items-center">
                                        <Eye className="h-5 w-5 mr-2 text-blue-600" />
                                        Live Preview
                                    </CardTitle>
                                    {auraEnabled && (
                                        <Badge className="bg-gradient-to-r from-purple-500 to-pink-500 animate-pulse">
                                            <Sparkles className="h-3 w-3 mr-1" />
                                            Aura Active
                                        </Badge>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className={cn(
                                    "transition-all duration-500",
                                    auraEnabled && "blur-fade-in"
                                )}>
                                    <AnimatedCard
                                        frontMessage={cardData.frontMessage}
                                        insideMessage={cardData.insideMessage}
                                        recipientName={cardData.recipientName}
                                        senderName={cardData.senderName}
                                        theme={cardData.theme}
                                        frontImage={cardData.frontImage}
                                        insideImage={cardData.insideImage}
                                        includeGame={cardData.includeGame}
                                    />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>

            {/* Sparkles Animation */}
            <style jsx global>{`
        .blur-fade-in {
          animation: blurFadeIn 0.8s ease-out;
        }

        @keyframes blurFadeIn {
          0% {
            opacity: 0;
            filter: blur(10px);
            transform: scale(0.95);
          }
          100% {
            opacity: 1;
            filter: blur(0);
            transform: scale(1);
          }
        }

        @keyframes sparkle {
          0%, 100% {
            opacity: 0;
            transform: scale(0);
          }
          50% {
            opacity: 1;
            transform: scale(1);
          }
        }
      `}</style>
        </div>
    )
}
