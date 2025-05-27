"use client"

import React from 'react'

interface ErrorFallbackButtonsProps {
  variant?: 'reload' | 'home'
  className?: string
  children?: React.ReactNode
}

export function ErrorFallbackButton({ variant = 'reload', className, children }: ErrorFallbackButtonsProps) {
  const handleClick = () => {
    if (variant === 'reload') {
      window.location.reload()
    } else if (variant === 'home') {
      window.location.href = '/'
    }
  }

  return (
    <button 
      onClick={handleClick}
      className={className}
    >
      {children}
    </button>
  )
}
