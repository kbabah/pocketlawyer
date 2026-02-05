import { NextResponse } from 'next/server';
import { sendEmail, testEmailService } from '@/lib/email-service';
import { adminAuth } from '@/lib/firebase-admin';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { cookies } from 'next/headers';

// Function to verify if a user is an admin
async function isAdmin(userId: string): Promise<boolean> {
  try {
    // Use your admin authentication check method here
    const user = await adminAuth.getUser(userId);
    return user.customClaims?.admin === true;
  } catch (error) {
    console.error('Error checking admin status:', error);
    return false;
  }
}

// Get user ID from Firebase session cookie
async function getUserIdFromSession(): Promise<string | null> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get('firebase-session');
    
    if (!sessionCookie?.value) {
      return null;
    }
    
    // Verify the session cookie
    const decodedClaims = await adminAuth.verifySessionCookie(sessionCookie.value, true);
    return decodedClaims.uid;
  } catch (error) {
    console.error('Error verifying session:', error);
    return null;
  }
}

// Test the email configuration
export async function GET(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Simple email test that doesn't require admin privileges
    const email = req.url.includes('email=') 
      ? new URL(req.url).searchParams.get('email') 
      : null;
      
    if (!email) {
      return NextResponse.json({ error: 'Email parameter is required' }, { status: 400 });
    }
    
    const result = await testEmailService(email);
    
    return NextResponse.json(result);
  } catch (error) {
    console.error('Email test failed:', error);
    return NextResponse.json({ error: 'Failed to test email service' }, { status: 500 });
  }
}

// Send bulk emails (admin only)
export async function POST(req: Request) {
  try {
    const userId = await getUserIdFromSession();
    
    if (!userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    
    // Check if the user is an admin
    const adminStatus = await isAdmin(userId);
    if (!adminStatus) {
      return NextResponse.json({ error: 'Admin privileges required' }, { status: 403 });
    }
    
    const body = await req.json();
    const { 
      template, 
      subject, 
      data = {},
      targetGroups = ['all'],
      testMode = false
    } = body;
    
    if (!template) {
      return NextResponse.json({ error: 'Template is required' }, { status: 400 });
    }
    
    // Get target users based on targetGroups
    let targetUsers: { email: string; name?: string }[] = [];
    
    // Maximum number of emails to send in test mode
    const TEST_MODE_LIMIT = 5;
    
    // Query users based on target groups
    if (targetGroups.includes('all')) {
      const usersSnapshot = await getDocs(collection(db, 'users'));
      targetUsers = usersSnapshot.docs
        .map(doc => ({
          email: doc.data().email,
          name: doc.data().name
        }))
        .filter(user => !!user.email);
    } else {
      // Handle specific target groups - example implementation
      if (targetGroups.includes('inactive')) {
        // Query inactive users (not logged in for 30 days)
        // Implementation depends on your user activity tracking
      }
      
      if (targetGroups.includes('trial')) {
        // Query users on trial
      }
      
      // Add more target groups as needed
    }
    
    // Limit recipients in test mode
    if (testMode && targetUsers.length > TEST_MODE_LIMIT) {
      targetUsers = targetUsers.slice(0, TEST_MODE_LIMIT);
    }
    
    // Send emails
    const results = await Promise.all(
      targetUsers.map(async user => {
        try {
          const result = await sendEmail({
            to: user.email,
            subject: subject || undefined,
            template,
            data: {
              name: user.name,
              ...data
            }
          });
          
          return {
            email: user.email,
            success: !!result.success,
            messageId: result.messageId
          };
        } catch (error) {
          return {
            email: user.email,
            success: false,
            error: (error as Error).message
          };
        }
      })
    );
    
    // Count successes and failures
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    return NextResponse.json({
      total: results.length,
      successful,
      failed,
      testMode,
      results: testMode ? results : undefined // Only return detailed results in test mode
    });
  } catch (error) {
    console.error('Bulk email send failed:', error);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}