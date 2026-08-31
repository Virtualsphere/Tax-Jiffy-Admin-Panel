import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { PageHeader } from '@/components/PageHeader'
import { Table, THead, TBody, Tr, Th, Td } from '@/components/Table'
import { Badge } from '@/components/Badge'
import { LoadingState, ErrorState, EmptyState } from '@/components/StateMessage'
import { Modal } from '@/components/Modal'
import { subscriptionPlanApi } from './subscription-plan.api'
import type { SubscriptionPlan, SubscriptionPlanRequest } from './subscription-plan.types'

const EMPTY_FORM: SubscriptionPlanRequest = {
  name: '',
  userCount: 1,
  transactionCount: 100,
  planAmount: 0,
}

function money(v: number): string {
  return v.toLocaleString('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })
}

export function SubscriptionPlansPage() {
  const queryClient = useQueryClient()
  const { data: plans = [], isLoading, isError } = useQuery({
    queryKey: ['subscription-plans'],
    queryFn: subscriptionPlanApi.getAll,
  })

  const [isModalOpen, setModalOpen] = useState(false)
  const [editingPlan, setEditingPlan] = useState<SubscriptionPlan | null>(null)
  const [form, setForm] = useState<SubscriptionPlanRequest>(EMPTY_FORM)
  const [formError, setFormError] = useState<string | null>(null)

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ['subscription-plans'] })

  const createMutation = useMutation({
    mutationFn: (req: SubscriptionPlanRequest) => subscriptionPlanApi.create(req),
    onSuccess: () => {
      invalidate()
      closeModal()
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : 'Failed to save plan'),
  })

  const updateMutation = useMutation({
    mutationFn: ({ id, req }: { id: number; req: SubscriptionPlanRequest }) => subscriptionPlanApi.update(id, req),
    onSuccess: () => {
      invalidate()
      closeModal()
    },
    onError: (err) => setFormError(err instanceof Error ? err.message : 'Failed to save plan'),
  })

  const deactivateMutation = useMutation({
    mutationFn: (id: number) => subscriptionPlanApi.deactivate(id),
    onSuccess: invalidate,
  })

  const openCreate = () => {
    setEditingPlan(null)
    setForm(EMPTY_FORM)
    setFormError(null)
    setModalOpen(true)
  }

  const openEdit = (plan: SubscriptionPlan) => {
    setEditingPlan(plan)
    setForm({
      name: plan.name,
      userCount: plan.userCount,
      transactionCount: plan.transactionCount,
      planAmount: plan.planAmount,
    })
    setFormError(null)
    setModalOpen(true)
  }

  const closeModal = () => {
    setModalOpen(false)
    setEditingPlan(null)
    setForm(EMPTY_FORM)
    setFormError(null)
  }

  const handleSubmit = () => {
    if (!form.name.trim()) {
      setFormError('Plan name is required.')
      return
    }
    if (editingPlan) {
      updateMutation.mutate({ id: editingPlan.id, req: form })
    } else {
      createMutation.mutate(form)
    }
  }

  const saving = createMutation.isPending || updateMutation.isPending

  return (
    <div>
      <PageHeader
        title="Subscription Plans"
        subtitle="Plans customers can subscribe a GST number to."
        action={
          <button
            type="button"
            onClick={openCreate}
            className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500"
          >
            New plan
          </button>
        }
      />

      {isLoading && <LoadingState label="Loading plans…" />}
      {isError && <ErrorState message="Could not load subscription plans." />}

      {!isLoading && !isError && plans.length === 0 && <EmptyState message="No subscription plans yet." />}

      {!isLoading && !isError && plans.length > 0 && (
        <Table>
          <THead>
            <Tr>
              <Th>Name</Th>
              <Th>User limit</Th>
              <Th>Transaction limit</Th>
              <Th>Amount</Th>
              <Th>Status</Th>
              <Th>Actions</Th>
            </Tr>
          </THead>
          <TBody>
            {plans.map((plan) => (
              <Tr key={plan.id}>
                <Td className="font-medium text-slate-900">{plan.name}</Td>
                <Td>{plan.userCount}</Td>
                <Td>{plan.transactionCount}</Td>
                <Td>{money(plan.planAmount)}</Td>
                <Td>
                  <Badge tone={plan.isActive ? 'green' : 'slate'}>{plan.isActive ? 'Active' : 'Inactive'}</Badge>
                </Td>
                <Td>
                  <div className="flex gap-3">
                    <button type="button" onClick={() => openEdit(plan)} className="text-indigo-600 hover:underline">
                      Edit
                    </button>
                    {plan.isActive && (
                      <button
                        type="button"
                        onClick={() => deactivateMutation.mutate(plan.id)}
                        className="text-red-600 hover:underline"
                      >
                        Deactivate
                      </button>
                    )}
                  </div>
                </Td>
              </Tr>
            ))}
          </TBody>
        </Table>
      )}

      {isModalOpen && (
        <Modal title={editingPlan ? 'Edit plan' : 'New plan'} onClose={closeModal}>
          <div className="space-y-4">
            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Name</label>
              <input
                value={form.name}
                onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">User limit</label>
                <input
                  type="number"
                  min={1}
                  value={form.userCount}
                  onChange={(e) => setForm((f) => ({ ...f, userCount: Number(e.target.value) }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="mb-1 block text-sm font-medium text-slate-700">Transaction limit</label>
                <input
                  type="number"
                  min={0}
                  value={form.transactionCount}
                  onChange={(e) => setForm((f) => ({ ...f, transactionCount: Number(e.target.value) }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                />
              </div>
            </div>

            <div>
              <label className="mb-1 block text-sm font-medium text-slate-700">Amount (₹)</label>
              <input
                type="number"
                min={0}
                value={form.planAmount}
                onChange={(e) => setForm((f) => ({ ...f, planAmount: Number(e.target.value) }))}
                className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={closeModal}
                className="rounded-md px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={saving}
                onClick={handleSubmit}
                className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 disabled:opacity-60"
              >
                {saving ? 'Saving…' : 'Save'}
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
