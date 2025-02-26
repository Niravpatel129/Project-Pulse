import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Button } from '@/components/ui/button';
import { DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Attachment, Product, ProjectFile } from '@/lib/mock/projectFiles';
import { format } from 'date-fns';
import {
  DollarSign,
  Download,
  FilePlus,
  Link,
  Mail,
  Package,
  Send,
  Shirt,
  Tag,
} from 'lucide-react';
import React, { useState } from 'react';
import AddItemsModal from './AddItemsModal';

interface FileDetailsDialogProps {
  selectedFile: ProjectFile | null;
  getAttachmentIcon: (type: string) => React.ReactNode;
  getStatusBadgeClass: (status?: string) => string;
  commentText: string;
  setCommentText: (value: string) => void;
  handleAddComment: () => void;
  handleOpenVersionHistory: (attachment: Attachment) => void;
  onSendEmail: () => void;
  handleFileUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFiles?: File[];
  handleAddAttachmentToFileItem?: (fileItemId: string) => void;
  products?: Product[];
  handleAddProductToFileItem?: (
    fileItemId: string,
    productData: {
      id?: string;
      name?: string;
      price?: string;
      description?: string;
      isNew: boolean;
    },
  ) => void;
}

const FileDetailsDialog: React.FC<FileDetailsDialogProps> = ({
  selectedFile,
  getAttachmentIcon,
  getStatusBadgeClass,
  commentText,
  setCommentText,
  handleAddComment,
  handleOpenVersionHistory,
  onSendEmail,
  handleFileUpload,
  uploadedFiles = [],
  handleAddAttachmentToFileItem,
  products = [],
  handleAddProductToFileItem,
}) => {
  const [showAddContent, setShowAddContent] = useState(false);
  const [contentType, setContentType] = useState<'file' | 'product' | 'service' | 'invoice'>(
    'file',
  );
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
  });
  const [showAddItemsModal, setShowAddItemsModal] = useState(false);

  if (!selectedFile) return null;

  const handleProductAction = () => {
    if (!handleAddProductToFileItem) return;

    if (showNewProductForm && newProduct.name && newProduct.price) {
      // Create new product and attach
      handleAddProductToFileItem(selectedFile.id, {
        name: newProduct.name,
        price: newProduct.price,
        description: newProduct.description,
        isNew: true,
      });
      setNewProduct({ name: '', price: '', description: '' });
    } else if (selectedProduct) {
      // Attach existing product
      const product = products.find((p) => p.id === selectedProduct);
      if (product) {
        handleAddProductToFileItem(selectedFile.id, {
          id: product.id,
          isNew: false,
        });
      }
    }
    setShowAddContent(false);
    setShowNewProductForm(false);
    setSelectedProduct('');
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
                    <Button
                      variant='ghost'
                      size='sm'
                      className='h-6 w-6 p-0 ml-1 text-gray-500 hover:text-gray-700'
                      onClick={() => setShowAddContent(!showAddContent)}
                    >
                      <span className='text-lg font-medium'>+</span>
                    </Button>
                  </div>

                  <Button
                    variant='outline'
                    size='sm'
                    className='flex items-center'
                    onClick={() => setShowAddItemsModal(true)}
                  >
                    <Package className='h-4 w-4 mr-1' />
                    <span>Manage Collection</span>
                  </Button>
                </div>

                <div className='flex flex-wrap gap-2 mb-4'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setContentType('file');
                      setShowAddContent(true);
                      setShowNewProductForm(false);
                    }}
                  >
                    <FilePlus className='h-4 w-4 mr-1' />
                    Add File
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setContentType('product');
                      setShowAddContent(true);
                      setShowNewProductForm(false);
                    }}
                  >
                    <Tag className='h-4 w-4 mr-1' />
                    Add Product
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setContentType('service');
                      setShowAddContent(true);
                      setShowNewProductForm(false);
                    }}
                  >
                    <Shirt className='h-4 w-4 mr-1' />
                    Add Service
                  </Button>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setContentType('invoice');
                      setShowAddContent(true);
                      setShowNewProductForm(false);
                    }}
                  >
                    <DollarSign className='h-4 w-4 mr-1' />
                    Add Invoice
                  </Button>
                </div>
              </div>

              {showAddContent && (
                <div className='mb-4 p-3 border rounded-md bg-gray-50'>
                  <div className='flex justify-between items-center mb-3'>
                    <h5 className='text-sm font-medium'>
                      {contentType === 'file' && 'Add New File'}
                      {contentType === 'product' && 'Add Product'}
                      {contentType === 'service' && 'Add Service'}
                      {contentType === 'invoice' && 'Add Invoice'}
                    </h5>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => setShowAddContent(false)}
                      className='h-6 w-6 p-0 rounded-full'
                    >
                      ✕
                    </Button>
                  </div>

                  {contentType === 'file' && (
                    <div className='space-y-2'>
                      <div className='border border-dashed rounded-md p-3 flex flex-col items-center justify-center'>
                        <FilePlus className='h-6 w-6 text-gray-400 mb-2' />
                        <p className='text-sm text-gray-500 mb-2'>Upload a file</p>
                        <input
                          id='file-upload-details'
                          type='file'
                          className='hidden'
                          onChange={handleFileUpload}
                          multiple
                        />
                        <Button
                          size='sm'
                          variant='outline'
                          onClick={() => document.getElementById('file-upload-details')?.click()}
                        >
                          Browse Files
                        </Button>
                      </div>

                      {uploadedFiles.length > 0 && (
                        <div>
                          <h6 className='text-xs font-medium mb-1'>Selected Files</h6>
                          <div className='space-y-1 max-h-24 overflow-y-auto'>
                            {uploadedFiles.map((file, index) => (
                              <div
                                key={index}
                                className='text-xs flex items-center justify-between'
                              >
                                <span>{file.name}</span>
                                <span>{Math.round(file.size / 1024)} KB</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}

                      <div className='flex justify-end mt-3'>
                        <Button
                          size='sm'
                          disabled={uploadedFiles.length === 0}
                          onClick={() => {
                            if (handleAddAttachmentToFileItem) {
                              handleAddAttachmentToFileItem(selectedFile.id);
                              setShowAddContent(false);
                            }
                          }}
                        >
                          Add to {selectedFile.name}
                        </Button>
                      </div>
                    </div>
                  )}

                  {contentType === 'product' && (
                    <div className='space-y-3'>
                      <div className='space-y-2'>
                        <div className='flex justify-between items-center'>
                          <Label htmlFor='product-select'>Select Product</Label>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setShowNewProductForm(!showNewProductForm)}
                          >
                            {showNewProductForm ? 'Select Existing' : 'Create New'}
                          </Button>
                        </div>

                        {!showNewProductForm ? (
                          <div className='space-y-3'>
                            <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                              <SelectTrigger id='product-select'>
                                <SelectValue placeholder='Choose a product' />
                              </SelectTrigger>
                              <SelectContent>
                                {products.length > 0 ? (
                                  products.map((product) => (
                                    <SelectItem key={product.id} value={product.id}>
                                      {product.name} (${product.price})
                                    </SelectItem>
                                  ))
                                ) : (
                                  <SelectItem value='no-products' disabled>
                                    No products available
                                  </SelectItem>
                                )}
                              </SelectContent>
                            </Select>

                            <div className='flex justify-end'>
                              <Button
                                size='sm'
                                disabled={!selectedProduct || selectedProduct === 'no-products'}
                                onClick={handleProductAction}
                              >
                                Link Product to {selectedFile.name}
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className='space-y-3 border rounded p-3'>
                            <div className='space-y-2'>
                              <Label htmlFor='new-product-name'>Product Name*</Label>
                              <Input
                                id='new-product-name'
                                value={newProduct.name}
                                onChange={(e) =>
                                  setNewProduct({ ...newProduct, name: e.target.value })
                                }
                                placeholder='T-shirt Design 2024'
                              />
                            </div>

                            <div className='space-y-2'>
                              <Label htmlFor='new-product-price'>Price*</Label>
                              <Input
                                id='new-product-price'
                                value={newProduct.price}
                                onChange={(e) =>
                                  setNewProduct({ ...newProduct, price: e.target.value })
                                }
                                placeholder='29.99'
                                type='number'
                                step='0.01'
                              />
                            </div>

                            <div className='space-y-2'>
                              <Label htmlFor='new-product-desc'>Description</Label>
                              <Textarea
                                id='new-product-desc'
                                value={newProduct.description}
                                onChange={(e) =>
                                  setNewProduct({ ...newProduct, description: e.target.value })
                                }
                                placeholder='Product description...'
                                rows={2}
                              />
                            </div>

                            <div className='pt-2'>
                              <p className='text-xs text-gray-500 mb-2'>
                                Upload files related to this product using the File option
                              </p>
                              <div className='flex justify-end'>
                                <Button
                                  size='sm'
                                  disabled={!newProduct.name || !newProduct.price}
                                  onClick={handleProductAction}
                                >
                                  Create & Add to {selectedFile.name}
                                </Button>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {(contentType === 'service' || contentType === 'invoice') && (
                    <div className='p-2 text-center'>
                      <p className='text-sm text-gray-600 mb-3'>
                        {contentType === 'service' &&
                          'Define a service with related documents and details'}
                        {contentType === 'invoice' &&
                          'Create an invoice with payment details and supporting files'}
                      </p>
                      <div className='flex flex-col items-center'>
                        <div className='bg-gray-100 rounded-md p-3 mb-3 text-xs text-gray-500 w-full max-w-xs'>
                          <div className='flex items-center mb-2'>
                            <span className='w-1/3 font-medium'>Name:</span>
                            <span className='w-2/3'>New {contentType}</span>
                          </div>
                          <div className='flex items-center mb-2'>
                            <span className='w-1/3 font-medium'>Type:</span>
                            <span className='w-2/3'>
                              {contentType.charAt(0).toUpperCase() + contentType.slice(1)}
                            </span>
                          </div>
                          <div className='flex items-center'>
                            <span className='w-1/3 font-medium'>Required:</span>
                            <span className='w-2/3'>At least one file attachment</span>
                          </div>
                        </div>
                        <Button size='sm' variant='outline' onClick={() => setContentType('file')}>
                          Start by adding a file
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              )}

              {selectedFile.attachments.length > 0 && (
                <div>
                  <h5 className='text-sm font-medium mb-2'>Files</h5>
                  <div className='space-y-2 mb-4'>
                    {selectedFile.attachments.map((attachment) => (
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
                              onClick={() => handleOpenVersionHistory(attachment)}
                            >
                              <span className='text-xs'>{attachment.versions.length} versions</span>
                            </Button>
                          )}
                          <Button variant='ghost' size='icon'>
                            <Download className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedFile.products && selectedFile.products.length > 0 && (
                <div>
                  <h5 className='text-sm font-medium mb-2'>Products</h5>
                  <div className='space-y-2 mb-4'>
                    {selectedFile.products.map((product, index) => (
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
                    ))}
                  </div>
                </div>
              )}
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
                selectedFile.comments.map((comment) => (
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
                ))
              )}
            </div>

            <div className='border-t pt-4'>
              <Textarea
                placeholder='Add a comment...'
                value={commentText}
                onChange={(e) => setCommentText(e.target.value)}
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

      {showAddItemsModal && (
        <AddItemsModal
          selectedFile={selectedFile}
          products={products}
          handleAddAttachmentToFileItem={handleAddAttachmentToFileItem}
          handleAddProductToFileItem={handleAddProductToFileItem}
          handleFileUpload={handleFileUpload}
          uploadedFiles={uploadedFiles}
          onClose={() => setShowAddItemsModal(false)}
        />
      )}
    </>
  );
};

export default FileDetailsDialog;
