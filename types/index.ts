export interface ConnectionConfig {
  id: string;
  name: string;
  host: string;
  port: number;
  user: string;
  password?: string;
  database?: string;
  ssl?: boolean;
}

export interface QueryResult {
  data: any[];
  fields: any[];
  executionTime: number;
  rowsAffected?: number;
  error?: string;
}

export interface DatabaseNode {
  name: string;
  type: 'database' | 'table' | 'view' | 'procedure' | 'function';
  children?: DatabaseNode[];
  parentDb?: string;
}

export interface TableColumn {
  Field: string;
  Type: string;
  Null: string;
  Key: string;
  Default: string | null;
  Extra: string;
}
