import s from "./Textarea.module.scss"

interface TextareaProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLTextAreaElement>) => void
  placeholder?: string
  disabled?: boolean
  error?: boolean
  success?: boolean
  className?: string
}

function Textarea({ value, onChange, placeholder, disabled, error, success, className }: TextareaProps) {
  return (
    <textarea
      className={`
        ${s.textarea}
        ${disabled ? s.disabled : ""}
        ${error ? s.error : ""}
        ${success ? s.success : ""}
        ${className || ""}
      `}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
    />
  )
}

export default Textarea
