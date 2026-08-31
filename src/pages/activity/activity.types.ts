export interface UserLastActive {
  userId: number
  userName: string
  userEmail: string
  companyName: string | null
  online: boolean
  lastActiveAt: string | null
}
