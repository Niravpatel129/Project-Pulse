import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { Product, ProjectFile } from '@/lib/mock/projectFiles';
import { CheckCircle2, Plus, SearchIcon, Tag, X } from 'lucide-react';
import { useState } from 'react';

interface AddProductModalProps {
  selectedFile: ProjectFile;
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
  onClose: () => void;
}

const AddProductModal: React.FC<AddProductModalProps> = ({
  selectedFile,
  products = [],
  handleAddProductToFileItem,
  onClose,
}) => {
  const [showModal, setShowModal] = useState(true);
  const [tab, setTab] = useState('existing');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [productCategory, setProductCategory] = useState('');

  const [newProduct, setNewProduct] = useState({
    name: '',
    price: '',
    description: '',
    sku: '',
    category: '',
    hasVariants: false,
    variants: [
      {
        name: 'Default',
        price: '',
        sku: '',
      },
    ],
    sizes: [] as string[],
    colors: [] as string[],
  });

  const productCategories = [
    'Apparel',
    'Digital Products',
    'Photography',
    'Print',
    'Graphics',
    'Services',
    'Other',
  ];

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL', 'XXL', '3XL'];
  const availableColors = ['Black', 'White', 'Red', 'Blue', 'Green', 'Gray', 'Custom'];

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const handleAddExistingProducts = () => {
    if (!handleAddProductToFileItem || selectedProducts.length === 0) return;

    // Add all selected products
    selectedProducts.forEach((productId) => {
      handleAddProductToFileItem(selectedFile.id, {
        id: productId,
        isNew: false,
      });
    });

    handleClose();
  };

  const handleCreateProduct = () => {
    if (!handleAddProductToFileItem || !newProduct.name || !newProduct.price) return;

    handleAddProductToFileItem(selectedFile.id, {
      name: newProduct.name,
      price: newProduct.price,
      description: newProduct.description,
      isNew: true,
    });

    handleClose();
  };

  const toggleProductSelection = (productId: string) => {
    if (selectedProducts.includes(productId)) {
      setSelectedProducts(selectedProducts.filter((id) => {return id !== productId}));
    } else {
      setSelectedProducts([...selectedProducts, productId]);
    }
  };

  const addVariant = () => {
    setNewProduct({
      ...newProduct,
      variants: [
        ...newProduct.variants,
        {
          name: `Variant ${newProduct.variants.length + 1}`,
          price: '',
          sku: '',
        },
      ],
    });
  };

  const removeVariant = (index: number) => {
    const variants = [...newProduct.variants];
    variants.splice(index, 1);
    setNewProduct({
      ...newProduct,
      variants,
    });
  };

  const updateVariant = (index: number, field: string, value: string) => {
    const variants = [...newProduct.variants];
    variants[index] = {
      ...variants[index],
      [field]: value,
    };
    setNewProduct({
      ...newProduct,
      variants,
    });
  };

  const toggleSize = (size: string) => {
    if (newProduct.sizes.includes(size)) {
      setNewProduct({
        ...newProduct,
        sizes: newProduct.sizes.filter((s) => {return s !== size}),
      });
    } else {
      setNewProduct({
        ...newProduct,
        sizes: [...newProduct.sizes, size],
      });
    }
  };

  const toggleColor = (color: string) => {
    if (newProduct.colors.includes(color)) {
      setNewProduct({
        ...newProduct,
        colors: newProduct.colors.filter((c) => {return c !== color}),
      });
    } else {
      setNewProduct({
        ...newProduct,
        colors: [...newProduct.colors, color],
      });
    }
  };

  const filteredProducts = products.filter(
    (product) =>
      {return product.name.toLowerCase().includes(searchTerm.toLowerCase()) &&
      (productCategory === '' || product.category === productCategory)},
  );

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>Add Products</DialogTitle>
          <DialogDescription>Add products to {selectedFile.name}</DialogDescription>
        </DialogHeader>

        <Tabs value={tab} onValueChange={setTab} className='flex-1 flex flex-col overflow-hidden'>
          <TabsList className='mx-auto mb-4'>
            <TabsTrigger value='existing'>Select Existing Products</TabsTrigger>
            <TabsTrigger value='new'>Create New Product</TabsTrigger>
          </TabsList>

          <div className='flex-1 overflow-auto'>
            <TabsContent value='existing' className='mt-0 h-full space-y-4'>
              <div className='flex flex-col md:flex-row gap-4'>
                <div className='w-full md:w-3/4'>
                  <div className='relative'>
                    <SearchIcon className='absolute left-3 top-2.5 h-4 w-4 text-gray-400' />
                    <Input
                      placeholder='Search products...'
                      className='pl-9'
                      value={searchTerm}
                      onChange={(e) => {return setSearchTerm(e.target.value)}}
                    />
                  </div>
                </div>
                <div className='w-full md:w-1/4'>
                  <Select value={productCategory} onValueChange={setProductCategory}>
                    <SelectTrigger>
                      <SelectValue placeholder='All Categories' />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value='all'>All Categories</SelectItem>
                        {productCategories.map((category) => {return (
                          <SelectItem key={category} value={category.toLowerCase()}>
                            {category}
                          </SelectItem>
                        )})}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className='border rounded-md overflow-hidden'>
                {filteredProducts.length > 0 ? (
                  <div className='max-h-80 overflow-y-auto'>
                    {filteredProducts.map((product) => {return (
                      <div
                        key={product.id}
                        className={`flex justify-between items-center py-3 px-4 border-b last:border-b-0 hover:bg-gray-50 cursor-pointer ${
                          selectedProducts.includes(product.id) ? 'bg-primary/5' : ''
                        }`}
                        onClick={() => {return toggleProductSelection(product.id)}}
                      >
                        <div className='flex items-center'>
                          <div
                            className={`mr-3 ${
                              selectedProducts.includes(product.id)
                                ? 'text-primary'
                                : 'text-gray-300'
                            }`}
                          >
                            <CheckCircle2 className='h-5 w-5' />
                          </div>
                          <div>
                            <div className='font-medium'>{product.name}</div>
                            <div className='text-sm text-gray-500 flex items-center'>
                              <Tag className='h-3 w-3 mr-1' />
                              <span>{product.category || 'Uncategorized'}</span>
                              {product.sku && (
                                <>
                                  <span className='mx-2'>•</span>
                                  <span>SKU: {product.sku}</span>
                                </>
                              )}
                            </div>
                          </div>
                        </div>
                        <div className='text-base font-medium'>${product.price}</div>
                      </div>
                    )})}
                  </div>
                ) : (
                  <div className='py-12 text-center text-gray-500'>
                    <div className='flex justify-center mb-2'>
                      <Tag className='h-12 w-12 text-gray-300' />
                    </div>
                    <p className='font-medium'>No products found</p>
                    <p className='text-sm mt-1'>
                      {searchTerm || productCategory
                        ? 'Try adjusting your search or filter criteria'
                        : 'Create your first product to get started'}
                    </p>
                  </div>
                )}
              </div>

              <div className='flex items-center justify-between'>
                <span className='text-sm text-gray-500'>
                  {selectedProducts.length} product{selectedProducts.length !== 1 ? 's' : ''}{' '}
                  selected
                </span>
                <Button
                  disabled={selectedProducts.length === 0}
                  onClick={handleAddExistingProducts}
                >
                  Add Selected Products
                </Button>
              </div>
            </TabsContent>

            <TabsContent value='new' className='mt-0 h-full space-y-6'>
              <div className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='product-name'>Product Name*</Label>
                    <Input
                      id='product-name'
                      value={newProduct.name}
                      onChange={(e) => {return setNewProduct({ ...newProduct, name: e.target.value })}}
                      placeholder='T-shirt Design 2024'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='product-price'>Base Price*</Label>
                    <Input
                      id='product-price'
                      value={newProduct.price}
                      onChange={(e) => {return setNewProduct({ ...newProduct, price: e.target.value })}}
                      placeholder='29.99'
                      type='number'
                      step='0.01'
                    />
                  </div>
                </div>

                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='product-sku'>SKU</Label>
                    <Input
                      id='product-sku'
                      value={newProduct.sku}
                      onChange={(e) => {return setNewProduct({ ...newProduct, sku: e.target.value })}}
                      placeholder='TSHIRT-2024'
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor='product-category'>Category</Label>
                    <Select
                      value={newProduct.category}
                      onValueChange={(value) => {return setNewProduct({ ...newProduct, category: value })}}
                    >
                      <SelectTrigger id='product-category'>
                        <SelectValue placeholder='Select a category' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          {productCategories.map((category) => {return (
                            <SelectItem key={category} value={category.toLowerCase()}>
                              {category}
                            </SelectItem>
                          )})}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className='space-y-2'>
                  <Label htmlFor='product-description'>Description</Label>
                  <Textarea
                    id='product-description'
                    value={newProduct.description}
                    onChange={(e) => {return setNewProduct({ ...newProduct, description: e.target.value })}}
                    placeholder='Product description...'
                    rows={3}
                  />
                </div>

                <div className='border rounded-md p-4 space-y-4'>
                  <div className='flex items-center justify-between'>
                    <h4 className='font-medium'>Product Variants</h4>
                    <div className='flex items-center space-x-2'>
                      <div className='flex items-center space-x-2'>
                        <Checkbox
                          id='has-variants'
                          checked={newProduct.hasVariants}
                          onCheckedChange={(checked) =>
                            {return setNewProduct({ ...newProduct, hasVariants: checked as boolean })}
                          }
                        />
                        <Label htmlFor='has-variants'>This product has multiple variants</Label>
                      </div>
                    </div>
                  </div>

                  {newProduct.hasVariants ? (
                    <div className='space-y-4'>
                      <div className='grid grid-cols-2 gap-4'>
                        <div className='space-y-2'>
                          <Label>Sizes</Label>
                          <div className='flex flex-wrap gap-2'>
                            {availableSizes.map((size) => {return (
                              <div
                                key={size}
                                className={`px-3 py-1 rounded border cursor-pointer text-sm text-center min-w-[40px] ${
                                  newProduct.sizes.includes(size)
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-white border-gray-200'
                                }`}
                                onClick={() => {return toggleSize(size)}}
                              >
                                {size}
                              </div>
                            )})}
                          </div>
                        </div>
                        <div className='space-y-2'>
                          <Label>Colors</Label>
                          <div className='flex flex-wrap gap-2'>
                            {availableColors.map((color) => {return (
                              <div
                                key={color}
                                className={`px-3 py-1 rounded border cursor-pointer text-sm ${
                                  newProduct.colors.includes(color)
                                    ? 'bg-primary/10 border-primary text-primary'
                                    : 'bg-white border-gray-200'
                                }`}
                                onClick={() => {return toggleColor(color)}}
                              >
                                {color}
                              </div>
                            )})}
                          </div>
                        </div>
                      </div>

                      <div className='space-y-2'>
                        <div className='flex justify-between items-center'>
                          <Label>Variant Details</Label>
                          <Button type='button' variant='outline' size='sm' onClick={addVariant}>
                            <Plus className='h-4 w-4 mr-1' />
                            Add Variant
                          </Button>
                        </div>

                        <div className='space-y-2'>
                          {newProduct.variants.map((variant, index) => {return (
                            <div key={index} className='flex gap-2 items-start'>
                              <Input
                                value={variant.name}
                                onChange={(e) => {return updateVariant(index, 'name', e.target.value)}}
                                placeholder='Variant name'
                                className='flex-1'
                              />
                              <Input
                                value={variant.price}
                                onChange={(e) => {return updateVariant(index, 'price', e.target.value)}}
                                placeholder='Price'
                                type='number'
                                step='0.01'
                                className='w-24'
                              />
                              <Input
                                value={variant.sku}
                                onChange={(e) => {return updateVariant(index, 'sku', e.target.value)}}
                                placeholder='SKU'
                                className='w-28'
                              />
                              {index > 0 && (
                                <Button
                                  type='button'
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => {return removeVariant(index)}}
                                  className='h-9 w-9'
                                >
                                  <X className='h-4 w-4' />
                                </Button>
                              )}
                            </div>
                          )})}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className='py-2 text-center text-sm text-gray-500'>
                      Enable variants if this product comes in different sizes, colors, or styles.
                    </div>
                  )}
                </div>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <DialogFooter className='pt-4 space-x-2'>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          {tab === 'existing' ? (
            <Button onClick={handleAddExistingProducts} disabled={selectedProducts.length === 0}>
              Add {selectedProducts.length} Product{selectedProducts.length !== 1 ? 's' : ''}
            </Button>
          ) : (
            <Button onClick={handleCreateProduct} disabled={!newProduct.name || !newProduct.price}>
              Create & Add Product
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddProductModal;
