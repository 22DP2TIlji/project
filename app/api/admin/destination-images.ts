export function normalizeDestinationImageUrl(imageUrl: unknown): string | null {
  if (Array.isArray(imageUrl)) {
    const first = imageUrl.find(
      (value): value is string => typeof value === 'string' && value.trim().length > 0,
    )

    return first?.trim() ?? null
  }

  if (typeof imageUrl !== 'string') {
    return null
  }

  const trimmed = imageUrl.trim()
  if (!trimmed) {
    return null
  }

  if (trimmed.includes(',') && !trimmed.startsWith('data:')) {
    const [first] = trimmed
      .split(',')
      .map((value) => value.trim())
      .filter(Boolean)

    return first ?? null
  }

  return trimmed
}
