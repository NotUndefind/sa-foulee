// ============================================================
// saFoulee — TypeScript Types
// ============================================================

export type Role = 'admin' | 'founder' | 'coach' | 'bureau' | 'member'

export type DocumentType = 'license' | 'registration' | 'medical_certificate' | 'other'

export type DocumentStatus = 'pending' | 'valid' | 'expired'

export type EventType = 'race' | 'outing' | 'competition' | 'other'

export type SessionType = 'running' | 'interval' | 'fartlek' | 'recovery' | 'strength' | 'other'

export type Intensity = 'low' | 'medium' | 'high'

export type PerformanceSource = 'strava' | 'manual'

// ---- User ----

export interface User {
  id: number
  email: string
  first_name: string
  last_name: string
  avatar: string | null
  bio: string | null
  roles: Role[]             // tableau car Spatie supporte plusieurs rôles
  has_complete_documents: boolean
  document_completion: number
  membership_paid_at: string | null
  newsletter_subscribed_at: string | null
  email_verified_at: string | null
  created_at: string
}

export interface UserDocument {
  id: number
  user_id: number
  type: DocumentType
  filename: string
  status: DocumentStatus
  expires_at: string | null
  created_at: string
  download_url?: string // URL signée R2 (15 min)
}

// ---- Events ----

export interface Event {
  id: number
  title: string
  description: string
  type: EventType
  event_date: string
  location: string
  created_by: number
  is_public: boolean
  registrations_count: number
  is_registered?: boolean
  created_at: string
}

export interface EventPhoto {
  id: number
  url: string
  uploaded_by: number
  created_at: string
}

// ---- Training Sessions ----

export interface Exercise {
  name: string
  sets?: number
  reps?: number
  duration?: number // secondes
  rest?: number // secondes
}

export interface TrainingSession {
  id: number
  title: string
  type: SessionType
  distance_km: number | null
  duration_min: number | null
  intensity: Intensity
  exercises: Exercise[]
  description: string | null
  is_template: boolean
  created_by: number
  published_at: string | null
  created_at: string
  participants_count?: number
  has_participated?: boolean
}

// ---- Blog ----

export interface PostAuthor {
  id: number
  name: string
}

export interface Post {
  id: number
  title: string
  content: string
  image: string | null
  author: PostAuthor | null
  is_pinned: boolean
  published_at: string | null
  created_at: string
  comments_count: number
}

export interface Comment {
  id: number
  content: string
  created_at: string
  user: PostAuthor | null
}

// ---- Performances ----

export interface Performance {
  id: number
  user_id: number
  strava_activity_id: string | null
  distance_km: number
  duration_sec: number
  elevation_m: number | null
  date: string
  source: PerformanceSource
  created_at: string
}

export interface LeaderboardEntry {
  rank: number
  user: { id: number; name: string }
  total_distance_km: number
  total_sessions: number
}

// ---- Inventaire ----

export type EquipmentCategory = 'dossard' | 'maillot' | 'matériel' | 'autre'
export type EquipmentStatus   = 'good' | 'worn' | 'broken'

export interface Equipment {
  id: number
  name: string
  category: EquipmentCategory
  quantity: number
  status: EquipmentStatus
  notes: string | null
  assigned_count: number
  available_count: number
  created_at: string
}

export interface EquipmentAssignment {
  id: number
  user: { id: number; first_name: string; last_name: string; email: string } | null
  assigned_at: string
  returned_at: string | null
  notes: string | null
  assigned_by: { id: number; first_name: string; last_name: string } | null
}

export interface EquipmentDetail extends Equipment {
  active_assignments: EquipmentAssignment[]
  assignment_history: EquipmentAssignment[]
}

// ---- Chat ----

export interface ChatMessage {
  id: number
  channel: string
  userId: number
  user?: Pick<User, 'id' | 'first_name' | 'last_name' | 'avatar'>
  content: string
  createdAt: string
}

// ---- Notifications ----

export interface Notification {
  id: string
  type: string
  data: Record<string, unknown>
  readAt: string | null
  createdAt: string
}

// ---- API ----

export interface ApiResponse<T> {
  data: T
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  nextCursor: string | null
  hasMore: boolean
}

export interface ApiError {
  message: string
  errors?: Record<string, string[]>
}
