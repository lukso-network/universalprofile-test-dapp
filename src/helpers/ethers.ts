export function formatNumber(number: number): string {
  return new Intl.NumberFormat("de-CH").format(number);
}
