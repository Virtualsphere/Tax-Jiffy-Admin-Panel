import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import { Table, THead, TBody, Tr, Th, Td } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/StateMessage'
import { adminUserApi } from './user.api'

export function UsersPage() {
  const [search, setSearch] = useState('')
  const { data: users = [], isLoading, isError } = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminUserApi.getAll,
  })

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase()
    if (!q) return users
    return users.filter(
      (u) =>
        u.userName.toLowerCase().includes(q) ||
        u.userEmail.toLowerCase().includes(q) ||
        (u.mobile ?? '').toLowerCase().includes(q) ||
        u.gstMemberships.some((m) => m.gstNumber.toLowerCase().includes(q)),
    )
  }, [users, search])

  return (
    <div>
      <PageHeader
        title="Users"
        subtitle="Every user registered on the platform."
        action={
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search name, email, mobile, GSTIN…"
            className="w-72 rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
        }
      />

      {isLoading && <LoadingState label="Loading users…" />}
      {isError && <ErrorState message="Could not load users." />}
      {!isLoading && !isError && filtered.length === 0 && (
        <EmptyState message={search ? 'No users match your search.' : 'No users registered yet.'} />
      )}

      {!isLoading && !isError && filtered.length > 0 && (
        <Table>
          <THead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Mobile</Th>
              <Th>Company</Th>
              <Th>GST numbers</Th>
              <Th>Status</Th>
            </Tr>
          </THead>
          <TBody>
            {filtered.map((u) => (
              <Tr key={u.id}>
                <Td className="font-medium text-slate-900">
                  {u.userName}
                  {u.isSuperAdmin && (
                    <span className="ml-2">
                      <Badge tone="indigo">Super admin</Badge>
                    </span>
                  )}
                </Td>
                <Td>{u.userEmail}</Td>
                <Td>{u.mobile ?? '—'}</Td>
                <Td>{u.companyName ?? '—'}</Td>
                <Td>
                  {u.gstMemberships.length === 0 ? (
                    '—'
                  ) : (
                    <div className="flex flex-wrap gap-1">
                      {u.gstMemberships.map((m) => (
                        <Badge key={m.companyGstId} tone={m.isPaymentDone ? 'green' : 'amber'}>
                          {m.gstNumber}
                        </Badge>
                      ))}
                    </div>
                  )}
                </Td>
                <Td>
                  <Badge tone={u.isActive ? 'green' : 'slate'}>{u.isActive ? 'Active' : 'Deactivated'}</Badge>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
