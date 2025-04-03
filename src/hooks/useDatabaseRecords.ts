import { Column, Record as DatabaseRecord } from '@/types/database';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useRef, useState } from 'react';
import { toast } from 'sonner';

interface DatabaseRecordsHookReturn {
  records: DatabaseRecord[];
  setRecords: React.Dispatch<React.SetStateAction<DatabaseRecord[]>>;
  rowOrder: string[];
  setRowOrder: React.Dispatch<React.SetStateAction<string[]>>;
  editingCell: {
    recordId: string | null;
    columnId: string | null;
    originalValue: string | null;
  };
  newTagText: { [key: string]: string };
  allSelected: boolean;
  inputRef: React.RefObject<HTMLInputElement>;
  addNewRow: () => Promise<void>;
  startEditing: (recordId: string, columnId: string) => void;
  stopEditing: () => Promise<void>;
  handleCellChange: (
    e: React.ChangeEvent<HTMLInputElement>,
    recordId: string,
    columnId: string,
  ) => void;
  handleCellKeyDown: (e: React.KeyboardEvent) => void;
  addTag: (recordId: string) => void;
  removeTag: (recordId: string, tagId: string) => void;
  handleTagInputKeyDown: (e: React.KeyboardEvent, recordId: string) => void;
  toggleSelectAll: () => void;
  toggleSelectRecord: (recordId: string) => void;
  setNewTagText: React.Dispatch<React.SetStateAction<{ [key: string]: string }>>;
  updateRecordMutation: {
    isPending: boolean;
    mutateAsync: (data: { recordId: string; columnId: string; value: string }) => Promise<any>;
  };
}

export function useDatabaseRecords(
  columns: Column[],
  rowOrder: string[],
  setRowOrder: React.Dispatch<React.SetStateAction<string[]>>,
): DatabaseRecordsHookReturn {
  const params = useParams();
  const queryClient = useQueryClient();
  const [records, setRecords] = useState<DatabaseRecord[]>([]);
  const [editingCell, setEditingCell] = useState<{
    recordId: string | null;
    columnId: string | null;
    originalValue: string | null;
  }>({
    recordId: null,
    columnId: null,
    originalValue: null,
  });

  const [newTagText, setNewTagText] = useState<{ [key: string]: string }>({});
  const [allSelected, setAllSelected] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  // Add new row mutation
  const addRowMutation = useMutation({
    mutationFn: async (newRecord: DatabaseRecord) => {
      const response = await newRequest.post(`/tables/${params.tableId}/rows`, {
        position: newRecord.position,
      });
      // Transform the response to match our frontend structure
      return {
        data: {
          _id: response.data.data._id,
          tableId: response.data.data.tableId,
          position: response.data.data.position,
          values: {
            selected: false,
            tags: [],
            name: '',
          },
          createdBy: {
            _id: response.data.data.createdBy,
            name: '',
            email: '',
          },
          createdAt: response.data.data.createdAt,
          updatedAt: response.data.data.updatedAt,
          __v: response.data.data.__v,
        },
      };
    },
    onSuccess: (data) => {
      // Update the records state with the new record
      setRecords((prevRecords) => {
        return prevRecords.map((record) => {
          // Find the temporary record and replace it with the actual one
          if (record._id && record._id.startsWith('temp-')) {
            return data.data;
          }
          return record;
        });
      });
      // Update the row order
      setRowOrder((prevOrder) => {
        return prevOrder.map((id) => {
          if (id && id.startsWith('temp-')) {
            return data.data._id;
          }
          return id;
        });
      });
      // Invalidate the query after a short delay to ensure our optimistic update is visible
      setTimeout(() => {
        queryClient.invalidateQueries({ queryKey: ['table-records', params.tableId] });
      }, 100);
      toast.success('Row added successfully');
    },
    onError: (error) => {
      // Remove the temporary record on error
      setRecords((prevRecords) => {
        return prevRecords.filter((record) => {
          return record._id && !record._id.startsWith('temp-');
        });
      });
      setRowOrder((prevOrder) => {
        return prevOrder.filter((id) => {
          return id && !id.startsWith('temp-');
        });
      });
      toast.error('Failed to add row');
      console.error('Failed to add row:', error);
    },
  });

  // Update record mutation
  const updateRecordMutation = useMutation({
    mutationFn: async ({
      recordId,
      columnId,
      value,
    }: {
      recordId: string;
      columnId: string;
      value: string;
    }) => {
      const response = await newRequest.post(`/tables/${params.tableId}/records`, {
        values: {
          [columnId]: value,
        },
        columnId: columnId,
        rowId: recordId,
      });
      return response.data;
    },
    onSuccess: () => {
      // queryClient.invalidateQueries({ queryKey: ['table-records', params.tableId] });
    },
    onError: (error) => {
      toast.error('Failed to update cell');
      console.error('Failed to update cell:', error);

      // Revert the change on error
      if (editingCell.recordId && editingCell.columnId && editingCell.originalValue !== null) {
        setRecords(
          records.map((record) => {
            return record._id === editingCell.recordId
              ? {
                  ...record,
                  values: {
                    ...(record.values || {}),
                    [editingCell.columnId!]: editingCell.originalValue,
                    selected: record.values?.selected || false,
                    tags: record.values?.tags || [],
                    name: record.values?.name || '',
                  },
                }
              : record;
          }),
        );
      }
    },
  });

  // Add new row
  const addNewRow = async () => {
    // Generate a unique temporary ID using a combination of timestamp and random number
    const tempId = `temp-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;

    // Calculate the next position based on existing records
    const nextPosition =
      Math.max(
        ...records.map((r) => {
          return r.position || 0;
        }),
        0,
      ) + 1;

    const newRecord: DatabaseRecord = {
      _id: tempId,
      tableId: params.tableId as string,
      values: {
        selected: false,
        tags: [],
        name: '', // Initialize name field
      },
      position: nextPosition,
      createdBy: {
        _id: '',
        name: '',
        email: '',
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      __v: 0,
    };

    // Initialize all column values
    columns.forEach((col) => {
      if (col.id !== 'tags' && col.id !== 'name') {
        newRecord.values[col.id] = '';
      }
    });

    // Add the record locally first
    setRecords((prevRecords) => {
      return [...prevRecords, newRecord];
    });
    setRowOrder((prevOrder) => {
      return [...prevOrder, tempId];
    });

    // Send to server
    try {
      const response = await addRowMutation.mutateAsync({
        ...newRecord,
        position: nextPosition,
      });

      // Update the records and rowOrder with the actual ID
      setRecords((prevRecords) => {
        return prevRecords.map((record) => {
          return record._id === tempId ? response.data : record;
        });
      });
      setRowOrder((prevOrder) => {
        return prevOrder.map((id) => {
          return id === tempId ? response.data._id : id;
        });
      });
    } catch (error) {
      // Remove the temporary record and its order on error
      setRecords((prevRecords) => {
        return prevRecords.filter((record) => {
          return record._id !== tempId;
        });
      });
      setRowOrder((prevOrder) => {
        return prevOrder.filter((id) => {
          return id !== tempId;
        });
      });
      console.error('Error adding row:', error);
    }
  };

  // Handle cell editing
  const startEditing = (recordId: string, columnId: string) => {
    if (columnId !== 'tags') {
      const record = records.find((r) => {
        return r._id === recordId;
      });
      setEditingCell({
        recordId,
        columnId,
        originalValue: record?.values?.[columnId] || null,
      });
    }
  };

  const stopEditing = async () => {
    if (editingCell.recordId !== null && editingCell.columnId !== null) {
      const record = records.find((r) => {
        return r._id === editingCell.recordId;
      });
      const newValue = record?.values?.[editingCell.columnId] || '';

      // Only update if value has changed
      if (newValue !== editingCell.originalValue) {
        try {
          await updateRecordMutation.mutateAsync({
            recordId: editingCell.recordId,
            columnId: editingCell.columnId,
            value: newValue,
          });
          // Only reset editingCell state if update was successful
          // setEditingCell({ recordId: null, columnId: null, originalValue: null });
        } catch (error) {
          // If update fails, keep the editingCell state
          console.error('Failed to update cell:', error);
        }
      } else {
        // If no changes, just reset the editingCell state
        // setEditingCell({ recordId: null, columnId: null, originalValue: null });
      }
    }
  };

  const handleCellChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    recordId: string,
    columnId: string,
  ) => {
    setRecords(
      records.map((record) => {
        if (record._id === recordId) {
          return {
            ...record,
            values: {
              ...(record.values || {}),
              [columnId]: e.target.value,
              selected: record.values?.selected || false,
              tags: record.values?.tags || [],
              name: record.values?.name || '',
            },
          };
        }
        return record;
      }),
    );
  };

  const handleCellKeyDown = async (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      stopEditing();
    } else if (e.key === 'Escape') {
      // Revert changes on escape
      if (editingCell.recordId && editingCell.columnId && editingCell.originalValue !== null) {
        setRecords(
          records.map((record) => {
            return record._id === editingCell.recordId
              ? {
                  ...record,
                  values: {
                    ...record.values,
                    [editingCell.columnId!]: editingCell.originalValue,
                  },
                }
              : record;
          }),
        );
      }
      setEditingCell({ recordId: null, columnId: null, originalValue: null });
    } else if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'].includes(e.key)) {
      e.preventDefault();
      const currentRecordIndex = records.findIndex((r) => {
        return r._id === editingCell.recordId;
      });
      const currentColumnIndex = columns.findIndex((c) => {
        return c.id === editingCell.columnId;
      });

      let nextRecordIndex = currentRecordIndex;
      let nextColumnIndex = currentColumnIndex;

      switch (e.key) {
        case 'ArrowLeft':
          nextColumnIndex = currentColumnIndex - 1;
          break;
        case 'ArrowRight':
          nextColumnIndex = currentColumnIndex + 1;
          break;
        case 'ArrowUp':
          nextRecordIndex = currentRecordIndex - 1;
          break;
        case 'ArrowDown':
          nextRecordIndex = currentRecordIndex + 1;
          break;
      }

      // Handle wrapping around
      if (nextColumnIndex >= columns.length) {
        nextColumnIndex = 0;
        nextRecordIndex++;
      } else if (nextColumnIndex < 0) {
        nextColumnIndex = columns.length - 1;
        nextRecordIndex--;
      }

      // Ensure we stay within bounds
      if (
        nextRecordIndex >= 0 &&
        nextRecordIndex < records.length &&
        nextColumnIndex >= 0 &&
        nextColumnIndex < columns.length
      ) {
        const nextRecord = records[nextRecordIndex];
        const nextColumn = columns[nextColumnIndex];

        // Save current cell before moving
        await stopEditing();

        // Start editing the next cell
        startEditing(nextRecord._id, nextColumn.id);
      }
    }
  };

  // Handle tag management
  const addTag = (recordId: string) => {
    if (newTagText[recordId] && newTagText[recordId].trim() !== '') {
      setRecords(
        records.map((record) => {
          if (record._id === recordId) {
            const newTagId = `tag-${Date.now()}`;
            return {
              ...record,
              values: {
                ...(record.values || {}),
                tags: [
                  ...(record.values?.tags || []),
                  { id: newTagId, name: newTagText[recordId].trim() },
                ],
                selected: record.values?.selected || false,
                name: record.values?.name || '',
              },
            };
          }
          return record;
        }),
      );
      setNewTagText({ ...newTagText, [recordId]: '' });
    }
  };

  const removeTag = (recordId: string, tagId: string) => {
    setRecords(
      records.map((record) => {
        if (record._id === recordId) {
          return {
            ...record,
            values: {
              ...(record.values || {}),
              tags: (record.values?.tags || []).filter((tag) => {
                return tag.id !== tagId;
              }),
              selected: record.values?.selected || false,
              name: record.values?.name || '',
            },
          };
        }
        return record;
      }),
    );
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent, recordId: string) => {
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
        return {
          ...record,
          values: {
            ...(record.values || {}),
            selected: newSelected,
            tags: record.values?.tags || [],
            name: record.values?.name || '',
          },
        };
      }),
    );
  };

  const toggleSelectRecord = (recordId: string) => {
    const updatedRecords = records.map((record) => {
      if (record._id === recordId) {
        return {
          ...record,
          values: {
            ...(record.values || {}),
            selected: !(record.values?.selected || false),
            tags: record.values?.tags || [],
            name: record.values?.name || '',
          },
        };
      }
      return record;
    });
    setRecords(updatedRecords);

    // Update allSelected state based on whether all records are selected
    setAllSelected(
      updatedRecords.every((r) => {
        return r.values?.selected || false;
      }),
    );
  };

  return {
    records,
    setRecords,
    rowOrder,
    setRowOrder,
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
    updateRecordMutation,
  };
}
