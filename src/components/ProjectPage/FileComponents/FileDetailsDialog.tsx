import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Textarea } from '@/components/ui/textarea';
import {
  Attachment,
  InventoryCategory,
  InventoryItem,
  Product,
  ProjectFile,
  Template,
} from '@/lib/mock/projectFiles';
import { format } from 'date-fns';
import {
  Download,
  FileCog,
  FilePlus,
  History,
  Link,
  Mail,
  MoreVertical,
  Plus,
  Send,
  Shirt,
  Tag,
  Trash,
} from 'lucide-react';
import React, { useState } from 'react';

import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import AddItemsModal from './AddItemsModal';
import TemplateItemHistoryModal from './TemplateItemHistoryModal';
import ViewTemplateItemModal from './ViewTemplateItemModal';

interface FileDetailsDialogProps {
  selectedFile: ProjectFile | null;
  getAttachmentIcon: (type: string) => React.ReactNode;
  getStatusBadgeClass: (status?: string) => string;
  commentText: string;
  setCommentText: (value: string) => void;
  handleAddComment: () => void;
  uploadedFiles: File[];
  handleFileUpload: (event: React.ChangeEvent<HTMLInputElement>) => void;
  handleAddAttachmentToFileItem: (fileItemId: string) => void;
  products: Product[];
  templates: Template[];
  inventoryItems: InventoryItem[];
  inventoryCategories: InventoryCategory[];
  handleAddProductToFileItem: (
    fileItemId: string,
    productData: {
      id?: string;
      name?: string;
      price?: string;
      description?: string;
      isNew: boolean;
    },
  ) => void;
  handleAddTemplateItem: (item: ProjectFile) => void;
  handleCreateTemplate: (template: Template) => void;
  handleOpenVersionHistory: (attachment: Attachment) => void;
  onSendEmail: () => void;
  handleDeleteTemplateItem?: (fileId: string, templateItemId: string) => void;
  handleUpdateTemplateItem?: (updatedItem: ProjectFile) => void;
  handleRestoreTemplateItemVersion?: (itemId: string, versionId: string) => void;
  updateInventoryStock?: (itemId: string, quantity: number) => InventoryItem | undefined;
  trackInventoryUsage?: (
    templateItemId: string,
    inventoryItemId: string,
    projectId?: string,
  ) => void;
}

const FileDetailsDialog: React.FC<FileDetailsDialogProps> = ({
  selectedFile,
  getAttachmentIcon,
  getStatusBadgeClass,
  commentText,
  setCommentText,
  handleAddComment,
  uploadedFiles,
  handleFileUpload,
  handleAddAttachmentToFileItem,
  products,
  templates,
  inventoryItems,
  inventoryCategories,
  handleAddProductToFileItem,
  handleAddTemplateItem,
  handleCreateTemplate,
  handleOpenVersionHistory,
  onSendEmail,
  handleDeleteTemplateItem,
  handleUpdateTemplateItem,
  handleRestoreTemplateItemVersion,
  updateInventoryStock,
  trackInventoryUsage,
}) => {
  const [showItemsModal, setShowItemsModal] = useState(false);
  const [selectedItemType, setSelectedItemType] = useState<
    'files' | 'products' | 'services' | 'templates'
  >('files');
  const [viewTemplateItem, setViewTemplateItem] = useState<ProjectFile | null>(null);
  const [showTemplateItemHistory, setShowTemplateItemHistory] = useState<ProjectFile | null>(null);

  if (!selectedFile) return null;

  const getTemplateForItem = (item: ProjectFile) => {
    if (item.templateId) {
      return templates.find((t) => {return t.id === item.templateId});
    }
    return undefined;
  };

  return (
    <>
      <DialogContent className='max-w-4xl h-[80vh]'>
        <DialogHeader className='sr-only'>
          <DialogTitle>{selectedFile.name}</DialogTitle>
        </DialogHeader>
        <div className='flex flex-col md:flex-row h-full overflow-hidden'>
          {/* Left side - file details and attachments */}
          <div className='w-full md:w-2/3 pr-0 md:pr-4 overflow-y-auto'>
            {selectedFile.description && (
              <div className='mb-4'>
                <h4 className='text-sm font-medium mb-1'>Description</h4>
                <p className='text-sm text-gray-600'>{selectedFile.description}</p>
              </div>
            )}

            <div className='mb-4'>
              <h2 className='text-lg font-medium mb-1'>{selectedFile.name}</h2>

              <h4 className='text-sm font-medium mb-1'>Status</h4>
              {selectedFile.status ? (
                <span
                  className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                    selectedFile.status,
                  )}`}
                >
                  {selectedFile.status.replace('_', ' ')}
                </span>
              ) : (
                <span className='text-sm text-gray-600'>No status</span>
              )}
            </div>

            {selectedFile.emailSent && (
              <div className='mb-4'>
                <h4 className='text-sm font-medium mb-1'>Email Status</h4>
                <div className='flex items-center'>
                  <Mail className='h-4 w-4 text-green-500 mr-2' />
                  <span className='text-sm'>
                    Sent to {selectedFile.clientEmail} on {selectedFile.emailSentDate}
                  </span>
                </div>
              </div>
            )}

            <div className='mb-6'>
              <div className='flex flex-col'>
                <div className='flex items-center justify-between mb-3'>
                  <div className='flex items-center'>
                    <h4 className='text-sm font-medium'>Attached Items</h4>
                  </div>
                </div>

                <div className='flex justify-between items-center mb-5'>
                  <DialogTitle>File Details</DialogTitle>
                  <div className='flex gap-2'>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant='outline' className='flex items-center gap-2'>
                          <Plus className='h-4 w-4' />
                          Add Item
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-56 p-0' align='end'>
                        <div className='p-1'>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='w-full justify-start'
                            onClick={() => {
                              setSelectedItemType('files');
                              setShowItemsModal(true);
                            }}
                          >
                            <FilePlus className='h-4 w-4 mr-2' />
                            Add File
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='w-full justify-start'
                            onClick={() => {
                              setSelectedItemType('products');
                              setShowItemsModal(true);
                            }}
                          >
                            <Tag className='h-4 w-4 mr-2' />
                            Add Product
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='w-full justify-start'
                            onClick={() => {
                              setSelectedItemType('services');
                              setShowItemsModal(true);
                            }}
                          >
                            <Shirt className='h-4 w-4 mr-2' />
                            Add Service
                          </Button>
                          <Button
                            variant='ghost'
                            size='sm'
                            className='w-full justify-start'
                            onClick={() => {
                              setSelectedItemType('templates');
                              setShowItemsModal(true);
                            }}
                          >
                            <FileCog className='h-4 w-4 mr-2' />
                            Add Template
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>

                {selectedFile.attachments.length > 0 && (
                  <div className='mt-4'>
                    <h5 className='text-sm font-medium mb-2'>Files</h5>
                    <div className='space-y-2 mb-4'>
                      {selectedFile.attachments.map((attachment) => {return (
                        <div
                          key={attachment.id}
                          className='flex items-center justify-between p-2 border rounded hover:bg-gray-50'
                        >
                          <div className='flex items-center'>
                            {getAttachmentIcon(attachment.type)}
                            <span className='ml-2 text-sm'>{attachment.name}</span>
                          </div>
                          <div className='flex items-center'>
                            <span className='text-xs text-gray-500 mr-3'>{attachment.size}</span>
                            {attachment.versions && attachment.versions.length > 1 && (
                              <Button
                                variant='outline'
                                size='sm'
                                className='mr-2'
                                onClick={() => {return handleOpenVersionHistory(attachment)}}
                              >
                                <span className='text-xs'>
                                  {attachment.versions.length} versions
                                </span>
                              </Button>
                            )}
                            <Button variant='ghost' size='icon'>
                              <Download className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      )})}
                    </div>
                  </div>
                )}

                {selectedFile.products && selectedFile.products.length > 0 && (
                  <div>
                    <h5 className='text-sm font-medium mb-2'>Products</h5>
                    <div className='space-y-2 mb-4'>
                      {selectedFile.products.map((product, index) => {return (
                        <div
                          key={index}
                          className='flex justify-between items-center p-2 border rounded hover:bg-gray-50'
                        >
                          <div className='flex items-center'>
                            <Tag className='h-4 w-4 text-purple-500 mr-2' />
                            <div>
                              <div className='text-sm font-medium'>{product.name}</div>
                              <div className='text-xs text-gray-500'>{product.description}</div>
                            </div>
                          </div>
                          <div className='text-sm font-medium'>${product.price}</div>
                        </div>
                      )})}
                    </div>
                  </div>
                )}

                {/* Display Template Items */}
                {selectedFile.templateItems && selectedFile.templateItems.length > 0 && (
                  <div>
                    <h5 className='text-sm font-medium mb-2'>Template Items</h5>
                    <div className='space-y-2 mb-4'>
                      {selectedFile.templateItems.map((item, index) => {return (
                        <div
                          key={index}
                          className='flex justify-between items-center p-2 border rounded hover:bg-gray-50 cursor-pointer'
                          onClick={() => {return setViewTemplateItem(item)}}
                        >
                          <div className='flex items-center'>
                            <FileCog className='h-4 w-4 text-blue-500 mr-2' />
                            <div>
                              <div className='text-sm font-medium'>{item.name}</div>
                              <div className='text-xs text-gray-500'>
                                {item.type === 'custom_template_item' &&
                                  templates.find((t) => {return t.id === item.templateId})?.name}
                              </div>
                            </div>
                          </div>
                          <div className='flex items-center gap-2'>
                            <div className='text-xs text-gray-500'>
                              {item.lastModified
                                ? `Updated: ${item.lastModified.split('T')[0]}`
                                : `Created: ${item.dateUploaded.split('T')[0]}`}
                            </div>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild onClick={(e) => {return e.stopPropagation()}}>
                                <Button variant='ghost' size='icon'>
                                  <MoreVertical className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    setViewTemplateItem(item);
                                  }}
                                >
                                  <FileCog className='h-4 w-4 mr-2' />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (item.versions && item.versions.length > 0) {
                                      setShowTemplateItemHistory(item);
                                    } else {
                                      alert('No version history available for this item');
                                    }
                                  }}
                                >
                                  <History className='h-4 w-4 mr-2' />
                                  View History
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    if (handleDeleteTemplateItem) {
                                      handleDeleteTemplateItem(selectedFile.id, item.id);
                                    }
                                  }}
                                  className='text-red-600 hover:text-red-700 hover:bg-red-50'
                                >
                                  <Trash className='h-4 w-4 mr-2' />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </div>
                        </div>
                      )})}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className='flex justify-end space-x-2 mt-4'>
              {!selectedFile.emailSent && (
                <Button onClick={onSendEmail}>
                  <Mail className='mr-2 h-4 w-4' />
                  Email to Client
                </Button>
              )}
              <Button variant='outline'>
                <Link className='mr-2 h-4 w-4' />
                Copy Share Link
              </Button>
            </div>
          </div>

          {/* Right side - comments */}
          <div className='w-full md:w-1/3 mt-4 md:mt-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 flex flex-col h-full'>
            <h4 className='text-sm font-medium mb-2'>Comments</h4>

            <div className='flex-grow overflow-y-auto mb-4 space-y-4'>
              {selectedFile.comments.length === 0 ? (
                <p className='text-sm text-gray-500'>No comments yet</p>
              ) : (
                selectedFile.comments.map((comment) => {return (
                  <div key={comment.id} className='flex space-x-3'>
                    <Avatar className='h-8 w-8'>
                      {comment.avatarUrl ? (
                        <AvatarImage src={comment.avatarUrl} alt={comment.author} />
                      ) : (
                        <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                      )}
                    </Avatar>
                    <div>
                      <div className='flex items-center space-x-2'>
                        <span className='font-medium text-sm'>{comment.author}</span>
                        <span className='text-xs text-gray-500'>{comment.authorRole}</span>
                      </div>
                      <p className='text-sm mt-1'>{comment.text}</p>
                      <p className='text-xs text-gray-500 mt-1'>
                        {format(new Date(comment.timestamp), 'MMM d, yyyy h:mm a')}
                      </p>
                    </div>
                  </div>
                )})
              )}
            </div>

            <div className='border-t pt-4'>
              <Textarea
                placeholder='Add a comment...'
                value={commentText}
                onChange={(e) => {return setCommentText(e.target.value)}}
                className='resize-none'
                rows={3}
              />
              <div className='flex justify-end mt-2'>
                <Button onClick={handleAddComment} disabled={!commentText.trim()}>
                  <Send className='mr-2 h-4 w-4' />
                  Send
                </Button>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>

      {showItemsModal && (
        <AddItemsModal
          onClose={() => {return setShowItemsModal(false)}}
          selectedFile={selectedFile}
          uploadedFiles={uploadedFiles}
          handleFileUpload={handleFileUpload}
          handleAddAttachmentToFileItem={handleAddAttachmentToFileItem}
          products={products}
          templates={templates}
          inventoryItems={inventoryItems}
          inventoryCategories={inventoryCategories}
          handleAddProductToFileItem={handleAddProductToFileItem}
          handleAddTemplateItem={handleAddTemplateItem}
          handleCreateTemplate={handleCreateTemplate}
          defaultTab={selectedItemType}
        />
      )}

      {viewTemplateItem && (
        <ViewTemplateItemModal
          item={viewTemplateItem}
          template={getTemplateForItem(viewTemplateItem)}
          onClose={() => {return setViewTemplateItem(null)}}
          onEdit={handleUpdateTemplateItem}
          onVersionRestore={handleRestoreTemplateItemVersion}
          inventoryItems={inventoryItems}
          updateInventoryStock={updateInventoryStock}
          trackInventoryUsage={trackInventoryUsage}
        />
      )}

      {showTemplateItemHistory && (
        <TemplateItemHistoryModal
          item={showTemplateItemHistory}
          onClose={() => {return setShowTemplateItemHistory(null)}}
          onVersionRestore={
            handleRestoreTemplateItemVersion
              ? (itemId, versionId) => {
                  if (handleRestoreTemplateItemVersion) {
                    handleRestoreTemplateItemVersion(itemId, versionId);
                    setShowTemplateItemHistory(null);
                  }
                }
              : undefined
          }
          onVersionView={() => {
            // In a real app, you might fetch the specific version here
            // For now we'll just close the history and open the item view
            setShowTemplateItemHistory(null);
            setViewTemplateItem(showTemplateItemHistory);
          }}
        />
      )}
    </>
  );
};

export default FileDetailsDialog;
