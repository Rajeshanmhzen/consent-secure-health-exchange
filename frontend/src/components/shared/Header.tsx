import { useEffect, useState } from 'react'
import { useLocation, useNavigate } from 'react-router-dom'

import AnimatedButton from './AnimatedButton'

const Header = () => {
  const navigate  = useNavigate()
  const { pathname } = useLocation()
  const [isScrolled, setIsScrolled] = useState(false)
  const isAuthed = false // TODO: replace with auth store/context
  const navlinks = [
    { name: 'Home', link: '/' },
    { name: 'About', link: '/about' },
    { name: 'Services', link: '/services' },
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
          className={`flex justify-between items-center px-8 h-20 transition-all duration-300 ease-out ${
            isScrolled
              ? 'w-[80%] mt-2.5 rounded-full backdrop-blur-xl shadow-lg'
              : 'w-full mt-0'
          }`}
          style={{
            backgroundColor: isScrolled
              ? 'color-mix(in srgb, var(--color-surface) 80%, transparent)'
              : 'var(--color-surface)',
          }}
        >
        <div className="text-2xl font-black tracking-tighter text-blue-600 font-headline flex items-center gap-2">
          <h2>logo</h2>
                <span
                  className="font-manrope text-base font-semibold tracking-tight"
                  style={{ color: "#191c1e" }}
                >
                  Moniveo
                </span>
        </div>
        <div className="hidden md:flex items-center gap-8 font-headline font-semibold text-sm tracking-tight">
          {navlinks.map((item) => {
            const isActive =
              item.link === '/'
                ? pathname === '/'
                : pathname.startsWith(item.link)

            return (
              <a
                key={item.name}
                className={
                  isActive
                    ? 'text-primary font-bold'
                    : 'text-slate-600 hover:text-blue-600 transition-colors'
                }
                href={item.link}
              >
                {item.name}
              </a>
            )
          })}
        </div>
        <div className="flex items-center gap-4">
          <AnimatedButton
            type="button"
            onClick={() => {
              if (!isAuthed) {
                navigate('/login')
                return
              }
              // TODO: call authService.logout() once auth is implemented
              navigate('/login')
            }}
            className="px-6 py-2.5 rounded-full font-headline text-sm font-bold bg-primary text-on-primary hover:opacity-90 transition-colors duration-200 cursor-pointer"
            rippleColor="rgba(255,255,255,0.3)"
          >
            {isAuthed ? 'Logout' : 'Sign In'}
          </AnimatedButton>
          {isAuthed && (
            <AnimatedButton
              type="button"
              onClick={() => navigate('/dashboard')}
              className="px-6 py-2.5 rounded-full font-headline text-sm font-bold border border-primary text-primary hover:opacity-90 transition-colors duration-200 cursor-pointer"
              rippleColor="rgba(139,92,246,0.1)"
            >
              Dashboard
            </AnimatedButton>
          )}
        </div>
        </div>
      </div>
    </nav>
  )
}

export default Header
