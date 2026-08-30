import { DatabaseAdapter } from './adapter';
import { QueryResult, TableColumn } from '@/types';

export class DemoAdapter implements DatabaseAdapter {
  private mahasiswaData = [
    { id: 1, nim: '1001', nama: 'Lucky', semester: 3 },
    { id: 2, nim: '1002', nama: 'Budi', semester: 5 },
    { id: 3, nim: '1003', nama: 'Siti', semester: 1 },
  ];

  async executeQuery(sql: string, params?: any[], database?: string): Promise<QueryResult> {
    const startTime = Date.now();
    const normalizedSql = sql.trim().toLowerCase();
    
    let data: any[] = [];
    let fields: any[] = [];
    let rowsAffected = undefined;

    // Simulate basic SQL operations for demo purposes
    if (normalizedSql.startsWith('show databases')) {
      data = [{ Database: 'kampus_demo' }];
      fields = [{ name: 'Database' }];
    } else if (normalizedSql.startsWith('show tables')) {
      data = [{ Tables_in_kampus_demo: 'mahasiswa' }, { Tables_in_kampus_demo: 'dosen' }];
      fields = [{ name: 'Tables_in_kampus_demo' }];
    } else if (normalizedSql.includes('select * from mahasiswa') || normalizedSql.includes('select * from `mahasiswa`')) {
      data = [...this.mahasiswaData];
      fields = [
        { name: 'id' }, { name: 'nim' }, { name: 'nama' }, { name: 'semester' }
      ];
    } else if (normalizedSql.startsWith('describe mahasiswa')) {
       data = [
         { Field: 'id', Type: 'int', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
         { Field: 'nim', Type: 'varchar(20)', Null: 'NO', Key: 'UNI', Default: null, Extra: '' },
         { Field: 'nama', Type: 'varchar(100)', Null: 'NO', Key: '', Default: null, Extra: '' },
         { Field: 'semester', Type: 'int', Null: 'YES', Key: '', Default: null, Extra: '' },
       ];
       fields = [ { name: 'Field'}, {name: 'Type'}, {name: 'Null'}, {name: 'Key'}, {name: 'Default'}, {name: 'Extra'} ];
    } else {
      // Dummy success for other operations in demo mode
      rowsAffected = 1;
      data = [{ message: 'Demo operation successful (Simulated)' }];
      fields = [{name: 'message'}];
    }
    
    // Simulate slight network delay
    await new Promise(r => setTimeout(r, 150));

    return {
      data,
      fields,
      executionTime: Date.now() - startTime,
      rowsAffected
    };
  }

  async listDatabases(): Promise<string[]> {
    return ['kampus_demo'];
  }

  async listTables(database: string): Promise<string[]> {
    if (database === 'kampus_demo') {
      return ['mahasiswa', 'dosen', 'mata_kuliah'];
    }
    return [];
  }
  
  async getViews(database: string): Promise<string[]> {
    return [];
  }

  async getTableStructure(database: string, table: string): Promise<TableColumn[]> {
    if (table === 'mahasiswa') {
       return [
         { Field: 'id', Type: 'int', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
         { Field: 'nim', Type: 'varchar(20)', Null: 'NO', Key: 'UNI', Default: null, Extra: '' },
         { Field: 'nama', Type: 'varchar(100)', Null: 'NO', Key: '', Default: null, Extra: '' },
         { Field: 'semester', Type: 'int', Null: 'YES', Key: '', Default: null, Extra: '' },
       ];
    }
    return [
       { Field: 'id', Type: 'int', Null: 'NO', Key: 'PRI', Default: null, Extra: 'auto_increment' },
       { Field: 'name', Type: 'varchar(100)', Null: 'NO', Key: '', Default: null, Extra: '' },
    ];
  }
}
