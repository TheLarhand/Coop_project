import { useState, useRef, useEffect } from "react"
import s from "./Select.module.scss"

interface Option<T> {
  label: string
  value: T
}

interface SelectProps<T> {
  value: T | null
  onChange: (value: T) => void
  options: Option<T>[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

function Select<T>({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled,
  className,
}: SelectProps<T>) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  const selectedLabel = options.find(opt => opt.value === value)?.label

  const handleSelect = (val: T) => {
    onChange(val)
    setOpen(false)
    setSearch("")
  }

  // закрытие при клике вне
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  return (
    <div ref={wrapperRef} className={`${s.wrapper} ${className || ""}`}>
      <button
        type="button"
        className={`${s.control} ${disabled ? s.disabled : ""}`}
        onClick={() => !disabled && setOpen(!open)}
      >
        {selectedLabel || placeholder}
        <span className={s.arrow} />
      </button>

      {open && (
        <div className={s.dropdown}>
          {options.length > 5 && (
            <input
              type="text"
              className={s.search}
              placeholder="Search..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              autoFocus
            />
          )}
          <ul className={s.list}>
            {filtered.length > 0 ? (
              filtered.map(opt => (
                <li
                  key={String(opt.value)} // чтобы ключ всегда был string
                  className={`${s.option} ${opt.value === value ? s.selected : ""}`}
                  onClick={() => handleSelect(opt.value)}
                >
                  {opt.label}
                </li>
              ))
            ) : (
              <li className={s.noResults}>No results</li>
            )}
          </ul>
        </div>
      )}
    </div>
  )
}

export default Select
