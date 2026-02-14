import type { SupabaseClient } from '@supabase/supabase-js';

export interface AuditLogEntry {
  actorId: string;
  action: string;
  entityType: string;
  entityId?: string;
  metadata?: Record<string, unknown>;
}

/**
 * Log a security-sensitive action to the audit_logs table.
 */
export async function auditLog(
  supabase: SupabaseClient,
  entry: AuditLogEntry,
): Promise<void> {
  try {
    await supabase.from('audit_logs').insert({
      user_id: entry.actorId,
      action: entry.action,
      entity_type: entry.entityType,
      entity_id: entry.entityId ?? null,
      metadata: entry.metadata ?? {},
    });
  } catch (err) {
    // Audit logging should never break the request
    console.error('[audit] Failed to log:', err);
  }
}
