import { NextResponse } from 'next/server';
import { generateCSRFToken, getCSRFHeaderName } from '@/lib/csrf';

/**
 * GET /api/csrf
 * Get a CSRF token for API requests
 */
export async function GET() {
  const token = await generateCSRFToken();

  return NextResponse.json({
    token,
    headerName: getCSRFHeaderName(),
  });
}
