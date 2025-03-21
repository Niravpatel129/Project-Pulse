import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { InventoryItem, ProjectFile, Template, TemplateFieldValue } from '@/lib/mock/projectFiles';
import {
  Calendar,
  DollarSign,
  ExternalLink,
  FileText,
  History,
  ImageIcon,
  Package,
  Pencil,
  Ruler,
  Text,
} from 'lucide-react';
import Image from 'next/image';
import React, { useState } from 'react';
import InventoryItemModal from './InventoryItemModal';
import TemplateItemHistoryModal from './TemplateItemHistoryModal';
import TemplateItemModal from './TemplateItemModal';

interface ViewTemplateItemModalProps {
  item: ProjectFile;
  template: Template | undefined;
  onClose: () => void;
  onEdit?: (updatedItem: ProjectFile) => void;
  onVersionRestore?: (itemId: string, versionId: string) => void;
  inventoryItems?: InventoryItem[];
  updateInventoryStock?: (itemId: string, quantity: number) => InventoryItem | undefined;
  trackInventoryUsage?: (
    templateItemId: string,
    inventoryItemId: string,
    projectId?: string,
  ) => void;
}

const ViewTemplateItemModal: React.FC<ViewTemplateItemModalProps> = ({
  item,
  template,
  onClose,
  onEdit,
  onVersionRestore,
  inventoryItems = [],
  updateInventoryStock,
  trackInventoryUsage,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const [selectedInventoryItem, setSelectedInventoryItem] = useState<InventoryItem | null>(null);

  if (!item || !template) return null;

  const getFieldValue = (fieldId: string): TemplateFieldValue | undefined => {
    return item.templateValues?.find((v) => {return v.fieldId === fieldId});
  };

  const getFieldIcon = (fieldType: string) => {
    switch (fieldType) {
      case 'text':
        return <Text className='h-4 w-4 mr-2 text-gray-500' />;
      case 'number':
        return <FileText className='h-4 w-4 mr-2 text-gray-500' />;
      case 'file':
        return <ImageIcon className='h-4 w-4 mr-2 text-gray-500' />;
      case 'enum':
        return <FileText className='h-4 w-4 mr-2 text-gray-500' />;
      case 'link':
        return <ExternalLink className='h-4 w-4 mr-2 text-gray-500' />;
      case 'date':
        return <Calendar className='h-4 w-4 mr-2 text-gray-500' />;
      case 'price':
        return <DollarSign className='h-4 w-4 mr-2 text-gray-500' />;
      case 'dimension':
        return <Ruler className='h-4 w-4 mr-2 text-gray-500' />;
      case 'inventory_item':
        return <Package className='h-4 w-4 mr-2 text-gray-500' />;
      default:
        return <FileText className='h-4 w-4 mr-2 text-gray-500' />;
    }
  };

  const handleEditSave = (updatedItem: ProjectFile) => {
    if (onEdit) {
      onEdit(updatedItem);
    }
    setShowEditModal(false);
  };

  const handleViewVersion = (itemId: string, versionId: string) => {
    // Would fetch version data and display it
    // For now, just showing notification
    alert(`Viewing version ${versionId} of item ${itemId}`);
  };

  const handleRestoreVersion = (itemId: string, versionId: string) => {
    if (onVersionRestore) {
      onVersionRestore(itemId, versionId);
    }
    setShowHistoryModal(false);
  };

  const findInventoryItem = (itemId: string): InventoryItem | undefined => {
    return inventoryItems.find((item) => {return item.id === itemId});
  };

  const renderFieldValue = (fieldId: string, fieldType: string) => {
    const value = getFieldValue(fieldId);
    if (!value || (value.value === null && !value.fileUrl)) {
      return <span className='text-gray-400'>Not set</span>;
    }

    switch (fieldType) {
      case 'file':
        return value.fileUrl ? (
          <div className='mt-1'>
            <Image
              src={value.fileUrl}
              alt='File preview'
              width={300}
              height={300}
              className='max-h-32 max-w-full rounded-md border'
            />
            <span className='text-sm text-gray-500 block mt-1'>{value.value as string}</span>
          </div>
        ) : (
          <span className='text-gray-400'>No file</span>
        );
      case 'link':
        return (
          <a
            href={value.value as string}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-500 hover:underline flex items-center'
          >
            {value.value as string}
            <ExternalLink className='h-3 w-3 ml-1' />
          </a>
        );
      case 'price':
        return <span>${value.value}</span>;
      case 'dimension':
        return <span>{value.value}</span>;
      case 'inventory_item':
        const inventoryItemId = value.value as string;
        const inventoryItem = findInventoryItem(inventoryItemId);

        if (!inventoryItem) {
          return <span className='text-gray-400'>Item not found</span>;
        }

        return (
          <div className='flex items-center gap-2'>
            <div className='flex flex-1 items-center'>
              {inventoryItem.imageUrl && (
                <Image
                  src={inventoryItem.imageUrl}
                  alt={inventoryItem.name}
                  width={40}
                  height={40}
                  className='h-10 w-10 rounded-md object-cover mr-2 border'
                />
              )}
              <div>
                <span className='font-medium'>{inventoryItem.name}</span>
                <div className='text-xs text-gray-500'>SKU: {inventoryItem.sku}</div>
              </div>
            </div>
            <Button
              variant='outline'
              size='sm'
              className='ml-auto'
              onClick={() => {return setSelectedInventoryItem(inventoryItem)}}
            >
              View Details
            </Button>
          </div>
        );
      default:
        return <span>{value.value as string}</span>;
    }
  };

  const hasVersionHistory = item.versions && item.versions.length > 0;

  return (
    <>
      <Dialog
        open={!showEditModal && !showHistoryModal && !selectedInventoryItem}
        onOpenChange={onClose}
      >
        <DialogContent className='sm:max-w-[600px] max-h-[80vh] overflow-auto'>
          <DialogHeader>
            <DialogTitle>{item.name}</DialogTitle>
            <DialogDescription>
              {template.name} created on {new Date(item.dateUploaded).toLocaleDateString()}
              {item.lastModified && (
                <>, last updated on {new Date(item.lastModified).toLocaleDateString()}</>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className='space-y-6 py-4'>
            <div className='grid grid-cols-1 gap-6'>
              {template.fields.map((field) => {return (
                <div key={field.id} className='space-y-2'>
                  <div className='flex items-center'>
                    {getFieldIcon(field.type)}
                    <h4 className='text-sm font-medium'>{field.name}</h4>
                  </div>
                  {field.description && (
                    <p className='text-xs text-gray-500 ml-6'>{field.description}</p>
                  )}
                  <div className='ml-6 mt-1'>{renderFieldValue(field.id, field.type)}</div>
                </div>
              )})}
            </div>
          </div>

          <DialogFooter className='space-x-2'>
            {onEdit && (
              <Button
                variant='outline'
                onClick={() => {return setShowEditModal(true)}}
                className='flex items-center gap-1'
              >
                <Pencil className='h-4 w-4' />
                Edit
              </Button>
            )}
            <Button
              variant='outline'
              onClick={() => {return setShowHistoryModal(true)}}
              disabled={!hasVersionHistory}
              className='flex items-center gap-1'
            >
              <History className='h-4 w-4' />
              View History {!hasVersionHistory && '(None)'}
            </Button>
            <Button onClick={onClose}>Close</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {showEditModal && template && (
        <TemplateItemModal
          template={template}
          existingItem={item}
          onClose={() => {return setShowEditModal(false)}}
          onSave={handleEditSave}
          inventoryItems={inventoryItems}
          updateInventoryStock={updateInventoryStock}
          trackInventoryUsage={trackInventoryUsage}
        />
      )}

      {showHistoryModal && (
        <TemplateItemHistoryModal
          item={item}
          onClose={() => {return setShowHistoryModal(false)}}
          onVersionRestore={handleRestoreVersion}
          onVersionView={handleViewVersion}
        />
      )}

      {selectedInventoryItem && (
        <InventoryItemModal
          item={selectedInventoryItem}
          onClose={() => {return setSelectedInventoryItem(null)}}
        />
      )}
    </>
  );
};

export default ViewTemplateItemModal;
