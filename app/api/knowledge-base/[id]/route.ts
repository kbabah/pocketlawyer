import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { getBuiltInKnowledgeCatalog } from "@/lib/knowledge-base-builtin";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const source = _req.nextUrl.searchParams.get("source") || "uploaded";

  if (source === "builtin") {
    const entry = getBuiltInKnowledgeCatalog().find((e) => e.id === id);
    if (!entry) {
      return NextResponse.json({ error: "Not found" }, { status: 404 });
    }
    return NextResponse.json({ source: "builtin", entry });
  }

  const snap = await adminDb.collection("knowledge_base").doc(id).get();
  if (!snap.exists) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  return NextResponse.json({
    source: "uploaded",
    entry: { id: snap.id, ...snap.data() },
  });
}
