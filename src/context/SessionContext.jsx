import { createContext, useContext, useState, useCallback, useMemo, useEffect } from "react"
import { DEFAULT_SESSION_USER } from "../data/sessionUser"

const SessionContext = createContext(null)

/** Legacy key — removed so every app open starts at login. */
const LEGACY_STORAGE_KEY = "northstar-session"

/**
 * Product requirement: the tool always opens on the login screen.
 * No auto-login and no persisted session across visits or refreshes.
 */
export function SessionProvider({ children }) {
  const [user, setUser] = useState(null)

  useEffect(() => {
    try {
      localStorage.removeItem(LEGACY_STORAGE_KEY)
    } catch {
      /* ignore */
    }
  }, [])

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
