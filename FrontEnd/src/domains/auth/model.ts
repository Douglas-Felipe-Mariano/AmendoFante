export type UserRole = 'operador' | 'gestor'

export interface SessionState {
  isAuthenticated: boolean
  userName: string
  role: UserRole | null
}
