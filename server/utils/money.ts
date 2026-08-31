export function parseMoney(value: unknown): number | null {
    if (value === null || value === undefined || value === '') return null

    const normalized = String(value).replace(/[^\d-]/g, '')
    if (!normalized) return null

    const parsed = Number(normalized)
    return Number.isFinite(parsed) ? parsed : null
}
