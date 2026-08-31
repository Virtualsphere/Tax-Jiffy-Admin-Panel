import { useEffect, useMemo } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import { Table, THead, TBody, Tr, Th, Td } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/StateMessage'
import { activityApi } from './activity.api'
import { connectPresenceSocket, type PresenceEvent } from '@/lib/presence-socket'
import type { UserLastActive } from './activity.types'

const QUERY_KEY = ['admin-last-active']

function formatLastActive(v: string | null): string {
  if (!v) return 'Never'
  return new Date(v).toLocaleString('en-IN', {
    day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
  })
}

export function LiveActivityPage() {
  const queryClient = useQueryClient()
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: QUERY_KEY,
    queryFn: activityApi.getLastActive,
  })

  useEffect(() => {
    const disconnect = connectPresenceSocket((event: PresenceEvent) => {
      queryClient.setQueryData<UserLastActive[]>(QUERY_KEY, (prev) => {
        if (!prev) return prev
        return prev.map((u) =>
          u.userId === event.userId
            ? { ...u, online: event.status === 'ONLINE', lastActiveAt: event.at }
            : u,
        )
      })
    })
    return disconnect
  }, [queryClient])

  const sorted = useMemo(
    () =>
      [...users].sort((a, b) => {
        if (a.online !== b.online) return a.online ? -1 : 1
        return a.userName.localeCompare(b.userName)
      }),
    [users],
  )

  const onlineCount = users.filter((u) => u.online).length

  return (
    <div>
      <PageHeader
        title="Live Activity"
        subtitle={`${onlineCount} user${onlineCount === 1 ? '' : 's'} online right now`}
      />

      {isLoading && <LoadingState label="Loading activity…" />}
      {isError && <ErrorState message="Could not load live activity." />}
      {!isLoading && !isError && sorted.length === 0 && <EmptyState message="No users to show yet." />}

      {!isLoading && !isError && sorted.length > 0 && (
        <Table>
          <THead>
            <Tr>
              <Th>User</Th>
              <Th>Email</Th>
              <Th>Company</Th>
              <Th>Status</Th>
              <Th>Last active</Th>
            </Tr>
          </THead>
          <TBody>
            {sorted.map((u) => (
              <Tr key={u.userId}>
                <Td className="font-medium text-slate-900">{u.userName}</Td>
                <Td>{u.userEmail}</Td>
                <Td>{u.companyName ?? '—'}</Td>
                <Td>
                  <Badge tone={u.online ? 'green' : 'slate'}>{u.online ? 'Online' : 'Offline'}</Badge>
                </Td>
                <Td>{u.online ? 'Now' : formatLastActive(u.lastActiveAt)}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
