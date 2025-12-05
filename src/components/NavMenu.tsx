'use client'


import { Link, useLocation } from 'react-router-dom'
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"

interface NavMenuProps {
  onClose: () => void
}

export function NavMenu({ onClose }: NavMenuProps) {
  const location = useLocation()
  const pathname = location.pathname

  const isActive = (href: string) => pathname === href

  const navItems = [
    { href: '/generator', label: 'Card Maker' },
    { href: '/party-planner', label: 'Party Planner' },
    { href: '/gifts', label: 'Gift Guide' },
    { href: '/blog', label: 'Blog' },
    { href: '/community', label: 'Community' },
    { href: '/showcase', label: 'Showcase' },
  ]

  return (
    <div className="flex flex-col space-y-4 mt-6">
      <nav className="flex flex-col space-y-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            to={item.href}
            onClick={onClose}
            className={`px-4 py-2 text-lg font-medium rounded-md transition-colors ${isActive(item.href)
              ? 'bg-purple-100 text-purple-700'
              : 'text-gray-700 hover:bg-purple-50 hover:text-purple-600'
              }`}
          >
            {item.label}
          </Link>
        ))}
      </nav>

      <Separator />

      <div className="flex flex-col space-y-2">
        <Button variant="outline" className="w-full justify-start" asChild>
          <Link to="/auth">
            Sign in
          </Link>
        </Button>
        <Button className="w-full justify-start bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" asChild>
          <Link to="/auth">
            Sign up free
          </Link>
        </Button>
      </div>
    </div>
  )
}
