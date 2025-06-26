export function formatCurrency(value: number, currency = 'INR'): string {
  return value.toLocaleString('en-IN', { style: 'currency', currency, maximumFractionDigits: 2 })
}

export function formatPct(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`
} 