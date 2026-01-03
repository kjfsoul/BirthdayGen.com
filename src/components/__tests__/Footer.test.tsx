import { render, screen } from '@testing-library/react'
import Footer from '../Footer'

// Mock next-intl
jest.mock('next-intl', () => ({
  useTranslations: () => null,
}))

describe('Footer', () => {
  it('renders without crashing', () => {
    render(<Footer />)
    expect(screen.getByRole('contentinfo')).toBeInTheDocument()
  })

  it('displays section headings', () => {
    render(<Footer />)
    expect(screen.getByRole('heading', { name: /tools/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /community/i })).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: /company/i })).toBeInTheDocument()
  })

  it('renders all footer links with correct hrefs', () => {
    render(<Footer />)

    // Tools section
    expect(screen.getByRole('link', { name: 'Card Generator' })).toHaveAttribute('href', '/generator')
    expect(screen.getByRole('link', { name: 'Party Planner' })).toHaveAttribute('href', '/party-planner')
    expect(screen.getByRole('link', { name: 'Personalized Gifts' })).toHaveAttribute('href', '/gift-guide')
    expect(screen.getByRole('link', { name: 'Send Gifts Automatically' })).toHaveAttribute('href', '/automation')

    // Community section
    expect(screen.getByRole('link', { name: 'Card Showcase' })).toHaveAttribute('href', '/showcase')
    expect(screen.getByRole('link', { name: 'Birthday Blog' })).toHaveAttribute('href', '/blog')
    expect(screen.getByRole('link', { name: 'Community' })).toHaveAttribute('href', '/community')
    expect(screen.getByRole('link', { name: 'Inspiration' })).toHaveAttribute('href', '/inspiration')

    // Company section
    expect(screen.getByRole('link', { name: 'About Us' })).toHaveAttribute('href', '/about')
    expect(screen.getByRole('link', { name: 'Contact' })).toHaveAttribute('href', '/contact')
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toHaveAttribute('href', '/privacy')
    expect(screen.getByRole('link', { name: 'Terms of Service' })).toHaveAttribute('href', '/terms')
  })

  it('displays copyright notice', () => {
    render(<Footer />)
    expect(screen.getByText(new RegExp(`© ${new Date().getFullYear()} BirthdayGen`, 'i'))).toBeInTheDocument()
  })
})
