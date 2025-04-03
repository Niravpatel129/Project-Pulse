import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect } from 'react';
import { useDatabaseColumns } from './useDatabaseColumns';
import { useDatabaseIcons } from './useDatabaseIcons';
import { useDatabaseRecords } from './useDatabaseRecords';
import { useDatabaseSorting } from './useDatabaseSorting';

export function useDatabase() {
  const queryClient = useQueryClient();

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
  } = useDatabaseColumns();

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
  } = useDatabaseRecords(columns);

  const { sortConfig, requestSort, getSortedRecords } = useDatabaseSorting();

  const { getIconComponent, iconOptions, defaultPropertyTypes } = useDatabaseIcons();

  const { data: tables = [] } = useQuery({
    queryKey: ['tables'],
    queryFn: async () => {
      const response = await newRequest.get('/tables/workspace');
      return response.data.data;
    },
  });

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
  };
}
