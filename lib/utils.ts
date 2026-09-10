export function slugify(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export function generateUniqueSlug(name: string): string {
  const base = slugify(name)
  const randomSuffix = Math.random().toString(36).slice(2, 7)
  return `${base}-${randomSuffix}`
}