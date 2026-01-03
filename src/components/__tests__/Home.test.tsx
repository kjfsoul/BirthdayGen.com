import { render, screen } from '@testing-library/react'
import Home from '../../app/page'

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

jest.mock('../../components/holiday/HolidayScene', () => ({
  HolidayScene: () => <div data-testid="holiday-scene">HolidayScene</div>
}))

jest.mock('../../components/contacts/AddContactsCTA', () => {
  return function DummyCTA() {
    return <div data-testid="add-contacts-cta">AddContactsCTA</div>
  }
})

describe('Home', () => {
  it('renders hero section', () => {
    render(<Home />)
    expect(screen.getByText('Plan Unforgettable')).toBeInTheDocument()
    expect(screen.getByText('Holiday Birthdays')).toBeInTheDocument()
  })

  it('renders tool cards', () => {
    render(<Home />)
    expect(screen.getByText('Make a Card')).toBeInTheDocument()
    expect(screen.getByText('Plan a Party')).toBeInTheDocument()
    expect(screen.getByText('Find a Gift')).toBeInTheDocument()
  })

  it('renders stats', () => {
    render(<Home />)
    expect(screen.getByText('1,000+')).toBeInTheDocument()
  })
})
