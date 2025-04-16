import { newRequest } from '@/utils/newRequest';
import { toast } from 'sonner';

// Handle row deletion
export const handleDeleteSelected = (
  gridRef: React.RefObject<any>,
  tableId: string,
  setRecords: (fn: (prevRecords: any[]) => any[]) => void,
  setRowOrder: (fn: (prevOrder: string[]) => string[]) => void,
  queryClient: any,
) => {
  // Get selected rows from AG Grid
  const selectedNodes = gridRef.current?.api.getSelectedNodes();
  if (!selectedNodes || selectedNodes.length === 0) {
    toast.error('No records selected');
    return;
  }

  const selectedRecordIds = selectedNodes.map((node: any) => {
    return node.data._id;
  });

  // Delete each selected record
  Promise.all(
    selectedRecordIds.map((recordId: string) => {
      return newRequest.delete(`/tables/${tableId}/rows/${recordId}`);
    }),
  )
    .then(() => {
      // AG Grid will automatically update when the rowData changes
      setRecords((prevRecords) => {
        return prevRecords.filter((record) => {
          return !selectedRecordIds.includes(record._id);
        });
      });

      // Update row order
      setRowOrder((prevOrder) => {
        return prevOrder.filter((id) => {
          return !selectedRecordIds.includes(id);
        });
      });

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['table-records', tableId] });
      toast.success('Selected records deleted successfully');
    })
    .catch((error) => {
      console.error('Failed to delete records:', error);
      toast.error('Failed to delete records');
    });
};

// Handle row drag end
export const handleRowDragEnd = (
  event: any,
  records: any[],
  tableId: string,
  setRecords: (records: any[]) => void,
  setRowOrder: (rowOrder: string[]) => void,
) => {
  const { node, overIndex } = event;
  const draggedId = node.data._id;
  const newRecords = [...records];

  // Find the record being dragged
  const draggedRecordIndex = newRecords.findIndex((r) => {
    return r._id === draggedId;
  });
  if (draggedRecordIndex === -1) return;

  const draggedRecord = newRecords[draggedRecordIndex];

  // Remove the record from its current position
  newRecords.splice(draggedRecordIndex, 1);

  // Insert it at the new position
  newRecords.splice(overIndex, 0, draggedRecord);

  // Update positions
  const updatedRecords = newRecords.map((record, index) => {
    return {
      ...record,
      position: index + 1,
    };
  });

  // Update local state
  setRecords(updatedRecords);

  // Update row order
  setRowOrder(
    updatedRecords.map((record) => {
      return record._id;
    }),
  );

  // Save the new order to the backend
  // Debounce this operation in a real application
  updatedRecords.forEach((record) => {
    newRequest
      .patch(`/tables/${tableId}/rows/${record._id}`, {
        position: record.position,
      })
      .catch((error) => {
        console.error('Failed to update row position:', error);
      });
  });
};
