import { api } from './api'
import type { Post, Comment } from '@/types'

export interface PostFilters {
  page?: number
}

export interface PaginatedPosts {
  data: Post[]
  meta: {
    current_page: number
    last_page: number
    total: number
    per_page: number
  }
}

export interface PaginatedComments {
  data: Comment[]
  meta: {
    current_page: number
    last_page: number
    total: number
  }
}

export interface PostPayload {
  title: string
  content: string
  image?: string | null
  published_at?: string | null
  is_pinned?: boolean
}

export async function getPosts(filters: PostFilters = {}): Promise<PaginatedPosts> {
  const params = new URLSearchParams()
  if (filters.page) params.set('page', String(filters.page))
  const qs = params.toString()
  return api.get<PaginatedPosts>(`/posts${qs ? `?${qs}` : ''}`)
}

export async function getPost(id: number): Promise<Post> {
  return api.get<Post>(`/posts/${id}`)
}

export async function createPost(payload: PostPayload): Promise<Post> {
  return api.post<Post>('/posts', payload)
}

export async function updatePost(id: number, payload: Partial<PostPayload>): Promise<Post> {
  return api.patch<Post>(`/posts/${id}`, payload)
}

export async function deletePost(id: number): Promise<void> {
  return api.delete<void>(`/posts/${id}`)
}

export async function togglePinPost(id: number): Promise<{ is_pinned: boolean }> {
  return api.patch<{ is_pinned: boolean }>(`/posts/${id}/pin`, {})
}

export async function getComments(postId: number, page = 1): Promise<PaginatedComments> {
  return api.get<PaginatedComments>(`/posts/${postId}/comments?page=${page}`)
}

export async function addComment(postId: number, content: string): Promise<Comment> {
  return api.post<Comment>(`/posts/${postId}/comments`, { content })
}

export async function deleteComment(commentId: number): Promise<void> {
  return api.delete<void>(`/comments/${commentId}`)
}
