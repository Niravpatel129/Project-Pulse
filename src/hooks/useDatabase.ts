import { Column } from '@/types/database';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
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
      console.log('Table data response:', response.data);
      return response.data.data;
    },
    enabled: !!params?.tableId,
  });

  // Update local state when table data changes
  useEffect(() => {
    if (currentTableData && currentTableData.columns) {
      console.log('Current table data:', currentTableData);

      // Transform columns from API format to local format
      const transformedColumns = currentTableData.columns.map((column: any) => {
        console.log('Transforming column:', column);
        const transformed = {
          id: column.id,
          name: column.name,
          type: column.type,
          isPrimary: column.isPrimaryKey,
          isRequired: column.isRequired,
          isUnique: column.isUnique,
          hidden: column.isHidden,
          description: column.description,
          order: column.order,
          options: column.options,
          sortable: true, // All columns are sortable by default
          width: 200, // Default width
        };
        console.log('Transformed column:', transformed);
        return transformed;
      });

      console.log('Transformed columns:', transformedColumns);

      // Get visible columns from the default grid view
      const defaultView = currentTableData.views?.find((view: any) => {
        return view.type === 'grid';
      });
      const visibleColumnIds = defaultView?.visibleColumns || [];
      console.log('Visible column IDs:', visibleColumnIds);

      // Set columns with visibility based on the view
      const finalColumns = transformedColumns.map((col) => {
        return {
          ...col,
          hidden: !visibleColumnIds.includes(col.id),
        };
      });

      console.log('Final columns:', finalColumns);
      setColumns(finalColumns);
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
      return response.data.data;
    },
    enabled: !!params?.tableId,
  });

  // Update records when table records change
  useEffect(() => {
    if (tableRecords && tableRecords.length > 0) {
      setRecords(tableRecords);
    }
  }, [tableRecords]);

  useEffect(() => {
    if (editingCell.recordId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell, inputRef]);

  const filteredPropertyTypes = defaultPropertyTypes.filter((type) => {
    return type.name.toLowerCase().includes(propertySearchQuery.toLowerCase());
  });

  const createTableMutation = useMutation({
    mutationFn: async (tableName: string) => {
      return newRequest.post('/tables/create', { name: tableName });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
    },
  });

  const handleCreateTable = async (tableName: string) => {
    console.log('create table', tableName);
    if (!tableName.trim()) return;

    try {
      await createTableMutation.mutateAsync(tableName);
    } catch (error) {
      console.error('Failed to create table:', error);
    }
  };

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

  return {
    columns,
    records: getSortedRecords(records),
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
  };
}
