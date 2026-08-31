import { Client, type IMessage } from '@stomp/stompjs'
import { env } from '@/config/env'
import { authStorage } from '@/auth/auth-storage'

/** Resolves a relative path like "/ws" against the current origin, or passes an absolute ws(s):// URL through as-is. */
function resolveBrokerUrl(path: string): string {
  if (path.startsWith('ws://') || path.startsWith('wss://')) return path
  const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:'
  return `${protocol}//${window.location.host}${path}`
}

export interface PresenceEvent {
  userId: number
  userName: string
  companyId: number | null
  companyName: string | null
  status: 'ONLINE' | 'OFFLINE'
  at: string
}

let client: Client | null = null

/** Connects and stays connected while called; safe to call more than once (no-ops if already active). */
export function connectPresenceSocket(onEvent: (event: PresenceEvent) => void): () => void {
  if (client?.active) {
    return () => {}
  }

  const token = authStorage.getToken()
  if (!token) return () => {}

  client = new Client({
    brokerURL: resolveBrokerUrl(env.VITE_WS_BASE_URL),
    connectHeaders: { Authorization: `Bearer ${token}` },
    reconnectDelay: 5000,
    heartbeatIncoming: 10000,
    heartbeatOutgoing: 10000,
  })

  client.onConnect = () => {
    client?.subscribe('/topic/presence', (message: IMessage) => {
      try {
        onEvent(JSON.parse(message.body) as PresenceEvent)
      } catch {
        // ignore malformed frames
      }
    })
  }

  client.activate()

  return () => {
    client?.deactivate()
    client = null
  }
}
