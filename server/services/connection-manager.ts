import mysql from 'mysql2/promise';
import { ConnectionConfig } from '@/types';

interface ActiveConnection {
  pool: mysql.Pool;
  config: ConnectionConfig;
  lastAccessed: number;
}

// Global cache for serverless environments
const activePools = new Map<string, ActiveConnection>();

// Cleanup idle connections (older than 30 minutes)
setInterval(() => {
  const now = Date.now();
  const maxIdleTime = 30 * 60 * 1000;
  for (const [id, conn] of activePools.entries()) {
    if (now - conn.lastAccessed > maxIdleTime) {
      console.log(`Cleaning up idle connection pool ${id}`);
      conn.pool.end().catch(console.error);
      activePools.delete(id);
    }
  }
}, 5 * 60 * 1000); // Check every 5 minutes

export class ConnectionManager {
  static async connect(connectionId: string, config: ConnectionConfig): Promise<void> {
    try {
      const pool = mysql.createPool({
        host: config.host,
        port: config.port,
        user: config.user,
        password: config.password,
        database: config.database || undefined,
        ssl: config.ssl ? { rejectUnauthorized: false } : undefined,
        multipleStatements: true,
        waitForConnections: true,
        connectionLimit: 5,
        queueLimit: 0,
      });

      // Test connection
      await pool.query('SELECT 1');

      activePools.set(connectionId, {
        pool,
        config,
        lastAccessed: Date.now(),
      });
    } catch (error: any) {
      let errorMsg = error.message || 'Failed to connect to MySQL';
      if (error.code === 'ECONNREFUSED' && (config.host === 'localhost' || config.host === '127.0.0.1')) {
        errorMsg = `Connection refused at ${config.host}:${config.port}. This means there is no MySQL server running on this Cloud/Backend environment. Please provide the Host of a real, remote MySQL server.`;
      }
      throw new Error(errorMsg);
    }
  }

  static async getConnection(connectionId: string): Promise<mysql.Pool> {
    let conn = activePools.get(connectionId);
    if (!conn) {
      try {
        const configStr = Buffer.from(connectionId, 'base64').toString('utf8');
        const config = JSON.parse(configStr);
        if (config && config.host) {
          await this.connect(connectionId, config);
          conn = activePools.get(connectionId);
        }
      } catch (e) {
        // Ignored
      }
    }
    if (!conn) {
      throw new Error('NOT_CONNECTED');
    }
    conn.lastAccessed = Date.now();
    return conn.pool;
  }

  static async disconnect(connectionId: string): Promise<void> {
    const conn = activePools.get(connectionId);
    if (conn) {
      await conn.pool.end();
      activePools.delete(connectionId);
    }
  }
  
  static getActiveConfig(connectionId: string): ConnectionConfig | undefined {
    return activePools.get(connectionId)?.config;
  }
}
