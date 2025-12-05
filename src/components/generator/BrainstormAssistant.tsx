import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Sparkles, Loader2, Lightbulb, Wand2 } from 'lucide-react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

interface BrainstormAssistantProps {
    recipientName: string
    onApply: (message: string) => void
}

export function BrainstormAssistant({ recipientName, onApply }: BrainstormAssistantProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [aiResult, setAiResult] = useState('')
    const { toast } = useToast()
    const [formData, setFormData] = useState({
        relationship: 'friend',
        tone: 'heartfelt',
        interests: '',
        context: ''
    })

    const handleGenerate = async () => {
        setLoading(true)
        setAiResult('')
        try {
            const { data, error } = await supabase.functions.invoke('generate-text', {
                body: {
                    recipientName: recipientName || formData.relationship,
                    relationship: formData.relationship,
                    tone: formData.tone,
                    interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
                    customInstructions: formData.context,
                    occasion: 'Birthday'
                }
            })

            if (error) {
                console.error('Generation error:', error)
                toast({
                    title: 'Generation Failed',
                    description: error.message || 'Failed to generate ideas. Please try again.',
                    variant: 'destructive'
                })
                throw error
            }

            if (data?.content) {
                setAiResult(data.content)
                toast({
                    title: '✨ Ideas Generated!',
                    description: 'AI created some personalized suggestions for you.'
                })
            }
        } catch (error) {
            console.error('Generation failed:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleApplyToCard = () => {
        if (aiResult) {
            onApply(aiResult)
            setIsOpen(false)
            toast({
                title: '✅ Applied to Card',
                description: 'Message updated with AI suggestion.'
            })
        }
    }

    return (
        <>
            {/* Floating Action Button */}
            <Button
                onClick={() => setIsOpen(true)}
                className="fixed bottom-6 right-6 z-50 h-16 w-16 rounded-full shadow-2xl bg-gradient-to-br from-purple-500 via-pink-500 to-orange-400 hover:from-purple-600 hover:via-pink-600 hover:to-orange-500 transition-all duration-300 hover:scale-110"
                size="icon"
                title="Magical Assistant - Get AI help with your card"
            >
                <Sparkles className="h-7 w-7 text-white" />
            </Button>

            {/* Dialog */}
            <Dialog open={isOpen} onOpenChange={setIsOpen}>
                <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
                    <DialogHeader>
                        <DialogTitle className="flex items-center gap-3 text-2xl">
                            <div className="p-2 rounded-lg bg-gradient-to-br from-purple-500 to-pink-500">
                                <Wand2 className="h-6 w-6 text-white" />
                            </div>
                            Magical Assistant
                        </DialogTitle>
                        <p className="text-sm text-muted-foreground mt-2">
                            Tell me about {recipientName || 'them'} and I'll help brainstorm the perfect message or gift idea! ✨
                        </p>
                    </DialogHeader>

                    <div className="space-y-6 py-4">
                        {/* Form Inputs */}
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <Label>Relationship</Label>
                                <Select
                                    value={formData.relationship}
                                    onValueChange={(v) => setFormData(prev => ({ ...prev, relationship: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="friend">Friend</SelectItem>
                                        <SelectItem value="family">Family</SelectItem>
                                        <SelectItem value="partner">Partner</SelectItem>
                                        <SelectItem value="coworker">Coworker</SelectItem>
                                        <SelectItem value="acquaintance">Acquaintance</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Tone</Label>
                                <Select
                                    value={formData.tone}
                                    onValueChange={(v) => setFormData(prev => ({ ...prev, tone: v }))}
                                >
                                    <SelectTrigger>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="heartfelt">Heartfelt</SelectItem>
                                        <SelectItem value="funny">Funny</SelectItem>
                                        <SelectItem value="poetic">Poetic</SelectItem>
                                        <SelectItem value="witty">Witty</SelectItem>
                                        <SelectItem value="casual">Casual</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label>Interests / Hobbies <span className="text-xs text-muted-foreground">(comma separated)</span></Label>
                            <Input
                                placeholder="e.g. hiking, photography, coffee"
                                value={formData.interests}
                                onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                            />
                        </div>

                        <div className="space-y-2">
                            <Label>Any other context? <span className="text-xs text-muted-foreground">(optional)</span></Label>
                            <Textarea
                                placeholder="e.g. They just started a new job, love adventure travel..."
                                value={formData.context}
                                onChange={(e) => setFormData(prev => ({ ...prev, context: e.target.value }))}
                                rows={3}
                            />
                        </div>

                        {/* Generate Button */}
                        <Button
                            onClick={handleGenerate}
                            disabled={loading || !formData.interests.trim()}
                            className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                            size="lg"
                        >
                            {loading ? (
                                <>
                                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                                    Thinking...
                                </>
                            ) : (
                                <>
                                    <Lightbulb className="h-5 w-5 mr-2" />
                                    Brainstorm Ideas
                                </>
                            )}
                        </Button>

                        {/* AI Result */}
                        {aiResult && (
                            <div className="mt-6 space-y-4">
                                <div className="p-4 bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 rounded-lg">
                                    <div className="flex items-center gap-2 mb-3">
                                        <Sparkles className="h-5 w-5 text-purple-600" />
                                        <h4 className="font-semibold text-purple-900">AI Suggestion:</h4>
                                    </div>
                                    <p className="text-gray-800 whitespace-pre-wrap leading-relaxed">{aiResult}</p>
                                </div>

                                <div className="flex gap-3">
                                    <Button
                                        onClick={handleApplyToCard}
                                        className="flex-1 bg-gradient-to-r from-emerald-500 to-green-600 hover:from-emerald-600 hover:to-green-700 text-white"
                                    >
                                        <Wand2 className="h-4 w-4 mr-2" />
                                        Apply to Card
                                    </Button>
                                    <Button
                                        onClick={() => handleGenerate()}
                                        variant="outline"
                                        className="flex-1"
                                    >
                                        <Sparkles className="h-4 w-4 mr-2" />
                                        Try Again
                                    </Button>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    )
}
