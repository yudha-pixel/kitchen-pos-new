import { Request } from 'express';
import { PERMISSIONS } from '../../src/config/permissions';

/**
 * Which outlet's data a request is allowed to see.
 *
 * Until now nothing checked this: any authenticated user could pass any
 * `outlet_id` and read another branch's tables. With the mobile app about to
 * let staff pick an outlet at login, that had to become an explicit rule
 * rather than an accident of which routes happened to filter.
 *
 * The rule:
 *  - Records with no outlet (`outlet_id` null) are shared and readable by all.
 *    Every product in the catalogue is currently in this state, so the menu
 *    stays global until products are actually assigned to branches.
 *  - A user may always read their own outlet.
 *  - Reading across outlets requires `outlets.view`, which is how the platform
 *    already marks back-office/multi-branch roles.
 */
export function canAccessOutlet(req: Request, outletId?: string | null): boolean {
  if (!outletId) return true;
  if (req.user?.outlet_id && req.user.outlet_id === outletId) return true;
  return req.userPermissions?.includes(PERMISSIONS.outlets.view) ?? false;
}

/**
 * Resolves the outlet a list endpoint should be scoped to.
 *
 * @param requested `outlet_id` from the query string, if the caller asked for one.
 * @returns the outlet id to filter on, `null` to apply no filter (the caller may
 *   see every outlet), or `'denied'` when the caller asked for an outlet they
 *   have no access to.
 */
export function resolveOutletFilter(
  req: Request,
  requested?: unknown
): string | null | 'denied' {
  const requestedId = typeof requested === 'string' && requested.length > 0 ? requested : null;

  if (requestedId) {
    return canAccessOutlet(req, requestedId) ? requestedId : 'denied';
  }

  // No explicit request: multi-branch roles see everything, everyone else is
  // pinned to their own outlet so a stray client cannot fan out across branches.
  const seesAllOutlets = req.userPermissions?.includes(PERMISSIONS.outlets.view) ?? false;
  if (seesAllOutlets) return null;

  return req.user?.outlet_id ?? null;
}
