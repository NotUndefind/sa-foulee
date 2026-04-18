'use client'

import { useRole } from '@/hooks/useRole'
import {
  deleteDocument,
  deleteUser,
  getDocumentDownloadUrl,
  getPendingDocuments,
  getUserDocuments,
  getUsers,
  updateDocumentStatus,
  updateUserRole,
  type PendingDocument,
  type UserFilters,
} from '@/lib/admin'
import type { DocumentType, Role, User, UserDocument } from '@/types'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useState } from 'react'

// ─── Constants ────────────────────────────────────────────────────────────────

const ROLES_OPTIONS: { value: Role | ''; label: string }[] = [
  { value: '', label: 'Tous les rôles' },
  { value: 'admin', label: 'Administrateur' },
  { value: 'founder', label: 'Fondateur' },
  { value: 'coach', label: 'Entraîneur' },
  { value: 'bureau', label: 'Bureau' },
  { value: 'member', label: 'Membre' },
]

const ROLE_LABELS: Record = {
  admin: 'Admin',
  founder: 'Fondateur',
  coach: 'Entraîneur',
  bureau: 'Bureau',
  member: 'Membre',
}

const ROLE_COLORS: Record = {
  admin: { bg: 'rgba(251,57,54,0.12)', color: '#FB3936', border: 'rgba(251,57,54,0.25)' },
  founder: { bg: 'rgba(176,74,16,0.10)', color: '#D42F2D', border: 'rgba(176,74,16,0.2)' },
  coach: { bg: 'rgba(169,50,38,0.10)', color: '#D42F2D', border: 'rgba(169,50,38,0.2)' },
  bureau: { bg: 'rgba(245,158,11,0.12)', color: '#d97706', border: 'rgba(245,158,11,0.25)' },
  member: { bg: 'rgba(176,137,138,0.12)', color: '#5a8050', border: 'rgba(176,137,138,0.2)' },
}

const DOC_TYPE_LABELS: Record = {
  license: 'Licence FFA',
  registration: 'Inscription',
  medical_certificate: 'Certificat médical',
  other: 'Autre',
}

const DOC_TYPE_BADGE: Record = {
  license: 'bg-violet-50 text-violet-700 ring-1 ring-violet-200',
  registration: 'bg-sky-50 text-sky-700 ring-1 ring-sky-200',
  medical_certificate: 'bg-teal-50 text-teal-700 ring-1 ring-teal-200',
  other: 'bg-zinc-100 text-zinc-600 ring-1 ring-zinc-200',
}

const DOC_STATUS_COLORS: Record = {
  valid: 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200',
  pending: 'bg-amber-50 text-amber-700 ring-1 ring-amber-200',
  expired: 'bg-red-50 text-red-600 ring-1 ring-red-200',
}

const DOC_STATUS_LABELS: Record = {
  valid: 'Valide',
  pending: 'En attente',
  expired: 'Expiré',
}

const REQUIRED_TYPES: DocumentType[] = ['license', 'medical_certificate', 'registration']

// ─── Utilities ────────────────────────────────────────────────────────────────

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const minutes = Math.floor(diff / 60_000)
  const hours = Math.floor(diff / 3_600_000)
  const days = Math.floor(diff / 86_400_000)
  if (minutes < 60) return `il y a ${minutes} min`
  if (hours < 24) return `il y a ${hours} h`
  if (days < 30) return `il y a ${days} jour${days > 1 ? 's' : ''}`
  const months = Math.floor(days / 30)
  return `il y a ${months} mois`
}

function getInitials(firstName: string, lastName: string) {
  return `${firstName[0] ?? ''}${lastName[0] ?? ''}`.toUpperCase()
}

const AVATAR_PALETTE = [
  'bg-violet-200 text-violet-800',
  'bg-sky-200 text-sky-800',
  'bg-teal-200 text-teal-800',
  'bg-amber-200 text-amber-800',
  'bg-rose-200 text-rose-800',
  'bg-indigo-200 text-indigo-800',
]

function avatarColor(id: number) {
  return AVATAR_PALETTE[id % AVATAR_PALETTE.length]
}

// ─── Progress Ring ─────────────────────────────────────────────────────────────

function ProgressRing({ pct, size = 28 }: { pct: number; size?: number }) {
  const r = (size - 4) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - pct / 100)
  const color = pct === 100 ? '#D42F2D' : pct >= 50 ? '#f97316' : '#FB3936'
  return (
    <svg width={size} height={size} className="-rotate-90" viewBox={`0 0 ${size} ${size}`}>
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke="rgba(192,48,46,0.1)"
        strokeWidth="3"
      />
      <circle
        cx={size / 2}
        cy={size / 2}
        r={r}
        fill="none"
        stroke={color}
        strokeWidth="3"
        strokeDasharray={circ}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: 'stroke-dashoffset 0.5s ease' }}
      />
    </svg>
  )
}

// ─── Skeleton Loader ───────────────────────────────────────────────────────────

function SkeletonRow() {
  return (
    <tr style={{ borderBottom: '1px solid rgba(192,48,46,0.05)' }}>
      {[1, 2, 3, 4, 5].map((i) => (
        <td key={i} className="px-4 py-3">
          <div
            className="h-4 animate-pulse rounded"
            style={{ width: `${60 + i * 10}%`, background: 'rgba(192,48,46,0.06)' }}
          />
        </td>
      ))}
    </tr>
  )
}

function SkeletonPendingRow() {
  return (
    <div
      className="flex animate-pulse items-center gap-4 rounded-xl bg-white px-5 py-4"
      style={{ border: '1px solid rgba(192,48,46,0.07)' }}
    >
      <div
        className="h-10 w-10 shrink-0 rounded-full"
        style={{ background: 'rgba(192,48,46,0.06)' }}
      />
      <div className="flex-1 space-y-2">
        <div className="h-3.5 w-40 rounded" style={{ background: 'rgba(192,48,46,0.06)' }} />
        <div className="h-3 w-28 rounded" style={{ background: 'rgba(192,48,46,0.06)' }} />
      </div>
      <div className="h-5 w-24 rounded-full" style={{ background: 'rgba(192,48,46,0.06)' }} />
      <div className="h-3.5 w-16 rounded" style={{ background: 'rgba(192,48,46,0.06)' }} />
      <div className="flex gap-2">
        <div className="h-7 w-16 rounded-lg" style={{ background: 'rgba(192,48,46,0.06)' }} />
        <div className="h-7 w-16 rounded-lg" style={{ background: 'rgba(192,48,46,0.06)' }} />
      </div>
    </div>
  )
}

// ─── Slide-Over Panel ─────────────────────────────────────────────────────────

function SlideOverPanel({
  user,
  onClose,
  onDocumentUpdated,
}: {
  user: User
  onClose: () => void
  onDocumentUpdated?: () => void
}) {
  const [docs, setDocs] = useState<UserDocument[]>([])
  const [loading, setLoading] = useState(true)
  const [downloading, setDownloading] = useState<number | null>(null)
  const [actioning, setActioning] = useState<number | null>(null)

  useEffect(() => {
    setLoading(true)
    getUserDocuments(user.id)
      .then(setDocs)
      .finally(() => setLoading(false))
  }, [user.id])

  const handleDownload = async (doc: UserDocument) => {
    setDownloading(doc.id)
    try {
      const { url } = await getDocumentDownloadUrl(doc.id)
      window.open(url, '_blank')
    } finally {
      setDownloading(null)
    }
  }

  const handleStatusChange = async (doc: UserDocument, next: 'valid' | 'pending') => {
    setActioning(doc.id)
    try {
      const updated = await updateDocumentStatus(doc.id, next)
      setDocs((prev) => prev.map((d) => (d.id === doc.id ? { ...d, status: updated.status } : d)))
      onDocumentUpdated?.()
    } finally {
      setActioning(null)
    }
  }

  const handleDelete = async (doc: UserDocument) => {
    if (!confirm(`Supprimer "${doc.filename}" ?`)) return
    try {
      await deleteDocument(doc.id)
      setDocs((prev) => prev.filter((d) => d.id !== doc.id))
    } catch {
      /* noop */
    }
  }

  const submittedTypes = new Set(docs.map((d) => d.type))
  const completion = user.document_completion

  // Close on Escape
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onClose])

  return (
    <div className="fixed inset-0 z-50 flex">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/20 backdrop-blur-[2px]" onClick={onClose} />

      {/* Panel — slides in from right */}
      <div
        className="relative z-10 ml-auto flex h-full w-full max-w-md flex-col bg-white shadow-2xl"
        style={{ animation: 'slideInRight 0.22s cubic-bezier(0.16,1,0.3,1) both' }}
      >
        <style>{`
          @keyframes slideInRight {
            from { transform: translateX(100%); opacity: 0.6; }
            to   { transform: translateX(0);    opacity: 1; }
          }
        `}</style>

        {/* Header */}
        <div
          className="flex items-start justify-between px-6 py-5"
          style={{ borderBottom: '1px solid rgba(192,48,46,0.07)' }}
        >
          <div className="flex items-center gap-3">
            <div
              className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor(user.id)}`}
            >
              {getInitials(user.first_name, user.last_name)}
            </div>
            <div>
              <h2 className="leading-tight font-semibold" style={{ color: '#C0302E' }}>
                {user.first_name} {user.last_name}
              </h2>
              <p className="mt-0.5 text-xs" style={{ color: '#7F7F7F' }}>
                {user.email}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="mt-0.5 flex h-7 w-7 items-center justify-center rounded-md transition-colors"
            style={{ color: '#7F7F7F' }}
          >
            <svg
              viewBox="0 0 16 16"
              className="h-4 w-4"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M3 3l10 10M13 3L3 13" />
            </svg>
          </button>
        </div>

        {/* Completion progress */}
        <div className="px-6 py-4" style={{ borderBottom: '1px solid rgba(192,48,46,0.07)' }}>
          <div className="mb-2.5 flex items-center justify-between">
            <span
              className="text-xs font-medium tracking-wide uppercase"
              style={{ color: '#7F7F7F' }}
            >
              Complétion du dossier
            </span>
            <span
              className="text-sm font-bold tabular-nums"
              style={{ color: completion === 100 ? '#D42F2D' : '#f97316' }}
            >
              {completion}%
            </span>
          </div>
          <div
            className="h-1.5 w-full overflow-hidden rounded-full"
            style={{ background: 'rgba(192,48,46,0.08)' }}
          >
            <div
              className="h-1.5 rounded-full transition-all duration-700"
              style={{
                width: `${completion}%`,
                background: completion === 100 ? '#D42F2D' : '#f97316',
              }}
            />
          </div>

          {/* Required docs checklist */}
          <div className="mt-4 space-y-2">
            {REQUIRED_TYPES.map((type) => {
              const present = submittedTypes.has(type)
              return (
                <div key={type} className="flex items-center gap-2.5">
                  <div
                    className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold"
                    style={
                      present
                        ? { background: 'rgba(169,50,38,0.12)', color: '#D42F2D' }
                        : { background: 'rgba(192,48,46,0.06)', color: '#7F7F7F' }
                    }
                  >
                    {present ? (
                      <svg
                        viewBox="0 0 12 12"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M2 6l3 3 5-5" />
                      </svg>
                    ) : (
                      <svg
                        viewBox="0 0 12 12"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M3 3l6 6M9 3L3 9" />
                      </svg>
                    )}
                  </div>
                  <span className="text-sm" style={{ color: present ? '#D42F2D' : '#7F7F7F' }}>
                    {DOC_TYPE_LABELS[type]}
                  </span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Document list */}
        <div className="flex-1 overflow-y-auto px-6 py-4">
          <p
            className="mb-3 text-xs font-medium tracking-wide uppercase"
            style={{ color: '#7F7F7F' }}
          >
            Documents déposés
          </p>
          {loading ? (
            <div className="space-y-2.5">
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className="h-16 animate-pulse rounded-xl"
                  style={{ background: 'rgba(192,48,46,0.05)' }}
                />
              ))}
            </div>
          ) : docs.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div
                className="mb-3 flex h-12 w-12 items-center justify-center rounded-full"
                style={{ background: 'rgba(192,48,46,0.06)' }}
              >
                <svg
                  viewBox="0 0 24 24"
                  className="h-5 w-5"
                  style={{ color: '#7F7F7F' }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M9 13h6m-3-3v6m-9 1V7a2 2 0 012-2h6l2 2h6a2 2 0 012 2v8a2 2 0 01-2 2H4a2 2 0 01-2-2z" />
                </svg>
              </div>
              <p className="text-sm font-medium" style={{ color: '#C0302E' }}>
                Aucun document
              </p>
              <p className="mt-1 text-xs" style={{ color: '#7F7F7F' }}>
                Ce membre n&apos;a encore uploadé aucun fichier.
              </p>
            </div>
          ) : (
            <div className="space-y-2">
              {docs.map((doc) => (
                <div
                  key={doc.id}
                  className="group rounded-xl px-4 py-3 transition-all"
                  style={{ border: '1px solid rgba(192,48,46,0.08)', background: '#F8F8F8' }}
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p
                        className="truncate text-sm leading-snug font-medium"
                        style={{ color: '#C0302E' }}
                      >
                        {doc.filename}
                      </p>
                      <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${DOC_TYPE_BADGE[doc.type] ?? DOC_TYPE_BADGE.other}`}
                        >
                          {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                        </span>
                        <span
                          className={`rounded-full px-2 py-0.5 text-[10px] font-medium ${DOC_STATUS_COLORS[doc.status] ?? ''}`}
                        >
                          {DOC_STATUS_LABELS[doc.status] ?? doc.status}
                        </span>
                        {doc.expires_at && (
                          <span className="text-[10px] text-zinc-400">
                            Expire le {new Date(doc.expires_at).toLocaleDateString('fr-FR')}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* Action buttons */}
                  <div className="mt-2.5 flex items-center gap-1.5">
                    {doc.status !== 'valid' && (
                      <button
                        onClick={() => handleStatusChange(doc, 'valid')}
                        disabled={actioning === doc.id}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                        style={{ background: 'rgba(169,50,38,0.1)', color: '#D42F2D' }}
                      >
                        <svg
                          viewBox="0 0 14 14"
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M2 7l3.5 3.5L12 3" />
                        </svg>
                        {actioning === doc.id ? '…' : 'Valider'}
                      </button>
                    )}
                    {doc.status !== 'pending' && doc.status !== 'expired' && (
                      <button
                        onClick={() => handleStatusChange(doc, 'pending')}
                        disabled={actioning === doc.id}
                        className="flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                        style={{ border: '1px solid rgba(251,57,54,0.2)', color: '#D42F2D' }}
                      >
                        Rejeter
                      </button>
                    )}
                    <button
                      onClick={() => handleDownload(doc)}
                      disabled={downloading === doc.id}
                      className="ml-auto flex items-center gap-1 rounded-lg px-2.5 py-1 text-xs font-medium transition-colors disabled:opacity-50"
                      style={{ border: '1px solid rgba(192,48,46,0.12)', color: '#D42F2D' }}
                      title="Télécharger"
                    >
                      <svg
                        viewBox="0 0 14 14"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M7 1v8M4 6l3 3 3-3M2 11h10" />
                      </svg>
                      {downloading === doc.id ? '…' : 'Télécharger'}
                    </button>
                    <button
                      onClick={() => handleDelete(doc)}
                      className="flex items-center justify-center rounded-lg border border-zinc-200 p-1.5 text-zinc-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500"
                      title="Supprimer"
                    >
                      <svg
                        viewBox="0 0 14 14"
                        className="h-3 w-3"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M2 3h10M5 3V2h4v1M4 3l.5 9h5L10 3" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

type Tab = 'pending' | 'members'

export default function AdminUsersPage() {
  const router = useRouter()
  const { canManageUsers } = useRole()

  // Auth guard
  useEffect(() => {
    if (canManageUsers === false) router.replace('/tableau-de-bord')
  }, [canManageUsers, router])

  // ── Tab state ──
  const [activeTab, setActiveTab] = useState<Tab>('pending')
  const [tabInitialized, setTabInitialized] = useState(false)

  // ── Pending documents state ──
  const [pendingDocs, setPendingDocs] = useState<PendingDocument[]>([])
  const [pendingLoading, setPendingLoading] = useState(true)
  const [pendingError, setPendingError] = useState<string | null>(null)
  const [actioningDoc, setActioningDoc] = useState<number | null>(null)

  // ── Members state ──
  const [users, setUsers] = useState<User[]>([])
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1, total: 0, per_page: 20 })
  const [filters, setFilters] = useState<UserFilters>({ search: '', role: '', page: 1 })
  const [usersLoading, setUsersLoading] = useState(true)
  const [usersError, setUsersError] = useState<string | null>(null)
  const [searchInput, setSearchInput] = useState('')
  const [selectedUser, setSelectedUser] = useState<User | null>(null)
  const [roleSaving, setRoleSaving] = useState<number | null>(null)
  const [deleting, setDeleting] = useState<number | null>(null)

  // ── Fetch pending documents ──
  const fetchPending = useCallback(async () => {
    setPendingLoading(true)
    setPendingError(null)
    try {
      const data = await getPendingDocuments()
      setPendingDocs(data)
      // Set default tab: pending if there are pending docs, else members
      if (!tabInitialized) {
        setActiveTab(data.length > 0 ? 'pending' : 'members')
        setTabInitialized(true)
      }
    } catch {
      setPendingError('Impossible de charger les documents en attente.')
    } finally {
      setPendingLoading(false)
    }
  }, [tabInitialized])

  useEffect(() => {
    fetchPending()
  }, [fetchPending])

  // ── Fetch members ──
  const fetchUsers = useCallback(async () => {
    setUsersLoading(true)
    setUsersError(null)
    try {
      const res = await getUsers(filters)
      setUsers(res.data)
      setMeta(res.meta)
    } catch {
      setUsersError('Impossible de charger les membres.')
    } finally {
      setUsersLoading(false)
    }
  }, [filters])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  // ── Debounced search ──
  useEffect(() => {
    const t = setTimeout(() => setFilters((f) => ({ ...f, search: searchInput, page: 1 })), 300)
    return () => clearTimeout(t)
  }, [searchInput])

  // ── Pending doc actions ──
  const handleValidateDoc = async (doc: PendingDocument) => {
    setActioningDoc(doc.id)
    try {
      await updateDocumentStatus(doc.id, 'valid')
      setPendingDocs((prev) => prev.filter((d) => d.id !== doc.id))
    } finally {
      setActioningDoc(null)
    }
  }

  const handleRejectDoc = async (doc: PendingDocument) => {
    setActioningDoc(doc.id)
    try {
      await updateDocumentStatus(doc.id, 'pending')
      setPendingDocs((prev) => prev.filter((d) => d.id !== doc.id))
    } finally {
      setActioningDoc(null)
    }
  }

  // ── Member actions ──
  const handleRoleChange = async (user: User, newRole: Role) => {
    setRoleSaving(user.id)
    try {
      const updated = await updateUserRole(user.id, newRole)
      setUsers((prev) => prev.map((u) => (u.id === updated.id ? updated : u)))
    } finally {
      setRoleSaving(null)
    }
  }

  const handleDeleteUser = async (user: User) => {
    if (!confirm(`Supprimer le compte de ${user.first_name} ${user.last_name} ?`)) return
    setDeleting(user.id)
    try {
      await deleteUser(user.id)
      setUsers((prev) => prev.filter((u) => u.id !== user.id))
      setMeta((m) => ({ ...m, total: m.total - 1 }))
    } finally {
      setDeleting(null)
    }
  }

  // ── Stats ──
  const pendingCount = pendingDocs.length
  const completeMembers = users.filter((u) => u.has_complete_documents).length
  const totalMembers = meta.total

  // ── Guard: show nothing while checking auth ──
  if (canManageUsers === undefined) return null

  return (
    <div className="mx-auto max-w-5xl space-y-6 px-4 py-8" style={{ minHeight: '100vh' }}>
      {/* ── Page header ── */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight" style={{ color: '#C0302E' }}>
          Administration
        </h1>
        <p className="mt-1 text-sm" style={{ color: '#7F7F7F' }}>
          Gestion des membres et des dossiers de l&apos;association
        </p>
      </div>

      {/* ── Tabs ── */}
      <div
        className="flex w-fit items-center gap-1 rounded-xl p-1"
        style={{ border: '1px solid rgba(192,48,46,0.1)', background: 'rgba(192,48,46,0.04)' }}
      >
        {(
          [
            { key: 'pending', label: 'Documents en attente', count: pendingCount },
            { key: 'members', label: 'Membres', count: null },
          ] as const
        ).map(({ key, label, count }) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className="relative flex items-center gap-2 rounded-lg px-4 py-1.5 text-sm font-medium transition-all duration-150"
            style={
              activeTab === key
                ? {
                    background: 'white',
                    color: '#C0302E',
                    boxShadow: '0 1px 4px rgba(192,48,46,0.1)',
                  }
                : { color: '#7F7F7F' }
            }
          >
            {label}
            {count !== null && count > 0 && (
              <span
                className="inline-flex h-5 min-w-5 items-center justify-center rounded-full px-1.5 text-[10px] font-bold tabular-nums"
                style={
                  activeTab === key
                    ? { background: 'rgba(251,57,54,0.12)', color: '#FB3936' }
                    : { background: 'rgba(192,48,46,0.08)', color: '#7F7F7F' }
                }
              >
                {count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 1 — Documents en attente
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'pending' && (
        <div className="space-y-5">
          {/* KPI cards */}
          <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
            {/* En attente */}
            <div
              className="flex items-center gap-4 rounded-xl bg-white px-5 py-4"
              style={{ border: '1px solid rgba(192,48,46,0.1)' }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(251,57,54,0.08)' }}
              >
                <svg
                  viewBox="0 0 20 20"
                  className="h-5 w-5"
                  style={{ color: '#FB3936' }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <circle cx="10" cy="10" r="8" />
                  <path d="M10 6v4l2.5 2.5" strokeLinecap="round" />
                </svg>
              </div>
              <div>
                <p className="mb-1 text-xs leading-none" style={{ color: '#7F7F7F' }}>
                  En attente
                </p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: '#C0302E' }}>
                  {pendingLoading ? '—' : pendingCount}
                </p>
              </div>
            </div>

            {/* Validés ce mois — static placeholder */}
            <div
              className="flex items-center gap-4 rounded-xl bg-white px-5 py-4"
              style={{ border: '1px solid rgba(192,48,46,0.1)' }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(169,50,38,0.08)' }}
              >
                <svg
                  viewBox="0 0 20 20"
                  className="h-5 w-5"
                  style={{ color: '#D42F2D' }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M4 10l4.5 4.5L16 6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="mb-1 text-xs leading-none" style={{ color: '#7F7F7F' }}>
                  Validés ce mois
                </p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: '#C0302E' }}>
                  —
                </p>
              </div>
            </div>

            {/* Dossiers complets */}
            <div
              className="flex items-center gap-4 rounded-xl bg-white px-5 py-4"
              style={{ border: '1px solid rgba(192,48,46,0.1)' }}
            >
              <div
                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl"
                style={{ background: 'rgba(192,48,46,0.06)' }}
              >
                <svg
                  viewBox="0 0 20 20"
                  className="h-5 w-5"
                  style={{ color: '#D42F2D' }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                >
                  <path d="M3 7l4 2 3-4 3 6 2-2 3 3" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </div>
              <div>
                <p className="mb-1 text-xs leading-none" style={{ color: '#7F7F7F' }}>
                  Dossiers complets
                </p>
                <p className="text-2xl font-bold tabular-nums" style={{ color: '#C0302E' }}>
                  {usersLoading ? '—' : `${completeMembers}/${totalMembers}`}
                </p>
              </div>
            </div>
          </div>

          {/* Error */}
          {pendingError && (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                background: 'rgba(251,57,54,0.06)',
                border: '1px solid rgba(251,57,54,0.2)',
                color: '#D42F2D',
              }}
            >
              {pendingError}
            </div>
          )}

          {/* Document list */}
          <div
            className="overflow-hidden rounded-2xl"
            style={{ border: '1px solid rgba(192,48,46,0.1)', background: 'rgba(192,48,46,0.02)' }}
          >
            {pendingLoading ? (
              <div className="space-y-0 divide-y divide-zinc-100 p-3">
                {[1, 2, 3].map((i) => (
                  <SkeletonPendingRow key={i} />
                ))}
              </div>
            ) : pendingDocs.length === 0 ? (
              /* Empty state */
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <div className="mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100">
                  <svg
                    viewBox="0 0 24 24"
                    className="h-7 w-7 text-emerald-600"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M5 13l4 4L19 7" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </div>
                <p className="text-base font-semibold" style={{ color: '#C0302E' }}>
                  Tous les dossiers sont à jour
                </p>
                <p className="mt-1.5 text-sm" style={{ color: '#7F7F7F' }}>
                  Aucun document en attente de validation.
                </p>
              </div>
            ) : (
              <div className="divide-y">
                {pendingDocs.map((doc) => (
                  <div
                    key={doc.id}
                    className="flex flex-wrap items-center gap-4 bg-white px-5 py-4 transition-colors"
                    style={{ borderBottom: '1px solid rgba(192,48,46,0.05)' }}
                  >
                    {/* Avatar */}
                    <div
                      className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full text-sm font-bold ${avatarColor(doc.user.id)}`}
                    >
                      {getInitials(doc.user.first_name, doc.user.last_name)}
                    </div>

                    {/* Member info */}
                    <div className="min-w-0 flex-1">
                      <p
                        className="text-sm leading-snug font-semibold"
                        style={{ color: '#C0302E' }}
                      >
                        {doc.user.first_name} {doc.user.last_name}
                      </p>
                      <p className="truncate text-xs" style={{ color: '#7F7F7F' }}>
                        {doc.user.email}
                      </p>
                    </div>

                    {/* Doc type badge */}
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${DOC_TYPE_BADGE[doc.type] ?? DOC_TYPE_BADGE.other}`}
                    >
                      {DOC_TYPE_LABELS[doc.type] ?? doc.type}
                    </span>

                    {/* Relative time */}
                    <span className="text-xs whitespace-nowrap" style={{ color: '#7F7F7F' }}>
                      {timeAgo(doc.created_at)}
                    </span>

                    {/* Actions */}
                    <div className="flex shrink-0 items-center gap-2">
                      <button
                        onClick={() => handleValidateDoc(doc)}
                        disabled={actioningDoc === doc.id}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold text-white transition-colors disabled:opacity-50"
                        style={{ background: '#D42F2D' }}
                      >
                        <svg
                          viewBox="0 0 12 12"
                          className="h-3 w-3"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2.5"
                        >
                          <path d="M2 6l2.5 2.5L10 3" />
                        </svg>
                        {actioningDoc === doc.id ? '…' : 'Valider'}
                      </button>
                      <button
                        onClick={() => handleRejectDoc(doc)}
                        disabled={actioningDoc === doc.id}
                        className="flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-semibold transition-colors disabled:opacity-50"
                        style={{ border: '1px solid rgba(251,57,54,0.25)', color: '#D42F2D' }}
                      >
                        Rejeter
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════════
          TAB 2 — Membres
      ══════════════════════════════════════════════════════════════════════ */}
      {activeTab === 'members' && (
        <div className="space-y-4">
          {/* Filters bar */}
          <div className="flex flex-col gap-3 sm:flex-row">
            <div className="relative flex-1">
              <svg
                viewBox="0 0 16 16"
                className="absolute top-1/2 left-3 h-4 w-4 -translate-y-1/2"
                style={{ color: '#7F7F7F' }}
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <circle cx="6.5" cy="6.5" r="4.5" />
                <path d="M10.5 10.5L14 14" strokeLinecap="round" />
              </svg>
              <input
                type="search"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                placeholder="Rechercher par nom ou e-mail…"
                className="w-full rounded-lg bg-white py-2 pr-3 pl-9 text-sm transition outline-none"
                style={{ border: '1px solid rgba(192,48,46,0.15)', color: '#C0302E' }}
              />
            </div>
            <select
              value={filters.role ?? ''}
              onChange={(e) =>
                setFilters((f) => ({ ...f, role: e.target.value as Role | '', page: 1 }))
              }
              className="rounded-lg bg-white px-3 py-2 text-sm transition outline-none"
              style={{ border: '1px solid rgba(192,48,46,0.15)', color: '#D42F2D' }}
            >
              {ROLES_OPTIONS.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>

          {/* Error */}
          {usersError && (
            <div
              className="rounded-lg px-4 py-3 text-sm"
              style={{
                background: 'rgba(251,57,54,0.06)',
                border: '1px solid rgba(251,57,54,0.2)',
                color: '#D42F2D',
              }}
            >
              {usersError}
            </div>
          )}

          {/* Table */}
          <div
            className="overflow-hidden rounded-2xl bg-white"
            style={{ border: '1px solid rgba(192,48,46,0.1)' }}
          >
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr
                    style={{
                      borderBottom: '1px solid rgba(192,48,46,0.08)',
                      background: '#F8F8F8',
                    }}
                  >
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase"
                      style={{ color: '#7F7F7F' }}
                    >
                      Membre
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase"
                      style={{ color: '#7F7F7F' }}
                    >
                      Rôle
                    </th>
                    <th
                      className="px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase"
                      style={{ color: '#7F7F7F' }}
                    >
                      Dossier
                    </th>
                    <th
                      className="hidden px-4 py-3 text-left text-xs font-semibold tracking-wide uppercase sm:table-cell"
                      style={{ color: '#7F7F7F' }}
                    >
                      Inscrit le
                    </th>
                    <th
                      className="px-4 py-3 text-right text-xs font-semibold tracking-wide uppercase"
                      style={{ color: '#7F7F7F' }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {usersLoading ? (
                    Array.from({ length: 5 }).map((_, i) => <SkeletonRow key={i} />)
                  ) : users.length === 0 ? (
                    <tr>
                      <td colSpan={5} className="px-4 py-12 text-center text-sm text-zinc-400">
                        Aucun membre trouvé.
                      </td>
                    </tr>
                  ) : (
                    users.map((user) => (
                      <tr
                        key={user.id}
                        className="transition-colors"
                        style={{ borderBottom: '1px solid rgba(192,48,46,0.05)' }}
                        onMouseEnter={(e) =>
                          (e.currentTarget.style.background = 'rgba(192,48,46,0.02)')
                        }
                        onMouseLeave={(e) => (e.currentTarget.style.background = '')}
                      >
                        {/* Member cell */}
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-3">
                            <div
                              className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-xs font-bold ${avatarColor(user.id)}`}
                            >
                              {getInitials(user.first_name, user.last_name)}
                            </div>
                            <div className="min-w-0">
                              <p className="leading-snug font-medium" style={{ color: '#C0302E' }}>
                                {user.first_name} {user.last_name}
                              </p>
                              <p className="max-w-45 truncate text-xs" style={{ color: '#7F7F7F' }}>
                                {user.email}
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Role cell */}
                        <td className="px-4 py-3">
                          <div className="flex flex-wrap gap-1">
                            {user.roles.map((r) => {
                              const cfg = ROLE_COLORS[r] ?? ROLE_COLORS.member
                              return (
                                <span
                                  key={r}
                                  className="inline-flex rounded-full px-2 py-0.5 text-[10px] font-semibold"
                                  style={{
                                    background: cfg.bg,
                                    color: cfg.color,
                                    border: `1px solid ${cfg.border}`,
                                  }}
                                >
                                  {ROLE_LABELS[r] ?? r}
                                </span>
                              )
                            })}
                          </div>
                        </td>

                        {/* Dossier cell */}
                        <td className="px-4 py-3">
                          <button
                            onClick={() => setSelectedUser(user)}
                            className="group flex items-center gap-2 transition-opacity hover:opacity-80"
                          >
                            <ProgressRing pct={user.document_completion} size={26} />
                            <span
                              className="text-xs font-medium underline-offset-2 group-hover:underline"
                              style={{ color: user.has_complete_documents ? '#D42F2D' : '#FB3936' }}
                            >
                              {user.has_complete_documents ? 'Complet' : 'Incomplet'}
                            </span>
                          </button>
                        </td>

                        {/* Date cell */}
                        <td
                          className="hidden px-4 py-3 text-xs sm:table-cell"
                          style={{ color: '#7F7F7F' }}
                        >
                          {new Date(user.created_at).toLocaleDateString('fr-FR')}
                        </td>

                        {/* Actions cell */}
                        <td className="px-4 py-3">
                          <div className="flex items-center justify-end gap-2">
                            {/* Dossier button */}
                            <button
                              onClick={() => setSelectedUser(user)}
                              className="rounded-lg px-2.5 py-1 text-xs font-medium transition-colors"
                              style={{ border: '1px solid rgba(192,48,46,0.15)', color: '#D42F2D' }}
                            >
                              Dossier
                            </button>

                            {/* Role select */}
                            <select
                              value={user.roles[0] ?? 'member'}
                              onChange={(e) => handleRoleChange(user, e.target.value as Role)}
                              disabled={roleSaving === user.id}
                              className="rounded-lg px-1.5 py-1 text-xs transition-colors focus:outline-none disabled:opacity-50"
                              style={{ border: '1px solid rgba(192,48,46,0.15)', color: '#D42F2D' }}
                            >
                              {ROLES_OPTIONS.filter((r) => r.value !== '').map((r) => (
                                <option key={r.value} value={r.value}>
                                  {r.label}
                                </option>
                              ))}
                            </select>

                            {/* Delete button */}
                            <button
                              onClick={() => handleDeleteUser(user)}
                              disabled={deleting === user.id}
                              className="flex items-center justify-center rounded-lg border border-zinc-200 p-1.5 text-zinc-400 transition-colors hover:border-red-200 hover:bg-red-50 hover:text-red-500 disabled:opacity-50"
                              title="Supprimer ce membre"
                            >
                              <svg
                                viewBox="0 0 14 14"
                                className="h-3.5 w-3.5"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="1.8"
                              >
                                <path
                                  d="M2 3.5h10M5 3.5V2.5a.5.5 0 01.5-.5h3a.5.5 0 01.5.5v1M4.5 3.5l.5 8h5l.5-8"
                                  strokeLinecap="round"
                                />
                              </svg>
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {!usersLoading && meta.last_page > 1 && (
              <div
                className="flex items-center justify-between px-4 py-3"
                style={{ borderTop: '1px solid rgba(192,48,46,0.06)' }}
              >
                <p className="text-xs" style={{ color: '#7F7F7F' }}>
                  Page{' '}
                  <span className="font-medium" style={{ color: '#C0302E' }}>
                    {meta.current_page}
                  </span>{' '}
                  sur{' '}
                  <span className="font-medium" style={{ color: '#C0302E' }}>
                    {meta.last_page}
                  </span>{' '}
                  · {meta.total} membre{meta.total > 1 ? 's' : ''}
                </p>
                <div className="flex items-center gap-1.5">
                  <button
                    disabled={meta.current_page <= 1}
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) - 1 }))}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ border: '1px solid rgba(192,48,46,0.15)', color: '#D42F2D' }}
                  >
                    <svg
                      viewBox="0 0 12 12"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M8 2L4 6l4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    Précédent
                  </button>
                  <button
                    disabled={meta.current_page >= meta.last_page}
                    onClick={() => setFilters((f) => ({ ...f, page: (f.page ?? 1) + 1 }))}
                    className="flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors disabled:cursor-not-allowed disabled:opacity-40"
                    style={{ border: '1px solid rgba(192,48,46,0.15)', color: '#D42F2D' }}
                  >
                    Suivant
                    <svg
                      viewBox="0 0 12 12"
                      className="h-3 w-3"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M4 2l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Slide-over panel ── */}
      {selectedUser && (
        <SlideOverPanel
          user={selectedUser}
          onClose={() => setSelectedUser(null)}
          onDocumentUpdated={fetchPending}
        />
      )}
    </div>
  )
}
