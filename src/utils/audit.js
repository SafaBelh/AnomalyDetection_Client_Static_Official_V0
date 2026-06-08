import { emit } from "@/store/db";
import { getUser } from "@/utils/api";

export const auditLog = [];
export function addAuditEntry(action, detail, userId) {
  auditLog.unshift({
    id: `AUD-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    action,
    detail,
    userId: userId || getUser()?.name || "unknown",
    timestamp: new Date().toISOString(),
  });
  if (auditLog.length > 200) auditLog.pop();
  emit();
}

