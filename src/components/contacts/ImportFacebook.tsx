'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export function ImportFacebook() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    const isValidType = selectedFile.name.toLowerCase().endsWith('.zip') ||
                       selectedFile.name.toLowerCase().endsWith('.json');

    if (!isValidType) {
      toast.error('Please select a .zip or .json file from Facebook Data Download');
      return;
    }

    setFile(selectedFile);
  }, []);

  const handleUpload = useCallback(async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/facebook/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Contacts imported successfully');
        setFile(null);
      } else {
        toast.error('Failed to import contacts');
      }
    } catch (error) {
      toast.error('Upload failed');
      console.error(error);
    } finally {
      setIsUploading(false);
    }
  }, [file]);

  const handleGraphConnect = () => {
    window.location.href = '/api/import/facebook/start';
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import from Facebook</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            accept=".zip,.json"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Upload Facebook "Download Your Information" ZIP or JSON file
          </p>
        </div>

        {file && (
          <div className="space-y-4">
            <p className="text-sm">Selected: {file.name}</p>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Import Contacts'}
            </Button>
          </div>
        )}

        <div className="border-t pt-4">
          <p className="text-sm text-muted-foreground mb-2">
            Or connect with Facebook Graph API (limited to friends who also use the app)
          </p>
          <Button variant="outline" onClick={handleGraphConnect}>
            Connect with Facebook (Graph)
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
