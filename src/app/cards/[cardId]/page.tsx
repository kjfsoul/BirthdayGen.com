/* eslint-disable no-console */
'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AnimatedCard } from "@/components/AnimatedCard"
import {
    Sparkles,
    Send,
    Download,
    Share2,
    Palette,
    ArrowLeft,
    Eye,
    EyeOff
} from "lucide-react"
import { ImageEditor } from "@/components/ImageEditor"

export default function CardPage() {
    const router = useRouter()
    const [showTools, setShowTools] = useState(true)
    const [cardData, setCardData] = useState({
        frontMessage: 'Happy Birthday!',
        insideMessage: 'Wishing you a wonderful day!',
        recipientName: 'Friend',
        senderName: 'Me',
        theme: 'birthday' as const,
        frontImage: '',
        insideImage: '',
        includeGame: true
    })

    const handleSend = () => {
        console.log('Sending card...')
    }

    const handleExport = (format: string) => {
        console.log('Exporting as', format)
    }

    // Helper for classNames
    const cn = (...classes: (string | undefined | null | false)[]) => {
        return classes.filter(Boolean).join(' ')
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8 px-4">
            <div className="max-w-7xl mx-auto">
                <div className="flex items-center justify-between mb-8">
                    <Button variant="ghost" onClick={() => router.back()}>
                        <ArrowLeft className="h-4 w-4 mr-2" />
                        Back
                    </Button>
                    <div className="flex space-x-2">
                        <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setShowTools(!showTools)}
                        >
                            {showTools ? <EyeOff className="h-4 w-4 mr-2" /> : <Eye className="h-4 w-4 mr-2" />}
                            {showTools ? 'Hide Tools' : 'Show Tools'}
                        </Button>
                    </div>
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {showTools && (
                        <div className="lg:col-span-1 space-y-6">
                            {/* AI Magic Studio */}
                            <ImageEditor
                                currentImageUrl={cardData.frontImage}
                                onImageUpdate={(newUrl) => setCardData(prev => ({ ...prev, frontImage: newUrl }))}
                                userCredits={5}
                            />

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
                                </div>
                            </CardHeader>
                            <CardContent className="p-8">
                                <div className="transition-all duration-500">
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
