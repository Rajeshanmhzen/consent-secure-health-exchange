type CheckboxProps = {
  label: string
  checked: boolean
  onChange: (checked: boolean) => void
  id?: string
}

const Checkbox = ({ label, checked, onChange, id }: CheckboxProps) => {
  return (
    <label className="flex items-center gap-2 cursor-pointer" htmlFor={id}>
      <input
        type="checkbox"
        id={id}
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="w-4 h-4 rounded border outline-none cursor-pointer"
        style={{ accentColor: 'var(--color-primary)' }}
      />
      <span className="text-sm font-medium" style={{ color: 'var(--color-text)' }}>
        {label}
      </span>
    </label>
  )
}

export default Checkbox
