import { NextResponse } from 'next/server';
import { ConnectionManager } from '@/server/services/connection-manager';
import { DatabaseAdapter } from '@/lib/db/adapter';
import { MySQLAdapter } from '@/lib/db/mysql-adapter';
import { DemoAdapter } from '@/lib/db/demo-adapter';

export async function POST(req: Request) {
  const startTime = Date.now();
  try {
    const { token, query, params, database, isDemo } = await req.json();
    
    let adapter: DatabaseAdapter;
    
    if (isDemo) {
      adapter = new DemoAdapter();
    } else {
      if (!token) {
        return NextResponse.json({ error: 'NOT_CONNECTED' }, { status: 401 });
      }
      try {
        const pool = await ConnectionManager.getConnection(token);
        adapter = new MySQLAdapter(pool);
      } catch (e: any) {
        if (e.message === 'NOT_CONNECTED') {
           return NextResponse.json({ error: 'NOT_CONNECTED' }, { status: 401 });
        }
        throw e;
      }
    }

    const result = await adapter.executeQuery(query, params, database);
    return NextResponse.json({
      ...result,
      executionTime: Date.now() - startTime,
    });
  } catch (error: any) {
    return NextResponse.json({ 
      error: error.message,
      executionTime: Date.now() - startTime 
    }, { status: 500 });
  }
}
