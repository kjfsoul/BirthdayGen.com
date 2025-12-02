'use client';

import { useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import Link from 'next/link';

interface Contact {
  id: string;
  fullName: string;
  emails: string[];
  birthday?: string;
  categoryIds: string[];
}

interface Category {
  id: string;
  name: string;
}

export function ContactList() {
  const [contacts, setContacts] = useState<Contact[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMonth, setSelectedMonth] = useState<string>('all');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [loading, setLoading] = useState(true);

  const [userId, setUserId] = useState<string | null>(null);
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  useEffect(() => {
    const getUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session) {
        setUserId(session.user.id);
      }
    };
    getUser();
  }, [supabase.auth]);

  const fetchContacts = useCallback(async () => {
    if (!userId) return;
    try {
      const params = new URLSearchParams({ userId });
      const response = await fetch(`/api/contacts?${params}`);
      if (response.ok) {
        const data = await response.json();
        setContacts(data);
      }
    } catch (error) {
      console.error('Failed to fetch contacts', error);
    } finally {
      setLoading(false);
    }
  }, [userId]);

  const filteredContacts = contacts.filter(contact => {
    const searchMatch = contact.fullName.toLowerCase().includes(search.toLowerCase());
    const categoryMatch =
      selectedCategories.length === 0 ||
      selectedCategories.every(catId => contact.categoryIds.includes(catId));
    const monthMatch =
      !selectedMonth || selectedMonth === 'all' ||
      (contact.birthday && new Date(contact.birthday).getMonth() === parseInt(selectedMonth, 10) - 1);
    return searchMatch && categoryMatch && monthMatch;
  });

  const fetchCategories = useCallback(async () => {
    if (!userId) return;
    try {
      const response = await fetch(`/api/categories?userId=${userId}`);
      if (response.ok) {
        const data = await response.json();
        setCategories(data);
      }
    } catch (error) {
      console.error('Failed to fetch categories', error);
    }
  }, [userId]);

  useEffect(() => {
    if (userId) {
      fetchCategories();
    }
  }, [userId, fetchCategories]);

  useEffect(() => {
    const timer = setTimeout(() => {
      fetchContacts();
    }, 300); // Debounce 300ms

    return () => clearTimeout(timer);
  }, [fetchContacts]);

  const handleAddCategory = async () => {
    if (!newCategoryName.trim() || !userId) return;

    try {
      const response = await fetch('/api/categories', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId, name: newCategoryName }),
      });

      if (response.ok) {
        setNewCategoryName('');
        setIsDialogOpen(false);
        fetchCategories();
      }
    } catch (error) {
      console.error('Failed to add category', error);
    }
  };

  const getCategoryNames = (categoryIds: string[]) => {
    return categoryIds.map(id => categories.find(c => c.id === id)?.name).filter(Boolean);
  };

  if (loading) {
    return <div>Loading contacts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-4 items-center">
        <div className="flex-1 min-w-64">
          <Input
            placeholder="Search contacts..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>

        <Select value={selectedMonth} onValueChange={setSelectedMonth}>
          <SelectTrigger className="w-40">
            <SelectValue placeholder="All months" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All months</SelectItem>
            {Array.from({ length: 12 }, (_, i) => (
              <SelectItem key={i + 1} value={(i + 1).toString()}>
                {new Date(0, i).toLocaleString('default', { month: 'long' })}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline">Add Category</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Category</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="category-name">Category Name</Label>
                <Input
                  id="category-name"
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  placeholder="e.g., Family, Friends"
                />
              </div>
              <Button onClick={handleAddCategory}>Add Category</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Badge
            key={category.id}
            variant={selectedCategories.includes(category.id) ? 'default' : 'secondary'}
            className="cursor-pointer"
            onClick={() => {
              setSelectedCategories(prev =>
                prev.includes(category.id)
                  ? prev.filter(id => id !== category.id)
                  : [...prev, category.id]
              );
            }}
          >
            {category.name}
          </Badge>
        ))}
      </div>

      {/* Contact List */}
      <div className="grid gap-4">
        {filteredContacts.map(contact => (
          <Card key={contact.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>{contact.fullName}</span>
                <Link href={`/gifts?contactId=${contact.id}`}>
                  <Button variant="outline" size="sm">Gift Ideas</Button>
                </Link>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <p className="text-sm text-muted-foreground">
                  {contact.emails.join(', ')}
                </p>
                {contact.birthday && (
                  <p className="text-sm">
                    Birthday: {new Date(contact.birthday).toLocaleDateString()}
                  </p>
                )}
                <div className="flex flex-wrap gap-1">
                  {getCategoryNames(contact.categoryIds).map(name => (
                    <Badge key={name} variant="outline">{name}</Badge>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        {filteredContacts.length === 0 && (
          <p className="text-center text-muted-foreground">No contacts found</p>
        )}
      </div>
    </div>
  );
}
