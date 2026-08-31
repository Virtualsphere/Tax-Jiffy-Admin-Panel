import { useQuery } from '@tanstack/react-query'
import { useNavigate } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Table, THead, TBody, Tr, Th, Td } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/StateMessage'
import { gstApi } from './gst.api'
import { ROUTES } from '@/config/routes'

function money(v: number | null): string {
  if (v == null) return '—'
  return v.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
}

export function GstListPage() {
  const navigate = useNavigate()
  const { data: gsts = [], isLoading, isError } = useQuery({
    queryKey: ['admin-gst-list'],
    queryFn: gstApi.getAll,
  })

  return (
    <div>
      <PageHeader title="GST Numbers" subtitle="Every GST number registered on the platform." />

      {isLoading && <LoadingState label="Loading GST numbers…" />}
      {isError && <ErrorState message="Could not load GST numbers." />}
      {!isLoading && !isError && gsts.length === 0 && <EmptyState message="No GST numbers registered yet." />}

      {!isLoading && !isError && gsts.length > 0 && (
        <Table>
          <THead>
            <Tr>
              <Th>GSTIN</Th>
              <Th>Company</Th>
              <Th>Plan</Th>
              <Th>Users</Th>
              <Th>Page access</Th>
              <Th>Status</Th>
            </Tr>
          </THead>
          <TBody>
            {gsts.map((gst) => (
              <Tr key={gst.id} onClick={() => navigate(ROUTES.gstDetail(gst.id))}>
                <Td className="font-mono font-medium text-slate-900">{gst.gstNumber}</Td>
                <Td>{gst.companyName ?? '—'}</Td>
                <Td>
                  {gst.subscriptionPlanName ?? '—'}
                  {gst.planAmount != null && <span className="text-slate-400"> · {money(gst.planAmount)}</span>}
                </Td>
                <Td>{gst.activeUserCount}</Td>
                <Td>{gst.pageAccessCount}</Td>
                <Td>
                  {!gst.isActive ? (
                    <Badge tone="slate">Deactivated</Badge>
                  ) : gst.isPaymentDone ? (
                    <Badge tone="green">Active</Badge>
                  ) : (
                    <Badge tone="amber">Payment Pending</Badge>
                  )}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
