import { useMemo, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import { Table, THead, TBody, Tr, Th, Td } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/StateMessage'
import { apiUsageApi } from './api-usage.api'
import type { ApiUsageType, GstApiUsageGroup } from './api-usage.types'

const API_TYPES: ApiUsageType[] = ['EINVOICE', 'EWAYBILL', 'IMS']

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
        effectiveLimit: row.effectiveLimit,
        planDefaultLimit: row.planDefaultLimit,
        override: row.override,
        usageByType: { EINVOICE: 0, EWAYBILL: 0, IMS: 0 },
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
        subtitle="3rd-party GST-portal call usage this period, per GST number. Calls are hard-blocked once a limit is reached."
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
              <Th>E-Invoice</Th>
              <Th>E-Way Bill</Th>
              <Th>IMS</Th>
              <Th>Limit / period</Th>
              <Th>Override</Th>
              <Th>Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {groups.map((g) => {
              const total = API_TYPES.reduce((sum, t) => sum + g.usageByType[t], 0)
              const nearLimit = g.effectiveLimit > 0 && total / g.effectiveLimit >= 0.9
              return (
                <Tr key={g.companyGstId}>
                  <Td className="font-mono font-medium text-slate-900">{g.gstNumber}</Td>
                  <Td>{g.companyName ?? '—'}</Td>
                  <Td>{g.usageByType.EINVOICE}</Td>
                  <Td>{g.usageByType.EWAYBILL}</Td>
                  <Td>{g.usageByType.IMS}</Td>
                  <Td>
                    <span className={nearLimit ? 'font-semibold text-red-600' : undefined}>{g.effectiveLimit}</span>
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
