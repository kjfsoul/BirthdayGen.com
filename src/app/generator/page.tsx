// src/app/generator/page.tsx
/* eslint-disable no-console */
'use client'

import { useState, useCallback, useRef } from 'react'
import { DndContext, DragEndEvent, DragStartEvent } from '@dnd-kit/core'
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Heart,
  Download,
  Share2,
  Sparkles,
  PartyPopper,
  Gift,
  Image as ImageIcon,
  X,
  Loader2,
  Wand2,
  MessageSquare,
  Sticker as StickerIcon
} from "lucide-react"
import { SendCardDialog } from "@/components/card/SendCardDialog"
import { supabase } from "@/lib/supabase/client"
import { ImageSelector } from "@/components/images/ImageSelector"
import { BrainstormAssistant } from "@/components/generator/BrainstormAssistant"
import { CardStage, type Sticker } from "@/components/generator/CardStage"
import { StickerDrawer } from "@/components/generator/StickerDrawer"
import { AudioController } from "@/components/generator/AudioController"
import { AIMessageGenerator } from "@/components/generator/AIMessageGenerator"
import { getAllTemplates } from "@/config/templates"
import { handleShare } from "@/lib/share"
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

export default function CardGeneratorPage() {
  const navigate = useNavigate()

  // --- STATE ---
  const [activeTab, setActiveTab] = useState('template')

  // Card Content State
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [customMessage, setCustomMessage] = useState('Wishing you a day filled with happiness and a year filled with joy!')

  // Visual State
  const [selectedTemplate, setSelectedTemplate] = useState('birthday-blast')
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [selectedColors, setSelectedColors] = useState({
    primary: '#ec4899',
    secondary: '#a855f7',
    accent: '#f59e0b'
  })

  // UI State
  const [isPexelsOpen, setIsPexelsOpen] = useState(false)
  const [stickers, setStickers] = useState<Sticker[]>([])
  const [isDragging, setIsDragging] = useState(false)
  const [isSharing, setIsSharing] = useState(false)
  const [selectedMusic, setSelectedMusic] = useState<string | null>(null)
  const [generatedCardId, setGeneratedCardId] = useState<number | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)

  // Audio ref for confetti sound
  const confettiAudioRef = useRef<HTMLAudioElement | null>(null)

  // --- CONFIG ---
  const templates = getAllTemplates()

  const colorPalettes = [
    {
      name: 'Birthday Pink',
      primary: '#ec4899',
      secondary: '#a855f7',
      accent: '#f59e0b'
    },
    {
      name: 'Ocean Blue',
      primary: '#3b82f6',
      secondary: '#06b6d4',
      accent: '#10b981'
    },
    {
      name: 'Sunset Orange',
      primary: '#f97316',
      secondary: '#ef4444',
      accent: '#f59e0b'
    }
  ]

  // --- ACTIONS ---

  // Handle drag start - disable tilt
  const handleDragStart = useCallback((event: DragStartEvent) => {
    setIsDragging(true)
  }, [])

  // Handle drag end - calculate sticker position or reposition existing
  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setIsDragging(false)

    const { active, over } = event

    // Check if dropped on the card stage
    if (over?.id === 'card-stage-drop-zone') {
      // Check if this is an existing sticker being repositioned
      const activeIdString = active.id.toString()
      const existingStickerId = activeIdString.startsWith('sticker-')
        ? activeIdString.replace('sticker-', '')
        : null

      // Get the drop container rect
      const dropZone = document.querySelector('[data-droppable-id="card-stage-drop-zone"]')
        || document.querySelector('.aspect-\\[3\\/4\\]')

      if (dropZone) {
        const rect = dropZone.getBoundingClientRect()
        const dropEvent = event.activatorEvent as PointerEvent

        // Calculate relative position as percentage
        const x = Math.max(5, Math.min(95, ((dropEvent.clientX - rect.left) / rect.width) * 100))
        const y = Math.max(5, Math.min(95, ((dropEvent.clientY - rect.top) / rect.height) * 100))

        if (existingStickerId) {
          // Reposition existing sticker
          setStickers(prev => prev.map(s =>
            s.id === existingStickerId ? { ...s, x, y } : s
          ))
        } else if (active.data.current?.emoji) {
          // Add new sticker from drawer
          const newSticker: Sticker = {
            id: uuidv4(),
            x,
            y,
            src: active.data.current.emoji,
            scale: 1,
          }

          setStickers(prev => [...prev, newSticker])
        }
      }
    }
  }, [])

  // Play confetti celebration sound
  const playConfettiSound = useCallback(() => {
    try {
      // Create audio element if not exists
      if (!confettiAudioRef.current) {
        confettiAudioRef.current = new Audio('/sounds/confetti.mp3')
        confettiAudioRef.current.volume = 0.5
      }
      confettiAudioRef.current.currentTime = 0
      confettiAudioRef.current.play().catch(() => {
        // Silently fail if audio can't play (e.g., no user interaction yet)
        // eslint-disable-next-line no-console
        console.log('Audio play blocked - user interaction required')
      })
    } catch (e) {
      // eslint-disable-next-line no-console
      console.log('Confetti sound not available')
    }
  }, [])

  // Handle share/download button click
  const onShareClick = useCallback(async () => {
    setIsSharing(true)
    try {
      const result = await handleShare('card-stage', `birthday - card - ${Date.now()}.png`)
      if (result.success) {
        // eslint-disable-next-line no-console
        console.log(`Card ${result.method === 'share' ? 'shared' : 'downloaded'} successfully`)
      } else {
        // eslint-disable-next-line no-console
        console.error('Share failed:', result.error)
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Share error:', error)
    } finally {
      setIsSharing(false)
    }
  }, [])

  const generateCard = async () => {
    setIsGenerating(true)
    try {
      // Play celebration sound 🎉
      playConfettiSound()

      const { data: { user } } = await supabase.auth.getUser()

      const { data, error } = await supabase
        .from('cards')
        .insert({
          user_id: user?.id,
          title: 'Happy Birthday!',
          message: customMessage,
          template: selectedTemplate,
          background_style: selectedColors.primary,
          text_style: 'font-sans',
          elements: {
            recipientName,
            senderName,
            colors: selectedColors,
            imageUrl: selectedImage,
            stickers,
            musicUrl: selectedMusic // Save music selection to DB
          },
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error

      // eslint-disable-next-line no-console
      console.log('Card generated:', data)
      setGeneratedCardId(data.id)
      navigate(`/ cards / ${data.id} `)
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('Error generating card:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  // Get template icons based on template ID
  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'birthday-blast': return PartyPopper
      case 'elegant-wishes': return Heart
      case 'fun-party': return Gift
      default: return Sparkles
    }
  }

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="flex flex-col h-screen bg-neutral-50 overflow-hidden font-sans">

        {/* 1. TOP BAR */}
        <header className="h-16 bg-white border-b flex items-center justify-between px-6 shrink-0 z-10">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-pink-500 to-purple-600 p-2 rounded-lg text-white">
              <Sparkles className="h-5 w-5" />
            </div>
            <h1 className="text-xl font-display font-bold text-gray-900">
              Holiday & Celebration Studio
            </h1>
            <Badge variant="secondary" className="hidden md:flex">Beta</Badge>
          </div>

          <div className="flex items-center space-x-3">
            {/* Actions */}
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedImage(null)
                setStickers([])
                setRecipientName('')
                setSenderName('')
                setCustomMessage('Wishing you a day filled with happiness and a year filled with joy!')
              }}
            >
              Reset
            </Button>
            <Button
              onClick={generateCard}
              disabled={isGenerating}
              className="bg-black text-white hover:bg-gray-800"
            >
              {isGenerating ? 'Saving...' : 'Save Draft'}
            </Button>
            <SendCardDialog
              cardId={generatedCardId}
              trigger={
                <Button variant="outline" disabled={!generatedCardId} className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  <Share2 className="h-4 w-4 mr-2" />
                  Send
                </Button>
              }
            />
          </div>
        </header>

        {/* 2. MAIN WORKSPACE (Split Layout) */}
        <div className="flex flex-1 overflow-hidden">

          {/* LEFT: THE STAGE (65%) */}
          {/* Gray neutral background to emphasize the 3D object */}
          <div className="w-full lg:w-[65%] bg-slate-100 relative flex flex-col items-center justify-center p-8 overflow-y-auto">

            {/* Toolbar Overlay (Zoom/View Controls - Visual Only for now) */}
            <div className="absolute top-4 left-4 flex space-x-2">
              <div className="bg-white/80 backdrop-blur p-2 rounded-md shadow-sm text-xs text-gray-500 font-mono">
                STAGE_VIEW: 100%
              </div>
            </div>

            {/* The 3D Card */}
            <div className="relative z-0 transform transition-all duration-500">
              <CardStage
                templateId={selectedTemplate}
                recipientName={recipientName}
                senderName={senderName}
                customMessage={customMessage}
                selectedImage={selectedImage}
                selectedColors={selectedColors}
                stickers={stickers}
                onStickersChange={setStickers}
                onMessageChange={setCustomMessage}
                isDragging={isDragging}
              />
            </div>

            <p className="mt-8 text-sm text-gray-400 font-medium">
              Shift + Drag to rotate • Click to open
            </p>
          </div>

          {/* RIGHT: STUDIO CONTROLS (35%) */}
          <div className="w-full lg:w-[35%] bg-white border-l shadow-2xl z-20 flex flex-col min-w-[350px]">

            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col">

              {/* Tab Navigation */}
              <div className="px-4 pt-4 border-b">
                <TabsList className="w-full justify-start bg-transparent p-0 space-x-6">
                  <TabsTrigger
                    value="template"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-700 rounded-none px-0 pb-3 bg-transparent"
                  >
                    Template
                  </TabsTrigger>
                  <TabsTrigger
                    value="message"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-700 rounded-none px-0 pb-3 bg-transparent"
                  >
                    Message
                  </TabsTrigger>
                  <TabsTrigger
                    value="stickers"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-700 rounded-none px-0 pb-3 bg-transparent"
                  >
                    Stickers
                  </TabsTrigger>
                  <TabsTrigger
                    value="magic"
                    className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-700 rounded-none px-0 pb-3 bg-transparent flex items-center"
                  >
                    <Wand2 className="h-3 w-3 mr-1" />
                    Magic
                  </TabsTrigger>
                </TabsList>
              </div>

              {/* Scrollable Content Area */}
              <div className="flex-1 overflow-y-auto p-6 space-y-6">

                {/* --- TEMPLATE TAB --- */}
                <TabsContent value="template" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <h3 className="text-sm font-semibold text-gray-900 uppercase tracking-wider">Base Design</h3>
                    <div className="grid grid-cols-2 gap-3">
                      {templates.map((template) => {
                        const IconComponent = getTemplateIcon(template.id)
                        return (
                          <div
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`p - 3 rounded - xl border - 2 cursor - pointer transition - all flex flex - col items - center text - center space - y - 2 hover: bg - gray - 50 ${selectedTemplate === template.id ? 'border-purple-600 bg-purple-50/50' : 'border-gray-100'
                              } `}
                          >
                            <div className={`p - 2 rounded - full ${selectedTemplate === template.id ? 'bg-purple-100 text-purple-600' : 'bg-gray-100 text-gray-500'} `}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-medium">{template.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Custom Image Upload */}
                  <div className="space-y-3">
                    <Label>Cover Image</Label>
                    {selectedImage ? (
                      <div className="relative rounded-xl overflow-hidden border-2 border-gray-100">
                        <img src={selectedImage} alt="Selected" className="w-full h-32 object-cover" />
                        <button
                          onClick={() => setSelectedImage(null)}
                          className="absolute top-2 right-2 p-1.5 bg-white/90 rounded-full hover:bg-white text-red-500 transition-colors shadow-lg"
                          title="Remove Image"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <Dialog open={isPexelsOpen} onOpenChange={setIsPexelsOpen}>
                        <DialogTrigger asChild>
                          <div className="border-2 border-dashed border-gray-200 rounded-xl p-6 text-center hover:border-purple-300 transition-colors cursor-pointer group">
                            <div className="flex flex-col items-center space-y-2 text-gray-500 group-hover:text-purple-600">
                              <ImageIcon className="h-8 w-8" />
                              <span className="text-sm font-medium">Upload custom photo</span>
                              <span className="text-xs text-gray-400">Drag & drop or click to browse</span>
                            </div>
                          </div>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Select Image</DialogTitle>
                          </DialogHeader>
                          <ImageSelector
                            onSelectImage={(url) => {
                              setSelectedImage(url)
                              setIsPexelsOpen(false)
                            }}
                          />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  {/* Colors (Simplified) */}
                  <div className="space-y-3">
                    <Label>Color Palette</Label>
                    {colorPalettes.map((palette) => (
                      <div
                        key={palette.name}
                        onClick={() => setSelectedColors({
                          primary: palette.primary,
                          secondary: palette.secondary,
                          accent: palette.accent
                        })}
                        className={`p - 2 rounded - xl border - 2 cursor - pointer transition - all duration - 200 ${selectedColors.primary === palette.primary
                          ? 'border-purple-500 bg-purple-50'
                          : 'border-gray-100 hover:border-purple-300'
                          } `}
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-medium text-sm">{palette.name}</span>
                          <div className="flex space-x-1">
                            <div
                              className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: palette.primary }}
                            />
                            <div
                              className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: palette.secondary }}
                            />
                            <div
                              className="w-5 h-5 rounded-full border-2 border-white shadow-sm"
                              style={{ backgroundColor: palette.accent }}
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </TabsContent>

                {/* --- MESSAGE TAB --- */}
                <TabsContent value="message" className="space-y-6 mt-0">
                  {/* Live Text Input */}
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label>To</Label>
                        <Input
                          value={recipientName}
                          onChange={(e) => setRecipientName(e.target.value)}
                          placeholder="Recipient"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>From</Label>
                        <Input
                          value={senderName}
                          onChange={(e) => setSenderName(e.target.value)}
                          placeholder="You"
                        />
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label>Inside Message</Label>
                        <AIMessageGenerator
                          recipientName={recipientName}
                          onGenerate={setCustomMessage}
                        />
                      </div>
                      <p className="text-xs text-muted-foreground italic">
                        💡 Flip card in Edit Mode to write longer message
                      </p>
                    </div>
                  </div>
                </TabsContent>

                {/* --- STICKERS TAB --- */}
                <TabsContent value="stickers" className="space-y-6 mt-0 h-[500px]">
                  <StickerDrawer
                    isOpen={true}
                    onToggle={() => { }}
                  />
                </TabsContent>

                {/* --- MAGIC TAB --- */}
                <TabsContent value="magic" className="space-y-6 mt-0">
                  <div className="space-y-4">
                    <div className="flex items-center space-x-2 text-purple-600">
                      <Sparkles className="h-5 w-5" />
                      <h3 className="font-semibold">AI Brainstorm Assistant</h3>
                    </div>

                    <p className="text-sm text-gray-500">
                      Stuck on what to write? Tell us about the recipient and we'll craft the perfect message.
                    </p>

                    <BrainstormAssistant
                      recipientName={recipientName}
                      onApply={setCustomMessage}
                    />

                    <div className="pt-6 border-t">
                      <Label className="mb-3 block">Music & Atmosphere</Label>
                      <AudioController
                        onSelectTrack={(url) => {
                          setSelectedMusic(url)
                          // eslint-disable-next-line no-console
                          console.log('Selected music track:', url)
                        }}
                        autoPlayInPreview={false}
                      />
                    </div>
                  </div>
                </TabsContent>

              </div>
            </Tabs>
          </div>
        </div>
      </div>
    </DndContext>
  )
}
