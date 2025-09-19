import React from 'react'
import s from './Button.module.scss'

interface ButtonProps {
  children: React.ReactNode
  onClick?: () => void
  type?: 'button' | 'submit' | 'reset'
  disabled?: boolean
  className?: string
  variant?: 'primary' | 'secondary' | 'danger'
}

function Button({ 
  children, 
  onClick, 
  type = 'button', 
  disabled = false, 
  className = '',
  variant = 'primary'
}: ButtonProps) {
  const buttonClasses = `${s.wrapper} ${s[variant]} ${className}`.trim()

  return (
    <button 
      className={buttonClasses}
      onClick={onClick}
      type={type}
      disabled={disabled}
    >
      {children}
    </button>
  )
}

export default Button