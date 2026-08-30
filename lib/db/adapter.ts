import { QueryResult, DatabaseNode, TableColumn } from '@/types';

export interface DatabaseAdapter {
  executeQuery(sql: string, params?: any[], database?: string): Promise<QueryResult>;
  listDatabases(): Promise<string[]>;
  listTables(database: string): Promise<string[]>;
  getTableStructure(database: string, table: string): Promise<TableColumn[]>;
  getViews(database: string): Promise<string[]>;
}
