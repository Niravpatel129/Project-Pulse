import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  InventoryCategory,
  InventoryItem,
  Product,
  ProjectFile,
  Template,
  mockInventoryCategories,
  mockTemplates,
} from '@/lib/mock/projectFiles';
import {
  CheckCircle2,
  DollarSign,
  FileCog,
  FilePlus,
  FileText,
  ImageIcon,
  PackagePlus,
  Paperclip,
  PlusCircle,
  Shirt,
  Tag,
  X,
} from 'lucide-react';
import React, { useState } from 'react';
import TemplateCreationModal from './TemplateCreationModal';
import TemplateItemModal from './TemplateItemModal';

interface AddItemsModalProps {
  selectedFile: ProjectFile;
  products?: Product[];
  templates?: Template[];
  inventoryItems?: InventoryItem[];
  inventoryCategories?: InventoryCategory[];
  handleAddAttachmentToFileItem?: (fileItemId: string) => void;
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
  handleAddTemplateItem?: (item: ProjectFile) => void;
  handleCreateTemplate?: (template: Template) => void;
  handleFileUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFiles?: File[];
  defaultTab?: 'files' | 'products' | 'services' | 'templates';
  onClose: () => void;
}

const AddItemsModal: React.FC<AddItemsModalProps> = ({
  selectedFile,
  products = [],
  templates = mockTemplates, // Default to mock templates if none provided
  inventoryItems = [],
  inventoryCategories = mockInventoryCategories,
  handleAddAttachmentToFileItem,
  handleAddProductToFileItem,
  handleAddTemplateItem,
  handleCreateTemplate,
  handleFileUpload,
  uploadedFiles = [],
  onClose,
  defaultTab = 'files',
}) => {
  const [activeTab, setActiveTab] = useState<string>(defaultTab);
  const [showModal, setShowModal] = useState(true);
  const [itemsAdded, setItemsAdded] = useState({
    files: 0,
    products: 0,
    services: 0,
    invoices: 0,
    templates: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
  });
  const [selectedExistingProducts, setSelectedExistingProducts] = useState<string[]>([]);
  const [showTemplateCreationModal, setShowTemplateCreationModal] = useState(false);
  const [selectedTemplateId, setSelectedTemplateId] = useState<string | null>(null);
  const [showTemplateItemModal, setShowTemplateItemModal] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string>('');

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const handleAddFiles = () => {
    if (uploadedFiles.length > 0 && handleAddAttachmentToFileItem) {
      handleAddAttachmentToFileItem(selectedFile.id);
      setItemsAdded({
        ...itemsAdded,
        files: itemsAdded.files + uploadedFiles.length,
      });

      // Show success message
      setSuccessMessage(`Added ${uploadedFiles.length} file(s)`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);

      // In a real app, we'd clear uploadedFiles here, but for this demo
      // we'll rely on the parent component to handle that
    }
  };

  const handleAddProduct = () => {
    if (!handleAddProductToFileItem) return;

    if (showNewProductForm) {
      // Adding a new product
      if (!newProduct.name || !newProduct.price) return;

      handleAddProductToFileItem(selectedFile.id, {
        ...newProduct,
        isNew: true,
      });

      setItemsAdded({
        ...itemsAdded,
        products: itemsAdded.products + 1,
      });

      // Show success message
      setSuccessMessage(`Added product: ${newProduct.name}`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);

      // Reset form
      setNewProduct({
        name: '',
        price: '',
        description: '',
      });
      setShowNewProductForm(false);
    } else if (selectedProduct) {
      // Adding an existing product
      handleAddProductToFileItem(selectedFile.id, {
        id: selectedProduct,
        isNew: false,
      });

      setItemsAdded({
        ...itemsAdded,
        products: itemsAdded.products + 1,
      });

      // Show success message
      const product = products.find((p) => {return p.id === selectedProduct});
      setSuccessMessage(`Added product: ${product?.name || 'Selected product'}`);
      setTimeout(() => {
        setSuccessMessage('');
      }, 2000);

      // Reset selected product
      setSelectedProduct('');
    }
  };

  const handleAddSelectedProducts = () => {
    if (!handleAddProductToFileItem || selectedExistingProducts.length === 0) return;

    // Add all selected products
    selectedExistingProducts.forEach((productId) => {
      handleAddProductToFileItem(selectedFile.id, {
        id: productId,
        isNew: false,
      });
    });

    setItemsAdded({
      ...itemsAdded,
      products: itemsAdded.products + selectedExistingProducts.length,
    });

    // Show success message
    setSuccessMessage(`Added ${selectedExistingProducts.length} product(s)`);
    setTimeout(() => {
      setSuccessMessage('');
    }, 2000);

    setSelectedExistingProducts([]);
  };

  const toggleProductSelection = (productId: string) => {
    if (selectedExistingProducts.includes(productId)) {
      setSelectedExistingProducts(selectedExistingProducts.filter((id) => {return id !== productId}));
    } else {
      setSelectedExistingProducts([...selectedExistingProducts, productId]);
    }
  };

  const handleTemplateCreated = (template: Template) => {
    if (handleCreateTemplate) {
      handleCreateTemplate(template);
      setShowTemplateCreationModal(false);
      // You might want to automatically select this new template
      setSelectedTemplateId(template.id);
    }
  };

  const handleTemplateItemCreated = (item: ProjectFile) => {
    if (handleAddTemplateItem) {
      handleAddTemplateItem(item);
      setShowTemplateItemModal(false);
      setItemsAdded({
        ...itemsAdded,
        templates: itemsAdded.templates + 1,
      });

      // Show success message briefly
      setSuccessMessage(`Added template item: ${item.name}`);
      setTimeout(() => {
        setSuccessMessage('');
        // Optional: Close the entire modal after adding the item
        // handleClose();
      }, 2000);
    }
  };

  const selectedTemplate = selectedTemplateId
    ? templates.find((t) => {return t.id === selectedTemplateId})
    : null;

  return (
    <Dialog open={showModal} onOpenChange={handleClose}>
      <DialogContent className='sm:max-w-[800px]'>
        <DialogHeader>
          <DialogTitle>Add Items</DialogTitle>
          <DialogDescription>
            Add files, products, services or template items to this file item.
          </DialogDescription>
        </DialogHeader>

        {successMessage && (
          <div className='bg-green-100 border border-green-400 text-green-700 px-4 py-2 rounded relative flex items-center mb-4'>
            <CheckCircle2 className='h-4 w-4 mr-2' />
            {successMessage}
          </div>
        )}

        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='grid grid-cols-4'>
            <TabsTrigger value='files' className='flex items-center gap-1'>
              <Paperclip className='h-4 w-4' />
              Files
            </TabsTrigger>
            <TabsTrigger value='products' className='flex items-center gap-1'>
              <Tag className='h-4 w-4' />
              Products
            </TabsTrigger>
            <TabsTrigger value='services' className='flex items-center gap-1'>
              <DollarSign className='h-4 w-4' />
              Services
            </TabsTrigger>
            <TabsTrigger value='templates' className='flex items-center gap-1'>
              <FileCog className='h-4 w-4' />
              Templates
            </TabsTrigger>
          </TabsList>

          <TabsContent value='files' className='mt-0 h-full'>
            <div className='space-y-4'>
              <div className='border border-dashed rounded-md p-6 flex flex-col items-center justify-center'>
                <div className='mb-4 flex flex-col items-center'>
                  <FilePlus className='h-10 w-10 text-gray-400 mb-2' />
                  <h3 className='text-lg font-medium'>Upload Files</h3>
                  <p className='text-sm text-gray-500 text-center mt-1'>
                    Drag files here or click to browse
                  </p>
                </div>
                <input
                  id='bulk-file-upload'
                  type='file'
                  className='hidden'
                  onChange={handleFileUpload}
                  multiple
                />
                <Button
                  variant='outline'
                  onClick={() => {return document.getElementById('bulk-file-upload')?.click()}}
                >
                  Browse Files
                </Button>
              </div>

              {uploadedFiles.length > 0 && (
                <div>
                  <div className='flex justify-between items-center mb-2'>
                    <h4 className='text-sm font-medium'>Files to Add ({uploadedFiles.length})</h4>
                    <Button variant='ghost' size='sm' className='h-8'>
                      Clear All
                    </Button>
                  </div>
                  <div className='border rounded-md p-2 max-h-60 overflow-y-auto'>
                    {uploadedFiles.map((file, index) => {return (
                      <div
                        key={index}
                        className='flex justify-between items-center py-2 px-3 border-b last:border-b-0'
                      >
                        <div className='flex items-center'>
                          {file.name.match(/\.(jpg|jpeg|png|gif)$/i) ? (
                            <ImageIcon className='h-5 w-5 text-blue-500 mr-2' />
                          ) : file.name.match(/\.(pdf)$/i) ? (
                            <FileText className='h-5 w-5 text-red-500 mr-2' />
                          ) : (
                            <Paperclip className='h-5 w-5 text-gray-500 mr-2' />
                          )}
                          <span className='text-sm'>{file.name}</span>
                        </div>
                        <div className='flex items-center'>
                          <span className='text-xs text-gray-500 mr-3'>
                            {Math.round(file.size / 1024)} KB
                          </span>
                          <Button variant='ghost' size='icon' className='h-7 w-7'>
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                    )})}
                  </div>
                  <div className='mt-4'>
                    <Button onClick={handleAddFiles} disabled={uploadedFiles.length === 0}>
                      Add Files to Collection
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value='products' className='mt-0 h-full'>
            <div className='space-y-6'>
              <div className='flex justify-between items-center'>
                <h3 className='text-lg font-medium'>Products</h3>
                <div className='flex items-center space-x-2'>
                  <Button
                    variant='outline'
                    size='sm'
                    onClick={() => {return setShowNewProductForm(!showNewProductForm)}}
                  >
                    {showNewProductForm ? 'Select Existing' : 'Create New Product'}
                  </Button>
                </div>
              </div>

              {!showNewProductForm ? (
                <div className='space-y-4'>
                  <div className='border rounded-md overflow-hidden'>
                    {products.length > 0 ? (
                      <div className='max-h-80 overflow-y-auto'>
                        {products.map((product) => {return (
                          <div
                            key={product.id}
                            className={`flex justify-between items-center py-3 px-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                              selectedExistingProducts.includes(product.id) ? 'bg-primary/5' : ''
                            }`}
                            onClick={() => {return toggleProductSelection(product.id)}}
                          >
                            <div className='flex items-center'>
                              <div
                                className={`mr-3 ${
                                  selectedExistingProducts.includes(product.id)
                                    ? 'text-primary'
                                    : 'text-gray-300'
                                }`}
                              >
                                <CheckCircle2 className='h-5 w-5' />
                              </div>
                              <div>
                                <div className='font-medium'>{product.name}</div>
                                <div className='text-sm text-gray-500'>{product.description}</div>
                              </div>
                            </div>
                            <div className='text-base font-medium'>${product.price}</div>
                          </div>
                        )})}
                      </div>
                    ) : (
                      <div className='py-8 text-center text-gray-500'>
                        <div className='flex justify-center mb-2'>
                          <PackagePlus className='h-10 w-10 text-gray-400' />
                        </div>
                        <p>No products available.</p>
                        <p className='text-sm mt-1'>Create your first product to get started.</p>
                      </div>
                    )}
                  </div>

                  <div className='flex items-center justify-between'>
                    <span className='text-sm text-gray-500'>
                      {selectedExistingProducts.length} product
                      {selectedExistingProducts.length !== 1 ? 's' : ''} selected
                    </span>
                    <Button
                      disabled={selectedExistingProducts.length === 0}
                      onClick={handleAddSelectedProducts}
                    >
                      Add Selected Products
                    </Button>
                  </div>
                </div>
              ) : (
                <div className='space-y-4 border rounded-md p-4'>
                  <h4 className='font-medium'>Create New Product</h4>
                  <div className='space-y-4'>
                    <div className='space-y-2'>
                      <Label htmlFor='new-product-name'>Product Name*</Label>
                      <Input
                        id='new-product-name'
                        value={newProduct.name}
                        onChange={(e) => {return setNewProduct({ ...newProduct, name: e.target.value })}}
                        placeholder='T-shirt Design 2024'
                      />
                    </div>

                    <div className='space-y-2'>
                      <Label htmlFor='new-product-price'>Price*</Label>
                      <Input
                        id='new-product-price'
                        value={newProduct.price}
                        onChange={(e) => {return setNewProduct({ ...newProduct, price: e.target.value })}}
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
                          {return setNewProduct({ ...newProduct, description: e.target.value })}
                        }
                        placeholder='Product description...'
                        rows={3}
                      />
                    </div>
                  </div>
                  <div className='pt-2 flex justify-end'>
                    <Button
                      disabled={!newProduct.name || !newProduct.price}
                      onClick={handleAddProduct}
                    >
                      Create & Add Product
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </TabsContent>

          <TabsContent value='services' className='mt-0 h-full'>
            <div className='flex flex-col items-center justify-center py-10'>
              <Shirt className='h-16 w-16 text-gray-300 mb-4' />
              <h3 className='text-lg font-medium mb-2'>Add Services</h3>
              <p className='text-gray-500 text-center max-w-md mb-6'>
                Coming soon! You&apos;ll be able to add service offerings like photoshoots, design
                consultations, and more to your collections.
              </p>
              <Button variant='outline' disabled>
                Add Services
              </Button>
            </div>
          </TabsContent>

          <TabsContent value='templates' className='py-4'>
            <div className='space-y-6'>
              <div>
                <h3 className='text-lg font-medium'>Create from Template</h3>
                <p className='text-sm text-muted-foreground mb-4'>
                  Select a template to create a new item
                </p>

                <div className='grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4'>
                  {templates.map((template) => {return (
                    <div
                      key={template.id}
                      className={`border rounded-md p-4 cursor-pointer hover:border-primary transition-colors ${
                        selectedTemplateId === template.id ? 'border-primary bg-primary/5' : ''
                      }`}
                      onClick={() => {return setSelectedTemplateId(template.id)}}
                    >
                      <div className='flex items-center gap-2 mb-2'>
                        {template.icon === 'shirt' ? (
                          <Shirt className='h-5 w-5 text-primary' />
                        ) : (
                          <FileCog className='h-5 w-5 text-primary' />
                        )}
                        <span className='font-medium'>{template.name}</span>
                      </div>
                      {template.description && (
                        <p className='text-sm text-muted-foreground'>{template.description}</p>
                      )}
                      <div className='text-xs text-muted-foreground mt-2'>
                        {template.fields.length} fields
                      </div>
                    </div>
                  )})}

                  <div
                    className='border border-dashed rounded-md p-4 flex flex-col items-center justify-center gap-2 cursor-pointer hover:border-primary hover:bg-primary/5 transition-colors'
                    onClick={() => {return setShowTemplateCreationModal(true)}}
                  >
                    <PlusCircle className='h-6 w-6 text-muted-foreground' />
                    <span className='text-sm font-medium'>New Template</span>
                  </div>
                </div>
              </div>

              <div className='flex justify-end space-x-2'>
                <Button variant='outline' onClick={handleClose}>
                  Cancel
                </Button>
                <Button
                  onClick={() => {
                    if (selectedTemplateId) {
                      setShowTemplateItemModal(true);
                    } else {
                      alert('Please select a template first');
                    }
                  }}
                  disabled={!selectedTemplateId}
                >
                  Create Item from Template
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        {showTemplateCreationModal && (
          <TemplateCreationModal
            onClose={() => {return setShowTemplateCreationModal(false)}}
            onSave={handleTemplateCreated}
            inventoryCategories={inventoryCategories}
          />
        )}

        {showTemplateItemModal && selectedTemplate && (
          <TemplateItemModal
            template={selectedTemplate}
            onClose={() => {return setShowTemplateItemModal(false)}}
            onSave={handleTemplateItemCreated}
            inventoryItems={inventoryItems}
          />
        )}
      </DialogContent>
    </Dialog>
  );
};

export default AddItemsModal;
