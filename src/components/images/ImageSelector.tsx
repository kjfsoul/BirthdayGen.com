import React, { useState, useEffect, useRef } from 'react';
import { searchPexels, PexelsPhoto } from '@/lib/pexels';
import { saveToVault, getVaultImages, VaultImage } from '@/lib/vault';
import { uploadUserImage } from '@/lib/storage';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Loader2, Search, Image as ImageIcon, Heart, Upload } from 'lucide-react';
import { Card } from '@/components/ui/card';
import { useToast } from "@/hooks/use-toast";
import { ImageCropModal } from '@/components/images/ImageCropModal';
import type { Area } from 'react-easy-crop';

interface ImageSelectorProps {
    onSelectImage: (url: string, alt: string) => void;
}

export function ImageSelector({ onSelectImage }: ImageSelectorProps) {
    const [query, setQuery] = useState('');
    const [photos, setPhotos] = useState<PexelsPhoto[]>([]);
    const [vaultImages, setVaultImages] = useState<VaultImage[]>([]);
    const [loading, setLoading] = useState(false);
    const [vaultLoading, setVaultLoading] = useState(false);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState('search');
    const { toast } = useToast();
    const fileInputRef = useRef<HTMLInputElement>(null);

    // Crop modal state
    const [cropModalOpen, setCropModalOpen] = useState(false);
    const [selectedImageForCrop, setSelectedImageForCrop] = useState<{ url: string; alt: string } | null>(null);
    const [cropSaving, setCropSaving] = useState(false);

    const handleSearch = async (e?: React.FormEvent) => {
        e?.preventDefault();
        if (!query.trim()) return;

        setLoading(true);
        setError(null);
        try {
            const data = await searchPexels(query);
            setPhotos(data.photos || []);
        } catch {
            setError('Failed to fetch images. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const loadVault = async () => {
        setVaultLoading(true);
        try {
            const images = await getVaultImages();
            setVaultImages(images || []);
        } catch {
            console.error('Failed to load vault');
        } finally {
            setVaultLoading(false);
        }
    };

    const handleSaveToVault = async (e: React.MouseEvent, photo: PexelsPhoto) => {
        e.stopPropagation();
        try {
            await saveToVault({
                url: photo.src.large,
                alt: photo.alt,
                source: 'pexels',
                source_id: photo.id.toString()
            });
            toast({
                title: "✅ Image added to your Vault",
                description: "Saved successfully!",
            });
            await loadVault(); // Refresh vault
            setActiveTab('vault'); // Auto-switch to vault tab
        } catch {
            toast({
                title: "Error",
                description: "Failed to save image. Please try again.",
                variant: "destructive"
            });
        }
    };

    const handlePhotoClick = (photo: PexelsPhoto) => {
        // Open crop modal instead of directly selecting
        setSelectedImageForCrop({
            url: photo.src.large,
            alt: photo.alt
        });
        setCropModalOpen(true);
    };

    const handleVaultImageClick = (image: VaultImage) => {
        // Vault images can be directly selected or cropped
        setSelectedImageForCrop({
            url: image.url,
            alt: image.alt
        });
        setCropModalOpen(true);
    };

    const handleCropApply = async (imageUrl: string, cropData: Area) => {
        setCropSaving(true);
        try {
            // Save to vault if not already there
            if (selectedImageForCrop) {
                await saveToVault({
                    url: imageUrl,
                    alt: selectedImageForCrop.alt,
                    source: 'cropped',
                    source_id: Date.now().toString()
                });
            }

            // Apply to card
            onSelectImage(imageUrl, selectedImageForCrop?.alt || 'Card image');

            toast({
                title: "✅ Image added to your Vault",
                description: "Applied to card successfully!",
            });

            setCropModalOpen(false);
            setSelectedImageForCrop(null);
            await loadVault();
        } catch (error) {
            console.error('Crop apply error:', error);
            toast({
                title: "Error",
                description: "Failed to apply image. Please try again.",
                variant: "destructive"
            });
        } finally {
            setCropSaving(false);
        }
    };

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        setUploading(true);
        try {
            const publicUrl = await uploadUserImage(file);

            // Open crop modal for uploaded image
            setSelectedImageForCrop({
                url: publicUrl,
                alt: file.name
            });
            setCropModalOpen(true);

            toast({
                title: "Upload Successful",
                description: "Now crop and position your image.",
            });
        } catch (err) {
            console.error(err);
            toast({
                title: "Upload Failed",
                description: "Could not upload image. Please try again.",
                variant: "destructive"
            });
        } finally {
            setUploading(false);
            if (fileInputRef.current) fileInputRef.current.value = '';
        }
    };

    // Load vault on mount
    useEffect(() => {
        loadVault();
    }, []);

    return (
        <div className="flex flex-col h-[500px]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">
                <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="search">Search Pexels</TabsTrigger>
                    <TabsTrigger value="vault" onClick={loadVault}>My Vault</TabsTrigger>
                    <TabsTrigger value="upload">Uploads</TabsTrigger>
                </TabsList>

                <TabsContent value="search" className="flex-1 flex flex-col h-full overflow-hidden">
                    <div className="flex flex-col h-full space-y-4">
                        <form onSubmit={handleSearch} className="flex gap-2">
                            <Input
                                placeholder="Search photos..."
                                value={query}
                                onChange={(e) => setQuery(e.target.value)}
                                className="flex-1"
                            />
                            <Button type="submit" disabled={loading} size="icon">
                                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <Search className="h-4 w-4" />}
                            </Button>
                        </form>

                        {error && <p className="text-sm text-red-500">{error}</p>}

                        <ScrollArea className="flex-1">
                            {photos.length === 0 && !loading ? (
                                <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                    <ImageIcon className="h-12 w-12 mb-2 opacity-20" />
                                    <p>Search for high-quality images</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 gap-2 pb-4">
                                    {photos.map((photo) => (
                                        <Card
                                            key={photo.id}
                                            className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all group relative"
                                            onClick={() => handlePhotoClick(photo)}
                                        >
                                            {/* eslint-disable-next-line @next/next/no-img-element */}
                                            <img
                                                src={photo.src.medium}
                                                alt={photo.alt}
                                                className="w-full h-32 object-cover"
                                                loading="lazy"
                                            />
                                            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white text-xs p-2 text-center">
                                                <span className="mb-2">by {photo.photographer}</span>
                                                <Button
                                                    size="sm"
                                                    variant="secondary"
                                                    className="h-8 w-8 p-0 rounded-full"
                                                    onClick={(e) => handleSaveToVault(e, photo)}
                                                >
                                                    <Heart className="h-4 w-4 text-red-500" />
                                                </Button>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            )}
                        </ScrollArea>
                    </div>
                </TabsContent>

                <TabsContent value="vault" className="flex-1 h-full overflow-hidden">
                    <ScrollArea className="h-full">
                        {vaultLoading ? (
                            <div className="flex justify-center p-8"><Loader2 className="animate-spin" /></div>
                        ) : vaultImages.length === 0 ? (
                            <div className="flex flex-col items-center justify-center h-40 text-muted-foreground">
                                <Heart className="h-12 w-12 mb-2 opacity-20" />
                                <p>No saved images yet</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-2 gap-2 pb-4">
                                {vaultImages.map((img) => (
                                    <Card
                                        key={img.id}
                                        className="overflow-hidden cursor-pointer hover:ring-2 hover:ring-purple-500 transition-all group relative"
                                        onClick={() => handleVaultImageClick(img)}
                                    >
                                        {/* eslint-disable-next-line @next/next/no-img-element */}
                                        <img
                                            src={img.url}
                                            alt={img.alt}
                                            className="w-full h-32 object-cover"
                                            loading="lazy"
                                        />
                                        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs p-2">
                                            Select
                                        </div>
                                    </Card>
                                ))}
                            </div>
                        )}
                    </ScrollArea>
                </TabsContent>

                <TabsContent value="upload" className="flex-1 h-full">
                    <div className="flex flex-col items-center justify-center h-full border-2 border-dashed rounded-lg p-8 text-muted-foreground hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => fileInputRef.current?.click()}>
                        <input
                            type="file"
                            ref={fileInputRef}
                            className="hidden"
                            accept="image/*"
                            onChange={handleUpload}
                        />
                        {uploading ? (
                            <Loader2 className="h-12 w-12 mb-4 animate-spin text-purple-500" />
                        ) : (
                            <Upload className="h-12 w-12 mb-4 opacity-20" />
                        )}
                        <p className="mb-2 font-medium">{uploading ? 'Uploading...' : 'Click to upload photo'}</p>
                        <p className="text-xs text-muted-foreground">Supports JPG, PNG, WEBP</p>
                    </div>
                </TabsContent>
            </Tabs>

            {/* Crop Modal */}
            {selectedImageForCrop && (
                <ImageCropModal
                    imageUrl={selectedImageForCrop.url}
                    imageAlt={selectedImageForCrop.alt}
                    isOpen={cropModalOpen}
                    onClose={() => {
                        setCropModalOpen(false);
                        setSelectedImageForCrop(null);
                    }}
                    onApply={handleCropApply}
                    loading={cropSaving}
                />
            )}
        </div>
    );
}
