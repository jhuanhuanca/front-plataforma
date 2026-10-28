const storageKey = 'device-id'

export async function ensureDeviceFingerprint(): Promise<string> {
  const existing = localStorage.getItem(storageKey)
  if (existing && existing.length >= 8 && existing.length <= 128) {
    return existing
  }

  const value = await createFingerprint()
  localStorage.setItem(storageKey, value)

  return value
}

async function createFingerprint(): Promise<string> {
  try {
    const signals = [
      navigator.userAgent,
      navigator.language,
      String(screen.width),
      String(screen.height),
      String(screen.colorDepth),
      Intl.DateTimeFormat().resolvedOptions().timeZone,
      canvasSignal(),
    ].join('|')

    const digest = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(signals))
    return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, '0')).join('')
  } catch {
    return crypto.randomUUID().replace(/-/g, '')
  }
}

function canvasSignal(): string {
  const canvas = document.createElement('canvas')
  canvas.width = 240
  canvas.height = 60
  const context = canvas.getContext('2d')
  if (!context) {
    return 'sin-canvas'
  }

  context.textBaseline = 'top'
  context.font = '16px Arial'
  context.fillStyle = '#0b63f6'
  context.fillText('politica-mnr', 2, 2)

  return canvas.toDataURL()
}
