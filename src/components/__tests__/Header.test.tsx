import { render, screen } from '@testing-library/react'
import { Header } from '../Header'

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: () => '/',
  useRouter: () => ({
    push: jest.fn(),
    refresh: jest.fn(),
    replace: jest.fn(),
    back: jest.fn(),
    forward: jest.fn(),
    prefetch: jest.fn(),
  }),
  useSearchParams: () => ({
    get: jest.fn(),
  }),
}))

jest.mock('next/link', () => {
  const MockLink = ({ children, href }: { children: React.ReactNode; href: string }) => (
    <a href={href}>{children}</a>
  )
  return {
    __esModule: true,
    default: MockLink,
  }
})

describe('Header', () => {
  it('renders logo and navigation', () => {
    render(<Header />)
    expect(screen.getByText('BirthdayGen')).toBeInTheDocument()
    expect(screen.getByText('Card Maker')).toBeInTheDocument()
    expect(screen.getByText('Blog')).toBeInTheDocument()
  })

  it('renders auth buttons', async () => {
    render(<Header />)
    expect(await screen.findByText('Sign in')).toBeInTheDocument()
    expect(screen.getByText('Sign up free')).toBeInTheDocument()
  })

  it('has proper navigation role', () => {
    render(<Header />)
    const navigations = screen.getAllByRole('navigation')
    expect(navigations.length).toBeGreaterThan(0)
  })
})
