import { useEffect } from 'react';
import { useDatabaseColumns } from './useDatabaseColumns';
import { useDatabaseIcons } from './useDatabaseIcons';
import { useDatabaseRecords } from './useDatabaseRecords';
import { useDatabaseSorting } from './useDatabaseSorting';

export function useDatabase() {
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

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell.recordId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell, inputRef]);

  // Filter property types based on search query
  const filteredPropertyTypes = defaultPropertyTypes.filter((type) => {
    return type.name.toLowerCase().includes(propertySearchQuery.toLowerCase());
  });

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
  };
}
