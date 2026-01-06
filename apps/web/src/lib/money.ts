/**
 * Convert integer cents into a readable currency string.
 * Keep money as cents in code; only format for display.
 */
export function formatMoney(cents: number, currency = "EUR") {
  const value = (cents ?? 0) / 100;
  return new Intl.NumberFormat(undefined, {
    style: "currency",
    currency,
  }).format(value);
}
