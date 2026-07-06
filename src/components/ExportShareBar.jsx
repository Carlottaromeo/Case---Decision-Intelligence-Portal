import { sharePage } from "../utils/shareContent"

const VARIANT_CLASS = {
  investment: {
    bar: "export-share-bar export-share-bar--investment",
    btn: "investment-btn investment-btn--ghost",
    exportBtn: "investment-btn investment-btn--primary",
  },
  workflow: {
    bar: "export-share-bar export-share-bar--workflow",
    btn: "wf-builder__btn wf-builder__btn--ghost",
    exportBtn: "wf-builder__btn wf-builder__btn--ghost",
  },
}

/**
 * @param {{ key: string, label: string, onSelect: () => void }}[] formats
 */
export default function ExportShareBar({
  share,
  formats = [],
  variant = "investment",
  onNotify,
}) {
  const classes = VARIANT_CLASS[variant] ?? VARIANT_CLASS.investment

  async function handleShare() {
    const result = await sharePage(share ?? {})
    if (!result.ok) return
    if (result.method === "clipboard") {
      onNotify?.("Link copiato negli appunti")
    }
  }

  if (!formats.length && !share) return null

  return (
    <div className={classes.bar}>
      {share && (
        <button type="button" className={classes.btn} onClick={handleShare}>
          Condividi
        </button>
      )}
      {formats.length > 0 && (
        <div className="export-share-bar__export-wrap">
          <button type="button" className={classes.exportBtn}>
            Esporta
          </button>
          <div className="export-share-bar__menu" role="menu" aria-label="Formati di esportazione">
            {formats.map((format) => (
              <button
                key={format.key}
                type="button"
                role="menuitem"
                onClick={format.onSelect}
              >
                {format.label}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  )
}
