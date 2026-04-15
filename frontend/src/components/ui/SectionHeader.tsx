import type { ReactNode } from 'react'

interface SectionHeaderProps {
  label: string
  labelIcon?: ReactNode
  title: ReactNode
  subtitle?: string
  center?: boolean
}

export default function SectionHeader({
  label,
  labelIcon,
  title,
  subtitle,
  center = true,
}: SectionHeaderProps) {
  return (
    <div
      className="sF-reveal"
      style={{ textAlign: center ? 'center' : 'left', marginBottom: '3.5rem' }}
    >
      <p className="sF-label">
        {labelIcon}
        {label}
      </p>
      <h2
        style={{
          fontSize: 'clamp(2rem, 5vw, 3.25rem)',
          fontWeight: 800,
          color: '#1A1A1A',
          lineHeight: 1.1,
        }}
      >
        {title}
      </h2>
      {subtitle && (
        <p
          style={{
            marginTop: '0.875rem',
            color: '#7F7F7F',
            fontSize: '1rem',
            maxWidth: '480px',
            margin: center ? '0.875rem auto 0' : '0.875rem 0 0',
            lineHeight: 1.7,
          }}
        >
          {subtitle}
        </p>
      )}
    </div>
  )
}
