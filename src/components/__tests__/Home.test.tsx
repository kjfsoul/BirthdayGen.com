import { render, screen } from '@testing-library/react'
import Home from '../../app/page'

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
