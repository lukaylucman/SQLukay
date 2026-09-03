import { NextResponse } from 'next/server';
import { ConnectionManager } from '@/server/services/connection-manager';
import { MySQLAdapter } from '@/lib/db/mysql-adapter';
import { DemoAdapter } from '@/lib/db/demo-adapter';

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const { token, action, database, table, isDemo } = await req.json();
    
    let adapter;
    if (isDemo) {
      adapter = new DemoAdapter();
    } else {
      if (!token) return NextResponse.json({ error: 'NOT_CONNECTED' }, { status: 401 });
      const pool = await ConnectionManager.getConnection(token);
      adapter = new MySQLAdapter(pool);
    }

    let result;
    switch (action) {
      case 'listDatabases':
        result = await adapter.listDatabases();
        break;
      case 'listTables':
        if (!database) throw new Error('Database required');
        result = await adapter.listTables(database);
        break;
      case 'getViews':
        if (!database) throw new Error('Database required');
        result = await adapter.getViews(database);
        break;
      case 'getTableStructure':
        if (!database || !table) throw new Error('Database and table required');
        result = await adapter.getTableStructure(database, table);
        break;
      default:
        throw new Error('Unknown action: ' + action);
    }

    return NextResponse.json({ success: true, data: result });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
