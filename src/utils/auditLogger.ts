/**
 * Unified Audit Logging Service for Fana Voice News Studio
 * Tracks all user interactions, broadcast productions, content saves, and security operations.
 */

import { collection, addDoc, getDocs, query, orderBy, limit, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { handleFirestoreError, OperationType } from "../firebase/errorHandler";

export type AuditCategory = "news" | "broadcast" | "audio" | "dictionary" | "admin" | "auth";

export interface AuditLogItem {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  action: string;
  actionLabelAmharic: string;
  category: AuditCategory;
  details: string;
  metadata?: string;
  createdAt: string;
}

const LOCAL_AUDIT_STORAGE_KEY = "fana_studio_audit_logs";

/**
 * Get device/browser user agent info safely
 */
function getClientEnvironment(): string {
  if (typeof navigator !== "undefined") {
    const ua = navigator.userAgent;
    const isMobile = /mobile/i.test(ua);
    return `${isMobile ? "Mobile" : "Desktop"} • ${navigator.language || "en"}`;
  }
  return "Web Studio";
}

/**
 * Record an audit log entry in Firestore with LocalStorage caching
 */
export async function recordAuditLog(params: {
  action: string;
  actionLabelAmharic: string;
  category: AuditCategory;
  details: string;
  metadata?: Record<string, any>;
}): Promise<AuditLogItem> {
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid || "guest_journalist";
  const userEmail = currentUser?.email || "journalist@fanastudio.local";
  const userName = currentUser?.displayName || userEmail.split("@")[0] || "ጋዜጠኛ";

  const logId = "log_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const logEntry: AuditLogItem = {
    id: logId,
    userId,
    userEmail,
    userName,
    action: params.action,
    actionLabelAmharic: params.actionLabelAmharic,
    category: params.category,
    details: params.details,
    metadata: JSON.stringify({
      ...params.metadata,
      env: getClientEnvironment(),
    }),
    createdAt: now,
  };

  // 1. Cache in LocalStorage immediately
  try {
    const stored = localStorage.getItem(LOCAL_AUDIT_STORAGE_KEY);
    const list: AuditLogItem[] = stored ? JSON.parse(stored) : [];
    list.unshift(logEntry);
    // Keep last 150 items locally
    localStorage.setItem(LOCAL_AUDIT_STORAGE_KEY, JSON.stringify(list.slice(0, 150)));
  } catch (e) {
    console.warn("Could not cache audit log locally:", e);
  }

  // 2. Persist to Firestore if authenticated
  if (currentUser) {
    try {
      await addDoc(collection(db, "auditLogs"), {
        ...logEntry,
      });
    } catch (err) {
      console.warn("Could not persist audit log to Firestore:", err);
    }
  }

  return logEntry;
}

/**
 * Fetch audit logs from Firestore (or LocalStorage fallback)
 */
export async function fetchAuditLogs(limitCount = 100): Promise<AuditLogItem[]> {
  const localLogs: AuditLogItem[] = (() => {
    try {
      const stored = localStorage.getItem(LOCAL_AUDIT_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  })();

  const currentUser = auth.currentUser;
  if (!currentUser) {
    return localLogs;
  }

  try {
    const q = query(collection(db, "auditLogs"), orderBy("createdAt", "desc"), limit(limitCount));
    const snapshot = await getDocs(q);
    const firestoreLogs: AuditLogItem[] = [];
    snapshot.forEach((d) => {
      firestoreLogs.push(d.data() as AuditLogItem);
    });

    if (firestoreLogs.length > 0) {
      // Merge unique logs
      const map = new Map<string, AuditLogItem>();
      firestoreLogs.forEach((l) => map.set(l.id, l));
      localLogs.forEach((l) => {
        if (!map.has(l.id)) map.set(l.id, l);
      });
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return localLogs;
  } catch (err) {
    console.warn("Fetching audit logs from Firestore failed, using cached logs:", err);
    return localLogs;
  }
}

/**
 * Export audit logs as CSV
 */
export function exportAuditLogsAsCSV(logs: AuditLogItem[]): void {
  const headers = ["ID", "ቀን (Date)", "ጋዜጠኛ (User)", "ኢሜይል (Email)", "ድርጊት (Action)", "ምድብ (Category)", "ዝርዝር (Details)"];
  const rows = logs.map((l) => [
    `"${l.id}"`,
    `"${new Date(l.createdAt).toLocaleString("am-ET")}"`,
    `"${l.userName.replace(/"/g, '""')}"`,
    `"${l.userEmail}"`,
    `"${l.actionLabelAmharic.replace(/"/g, '""')}"`,
    `"${l.category}"`,
    `"${l.details.replace(/"/g, '""')}"`,
  ]);

  const csvContent = "\uFEFF" + [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
  const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fana_studio_audit_log_${new Date().toISOString().slice(0, 10)}.csv`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

/**
 * Export audit logs as JSON
 */
export function exportAuditLogsAsJSON(logs: AuditLogItem[]): void {
  const jsonStr = JSON.stringify(logs, null, 2);
  const blob = new Blob([jsonStr], { type: "application/json" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `fana_studio_audit_log_${new Date().toISOString().slice(0, 10)}.json`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
