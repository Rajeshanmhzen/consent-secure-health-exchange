import { useEffect, useState } from 'react'
import { useLocation, useNavigate, Link } from 'react-router-dom'

import AnimatedButton from './Button'

const Header = () => {
  const navigate = useNavigate()
  const { pathname } = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const isAuthed = false
  const navlinks = [
    { name: 'Home', link: '/' },
    { name: 'Feature', link: '/features' },
    { name: 'Pricing', link: '/pricing' },
    { name: 'Contact', link: '/contact' },
  ]

  useEffect(() => {
    const onScroll = () => {
      setIsScrolled(window.scrollY > 10)
    }
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <nav className="fixed top-0 w-full z-50">
      <div className="flex justify-center">
        <div
          className={`flex h-20 w-full items-center justify-between px-6 transition-all duration-300 ease-out md:px-8 ${
            isScrolled ? 'mt-2.5 w-[92%] max-w-6xl rounded-full backdrop-blur-xl shadow-lg' : 'mt-0'
          }`}
          style={{
            backgroundColor: isScrolled
              ? 'color-mix(in srgb, var(--color-surface) 80%, transparent)'
              : 'var(--color-surface)',
            border: isScrolled ? '1px solid var(--color-border)' : '1px solid transparent',
          }}
        >
          <div className="flex items-center gap-3">
            <div
              className="flex h-10 w-10 items-center justify-center rounded-md text-sm font-black"
              style={{ backgroundColor: 'var(--color-primary)', color: 'var(--color-text-on-primary)' }}
            >
                <svg viewBox="0 0 24 24" className="h-5 w-5" fill="white">
                  <path d="M19 3H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V5a2 2 0 0 0-2-2zm-7 3a1 1 0 0 1 1 1v3h3a1 1 0 0 1 0 2h-3v3a1 1 0 0 1-2 0v-3H8a1 1 0 0 1 0-2h3V7a1 1 0 0 1 1-1z" />
                </svg>
            </div>
            <div>
              <p className="text-base font-bold leading-none" style={{ color: 'var(--color-text)' }}>SwasthyaConsent</p>
              <p className="mt-1 text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--color-text-tertiary)' }}>
                तपाईंको स्वास्थ्य, तपाईंको सहमति
              </p>
            </div>
          </div>

          <div className="hidden items-center gap-7 text-sm font-semibold md:flex">
            {navlinks.map((item) => {
              const isActive =
                item.link === '/'
                  ? pathname === '/'
                  : pathname.startsWith(item.link)

              return (
                <Link
                  key={item.name}
                  to={item.link}
                  className="transition-colors"
                  style={{ color: isActive ? 'var(--color-primary)' : 'var(--color-text-secondary)' }}
                >
                  {item.name}
                </Link>
              )
            })}
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/login"
              className="hidden text-sm font-semibold md:inline-flex"
              style={{ color: 'var(--color-text-secondary)' }}
            >
              Sign In
            </Link>
            <AnimatedButton
              type="button"
              onClick={() => {
                if (!isAuthed) {
                  navigate('/contact')
                  return
                }
                navigate('/login')
              }}
              className="rounded-full px-5 py-2.5 text-sm font-bold transition-colors duration-200 cursor-pointer"
              rippleColor="rgba(255,255,255,0.3)"
            >
              {isAuthed ? 'Logout' : 'Book Demo'}
            </AnimatedButton>
          </div>
        </div>
      </div>
    </nav>
  )
}

export default Header
