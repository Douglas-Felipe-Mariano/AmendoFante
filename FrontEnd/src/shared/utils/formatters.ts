import { format } from 'date-fns'

export function formatPercent(value: number): string {
  return `${value.toFixed(1)}%`
}

export function formatTemperature(value: number): string {
  return `${value.toFixed(1)} C`
}

export function formatKg(value: number): string {
  return `${value.toFixed(1)} KG`
}

export function formatKgPerHour(value: number): string {
  return `${value.toFixed(1)} KG/h`
}

export function formatMinutesToHuman(totalMinutes: number): string {
  const safeMinutes = Math.max(0, Math.round(totalMinutes))
  const hours = Math.floor(safeMinutes / 60)
  const minutes = safeMinutes % 60
  return `${hours}h ${String(minutes).padStart(2, '0')}min`
}

export function formatDateIso(dateISO: string): string {
  const parsed = new Date(dateISO)
  if (Number.isNaN(parsed.getTime())) {
    return dateISO
  }

  return format(parsed, 'dd/MM/yyyy')
}
