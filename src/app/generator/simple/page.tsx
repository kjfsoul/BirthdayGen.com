"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { FONT_MAP } from "@/lib/fonts";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { toast } from "sonner";

// Get the font keys from the FONT_MAP
const fontOptions = Object.keys(FONT_MAP);

export default function SimpleGeneratorPage() {
  const router = useRouter();
  const [message, setMessage] = useState("Happy Birthday! Wishing you all the best.");
  const [backgroundColor, setBackgroundColor] = useState("#FFE8B5");
  const [fontFamily, setFontFamily] = useState("system");
  const [textColor, setTextColor] = useState("#0B0B0E"); // A sensible default text color
  const [isSaving, setIsSaving] = useState(false);
  const [isSendDialogOpen, setIsSendDialogOpen] = useState(false);
  const [recipientEmail, setRecipientEmail] = useState("");
  const [isSending, setIsSending] = useState(false);
  const [savedCardId, setSavedCardId] = useState<number | null>(null);

  const handleSave = async () => {
    setIsSaving(true);
    const payload = {
      message,
      styles: {
        backgroundColor,
        textColor,
        fontFamily,
        fontSize: 32, // As per the example payload
        textAlign: "center",
      },
    };

    try {
      const res = await fetch('/api/cards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
     if (!res.ok) {
       const errorData = await res.json();
       console.error("Save failed:", errorData);
       toast.error("Failed to save the card. Please check the console for details.");
       return;
     }

     const created = await res.json();
      toast.success("Card saved successfully!");
      setSavedCardId(created.id);
      setIsSendDialogOpen(true);
    } catch (error) {
      console.error("An unexpected error occurred:", error);
      toast.error("An unexpected error occurred while saving.");
    } finally {
      setIsSaving(false);
    }
  };

  const selectedFontCss = FONT_MAP[fontFamily as keyof typeof FONT_MAP];

  const handleSendCard = async () => {
    if (!savedCardId || !recipientEmail.trim()) {
      toast.error("Please provide a recipient email address");
      return;
    }

    setIsSending(true);
    try {
      const response = await fetch(`/api/cards/${savedCardId}/send`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ recipientEmail: recipientEmail.trim() }),
      });

      if (response.ok) {
        toast.success("Card sent successfully!");
        setIsSendDialogOpen(false);
        setRecipientEmail("");
      } else {
        const errorData = await response.json();
        toast.error(errorData.error || "Failed to send card");
      }
    } catch (error) {
      console.error("Error sending card:", error);
      toast.error("Failed to send card");
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="container mx-auto p-4 grid grid-cols-1 md:grid-cols-2 gap-8">
      {/* Editor Form */}
      <div className="space-y-6">
        <h1 className="text-2xl font-bold">Create Your Card</h1>

        <div>
          <label htmlFor="message" className="block text-sm font-medium text-gray-700">Message</label>
          <Textarea
            id="message"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter your card message"
            className="mt-1"
            rows={5}
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Background Color</label>
          <div className="flex items-center gap-2 mt-1">
            <Input
              type="color"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="h-10 w-10 p-1 border rounded-md"
            />
            <Input
              type="text"
              value={backgroundColor}
              onChange={(e) => setBackgroundColor(e.target.value)}
              className="max-w-xs"
              placeholder="#FFE8B5"
            />
          </div>
        </div>

        <div>
          <label htmlFor="fontFamily" className="block text-sm font-medium text-gray-700">Font Style</label>
          <Select value={fontFamily} onValueChange={setFontFamily}>
            <SelectTrigger id="fontFamily" className="mt-1">
              <SelectValue placeholder="Select a font" />
            </SelectTrigger>
            <SelectContent>
              {fontOptions.map((font) => (
                <SelectItem key={font} value={font} style={{ fontFamily: FONT_MAP[font as keyof typeof FONT_MAP] }}>
                  {font.charAt(0).toUpperCase() + font.slice(1)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button onClick={handleSave} disabled={isSaving}>
          {isSaving ? "Saving..." : "Save and Select Recipients"}
        </Button>
      </div>

      {/* Live Preview */}
      <div className="flex flex-col items-center justify-center">
        <h2 className="text-xl font-semibold mb-4">Live Preview</h2>
        <Card className="w-full aspect-[5/7] flex items-center justify-center p-6 transition-all duration-200">
          <CardContent
            className="w-full h-full flex items-center justify-center text-center"
            style={{
              backgroundColor: backgroundColor,
              fontFamily: selectedFontCss,
              color: textColor,
              fontSize: '32px',
              textAlign: 'center'
            }}
          >
            <p>{message}</p>
          </CardContent>
        </Card>
      </div>

      {/* Send Card Dialog */}
      <Dialog open={isSendDialogOpen} onOpenChange={setIsSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send Card</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label htmlFor="recipient-email">Recipient Email</Label>
              <Input
                id="recipient-email"
                type="email"
                value={recipientEmail}
                onChange={(e) => setRecipientEmail(e.target.value)}
                placeholder="Enter recipient's email address"
              />
            </div>
            <div className="flex gap-2">
              <Button onClick={handleSendCard} disabled={isSending}>
                {isSending ? "Sending..." : "Send Card"}
              </Button>
              <Button
                variant="outline"
                onClick={() => setIsSendDialogOpen(false)}
                disabled={isSending}
              >
                Cancel
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
