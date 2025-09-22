import { useState, useRef, useEffect } from "react"
import s from "./Select.module.scss"

interface Option {
  label: string
  value: string
}

interface SelectProps {
  value: string | null
  onChange: (value: string) => void
  options: Option[]
  placeholder?: string
  disabled?: boolean
  className?: string
}

function Select({
  value,
  onChange,
  options,
  placeholder = "Select...",
  disabled,
  className,
}: SelectProps) {
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState("")
  const wrapperRef = useRef<HTMLDivElement>(null)

  const filtered = options.filter(opt =>
    opt.label.toLowerCase().includes(search.toLowerCase())
  )

  const selectedLabel = options.find(opt => opt.value === value)?.label

  const handleSelect = (val: string) => {
    onChange(val)
    setOpen(false)
    setSearch("")
  }

  // закрытие при клике вне
  useEffect(() => {
  // Функция, которая проверяет: клик был снаружи селекта или внутри
  const handleClickOutside = (e: MouseEvent) => {
    // wrapperRef.current — это ссылка на корневой div компонента <Select>
    // contains(e.target) проверяет, находится ли кликнутый элемент внутри этого div
    if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
      setOpen(false) // если клик вне селекта → закрываем дропдаун
    }
  }

  // Вешаем слушатель на документ — при любом клике проверяем, где он произошёл
  document.addEventListener("mousedown", handleClickOutside)

  // Чистим слушатель при размонтировании компонента,
  // чтобы не было утечек памяти и лишних обработчиков
  return () => document.removeEventListener("mousedown", handleClickOutside)
}, [])

  return (
    <div
      ref={wrapperRef}
      className={`${s.wrapper} ${className || ""}`}
    >
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
                  key={opt.value}
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
