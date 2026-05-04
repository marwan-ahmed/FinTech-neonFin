import { db } from './db';
import { auditLogs } from '@/schema/schema';

type AuditLogParams = {
  tenantId: string;
  userId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  details?: Record<string, any>;
};

/**
 * دالة مساعدة لتسجيل حركات المستخدمين في النظام بصمت
 * بدون التأثير على سير العمل الأساسي في حالة حدوث خطأ
 */
export async function logAudit({ tenantId, userId, action, entityType, entityId, details }: AuditLogParams) {
  try {
    await db.insert(auditLogs).values({
      tenantId,
      userId: userId || null,
      action,
      entityType,
      entityId,
      details: details || null,
      createdAt: new Date(),
    });
  } catch (error) {
    // SECURITY: Silent Failures here are accepted only because we don't want 
    // a logging error to break a financial transaction. We log it to the server console.
    console.error('[AUDIT_LOG_ERROR] Failed to save audit log:', error);
  }
}
