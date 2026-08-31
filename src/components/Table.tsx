import type { ReactNode, TdHTMLAttributes, ThHTMLAttributes } from 'react'

export function Table({ children }: { children: ReactNode }) {
  return (
    <div className="mx-8 my-6 overflow-x-auto rounded-lg border border-slate-200 bg-white">
      <table className="w-full border-collapse text-sm">{children}</table>
    </div>
  )
}

export function THead({ children }: { children: ReactNode }) {
  return <thead className="bg-slate-50">{children}</thead>
}

export function TBody({ children }: { children: ReactNode }) {
  return <tbody className="divide-y divide-slate-100">{children}</tbody>
}

export function Tr({ children, onClick }: { children: ReactNode; onClick?: () => void }) {
  return (
    <tr onClick={onClick} className={onClick ? 'cursor-pointer hover:bg-slate-50' : undefined}>
      {children}
    </tr>
  )
}

export function Th({ children, className, ...rest }: ThHTMLAttributes<HTMLTableCellElement>) {
  return (
    <th
      {...rest}
      className={`whitespace-nowrap px-4 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500 ${className ?? ''}`}
    >
      {children}
    </th>
  )
}

export function Td({ children, className, ...rest }: TdHTMLAttributes<HTMLTableCellElement>) {
  return (
    <td {...rest} className={`whitespace-nowrap px-4 py-3 text-slate-700 ${className ?? ''}`}>
      {children}
    </td>
  )
}
