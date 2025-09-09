'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function ImportMicrosoft() {
  const [isComingSoon, setIsComingSoon] = useState(false);

  const handleImport = async () => {
    try {
      const response = await fetch('/api/import/microsoft/start');
      if (response.status === 501) {
        setIsComingSoon(true);
      } else {
        window.location.href = '/api/import/microsoft/start';
      }
    } catch (error) {
      console.error('Failed to check Microsoft import status', error);
      setIsComingSoon(true);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import from Outlook</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground mb-4">
          Connect your Microsoft account to import contacts from Outlook.
        </p>
        {isComingSoon ? (
          <p className="text-sm text-orange-600 mb-4">Coming soon</p>
        ) : (
          <Button onClick={handleImport}>
            Connect Microsoft Account
          </Button>
        )}
      </CardContent>
    </Card>
  );
}
