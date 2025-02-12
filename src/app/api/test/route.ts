import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    console.log('📝 Test API route called');
    return NextResponse.json({ message: 'Test API is working', timestamp: new Date().toISOString() });
  } catch (error) {
    console.error('Test API error:', error);
    return NextResponse.json({ error: 'Test API failed' }, { status: 500 });
  }
}
