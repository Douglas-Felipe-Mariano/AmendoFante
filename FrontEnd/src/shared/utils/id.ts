export function createEntityId(prefix: string): string {
  const suffix = Math.random().toString(36).slice(2, 8)
  return `${prefix}-${Date.now()}-${suffix}`
}
