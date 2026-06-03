// Stripe adapter. Real Embedded Checkout requires a backend session endpoint
// and a publishable key. Until those exist, `startCheckout` resolves a mock
// success so the premium flow is exercisable end-to-end in development.

const publishableKey = import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY as string | undefined;

export const isStripeEnabled = Boolean(publishableKey);

export interface CheckoutResult {
  success: boolean;
  mock: boolean;
}

/**
 * Begin checkout for a plan. In mock mode (no Stripe key) it simulates a brief
 * processing delay then returns success, letting the caller unlock premium.
 */
export async function startCheckout(plan: 'monthly' | 'yearly'): Promise<CheckoutResult> {
  if (!isStripeEnabled) {
    await new Promise((r) => setTimeout(r, 900));
    return { success: true, mock: true };
  }
  // Real integration point: create a Checkout Session on your backend with the
  // chosen plan's price id, then mount Stripe Embedded Checkout with the
  // returned client secret. Returning mock success as a safe placeholder.
  void plan;
  await new Promise((r) => setTimeout(r, 900));
  return { success: true, mock: true };
}
