'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Heart,
  Palette,
  Download,
  Share2,
  Sparkles,
  PartyPopper,
  Gift,
  Cake,
  Star,
  Wand2
} from "lucide-react"

export default function CardGeneratorPage() {
  const [selectedTemplate, setSelectedTemplate] = useState('birthday-blast')
  const [recipientName, setRecipientName] = useState('')
  const [senderName, setSenderName] = useState('')
  const [customMessage, setCustomMessage] = useState('Wishing you a day filled with happiness and a year filled with joy!')
  const [selectedColors, setSelectedColors] = useState({
    primary: '#ec4899',
    secondary: '#a855f7',
    accent: '#f59e0b'
  })

  const templates = [
    {
      id: 'birthday-blast',
      name: 'Birthday Blast',
      icon: PartyPopper,
      description: 'Vibrant and explosive birthday celebration',
      gradient: 'bg-gradient-to-r from-pink-500 to-purple-600'
    },
    {
      id: 'elegant-wishes',
      name: 'Elegant Wishes',
      icon: Heart,
      description: 'Sophisticated and classy birthday greeting',
      gradient: 'bg-gradient-to-r from-rose-500 to-pink-600'
    },
    {
      id: 'fun-party',
      name: 'Fun Party',
      icon: Gift,
      description: 'Playful and colorful party theme',
      gradient: 'bg-gradient-to-r from-yellow-400 to-orange-500'
    }
  ]

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

  const generateCard = () => {
    console.log('Generating card with:', {
      template: selectedTemplate,
      recipient: recipientName,
      sender: senderName,
      message: customMessage,
      colors: selectedColors
    })
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-gradient-to-r from-pink-500 to-purple-600 text-white mb-4">
            <Heart className="h-4 w-4 mr-2" />
            Most Popular Tool
          </Badge>
          <h1 className="text-5xl font-display font-bold text-purple-600 mb-4">
            Birthday Card Generator
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Create personalized, stunning birthday cards in minutes. Choose from beautiful templates
            and customize every detail to make it perfect.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8">
          {/* Card Customization Panel */}
          <div className="lg:col-span-1 space-y-6">
            {/* Template Selection */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Sparkles className="h-5 w-5 mr-2 text-orange-500" />
                  Choose Template
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    onClick={() => setSelectedTemplate(template.id)}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedTemplate === template.id
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <div className="flex items-center space-x-3">
                      <div className={`p-2 rounded-lg ${template.gradient} text-white`}>
                        <template.icon className="h-5 w-5" />
                      </div>
                      <div>
                        <h4 className="font-semibold">{template.name}</h4>
                        <p className="text-sm text-muted-foreground">{template.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Card Details */}
            <Card>
              <CardHeader>
                <CardTitle>Card Details</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <label className="text-sm font-medium mb-2 block">Recipient Name</label>
                  <Input
                    placeholder="Enter recipient's name"
                    value={recipientName}
                    onChange={(e) => setRecipientName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Your Name</label>
                  <Input
                    placeholder="Enter your name"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>
                <div>
                  <label className="text-sm font-medium mb-2 block">Custom Message</label>
                  <textarea
                    className="w-full p-3 border border-gray-300 rounded-lg resize-none focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                    rows={3}
                    placeholder="Write your birthday message..."
                    value={customMessage}
                    onChange={(e) => setCustomMessage(e.target.value)}
                  />
                </div>
              </CardContent>
            </Card>

            {/* Color Palette */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Palette className="h-5 w-5 mr-2 text-green-500" />
                  Color Palette
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {colorPalettes.map((palette) => (
                  <div
                    key={palette.name}
                    onClick={() => setSelectedColors({
                      primary: palette.primary,
                      secondary: palette.secondary,
                      accent: palette.accent
                    })}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all ${
                      selectedColors.primary === palette.primary
                        ? 'border-orange-500 bg-orange-50'
                        : 'border-gray-200 hover:border-pink-300'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-medium">{palette.name}</span>
                      <div className="flex space-x-1">
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: palette.primary }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: palette.secondary }}
                        />
                        <div
                          className="w-6 h-6 rounded-full border-2 border-white shadow-sm"
                          style={{ backgroundColor: palette.accent }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Card Preview */}
          <div className="lg:col-span-2">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center">
                    <Star className="h-5 w-5 mr-2 text-yellow-500" />
                    Card Preview
                  </span>
                  <div className="flex space-x-2">
                    <Button size="sm" variant="outline">
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                    <Button size="sm" variant="outline">
                      <Share2 className="h-4 w-4 mr-2" />
                      Share
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {/* Birthday Card Preview */}
                <div
                  className="relative aspect-[3/4] bg-white rounded-xl shadow-2xl overflow-hidden"
                  style={{
                    background: `linear-gradient(135deg, ${selectedColors.primary}, ${selectedColors.secondary})`
                  }}
                >
                  <div className="absolute inset-0 p-8 flex flex-col justify-between text-white">
                    {/* Header with decorations */}
                    <div className="text-center">
                      <div className="flex justify-center items-center space-x-2 mb-4">
                        <PartyPopper className="h-8 w-8" style={{ color: selectedColors.accent }} />
                        <Cake className="h-10 w-10" style={{ color: selectedColors.accent }} />
                        <Gift className="h-8 w-8" style={{ color: selectedColors.accent }} />
                      </div>
                      <h2 className="text-4xl font-display font-bold mb-2">Happy Birthday</h2>
                      {recipientName && (
                        <h3 className="text-3xl font-display font-semibold" style={{ color: selectedColors.accent }}>
                          {recipientName}!
                        </h3>
                      )}
                    </div>

                    {/* Message */}
                    <div className="text-center px-4">
                      <p className="text-lg leading-relaxed">
                        {customMessage}
                      </p>
                    </div>

                    {/* Footer */}
                    <div className="text-center">
                      {senderName && (
                        <p className="text-lg font-medium" style={{ color: selectedColors.accent }}>
                          From: {senderName}
                        </p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Generate Button */}
                <div className="mt-6 text-center">
                  <Button
                    onClick={generateCard}
                    size="lg"
                    className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white text-lg px-8 py-3"
                  >
                    <div className="flex items-center space-x-2">
                      <Wand2 className="h-5 w-5" />
                      <span>Generate Animated Card</span>
                    </div>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}