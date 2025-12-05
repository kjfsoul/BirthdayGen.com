'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Wand2, Eraser, Loader2, ImageIcon } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { supabase } from "@/lib/supabase/client"

interface ImageEditorProps {
    currentImageUrl?: string
    onImageUpdate: (url: string) => void
    userCredits: number
}

export function ImageEditor({ currentImageUrl, onImageUpdate, userCredits }: ImageEditorProps) {
    const [processing, setProcessing] = useState(false)
    const { toast } = useToast()

    const handleMagicEdit = async (mode: 'enhance' | 'remove-bg') => {
        if (userCredits < 1) {
            toast({
                variant: "destructive",
                title: "Insufficient Credits",
                description: "You need at least 1 credit to use AI Magic tools."
            })
            return
        }

        if (!currentImageUrl) {
            toast({
                variant: "destructive",
                title: "No Image",
                description: "Please upload an image first."
            })
            return
        }

        setProcessing(true)
        try {
            // For now, use a simple prompt-based approach
            // Future: Implement mask drawing UI
            let prompt = ''
            const mask = currentImageUrl // Placeholder - ideally user draws mask

            if (mode === 'enhance') {
                prompt = 'enhance image quality, sharp details, vibrant colors, professional photography'
            } else {
                prompt = 'remove background, transparent background, isolated subject'
            }

            const { data, error } = await supabase.functions.invoke('edit-image', {
                body: {
                    image: currentImageUrl,
                    mask: mask,
                    prompt: prompt
                }
            })

            if (error) {
                // Handle credit error specifically
                if (error.message?.includes('insufficient_credits')) {
                    toast({
                        variant: "destructive",
                        title: "Insufficient Credits",
                        description: "You don't have enough credits for this operation."
                    })
                    return
                }
                throw error
            }

            if (data?.image) {
                onImageUpdate(data.image)
                toast({
                    title: "Magic Complete! ✨",
                    description: `Your image has been ${mode === 'enhance' ? 'enhanced' : 'background removed'}.`
                })
            }
        } catch (error) {
            console.error('AI Edit Error:', error)
            toast({
                variant: "destructive",
                title: "Generation Failed",
                description: "Please try again later."
            })
        } finally {
            setProcessing(false)
        }
    }

    return (
        <Card className="border-purple-200 bg-purple-50/50">
            <CardHeader className="pb-3">
                <CardTitle className="flex items-center text-lg text-purple-900">
                    <Wand2 className="mr-2 h-5 w-5 text-purple-600" />
                    AI Magic Studio
                    <span className="ml-auto text-xs font-normal text-purple-600 bg-purple-100 px-2 py-1 rounded-full">
                        {userCredits} Credits Available
                    </span>
                </CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-2 gap-3">
                <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 hover:border-purple-400 hover:bg-purple-50"
                    onClick={() => handleMagicEdit('enhance')}
                    disabled={processing || !currentImageUrl}
                >
                    {processing ? <Loader2 className="h-6 w-6 animate-spin text-purple-600" /> : <ImageIcon className="h-6 w-6 text-purple-600" />}
                    <span className="text-xs font-medium">Magic Enhance</span>
                </Button>

                <Button
                    variant="outline"
                    className="h-20 flex-col gap-2 hover:border-pink-400 hover:bg-pink-50"
                    onClick={() => handleMagicEdit('remove-bg')}
                    disabled={processing || !currentImageUrl}
                >
                    {processing ? <Loader2 className="h-6 w-6 animate-spin text-pink-600" /> : <Eraser className="h-6 w-6 text-pink-600" />}
                    <span className="text-xs font-medium">Remove BG</span>
                </Button>
            </CardContent>
        </Card>
    )
}
