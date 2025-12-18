import { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { EnrichedContact, RelationshipType } from '@/lib/autopopulate/types';

interface EditContactDialogProps {
  contact: EnrichedContact | null;
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedContact: EnrichedContact) => void;
}

export function EditContactDialog({ contact, isOpen, onClose, onSave }: EditContactDialogProps) {
  const [formData, setFormData] = useState<Partial<EnrichedContact>>({});
  const [birthdayMonth, setBirthdayMonth] = useState<string>('');
  const [birthdayDay, setBirthdayDay] = useState<string>('');
  const [birthdayYear, setBirthdayYear] = useState<string>('');

  useEffect(() => {
    if (contact) {
      setFormData({ ...contact });

      // Initialize birthday fields from predicted or existing birthday
      const bday = contact.birthday || (contact.predictedBirthday ? {
        month: contact.predictedBirthday.month,
        day: contact.predictedBirthday.day,
        year: undefined
      } : {});

      setBirthdayMonth(bday.month?.toString() || '');
      setBirthdayDay(bday.day?.toString() || '');
      setBirthdayYear(bday.year?.toString() || '');
    }
  }, [contact, isOpen]);

  const handleSave = () => {
    if (!contact) return;

    const updatedContact: EnrichedContact = {
      ...contact,
      ...formData,
      fullName: formData.fullName || contact.fullName,
      // Update birthday
      birthday: {
        month: birthdayMonth ? parseInt(birthdayMonth) : undefined,
        day: birthdayDay ? parseInt(birthdayDay) : undefined,
        year: birthdayYear ? parseInt(birthdayYear) : undefined,
      },
      // If we are editing, we might want to update the inferred relationship too if changed
      inferredRelationship: formData.inferredRelationship ? {
        ...formData.inferredRelationship,
        type: formData.inferredRelationship.type,
      } : contact.inferredRelationship
    };

    // If birthday is set manually, we might want to remove predictedBirthday so it shows as confirmed?
    // For now, let's keep the data structure as is and let the parent handle the logic of "confirming".
    // But realistically, if I edit it, I expect it to change.

    // If user sets a birthday, we should probably clear the predicted one so it shows as confirmed in the UI
    if (birthdayMonth && birthdayDay) {
        delete updatedContact.predictedBirthday;
    }

    onSave(updatedContact);
    onClose();
  };

  const handleRelationshipChange = (value: string) => {
    setFormData(prev => ({
      ...prev,
      inferredRelationship: {
        ...(prev.inferredRelationship || { confidence: 100, reasoning: 'User edited' }),
        type: value as RelationshipType,
        confidence: 100, // User confirmed
        reasoning: 'User edited'
      }
    }));
  };

  if (!contact) return null;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Edit Contact</DialogTitle>
          <DialogDescription>
            Make changes to the contact details here. Click save when you&apos;re done.
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              id="name"
              value={formData.fullName || ''}
              onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
              className="col-span-3"
            />
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="birthday" className="text-right">
              Birthday
            </Label>
            <div className="col-span-3 flex gap-2">
              <Select value={birthdayMonth} onValueChange={setBirthdayMonth}>
                <SelectTrigger className="w-[110px]">
                  <SelectValue placeholder="Month" />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 12 }, (_, i) => i + 1).map((m) => (
                    <SelectItem key={m} value={m.toString()}>
                      {new Date(0, m - 1).toLocaleString('default', { month: 'short' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              <Input
                placeholder="Day"
                value={birthdayDay}
                onChange={(e) => setBirthdayDay(e.target.value)}
                className="w-[70px]"
                type="number"
                min={1}
                max={31}
              />

              <Input
                placeholder="Year"
                value={birthdayYear}
                onChange={(e) => setBirthdayYear(e.target.value)}
                className="w-[80px]"
                type="number"
              />
            </div>
          </div>

          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="relationship" className="text-right">
              Relationship
            </Label>
            <Select
                value={formData.inferredRelationship?.type || RelationshipType.UNKNOWN}
                onValueChange={handleRelationshipChange}
            >
              <SelectTrigger className="col-span-3">
                <SelectValue placeholder="Select relationship" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={RelationshipType.FAMILY}>Family</SelectItem>
                <SelectItem value={RelationshipType.CLOSE_FRIEND}>Close Friend</SelectItem>
                <SelectItem value={RelationshipType.FRIEND}>Friend</SelectItem>
                <SelectItem value={RelationshipType.COLLEAGUE}>Colleague</SelectItem>
                <SelectItem value={RelationshipType.ACQUAINTANCE}>Acquaintance</SelectItem>
                <SelectItem value={RelationshipType.PROFESSIONAL}>Professional</SelectItem>
                <SelectItem value={RelationshipType.UNKNOWN}>Unknown</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button onClick={handleSave}>Save changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
