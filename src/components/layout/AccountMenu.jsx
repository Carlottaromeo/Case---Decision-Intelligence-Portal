import { useState, useRef, useEffect } from "react"
import { useSession } from "../../context/SessionContext"

export default function AccountMenu({ placement = "header", expanded = true }) {
  const { user, logout } = useSession()
  const [open, setOpen] = useState(false)
  const ref = useRef(null)
  const isSidebar = placement === "sidebar"

  useEffect(() => {
    if (!open) return
    const close = (e) => {
      if (ref.current && !ref.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener("mousedown", close)
    return () => document.removeEventListener("mousedown", close)
  }, [open])

  if (!user) return null

  return (
    <div
      className={`account-menu${isSidebar ? " account-menu--sidebar" : ""}${isSidebar && !expanded ? " account-menu--collapsed" : ""}`}
      ref={ref}
    >
      <button
        type="button"
        className="account-menu__trigger"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        aria-haspopup="menu"
        title={user.name}
      >
        <span className="account-menu__avatar">{user.initials}</span>
        {isSidebar && expanded && (
          <span className="account-menu__trigger-text">
            <span className="account-menu__trigger-name">{user.name}</span>
            {user.role && <span className="account-menu__trigger-role">{user.role}</span>}
          </span>
        )}
      </button>
      {open && (
        <div className="account-menu__dropdown" role="menu">
          <div className="account-menu__profile">
            <span className="account-menu__profile-avatar">{user.initials}</span>
            <div>
              <div className="account-menu__name">{user.name}</div>
              <div className="account-menu__email">{user.email}</div>
              {user.role && <div className="account-menu__role">{user.role}</div>}
            </div>
          </div>
          <button
            type="button"
            className="account-menu__logout"
            role="menuitem"
            onClick={() => {
              setOpen(false)
              logout()
            }}
          >
            Esci
          </button>
        </div>
      )}
    </div>
  )
}
