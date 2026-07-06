import { C } from "../theme"
import { NAV_ITEMS, PRODUCT_NAME, PRODUCT_PERIOD } from "../data/dashboardCopy"
import { NAV_ICONS } from "./NavIcons"

export { NAV_ITEMS }

export const SIDEBAR = {
  inset: 16,
  widthCollapsed: 64,
  widthExpanded: 260,
  offset(collapsed) {
    const w = collapsed ? this.widthCollapsed : this.widthExpanded
    return this.inset + w + this.inset
  },
}

export default function SideMenu({ active, onChange, collapsed, onToggle }) {
  const width = collapsed ? SIDEBAR.widthCollapsed : SIDEBAR.widthExpanded

  return (
    <aside className="glass-panel-strong" style={{
      position: "fixed",
      top: 16,
      left: 16,
      bottom: 16,
      width,
      zIndex: 200,
      borderRadius: 24,
      display: "flex",
      flexDirection: "column",
      padding: collapsed ? "16px 10px" : "20px 16px",
      transition: "width 0.3s cubic-bezier(0.4, 0, 0.2, 1), padding 0.3s",
      overflow: "hidden",
    }}>
      <div style={{
        display: "flex",
        alignItems: "center",
        justifyContent: collapsed ? "center" : "space-between",
        marginBottom: 24,
        gap: 8,
      }}>
        {!collapsed && (
          <div style={{ fontSize: 11, fontWeight: 600, color: C.accent, textTransform: "uppercase", letterSpacing: "0.12em" }}>
            Navigation
          </div>
        )}
        <button
          onClick={onToggle}
          aria-label={collapsed ? "Expand menu" : "Collapse menu"}
          style={{
            width: 36, height: 36, borderRadius: 12,
            border: `1px solid ${C.glassBorder}`,
            background: C.glassHover,
            color: C.text,
            display: "flex", alignItems: "center", justifyContent: "center",
            flexShrink: 0,
          }}
        >
          <span style={{
            fontSize: 14, fontWeight: 700,
            transform: collapsed ? "rotate(0deg)" : "rotate(180deg)",
            transition: "transform 0.3s",
          }}>›</span>
        </button>
      </div>

      <nav style={{ display: "flex", flexDirection: "column", gap: 6, flex: 1 }}>
        {NAV_ITEMS.map(item => {
          const isActive = active === item.id
          const Icon = NAV_ICONS[item.id]
          const iconColor = isActive ? "#0a0a0c" : C.muted

          return (
            <button
              key={item.id}
              onClick={() => onChange(item.id)}
              title={collapsed ? item.label : undefined}
              style={{
                display: "flex",
                alignItems: "center",
                justifyContent: collapsed ? "center" : "flex-start",
                gap: 12,
                padding: collapsed ? "12px 0" : "12px 16px",
                borderRadius: 16,
                border: "none",
                fontSize: 13,
                fontWeight: isActive ? 700 : 500,
                color: isActive ? "#0a0a0c" : C.muted,
                background: isActive ? C.accent : "transparent",
                transition: "all 0.2s",
                whiteSpace: "nowrap",
                boxShadow: isActive ? `0 0 20px ${C.accentGlow}` : "none",
              }}
              onMouseEnter={e => {
                if (!isActive) {
                  e.currentTarget.style.background = C.glassHover
                  e.currentTarget.style.color = C.text
                }
              }}
              onMouseLeave={e => {
                if (!isActive) {
                  e.currentTarget.style.background = "transparent"
                  e.currentTarget.style.color = C.muted
                }
              }}
            >
              <Icon size={20} color={iconColor} />
              {!collapsed && item.label}
            </button>
          )
        })}
      </nav>

      {!collapsed && (
        <div style={{
          marginTop: "auto",
          paddingTop: 16,
          borderTop: `1px solid ${C.glassBorder}`,
          fontSize: 10,
          color: C.subtle,
          lineHeight: 1.5,
        }}>
          Northstar Financial
          <br />
          {PRODUCT_NAME} · {PRODUCT_PERIOD}
        </div>
      )}
    </aside>
  )
}
