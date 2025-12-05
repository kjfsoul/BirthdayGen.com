import React, { useState, useCallback } from 'react'
import Cropper from 'react-easy-crop'
import { Slider } from "@/components/ui/slider"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { Sun, Contrast, Droplet, Check, X, Undo2, Sparkles, Wand2, Image as ImageIcon } from 'lucide-react'
import { getCroppedImg, ImageFilters } from '@/lib/image-utils'
import { Point, Area } from 'react-easy-crop'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface ImageEditorProps {
    imageSrc: string
    onSave: (newImageSrc: string) => void
    onCancel: () => void
}

export function ImageEditor({ imageSrc, onSave, onCancel }: ImageEditorProps) {
    const { toast } = useToast()
    const [crop, setCrop] = useState<Point>({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [rotation, setRotation] = useState(0)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [isAiEditing, setIsAiEditing] = useState(false)
    const [aiEditType, setAiEditType] = useState<string | null>(null)

    const [filters, setFilters] = useState<ImageFilters>({
        brightness: 100,
        contrast: 100,
        saturation: 100,
        sepia: 0,
        grayscale: 0
    })

    const onCropComplete = useCallback((croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleSave = async () => {
        try {
            const croppedImage = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                rotation,
                filters
            )
            onSave(croppedImage)
        } catch (e) {
            console.error(e)
        }
    }

    const handleAiEdit = async (type: 'enhance' | 'remove-bg') => {
        setIsAiEditing(true)
        setAiEditType(type)

        try {
            const { data: { session } } = await supabase.auth.getSession()
            if (!session) {
                toast({
                    title: "Authentication required",
                    description: "Please sign in to use AI features.",
                    variant: "destructive"
                })
                return
            }

            // Get current cropped image to send to AI
            const currentImage = await getCroppedImg(
                imageSrc,
                croppedAreaPixels,
                rotation,
                filters
            )

            const response = await fetch(`${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/edit-image`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${session.access_token}`
                },
                body: JSON.stringify({
                    image: currentImage,
                    prompt: type === 'enhance' ? "enhance image, make it vibrant and clear" : "remove background, keep main subject",
                    // For now we don't send a mask, implying full image processing or auto-segmentation
                })
            })

            const data = await response.json()

            if (!response.ok) {
                if (response.status === 402) {
                    toast({
                        title: "Insufficient Credits",
                        description: "You have run out of free AI credits.",
                        variant: "destructive"
                    })
                } else {
                    throw new Error(data.error || 'AI generation failed')
                }
                return
            }

            onSave(data.image)
            toast({
                title: "Magic Complete!",
                description: `Image processed successfully. Credits remaining: ${data.creditsRemaining}`,
            })

        } catch (error) {
            console.error('AI Edit Error:', error)
            toast({
                title: "Error",
                description: "Failed to process image. Please try again.",
                variant: "destructive"
            })
        } finally {
            setIsAiEditing(false)
            setAiEditType(null)
        }
    }

    const resetFilters = () => {
        setFilters({
            brightness: 100,
            contrast: 100,
            saturation: 100,
            sepia: 0,
            grayscale: 0
        })
    }

    return (
        <div className="flex flex-col h-[600px] w-full bg-black/5 rounded-lg overflow-hidden">
            <div className="relative flex-1 bg-black/90 w-full min-h-[300px]">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    rotation={rotation}
                    aspect={3 / 4}
                    onCropChange={setCrop}
                    onCropComplete={onCropComplete}
                    onZoomChange={setZoom}
                    onRotationChange={setRotation}
                    style={{
                        containerStyle: {
                            filter: `brightness(${filters.brightness}%) contrast(${filters.contrast}%) saturate(${filters.saturation}%) sepia(${filters.sepia}%) grayscale(${filters.grayscale}%)`
                        }
                    }}
                />
            </div>

            <div className="bg-white border-t p-4 space-y-4">
                <Tabs defaultValue="crop" className="w-full">
                    <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="crop">Crop & Rotate</TabsTrigger>
                        <TabsTrigger value="adjust">Adjustments</TabsTrigger>
                    </TabsList>

                    <TabsContent value="crop" className="space-y-4 py-4">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Zoom</Label>
                                <span className="text-xs text-muted-foreground">{zoom.toFixed(1)}x</span>
                            </div>
                            <Slider
                                value={[zoom]}
                                min={1}
                                max={3}
                                step={0.1}
                                onValueChange={(v) => setZoom(v[0])}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Rotation</Label>
                                <span className="text-xs text-muted-foreground">{rotation}°</span>
                            </div>
                            <Slider
                                value={[rotation]}
                                min={0}
                                max={360}
                                step={1}
                                onValueChange={(v) => setRotation(v[0])}
                            />
                        </div>
                    </TabsContent>

                    <TabsContent value="adjust" className="space-y-4 py-4 h-[200px] overflow-y-auto pr-2">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label className="flex items-center gap-2"><Sun className="h-4 w-4" /> Brightness</Label>
                                <span className="text-xs text-muted-foreground">{filters.brightness}%</span>
                            </div>
                            <Slider
                                value={[filters.brightness]}
                                min={0}
                                max={200}
                                onValueChange={(v) => setFilters(prev => ({ ...prev, brightness: v[0] }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label className="flex items-center gap-2"><Contrast className="h-4 w-4" /> Contrast</Label>
                                <span className="text-xs text-muted-foreground">{filters.contrast}%</span>
                            </div>
                            <Slider
                                value={[filters.contrast]}
                                min={0}
                                max={200}
                                onValueChange={(v) => setFilters(prev => ({ ...prev, contrast: v[0] }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label className="flex items-center gap-2"><Droplet className="h-4 w-4" /> Saturation</Label>
                                <span className="text-xs text-muted-foreground">{filters.saturation}%</span>
                            </div>
                            <Slider
                                value={[filters.saturation]}
                                min={0}
                                max={200}
                                onValueChange={(v) => setFilters(prev => ({ ...prev, saturation: v[0] }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Sepia</Label>
                                <span className="text-xs text-muted-foreground">{filters.sepia}%</span>
                            </div>
                            <Slider
                                value={[filters.sepia]}
                                min={0}
                                max={100}
                                onValueChange={(v) => setFilters(prev => ({ ...prev, sepia: v[0] }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <Label>Grayscale</Label>
                                <span className="text-xs text-muted-foreground">{filters.grayscale}%</span>
                            </div>
                            <Slider
                                value={[filters.grayscale]}
                                min={0}
                                max={100}
                                onValueChange={(v) => setFilters(prev => ({ ...prev, grayscale: v[0] }))}
                            />
                        </div>

                        <Button variant="outline" size="sm" onClick={resetFilters} className="w-full">
                            <Undo2 className="h-4 w-4 mr-2" /> Reset Filters
                        </Button>
                    </TabsContent>

                    <TabsContent value="ai" className="space-y-4 py-4">
                        <div className="p-4 border rounded-lg bg-purple-50 space-y-4">
                            <div className="flex items-center gap-2 text-purple-700 font-medium">
                                <Sparkles className="h-5 w-5" />
                                AI Magic Edit
                            </div>
                            <p className="text-sm text-muted-foreground">
                                Use AI to automatically enhance your image or remove unwanted objects.
                                <br />
                                <span className="text-xs font-semibold text-purple-600">Cost: 1 Credit per use</span>
                            </p>

                            <div className="grid grid-cols-2 gap-2">
                                <Button
                                    variant="outline"
                                    className="h-20 flex flex-col gap-2"
                                    onClick={() => handleAiEdit('enhance')}
                                    disabled={isAiEditing}
                                >
                                    <Wand2 className="h-6 w-6 text-purple-500" />
                                    <span>{isAiEditing && aiEditType === 'enhance' ? 'Enhancing...' : 'Auto Enhance'}</span>
                                </Button>
                                <Button
                                    variant="outline"
                                    className="h-20 flex flex-col gap-2"
                                    onClick={() => handleAiEdit('remove-bg')}
                                    disabled={isAiEditing}
                                >
                                    <ImageIcon className="h-6 w-6 text-blue-500" />
                                    <span>{isAiEditing && aiEditType === 'remove-bg' ? 'Removing BG...' : 'Remove BG'}</span>
                                </Button>
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>

                <div className="flex justify-end gap-2 pt-2 border-t">
                    <Button variant="outline" onClick={onCancel} disabled={isAiEditing}>
                        <X className="h-4 w-4 mr-2" /> Cancel
                    </Button>
                    <Button onClick={handleSave} className="bg-purple-600 hover:bg-purple-700 text-white">
                        <Check className="h-4 w-4 mr-2" /> Apply Changes
                    </Button>
                </div>
            </div>
        </div>
    )
}
