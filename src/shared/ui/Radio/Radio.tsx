import s from "./Radio.module.scss"

interface RadioProps {
  checked: boolean
  onChange: () => void
  label?: string
  disabled?: boolean
}

function Radio({ checked, onChange, label, disabled }: RadioProps) {
  return (
    <div>
      <label className={`${s.wrapper} ${disabled ? s.disabled : ""}`}>
        <input
          type="radio"
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
        <span className={`${s.circle} ${checked ? s.checked : ""} ${disabled ? s.disabled : ""}`}>
          {checked && <span className={s.dot} />}
        </span>
        {label && <span className={s.label}>{label}</span>}
      </label>
    </div>
  )
}

export default Radio
