import { NextResponse } from 'next/server';
import { adminAuth } from '@/lib/firebase/admin';

export async function verifyAuth(req: Request): Promise<{ userId: string; email?: string } | { error: string; status: number }> {
  try {
    const authHeader = req.headers.get('Authorization');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return { error: 'Missing or invalid authorization header', status: 401 };
    }

    const token = authHeader.replace('Bearer ', '');
    
    if (!adminAuth) {
      console.error('Firebase Admin Auth not initialized');
      return { error: 'Authentication service unavailable', status: 503 };
    }

    const decodedToken = await adminAuth.verifyIdToken(token);
    
    return { userId: decodedToken.uid, email: decodedToken.email };
  } catch (error) {
    console.error('Auth verification failed:', error);
    return { error: 'Invalid or expired token', status: 401 };
  }
}

export async function verifyAuthOrUserId(req: Request): Promise<{ userId: string } | { error: string; status: number }> {
  const authResult = await verifyAuth(req);
  
  if ('userId' in authResult) {
    return authResult;
  }

  try {
    const body = await req.json();
    const userIdFromBody = body.userId;
    
    if (userIdFromBody && typeof userIdFromBody === 'string') {
      console.warn('Auth verification bypassed, using userId from request body:', userIdFromBody);
      return { userId: userIdFromBody };
    }
  } catch {
    // Body parsing failed, continue with auth error
  }

  return authResult;
}
