import type { Metadata } from 'next'
import LeaderboardPage from '@/components/features/leaderboard/LeaderboardPage'

export const metadata: Metadata = { title: 'Classement' }

export default function LeaderboardRoute() {
  return <LeaderboardPage />
}
