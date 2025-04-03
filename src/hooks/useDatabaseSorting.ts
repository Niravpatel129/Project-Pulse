import { Record as DatabaseRecord, SortConfig } from '@/types/database';
import { useState } from 'react';

export function useDatabaseSorting() {
  const [sortConfig, setSortConfig] = useState<SortConfig>(null);

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedRecords = (records: DatabaseRecord[]) => {
    if (!sortConfig) return records;

    return [...records].sort((a, b) => {
      if (sortConfig.key === 'tags') {
        // Sort by first tag name or empty string if no tags
        const aValue = a.tags.length > 0 ? a.tags[0].name : '';
        const bValue = b.tags.length > 0 ? b.tags[0].name : '';

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      } else {
        // Sort by other column values
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
    });
  };

  return {
    sortConfig,
    requestSort,
    getSortedRecords,
  };
}
