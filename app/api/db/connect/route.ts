import { NextResponse } from 'next/server';
import { ConnectionManager } from '@/server/services/connection-manager';
import { v4 as uuidv4 } from 'uuid';

export async function POST(req: Request) {
  try {
    const { connectionId, config, action } = await req.json();

    if (action === 'disconnect') {
      await ConnectionManager.disconnect(connectionId);
      return NextResponse.json({ success: true });
    }

    let connectConfig = config;

    if (!connectConfig || !connectConfig.host) {
      return NextResponse.json({ error: 'Invalid connection configuration' }, { status: 400 });
    }

    const token = Buffer.from(JSON.stringify(connectConfig)).toString("base64");
    await ConnectionManager.connect(token, connectConfig);

    return NextResponse.json({ success: true, token });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
