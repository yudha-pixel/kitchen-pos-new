/**
 * How a submitted CustomerOrder reaches the kitchen. Configurable via
 * AppSettings.selforder_routing, resolved the same defensive way as
 * paymentMethods.ts: an unrecognized value falls back to the safe default
 * rather than being trusted as-is.
 */

export type SelfOrderRoutingMode = 'review' | 'auto';

export const DEFAULT_SELF_ORDER_ROUTING: SelfOrderRoutingMode = 'review';

export function resolveSelfOrderRouting(configured: unknown): SelfOrderRoutingMode {
  return configured === 'auto' ? 'auto' : DEFAULT_SELF_ORDER_ROUTING;
}
