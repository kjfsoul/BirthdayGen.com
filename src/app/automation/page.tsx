'use client'

import { useState } from 'react'
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Users,
  Calendar,
  Gift,
  Mail,
  Bot,
  Sparkles,
  Plus,
  Edit,
  Settings,
  Bell,
  Heart,
  Clock,
  Zap,
  Wand2
} from "lucide-react"

interface Contact {
  id: string
  name: string
  email: string
  birthday?: string
  anniversary?: string
  preferences: {
    cardStyle: string
    interests: string[]
    giftBudget: string
  }
  automationEnabled: boolean
  nextCardDate?: string
}

export default function AutomationPage() {
  const [activeTab, setActiveTab] = useState<'contacts' | 'holidays' | 'automation'>('contacts')
  const [contacts, setContacts] = useState<Contact[]>([
    {
      id: '1',
      name: 'Sarah Johnson',
      email: 'sarah@example.com',
      birthday: '1995-03-15',
      preferences: {
        cardStyle: 'elegant',
        interests: ['coffee', 'books', 'travel'],
        giftBudget: '$50-100'
      },
      automationEnabled: true,
      nextCardDate: '2025-03-15'
    },
    {
      id: '2',
      name: 'Mom',
      email: 'mom@family.com',
      birthday: '1965-07-22',
      anniversary: '1990-06-10',
      preferences: {
        cardStyle: 'heartfelt',
        interests: ['gardening', 'cooking', 'family'],
        giftBudget: '$100-200'
      },
      automationEnabled: true,
      nextCardDate: '2025-06-10'
    }
  ])

  const [newContact, setNewContact] = useState({
    name: '',
    email: '',
    birthday: ''
  })

  const addContact = () => {
    if (newContact.name && newContact.email) {
      const contact: Contact = {
        id: Date.now().toString(),
        name: newContact.name,
        email: newContact.email,
        birthday: newContact.birthday,
        preferences: {
          cardStyle: 'elegant',
          interests: [],
          giftBudget: '$25-50'
        },
        automationEnabled: true
      }
      setContacts(prev => [...prev, contact])
      setNewContact({ name: '', email: '', birthday: '' })
    }
  }

  const toggleAutomation = (contactId: string) => {
    setContacts(prev => prev.map(contact =>
      contact.id === contactId
        ? { ...contact, automationEnabled: !contact.automationEnabled }
        : contact
    ))
  }

  const holidays = [
    { id: '1', name: 'New Year', date: '2025-01-01', category: 'holiday' },
    { id: '2', name: 'Valentine\'s Day', date: '2025-02-14', category: 'holiday' },
    { id: '3', name: 'Mother\'s Day', date: '2025-05-11', category: 'holiday' },
    { id: '4', name: 'Father\'s Day', date: '2025-06-15', category: 'holiday' },
    { id: '5', name: 'Christmas', date: '2025-12-25', category: 'holiday' }
  ]

  const tabs = [
    { id: 'contacts', name: 'Contacts', icon: Users },
    { id: 'holidays', name: 'Holidays', icon: Calendar },
    { id: 'automation', name: 'Automation', icon: Bot }
  ]

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="text-center mb-12">
          <Badge className="bg-gradient-to-r from-purple-500 to-pink-600 text-white mb-4">
            <Bot className="h-4 w-4 mr-2" />
            Never Forget Again
          </Badge>
          <h1 className="text-5xl font-display font-bold text-purple-600 mb-4">
            Automated Card & Gift System
          </h1>
          <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
            Set up once, celebrate forever. Our AI automatically sends personalized cards and gifts
            to your loved ones for every occasion, so you never miss an important moment.
          </p>
        </div>

        {/* Tab Navigation */}
        <div className="flex justify-center mb-8">
          <div className="bg-white rounded-lg p-2 shadow-lg">
            <div className="flex space-x-2">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as 'contacts' | 'holidays' | 'automation')}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg transition-all ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-purple-500 to-pink-600 text-white'
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <tab.icon className="h-5 w-5" />
                  <span className="font-medium">{tab.name}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Contacts Tab */}
        {activeTab === 'contacts' && (
          <div className="space-y-8">
            {/* Add New Contact */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Plus className="h-5 w-5 mr-2 text-green-500" />
                  Add New Contact
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-4 gap-4">
                  <Input
                    placeholder="Full Name"
                    value={newContact.name}
                    onChange={(e) => setNewContact(prev => ({ ...prev, name: e.target.value }))}
                  />
                  <Input
                    type="email"
                    placeholder="Email Address"
                    value={newContact.email}
                    onChange={(e) => setNewContact(prev => ({ ...prev, email: e.target.value }))}
                  />
                  <Input
                    type="date"
                    placeholder="Birthday"
                    value={newContact.birthday}
                    onChange={(e) => setNewContact(prev => ({ ...prev, birthday: e.target.value }))}
                  />
                  <Button onClick={addContact} className="bg-green-500 hover:bg-green-600 text-white">
                    <Plus className="h-4 w-4 mr-2" />
                    Add Contact
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contacts List */}
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {contacts.map((contact) => (
                <Card key={contact.id} className="hover:shadow-lg transition-all">
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <CardTitle className="text-lg">{contact.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">{contact.email}</p>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {contact.birthday && (
                      <div className="flex items-center space-x-2">
                        <Calendar className="h-4 w-4 text-pink-500" />
                        <span className="text-sm">Birthday: {new Date(contact.birthday).toLocaleDateString()}</span>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-1">
                      {contact.preferences.interests.slice(0, 3).map((interest) => (
                        <Badge key={interest} variant="outline" className="text-xs">
                          {interest}
                        </Badge>
                      ))}
                    </div>

                    <div className="flex items-center justify-between">
                      <Badge className={contact.automationEnabled ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-600'}>
                        {contact.automationEnabled ? 'Auto ON' : 'Auto OFF'}
                      </Badge>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => toggleAutomation(contact.id)}
                      >
                        <Bot className="h-4 w-4 mr-2" />
                        Toggle
                      </Button>
                    </div>

                    {contact.nextCardDate && (
                      <div className="text-xs text-muted-foreground">
                        Next card: {new Date(contact.nextCardDate).toLocaleDateString()}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* Holidays Tab */}
        {activeTab === 'holidays' && (
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2 text-orange-500" />
                  Holiday Calendar & Occasions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {holidays.map((holiday) => (
                    <div
                      key={holiday.id}
                      className="p-4 rounded-lg border border-gray-200 hover:shadow-md transition-all"
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h3 className="font-semibold">{holiday.name}</h3>
                          <p className="text-sm text-muted-foreground">
                            {new Date(holiday.date).toLocaleDateString()}
                          </p>
                        </div>
                        <Badge className="bg-orange-500 text-white">
                          {holiday.category}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-xs text-muted-foreground">Annual</span>
                        <Button size="sm" variant="outline">
                          <Settings className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Automation Tab */}
        {activeTab === 'automation' && (
          <div className="space-y-8">
            {/* Automation Overview */}
            <div className="grid md:grid-cols-3 gap-6">
              <Card>
                <CardContent className="pt-6 text-center">
                  <Bot className="h-12 w-12 text-purple-600 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">12 Active</h3>
                  <p className="text-muted-foreground text-sm">Automated contacts</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Mail className="h-12 w-12 text-orange-500 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">47 Sent</h3>
                  <p className="text-muted-foreground text-sm">Cards this year</p>
                </CardContent>
              </Card>

              <Card>
                <CardContent className="pt-6 text-center">
                  <Gift className="h-12 w-12 text-pink-500 mx-auto mb-4" />
                  <h3 className="font-bold text-lg mb-2">23 Gifts</h3>
                  <p className="text-muted-foreground text-sm">Automatically sent</p>
                </CardContent>
              </Card>
            </div>

            {/* Automation Settings */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Zap className="h-5 w-5 mr-2 text-yellow-500" />
                  Automation Configuration
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                  <div className="space-y-4">
                    <h4 className="font-semibold text-purple-600">Card Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>AI Image Generation</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>Personal Messages</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>Mini-Games Included</span>
                        <Badge className="bg-green-100 text-green-800">Enabled</Badge>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-4">
                    <h4 className="font-semibold text-purple-600">Timing Settings</h4>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>Send Cards 3 Days Early</span>
                        <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>Follow-up Reminders</span>
                        <Badge className="bg-blue-100 text-blue-800">Active</Badge>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                        <span>Gift Coordination</span>
                        <Badge className="bg-yellow-100 text-yellow-800">Pending</Badge>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Quick Action Button */}
        <div className="fixed bottom-8 right-8">
          <Button size="lg" className="bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 text-white shadow-2xl rounded-full h-16 w-16">
            <Wand2 className="h-8 w-8" />
          </Button>
        </div>
      </div>
    </div>
  )
}