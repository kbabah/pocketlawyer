import { NextRequest, NextResponse } from "next/server";
import { adminDb } from "@/lib/firebase-admin";
import { adminAuth } from "@/lib/firebase-admin";
import { cookies } from "next/headers";

// Helper function to check admin permissions
async function isAdmin(req: NextRequest) {
  try {
    const sessionCookie = cookies().get("firebase-session")?.value;
    
    if (!sessionCookie) {
      console.log("No session cookie");
      return false;
    }
    
    const decodedClaim = await adminAuth.verifySessionCookie(sessionCookie);
    const userDoc = await adminDb.collection("users").doc(decodedClaim.uid).get();
    
    if (!userDoc.exists) {
      console.log("User document does not exist");
      return false;
    }
    
    const userData = userDoc.data();
    return userData?.isAdmin === true || userData?.role === 'admin';
    
  } catch (error) {
    console.error("Error checking admin status:", error);
    return false;
  }
}

// GET /api/admin/blog/[id] - Get a specific blog post
export async function GET(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const admin = await isAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }
    
    const docRef = adminDb.collection("blog-posts").doc(params.id);
    const blogPost = await docRef.get();
    
    if (!blogPost.exists) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }
    
    return NextResponse.json({
      id: blogPost.id,
      ...blogPost.data()
    });
  } catch (error) {
    console.error("Error getting blog post:", error);
    return NextResponse.json({ error: "Failed to fetch blog post" }, { status: 500 });
  }
}

// PUT /api/admin/blog/[id] - Update a blog post
export async function PUT(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const admin = await isAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }
    
    // Get the blog post document reference
    const docRef = adminDb.collection("blog-posts").doc(params.id);
    const blogPost = await docRef.get();
    
    if (!blogPost.exists) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }
    
    // Parse request body
    const body = await req.json();
    
    // Validate required fields
    if (!body.title || !body.content || !body.slug) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }
    
    // Check if slug is already in use by another post
    if (body.slug !== blogPost.data()?.slug) {
      const slugCheck = await adminDb
        .collection("blog-posts")
        .where("slug", "==", body.slug)
        .get();
      
      if (!slugCheck.empty) {
        return NextResponse.json({ error: "Slug already in use. Please choose a different one." }, { status: 400 });
      }
    }
    
    // Handle publication status changes
    const wasPublished = blogPost.data()?.published;
    const isNowPublished = body.published;
    let publishedAt = blogPost.data()?.publishedAt || null;
    
    // If newly published, set publishedAt to now
    if (!wasPublished && isNowPublished) {
      publishedAt = new Date().toISOString();
    }
    
    // Update the blog post
    const updateData = {
      title: body.title,
      slug: body.slug,
      excerpt: body.excerpt,
      content: body.content,
      featuredImage: body.featuredImage || "",
      category: body.category,
      tags: body.tags,
      published: body.published,
      publishedAt: publishedAt,
      updatedAt: new Date().toISOString()
    };
    
    await docRef.update(updateData);
    
    return NextResponse.json({ 
      message: "Blog post updated successfully",
      id: params.id,
      blogPost: { id: params.id, ...updateData }
    });
    
  } catch (error) {
    console.error("Error updating blog post:", error);
    return NextResponse.json({ error: "Failed to update blog post" }, { status: 500 });
  }
}

// DELETE /api/admin/blog/[id] - Delete a blog post
export async function DELETE(
  req: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check if user is admin
    const admin = await isAdmin(req);
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized. Admin access required." }, { status: 403 });
    }
    
    const docRef = adminDb.collection("blog-posts").doc(params.id);
    const blogPost = await docRef.get();
    
    if (!blogPost.exists) {
      return NextResponse.json({ error: "Blog post not found" }, { status: 404 });
    }
    
    await docRef.delete();
    
    return NextResponse.json({ message: "Blog post deleted successfully" });
  } catch (error) {
    console.error("Error deleting blog post:", error);
    return NextResponse.json({ error: "Failed to delete blog post" }, { status: 500 });
  }
}