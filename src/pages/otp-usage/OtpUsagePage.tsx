import { useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import { Table, THead, TBody, Tr, Th, Td } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/StateMessage'
import { otpUsageApi } from './otp-usage.api'
import type { GstSessionStatus, OtpUsageSummary } from './otp-usage.types'

function currentMonth(): string {
  const d = new Date()
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`
}

function formatDateTime(value: string | null): string {
  if (!value) return '—'
  const d = new Date(value)
  return Number.isNaN(d.getTime())
    ? value
    : d.toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

const SESSION_BADGE: Record<GstSessionStatus, { tone: 'green' | 'amber' | 'slate' | 'red'; label: string }> = {
  ACTIVE: { tone: 'green', label: 'Connected' },
  OTP_SENT: { tone: 'amber', label: 'OTP sent' },
  EXPIRED: { tone: 'slate', label: 'Expired' },
  NONE: { tone: 'slate', label: 'Never' },
}

export function OtpUsagePage() {
  const [period, setPeriod] = useState(currentMonth)
  const [selected, setSelected] = useState<OtpUsageSummary | null>(null)
  const [showAll, setShowAll] = useState(false)

  const { data: rows = [], isLoading, isError } = useQuery({
    queryKey: ['admin-otp-usage', period],
    queryFn: () => otpUsageApi.getSummary(period),
  })

  const visible = useMemo(() => (showAll ? rows : rows.filter((r) => r.otpRequests > 0)), [rows, showAll])
  const totals = useMemo(
    () =>
      rows.reduce(
        (t, r) => ({
          requests: t.requests + r.otpRequests,
          failed: t.failed + r.failedRequests,
          verified: t.verified + (r.verifications - r.failedVerifications),
        }),
        { requests: 0, failed: 0, verified: 0 },
      ),
    [rows],
  )

  return (
    <div>
      <PageHeader
        title="OTP Usage"
        subtitle="GST portal OTP logins per GST number. Each request sends an SMS to the taxpayer's registered mobile. OTPs do not count towards the API limit."
        action={
          <input
            type="month"
            value={period}
            max={currentMonth()}
            onChange={(e) => {
              setPeriod(e.target.value || currentMonth())
              setSelected(null)
            }}
            className="rounded-md border border-slate-300 px-2 py-1 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
            aria-label="Month"
          />
        }
      />

      {isLoading && <LoadingState label="Loading OTP usage…" />}
      {isError && <ErrorState message="Could not load OTP usage." />}

      {!isLoading && !isError && (
        <>
          <div className="mx-8 mt-6 flex flex-wrap items-center gap-6 text-sm text-slate-600">
            <span>
              OTPs requested: <strong className="text-slate-900">{totals.requests}</strong>
            </span>
            <span>
              Failed requests: <strong className={totals.failed ? 'text-red-600' : 'text-slate-900'}>{totals.failed}</strong>
            </span>
            <span>
              Successful logins: <strong className="text-slate-900">{totals.verified}</strong>
            </span>
            <label className="ml-auto flex items-center gap-2">
              <input type="checkbox" checked={showAll} onChange={(e) => setShowAll(e.target.checked)} />
              Show GST numbers with no OTPs
            </label>
          </div>

          {visible.length === 0 ? (
            <EmptyState message="No OTPs were requested in this month." />
          ) : (
            <Table>
              <THead>
                <Tr>
                  <Th>GSTIN</Th>
                  <Th>Company</Th>
                  <Th>OTPs requested</Th>
                  <Th>Failed requests</Th>
                  <Th>Verified</Th>
                  <Th>Wrong / failed OTP</Th>
                  <Th>Last OTP</Th>
                  <Th>GST session</Th>
                </Tr>
              </THead>
              <TBody>
                {visible.map((r) => {
                  const badge = SESSION_BADGE[r.sessionStatus] ?? SESSION_BADGE.NONE
                  return (
                    <Tr key={r.companyGstId} onClick={() => setSelected(r)}>
                      <Td className="font-mono font-medium text-slate-900">{r.gstNumber}</Td>
                      <Td>{r.companyName ?? '—'}</Td>
                      <Td className="font-semibold text-slate-900">{r.otpRequests}</Td>
                      <Td className={r.failedRequests ? 'text-red-600' : undefined}>{r.failedRequests}</Td>
                      <Td>{r.verifications - r.failedVerifications}</Td>
                      <Td className={r.failedVerifications ? 'text-red-600' : undefined}>{r.failedVerifications}</Td>
                      <Td>{formatDateTime(r.lastOtpAt)}</Td>
                      <Td>
                        <Badge tone={badge.tone}>{badge.label}</Badge>
                        {r.sessionStatus === 'ACTIVE' && (
                          <span className="ml-2 text-xs text-slate-400">until {formatDateTime(r.sessionExpiresAt)}</span>
                        )}
                      </Td>
                    </Tr>
                  )
                })}
              </TBody>
            </Table>
          )}

          {selected && <OtpEventsPanel summary={selected} period={period} onClose={() => setSelected(null)} />}
        </>
      )}
    </div>
  )
}

function OtpEventsPanel({ summary, period, onClose }: { summary: OtpUsageSummary; period: string; onClose: () => void }) {
  const { data: events = [], isLoading, isError } = useQuery({
    queryKey: ['admin-otp-events', summary.companyGstId, period],
    queryFn: () => otpUsageApi.getEvents(summary.companyGstId, period),
  })

  return (
    <section className="mb-8">
      <div className="mx-8 mt-2 flex items-center justify-between">
        <h2 className="text-sm font-semibold text-slate-900">
          OTP history · <span className="font-mono">{summary.gstNumber}</span>
          {summary.companyName && <span className="font-normal text-slate-500"> ({summary.companyName})</span>}
        </h2>
        <button type="button" onClick={onClose} className="text-sm text-slate-500 hover:underline">
          Close
        </button>
      </div>

      {isLoading && <LoadingState label="Loading history…" />}
      {isError && <ErrorState message="Could not load OTP history." />}
      {!isLoading && !isError && events.length === 0 && <EmptyState message="No OTP activity in this month." />}
      {!isLoading && !isError && events.length > 0 && (
        <Table>
          <THead>
            <Tr>
              <Th>Time</Th>
              <Th>Action</Th>
              <Th>Result</Th>
              <Th>User</Th>
              <Th>Error</Th>
            </Tr>
          </THead>
          <TBody>
            {events.map((e) => (
              <Tr key={e.id}>
                <Td>{formatDateTime(e.createdAt)}</Td>
                <Td>{e.action === 'REQUEST' ? 'OTP requested' : 'OTP entered'}</Td>
                <Td>
                  <Badge tone={e.success ? 'green' : 'red'}>{e.success ? 'Success' : 'Failed'}</Badge>
                </Td>
                <Td>{e.userName ?? e.userEmail ?? (e.userId != null ? `User #${e.userId}` : '—')}</Td>
                <Td className="max-w-md truncate text-slate-500" title={e.message ?? undefined}>
                  {e.message ?? '—'}
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}
    </section>
  )
}
