import { Column } from '@/types/database';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams } from 'next/navigation';
import { useState } from 'react';
import { toast } from 'sonner';

export function useDatabaseColumns(initialColumns: Column[]) {
  const queryClient = useQueryClient();
  const params = useParams();
  const [columns, setColumns] = useState<Column[]>(initialColumns);

  const [isAddColumnSheetOpen, setIsAddColumnSheetOpen] = useState(false);
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const [selectedPropertyType, setSelectedPropertyType] = useState(null);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyPrefix, setNewPropertyPrefix] = useState('');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);
  const [newPropertyIconName, setNewPropertyIconName] = useState<string>('LuSmile');

  // Add new column mutation
  const addColumnMutation = useMutation({
    mutationFn: async (newColumn: Column) => {
      const response = await newRequest.post(`/tables/${params.tableId}/columns`, {
        name: newColumn.name,
        type: {
          id: selectedPropertyType.id,
          iconName: newPropertyIconName,
        },
        order: newColumn.order,
      });
      return response.data;
    },
    onSuccess: (data) => {
      // The server returns the entire table with the new column
      const newColumnFromServer = data.data.columns[data.data.columns.length - 1];

      // Update the local state with the server response
      setColumns((prevColumns) => {
        return [
          ...prevColumns,
          {
            id: newColumnFromServer.id,
            name: newColumnFromServer.name,
            type: newColumnFromServer.type,
            order: newColumnFromServer.order,
            iconName: newColumnFromServer.icon,
            sortable: true,
            isRequired: newColumnFromServer.isRequired,
            isUnique: newColumnFromServer.isUnique,
            hidden: newColumnFromServer.isHidden,
          },
        ];
      });

      queryClient.invalidateQueries({ queryKey: ['table', params.tableId] });
      toast.success('Column added successfully');
    },
    onError: (error) => {
      // Revert local state on error
      setColumns(columns);
      toast.error('Failed to add column');
      console.error('Failed to add column:', error);
    },
  });

  // Add new column
  const addNewColumn = (propertyType) => {
    setSelectedPropertyType(propertyType);
    setNewPropertyName(`New ${propertyType.name}`);
    setNewPropertyPrefix('');
  };

  const saveNewColumn = async () => {
    if (!selectedPropertyType) return;

    const newColumn = {
      id: `temp-${Date.now()}`, // Temporary ID for optimistic update
      name: newPropertyName || `New Column`,
      sortable: true,
      iconName: newPropertyIconName,
      type: selectedPropertyType,
      order: columns.length,
    };

    try {
      // Make API call to add column
      await addColumnMutation.mutateAsync(newColumn);
    } catch (error) {
      return;
    }

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
