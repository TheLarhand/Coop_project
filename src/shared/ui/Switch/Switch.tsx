import s from "./Switch.module.scss"

interface SwitchProps {
  checked: boolean
  onChange: (value: boolean) => void
  variant?: "primary" | "secondary"
  disabled?: boolean
  className?: string
}

function Switch({ checked, onChange, variant = "primary", disabled, className }: SwitchProps) {
  const handleToggle = () => {
    if (!disabled) onChange(!checked)
  }

  return (
    <button
      type="button"
      className={`${s.switch} ${s[variant]} ${checked ? s.on : s.off} ${disabled ? s.disabled : ""} ${className || ""}`}
      onClick={handleToggle}
      disabled={disabled}
    >
      <span className={s.thumb} />
    </button>
  )
}

export default Switch
