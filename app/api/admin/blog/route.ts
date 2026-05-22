import { NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { adminDb } from "@/lib/firebase-admin";
import type { Query, DocumentData } from "firebase-admin/firestore";
import { requireAdmin } from "@/lib/api-auth";

// GET /api/admin/blog - Get all blog posts with optional filtering
export async function GET(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    
    // Get query parameters for filtering
    const url = new URL(req.url);
    const category = url.searchParams.get("category");
    const status = url.searchParams.get("status");
    
    // Build Firestore query
    let query: Query<DocumentData, DocumentData> = adminDb.collection("blog-posts");
    
    if (category && category !== "all") {
      query = query.where("category", "==", category);
    }
    
    if (status === "published") {
      query = query.where("published", "==", true);
    } else if (status === "draft") {
      query = query.where("published", "==", false);
    }
    
    // Order by date, most recent first
    query = query.orderBy("updatedAt", "desc");
    
    const snapshot = await query.get();
    const posts = snapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));
    
    return NextResponse.json({ posts });
  } catch (error) {
    logger.error("Error getting blog posts:", error);
    return NextResponse.json({ error: "Failed to fetch blog posts" }, { status: 500 });
  }
}

// POST /api/admin/blog - Create a new blog post
export async function POST(req: NextRequest) {
  const authResult = await requireAdmin(req);
  if (authResult instanceof NextResponse) return authResult;

  try {
    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.title || !body.content || !body.slug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Check if slug is already in use
    const slugCheck = await adminDb.collection("blog-posts").where("slug", "==", body.slug).get();
    if (!slugCheck.empty) {
      return NextResponse.json({ error: "Slug already in use. Please choose a different one." }, { status: 400 });
    }
    
    // Prepare blog post data
    const now = new Date().toISOString();
    const blogPost = {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content,
      featuredImage: body.featuredImage || "",
      category: body.category,
      tags: body.tags,
      author: body.author,
      published: body.published || false,
      publishedAt: body.published ? (body.publishedAt || now) : null,
      createdAt: now,
      updatedAt: now,
      views: 0,
      likes: 0,
      comments: []
    };
    
    // Save to Firestore
    const docRef = await adminDb.collection("blog-posts").add(blogPost);
    
    return NextResponse.json({ 
      message: "Blog post created successfully", 
      id: docRef.id,
      blogPost: { id: docRef.id, ...blogPost }
    }, { status: 201 });
    
  } catch (error) {
    logger.error("Error creating blog post:", error);
    return NextResponse.json({ error: "Failed to create blog post" }, { status: 500 });
  }
}
