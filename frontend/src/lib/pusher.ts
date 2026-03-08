// ============================================================
// saFoulee — Pusher Client
// ============================================================

import Pusher from 'pusher-js'

let pusherInstance: Pusher | null = null

export function getPusherClient(): Pusher {
  if (!pusherInstance) {
    pusherInstance = new Pusher(process.env.NEXT_PUBLIC_PUSHER_KEY!, {
      cluster: process.env.NEXT_PUBLIC_PUSHER_CLUSTER ?? 'eu',
      authEndpoint: `${process.env.NEXT_PUBLIC_API_URL}/chat/pusher/auth`,
      auth: {
        headers: {
          Accept: 'application/json',
        },
      },
    })
  }
  return pusherInstance
}
