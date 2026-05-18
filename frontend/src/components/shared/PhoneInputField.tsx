import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

const COUNTRIES = [
  { flag: '🇺🇸', code: '+1', name: 'United States', short: 'US' },
  { flag: '🇳🇵', code: '+977', name: 'Nepal', short: 'NP' },
  { flag: '🇮🇳', code: '+91', name: 'India', short: 'IN' },
  { flag: '🇬🇧', code: '+44', name: 'United Kingdom', short: 'GB' },
  { flag: '🇨🇦', code: '+1', name: 'Canada', short: 'CA' },
  { flag: '🇦🇺', code: '+61', name: 'Australia', short: 'AU' },
  { flag: '🇩🇪', code: '+49', name: 'Germany', short: 'DE' },
  { flag: '🇯🇵', code: '+81', name: 'Japan', short: 'JP' },
  { flag: '🇫🇷', code: '+33', name: 'France', short: 'FR' },
  { flag: '🇧🇷', code: '+55', name: 'Brazil', short: 'BR' },
  { flag: '🇨🇳', code: '+86', name: 'China', short: 'CN' },
  { flag: '🇷🇺', code: '+7', name: 'Russia', short: 'RU' },
  { flag: '🇸🇬', code: '+65', name: 'Singapore', short: 'SG' },
  { flag: '🇦🇪', code: '+971', name: 'United Arab Emirates', short: 'AE' },
].sort((a, b) => a.name.localeCompare(b.name))

type PhoneInputFieldProps = {
  label: string
  value: string
  onChange: (value: string) => void
  required?: boolean
  disabled?: boolean
  error?: string
  className?: string
}

const PhoneInputField = ({
  label,
  value,
  onChange,
  required = true,
  disabled = false,
  error,
  className = '',
}: PhoneInputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [search, setSearch] = useState('')
  const containerRef = useRef<HTMLDivElement>(null)

  // Parse incoming value to split country code and actual number
  const [selectedCountry, setSelectedCountry] = useState(COUNTRIES[0])
  const [number, setNumber] = useState('')

  useEffect(() => {
    if (!value) {
      setNumber('')
      return
    }

    // Find if value starts with any of our country codes
    const match = COUNTRIES.find(c => value.startsWith(`${c.code} `))
    if (match) {
      setSelectedCountry(match)
      setNumber(value.slice(match.code.length + 1))
    } else {
      setNumber(value)
    }
  }, [value])

  // Handle clicking outside the custom dropdown container to dismiss it
  useEffect(() => {
    if (!isOpen) return
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [isOpen])

  const handleCountrySelect = (countryCode: string) => {
    const newCountry = COUNTRIES.find(c => c.code === countryCode) || COUNTRIES[0]
    setSelectedCountry(newCountry)
    onChange(`${newCountry.code} ${number}`)
    setIsOpen(false)
    setSearch('')
  }

  const handleNumberChange = (num: string) => {
    const cleaned = num.replace(/[^\d\s\-()]/g, '')
    setNumber(cleaned)
    onChange(`${selectedCountry.code} ${cleaned}`)
  }

  const isFloated = isFocused || number !== '' || isOpen

  // Filtering list based on search term
  const filteredCountries = COUNTRIES.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.code.includes(search) ||
    c.short.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div className="w-full flex flex-col gap-1 phone-input-container" ref={containerRef}>
      <div className={`inputBox relative ${className}`}>
        
        {/* Country Code Custom Selector Button */}
        <button
          type="button"
          onClick={() => !disabled && setIsOpen(!isOpen)}
          disabled={disabled}
          className="absolute left-1 top-1 bottom-1 w-[85px] flex items-center justify-between px-2.5 z-10 border-r text-xs font-bold transition-all active:scale-97 cursor-pointer hover:bg-white/5"
          style={{ borderColor: 'var(--color-border)', color: 'var(--color-text)' }}
        >
          <span className="flex items-center gap-1">
            <span>{selectedCountry.flag}</span>
            <span>{selectedCountry.code}</span>
          </span>
          <svg viewBox="0 0 24 24" className={`h-3 w-3 shrink-0 transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="currentColor">
            <path d="M7 10l5 5 5-5H7z" />
          </svg>
        </button>

        {/* Actual Phone Number Input Field */}
        <input
          type="tel"
          value={number}
          onChange={e => handleNumberChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          disabled={disabled}
          placeholder=""
          required={required}
          className="w-full pr-3 py-2 bg-[var(--color-input-bg)] border border-[var(--color-outline)] rounded-lg outline-none text-sm transition-all focus:border-[var(--color-primary)]"
          style={{ height: '42px', color: 'var(--color-text)', paddingLeft: '98px' }}
        />

        {/* Floating Label */}
        <label
          className={`label-line transition-all duration-250 ${isFloated ? 'label-line--floated' : ''}`}
          style={{
            position: 'absolute',
            left: 0,
            padding: isFloated ? '0 10px' : '10px 10px 10px 98px',
            pointerEvents: 'none',
            fontSize: isFloated ? '0.65em' : '1em',
            transform: isFloated ? 'translateX(10px) translateY(-8px)' : 'none',
            color: isFocused ? 'var(--color-primary)' : isFloated ? 'var(--color-text-tertiary)' : 'var(--color-text-secondary)',
            backgroundColor: isFloated ? 'var(--color-input-bg)' : 'transparent',
            zIndex: isFloated ? 20 : 1,
            fontWeight: isFloated ? 400 : 300
          }}
        >
          {label}
        </label>

        {/* Custom Premium Dropdown Search Overlay */}
        <AnimatePresence>
          {isOpen && (
            <motion.div
              initial={{ opacity: 0, y: 10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: 10, scale: 0.95 }}
              transition={{ duration: 0.15, ease: 'easeOut' }}
              className="absolute left-0 right-0 top-full mt-1.5 rounded-2xl shadow-xl z-50 flex flex-col overflow-hidden border"
              style={{ backgroundColor: 'var(--color-surface-elevated)', borderColor: 'var(--color-border)' }}
            >
              {/* Search Bar Input */}
              <div className="flex items-center gap-2 p-2 border-b bg-black/10" style={{ borderColor: 'var(--color-border)' }}>
                <svg viewBox="0 0 24 24" className="h-3.5 w-3.5 shrink-0" fill="currentColor" style={{ color: 'var(--color-text-secondary)' }}>
                  <path d="M15.5 14h-.79l-.28-.27A6.47 6.47 0 0 0 16 9.5 6.5 6.5 0 1 0 9.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                </svg>
                <input
                  type="text"
                  placeholder="Search country by name or code..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                  className="w-full bg-transparent text-xs outline-none py-1"
                  style={{ color: 'var(--color-text)' }}
                  autoFocus
                />
              </div>

              {/* Scrollable List items */}
              <div className="max-h-[180px] overflow-y-auto flex flex-col p-1">
                {filteredCountries.length === 0 ? (
                  <div className="p-4 text-center text-xs" style={{ color: 'var(--color-text-tertiary)' }}>
                    No countries match your search
                  </div>
                ) : (
                  filteredCountries.map(c => {
                    const isSelected = selectedCountry.code === c.code && selectedCountry.short === c.short
                    return (
                      <button
                        key={`${c.short}-${c.code}`}
                        type="button"
                        onClick={() => handleCountrySelect(c.code)}
                        className="w-full flex items-center justify-between px-3 py-2 text-xs rounded-xl text-left transition-colors cursor-pointer"
                        style={{
                          backgroundColor: isSelected ? 'var(--color-primary-ghost)' : 'transparent',
                          color: isSelected ? 'var(--color-primary)' : 'var(--color-text)'
                        }}
                        onMouseEnter={el => !isSelected && (el.currentTarget.style.backgroundColor = 'var(--color-table-hover)')}
                        onMouseLeave={el => !isSelected && (el.currentTarget.style.backgroundColor = 'transparent')}
                      >
                        <span className="flex items-center gap-2 truncate pr-2">
                          <span className="text-sm shrink-0">{c.flag}</span>
                          <span className="truncate font-semibold">{c.name}</span>
                          <span className="text-[10px]" style={{ color: 'var(--color-text-secondary)' }}>({c.short})</span>
                        </span>
                        <span className="font-bold shrink-0">{c.code}</span>
                      </button>
                    )
                  })
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      {error && (
        <span className="text-[10px] font-semibold text-rose-500 block px-1 animate-fadeIn">
          {error}
        </span>
      )}
    </div>
  )
}

export default PhoneInputField
