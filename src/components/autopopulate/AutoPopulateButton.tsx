/* eslint-disable @typescript-eslint/no-explicit-any */
'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Sparkles, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/lib/supabase/client';

interface AutoPopulateButtonProps {
  contactIds?: string[]; // Optional: specific contacts to enrich (UUIDs)
  onEnrichmentStart?: () => void;
  onEnrichmentComplete?: (success: boolean, count: number) => void;
  onEnrichmentError?: (error: string) => void;
  disabled?: boolean;
  className?: string;
}

/**
 * AutoPopulateButton - Trigger button for contact enrichment
 *
 * Features:
 * - Loading states with spinner
 * - Disabled state handling
 * - Success/error feedback via toast
 * - Callback hooks for parent components
 * - Optional contact filtering
 */
export function AutoPopulateButton({
  contactIds,
  onEnrichmentStart,
  onEnrichmentComplete,
  onEnrichmentError,
  disabled = false,
  className = '',
}: AutoPopulateButtonProps) {
  const [isEnriching, setIsEnriching] = useState(false);

  const handleEnrich = async () => {
    try {
      setIsEnriching(true);
      onEnrichmentStart?.();

      // Get current user
      const { data: { user }, error: authError } = await supabase.auth.getUser();

      if (authError || !user) {
        throw new Error('You must be logged in to enrich contacts');
      }

      // Fetch contacts to enrich
      const contactsResponse = await fetch('/api/contacts');
      if (!contactsResponse.ok) {
        throw new Error('Failed to fetch contacts');
      }

      const { contacts } = await contactsResponse.json();

      // Filter contacts if specific IDs provided
      const contactsToEnrich = contactIds
        ? contacts.filter((c: any) => contactIds.includes(c.id))
        : contacts;

      if (contactsToEnrich.length === 0) {
        toast.info('No contacts to enrich');
        setIsEnriching(false);
        return;
      }

      // Call auto-populate API
      const enrichResponse = await fetch('/api/autopopulate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-user-id': user.id,
        },
        body: JSON.stringify({
          contacts: contactsToEnrich.map((c: any) => ({
            id: c.id,
            fullName: c.name || c.fullName,
            emails: c.emails || [],
            birthday: c.birthday,
            gender: c.gender,
            urls: c.urls || [],
            photoUrl: c.photoUrl,
            social_handles: c.social_handles || {},
            interests: c.interests || {},
          })),
          options: {
            predictBirthday: true,
            inferRelationship: true,
            tagArchetypes: true,
            generateGiftingProfile: true,
          },
        }),
      });

      if (!enrichResponse.ok) {
        const errorData = await enrichResponse.json();
        throw new Error(errorData.error?.message || 'Enrichment failed');
      }

      const result = await enrichResponse.json();

      // Success feedback
      toast.success(`Successfully enriched ${result.data?.length || 0} contacts!`);
      onEnrichmentComplete?.(true, result.data?.length || 0);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'An unknown error occurred';
      toast.error(`Enrichment failed: ${errorMessage}`);
      onEnrichmentError?.(errorMessage);
      onEnrichmentComplete?.(false, 0);
    } finally {
      setIsEnriching(false);
    }
  };

  return (
    <Button
      onClick={handleEnrich}
      disabled={disabled || isEnriching}
      className={`gap-2 ${className}`}
      size="lg"
    >
      {isEnriching ? (
        <>
          <Loader2 className="h-5 w-5 animate-spin" />
          <span>Enriching Contacts...</span>
        </>
      ) : (
        <>
          <Sparkles className="h-5 w-5" />
          <span>Auto-Populate Contacts</span>
        </>
      )}
    </Button>
  );
}
