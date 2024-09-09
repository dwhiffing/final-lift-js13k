export function floatToHex(value) {
  value = Math.max(0, Math.min(1, value))

  const intValue = Math.round(value * 255)

  return intValue.toString(16).padStart(2, '0').toUpperCase()
}
