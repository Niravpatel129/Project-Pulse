import { newRequest } from '@/utils/newRequest';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { usePathname, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useDatabase } from './useDatabase';

export const useDatabaseLayout = () => {
  const pathname = usePathname();
  const router = useRouter();
  const { handleCreateTable, tables = [] } = useDatabase([]);
  const currentTable = pathname.split('/').pop() || tables[0]?._id || 'table-1';
  const [tableName, setTableName] = useState('');
  const [isCreatingTable, setIsCreatingTable] = useState(false);
  const [renamingTable, setRenamingTable] = useState<{ id: string; name: string } | null>(null);
  const [newTableName, setNewTableName] = useState('');
  const queryClient = useQueryClient();

  // Redirect to first table if no table is selected
  useEffect(() => {
    if (
      tables.length > 0 &&
      !tables.some((table) => {
        return table._id === currentTable;
      })
    ) {
      router.push(`/database/${tables[0]._id}`);
    }
  }, [tables, currentTable, router]);

  // Delete table mutation
  const deleteTableMutation = useMutation({
    mutationFn: async (tableId: string) => {
      const response = await newRequest.delete(`/tables/${tableId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tables'] });
      toast.success('Table deleted successfully');
      // If we deleted the current table, redirect to the first available table
      if (tables.length > 0) {
        router.push(`/database/${tables[0]._id}`);
      }
    },
    onError: (error) => {
      console.error('Failed to delete table:', error);
      toast.error('Failed to delete table');
    },
  });

  // Handle table delete
  const handleDeleteTable = useCallback(
    async (tableId: string) => {
      try {
        await deleteTableMutation.mutateAsync(tableId);
      } catch (error) {
        console.error('Failed to delete table:', error);
      }
    },
    [deleteTableMutation],
  );

  // Handle table rename
  const handleRenameTable = useCallback((tableId: string, currentName: string) => {
    setRenamingTable({ id: tableId, name: currentName });
    setNewTableName(currentName);
  }, []);

  const saveTableRename = useCallback(async () => {
    if (newTableName.trim() === currentTable) {
      toast.error('Table name cannot be the same as the current table');
      return;
    }

    if (renamingTable && newTableName.trim()) {
      try {
        await newRequest.patch(`/tables/${renamingTable.id}`, {
          name: newTableName.trim(),
        });
        queryClient.invalidateQueries({ queryKey: ['tables'] });
        setRenamingTable(null);
        setNewTableName('');
      } catch (error) {
        console.error('Failed to rename table:', error);
        toast.error('Failed to rename table');
      }
    }
  }, [renamingTable, newTableName, queryClient, currentTable]);

  const handleCreateNewTable = useCallback(() => {
    setIsCreatingTable(false);
    handleCreateTable(tableName);
    toast.success('Table created successfully');
    setTimeout(() => {
      setTableName('');
    }, 1000);
  }, [handleCreateTable, tableName]);

  return {
    currentTable,
    tables,
    tableName,
    setTableName,
    isCreatingTable,
    setIsCreatingTable,
    renamingTable,
    setRenamingTable,
    newTableName,
    setNewTableName,
    handleDeleteTable,
    handleRenameTable,
    saveTableRename,
    handleCreateNewTable,
  };
};
