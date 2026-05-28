import React from 'react'

interface Props {
  children: React.ReactNode
  style?: React.CSSProperties
  className?: string
}

export function Card({ children, style, className }: Props) {
  return (
    <div className={'sll-card ' + (className ?? '')} style={style}>
      {children}
    </div>
  )
}
