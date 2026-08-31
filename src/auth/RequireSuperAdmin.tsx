import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { authStorage } from './auth-storage'
import { ROUTES } from '@/config/routes'

/**
 * Pathless guard route: unlike the main app's RequireAuth (token presence only),
 * this also checks the stored isSuperAdmin flag — a valid token for a non-admin
 * user should still bounce back to login, not render an admin page that every
 * data call will then 403 on.
 */
export function RequireSuperAdmin() {
  const location = useLocation()
  const hasSession = !!authStorage.getToken() && authStorage.isSuperAdmin()

  if (!hasSession) {
    return <Navigate to={ROUTES.login} replace state={{ from: location }} />
  }

  return <Outlet />
}
