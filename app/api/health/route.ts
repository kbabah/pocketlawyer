import { NextResponse } from 'next/server';
import { adminDb } from '@/lib/firebase-admin';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  
  try {
    // Check Firebase connection
    await adminDb.collection('users').limit(1).get();
    
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      services: {
        database: 'connected',
        firebase: 'connected'
      },
      version: process.env.npm_package_version || '0.1.0'
    }, { status: 200 });
  } catch (error) {
    const responseTime = Date.now() - startTime;
    
    return NextResponse.json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      responseTime: `${responseTime}ms`,
      error: error instanceof Error ? error.message : 'Unknown error',
      services: {
        database: 'disconnected',
        firebase: 'error'
      }
    }, { status: 503 });
  }
}
