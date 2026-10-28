export function photo(id: string, width = 900): string {
  return `https://images.unsplash.com/${id}?auto=format&fit=crop&w=${width}&q=70`
}
