'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';

interface ParsedContact {
  fullName: string;
  emails: string[];
  birthday?: string;
}

export function ImportAppleVCF() {
  const [file, setFile] = useState<File | null>(null);
  const [contacts, setContacts] = useState<ParsedContact[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const parseVCF = useCallback((content: string): ParsedContact[] => {
    const contacts: ParsedContact[] = [];
    const vcards = content.split('BEGIN:VCARD');

    for (const vcard of vcards.slice(1)) {
      const lines = vcard.split('\n').map(line => line.trim());
      let fullName = '';
      const emails: string[] = [];
      let birthday = '';

      for (const line of lines) {
        if (line.startsWith('FN:')) {
          fullName = line.substring(3);
        } else if (line.startsWith('EMAIL')) {
          const email = line.split(':')[1];
          if (email) emails.push(email);
        } else if (line.startsWith('BDAY:')) {
          birthday = line.substring(5);
        }
      }

      if (fullName || emails.length > 0) {
        contacts.push({ fullName, emails, birthday: birthday || undefined });
      }
    }

    return contacts;
  }, []);

  const handleFileChange = useCallback(async (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.toLowerCase().endsWith('.vcf')) {
      toast.error('Please select a .vcf file');
      return;
    }

    setFile(selectedFile);

    try {
      const content = await selectedFile.text();
      const parsedContacts = parseVCF(content);
      setContacts(parsedContacts);
      toast.success(`Parsed ${parsedContacts.length} contacts`);
    } catch (error) {
      toast.error('Failed to parse VCF file');
      console.error(error);
    }
  }, [parseVCF]);

  const handleUpload = useCallback(async () => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('file', file);

      const response = await fetch('/api/import/apple/upload', {
        method: 'POST',
        body: formData,
      });

      if (response.ok) {
        toast.success('Contacts imported successfully');
        setFile(null);
        setContacts([]);
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

  return (
    <Card>
      <CardHeader>
        <CardTitle>Import from Apple Contacts</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Input
            type="file"
            accept=".vcf"
            onChange={handleFileChange}
            className="cursor-pointer"
          />
          <p className="text-sm text-muted-foreground mt-1">
            Select a .vcf file exported from Apple Contacts
          </p>
        </div>

        {contacts.length > 0 && (
          <div className="space-y-4">
            <h3 className="font-medium">Preview ({contacts.length} contacts)</h3>
            <div className="max-h-64 overflow-y-auto border rounded">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Name</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Birthday</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {contacts.slice(0, 10).map((contact, index) => (
                    <TableRow key={index}>
                      <TableCell>{contact.fullName}</TableCell>
                      <TableCell>{contact.emails.join(', ')}</TableCell>
                      <TableCell>{contact.birthday || '-'}</TableCell>
                    </TableRow>
                  ))}
                  {contacts.length > 10 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center text-muted-foreground">
                        ... and {contacts.length - 10} more
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            <Button onClick={handleUpload} disabled={isUploading}>
              {isUploading ? 'Uploading...' : 'Import Contacts'}
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
