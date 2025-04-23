import { NextRequest, NextResponse } from 'next/server';
import { verifyAdmin } from '../middleware';
import { adminDb } from '@/lib/firebase-admin';
import { adminRateLimit } from '@/lib/admin/rate-limit';
import { logAdminAction } from '@/lib/admin/auth';

/**
 * GET /api/admin/users
 * Returns a list of users with optional filtering
 */
export async function GET(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await adminRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;
    
    // Verify admin status
    const adminId = await verifyAdmin(request);

    // Get query parameters
    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const role = searchParams.get('role'); // 'user', 'lawyer', 'admin'
    const status = searchParams.get('status'); // 'active', 'blocked', 'pending'
    const search = searchParams.get('search');
    
    // Initialize query
    let query = adminDb.collection('users');
    
    // Apply filters if provided
    if (role) {
      if (role === 'lawyer') {
        query = query.where('isLawyer', '==', true);
      } else if (role === 'admin') {
        query = query.where('isAdmin', '==', true);
      } else if (role === 'user') {
        query = query.where('isLawyer', '==', false).where('isAdmin', '==', false);
      }
    }
    
    if (status) {
      query = query.where('status', '==', status);
    }
    
    // Execute query
    const snapshot = await query.limit(limit).offset(offset).get();
    
    // Format results
    const users = snapshot.docs.map(doc => {
      const data = doc.data();
      return {
        id: doc.id,
        email: data.email,
        displayName: data.displayName,
        photoURL: data.photoURL,
        isLawyer: data.isLawyer || false,
        isAdmin: data.isAdmin || false,
        status: data.status || 'active',
        createdAt: data.createdAt,
        lastLogin: data.lastLogin
      };
    });
    
    // If search parameter is provided, filter results client-side
    // Note: For production, consider using a search service like Algolia for better search
    let filteredUsers = users;
    if (search) {
      const lowercaseSearch = search.toLowerCase();
      filteredUsers = users.filter(user => 
        user.email?.toLowerCase().includes(lowercaseSearch) || 
        user.displayName?.toLowerCase().includes(lowercaseSearch)
      );
    }
    
    // Log admin action
    await logAdminAction(adminId, 'list', 'users', 'all', { 
      limit, offset, role, status, search 
    });
    
    return NextResponse.json({
      users: filteredUsers,
      total: filteredUsers.length,
      limit,
      offset
    });
    
  } catch (error: any) {
    console.error('Error in admin/users GET:', error);
    
    if (error.message === 'User is not an admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    if (error.message === 'Missing or invalid authorization token') {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/admin/users
 * Updates a user's status or role
 */
export async function PATCH(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await adminRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;
    
    // Verify admin status
    const adminId = await verifyAdmin(request);
    
    // Parse request body
    const { userId, action, ...updateData } = await request.json();
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    // Get user reference
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    // Process different actions
    switch (action) {
      case 'block':
        await userRef.update({ status: 'blocked' });
        break;
      case 'unblock':
        await userRef.update({ status: 'active' });
        break;
      case 'makeAdmin':
        await userRef.update({ isAdmin: true });
        break;
      case 'removeAdmin':
        await userRef.update({ isAdmin: false });
        break;
      case 'update':
        // Only allow updating certain fields
        const allowedFields = ['displayName', 'email', 'phoneNumber'];
        const sanitizedUpdate = Object.entries(updateData)
          .filter(([key]) => allowedFields.includes(key))
          .reduce((obj, [key, value]) => ({ ...obj, [key]: value }), {});
        
        await userRef.update(sanitizedUpdate);
        break;
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
    
    // Log admin action
    await logAdminAction(adminId, action, 'user', userId, updateData);
    
    return NextResponse.json({
      success: true,
      message: `User ${userId} ${action} successfully`
    });
    
  } catch (error: any) {
    console.error('Error in admin/users PATCH:', error);
    
    if (error.message === 'User is not an admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    if (error.message === 'Missing or invalid authorization token') {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/admin/users
 * Deletes a user (soft delete by default)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Apply rate limiting
    const rateLimitResponse = await adminRateLimit(request);
    if (rateLimitResponse) return rateLimitResponse;
    
    // Verify admin status
    const adminId = await verifyAdmin(request);
    
    // Get user ID from URL
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const hardDelete = searchParams.get('hardDelete') === 'true';
    
    if (!userId) {
      return NextResponse.json(
        { error: 'User ID is required' },
        { status: 400 }
      );
    }
    
    const userRef = adminDb.collection('users').doc(userId);
    const userDoc = await userRef.get();
    
    if (!userDoc.exists) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }
    
    if (hardDelete) {
      // Hard delete - actually remove from database
      // This is dangerous and should be used with caution
      await userRef.delete();
    } else {
      // Soft delete - mark as deleted but keep record
      await userRef.update({
        status: 'deleted',
        deletedAt: new Date().toISOString(),
        deletedBy: adminId
      });
    }
    
    // Log admin action
    await logAdminAction(adminId, hardDelete ? 'hardDelete' : 'softDelete', 'user', userId);
    
    return NextResponse.json({
      success: true,
      message: `User ${userId} successfully ${hardDelete ? 'deleted' : 'marked as deleted'}`
    });
    
  } catch (error: any) {
    console.error('Error in admin/users DELETE:', error);
    
    if (error.message === 'User is not an admin') {
      return NextResponse.json(
        { error: 'Unauthorized: Admin access required' },
        { status: 403 }
      );
    }
    
    if (error.message === 'Missing or invalid authorization token') {
      return NextResponse.json(
        { error: 'Unauthorized: Authentication required' },
        { status: 401 }
      );
    }
    
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}