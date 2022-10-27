export function valuePair(count: number, offset = 0) {
  return Array(count)
    .fill(null)
    .map((_, i) => `$${i + 1 + offset}`)
    .join(',');
}
