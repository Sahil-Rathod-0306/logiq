import React from 'react';

interface Column<T> {
  header: string;
  accessor: keyof T | ((row: T) => React.ReactNode);
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  isLoading?: boolean;
  emptyMessage?: string;
}

export function DataTable<T>({ data, columns, isLoading, emptyMessage = "No data found." }: DataTableProps<T>) {
  if (isLoading) {
    return (
      <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-6 animate-pulse">
        <div className="h-8 bg-gray-800 rounded mb-4 w-1/3"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="h-12 bg-gray-800/50 rounded mb-2 w-full"></div>
        ))}
      </div>
    );
  }

  if (!data || data.length === 0) {
    return (
      <div className="w-full bg-gray-900 border border-gray-800 rounded-xl p-12 text-center">
        <p className="text-gray-400">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="w-full bg-gray-900 border border-gray-800 rounded-xl overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full text-sm text-left">
          <thead className="text-xs text-gray-400 uppercase bg-gray-900/50 border-b border-gray-800">
            <tr>
              {columns.map((col, index) => (
                <th key={index} className="px-6 py-4 font-medium tracking-wider">
                  {col.header}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-800">
            {data.map((row, rowIndex) => (
              <tr key={rowIndex} className="hover:bg-gray-800/50 transition-colors">
                {columns.map((col, colIndex) => (
                  <td key={colIndex} className="px-6 py-4 text-gray-300 whitespace-nowrap">
                    {typeof col.accessor === 'function'
                      ? col.accessor(row)
                      : (row[col.accessor] as React.ReactNode)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}