# Auto-Populate Components

Complete UI implementation for the Auto-Populate Contact Enrichment feature.

## Components

### 1. AutoPopulateButton
**File:** `AutoPopulateButton.tsx`

Trigger button to start contact enrichment process.

**Props:**
```typescript
interface AutoPopulateButtonProps {
  contactIds?: number[];              // Optional: filter specific contacts
  onEnrichmentStart?: () => void;     // Callback when enrichment starts
  onEnrichmentComplete?: (success: boolean, count: number) => void;
  onEnrichmentError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}
```

**Usage:**
```tsx
import { AutoPopulateButton } from '@/components/autopopulate';

<AutoPopulateButton
  onEnrichmentStart={() => console.log('Starting...')}
  onEnrichmentComplete={(success, count) => {
    console.log(`Completed: ${count} contacts`);
  }}
/>
```

---

### 2. AutoPopulateProgress
**File:** `AutoPopulateProgress.tsx`

Display enrichment progress with states and stats.

**Props:**
```typescript
interface AutoPopulateProgressProps {
  status: 'idle' | 'running' | 'complete' | 'error';
  progress: number;                   // 0-100
  totalContacts: number;
  processedContacts: number;
  successCount: number;
  errorCount: number;
  currentContact?: string;            // Name of current contact
  errorMessage?: string;
  onCancel?: () => void;
  onRetry?: () => void;
  onClose?: () => void;
}
```

**Usage:**
```tsx
import { AutoPopulateProgress } from '@/components/autopopulate';

<AutoPopulateProgress
  status="running"
  progress={45}
  totalContacts={100}
  processedContacts={45}
  successCount={42}
  errorCount={3}
  currentContact="John Doe"
  onCancel={() => console.log('Cancelled')}
/>
```

---

### 3. EnrichedContactsDisplay
**File:** `EnrichedContactsDisplay.tsx`

Display enriched contacts in a detailed table with expandable rows.

**Props:**
```typescript
interface EnrichedContactsDisplayProps {
  contacts: EnrichedContact[];
  onEditContact?: (contact: EnrichedContact) => void;
  onAcceptContact?: (contactId: number) => void;
  onRejectContact?: (contactId: number) => void;
  className?: string;
}
```

**Features:**
- Visual indicators for inferred vs confirmed data
- Confidence scores with color coding
- Tooltips with reasoning
- Archetype tags
- Gifting profiles
- Expandable rows for details

**Usage:**
```tsx
import { EnrichedContactsDisplay } from '@/components/autopopulate';

<EnrichedContactsDisplay
  contacts={enrichedContacts}
  onEditContact={(contact) => openEditModal(contact)}
  onAcceptContact={(id) => acceptContact(id)}
/>
```

---

### 4. BulkContactControls
**File:** `BulkContactControls.tsx`

Bulk operations for enriched contacts.

**Props:**
```typescript
interface BulkContactControlsProps {
  enrichedContacts: EnrichedContact[];
  selectedContactIds?: number[];
  onAcceptAll?: () => Promise<void>;
  onRejectAll?: () => Promise<void>;
  onSaveToDatabase?: (contacts: EnrichedContact[]) => Promise<void>;
  onReset?: () => void;
  disabled?: boolean;
  className?: string;
}
```

**Features:**
- Bulk accept/reject operations
- Save to database
- Confidence statistics
- Confirmation dialogs
- Warning messages for low confidence

**Usage:**
```tsx
import { BulkContactControls } from '@/components/autopopulate';

<BulkContactControls
  enrichedContacts={contacts}
  onAcceptAll={async () => { /* accept logic */ }}
  onRejectAll={async () => { /* reject logic */ }}
  onSaveToDatabase={async (contacts) => { /* save logic */ }}
/>
```

---

## Main Page

**File:** `src/app/contacts/autopopulate/page.tsx`

Complete integration page that orchestrates all components together.

**Route:** `/contacts/autopopulate`

**Features:**
- Complete enrichment workflow
- Features overview
- Privacy notice
- Usage instructions
- State management
- Error handling

---

## Type Definitions

All types are imported from `@/lib/autopopulate/types.ts`:

```typescript
import type {
  EnrichedContact,
  EnrichmentMetadata,
  ContactInput,
  RelationshipType,
  Archetype,
  GiftingProfile,
  GiftingStyle,
} from '@/lib/autopopulate/types';
```

**Key Types:**

### EnrichedContact
```typescript
interface EnrichedContact extends ContactInput {
  enrichmentMetadata: EnrichmentMetadata;
  predictedBirthday?: {
    month?: number;
    day?: number;
    confidence: number;      // 0-100
    reasoning: string;
  };
  inferredRelationship?: {
    type: RelationshipType;
    confidence: number;      // 0-100
    reasoning: string;
  };
  archetypes?: Archetype[];
  giftingProfile?: GiftingProfile;
}
```

### EnrichmentStatus
```typescript
type EnrichmentStatus = 'idle' | 'running' | 'complete' | 'error';
```

---

## Integration with Contacts Page

Add auto-populate button to main contacts page:

```tsx
// src/app/contacts/page.tsx
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Sparkles } from 'lucide-react';

<Link href="/contacts/autopopulate">
  <Button className="gap-2" size="lg">
    <Sparkles className="h-5 w-5" />
    Auto-Populate
  </Button>
</Link>
```

---

## API Integration

### Required Endpoints

1. **POST /api/autopopulate**
   - Enriches contacts
   - Request body: `{ contacts: ContactInput[], options: {...} }`
   - Response: `{ success: boolean, data: EnrichedContact[] }`

2. **GET /api/contacts**
   - Fetches all contacts
   - Response: `{ contacts: Contact[] }`

3. **POST /api/contacts/bulk-update** (TODO)
   - Saves enriched contacts
   - Request body: `{ contacts: EnrichedContact[] }`
   - Response: `{ success: boolean, updated: number }`

---

## Styling

Uses **Tailwind CSS** with **shadcn/ui** components:

- Responsive design
- Dark mode support
- Accessible components
- Consistent spacing and colors

**Color Coding:**
- Green (≥80%): High confidence
- Yellow (60-79%): Medium confidence
- Red (<60%): Low confidence

---

## Dependencies

### Required Packages
- `next` (15.5.6+)
- `react` (19.2.0+)
- `lucide-react` (icons)
- `sonner` (toast notifications)

### shadcn/ui Components
- Button
- Card
- Badge
- Table
- Progress
- Tooltip
- AlertDialog
- Alert

---

## Accessibility

- Semantic HTML
- Keyboard navigation
- ARIA labels
- Color contrast (WCAG AA)
- Focus indicators
- Screen reader friendly

---

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- Mobile browsers

---

## Examples

### Complete Workflow Example

```tsx
'use client';

import { useState } from 'react';
import {
  AutoPopulateButton,
  AutoPopulateProgress,
  EnrichedContactsDisplay,
  BulkContactControls,
} from '@/components/autopopulate';
import type { EnrichmentStatus } from '@/components/autopopulate';
import type { EnrichedContact } from '@/lib/autopopulate/types';

export default function MyPage() {
  const [status, setStatus] = useState<EnrichmentStatus>('idle');
  const [contacts, setContacts] = useState<EnrichedContact[]>([]);
  const [progress, setProgress] = useState(0);

  return (
    <div className="space-y-6">
      <AutoPopulateButton
        onEnrichmentStart={() => setStatus('running')}
        onEnrichmentComplete={(success, count) => {
          setStatus(success ? 'complete' : 'error');
          setProgress(100);
          // Fetch enriched contacts
        }}
      />

      <AutoPopulateProgress
        status={status}
        progress={progress}
        totalContacts={100}
        processedContacts={progress}
        successCount={progress}
        errorCount={0}
      />

      {contacts.length > 0 && (
        <>
          <BulkContactControls
            enrichedContacts={contacts}
            onSaveToDatabase={async (contacts) => {
              // Save logic
            }}
          />

          <EnrichedContactsDisplay
            contacts={contacts}
            onEditContact={(contact) => {
              // Edit logic
            }}
          />
        </>
      )}
    </div>
  );
}
```

---

## Testing

Run component tests:
```bash
npm test -- --testPathPattern=autopopulate
```

Manual testing checklist:
- [ ] Button triggers enrichment
- [ ] Progress bar shows correctly
- [ ] Contacts display with correct data
- [ ] Tooltips show reasoning
- [ ] Bulk operations work
- [ ] Confirmation dialogs appear
- [ ] Error handling works
- [ ] Dark mode looks good

---

## Troubleshooting

### Button doesn't trigger enrichment
- Check API endpoint is running: `POST /api/autopopulate`
- Verify auth headers are set
- Check console for errors

### Progress not updating
- Ensure state management is correct
- Check callback functions are called
- Verify progress calculation

### Contacts not displaying
- Check `EnrichedContact` type matches API response
- Verify `enrichmentMetadata` exists
- Check console for type errors

### Tooltips not showing
- Ensure Tooltip component is installed
- Check z-index conflicts
- Verify TooltipProvider wraps components

---

## Support

For issues or questions:
1. Check this README
2. Review component source code
3. Check `/lib/autopopulate/types.ts` for type definitions
4. Review API documentation

---

**Version:** 1.0.0  
**Last Updated:** November 21, 2025  
**Maintainer:** DeepAgent
