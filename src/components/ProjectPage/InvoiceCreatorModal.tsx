import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { InventoryItem, Invoice, InvoiceItem, Product, ProjectFile } from '@/lib/mock/projectFiles';
import { format } from 'date-fns';
import { FileText, Package, Plus, Receipt, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface InvoiceCreatorModalProps {
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
  projectFiles: ProjectFile[];
  products: Product[];
  inventoryItems: InventoryItem[];
  existingInvoice?: Invoice;
  defaultClient?: { id: string; name: string; email: string };
}

const InvoiceCreatorModal: React.FC<InvoiceCreatorModalProps> = ({
  onClose,
  onSave,
  projectFiles,
  products,
  inventoryItems,
  existingInvoice,
  defaultClient,
}) => {
  const today = new Date();
  const thirtyDaysFromNow = new Date(today);
  thirtyDaysFromNow.setDate(today.getDate() + 30);

  // Generate a random ID for new invoices
  const generateId = () => {
    return `inv-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
  };

  // Initialize invoice state
  const [invoice, setInvoice] = useState<Invoice>(
    existingInvoice || {
      id: generateId(),
      number: `INV-${format(today, 'yyyy')}-${String(Math.floor(Math.random() * 1000)).padStart(
        3,
        '0',
      )}`,
      date: format(today, 'yyyy-MM-dd'),
      dueDate: format(thirtyDaysFromNow, 'yyyy-MM-dd'),
      clientId: defaultClient?.id || '',
      clientName: defaultClient?.name || '',
      clientEmail: defaultClient?.email || '',
      items: [],
      subtotal: 0,
      taxTotal: 0,
      discountTotal: 0,
      total: 0,
      status: 'draft',
    },
  );

  // State for UI controls
  const [showAddItemPopover, setShowAddItemPopover] = useState(false);
  const [newItem, setNewItem] = useState<Partial<InvoiceItem>>({
    id: generateId(),
    description: '',
    quantity: 1,
    unitPrice: 0,
    taxRate: 0,
    discount: 0,
    total: 0,
  });

  // Add state for the active tab
  const [activeTab, setActiveTab] = useState<string>('invoice');

  // Calculate the totals based on the items
  const calculateTotals = (items: InvoiceItem[]) => {
    const subtotal = items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);
    const discountTotal = items.reduce((sum, item) => {
      const itemDiscount = item.discount
        ? (item.quantity * item.unitPrice * item.discount) / 100
        : 0;
      return sum + itemDiscount;
    }, 0);
    const taxableAmount = subtotal - discountTotal;
    const taxTotal = items.reduce((sum, item) => {
      const itemTax = item.taxRate ? taxableAmount * (item.taxRate / 100) : 0;
      return sum + itemTax;
    }, 0);
    const total = subtotal - discountTotal + taxTotal;

    setInvoice((prev) => ({
      ...prev,
      subtotal,
      discountTotal,
      taxTotal,
      total,
    }));
  };

  // Update handleUpdateItem to recalculate totals
  const handleUpdateItem = (itemId: string, field: string, value: string | number) => {
    const updatedItems = invoice.items.map((item) => {
      if (item.id === itemId) {
        const updatedItem = { ...item, [field]: value };

        // Recalculate total for this item
        const quantity = updatedItem.quantity;
        const unitPrice = updatedItem.unitPrice;
        const discount = updatedItem.discount || 0;
        const discountAmount = (quantity * unitPrice * discount) / 100;
        const taxableAmount = quantity * unitPrice - discountAmount;
        const taxAmount = updatedItem.taxRate ? taxableAmount * (updatedItem.taxRate / 100) : 0;
        updatedItem.total = taxableAmount + taxAmount;

        return updatedItem;
      }
      return item;
    });

    setInvoice({ ...invoice, items: updatedItems });
    calculateTotals(updatedItems);
  };

  // Calculate totals when invoice items change
  useEffect(() => {
    const subtotal = invoice.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

    const discountTotal = invoice.items.reduce(
      (sum, item) => sum + ((item.discount || 0) / 100) * item.quantity * item.unitPrice,
      0,
    );

    const taxTotal = invoice.items.reduce((sum, item) => {
      const itemSubtotal = item.quantity * item.unitPrice;
      const itemDiscount = ((item.discount || 0) / 100) * itemSubtotal;
      const taxableAmount = itemSubtotal - itemDiscount;
      return sum + ((item.taxRate || 0) / 100) * taxableAmount;
    }, 0);

    const total = subtotal - discountTotal + taxTotal;

    setInvoice((prev) => ({
      ...prev,
      subtotal: parseFloat(subtotal.toFixed(2)),
      discountTotal: parseFloat(discountTotal.toFixed(2)),
      taxTotal: parseFloat(taxTotal.toFixed(2)),
      total: parseFloat(total.toFixed(2)),
    }));
  }, [invoice.items]);

  // Update new item total as user inputs values
  useEffect(() => {
    if (newItem.quantity && newItem.unitPrice) {
      const subtotal = newItem.quantity * newItem.unitPrice;
      const discount = ((newItem.discount || 0) / 100) * subtotal;
      // Don't add tax to the line item total to match most invoice formats
      const total = subtotal - discount;

      setNewItem((prev) => ({
        ...prev,
        total: parseFloat(total.toFixed(2)),
      }));
    }
  }, [newItem.quantity, newItem.unitPrice, newItem.discount]);

  // Handle adding a new item to the invoice
  const handleAddItem = () => {
    if (!newItem.description || !newItem.quantity || !newItem.unitPrice) {
      return; // Don't add incomplete items
    }

    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newItem as InvoiceItem],
    }));

    // Reset the new item form
    setNewItem({
      id: generateId(),
      description: '',
      quantity: 1,
      unitPrice: 0,
      taxRate: 0,
      discount: 0,
      total: 0,
    });

    setShowAddItemPopover(false);
  };

  // Handle removing an item from the invoice
  const handleRemoveItem = (itemId: string) => {
    setInvoice((prev) => ({
      ...prev,
      items: prev.items.filter((item) => item.id !== itemId),
    }));
  };

  // Handle field changes for the invoice
  const handleInvoiceFieldChange = (field: string, value: string | number) => {
    setInvoice((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add product to invoice
  const handleAddProduct = (product: Product) => {
    const newInvoiceItem: InvoiceItem = {
      id: generateId(),
      productId: product.id,
      description: product.name,
      quantity: 1,
      unitPrice: parseFloat(product.price),
      taxRate: product.taxRate || 7.5,
      total: parseFloat(product.price),
    };

    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newInvoiceItem],
    }));

    setShowAddItemPopover(false);
  };

  // Add inventory item to invoice
  const handleAddInventoryItem = (item: InventoryItem) => {
    const newInvoiceItem: InvoiceItem = {
      id: generateId(),
      inventoryItemId: item.id,
      description: item.name,
      quantity: 1,
      unitPrice: item.price,
      taxRate: 7.5,
      total: item.price,
    };

    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newInvoiceItem],
    }));

    setShowAddItemPopover(false);
  };

  const handleSaveInvoice = () => {
    onSave(invoice);
    onClose();
  };

  const isProjectFile = (file: ProjectFile) =>
    file.type === 'custom_template_item' ||
    file.type === 'sales_product' ||
    file.type === 'service';

  const getFileIcon = (file: ProjectFile) => {
    if (file.type === 'custom_template_item') return <FileText className='h-4 w-4 mr-2' />;
    if (file.type === 'sales_product') return <Package className='h-4 w-4 mr-2' />;
    return <FileText className='h-4 w-4 mr-2' />;
  };

  // Fix the handleAddProjectItem function to use correct FileType values
  const handleAddProjectItem = (file: ProjectFile) => {
    // Determine a reasonable price based on file type
    let price = 0;
    switch (file.type) {
      case 'proposal':
        price = 150;
        break;
      case 'contract':
        price = 200;
        break;
      case 'questionnaire':
        price = 175;
        break;
      case 'custom_template_item':
        price = 100;
        break;
      default:
        price = 75;
    }

    // Create a new invoice item from the project file
    const newInvoiceItem: InvoiceItem = {
      id: generateId(),
      description: `${file.name} (${file.type.replace('_', ' ')})`,
      quantity: 1,
      unitPrice: price,
      discount: 0,
      taxRate: 0,
      total: price,
    };

    // Add the item to the invoice
    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, newInvoiceItem],
    }));

    // Calculate new totals
    calculateTotals([...invoice.items, newInvoiceItem]);

    // Return to the invoice tab after adding the item
    setActiveTab('invoice');
  };

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[800px] max-h-[90vh] overflow-auto'>
        <DialogHeader>
          <DialogTitle className='flex items-center gap-2'>
            <Receipt className='h-5 w-5' />
            {existingInvoice ? 'Edit Invoice' : 'Create New Invoice'}
          </DialogTitle>
          <DialogDescription>
            {existingInvoice
              ? `Edit invoice ${existingInvoice.number}`
              : 'Create a new invoice by adding items from your project or inventory'}
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
          <TabsList className='mb-4'>
            <TabsTrigger value='invoice'>Invoice Details</TabsTrigger>
            <TabsTrigger value='projectItems'>Project Items</TabsTrigger>
          </TabsList>

          <TabsContent value='invoice' className='space-y-6'>
            {/* Invoice Header Section */}
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-3'>
                <div>
                  <Label htmlFor='invoice-number'>Invoice Number</Label>
                  <Input
                    id='invoice-number'
                    value={invoice.number}
                    onChange={(e) => handleInvoiceFieldChange('number', e.target.value)}
                  />
                </div>
                <div className='grid grid-cols-2 gap-2'>
                  <div>
                    <Label htmlFor='invoice-date'>Invoice Date</Label>
                    <Input
                      id='invoice-date'
                      type='date'
                      value={invoice.date}
                      onChange={(e) => handleInvoiceFieldChange('date', e.target.value)}
                    />
                  </div>
                  <div>
                    <Label htmlFor='invoice-due-date'>Due Date</Label>
                    <Input
                      id='invoice-due-date'
                      type='date'
                      value={invoice.dueDate}
                      onChange={(e) => handleInvoiceFieldChange('dueDate', e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className='space-y-3'>
                <div>
                  <Label htmlFor='client-name'>Client Name</Label>
                  <Input
                    id='client-name'
                    value={invoice.clientName}
                    onChange={(e) => handleInvoiceFieldChange('clientName', e.target.value)}
                  />
                </div>
                <div>
                  <Label htmlFor='client-email'>Client Email</Label>
                  <Input
                    id='client-email'
                    type='email'
                    value={invoice.clientEmail}
                    onChange={(e) => handleInvoiceFieldChange('clientEmail', e.target.value)}
                  />
                </div>
              </div>
            </div>

            {/* Invoice Items Section */}
            <div>
              <div className='flex justify-between items-center mb-3'>
                <h3 className='text-lg font-medium'>Invoice Items</h3>
                <Popover open={showAddItemPopover} onOpenChange={setShowAddItemPopover}>
                  <PopoverTrigger asChild>
                    <Button size='sm' className='flex items-center gap-1'>
                      <Plus className='h-4 w-4' /> Add Item
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-[400px] p-0' align='end'>
                    <Tabs defaultValue='manual' className='w-full'>
                      <TabsList className='w-full grid grid-cols-3'>
                        <TabsTrigger value='manual'>Custom Item</TabsTrigger>
                        <TabsTrigger value='products'>Products</TabsTrigger>
                        <TabsTrigger value='inventory'>Inventory</TabsTrigger>
                      </TabsList>

                      <TabsContent value='manual' className='p-4 space-y-3'>
                        <div>
                          <Label htmlFor='item-description'>Description</Label>
                          <Input
                            id='item-description'
                            value={newItem.description}
                            onChange={(e) =>
                              setNewItem({ ...newItem, description: e.target.value })
                            }
                          />
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                          <div>
                            <Label htmlFor='item-quantity'>Quantity</Label>
                            <Input
                              id='item-quantity'
                              type='number'
                              min='1'
                              value={newItem.quantity}
                              onChange={(e) =>
                                setNewItem({ ...newItem, quantity: Number(e.target.value) })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor='item-price'>Unit Price</Label>
                            <Input
                              id='item-price'
                              type='number'
                              step='0.01'
                              min='0'
                              value={newItem.unitPrice}
                              onChange={(e) =>
                                setNewItem({ ...newItem, unitPrice: Number(e.target.value) })
                              }
                            />
                          </div>
                        </div>
                        <div className='grid grid-cols-2 gap-3'>
                          <div>
                            <Label htmlFor='item-discount'>Discount (%)</Label>
                            <Input
                              id='item-discount'
                              type='number'
                              min='0'
                              max='100'
                              value={newItem.discount || 0}
                              onChange={(e) =>
                                setNewItem({ ...newItem, discount: Number(e.target.value) })
                              }
                            />
                          </div>
                          <div>
                            <Label htmlFor='item-tax'>Tax Rate (%)</Label>
                            <Input
                              id='item-tax'
                              type='number'
                              step='0.1'
                              min='0'
                              value={newItem.taxRate || 0}
                              onChange={(e) =>
                                setNewItem({ ...newItem, taxRate: Number(e.target.value) })
                              }
                            />
                          </div>
                        </div>
                        <div className='pt-2 flex justify-between items-center'>
                          <div className='font-medium'>
                            Total: ${newItem.total?.toFixed(2) || '0.00'}
                          </div>
                          <Button onClick={handleAddItem}>Add to Invoice</Button>
                        </div>
                      </TabsContent>

                      <TabsContent value='products' className='max-h-[300px] overflow-auto'>
                        <div className='p-2'>
                          {products.length === 0 ? (
                            <p className='text-center py-4 text-gray-500'>No products available</p>
                          ) : (
                            <div className='space-y-1'>
                              {products.map((product) => (
                                <div
                                  key={product.id}
                                  className='flex justify-between items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer'
                                  onClick={() => handleAddProduct(product)}
                                >
                                  <div className='flex items-center'>
                                    <Package className='h-4 w-4 mr-2 text-gray-500' />
                                    <span>{product.name}</span>
                                  </div>
                                  <span className='font-medium'>
                                    ${parseFloat(product.price).toFixed(2)}
                                  </span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </TabsContent>

                      <TabsContent value='inventory' className='max-h-[300px] overflow-auto'>
                        <div className='p-2'>
                          {inventoryItems.length === 0 ? (
                            <p className='text-center py-4 text-gray-500'>
                              No inventory items available
                            </p>
                          ) : (
                            <div className='space-y-1'>
                              {inventoryItems.map((item) => (
                                <div
                                  key={item.id}
                                  className='flex justify-between items-center p-2 hover:bg-gray-100 rounded-md cursor-pointer'
                                  onClick={() => handleAddInventoryItem(item)}
                                >
                                  <div className='flex items-center'>
                                    <Package className='h-4 w-4 mr-2 text-gray-500' />
                                    <span>{item.name}</span>
                                  </div>
                                  <span className='font-medium'>${item.price.toFixed(2)}</span>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                      </TabsContent>
                    </Tabs>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Items table */}
            <div className='rounded-md border'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[40%]'>Description</TableHead>
                    <TableHead>Qty</TableHead>
                    <TableHead>Price</TableHead>
                    <TableHead>Discount</TableHead>
                    <TableHead>Tax</TableHead>
                    <TableHead className='text-right'>Total</TableHead>
                    <TableHead className='w-[50px]'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center py-6 text-muted-foreground'>
                        No items added to this invoice yet.
                        <div className='mt-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => setActiveTab('projectItems')}
                            className='mx-auto'
                          >
                            Select from Project Items
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell className='font-medium'>{item.description}</TableCell>
                        <TableCell>
                          <Input
                            type='number'
                            min='1'
                            step='1'
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'quantity', parseInt(e.target.value) || 1)
                            }
                            className='w-16 h-8'
                          />
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center'>
                            <span className='mr-1'>$</span>
                            <Input
                              type='number'
                              min='0'
                              step='0.01'
                              value={item.unitPrice}
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.id,
                                  'unitPrice',
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className='w-24 h-8'
                            />
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center'>
                            <Input
                              type='number'
                              min='0'
                              max='100'
                              value={item.discount || 0}
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.id,
                                  'discount',
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className='w-16 h-8 mr-1'
                            />
                            <span>%</span>
                          </div>
                        </TableCell>
                        <TableCell>
                          <div className='flex items-center'>
                            <Input
                              type='number'
                              min='0'
                              max='100'
                              value={item.taxRate || 0}
                              onChange={(e) =>
                                handleUpdateItem(
                                  item.id,
                                  'taxRate',
                                  parseFloat(e.target.value) || 0,
                                )
                              }
                              className='w-16 h-8 mr-1'
                            />
                            <span>%</span>
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>${item.total.toFixed(2)}</TableCell>
                        <TableCell>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => handleRemoveItem(item.id)}
                            className='h-8 w-8 p-0'
                          >
                            <Trash2 className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Invoice Totals Section */}
            <div className='flex justify-end'>
              <div className='w-[300px] space-y-2'>
                <div className='flex justify-between'>
                  <span>Subtotal:</span>
                  <span>${invoice.subtotal.toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Discount:</span>
                  <span>-${invoice.discountTotal.toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span>Tax:</span>
                  <span>${invoice.taxTotal.toFixed(2)}</span>
                </div>
                <div className='flex justify-between font-medium text-lg'>
                  <span>Total:</span>
                  <span>${invoice.total.toFixed(2)}</span>
                </div>
              </div>
            </div>

            {/* Invoice Notes Section */}
            <div className='space-y-2'>
              <Label htmlFor='invoice-notes'>Notes</Label>
              <Textarea
                id='invoice-notes'
                value={invoice.notes || ''}
                onChange={(e) => handleInvoiceFieldChange('notes', e.target.value)}
                placeholder='Enter any notes for the client...'
                className='h-20'
              />
            </div>

            {/* Invoice Terms Section */}
            <div className='space-y-2'>
              <Label htmlFor='invoice-terms'>Terms and Conditions</Label>
              <Textarea
                id='invoice-terms'
                value={invoice.terms || ''}
                onChange={(e) => handleInvoiceFieldChange('terms', e.target.value)}
                placeholder='Enter your terms and conditions...'
                className='h-20'
              />
            </div>
          </TabsContent>

          <TabsContent value='projectItems' className='space-y-4'>
            <div>
              <h3 className='text-lg font-medium'>Select Project Items</h3>
              <p className='text-sm text-muted-foreground mb-4'>
                Choose items from your project to add to the invoice.
              </p>

              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Name</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Date Created</TableHead>
                      <TableHead className='text-right'>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectFiles.length > 0 ? (
                      projectFiles.filter(isProjectFile).map((file) => (
                        <TableRow key={file.id}>
                          <TableCell className='font-medium'>
                            <div className='flex items-center gap-2'>
                              {getFileIcon(file)}
                              {file.name}
                            </div>
                          </TableCell>
                          <TableCell>{file.type.replace('_', ' ')}</TableCell>
                          <TableCell>{new Date(file.dateUploaded).toLocaleDateString()}</TableCell>
                          <TableCell className='text-right'>
                            <Button
                              variant='ghost'
                              size='sm'
                              onClick={() => handleAddProjectItem(file)}
                            >
                              <Plus className='h-4 w-4 mr-1' />
                              Add
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} className='text-center py-6 text-muted-foreground'>
                          No project items found
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>

              <div className='flex justify-between mt-4'>
                <Button variant='outline' onClick={() => setActiveTab('invoice')}>
                  Back to Invoice
                </Button>
              </div>
            </div>
          </TabsContent>
        </Tabs>

        <DialogFooter>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveInvoice}>
            {existingInvoice ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceCreatorModal;
