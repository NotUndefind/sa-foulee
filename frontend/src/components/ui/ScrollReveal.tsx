'use client'
import { useEffect } from 'react'

export default function ScrollReveal() {
  useEffect(() => {
    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('on')
        })
      },
      { threshold: 0.1 }
    )
    document.querySelectorAll('.sF-reveal').forEach((el) => io.observe(el))
    return () => io.disconnect()
  }, [])
  return null
}
