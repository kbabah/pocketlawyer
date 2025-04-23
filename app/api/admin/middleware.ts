import { NextRequest } from 'next/server';
import { verifyAdminToken } from '@/lib/admin/auth';

export async function verifyAdmin(request: NextRequest): Promise<string> {
  // Use the shared admin authentication utility
  return verifyAdminToken(request);
}