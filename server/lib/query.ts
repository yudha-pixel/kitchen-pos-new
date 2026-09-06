/**
 * Express parses `?id=a&id=b` (and `?id[]=a`) into an array or object, so a
 * query value is only safe to drop into a Prisma filter when it really is a
 * string. Anything else is treated as absent rather than passed through, which
 * would otherwise let a caller inject a filter object at this trust boundary.
 */
export function queryString(value: unknown): string | undefined {
  return typeof value === 'string' && value.length > 0 ? value : undefined;
}
