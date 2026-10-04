interface Props {
  value: boolean
  onChange: () => void
  disabled?: boolean
}

export default function Toggle({ value, onChange, disabled }: Props) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={onChange}
      disabled={disabled}
      className="relative w-9 h-5 rounded-full transition-colors duration-200 focus:outline-none disabled:opacity-40 shrink-0"
      style={{ background: value ? 'var(--forest-bg)' : '#e2e8f0' }}
    >
      <span
        className="absolute top-0.5 w-4 h-4 bg-white rounded-full shadow-sm transition-all duration-200"
        style={{ right: value ? '2px' : 'auto', left: value ? 'auto' : '2px' }}
      />
    </button>
  )
}
