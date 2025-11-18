export function formatCount(n = 0) {
  if (n >= 1_000_000) return `${Math.floor(n / 1_000_000)}M`
  if (n >= 1_000) return `${Math.floor(n / 1_000)}K`
  return `${n}`
}

export function formatToVietnamTime(input) {
  try {
    const d = new Date(input)
    if (Number.isNaN(d.getTime())) return ''
    const diff = Date.now() - d.getTime()
    const mins = Math.floor(diff / 60000)
    if (mins < 1) return 'just now'
    if (mins < 60) return `${mins} mins ago`
    const hrs = Math.floor(mins / 60)
    if (hrs < 24) return `${hrs} hours ago`
    const days = Math.floor(hrs / 24)
    if (days < 7) return `${days} days ago`
    return d.toLocaleString('vi-VN')
  } catch {
    return ''
  }
}