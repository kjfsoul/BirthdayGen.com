import { render, screen } from '@testing-library/react'
import { Header } from '../Header'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/'
}))

describe('Header', () => {
  it('renders logo and navigation', () => {
    render(<Header />)
    expect(screen.getByText('BirthdayGen')).toBeInTheDocument()
    expect(screen.getByText('Card Maker')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
  })

  it('renders auth buttons', () => {
    render(<Header />)
    expect(screen.getByText('Sign in')).toBeInTheDocument()
    expect(screen.getByText('Sign up free')).toBeInTheDocument()
  })

  it('has proper navigation role', () => {
    render(<Header />)
    expect(screen.getByRole('navigation')).toBeInTheDocument()
  })
})
