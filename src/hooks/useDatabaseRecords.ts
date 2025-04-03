import { Column, Record as DatabaseRecord } from '@/types/database';
import { useRef, useState } from 'react';

export function useDatabaseRecords(columns: Column[]) {
  const [records, setRecords] = useState<DatabaseRecord[]>([
    {
      id: 1,
      name: 'Database Entry',
      leads: '',
      tags: [{ id: '1', name: 'sfs' }],
      selected: false,
    },
  ]);

  const [editingCell, setEditingCell] = useState<{
    recordId: number | null;
    columnId: string | null;
  }>({
    recordId: null,
    columnId: null,
  });

  const [newTagText, setNewTagText] = useState<{ [key: number]: string }>({});
  const [allSelected, setAllSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add new row
  const addNewRow = () => {
    const newId =
      records.length > 0
        ? Math.max(
            ...records.map((r) => {
              return r.id;
            }),
          ) + 1
        : 1;
    const newRecord: DatabaseRecord = {
      id: newId,
      selected: false,
      tags: [],
    };

    // Initialize all column values
    columns.forEach((col) => {
      if (col.id !== 'tags') {
        newRecord[col.id] = '';
      }
    });

    setRecords([...records, newRecord]);
  };

  // Handle cell editing
  const startEditing = (recordId: number, columnId: string) => {
    if (columnId !== 'tags') {
      setEditingCell({ recordId, columnId });
    }
  };

  const stopEditing = () => {
    setEditingCell({ recordId: null, columnId: null });
  };

  const handleCellChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    recordId: number,
    columnId: string,
  ) => {
    setRecords(
      records.map((record) => {
        return record.id === recordId ? { ...record, [columnId]: e.target.value } : record;
      }),
    );
  };

  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      stopEditing();
    }
  };

  // Handle tag management
  const addTag = (recordId: number) => {
    if (newTagText[recordId] && newTagText[recordId].trim() !== '') {
      setRecords(
        records.map((record) => {
          if (record.id === recordId) {
            const newTagId = `tag-${Date.now()}`;
            return {
              ...record,
              tags: [...record.tags, { id: newTagId, name: newTagText[recordId].trim() }],
            };
          }
          return record;
        }),
      );
      setNewTagText({ ...newTagText, [recordId]: '' });
    }
  };

  const removeTag = (recordId: number, tagId: string) => {
    setRecords(
      records.map((record) => {
        if (record.id === recordId) {
          return {
            ...record,
            tags: record.tags.filter((tag) => {
              return tag.id !== tagId;
            }),
          };
        }
        return record;
      }),
    );
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent, recordId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(recordId);
    }
  };

  // Handle selection
  const toggleSelectAll = () => {
    const newSelected = !allSelected;
    setAllSelected(newSelected);
    setRecords(
      records.map((record) => {
        return { ...record, selected: newSelected };
      }),
    );
  };

  const toggleSelectRecord = (recordId: number) => {
    const updatedRecords = records.map((record) => {
      return record.id === recordId ? { ...record, selected: !record.selected } : record;
    });
    setRecords(updatedRecords);

    // Update allSelected state based on whether all records are selected
    setAllSelected(
      updatedRecords.every((r) => {
        return r.selected;
      }),
    );
  };

  return {
    records,
    setRecords,
    editingCell,
    newTagText,
    allSelected,
    inputRef,
    addNewRow,
    startEditing,
    stopEditing,
    handleCellChange,
    handleCellKeyDown,
    addTag,
    removeTag,
    handleTagInputKeyDown,
    toggleSelectAll,
    toggleSelectRecord,
    setNewTagText,
  };
}
