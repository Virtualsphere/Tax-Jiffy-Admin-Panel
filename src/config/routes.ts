export const ROUTES = {
  login: '/login',
  root: '/',
  users: '/users',
  gst: '/gst',
  gstDetail: (id: number | string) => `/gst/${id}`,
  invoices: '/invoices',
  activity: '/activity',
  apiLimits: '/api-limits',
  otpUsage: '/otp-usage',
  subscriptionPlans: '/subscription-plans',
} as const
