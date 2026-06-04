export type CategoryOption = {
  value: string
  label: string
  aliases: string[]
}

export const MAIN_CATEGORY_OPTIONS: CategoryOption[] = [
  {
    value: 'nature',
    label: 'Daba',
    aliases: ['nature', 'daba', 'lake', 'ezers', 'ezeri', 'forest', 'mežs', 'mezs', 'trail', 'hiking trail', 'taka'],
  },
  {
    value: 'castle',
    label: 'Pilis',
    aliases: ['castle', 'palace', 'pils', 'pilis', 'muiža', 'muiza', 'pils/muiža', 'pils/muiza'],
  },
  { value: 'park', label: 'Parki', aliases: ['park', 'parks', 'parki'] },
  { value: 'beach', label: 'Pludmales', aliases: ['beach', 'pludmale', 'pludmales'] },
  {
    value: 'city',
    label: 'Pilsēta',
    aliases: ['city', 'pilsēta', 'pilseta', 'pilsētas', 'pilsetas', 'museum', 'muzejs', 'muzeji', 'old_town', 'old town', 'vecpilseta', 'vecpilsēta'],
  },
  { value: 'viewing_tower', label: 'Skatu torņi', aliases: ['viewing_tower', 'viewing tower', 'skatu tornis', 'skatu torņi', 'skatu torni'] },
]

export const CATEGORY_OPTIONS: CategoryOption[] = [
  { value: 'city', label: 'Pilsēta', aliases: ['city', 'pilsēta', 'pilseta', 'pilsētas', 'pilsetas'] },
  { value: 'nature', label: 'Daba', aliases: ['nature', 'daba'] },
  { value: 'beach', label: 'Pludmale', aliases: ['beach', 'pludmale', 'pludmales'] },
  { value: 'palace', label: 'Pils/Muiža', aliases: ['palace', 'castle', 'pils', 'pilis', 'muiža', 'muiza', 'pils/muiža', 'pils/muiza'] },
  { value: 'park', label: 'Parks', aliases: ['park', 'parks', 'parki'] },
  { value: 'viewing_tower', label: 'Skatu tornis', aliases: ['viewing_tower', 'viewing tower', 'skatu tornis', 'skatu torņi', 'skatu torni'] },
  { value: 'museum', label: 'Muzejs', aliases: ['museum', 'muzejs', 'muzeji'] },
  { value: 'old_town', label: 'Vecpilsēta', aliases: ['old_town', 'old town', 'vecpilseta', 'vecpilsēta'] },
  { value: 'lake', label: 'Ezers', aliases: ['lake', 'ezers', 'ezeri'] },
  { value: 'forest', label: 'Mežs', aliases: ['forest', 'mežs', 'mezs'] },
  { value: 'trail', label: 'Taka', aliases: ['trail', 'hiking trail', 'taka'] },
]

function normalizeCategoryValue(value: string | null | undefined): string {
  return (value ?? '')
    .trim()
    .toLowerCase()
    .replace(/_/g, ' ')
    .replace(/\s+/g, ' ')
}

function optionMatchesValue(option: CategoryOption, value: string): boolean {
  return normalizeCategoryValue(option.value) === value ||
    option.aliases.some((alias) => normalizeCategoryValue(alias) === value)
}

export function getCategoryLabel(value: string | null | undefined): string {
  const normalized = normalizeCategoryValue(value)
   const option = CATEGORY_OPTIONS.find((category) => optionMatchesValue(category, normalized))

  return option?.label ?? value ?? ''
}

export function getMainCategoryLabel(value: string | null | undefined): string {
  const normalized = normalizeCategoryValue(value)
  const option = MAIN_CATEGORY_OPTIONS.find((category) => optionMatchesValue(category, normalized))

  return option?.label ?? getCategoryLabel(value)
}

export function categoryMatches(storedCategory: string | null | undefined, selectedCategory: string | null | undefined): boolean {
  const selected = normalizeCategoryValue(selectedCategory)
  if (!selected || selected === 'all' || selected === 'visas') return true

  const stored = normalizeCategoryValue(storedCategory)
  if (!stored) return false
  if (stored === selected) return true

  const option = [...MAIN_CATEGORY_OPTIONS, ...CATEGORY_OPTIONS].find((category) => optionMatchesValue(category, selected))

  if (!option) return false

  return option.aliases.some((alias) => normalizeCategoryValue(alias) === stored)
}
