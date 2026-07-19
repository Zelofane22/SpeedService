export { cn } from '@speedservice/ui'

export type ApiTimestamp = string | null | undefined

export function parseApiDate(value: ApiTimestamp): Date | null {
  if (!value) return null

  const dateOnly = value.match(/^(\d{4})-(\d{2})-(\d{2})$/)
  if (dateOnly) {
    const [, year, month, day] = dateOnly
    return new Date(Number(year), Number(month) - 1, Number(day))
  }

  const date = new Date(value)
  return Number.isNaN(date.getTime()) ? null : date
}

export function formatDriverLocalDate(
  value: ApiTimestamp,
  options: Intl.DateTimeFormatOptions = { day: '2-digit', month: 'short' },
) {
  const date = parseApiDate(value)
  if (!date) return '—'

  return new Intl.DateTimeFormat('fr-FR', options).format(date)
}
