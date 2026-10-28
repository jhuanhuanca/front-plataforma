export function mediaUrl(image: string | null | undefined): string {
  if (image === null || image === undefined || image === '') {
    return ''
  }

  if (image.startsWith('/media/') || image.startsWith('/storage/')) {
    const base = String(import.meta.env.VITE_API_URL || 'http://localhost:8000/api/v1').replace(/\/api\/v1\/?$/, '')

    return `${base}${image}`
  }

  return image
}
