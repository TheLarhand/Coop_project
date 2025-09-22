import s from "./Checkbox.module.scss"

interface CheckboxProps {
  checked: boolean
  onChange: (value: boolean) => void
  label?: string
  disabled?: boolean
  error?: boolean
  success?: boolean
  className?: string
}

function Checkbox({
  checked,
  onChange,
  label,
  disabled,
  error,
  success,
  className,
}: CheckboxProps) {
  const handleToggle = () => {
    if (!disabled) onChange(!checked)
  }

  return (
    <label className={`${s.wrapper} ${className || ""} ${disabled ? s.disabled : ""}`}>
      <input
        type="checkbox"
        checked={checked}
        onChange={handleToggle}
        disabled={disabled}
        className={s.input}
      />
      <span
        className={`${s.box} ${disabled ? s.disabled : ""} ${checked ? s.checked : ""} ${
          error ? s.error : success ? s.success : ""
        }`}
      />
      {label && <span className={s.label}>{label}</span>}
    </label>
  )
}

export default Checkbox
