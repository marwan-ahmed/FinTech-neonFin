import { eq, and, SQL } from 'drizzle-orm';

/**
 * 🔒 tenantCondition
 * Ensures strict tenant isolation by always returning a condition that filters by the user's tenantId.
 * Prevents IDOR (Insecure Direct Object Reference) vulnerabilities.
 * If the user is a superadmin, it returns undefined (no restriction).
 */
export function tenantCondition(
  tableTenantColumn: any, 
  user: { role?: string; tenantId?: string | null }
): SQL<unknown> | undefined {
  if (user.role === 'superadmin') {
    return undefined;
  }
  
  if (!user.tenantId) {
    throw new Error('SEC_ERR: User has no assigned tenant. Access Denied.');
  }

  return eq(tableTenantColumn, user.tenantId);
}

/**
 * 🔒 tenantAndCondition
 * Combines a specific query condition (e.g., id = 5) with the strict tenant isolation condition.
 */
export function tenantAndCondition(
  tableTenantColumn: any, 
  user: { role?: string; tenantId?: string | null }, 
  otherCondition: SQL<unknown> | undefined
): SQL<unknown> | undefined {
  const tCond = tenantCondition(tableTenantColumn, user);
  
  if (!tCond) return otherCondition;
  if (!otherCondition) return tCond;
  
  return and(otherCondition, tCond);
}
