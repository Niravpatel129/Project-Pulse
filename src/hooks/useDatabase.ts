import { Column } from '@/types/database';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useDatabaseColumns } from './useDatabaseColumns';
import { useDatabaseIcons } from './useDatabaseIcons';
import { useDatabaseRecords } from './useDatabaseRecords';
import { useDatabaseSorting } from './useDatabaseSorting';

export function useDatabase(initialColumns: Column[]) {
  const queryClient = useQueryClient();
  const params = useParams();
  const isInitialLoad = useRef(true);
  const [rowOrder, setRowOrder] = useState<string[]>([]);

  const {
    columns,
    setColumns,
    isAddColumnSheetOpen,
    propertySearchQuery,
    selectedPropertyType,
    newPropertyName,
    newPropertyPrefix,
    isIconPickerOpen,
    newPropertyIconName,
    addNewColumn,
    saveNewColumn,
    backToPropertySelection,
    selectIcon,
    renameColumn,
    toggleColumnVisibility,
    setPrimaryColumn,
    deleteColumn,
    setIsAddColumnSheetOpen,
    setPropertySearchQuery,
    setNewPropertyName,
    setNewPropertyPrefix,
    setNewPropertyIconName,
    setIsIconPickerOpen,
  } = useDatabaseColumns(initialColumns);

  const {
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
    updateRecordMutation,
  } = useDatabaseRecords(columns, rowOrder, setRowOrder);

  const { sortConfig, requestSort, getSortedRecords } = useDatabaseSorting();

  const { getIconComponent, iconOptions, defaultPropertyTypes } = useDatabaseIcons();

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await newRequest.get('/tables/workspace');
      return response.data.data;
    },
  });

  const { data: currentTableData } = useQuery({
    queryKey: ['table', params?.tableId],
    queryFn: async () => {
      if (!params?.tableId) return null;
      const response = await newRequest.get(`/tables/${params.tableId}`);
      return response.data.data;
    },
    enabled: !!params?.tableId,
  });

  // Update local state when table data changes
  useEffect(() => {
    if (currentTableData?.columns) {
      // Transform columns from API format to local format
      const transformedColumns = currentTableData.columns.map((column: any) => {
        return {
          id: column.id,
          name: column.name,
          type: column.type,
          isPrimary: column.isPrimaryKey,
          icon: column.icon,
          isRequired: column.isRequired,
          isUnique: column.isUnique,
          description: column.description,
          order: column.order,
          options: column.options,
          sortable: true,
          width: 200,
        };
      });

      setColumns(transformedColumns);
    }
  }, [currentTableData, setColumns]);

  // Reset initial load when table ID changes
  useEffect(() => {
    isInitialLoad.current = true;
  }, [params?.tableId]);

  // Fetch records for the current table
  const { data: tableRecords = [] } = useQuery({
    queryKey: ['table-records', params?.tableId],
    queryFn: async () => {
      if (!params?.tableId) return [];
      const response = await newRequest.get(`/tables/${params.tableId}/records`);

      // Transform the response data to match our frontend structure
      return response.data.data.map((row: any) => {
        // Initialize values with defaults
        const values: any = {
          selected: false,
          tags: [],
          name: '',
        };

        // Add values from each record
        if (row.records && Array.isArray(row.records)) {
          row.records.forEach((record: any) => {
            if (record.values) {
              Object.entries(record.values).forEach(([key, value]) => {
                values[key] = value;
              });
            }
          });
        }

        return {
          _id: row.rowId,
          tableId: params.tableId,
          position: row.position,
          values,
          createdBy: row.records?.[0]?.createdBy || {
            _id: '',
            name: '',
            email: '',
          },
          createdAt: row.records?.[0]?.createdAt || new Date().toISOString(),
          updatedAt: row.records?.[0]?.updatedAt || new Date().toISOString(),
          __v: 0,
        };
      });
    },
    enabled: !!params?.tableId,
    staleTime: 0, // Always refetch when invalidated
    gcTime: 0, // Don't cache the data
  });

  // Update records when table records change
  useEffect(() => {
    if (tableRecords?.length > 0) {
      setRecords((prevRecords) => {
        // If we have any temporary records, keep them
        const tempRecords = prevRecords.filter((record) => {
          return record._id.startsWith('temp-');
        });

        // Create a map for faster lookups
        const existingRecordMap = new Map(
          tempRecords.map((record) => {
            return [record._id, record];
          }),
        );

        // Add new records that don't exist yet
        tableRecords.forEach((newRecord) => {
          if (!existingRecordMap.has(newRecord._id)) {
            tempRecords.push(newRecord);
          }
        });

        return tempRecords;
      });
    }
  }, [tableRecords]);

  useEffect(() => {
    if (editingCell.recordId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell, inputRef]);

  const filteredPropertyTypes = useMemo(() => {
    return defaultPropertyTypes.filter((type) => {
      return type.name.toLowerCase().includes(propertySearchQuery.toLowerCase());
    });
  }, [defaultPropertyTypes, propertySearchQuery]);

  const createTableMutation = useMutation({
    mutationFn: async (tableName: string) => {
      return newRequest.post('/tables/create', { name: tableName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const handleCreateTable = useCallback(
    async (tableName: string) => {
      if (!tableName.trim()) return;

      try {
        await createTableMutation.mutateAsync(tableName);
      } catch (error) {
        console.error('Failed to create table:', error);
      }
    },
    [createTableMutation],
  );

  // Initialize row order
  useEffect(() => {
    if (records.length > 0 && rowOrder.length === 0) {
      setRowOrder(
        records.map((record) => {
          return record._id;
        }),
      );
    }
  }, [records, rowOrder.length]);

  // Memoize sorted records to prevent unnecessary re-renders
  const sortedRecords = useMemo(() => {
    return getSortedRecords(records);
  }, [getSortedRecords, records]);

  return {
    columns,
    records: sortedRecords,
    sortConfig,
    editingCell,
    newTagText,
    allSelected,
    isAddColumnSheetOpen,
    propertySearchQuery,
    inputRef,
    selectedPropertyType,
    newPropertyName,
    newPropertyPrefix,
    isIconPickerOpen,
    propertyTypes: filteredPropertyTypes,
    iconOptions,
    requestSort,
    addNewRow,
    addNewColumn,
    saveNewColumn,
    handleCreateTable,
    backToPropertySelection,
    selectIcon,
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
    setIsAddColumnSheetOpen,
    setPropertySearchQuery,
    newPropertyIconName,
    setNewPropertyIconName,
    setNewPropertyName,
    setNewPropertyPrefix,
    setIsIconPickerOpen,
    getIconComponent,
    renameColumn,
    toggleColumnVisibility,
    setPrimaryColumn,
    deleteColumn,
    tables,
    currentTableData,
    updateRecordMutation,
    rowOrder,
    setRowOrder,
    setRecords,
  };
}
