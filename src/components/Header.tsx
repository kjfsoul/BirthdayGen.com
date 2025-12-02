'use client'

import { useState, useEffect } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, Search, User as UserIcon, Heart, LogOut } from "lucide-react"
import { NavMenu } from './NavMenu'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'

import { User as SupabaseUser } from '@supabase/supabase-js'

export function Header() {
  const [isScrolled, setIsScrolled] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [user, setUser] = useState<SupabaseUser | null>(null)
  const [loading, setLoading] = useState(true)
  const location = useLocation()
  const pathname = location.pathname
  const navigate = useNavigate()
  const { toast } = useToast()

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    window.addEventListener('scroll', handleScroll)
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  useEffect(() => {
    // Get initial session
    const getSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession()
        setUser(session?.user ?? null)
      } catch (error) {
        console.error('Error fetching session:', error)
      } finally {
        setLoading(false)
      }
    }

    getSession()

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        setUser(session?.user ?? null)
        setLoading(false)
        if (event === 'SIGNED_OUT') {
          navigate(0) // Refresh page
        }
      }
    )

    return () => subscription.unsubscribe()
  }, [navigate])



  const handleSignOut = async () => {
    const { error } = await supabase.auth.signOut()
    if (error) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Signed out",
        description: "You have been signed out successfully.",
      })
      navigate('/')
    }
  }

  const isActive = (href: string) => pathname === href

  return (
    <header
      className={`sticky top-0 z-50 transition-all duration-300 ${isScrolled
        ? 'bg-white shadow-lg border-b'
        : 'bg-transparent'
        }`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex items-center">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-pink-500 to-purple-600 rounded-lg flex items-center justify-center">
                <Heart className="h-5 w-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">BirthdayGen</span>
            </Link>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-8">
            <Link
              to="/generator"
              className={`text-sm font-medium transition-colors ${isActive('/generator')
                ? 'text-purple-600'
                : 'text-gray-700 hover:text-purple-600'
                }`}
            >
              Card Maker
            </Link>
            <Link
              to="/party-planner"
              className={`text-sm font-medium transition-colors ${isActive('/party-planner')
                ? 'text-purple-600'
                : 'text-gray-700 hover:text-purple-600'
                }`}
            >
              Party Planner
            </Link>
            <Link
              to="/gifts"
              className={`text-sm font-medium transition-colors ${isActive('/gifts')
                ? 'text-purple-600'
                : 'text-gray-700 hover:text-purple-600'
                }`}
            >
              Gift Guide
            </Link>
            <Link
              to="/blog"
              className={`text-sm font-medium transition-colors ${isActive('/blog')
                ? 'text-purple-600'
                : 'text-gray-700 hover:text-purple-600'
                }`}
            >
              Blog
            </Link>
          </nav>

          {/* Right side actions */}
          <div className="flex items-center space-x-4">
            <Button variant="ghost" size="sm" className="hidden md:flex">
              <Search className="h-4 w-4" />
            </Button>

            {loading ? (
              <div className="w-8 h-8 animate-spin rounded-full border-2 border-purple-600 border-t-transparent" />
            ) : user ? (
              <div className="flex items-center space-x-2">
                <Link to="/contacts">
                  <Button variant="ghost" size="sm">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>
                <Button variant="ghost" size="sm" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign out
                </Button>
              </div>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild>
                  <Link to="/auth">
                    <UserIcon className="h-4 w-4 mr-2" />
                    Sign in
                  </Link>
                </Button>
                <Button size="sm" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700 text-white" asChild>
                  <Link to="/auth">
                    Sign up free
                  </Link>
                </Button>
              </>
            )}

            {/* Mobile menu */}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="sm" className="md:hidden">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-full sm:w-80">
                <NavMenu onClose={() => setIsOpen(false)} />
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </header>
  )
}
