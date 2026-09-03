import { NextResponse } from 'next/server';
import mysql from 'mysql2/promise';

export const dynamic = 'force-dynamic';
export async function POST(req: Request) {
  try {
    const { config } = await req.json();

    if (!config || !config.host) {
      return NextResponse.json({ error: 'Invalid configuration' }, { status: 400 });
    }

    let testConfig = { ...config };

    const startTime = Date.now();
    let connection;

    try {
      connection = await mysql.createConnection({
        host: testConfig.host,
        port: Number(testConfig.port) || 3306,
        user: testConfig.user,
        password: testConfig.password,
        database: testConfig.database || undefined,
        ssl: testConfig.ssl ? { rejectUnauthorized: false } : undefined,
        connectTimeout: 5000 // 5 seconds timeout
      });

      const [rows] = await connection.query('SELECT VERSION() as version');
      const version = (rows as any[])[0]?.version;

      await connection.end();

      return NextResponse.json({ 
        success: true, 
        version,
        latency: Date.now() - startTime
      });
    } catch (err: any) {
      let diagnostics = {
        host: testConfig.host,
        port: testConfig.port,
        code: err.code,
        message: err.message,
        errno: err.errno,
        sqlState: err.sqlState
      };
      
      let errorMsg = err.message;
      if (err.code === 'ECONNREFUSED' && (testConfig.host === 'localhost' || testConfig.host === '127.0.0.1')) { 
         errorMsg = `Connection refused at ${testConfig.host}:${testConfig.port}. This means there is no MySQL server running on this Cloud/Backend environment. Please provide the Host of a real, remote MySQL server (e.g., your VPS or Cloud SQL instance).`;
      }

      return NextResponse.json({ 
        success: false, 
        error: errorMsg,
        diagnostics
      });
    }

  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
