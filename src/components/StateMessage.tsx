export function LoadingState({ label = 'Loading…' }: { label?: string }) {
  return <p className="px-8 py-10 text-sm text-slate-500">{label}</p>
}

export function ErrorState({ message = 'Something went wrong. Please try again.' }: { message?: string }) {
  return (
    <div className="mx-8 mt-6 rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
      {message}
    </div>
  )
}

export function EmptyState({ message }: { message: string }) {
  return <p className="px-8 py-10 text-sm text-slate-400">{message}</p>
}
