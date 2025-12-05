import { useState, useCallback } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import Cropper, { Area } from 'react-easy-crop'
import { Loader2, Crop, ZoomIn } from 'lucide-react'

interface ImageCropModalProps {
    imageUrl: string
    imageAlt: string
    isOpen: boolean
    onClose: () => void
    onApply: (imageDataUrl: string, cropData: Area) => void
    loading?: boolean
}

// Utility function to create cropped image as base64
async function createCroppedImage(
    imageSrc: string,
    pixelCrop: Area
): Promise<string> {
    const image = new Image()
    image.crossOrigin = 'anonymous' // Enable CORS

    return new Promise((resolve, reject) => {
        image.onload = () => {
            const canvas = document.createElement('canvas')
            const ctx = canvas.getContext('2d')

            if (!ctx) {
                reject(new Error('Failed to get canvas context'))
                return
            }

            // Set canvas size to cropped area
            canvas.width = pixelCrop.width
            canvas.height = pixelCrop.height

            // Draw the cropped image
            ctx.drawImage(
                image,
                pixelCrop.x,
                pixelCrop.y,
                pixelCrop.width,
                pixelCrop.height,
                0,
                0,
                pixelCrop.width,
                pixelCrop.height
            )

            // Convert to base64 data URL
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Canvas is empty'))
                        return
                    }
                    const reader = new FileReader()
                    reader.onloadend = () => {
                        resolve(reader.result as string)
                    }
                    reader.readAsDataURL(blob)
                },
                'image/png',
                0.95
            )
        }

        image.onerror = () => {
            reject(new Error('Failed to load image'))
        }

        image.src = imageSrc
    })
}

export function ImageCropModal({
    imageUrl,
    imageAlt,
    isOpen,
    onClose,
    onApply,
    loading = false
}: ImageCropModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 })
    const [zoom, setZoom] = useState(1)
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null)
    const [processing, setProcessing] = useState(false)

    const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
        setCroppedAreaPixels(croppedAreaPixels)
    }, [])

    const handleApply = async () => {
        if (!croppedAreaPixels) return

        setProcessing(true)
        try {
            // Create base64 cropped image
            const croppedImageDataUrl = await createCroppedImage(imageUrl, croppedAreaPixels)
            onApply(croppedImageDataUrl, croppedAreaPixels)
        } catch (error) {
            console.error('Error cropping image:', error)
            // Fallback to original image if cropping fails
            onApply(imageUrl, croppedAreaPixels)
        } finally {
            setProcessing(false)
        }
    }

    const handleReset = () => {
        setCrop({ x: 0, y: 0 })
        setZoom(1)
    }

    const isLoading = loading || processing

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[700px] max-h-[90vh]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Crop className="h-5 w-5 text-purple-600" />
                        Crop & Position Image
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-6">
                    {/* Crop Area */}
                    <div className="relative w-full h-[400px] bg-gray-100 rounded-lg overflow-hidden">
                        <Cropper
                            image={imageUrl}
                            crop={crop}
                            zoom={zoom}
                            aspect={3 / 4}
                            onCropChange={setCrop}
                            onCropComplete={onCropComplete}
                            onZoomChange={setZoom}
                            objectFit="contain"
                            classes={{
                                containerClassName: 'rounded-lg',
                                cropAreaClassName: 'border-2 border-purple-500'
                            }}
                        />
                    </div>

                    {/* Zoom Control */}
                    <div className="space-y-2">
                        <Label className="flex items-center gap-2">
                            <ZoomIn className="h-4 w-4" />
                            Zoom
                        </Label>
                        <Slider
                            value={[zoom]}
                            min={1}
                            max={3}
                            step={0.1}
                            onValueChange={(value) => setZoom(value[0])}
                            className="w-full"
                        />
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3">
                        <Button
                            onClick={handleReset}
                            variant="outline"
                            className="flex-1"
                            disabled={isLoading}
                        >
                            Reset
                        </Button>
                        <Button
                            onClick={onClose}
                            variant="outline"
                            className="flex-1"
                            disabled={isLoading}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleApply}
                            disabled={isLoading || !croppedAreaPixels}
                            className="flex-1 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white"
                        >
                            {isLoading ? (
                                <>
                                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                    {processing ? 'Processing...' : 'Saving...'}
                                </>
                            ) : (
                                'Apply'
                            )}
                        </Button>
                    </div>

                    <p className="text-xs text-muted-foreground text-center">
                        The cropped image will be saved as a high-quality PNG without CORS issues.
                    </p>
                </div>
            </DialogContent>
        </Dialog>
    )
}
