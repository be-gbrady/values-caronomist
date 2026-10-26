/**
 * Paid billing is not offered yet.
 *
 * Upgrade buttons, prices, checkout links, and billing emails stay hidden
 * unless this flag is on. Set NEXT_PUBLIC_BILLING_ENABLED=true at build time
 * to bring them back (client components inline this value).
 */
export function isBillingEnabled(): boolean {
  return process.env.NEXT_PUBLIC_BILLING_ENABLED === "true";
}
