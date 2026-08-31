import { PageHeader } from './PageHeader'

export function ComingSoon({ title }: { title: string }) {
  return (
    <div>
      <PageHeader title={title} />
      <p className="px-8 py-10 text-sm text-slate-400">This page hasn't been built yet.</p>
    </div>
  )
}
