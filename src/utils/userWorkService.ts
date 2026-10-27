/**
 * User Work Service for Fana Voice News Studio
 * Manages saved news stories, scripts, broadcast video recordings, and exported packages.
 */

import {
  collection,
  doc,
  setDoc,
  getDocs,
  deleteDoc,
  query,
  orderBy,
  limit,
} from "firebase/firestore";
import { db, auth } from "../firebase/config";
import { recordAuditLog } from "./auditLogger";

export type WorkItemType = "script" | "broadcast_video" | "audio_export" | "interview";

export interface UserWorkItem {
  id: string;
  userId: string;
  userEmail: string;
  userName: string;
  title: string;
  type: WorkItemType;
  content: string;
  category?: string;
  anchorId?: string;
  anchorName?: string;
  durationSeconds?: number;
  musicBed?: string;
  mediaUrl?: string;
  status?: string;
  createdAt: string;
  updatedAt: string;
}

const LOCAL_WORKS_KEY = "fana_studio_user_works";

/**
 * Seed initial sample work for first-time visual clarity if empty
 */
const DEFAULT_SAMPLE_WORKS: UserWorkItem[] = [
  {
    id: "work_sample_prime_01",
    userId: "system",
    userEmail: "editor@fanastudio.et",
    userName: "የዜና ክፍል አዘጋጅ",
    title: "የምሽት 2:00 አበይት ዜናዎች ስብስብ",
    type: "script",
    content: "ሰላም ጤና ይስጥልን ክቡራትና ክቡራን ተመልካቾቻችን! የዛሬው አበይት ዜናዎች ስብስብ ይዘን ቀርበናል...",
    category: "ፖለቲካና ኢኮኖሚ",
    anchorId: "anchor_dawit",
    anchorName: "ዳዊት ከበደ",
    durationSeconds: 32,
    musicBed: "breaking",
    status: "published",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 5).toISOString(),
  },
  {
    id: "work_sample_interview_02",
    userId: "system",
    userEmail: "interview@fanastudio.et",
    userName: "ዳዊትና ጅቦ ተንታኝ",
    title: "የዲጂታል ኢኮኖሚና ፈጠራ ልዩ ቃለ-መጠይቅ",
    type: "interview",
    content: "ጠያቂ፦ ዛሬ በስቱዲዮአችን የኢኮኖሚ ባለሙያችንን ጋብዘናል። ተጠያቂ፦ በጣም አመሰግናለሁ፤ በአሁኑ ወቅት የዲጂታል ዘርፉ እያደገ ነው...",
    category: "ቴክኖሎጂና ውይይት",
    anchorId: "hyena_anchor",
    anchorName: "ዳዊት ከበደ & ጅቦ ተንታኝ",
    durationSeconds: 45,
    musicBed: "prime",
    status: "exported",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 24).toISOString(),
  },
];

/**
 * Save or Update a User Work Item
 */
export async function saveUserWork(data: {
  id?: string;
  title: string;
  type: WorkItemType;
  content: string;
  category?: string;
  anchorId?: string;
  anchorName?: string;
  durationSeconds?: number;
  musicBed?: string;
  mediaUrl?: string;
  status?: string;
}): Promise<UserWorkItem> {
  const currentUser = auth.currentUser;
  const userId = currentUser?.uid || "guest_journalist";
  const userEmail = currentUser?.email || "journalist@fanastudio.local";
  const userName = currentUser?.displayName || userEmail.split("@")[0] || "ጋዜጠኛ";

  const workId = data.id || "work_" + Date.now() + "_" + Math.random().toString(36).substring(2, 7);
  const now = new Date().toISOString();

  const item: UserWorkItem = {
    id: workId,
    userId,
    userEmail,
    userName,
    title: data.title.trim() || "ርዕስ አልባ የስቱዲዮ ስራ",
    type: data.type,
    content: data.content,
    category: data.category || "አጠቃላይ ዜና",
    anchorId: data.anchorId || "anchor_dawit",
    anchorName: data.anchorName || "ዳዊት ከበደ",
    durationSeconds: data.durationSeconds || 30,
    musicBed: data.musicBed || "breaking",
    mediaUrl: data.mediaUrl,
    status: data.status || "saved",
    createdAt: now,
    updatedAt: now,
  };

  // 1. Save in local storage
  try {
    const raw = localStorage.getItem(LOCAL_WORKS_KEY);
    const list: UserWorkItem[] = raw ? JSON.parse(raw) : [...DEFAULT_SAMPLE_WORKS];
    const existingIndex = list.findIndex((w) => w.id === item.id);
    if (existingIndex >= 0) {
      list[existingIndex] = { ...list[existingIndex], ...item, updatedAt: now };
    } else {
      list.unshift(item);
    }
    localStorage.setItem(LOCAL_WORKS_KEY, JSON.stringify(list));
  } catch (err) {
    console.warn("Could not write work to localStorage:", err);
  }

  // 2. Persist to Firestore if authenticated
  if (currentUser) {
    try {
      await setDoc(doc(db, "userWorks", workId), item);
    } catch (err) {
      console.warn("Could not write work to Firestore:", err);
    }
  }

  // 3. Record Audit Log entry
  await recordAuditLog({
    action: "WORK_SAVED",
    actionLabelAmharic:
      data.type === "broadcast_video"
        ? "የስቱዲዮ ቪዲዮ ስርጭት ተቀመጠ"
        : data.type === "audio_export"
        ? "የድምፅ ፓኬጅ ተመዘገበ"
        : "የዜና ስክሪፕት ስራ ተመዘገበ",
    category: data.type === "script" ? "news" : "broadcast",
    details: `ርዕስ፦ "${item.title}" (${item.category || "አጠቃላይ"} • ${item.anchorName})`,
    metadata: { workId: item.id, type: item.type },
  });

  return item;
}

/**
 * Fetch all User Work Items
 */
export async function fetchUserWorks(): Promise<UserWorkItem[]> {
  const localList: UserWorkItem[] = (() => {
    try {
      const raw = localStorage.getItem(LOCAL_WORKS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
      return DEFAULT_SAMPLE_WORKS;
    } catch {
      return DEFAULT_SAMPLE_WORKS;
    }
  })();

  const currentUser = auth.currentUser;
  if (!currentUser) {
    return localList;
  }

  try {
    const q = query(collection(db, "userWorks"), orderBy("createdAt", "desc"), limit(100));
    const snap = await getDocs(q);
    const firestoreWorks: UserWorkItem[] = [];
    snap.forEach((d) => {
      firestoreWorks.push(d.data() as UserWorkItem);
    });

    if (firestoreWorks.length > 0) {
      const map = new Map<string, UserWorkItem>();
      firestoreWorks.forEach((w) => map.set(w.id, w));
      localList.forEach((w) => {
        if (!map.has(w.id)) map.set(w.id, w);
      });
      return Array.from(map.values()).sort(
        (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
    }
    return localList;
  } catch (err) {
    console.warn("Could not fetch user works from Firestore:", err);
    return localList;
  }
}

/**
 * Delete a User Work Item
 */
export async function deleteUserWork(workId: string, title?: string): Promise<boolean> {
  // 1. Remove from local storage
  try {
    const raw = localStorage.getItem(LOCAL_WORKS_KEY);
    if (raw) {
      const list: UserWorkItem[] = JSON.parse(raw);
      const filtered = list.filter((w) => w.id !== workId);
      localStorage.setItem(LOCAL_WORKS_KEY, JSON.stringify(filtered));
    }
  } catch (err) {
    console.warn("Failed to remove work from localStorage:", err);
  }

  // 2. Remove from Firestore if online
  if (auth.currentUser) {
    try {
      await deleteDoc(doc(db, "userWorks", workId));
    } catch (err) {
      console.warn("Failed to delete work from Firestore:", err);
    }
  }

  // 3. Record Audit Log
  await recordAuditLog({
    action: "WORK_DELETED",
    actionLabelAmharic: "የተጠቃሚ ስራ ተሰረዘ",
    category: "news",
    details: `የስራ መለያ፦ ${workId} ${title ? `("${title}")` : ""}`,
    metadata: { workId },
  });

  return true;
}
