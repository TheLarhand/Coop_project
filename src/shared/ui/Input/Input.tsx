import React from 'react'
import s from './Input.module.scss'

interface InputProps {
  value: string
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void
  type?: 'text' | 'password' | 'email' | 'number' | 'url' | 'tel' | 'search' | 'date' | 'datetime-local' | 'month' | 'time' ;
  placeholder?: string
  disabled?: boolean
  error?: boolean
  success?: boolean
  className?: string // для возможности кастомизировать
  required?: boolean
}

function Input({
  value,
  onChange,
  type = 'text',
  placeholder = 'Default',
  disabled = false,
  error = false,
  success = false,
  className = '',
  required= false
}: InputProps) {
  const inputClasses = [
    s.input,
    error ? s.error : '',
    success ? s.success : '',
    disabled ? s.disabled : '',
    className
  ].join(' ').trim()

  return (
    <input
      className={inputClasses}
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      disabled={disabled}
      required={required}
    />
  )
}


export default Input
