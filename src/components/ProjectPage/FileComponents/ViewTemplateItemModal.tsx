import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { ProjectFile, Template, TemplateFieldValue } from '@/lib/mock/projectFiles';
import {
  Calendar,
  DollarSign,
  ExternalLink,
  FileText,
  History,
  ImageIcon,
  Pencil,
  Ruler,
  Text,
} from 'lucide-react';
import React, { useState } from 'react';
import TemplateItemHistoryModal from './TemplateItemHistoryModal';
import TemplateItemModal from './TemplateItemModal';

interface ViewTemplateItemModalProps {
  item: ProjectFile;
  template: Template | undefined;
  onClose: () => void;
  onEdit?: (updatedItem: ProjectFile) => void;
  onVersionRestore?: (itemId: string, versionId: string) => void;
}

const ViewTemplateItemModal: React.FC<ViewTemplateItemModalProps> = ({
  item,
  template,
  onClose,
  onEdit,
  onVersionRestore,
}) => {
  const [showEditModal, setShowEditModal] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  if (!item || !template) return null;

  const getFieldValue = (fieldId: string): TemplateFieldValue | undefined => {
    return item.templateValues?.find((v) => v.fieldId === fieldId);
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

  const renderFieldValue = (fieldId: string, fieldType: string) => {
    const value = getFieldValue(fieldId);
    if (!value || (value.value === null && !value.fileUrl)) {
      return <span className='text-gray-400'>Not set</span>;
    }

    switch (fieldType) {
      case 'file':
        return value.fileUrl ? (
          <div className='mt-1'>
            <img
              src={value.fileUrl}
              alt='File preview'
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
      default:
        return <span>{value.value as string}</span>;
    }
  };

  const hasVersionHistory = item.versions && item.versions.length > 0;

  return (
    <>
      <Dialog open={!showEditModal && !showHistoryModal} onOpenChange={onClose}>
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
              {template.fields.map((field) => (
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
              ))}
            </div>
          </div>

          <DialogFooter className='space-x-2'>
            {onEdit && (
              <Button
                variant='outline'
                onClick={() => setShowEditModal(true)}
                className='flex items-center gap-1'
              >
                <Pencil className='h-4 w-4' />
                Edit
              </Button>
            )}
            <Button
              variant='outline'
              onClick={() => setShowHistoryModal(true)}
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
          onClose={() => setShowEditModal(false)}
          onSave={handleEditSave}
        />
      )}

      {showHistoryModal && (
        <TemplateItemHistoryModal
          item={item}
          onClose={() => setShowHistoryModal(false)}
          onVersionRestore={handleRestoreVersion}
          onVersionView={handleViewVersion}
        />
      )}
    </>
  );
};

export default ViewTemplateItemModal;
