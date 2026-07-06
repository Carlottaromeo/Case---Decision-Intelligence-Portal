import { createContext, useContext, useState, useEffect, useCallback, useMemo } from "react"
import { DEFAULT_SESSION_USER } from "../data/sessionUser"

const SessionContext = createContext(null)
const STORAGE_KEY = "northstar-session"

function readStoredUser() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw === "null") return null
    if (raw) return JSON.parse(raw)
  } catch {
    /* ignore */
  }
  return DEFAULT_SESSION_USER
}

export function SessionProvider({ children }) {
  const [user, setUser] = useState(readStoredUser)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, user ? JSON.stringify(user) : "null")
    } catch {
      /* ignore */
    }
  }, [user])

  const login = useCallback(() => setUser(DEFAULT_SESSION_USER), [])
  const logout = useCallback(() => setUser(null), [])

  const value = useMemo(
    () => ({ user, isAuthenticated: Boolean(user), login, logout }),
    [user, login, logout]
  )

  return <SessionContext.Provider value={value}>{children}</SessionContext.Provider>
}

export function useSession() {
  const ctx = useContext(SessionContext)
  if (!ctx) throw new Error("useSession must be used within SessionProvider")
  return ctx
}
