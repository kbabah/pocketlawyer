/**
 * Server-side knowledge base (Firestore + built-in).
 * Client components must import from `@/lib/knowledge-base-builtin` only.
 */
export * from "@/lib/knowledge-base-builtin";

import { adminDb } from "@/lib/firebase-admin";
import { logger } from "@/lib/logger";
import {
  getKnowledgeContext,
  type KnowledgeEntry,
} from "@/lib/knowledge-base-builtin";

/**
 * Fetch user-uploaded knowledge base documents from Firestore (Admin SDK)
 */
export async function fetchFirestoreKnowledge(
  searchQuery: string,
  category?: string,
  maxResults: number = 3
): Promise<KnowledgeEntry[]> {
  try {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    let q: any = adminDb
      .collection("knowledge_base")
      .orderBy("createdAt", "desc");

    if (category) {
      q = q.where("category", "==", category).limit(maxResults);
    } else {
      q = q.limit(maxResults * 2);
    }

    const snapshot = await q.get();
    const entries: KnowledgeEntry[] = snapshot.docs.map(
      (doc: { id: string; data: () => Record<string, unknown> }) => ({
        id: doc.id,
        ...doc.data(),
      }) as KnowledgeEntry
    );

    if (searchQuery) {
      const words = searchQuery.toLowerCase().split(/\s+/);
      return entries
        .filter((e) => {
          const text =
            `${e.title} ${e.content} ${e.tags?.join(" ")}`.toLowerCase();
          return words.some((w) => text.includes(w));
        })
        .slice(0, maxResults);
    }

    return entries.slice(0, maxResults);
  } catch (error) {
    logger.error("Error fetching Firestore knowledge base:", error);
    return [];
  }
}

/**
 * Get combined context from built-in + Firestore sources
 */
export async function getCombinedKnowledgeContext(
  searchQuery: string,
  category?: KnowledgeEntry["category"]
): Promise<string> {
  const builtInContext = getKnowledgeContext(searchQuery, category);

  let firestoreContext = "";
  try {
    const firestoreEntries = await fetchFirestoreKnowledge(
      searchQuery,
      category
    );
    if (firestoreEntries.length > 0) {
      firestoreContext = "\n\n=== UPLOADED RESOURCES ===\n";
      for (const entry of firestoreEntries) {
        firestoreContext += `\n--- ${entry.title} ---\n${entry.content}\n`;
      }
      firestoreContext += "\n=== END UPLOADED RESOURCES ===\n";
    }
  } catch {
    // Firestore may be unavailable offline — built-in knowledge still works
  }

  return builtInContext + firestoreContext;
}
