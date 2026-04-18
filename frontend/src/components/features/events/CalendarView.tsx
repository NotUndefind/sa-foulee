'use client'

import { useMemo, useState } from 'react'
import type { Event, EventType } from '@/types'

const TYPE_COLORS: Record<EventType, string> = {
  race: 'bg-red-400',
  outing: 'bg-accent',
  competition: 'bg-purple-400',
  other: 'bg-zinc-400',
}

const WEEKDAYS = ['Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam', 'Dim']
const MONTHS = [
  'Janvier',
  'Février',
  'Mars',
  'Avril',
  'Mai',
  'Juin',
  'Juillet',
  'Août',
  'Septembre',
  'Octobre',
  'Novembre',
  'Décembre',
]

interface Props {
  events: Event[]
  onEventClick: (event: Event) => void
}

export default function CalendarView({ events, onEventClick }: Props) {
  const today = new Date()
  const [year, setYear] = useState(today.getFullYear())
  const [month, setMonth] = useState(today.getMonth()) // 0-11

  // Détermine les jours du mois affiché
  const { days, startOffset } = useMemo(() => {
    const firstDay = new Date(year, month, 1)
    const daysInMonth = new Date(year, month + 1, 0).getDate()
    // lundi=0, ..., dimanche=6
    const dow = (firstDay.getDay() + 6) % 7 // JS: 0=dimanche, on veut lundi=0
    return { days: daysInMonth, startOffset: dow }
  }, [year, month])

  // Map : "YYYY-MM-DD" → Event[]
  const eventsByDay = useMemo(() => {
    const map: Record<string, Event[]> = {}
    events.forEach((ev) => {
      const d = new Date(ev.event_date)
      if (d.getFullYear() === year && d.getMonth() === month) {
        const key = d.getDate().toString()
        if (!map[key]) map[key] = []
        map[key].push(ev)
      }
    })
    return map
  }, [events, year, month])

  const prevMonth = () => {
    if (month === 0) {
      setMonth(11)
      setYear((y) => y - 1)
    } else setMonth((m) => m - 1)
  }

  const nextMonth = () => {
    if (month === 11) {
      setMonth(0)
      setYear((y) => y + 1)
    } else setMonth((m) => m + 1)
  }

  // Grille : cellules vides + jours réels
  const cells = [...Array(startOffset).fill(null), ...Array.from({ length: days }, (_, i) => i + 1)]

  return (
    <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-zinc-200">
      {/* Navigation mois */}
      <div className="flex items-center justify-between border-b border-zinc-100 px-5 py-4">
        <button
          onClick={prevMonth}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"
          aria-label="Mois précédent"
        >
          ←
        </button>
        <h2 className="font-semibold text-zinc-900">
          {MONTHS[month]} {year}
        </h2>
        <button
          onClick={nextMonth}
          className="rounded-lg p-1.5 text-zinc-500 hover:bg-zinc-100"
          aria-label="Mois suivant"
        >
          →
        </button>
      </div>

      {/* En-têtes jours */}
      <div className="grid grid-cols-7 border-b border-zinc-100">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-2 text-center text-xs font-medium text-zinc-400">
            {d}
          </div>
        ))}
      </div>

      {/* Grille des jours */}
      <div className="grid grid-cols-7">
        {cells.map((day, idx) => {
          if (day === null) {
            return (
              <div
                key={`empty-${idx}`}
                className="h-20 border-r border-b border-zinc-100 bg-zinc-50/50"
              />
            )
          }

          const isToday =
            day === today.getDate() && month === today.getMonth() && year === today.getFullYear()

          const dayEvents = eventsByDay[day.toString()] ?? []

          return (
            <div
              key={day}
              className={`h-20 border-r border-b border-zinc-100 p-1.5 ${dayEvents.length > 0 ? 'cursor-pointer hover:bg-zinc-50' : ''}`}
            >
              {/* Numéro du jour */}
              <div
                className={`mb-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-medium ${
                  isToday ? 'bg-primary text-white' : 'text-zinc-500'
                }`}
              >
                {day}
              </div>

              {/* Événements du jour (max 2 visibles) */}
              <div className="space-y-0.5">
                {dayEvents.slice(0, 2).map((ev) => (
                  <button
                    key={ev.id}
                    onClick={() => onEventClick(ev)}
                    className="flex w-full items-center gap-1 rounded px-1 py-0.5 text-left hover:bg-zinc-100"
                  >
                    <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${TYPE_COLORS[ev.type]}`} />
                    <span className="truncate text-xs leading-tight text-zinc-700">{ev.title}</span>
                  </button>
                ))}
                {dayEvents.length > 2 && (
                  <p className="px-1 text-xs text-zinc-400">
                    +{dayEvents.length - 2} autre{dayEvents.length > 3 ? 's' : ''}
                  </p>
                )}
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
