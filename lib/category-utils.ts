export type CategoryOption = {
  value: string
  label: string
  aliases: string[]
}

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'city', label: 'Pilsēta', aliases: ['city', 'pilsēta', 'pilseta', 'pilsētas', 'pilsetas'] },
  { value: 'nature', label: 'Daba', aliases: ['nature', 'daba'] },
  { value: 'beach', label: 'Pludmale', aliases: ['beach', 'pludmale', 'pludmales'] },
  { value: 'palace', label: 'Pils/Muiža', aliases: ['palace', 'castle', 'pils', 'pilis', 'muiža', 'muiza', 'pils/muiža', 'pils/muiza'] },
  { value: 'park', label: 'Parks', aliases: ['park', 'parks', 'parki'] },
  { value: 'viewing_tower', label: 'Skatu tornis', aliases: ['viewing_tower', 'viewing tower', 'skatu tornis', 'skatu torņi', 'skatu torni'] },
]

function normalizeCategoryValue(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
}

export function getCategoryLabel(value: string | null | undefined): string {
  const normalized = normalizeCategoryValue(value)
  const option = CATEGORY_OPTIONS.find((category) =>
    category.aliases.some((alias) => normalizeCategoryValue(alias) === normalized) ||
    normalizeCategoryValue(category.value) === normalized
  )

  return option?.label ?? value ?? ''
}

export function categoryMatches(storedCategory: string | null | undefined, selectedCategory: string | null | undefined): boolean {
  const selected = normalizeCategoryValue(selectedCategory)
  if (!selected || selected === 'all' || selected === 'visas') return true

  const stored = normalizeCategoryValue(storedCategory)
  if (!stored) return false
  if (stored === selected) return true

  const option = CATEGORY_OPTIONS.find((category) =>
    normalizeCategoryValue(category.value) === selected ||
    category.aliases.some((alias) => normalizeCategoryValue(alias) === selected)
  )

  if (!option) return false

  return option.aliases.some((alias) => normalizeCategoryValue(alias) === stored)
}