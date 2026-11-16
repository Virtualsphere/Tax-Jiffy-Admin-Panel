import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import { Table, THead, TBody, Tr, Th, Td } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/StateMessage'
import { apiUsageApi } from './api-usage.api'
import type { ApiUsageType, GstApiUsageGroup } from './api-usage.types'

const API_COLUMNS: { type: ApiUsageType; label: string }[] = [
  { type: 'GSTR1', label: 'GSTR-1' },
  { type: 'GSTR2B', label: 'GSTR-2B' },
  { type: 'IMS', label: 'IMS' },
  { type: 'EINVOICE', label: 'E-Invoice' },
  { type: 'EWAYBILL', label: 'E-Way Bill' },
]

function groupByGst(rows: Awaited<ReturnType<typeof apiUsageApi.getAll>>): GstApiUsageGroup[] {
  const map = new Map<number, GstApiUsageGroup>()
  for (const row of rows) {
    let group = map.get(row.companyGstId)
    if (!group) {
      group = {
        companyGstId: row.companyGstId,
        gstNumber: row.gstNumber,
        companyName: row.companyName,
        periodKey: row.periodKey,
        totalCallCount: row.totalCallCount,
        effectiveLimit: row.effectiveLimit,
        planDefaultLimit: row.planDefaultLimit,
        override: row.override,
        usageByType: { GSTR1: 0, GSTR2B: 0, IMS: 0, EINVOICE: 0, EWAYBILL: 0 },
      }
      map.set(row.companyGstId, group)
    }
    group.usageByType[row.apiType] = row.callCount
  }
  return Array.from(map.values())
}

export function ApiLimitsPage() {
  const queryClient = useQueryClient()
  const { data: rows = [], isLoading, isError } = useQuery({
    queryKey: ['admin-api-usage'],
    queryFn: apiUsageApi.getAll,
  })

  const groups = useMemo(() => groupByGst(rows), [rows])

  const [editingId, setEditingId] = useState<number | null>(null)
  const [draftValue, setDraftValue] = useState('')

  const overrideMutation = useMutation({
    mutationFn: ({ companyGstId, value }: { companyGstId: number; value: number | null }) =>
      apiUsageApi.setOverride(companyGstId, value),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-api-usage'] })
      setEditingId(null)
    },
  })

  const startEdit = (group: GstApiUsageGroup) => {
    setEditingId(group.companyGstId)
    setDraftValue(group.override != null ? String(group.override) : '')
  }

  const saveEdit = (companyGstId: number) => {
    const trimmed = draftValue.trim()
    overrideMutation.mutate({ companyGstId, value: trimmed === '' ? null : Number(trimmed) })
  }

  return (
    <div>
      <PageHeader
        title="API Limits"
        subtitle="GST-portal API calls this month, per GST number. The limit applies to the total across all APIs; calls are blocked once it is reached. OTP logins are not counted (see OTP Usage)."
      />

      {isLoading && <LoadingState label="Loading API usage…" />}
      {isError && <ErrorState message="Could not load API usage." />}
      {!isLoading && !isError && groups.length === 0 && <EmptyState message="No GST numbers to show usage for yet." />}

      {!isLoading && !isError && groups.length > 0 && (
        <Table>
          <THead>
            <Tr>
              <Th>GSTIN</Th>
              <Th>Company</Th>
              {API_COLUMNS.map((c) => (
                <Th key={c.type}>{c.label}</Th>
              ))}
              <Th>Used / Limit</Th>
              <Th>Override</Th>
              <Th>Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {groups.map((g) => {
              const total = g.totalCallCount
              const nearLimit = g.effectiveLimit === 0 || total / g.effectiveLimit >= 0.9
              return (
                <Tr key={g.companyGstId}>
                  <Td className="font-mono font-medium text-slate-900">{g.gstNumber}</Td>
                  <Td>{g.companyName ?? '—'}</Td>
                  {API_COLUMNS.map((c) => (
                    <Td key={c.type}>{g.usageByType[c.type]}</Td>
                  ))}
                  <Td>
                    <span className={nearLimit ? 'font-semibold text-red-600' : 'font-medium text-slate-900'}>
                      {total} / {g.effectiveLimit}
                    </span>
                    {g.planDefaultLimit != null && g.override != null && (
                      <span className="text-slate-400"> (plan: {g.planDefaultLimit})</span>
                    )}
                  </Td>
                  <Td>
                    {editingId === g.companyGstId ? (
                      <input
                        type="number"
                        min={0}
                        autoFocus
                        value={draftValue}
                        onChange={(e) => setDraftValue(e.target.value)}
                        placeholder="Plan default"
                        className="w-24 rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                      />
                    ) : g.override != null ? (
                      <Badge tone="indigo">{g.override}</Badge>
                    ) : (
                      <span className="text-slate-400">Plan default</span>
                    )}
                  </Td>
                  <Td>
                    {editingId === g.companyGstId ? (
                      <div className="flex gap-2">
                        <button
                          type="button"
                          disabled={overrideMutation.isPending}
                          onClick={() => saveEdit(g.companyGstId)}
                          className="text-indigo-600 hover:underline disabled:opacity-60"
                        >
                          Save
                        </button>
                        <button type="button" onClick={() => setEditingId(null)} className="text-slate-500 hover:underline">
                          Cancel
                        </button>
                      </div>
                    ) : (
                      <button type="button" onClick={() => startEdit(g)} className="text-indigo-600 hover:underline">
                        Set override
                      </button>
                    )}
                  </Td>
                </Tr>
              )
            })}
          </TBody>
        </Table>
      )}
    </div>
  )
}
