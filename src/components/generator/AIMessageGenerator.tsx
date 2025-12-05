import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Sparkles, Loader2 } from "lucide-react";
import { supabase } from "@/lib/supabase/client";


interface AIMessageGeneratorProps {
    recipientName: string;
    onGenerate: (message: string) => void;
}

export function AIMessageGenerator({ recipientName, onGenerate }: AIMessageGeneratorProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        relationship: 'friend',
        tone: 'heartfelt',
        interests: '',
        memories: '',
        customInstructions: ''
    });

    const handleGenerate = async () => {
        setLoading(true);
        try {
            const { data, error } = await supabase.functions.invoke('generate-text', {
                body: {
                    recipientName: recipientName || 'Friend',
                    relationship: formData.relationship,
                    tone: formData.tone,
                    interests: formData.interests.split(',').map(s => s.trim()).filter(Boolean),
                    sharedMemories: formData.memories.split('\n').filter(Boolean),
                    customInstructions: formData.customInstructions,
                    occasion: 'Birthday'
                }
            });

            if (error) throw error;

            if (data?.content) {
                onGenerate(data.content);
                setIsOpen(false);
            }
        } catch (error) {
            console.error('Generation failed:', error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                <Button variant="ghost" size="sm" className="text-purple-600 hover:text-purple-700 hover:bg-purple-50">
                    <Sparkles className="h-4 w-4 mr-2" />
                    AI Assist
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle className="flex items-center gap-2">
                        <Sparkles className="h-5 w-5 text-purple-600" />
                        AI Message Writer
                    </DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-4">
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
                                </SelectContent>
                            </Select>
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label>Interests / Hobbies <span className="text-xs text-muted-foreground">(comma separated)</span></Label>
                        <Input
                            placeholder="e.g. Hiking, Sci-Fi, Cats"
                            value={formData.interests}
                            onChange={(e) => setFormData(prev => ({ ...prev, interests: e.target.value }))}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label>Shared Memory <span className="text-xs text-muted-foreground">(optional)</span></Label>
                        <Textarea
                            placeholder="Remember that time we..."
                            value={formData.memories}
                            onChange={(e) => setFormData(prev => ({ ...prev, memories: e.target.value }))}
                        />
                    </div>

                    <Button
                        onClick={handleGenerate}
                        disabled={loading}
                        className="w-full bg-gradient-to-r from-purple-600 to-pink-600 text-white"
                    >
                        {loading ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Writing Magic...
                            </>
                        ) : (
                            <>
                                <Sparkles className="h-4 w-4 mr-2" />
                                Generate Message
                            </>
                        )}
                    </Button>
                </div>
            </DialogContent>
        </Dialog>
    );
}
