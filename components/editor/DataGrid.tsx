import React from 'react';
import { QueryResult } from '../../types';

export default function DataGrid({ result }: { result: QueryResult }) {
  if (!result || !result.data || result.data.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-sm">
        No data returned.
      </div>
    );
  }

  // Get columns either from fields or from first object keys
  const cols = result.fields?.length > 0 
    ? result.fields.map(f => f.name) 
    : Object.keys(result.data[0]);

  return (
    <div className="w-full h-full overflow-auto">
      <table className="w-full text-sm text-left whitespace-nowrap">
        <thead className="text-xs text-gray-400 bg-[#252526] sticky top-0 border-b border-[#3c3c3c]">
          <tr>
            <th className="px-3 py-2 font-medium w-10 text-center border-r border-[#3c3c3c]">#</th>
            {cols.map((col, i) => (
              <th key={i} className="px-4 py-2 font-medium border-r border-[#3c3c3c] last:border-r-0">
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {result.data.map((row, i) => (
            <tr key={i} className="border-b border-[#2d2d2d] hover:bg-[#2a2d2e]">
              <td className="px-3 py-1.5 text-center text-gray-500 border-r border-[#3c3c3c]">{i + 1}</td>
              {cols.map((col, j) => {
                let val = row[col];
                if (val === null) val = <span className="text-gray-500 italic">NULL</span>;
                else if (typeof val === 'object') val = JSON.stringify(val);
                else val = String(val);
                
                return (
                  <td key={j} className="px-4 py-1.5 border-r border-[#3c3c3c] last:border-r-0 text-gray-300">
                    {val}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
