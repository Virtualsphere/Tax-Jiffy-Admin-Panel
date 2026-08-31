import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import { Table, THead, TBody, Tr, Th, Td } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/StateMessage'
import { invoiceApi } from './invoice.api'

function money(v: number | null): string {
  if (v == null) return '—'
  return v.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
}

function formatDate(v: string | null): string {
  if (!v) return '—'
  return new Date(v).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function InvoicesPage() {
  const { data: purchases = [], isLoading, isError } = useQuery({
    queryKey: ['admin-subscription-purchases'],
    queryFn: invoiceApi.getAll,
  })

  const totalRevenue = purchases
    .filter((p) => p.isPaymentDone)
    .reduce((sum, p) => sum + (p.planAmountSnapshot ?? 0), 0)

  return (
    <div>
      <PageHeader
        title="Invoices"
        subtitle={`${purchases.length} subscription purchase${purchases.length === 1 ? '' : 's'} · ${money(totalRevenue)} total`}
      />

      {isLoading && <LoadingState label="Loading invoices…" />}
      {isError && <ErrorState message="Could not load subscription purchase history." />}
      {!isLoading && !isError && purchases.length === 0 && (
        <EmptyState message="No subscriptions have been purchased yet." />
      )}

      {!isLoading && !isError && purchases.length > 0 && (
        <Table>
          <THead>
            <Tr>
              <Th>Date</Th>
              <Th>GSTIN</Th>
              <Th>Company</Th>
              <Th>Plan</Th>
              <Th>Type</Th>
              <Th>Amount</Th>
              <Th>Payment</Th>
            </Tr>
          </THead>
          <TBody>
            {purchases.map((p) => (
              <Tr key={p.id}>
                <Td>{formatDate(p.createdDate)}</Td>
                <Td className="font-mono">{p.gstNumber}</Td>
                <Td>{p.companyName ?? '—'}</Td>
                <Td>{p.planNameSnapshot ?? '—'}</Td>
                <Td>
                  <Badge tone={p.transactionType === 'PURCHASE' ? 'indigo' : 'amber'}>{p.transactionType}</Badge>
                </Td>
                <Td>{money(p.planAmountSnapshot)}</Td>
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
