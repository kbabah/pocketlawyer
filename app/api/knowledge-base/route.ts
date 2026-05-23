import { NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import {
  getBuiltInKnowledgeCatalog,
  KNOWLEDGE_CATEGORY_LABELS,
} from "@/lib/knowledge-base";

export const dynamic = "force-dynamic";

/** Public catalog: built-in entries + admin-uploaded summaries */
export async function GET() {
  try {
    const snapshot = await adminDb
      .collection("knowledge_base")
      .orderBy("createdAt", "desc")
      .limit(200)
      .get();

    const uploaded = snapshot.docs.map((doc) => {
      const data = doc.data();
      const content = String(data.content || "");
      return {
        id: doc.id,
        source: "uploaded" as const,
        category: data.category || "statute",
        title: data.title || "Untitled",
        contentPreview:
          content.length > 400 ? `${content.slice(0, 400)}…` : content,
        tags: data.tags || [],
        jurisdiction: data.jurisdiction || "",
        sourceRef: data.source || "",
      };
    });

    const builtin = getBuiltInKnowledgeCatalog().map((entry) => ({
      id: entry.id,
      source: "builtin" as const,
      category: entry.category,
      title: entry.title,
      contentPreview:
        entry.content.length > 400
          ? `${entry.content.slice(0, 400)}…`
          : entry.content,
      tags: entry.tags,
      jurisdiction: entry.jurisdiction,
      sourceRef: entry.source || "",
    }));

    return NextResponse.json({
      categories: KNOWLEDGE_CATEGORY_LABELS,
      builtin,
      uploaded,
    });
  } catch (error) {
    console.error("Knowledge base API error:", error);
    return NextResponse.json(
      {
        categories: KNOWLEDGE_CATEGORY_LABELS,
        builtin: getBuiltInKnowledgeCatalog().map((entry) => ({
          id: entry.id,
          source: "builtin" as const,
          category: entry.category,
          title: entry.title,
          contentPreview:
            entry.content.length > 400
              ? `${entry.content.slice(0, 400)}…`
              : entry.content,
          tags: entry.tags,
          jurisdiction: entry.jurisdiction,
          sourceRef: entry.source || "",
        })),
        uploaded: [],
      },
      { status: 200 }
    );
  }
}
