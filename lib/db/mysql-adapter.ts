import mysql from 'mysql2/promise';
import { DatabaseAdapter } from './adapter';
import { QueryResult, TableColumn } from '@/types';

export class MySQLAdapter implements DatabaseAdapter {
  constructor(private pool: mysql.Pool) {}

  async executeQuery(sql: string, params?: any[], database?: string): Promise<QueryResult> {
    const startTime = Date.now();
    let connection: mysql.PoolConnection | null = null;
    try {
      connection = await this.pool.getConnection();
      if (database) {
        await connection.query(`USE \`${database}\``);
      }
      
      const [rows, fields] = await connection.query(sql, params);
      
      const executionTime = Date.now() - startTime;
      
      let data: any[] = [];
      let rowsAffected = undefined;
      
      if (Array.isArray(rows)) {
        // If multipleStatements is true and there are multiple results, rows might be an array of arrays/ResultSets.
        // For simplicity, we just pass it along. The frontend can handle it if needed.
        data = rows as any[];
      } else {
        rowsAffected = (rows as mysql.ResultSetHeader).affectedRows;
      }
      
      // fields might be an array of arrays if multiple statements
      let mappedFields: any[] = [];
      if (fields) {
        const flatFields = Array.isArray(fields[0]) ? fields[fields.length - 1] : fields;
        if (flatFields) {
          mappedFields = (flatFields as mysql.FieldPacket[]).map(f => ({
            name: f.name,
            type: f.type,
          }));
        }
      }

      return {
        data,
        fields: mappedFields,
        executionTime,
        rowsAffected
      };
    } catch (error: any) {
      throw new Error(`MySQL Error: ${error.message} (Code: ${error.code || 'UNKNOWN'})`);
    } finally {
      if (connection) {
        connection.release();
      }
    }
  }

  async listDatabases(): Promise<string[]> {
    const res = await this.executeQuery('SHOW DATABASES');
    return res.data.map((row: any) => row.Database);
  }

  async listTables(database: string): Promise<string[]> {
    const res = await this.executeQuery(`SHOW FULL TABLES IN \`${database}\` WHERE Table_type = 'BASE TABLE'`);
    return res.data.map((row: any) => Object.values(row)[0] as string);
  }
  
  async getViews(database: string): Promise<string[]> {
    const res = await this.executeQuery(`SHOW FULL TABLES IN \`${database}\` WHERE Table_type = 'VIEW'`);
    return res.data.map((row: any) => Object.values(row)[0] as string);
  }

  async getTableStructure(database: string, table: string): Promise<TableColumn[]> {
    const res = await this.executeQuery(`DESCRIBE \`${database}\`.\`${table}\``);
    return res.data as TableColumn[];
  }
}
