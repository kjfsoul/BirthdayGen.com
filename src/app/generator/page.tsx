/* eslint-disable no-console */
'use client'

import { useState, useCallback, useRef } from 'react'
import {
  DndContext,
  DragEndEvent,
  DragStartEvent,
  DragOverlay,
  useSensor,
  useSensors,
  PointerSensor,
  TouchSensor,
  MouseSensor
} from '@dnd-kit/core'
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import {
  Share2,
  Sparkles,
  PartyPopper,
  Gift,
  Image as ImageIcon,
  X,
  Wand2,
  Heart
} from "lucide-react"
import { SendCardDialog } from "@/components/card/SendCardDialog"
import { supabase } from "@/lib/supabase/client"
import { ImageSelector } from "@/components/images/ImageSelector"
import { BrainstormAssistant } from "@/components/generator/BrainstormAssistant"
import { CardStage, type Sticker } from "@/components/generator/CardStage"
import { StickerDrawer } from "@/components/generator/StickerDrawer"
import { AudioController } from "@/components/generator/AudioController"
import { AIMessageGenerator } from "@/components/generator/AIMessageGenerator"
import { getAllTemplates } from "@/config/templates" // Correct import - using getAllTemplates()
import { handleShare } from "@/lib/share"
import { useNavigate } from 'react-router-dom'
import { v4 as uuidv4 } from 'uuid'

export default function CardGeneratorPage() {
  const navigate = useNavigate()

  // --- STATE ---
  const [activeTab, setActiveTab] = useState('template')
  const [activeSticker, setActiveSticker] = useState<{ src: string } | null>(null) // For DragOverlay

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
  const templates = getAllTemplates() // Call the function to get the array

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

  // Sensors for better drag control
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 10 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 5 } }),
    useSensor(PointerSensor, { activationConstraint: { distance: 10 } })
  )

  // --- ACTIONS ---

  const handleDragStart = useCallback((event: DragStartEvent) => {
    setIsDragging(true)
    const { active } = event
    if (active.data.current?.type === 'sticker') {
      setActiveSticker({ src: active.data.current.src })
    }
  }, [])

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setIsDragging(false)
    setActiveSticker(null)

    const { active, over } = event

    // Check if dropped on the card stage
    if (over?.id === 'card-stage-drop-zone') {
      // Find the ACTUAL card element to calculate relative position
      // Using a precise selector for the card's visual container
      const cardRectElement = document.getElementById('card-stage')

      if (cardRectElement) {
        const cardRect = cardRectElement.getBoundingClientRect()
        // Use the event.activatorEvent to get precise mouse/touch coordinates
        // DndKit event.delta is relative to start, but we want absolute screen coords to map to relative card coords
        // The safest standard way in DndKit modifers is usually to translate, but doing it manually here:

        // We rely on the pointer event from the activator if available, or we might need DndKit's detailed event data
        // DndKit doesn't easily give "client coordinates at drop" in the event object directly besides via modifiers
        // BUT, since we are calculating "drop", we can assume the mouse is *over* the drop zone.

        /*
           CRITICAL FIX:
           DndKit's `event` doesn't strictly provide `clientX/Y` of the drop easily without `activatorEvent`.
           We will use `active.rect.current.translated` which gives the final position of the dragged item on screen!
        */

        const headerOffset = 0 // If any
        const droppedRect = active.rect.current.translated

        if (droppedRect) {
          // Calculate center of dropped item
          const dropX = droppedRect.left + (droppedRect.width / 2)
          const dropY = droppedRect.top + (droppedRect.height / 2)

          // Convert to percentage relative to card
          const relativeX = ((dropX - cardRect.left) / cardRect.width) * 100
          const relativeY = ((dropY - cardRect.top) / cardRect.height) * 100

          // Clamp to ensure it stays roughly inside or near edges
          const x = Math.max(-10, Math.min(110, relativeX))
          const y = Math.max(-10, Math.min(110, relativeY))

          // Check if existing sticker
          const activeIdString = active.id.toString()
          const existingStickerId = activeIdString.startsWith('sticker-')
            ? activeIdString.replace('sticker-', '')
            : null

          // Logic to distinguish "Sticker Drawer Item" vs "Existing Sticker on Card"
          // The drawer items have IDs like `sticker-celebration-0` BUT existing stickers align with UUIDs
          // We need to differentiate.
          // In StickerDrawer we used `sticker-${category}-${index}`.
          // In CardStage we use `sticker-${uuid}`.
          // This collision `startsWith('sticker-')` is risky.
          // Let's assume Drawer Items have `data: { type: 'sticker' }`.
          // Existing items should have `data: { stickerId: ... }`.

          const isDrawerItem = active.data.current?.type === 'sticker'
          const activeData = active.data.current as any

          if (activeData?.stickerId) {
            // Reposition existing
            setStickers(prev => prev.map(s =>
              s.id === activeData.stickerId ? { ...s, x, y } : s
            ))
          } else if (isDrawerItem) {
            // New Sticker
            const newSticker: Sticker = {
              id: uuidv4(),
              x,
              y,
              src: activeData.src,
              scale: 1,
            }

            setStickers(prev => [...prev, newSticker])
          }
        }
      }
    }
  }, [])

  const playConfettiSound = useCallback(() => {
    try {
      if (!confettiAudioRef.current) {
        confettiAudioRef.current = new Audio('/sounds/confetti.mp3')
        confettiAudioRef.current.volume = 0.5
      }
      confettiAudioRef.current.currentTime = 0
      confettiAudioRef.current.play().catch(() => console.log('Audio play blocked'))
    } catch (e) {
      console.log('Confetti sound not available')
    }
  }, [])

  const generateCard = async () => {
    setIsGenerating(true)
    try {
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
            musicUrl: selectedMusic
          },
          status: 'draft'
        })
        .select()
        .single()

      if (error) throw error
      console.log('Card generated:', data)
      setGeneratedCardId(data.id)
      navigate(`/cards/${data.id}`)
    } catch (error) {
      console.error('Error generating card:', error)
    } finally {
      setIsGenerating(false)
    }
  }

  const getTemplateIcon = (templateId: string) => {
    switch (templateId) {
      case 'birthday-blast': return PartyPopper
      case 'elegant-wishes': return Heart
      case 'fun-party': return Gift
      default: return Sparkles
    }
  }

  return (
    <DndContext
      sensors={sensors}
      onDragStart={handleDragStart}
      onDragEnd={handleDragEnd}
    >
      <div className="flex flex-col h-screen bg-background text-foreground overflow-hidden font-sans">

        {/* 1. TOP BAR (Static) */}
        <header className="h-14 bg-white/80 backdrop-blur-md border-b flex items-center justify-between px-4 lg:px-6 shrink-0 z-50 shadow-sm">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-tr from-pink-500 to-purple-600 p-1.5 rounded-lg text-white shadow-md">
              <Sparkles className="h-4 w-4" />
            </div>
            <h1 className="text-lg font-bold bg-clip-text text-transparent bg-gradient-to-r from-gray-900 to-gray-600 hidden sm:block">
              Holiday Studio
            </h1>
            <Badge variant="secondary" className="text-xs">Beta</Badge>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => {
                setSelectedImage(null)
                setStickers([])
                setRecipientName('')
                setSenderName('')
                setCustomMessage('Wishing you a day filled with happiness!')
              }}
              className="text-gray-500 hover:text-red-500 text-xs sm:text-sm"
            >
              Reset
            </Button>
            <Button
              onClick={generateCard}
              disabled={isGenerating}
              size="sm"
              className="bg-black text-white hover:bg-gray-800 shadow-md transition-all hover:scale-105"
            >
              {isGenerating ? 'Saving...' : 'Save Draft'}
            </Button>
            <SendCardDialog
              cardId={generatedCardId}
              trigger={
                <Button variant="outline" size="sm" disabled={!generatedCardId} className="border-purple-200 text-purple-700 hover:bg-purple-50">
                  <Share2 className="h-3 w-3 mr-2" />
                  Send
                </Button>
              }
            />
          </div>
        </header>

        {/* 2. SPLIT SCREEN WORKSPACE */}
        <ResizablePanelGroup direction="horizontal" className="flex-1 min-h-0">

          {/* LEFT: THE STAGE (Canvas) */}
          <ResizablePanel defaultSize={65} minSize={30} className="bg-slate-50 relative">
            {/* Background Pattern for "Editor" Feel */}
            <div className="absolute inset-0 opacity-[0.03] pointer-events-none"
              style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '20px 20px' }}
            />

            <div className="w-full h-full flex flex-col items-center justify-center p-8 overflow-y-auto overflow-x-hidden">
              {/* View Controls Overlay */}
              <div className="absolute top-4 left-4 z-10">
                <Badge variant="outline" className="bg-white/90 shadow-sm font-mono text-xs">
                  STAGE_VIEW: 100%
                </Badge>
              </div>

              <div className="relative z-10 transition-all duration-300 ease-out transform shadow-2xl rounded-2xl">
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
              <p className="mt-6 text-xs text-gray-400 font-medium select-none">
                Shift + Drag to rotate • Click to open
              </p>
            </div>
          </ResizablePanel>

          <ResizableHandle withHandle />

          {/* RIGHT: STUDIO TOOLS */}
          <ResizablePanel defaultSize={35} minSize={20} className="bg-white border-l shadow-xl z-20 flex flex-col min-w-[320px]">
            <Tabs value={activeTab} onValueChange={setActiveTab} className="flex-1 flex flex-col min-h-0">
              {/* Header of Sidebar */}
              <div className="px-1 pt-2 border-b bg-white shrink-0">
                <TabsList className="w-full justify-start bg-transparent h-12 p-0 space-x-4 px-4 overflow-x-auto no-scrollbar">
                  <TabsTrigger value="template" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-900 text-gray-500 rounded-none px-2 pb-2 h-full bg-transparent font-medium text-sm">Template</TabsTrigger>
                  <TabsTrigger value="message" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-900 text-gray-500 rounded-none px-2 pb-2 h-full bg-transparent font-medium text-sm">Message</TabsTrigger>
                  <TabsTrigger value="stickers" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-900 text-gray-500 rounded-none px-2 pb-2 h-full bg-transparent font-medium text-sm">Stickers</TabsTrigger>
                  <TabsTrigger value="magic" className="data-[state=active]:border-b-2 data-[state=active]:border-purple-600 data-[state=active]:text-purple-900 text-gray-500 rounded-none px-2 pb-2 h-full bg-transparent font-medium text-sm flex items-center gap-1"><Wand2 className="w-3 h-3" /> Magic</TabsTrigger>
                </TabsList>
              </div>

              {/* Content of Sidebar - Scrollable */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-6">

                <TabsContent value="template" className="mt-0 space-y-8 outline-none animate-in fade-in slide-in-from-right-2 duration-300">
                  {/* Templates Grid */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Base Template</Label>
                    <div className="grid grid-cols-2 gap-3">
                      {templates.map((template) => {
                        const IconComponent = getTemplateIcon(template.id)
                        return (
                          <div
                            key={template.id}
                            onClick={() => setSelectedTemplate(template.id)}
                            className={`
                                                group relative p-3 rounded-xl border-2 cursor-pointer transition-all duration-200
                                                flex flex-col items-center text-center space-y-2
                                                ${selectedTemplate === template.id ? 'border-purple-600 bg-purple-50' : 'border-gray-100 hover:border-purple-200 hover:bg-gray-50'}
                                            `}
                          >
                            <div className={`p-2.5 rounded-full transition-colors ${selectedTemplate === template.id ? 'bg-purple-100 text-purple-600' : 'bg-white text-gray-400 group-hover:text-purple-500'} shadow-sm`}>
                              <IconComponent className="h-5 w-5" />
                            </div>
                            <span className="text-sm font-semibold text-gray-700">{template.name}</span>
                          </div>
                        )
                      })}
                    </div>
                  </div>

                  {/* Image Upload */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cover Photo</Label>
                    {selectedImage ? (
                      <div className="relative rounded-xl overflow-hidden border-2 border-purple-100 shadow-md group">
                        <img src={selectedImage} alt="Selected" className="w-full h-40 object-cover" />
                        <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                          <button
                            onClick={() => setSelectedImage(null)}
                            className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 transition-colors shadow-lg transform scale-90 group-hover:scale-100"
                          >
                            <X className="h-5 w-5" />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <Dialog open={isPexelsOpen} onOpenChange={setIsPexelsOpen}>
                        <DialogTrigger asChild>
                          <button className="w-full h-32 border-2 border-dashed border-gray-200 rounded-xl flex flex-col items-center justify-center gap-2 hover:border-purple-400 hover:bg-purple-50/30 transition-all group text-gray-400 hover:text-purple-600">
                            <ImageIcon className="h-8 w-8 opacity-50 group-hover:opacity-100 transition-opacity" />
                            <span className="text-sm font-medium">Upload custom photo</span>
                          </button>
                        </DialogTrigger>
                        <DialogContent className="sm:max-w-[600px]">
                          <DialogHeader>
                            <DialogTitle>Select Image</DialogTitle>
                          </DialogHeader>
                          <ImageSelector onSelectImage={(url) => { setSelectedImage(url); setIsPexelsOpen(false) }} />
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>

                  {/* Colors */}
                  <div className="space-y-3">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Theme Colors</Label>
                    <div className="space-y-2">
                      {colorPalettes.map((palette) => (
                        <div
                          key={palette.name}
                          onClick={() => setSelectedColors({ primary: palette.primary, secondary: palette.secondary, accent: palette.accent })}
                          className={`
                                                flex items-center justify-between p-3 rounded-lg border-2 cursor-pointer transition-all
                                                ${selectedColors.primary === palette.primary ? 'border-purple-500 bg-purple-50 shadow-sm' : 'border-gray-100 hover:border-purple-200'}
                                            `}
                        >
                          <span className="font-medium text-sm text-gray-700">{palette.name}</span>
                          <div className="flex -space-x-2">
                            {[palette.primary, palette.secondary, palette.accent].map((c, i) => (
                              <div key={i} className="w-6 h-6 rounded-full border-2 border-white shadow-sm" style={{ backgroundColor: c }} />
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="message" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className="space-y-4">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Who is it for?</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">Recipient</Label>
                        <Input value={recipientName} onChange={(e) => setRecipientName(e.target.value)} placeholder="e.g. Grandma" className="bg-gray-50/50" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-xs text-gray-500">From</Label>
                        <Input value={senderName} onChange={(e) => setSenderName(e.target.value)} placeholder="You" className="bg-gray-50/50" />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Message</Label>
                      <AIMessageGenerator recipientName={recipientName} onGenerate={setCustomMessage} />
                    </div>
                    <div className="relative">
                      <textarea
                        className="w-full min-h-[120px] p-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-purple-500 focus:ring-2 focus:ring-purple-200 transition-all resize-y text-sm leading-relaxed"
                        value={customMessage}
                        onChange={(e) => setCustomMessage(e.target.value)}
                      />
                    </div>
                    <p className="text-xs text-center text-gray-400 italic">
                      This text appears on the front. Flip the card to write more!
                    </p>
                  </div>
                </TabsContent>

                <TabsContent value="stickers" className="mt-0 h-full animate-in fade-in slide-in-from-right-2 duration-300">
                  {/* Sticker Drawer is now just the content */}
                  <StickerDrawer />
                </TabsContent>

                <TabsContent value="magic" className="mt-0 space-y-6 animate-in fade-in slide-in-from-right-2 duration-300">
                  <div className="bg-gradient-to-br from-purple-50 to-pink-50 p-4 rounded-xl border border-purple-100">
                    <div className="flex items-center gap-2 text-purple-700 mb-2">
                      <Sparkles className="w-4 h-4" />
                      <h3 className="font-semibold text-sm">AI Assistant</h3>
                    </div>
                    <p className="text-xs text-gray-600 mb-4">
                      Need creative help? Let our AI brainstorm ideas for messages, themes, and more.
                    </p>
                    <BrainstormAssistant recipientName={recipientName} onApply={setCustomMessage} />
                  </div>

                  <div className="space-y-3 pt-4 border-t">
                    <Label className="text-xs font-bold text-gray-400 uppercase tracking-widest">Background Music</Label>
                    <AudioController
                      onSelectTrack={(url) => setSelectedMusic(url)}
                      autoPlayInPreview={false}
                    />
                  </div>
                </TabsContent>
              </div>
            </Tabs>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* 3. GLOBAL DRAG OVERLAY (Higher Z-Index) */}
        <DragOverlay zIndex={100} dropAnimation={null}>
          {activeSticker ? (
            <div className="text-5xl pointer-events-none drop-shadow-2xl opacity-90 scale-110">
              {activeSticker.src}
            </div>
          ) : null}
        </DragOverlay>

      </div>
    </DndContext>
  )
}
