import { Column } from '@/types/database';
import { useState } from 'react';

export function useDatabaseColumns(initialColumns: Column[]) {
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  const [isAddColumnSheetOpen, setIsAddColumnSheetOpen] = useState(false);
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyPrefix, setNewPropertyPrefix] = useState('');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [newPropertyIconName, setNewPropertyIconName] = useState<string>('LuSmile');

  // Add new column
  const addNewColumn = (propertyType) => {
    setSelectedPropertyType(propertyType);
    setNewPropertyName(`New ${propertyType.name}`);
    setNewPropertyPrefix('');
  };

  const saveNewColumn = () => {
    if (!selectedPropertyType) return;

    const newId = `column${columns.length + 1}`;
    setColumns([
      ...columns,
      {
        id: newId,
        name: newPropertyName || `New Column`,
        sortable: true,
        iconName: newPropertyIconName,
      },
    ]);

    // Reset state
    setSelectedPropertyType(null);
    setNewPropertyName('');
    setNewPropertyPrefix('');
    setNewPropertyIconName('LuSmile');
    setIsAddColumnSheetOpen(false);
  };

  const backToPropertySelection = () => {
    setSelectedPropertyType(null);
    setNewPropertyName('');
    setNewPropertyPrefix('');
  };

  const selectIcon = (iconName: string) => {
    setNewPropertyPrefix(iconName);
    setIsIconPickerOpen(false);
  };

  // Column management functions
  const renameColumn = (columnId: string, newName: string) => {
    setColumns(
      columns.map((col) => {
        return col.id === columnId ? { ...col, name: newName } : col;
      }),
    );
  };

  const toggleColumnVisibility = (columnId: string) => {
    setColumns(
      columns.map((col) => {
        return col.id === columnId ? { ...col, hidden: !col.hidden } : col;
      }),
    );
  };

  const setPrimaryColumn = (columnId: string) => {
    setColumns(
      columns.map((col) => {
        return {
          ...col,
          isPrimary: col.id === columnId,
        };
      }),
    );
  };

  const deleteColumn = (columnId: string) => {
    // Don't allow deleting the primary column
    if (
      columns.find((col) => {
        return col.id === columnId;
      })?.isPrimary
    ) {
      return;
    }

    setColumns(
      columns.filter((col) => {
        return col.id !== columnId;
      }),
    );
  };

  return {
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
  };
}
