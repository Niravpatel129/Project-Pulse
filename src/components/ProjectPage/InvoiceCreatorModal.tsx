import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

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
import {
  InventoryItem,
  Invoice,
  InvoiceItem,
  Product,
  ProjectFile,
  Template,
} from '@/lib/mock/projectFiles';
import { format } from 'date-fns';
import { FileText, Package, Percent, Plus, Receipt, Trash2 } from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface InvoiceCreatorModalProps {
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
  projectFiles: ProjectFile[];
  products: Product[];
  inventoryItems: InventoryItem[];
  templates: Template[];
  existingInvoice?: Invoice;
  defaultClient?: { id: string; name: string; email: string };
}

const InvoiceCreatorModal: React.FC<InvoiceCreatorModalProps> = ({
  onClose,
  onSave,
  projectFiles,
  products,
  inventoryItems,
  templates,
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
  const [selectedItems, setSelectedItems] = useState<string[]>([]);
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

  // Handle updating an existing item
  const handleUpdateItem = (itemId: string, field: string, value: string | number) => {
    setInvoice((prev) => {
      const updatedItems = prev.items.map((item) => {
        if (item.id === itemId) {
          const updatedItem = { ...item, [field]: value };

          // Recalculate total if necessary fields changed
          if (['quantity', 'unitPrice', 'discount'].includes(field)) {
            const subtotal = updatedItem.quantity * updatedItem.unitPrice;
            const discount = ((updatedItem.discount || 0) / 100) * subtotal;
            updatedItem.total = parseFloat((subtotal - discount).toFixed(2));
          }

          return updatedItem;
        }
        return item;
      });

      return {
        ...prev,
        items: updatedItems,
      };
    });
  };

  // Handle field changes for the invoice
  const handleInvoiceFieldChange = (field: string, value: string | number) => {
    setInvoice((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  // Add selected project items to the invoice
  const handleAddProjectItems = () => {
    // Get file items that have been selected
    const filesToAdd = projectFiles.filter((file) => selectedItems.includes(file.id));

    // Convert each file to an invoice item
    const newInvoiceItems = filesToAdd.map((file) => {
      // For template items, we can extract more data
      let unitPrice = 0;
      let description = file.name;

      if (file.type === 'custom_template_item' && file.templateValues) {
        // Try to find a price field
        const priceField = file.templateValues.find((v) => {
          const fieldDef = templates
            .find((t) => t.id === file.templateId)
            ?.fields.find((f) => f.id === v.fieldId);
          return fieldDef?.type === 'price';
        });

        if (priceField) {
          unitPrice = Number(priceField.value) || 0;
        }
      }

      // For product items, use the product price
      if (file.type === 'sales_product' && file.products?.length) {
        const productPrice = parseFloat(file.products[0].price);
        if (!isNaN(productPrice)) {
          unitPrice = productPrice;
        }
        description = file.products[0].name;
      }

      return {
        id: generateId(),
        description: description,
        quantity: 1,
        unitPrice: unitPrice,
        taxRate: 7.5, // Default tax rate
        total: unitPrice,
        templateItemId: file.id,
      } as InvoiceItem;
    });

    setInvoice((prev) => ({
      ...prev,
      items: [...prev.items, ...newInvoiceItems],
    }));

    setSelectedItems([]);
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

        <div className='space-y-6'>
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
              <div className='grid grid-cols-2 gap-3'>
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
                  <Label htmlFor='due-date'>Due Date</Label>
                  <Input
                    id='due-date'
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
          <div className='space-y-3'>
            <div className='flex justify-between items-center'>
              <h3 className='text-lg font-medium'>Invoice Items</h3>
              <div className='flex gap-2'>
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

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='outline' size='sm' className='flex items-center gap-1'>
                      <FileText className='h-4 w-4' /> Add from Project
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-[400px] p-4'>
                    <div className='space-y-4'>
                      <h4 className='font-medium'>Select items from project</h4>

                      {projectFiles.filter(isProjectFile).length === 0 ? (
                        <p className='text-center py-2 text-gray-500'>
                          No eligible items in this project
                        </p>
                      ) : (
                        <div className='space-y-2 max-h-[300px] overflow-auto'>
                          {projectFiles.filter(isProjectFile).map((file) => (
                            <div
                              key={file.id}
                              className='flex items-center p-2 hover:bg-gray-100 rounded-md'
                            >
                              <Checkbox
                                id={`file-${file.id}`}
                                checked={selectedItems.includes(file.id)}
                                onCheckedChange={(checked) => {
                                  if (checked) {
                                    setSelectedItems((prev) => [...prev, file.id]);
                                  } else {
                                    setSelectedItems((prev) => prev.filter((id) => id !== file.id));
                                  }
                                }}
                              />
                              <label
                                htmlFor={`file-${file.id}`}
                                className='ml-2 flex items-center cursor-pointer flex-1'
                              >
                                {getFileIcon(file)}
                                <span>{file.name}</span>
                              </label>
                            </div>
                          ))}
                        </div>
                      )}

                      <div className='flex justify-end'>
                        <Button
                          onClick={handleAddProjectItems}
                          disabled={selectedItems.length === 0}
                        >
                          Add Selected Items
                        </Button>
                      </div>
                    </div>
                  </PopoverContent>
                </Popover>
              </div>
            </div>

            {/* Invoice items table */}
            <div className='border rounded-md'>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead className='w-[300px]'>Description</TableHead>
                    <TableHead className='text-right'>Qty</TableHead>
                    <TableHead className='text-right'>Unit Price</TableHead>
                    <TableHead className='text-right'>Discount</TableHead>
                    <TableHead className='text-right'>Tax</TableHead>
                    <TableHead className='text-right'>Total</TableHead>
                    <TableHead className='w-[50px]'></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {invoice.items.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={7} className='text-center py-4 text-gray-500'>
                        No items added to this invoice yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    invoice.items.map((item) => (
                      <TableRow key={item.id}>
                        <TableCell>
                          <Input
                            value={item.description}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'description', e.target.value)
                            }
                          />
                        </TableCell>
                        <TableCell className='text-right'>
                          <Input
                            type='number'
                            min='1'
                            value={item.quantity}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'quantity', Number(e.target.value))
                            }
                            className='w-[70px] text-right ml-auto'
                          />
                        </TableCell>
                        <TableCell className='text-right'>
                          <Input
                            type='number'
                            step='0.01'
                            min='0'
                            value={item.unitPrice}
                            onChange={(e) =>
                              handleUpdateItem(item.id, 'unitPrice', Number(e.target.value))
                            }
                            className='w-[100px] text-right ml-auto'
                          />
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end gap-1'>
                            <Input
                              type='number'
                              min='0'
                              max='100'
                              value={item.discount || 0}
                              onChange={(e) =>
                                handleUpdateItem(item.id, 'discount', Number(e.target.value))
                              }
                              className='w-[70px] text-right'
                            />
                            <Percent className='h-4 w-4 text-gray-500' />
                          </div>
                        </TableCell>
                        <TableCell className='text-right'>
                          <div className='flex items-center justify-end gap-1'>
                            <Input
                              type='number'
                              step='0.1'
                              min='0'
                              value={item.taxRate || 0}
                              onChange={(e) =>
                                handleUpdateItem(item.id, 'taxRate', Number(e.target.value))
                              }
                              className='w-[70px] text-right'
                            />
                            <Percent className='h-4 w-4 text-gray-500' />
                          </div>
                        </TableCell>
                        <TableCell className='text-right font-medium'>
                          ${item.total.toFixed(2)}
                        </TableCell>
                        <TableCell>
                          <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => handleRemoveItem(item.id)}
                          >
                            <Trash2 className='h-4 w-4 text-gray-500' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </div>

          {/* Invoice Totals */}
          <div className='flex flex-col md:flex-row gap-6'>
            <div className='flex-1 space-y-3'>
              <div>
                <Label htmlFor='invoice-notes'>Notes</Label>
                <Textarea
                  id='invoice-notes'
                  placeholder='Add notes to client...'
                  value={invoice.notes || ''}
                  onChange={(e) => handleInvoiceFieldChange('notes', e.target.value)}
                  rows={3}
                />
              </div>
              <div>
                <Label htmlFor='invoice-terms'>Terms & Conditions</Label>
                <Textarea
                  id='invoice-terms'
                  placeholder='Payment terms, delivery information, etc.'
                  value={invoice.terms || ''}
                  onChange={(e) => handleInvoiceFieldChange('terms', e.target.value)}
                  rows={3}
                />
              </div>
            </div>

            <div className='w-full md:w-[250px] bg-gray-50 p-4 rounded-md space-y-2'>
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Subtotal:</span>
                <span>${invoice.subtotal.toFixed(2)}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Discount:</span>
                <span>-${invoice.discountTotal.toFixed(2)}</span>
              </div>
              <div className='flex justify-between items-center'>
                <span className='text-gray-600'>Tax:</span>
                <span>${invoice.taxTotal.toFixed(2)}</span>
              </div>
              <div className='pt-2 border-t flex justify-between items-center font-medium'>
                <span>Total:</span>
                <span className='text-lg'>${invoice.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter className='space-x-2 pt-4'>
          <Button variant='outline' onClick={onClose}>
            Cancel
          </Button>
          <Button onClick={handleSaveInvoice} className='gap-1'>
            <Receipt className='h-4 w-4' />
            {existingInvoice ? 'Update Invoice' : 'Create Invoice'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceCreatorModal;
