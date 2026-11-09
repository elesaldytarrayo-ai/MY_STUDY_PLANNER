import { createContext, useContext, useEffect, useState } from 'react'
import * as authService from '../services/authService'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let mounted = true
    ;(async () => {
      try {
        await authService.initializeOwner()
        const session = authService.getSession()
        if (session?.userId) {
          const owner = await authService.getUserById(session.userId)
          if (mounted) setUser(owner)
        }
      } catch (err) {
        console.error('Auth bootstrap failed:', err)
      } finally {
        if (mounted) setLoading(false)
      }
    })()
    return () => { mounted = false }
  }, [])

  const login = async (email, password) => {
    const owner = await authService.login(email, password)
    setUser(owner)
    return owner
  }

  const logout = () => {
    authService.logout()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => useContext(AuthContext)