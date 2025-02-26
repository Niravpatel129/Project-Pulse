import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Product, ProjectFile } from '@/lib/mock/projectFiles';
import {
  CheckCircle2,
  DollarSign,
  FilePlus,
  FileText,
  ImageIcon,
  PackagePlus,
  Paperclip,
  Shirt,
  Tag,
  X,
} from 'lucide-react';
import React, { useState } from 'react';

interface AddItemsModalProps {
  selectedFile: ProjectFile;
  products?: Product[];
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
  handleFileUpload?: (e: React.ChangeEvent<HTMLInputElement>) => void;
  uploadedFiles?: File[];
  onClose: () => void;
}

const AddItemsModal: React.FC<AddItemsModalProps> = ({
  selectedFile,
  products = [],
  handleAddAttachmentToFileItem,
  handleAddProductToFileItem,
  handleFileUpload,
  uploadedFiles = [],
  onClose,
}) => {
  const [activeTab, setActiveTab] = useState<string>('files');
  const [showModal, setShowModal] = useState(true);
  const [itemsAdded, setItemsAdded] = useState({
    files: 0,
    products: 0,
    services: 0,
    invoices: 0,
  });
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [showNewProductForm, setShowNewProductForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
  });
  const [selectedExistingProducts, setSelectedExistingProducts] = useState<string[]>([]);

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
      // In a real app, we'd clear uploadedFiles here, but for this demo
      // we'll rely on the parent component to handle that
    }
  };

  const handleAddProduct = () => {
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
      setItemsAdded({
        ...itemsAdded,
        products: itemsAdded.products + 1,
      });
    } else if (selectedProduct) {
      // Attach existing product
      const product = products.find((p) => p.id === selectedProduct);
      if (product) {
        handleAddProductToFileItem(selectedFile.id, {
          id: product.id,
          isNew: false,
        });
        setSelectedProduct('');
        setItemsAdded({
          ...itemsAdded,
          products: itemsAdded.products + 1,
        });
      }
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
    setSelectedExistingProducts([]);
  };

  const toggleProductSelection = (productId: string) => {
    if (selectedExistingProducts.includes(productId)) {
      setSelectedExistingProducts(selectedExistingProducts.filter((id) => id !== productId));
    } else {
      setSelectedExistingProducts([...selectedExistingProducts, productId]);
    }
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className='max-w-4xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>Add Items to {selectedFile.name}</DialogTitle>
          <DialogDescription>
            Add multiple files, products, services, or invoices to this collection.
          </DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-hidden flex flex-col'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='flex-1 flex flex-col overflow-hidden'
          >
            <TabsList className='mb-4 flex justify-start w-full'>
              <TabsTrigger value='files' className='flex items-center'>
                <Paperclip className='h-4 w-4 mr-2' />
                Files
                {itemsAdded.files > 0 && (
                  <span className='ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs'>
                    {itemsAdded.files} added
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value='products' className='flex items-center'>
                <Tag className='h-4 w-4 mr-2' />
                Products
                {itemsAdded.products > 0 && (
                  <span className='ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs'>
                    {itemsAdded.products} added
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value='services' className='flex items-center'>
                <Shirt className='h-4 w-4 mr-2' />
                Services
                {itemsAdded.services > 0 && (
                  <span className='ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs'>
                    {itemsAdded.services} added
                  </span>
                )}
              </TabsTrigger>
              <TabsTrigger value='invoices' className='flex items-center'>
                <DollarSign className='h-4 w-4 mr-2' />
                Invoices
                {itemsAdded.invoices > 0 && (
                  <span className='ml-2 bg-primary/10 text-primary rounded-full px-2 py-0.5 text-xs'>
                    {itemsAdded.invoices} added
                  </span>
                )}
              </TabsTrigger>
            </TabsList>

            <div className='flex-1 overflow-auto'>
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
                      onClick={() => document.getElementById('bulk-file-upload')?.click()}
                    >
                      Browse Files
                    </Button>
                  </div>

                  {uploadedFiles.length > 0 && (
                    <div>
                      <div className='flex justify-between items-center mb-2'>
                        <h4 className='text-sm font-medium'>
                          Files to Add ({uploadedFiles.length})
                        </h4>
                        <Button variant='ghost' size='sm' className='h-8'>
                          Clear All
                        </Button>
                      </div>
                      <div className='border rounded-md p-2 max-h-60 overflow-y-auto'>
                        {uploadedFiles.map((file, index) => (
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
                        ))}
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
                        onClick={() => setShowNewProductForm(!showNewProductForm)}
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
                            {products.map((product) => (
                              <div
                                key={product.id}
                                className={`flex justify-between items-center py-3 px-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                                  selectedExistingProducts.includes(product.id)
                                    ? 'bg-primary/5'
                                    : ''
                                }`}
                                onClick={() => toggleProductSelection(product.id)}
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
                                    <div className='text-sm text-gray-500'>
                                      {product.description}
                                    </div>
                                  </div>
                                </div>
                                <div className='text-base font-medium'>${product.price}</div>
                              </div>
                            ))}
                          </div>
                        ) : (
                          <div className='py-8 text-center text-gray-500'>
                            <div className='flex justify-center mb-2'>
                              <PackagePlus className='h-10 w-10 text-gray-400' />
                            </div>
                            <p>No products available.</p>
                            <p className='text-sm mt-1'>
                              Create your first product to get started.
                            </p>
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
                            onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
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
                    Coming soon! You&apos;ll be able to add service offerings like photoshoots,
                    design consultations, and more to your collections.
                  </p>
                  <Button variant='outline' disabled>
                    Add Services
                  </Button>
                </div>
              </TabsContent>

              <TabsContent value='invoices' className='mt-0 h-full'>
                <div className='flex flex-col items-center justify-center py-10'>
                  <DollarSign className='h-16 w-16 text-gray-300 mb-4' />
                  <h3 className='text-lg font-medium mb-2'>Add Invoices</h3>
                  <p className='text-gray-500 text-center max-w-md mb-6'>
                    Coming soon! Link existing invoices or create new ones directly within your
                    collections.
                  </p>
                  <Button variant='outline' disabled>
                    Add Invoices
                  </Button>
                </div>
              </TabsContent>
            </div>
          </Tabs>
        </div>

        <DialogFooter className='pt-4 flex justify-between'>
          <div className='text-sm text-gray-500'>
            {Object.values(itemsAdded).reduce((a, b) => a + b, 0)} item
            {Object.values(itemsAdded).reduce((a, b) => a + b, 0) !== 1 ? 's' : ''} added
          </div>
          <div className='flex gap-2'>
            <Button variant='outline' onClick={handleClose}>
              Close
            </Button>
            <Button
              onClick={handleClose}
              disabled={Object.values(itemsAdded).reduce((a, b) => a + b, 0) === 0}
            >
              Done
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddItemsModal;
