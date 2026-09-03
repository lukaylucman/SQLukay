import { NextResponse } from 'next/server';
import { ConnectionManager } from '@/server/services/connection-manager';

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { action, connectionId } = body;

    if (action === 'disconnect') {
      if (connectionId) {
        await ConnectionManager.disconnect(connectionId);
      }
      return NextResponse.json({ success: true });
    }

    const { config } = body;
    if (!config) {
      return NextResponse.json({ error: 'Configuration is required' }, { status: 400 });
    }

    const connectionToken = Buffer.from(JSON.stringify(config)).toString('base64');
    await ConnectionManager.connect(connectionToken, config);
    return NextResponse.json({ token: connectionToken });
  } catch (error: any) {
    console.error('Connection error:', error);
    return NextResponse.json({ 
      error: error.message || 'Failed to connect to database',
      details: error.code || 'UNKNOWN_ERROR'
    }, { status: 500 });
  }
}
