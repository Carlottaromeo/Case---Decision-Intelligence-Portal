export async function sharePage({ title, text, url } = {}) {
  const shareUrl = url ?? (typeof window !== "undefined" ? window.location.href : "")
  const payload = { title, text, url: shareUrl }

  if (typeof navigator !== "undefined" && navigator.share) {
    try {
      await navigator.share(payload)
      return { ok: true, method: "share" }
    } catch (err) {
      if (err?.name === "AbortError") return { ok: false, cancelled: true }
    }
  }

  if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(shareUrl)
    return { ok: true, method: "clipboard" }
  }

  return { ok: false }
}
