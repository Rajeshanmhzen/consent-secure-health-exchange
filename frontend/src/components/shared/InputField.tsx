import React, { useState } from 'react'

type InputFieldProps = {
  label: string
  name?: string
  type?: string
  placeholder?: string
  value?: string
  onChange?: (value: string) => void
  required?: boolean
  className?: string
  rightAdornment?: React.ReactNode
  as?: 'input' | 'textarea' | 'select'
  rows?: number
  options?: Array<{ label: string; value: string }>
}

const InputField = ({
  label,
  name,
  type = 'text',
  placeholder,
  value,
  required = true,
  onChange,
  rightAdornment,
  className = '',
  as = 'input',
  rows = 4,
  options = [],
}: InputFieldProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const [hasValue, setHasValue] = useState(false)
  const isFloated = isFocused || hasValue || (value !== undefined && value !== '')
  const sharedProps = {
    value,
    required,
    name,
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      onChange?.(e.target.value)
      setHasValue(e.target.value !== '')
    },
    onFocus: () => setIsFocused(true),
    onBlur: (e: React.FocusEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
      setIsFocused(false)
      setHasValue(e.target.value !== '')
    },
  }

  return (
    <div className={`inputBox ${className}`}>
      {as === 'textarea' ? (
        <textarea
          {...sharedProps}
          rows={rows}
          placeholder={placeholder ?? ''}
          style={rightAdornment ? { paddingRight: '2.5rem' } : undefined}
        />
      ) : as === 'select' ? (
        <select
          {...sharedProps}
          style={rightAdornment ? { paddingRight: '2.5rem' } : undefined}
        >
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      ) : (
        <input
          {...sharedProps}
          type={type}
          placeholder={placeholder ?? ''}
          style={rightAdornment ? { paddingRight: '2.5rem' } : undefined}
        />
      )}
      <label
        htmlFor={name}
        className={`label-line${isFloated ? ' label-line--floated' : ''}`}
      >
        {label}
      </label>
      {rightAdornment && (
        <div className="absolute right-2 top-1/2 -translate-y-1/2">
          {rightAdornment}
        </div>
      )}
    </div>
  )
}

export default InputField
