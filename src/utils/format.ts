/**
 * Format a number as USD currency
 */
export function formatPrice(price: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 2,
    maximumFractionDigits: price < 1 ? 4 : 2,
  }).format(price);
}

/**
 * Format a crypto holding amount
 */
export function formatHolding(amount: number): string {
  if (amount === 0) return "0";
  if (amount < 0.0001) return amount.toExponential(2);
  return amount.toLocaleString("en-US", { maximumFractionDigits: 6 });
}

/**
 * Format relative time (e.g., "just now", "2 minutes ago")
 */
export function formatTimeAgo(date: Date): string {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  return `${minutes} minute${minutes !== 1 ? "s" : ""} ago`;
}
