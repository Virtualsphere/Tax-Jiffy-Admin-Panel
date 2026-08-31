import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { ROUTES } from '@/config/routes'
import { authStorage } from '@/auth/auth-storage'

const NAV_ITEMS = [
  { label: 'Users', to: ROUTES.users },
  { label: 'GST Numbers', to: ROUTES.gst },
  { label: 'Invoices', to: ROUTES.invoices },
  { label: 'Live Activity', to: ROUTES.activity },
  { label: 'API Limits', to: ROUTES.apiLimits },
  { label: 'Subscription Plans', to: ROUTES.subscriptionPlans },
] as const

export function AdminLayout() {
  const navigate = useNavigate()
  const user = authStorage.getUser()

  const handleLogout = () => {
    authStorage.clear()
    navigate(ROUTES.login, { replace: true })
  }

  return (
    <div className="flex min-h-screen bg-slate-50">
      <aside className="flex w-60 shrink-0 flex-col border-r border-slate-200 bg-white">
        <div className="border-b border-slate-200 px-5 py-4">
          <span className="text-sm font-semibold text-slate-900">Tax Jiffy</span>
          <span className="ml-1 text-sm font-semibold text-indigo-600">Admin</span>
        </div>

        <nav className="flex-1 space-y-1 px-3 py-4">
          {NAV_ITEMS.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `block rounded-md px-3 py-2 text-sm font-medium transition ${
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="border-t border-slate-200 px-3 py-4">
          <div className="mb-2 truncate px-3 text-xs text-slate-500">{user?.email}</div>
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md px-3 py-2 text-left text-sm font-medium text-slate-600 hover:bg-slate-100 hover:text-slate-900"
          >
            Sign out
          </button>
        </div>
      </aside>

      <main className="flex-1 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  )
}
