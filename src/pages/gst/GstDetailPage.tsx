import { useQuery } from '@tanstack/react-query'
import { Link, useParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { Table, THead, TBody, Tr, Th, Td } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/StateMessage'
import { gstApi, roleMappingApi } from './gst.api'
import { invoiceApi } from '@/pages/invoices/invoice.api'
import { ROUTES } from '@/config/routes'

function money(v: number | null): string {
  if (v == null) return '—'
  return v.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
}

function formatDate(v: string | null): string {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function GstDetailPage() {
  const { id } = useParams<{ id: string }>()
  const gstId = Number(id)

  const { data: gst, isLoading: isGstLoading, isError: isGstError } = useQuery({
    queryKey: ['admin-gst-detail', gstId],
    queryFn: () => gstApi.getById(gstId),
    enabled: !!gstId,
  })

  const { data: accessRows = [], isLoading: isAccessLoading } = useQuery({
    queryKey: ['admin-gst-access', gstId],
    queryFn: () => roleMappingApi.getByCompanyGst(gstId),
    enabled: !!gstId,
  })

  const { data: purchases = [], isLoading: isPurchasesLoading } = useQuery({
    queryKey: ['admin-gst-purchases', gstId],
    queryFn: () => invoiceApi.getByGst(gstId),
    enabled: !!gstId,
  })

  if (isGstLoading) return <LoadingState label="Loading GST details…" />
  if (isGstError || !gst) return <ErrorState message="Could not load this GST number." />

  return (
    <div>
      <PageHeader
        title={gst.gstNumber}
        subtitle={
          <>
            <Link to={ROUTES.gst} className="text-indigo-600 hover:underline">
              GST Numbers
            </Link>{' '}
            / {gst.companyName ?? 'Unknown company'}
          </>
        }
      />

      <div className="grid grid-cols-4 gap-4 px-8 py-6">
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase text-slate-500">Subscription</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{gst.subscriptionPlanName ?? '—'}</div>
          <div className="mt-1 text-sm text-slate-500">{money(gst.planAmount)}</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase text-slate-500">Status</div>
          <div className="mt-1">
            {!gst.isActive ? (
              <Badge tone="slate">Deactivated</Badge>
            ) : gst.isPaymentDone ? (
              <Badge tone="green">Active</Badge>
            ) : (
              <Badge tone="amber">Payment Pending</Badge>
            )}
          </div>
          <div className="mt-1 text-sm text-slate-500">
            {formatDate(gst.startDate)} – {formatDate(gst.endDate)}
          </div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase text-slate-500">Users on this GST</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{gst.activeUserCount}</div>
          <div className="mt-1 text-sm text-slate-500">of {gst.planUserCount ?? '—'} allowed</div>
        </div>
        <div className="rounded-lg border border-slate-200 bg-white p-4">
          <div className="text-xs font-semibold uppercase text-slate-500">Page access grants</div>
          <div className="mt-1 text-lg font-semibold text-slate-900">{gst.pageAccessCount}</div>
        </div>
      </div>

      <h2 className="px-8 text-sm font-semibold text-slate-700">Page access</h2>

      {isAccessLoading && <LoadingState label="Loading page access…" />}
      {!isAccessLoading && accessRows.length === 0 && <EmptyState message="No page access has been granted yet." />}

      {!isAccessLoading && accessRows.length > 0 && (
        <Table>
          <THead>
            <Tr>
              <Th>Role</Th>
              <Th>Page</Th>
              <Th>Screen</Th>
              <Th>View</Th>
              <Th>Add</Th>
              <Th>Edit</Th>
              <Th>Delete</Th>
            </Tr>
          </THead>
          <TBody>
            {accessRows.map((row) => (
              <Tr key={row.id}>
                <Td className="font-medium text-slate-900">{row.roleName}</Td>
                <Td>{row.pageNumber}</Td>
                <Td>{row.screenNumber}</Td>
                <Td>{row.view ? '✓' : '—'}</Td>
                <Td>{row.add ? '✓' : '—'}</Td>
                <Td>{row.edit ? '✓' : '—'}</Td>
                <Td>{row.delete ? '✓' : '—'}</Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      <h2 className="px-8 text-sm font-semibold text-slate-700">Subscription history</h2>

      {isPurchasesLoading && <LoadingState label="Loading subscription history…" />}
      {!isPurchasesLoading && purchases.length === 0 && (
        <EmptyState message="No subscription purchases recorded for this GST yet." />
      )}

      {!isPurchasesLoading && purchases.length > 0 && (
        <Table>
          <THead>
            <Tr>
              <Th>Date</Th>
              <Th>Type</Th>
              <Th>Plan</Th>
              <Th>Amount</Th>
              <Th>Period</Th>
              <Th>Payment</Th>
            </Tr>
          </THead>
          <TBody>
            {purchases.map((p) => (
              <Tr key={p.id}>
                <Td>{formatDate(p.createdDate)}</Td>
                <Td>
                  <Badge tone={p.transactionType === 'PURCHASE' ? 'indigo' : 'amber'}>{p.transactionType}</Badge>
                </Td>
                <Td>{p.planNameSnapshot ?? '—'}</Td>
                <Td>{money(p.planAmountSnapshot)}</Td>
                <Td>
                  {formatDate(p.startDate)} – {formatDate(p.endDate)}
                </Td>
                <Td>
                  <Badge tone={p.isPaymentDone ? 'green' : 'red'}>{p.isPaymentDone ? 'Paid' : 'Unpaid'}</Badge>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </div>
  )
}
