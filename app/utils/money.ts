const moneyFormatter = new Intl.NumberFormat('vi-VN')

export function formatMoneyInput(value: string | number | null | undefined) {
  if (value === '' || value === null || value === undefined) return ''

  const digits = String(value).replace(/\D/g, '')
  return digits ? moneyFormatter.format(Number(digits)) : ''
}

export function normalizeMoneyInput(value: string) {
  return value.replace(/\D/g, '')
}
