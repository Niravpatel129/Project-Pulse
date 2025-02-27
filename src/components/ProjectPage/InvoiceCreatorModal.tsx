import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

import { Badge } from '@/components/ui/badge';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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
import {
  CheckCircle,
  Clock,
  FileText,
  FolderClock,
  Package,
  Plus,
  Receipt,
  Timer,
  Trash2,
} from 'lucide-react';
import React, { useEffect, useState } from 'react';

interface InvoiceCreatorModalProps {
  onClose: () => void;
  onSave: (invoice: Invoice) => void;
  projectFiles: ProjectFile[];
  products: Product[];
  inventoryItems: InventoryItem[];
  existingInvoice?: Invoice;
  defaultClient?: { id: string; name: string; email: string };
  onUpdateProductionStatus?: (productionItemId: string, status: string) => void;
}

const InvoiceCreatorModal: React.FC<InvoiceCreatorModalProps> = ({
  onClose,
  onSave,
  projectFiles,
  products,
  inventoryItems,
  existingInvoice,
  defaultClient,
  onUpdateProductionStatus,
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

  // Add a new state variable for the selected file to view details
  const [selectedViewFile, setSelectedViewFile] = useState<ProjectFile | null>(null);

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
    // Determine price based on file properties or type
    let price = 0;

    // Check for inventory items with associated prices
    if (file.type === 'custom_template_item' && file.templateValues) {
      // Look for inventory item references in the template values
      const inventoryFieldValue = file.templateValues.find((v) => v.inventoryItemId);

      if (inventoryFieldValue && inventoryFieldValue.inventoryItemId) {
        // Find the actual inventory item to get its price
        const inventoryItem = inventoryItems.find(
          (item) => item.id === inventoryFieldValue.inventoryItemId,
        );
        if (inventoryItem) {
          price = inventoryItem.price;
        }
      }
    }

    // If no inventory price was found, fall back to the type-based pricing
    if (price === 0) {
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
        case 'sales_product':
          // Try to find an associated product price
          if (file.products && file.products.length > 0) {
            const productPrice = parseFloat(file.products[0].price);
            if (!isNaN(productPrice)) {
              price = productPrice;
            } else {
              price = 75;
            }
          } else {
            price = 75;
          }
          break;
        default:
          price = 75;
      }
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

  // Get a descriptive status or description for a file
  const getFileDescription = (file: ProjectFile) => {
    if (file.description) return file.description;
    if (file.status) return `Status: ${file.status.replace('_', ' ')}`;
    return `Added on ${new Date(file.dateUploaded).toLocaleDateString()}`;
  };

  // Get estimated price for a file based on its type
  const getEstimatedPrice = (file: ProjectFile) => {
    // First check if this file has inventory items with associated prices
    if (file.type === 'custom_template_item' && file.templateValues) {
      // Look for inventory item references in the template values
      const inventoryFieldValue = file.templateValues.find((v) => v.inventoryItemId);

      if (inventoryFieldValue && inventoryFieldValue.inventoryItemId) {
        // Find the actual inventory item to get its price
        const inventoryItem = inventoryItems.find(
          (item) => item.id === inventoryFieldValue.inventoryItemId,
        );
        if (inventoryItem) {
          return inventoryItem.price;
        }
      }
    }

    // If no inventory price was found, check for product prices
    if (file.type === 'sales_product' && file.products && file.products.length > 0) {
      const productPrice = parseFloat(file.products[0].price);
      if (!isNaN(productPrice)) {
        return productPrice;
      }
    }

    // Fall back to default prices based on type
    switch (file.type) {
      case 'proposal':
        return 150;
      case 'contract':
        return 200;
      case 'questionnaire':
        return 175;
      case 'custom_template_item':
        return 100;
      default:
        return 75;
    }
  };

  // Format file type to be more readable
  const formatFileType = (type: string) => {
    return type
      .split('_')
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ');
  };

  // Check if a file has an inventory price
  const hasInventoryPrice = (file: ProjectFile): boolean => {
    if (file.type === 'custom_template_item' && file.templateValues) {
      const inventoryFieldValue = file.templateValues.find((v) => v.inventoryItemId);
      return !!inventoryFieldValue && !!inventoryFieldValue.inventoryItemId;
    }
    return false;
  };

  // Check if a file has a product price
  const hasProductPrice = (file: ProjectFile): boolean => {
    return file.type === 'sales_product' && !!file.products && file.products.length > 0;
  };

  // Add a function to handle row click to view file details
  const handleViewProjectItem = (file: ProjectFile) => {
    setSelectedViewFile(file);
  };

  // Add a function to get field name from field ID
  const getFieldNameById = (fieldId: string): string => {
    // If the selected file has a template ID, look up the template and field
    if (selectedViewFile?.templateId) {
      // Find the template in available templates from project files
      const template = projectFiles
        .filter((file) => file.type === 'template')
        .find((file) => file.id === selectedViewFile.templateId);

      // If template has fields, find the matching field
      if (template?.templateId) {
        // Find template definition from any other source
        // This is a placeholder - in a real app you'd have access to all templates
        return fieldId; // Fallback to ID if template not found
      }

      // For demo purposes, map common field IDs to readable names
      // In a real app, you'd get this from the template definition
      const fieldNameMap: { [key: string]: string } = {
        f1: 'Name',
        f2: 'Description',
        f3: 'Dimensions',
        f4: 'Quantity',
        f5: 'Material',
        f6: 'Color',
        f7: 'Finish',
        f8: 'Notes',
        f9: 'Delivery Date',
        f10: 'Project Phase',
        f11: 'Inventory Item',
        f12: 'Specifications',
        f13: 'Custom Options',
      };

      return fieldNameMap[fieldId] || fieldId;
    }

    return fieldId;
  };

  // Get production items (template items with inventory references)
  const getProductionItems = () => {
    return projectFiles.filter((file) => {
      return (
        file.type === 'custom_template_item' &&
        file.templateValues?.some((value) => value.inventoryItemId)
      );
    });
  };

  // Get status badge for production items
  const getStatusBadge = (item: ProjectFile) => {
    const status = item.status || 'awaiting_approval';

    switch (status) {
      case 'draft':
      case 'awaiting_approval':
        return (
          <Badge
            variant='outline'
            className='bg-yellow-50 text-yellow-700 border-yellow-200 flex items-center gap-1'
          >
            <Clock className='h-3 w-3' />
            Pending
          </Badge>
        );
      case 'active':
      case 'sent':
      case 'viewed':
        return (
          <Badge
            variant='outline'
            className='bg-blue-50 text-blue-700 border-blue-200 flex items-center gap-1'
          >
            <Timer className='h-3 w-3' />
            In Progress
          </Badge>
        );
      case 'signed':
      case 'paid':
        return (
          <Badge
            variant='outline'
            className='bg-green-50 text-green-700 border-green-200 flex items-center gap-1'
          >
            <CheckCircle className='h-3 w-3' />
            Completed
          </Badge>
        );
      default:
        return (
          <Badge variant='outline' className='bg-gray-50 text-gray-700 border-gray-200'>
            {(status as string).charAt(0).toUpperCase() + (status as string).slice(1)}
          </Badge>
        );
    }
  };

  // Update the production status of an item
  const handleUpdateProductionStatus = (itemId: string, status: string) => {
    if (onUpdateProductionStatus) {
      onUpdateProductionStatus(itemId, status);
    }
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
            <TabsTrigger value='production'>Production</TabsTrigger>
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
                      <TableHead className='w-[25%]'>Name</TableHead>
                      <TableHead className='w-[15%]'>Price</TableHead>
                      <TableHead className='w-[30%]'>Description</TableHead>
                      <TableHead className='w-[30%]'>Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projectFiles.length > 0 ? (
                      projectFiles.filter(isProjectFile).map((file) => (
                        <TableRow
                          key={file.id}
                          className='cursor-pointer hover:bg-muted/50'
                          onClick={() => handleViewProjectItem(file)}
                        >
                          <TableCell className='font-medium'>
                            <div className='flex items-center gap-2'>
                              {getFileIcon(file)}
                              {file.name}
                            </div>
                          </TableCell>

                          <TableCell>
                            <span className='font-medium text-green-600'>
                              ${getEstimatedPrice(file).toFixed(2)}
                              {hasInventoryPrice(file) && (
                                <span className='ml-1 text-xs text-blue-500'>
                                  (Inventory price)
                                </span>
                              )}
                              {hasProductPrice(file) && (
                                <span className='ml-1 text-xs text-purple-500'>
                                  (Product price)
                                </span>
                              )}
                              {!hasInventoryPrice(file) && !hasProductPrice(file) && (
                                <span className='ml-1 text-xs text-gray-500'>(Default price)</span>
                              )}
                            </span>
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground truncate max-w-[200px]'>
                            {getFileDescription(file) || 'No description available'}
                          </TableCell>
                          <TableCell className='text-sm text-muted-foreground truncate max-w-[200px]'>
                            <Button
                              variant='outline'
                              size='sm'
                              onClick={(e) => {
                                e.stopPropagation(); // Prevent row click event
                                handleAddProjectItem(file);
                              }}
                              className='hover:bg-primary hover:text-primary-foreground'
                            >
                              <Plus className='h-4 w-4 mr-1' />
                              Add to Invoice
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className='text-center py-6 text-muted-foreground'>
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

          {/* New Production Tab */}
          <TabsContent value='production' className='space-y-4'>
            <div>
              <h3 className='text-lg font-medium flex items-center gap-2'>
                <FolderClock className='h-5 w-5' /> Production Tracking
              </h3>
              <p className='text-sm text-muted-foreground mb-4'>
                Track and manage production status of template items with inventory components.
              </p>

              {/* Production items filter */}
              <div className='flex gap-2 mb-4'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    /* Filter logic */
                  }}
                  className='rounded-full'
                >
                  All Items
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    /* Filter logic */
                  }}
                  className='rounded-full'
                >
                  <Clock className='h-3.5 w-3.5 mr-1' />
                  Pending
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    /* Filter logic */
                  }}
                  className='rounded-full'
                >
                  <Timer className='h-3.5 w-3.5 mr-1' />
                  In Progress
                </Button>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    /* Filter logic */
                  }}
                  className='rounded-full'
                >
                  <CheckCircle className='h-3.5 w-3.5 mr-1' />
                  Completed
                </Button>
              </div>

              <div className='rounded-md border'>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead className='w-[30%]'>Item Name</TableHead>
                      <TableHead className='w-[20%]'>Template Type</TableHead>
                      <TableHead className='w-[15%]'>Date Created</TableHead>
                      <TableHead className='w-[15%]'>Status</TableHead>
                      <TableHead className='w-[20%]'>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {getProductionItems().length > 0 ? (
                      getProductionItems().map((item) => (
                        <TableRow key={item.id}>
                          <TableCell className='font-medium'>
                            <div className='flex items-center gap-2'>
                              <FileText className='h-4 w-4 text-gray-500' />
                              {item.name}
                            </div>
                          </TableCell>
                          <TableCell>
                            {item.templateId ? 'Custom Template' : formatFileType(item.type)}
                          </TableCell>
                          <TableCell>{new Date(item.dateUploaded).toLocaleDateString()}</TableCell>
                          <TableCell>{getStatusBadge(item)}</TableCell>
                          <TableCell>
                            <div className='flex items-center gap-2'>
                              <Select
                                defaultValue={item.status || 'awaiting_approval'}
                                onValueChange={(value) =>
                                  handleUpdateProductionStatus(item.id, value)
                                }
                              >
                                <SelectTrigger className='w-[140px] h-8'>
                                  <SelectValue placeholder='Change status' />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value='awaiting_approval'>Pending</SelectItem>
                                  <SelectItem value='active'>In Progress</SelectItem>
                                  <SelectItem value='paid'>Completed</SelectItem>
                                </SelectContent>
                              </Select>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => handleAddProjectItem(item)}
                                className='h-8'
                                title='Add to invoice'
                              >
                                <Plus className='h-3.5 w-3.5' />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={5} className='text-center py-6 text-muted-foreground'>
                          No production items found. Try adding a template item with inventory
                          components.
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

      {/* File Details Dialog */}
      {selectedViewFile && (
        <Dialog open={!!selectedViewFile} onOpenChange={() => setSelectedViewFile(null)}>
          <DialogContent className='sm:max-w-[700px] max-h-[90vh] overflow-auto'>
            <DialogHeader>
              <DialogTitle className='flex items-center gap-2'>
                {getFileIcon(selectedViewFile)}
                {selectedViewFile.name}
              </DialogTitle>
              <DialogDescription>
                {formatFileType(selectedViewFile.type)} created on{' '}
                {new Date(selectedViewFile.dateUploaded).toLocaleDateString()}
              </DialogDescription>
            </DialogHeader>

            <div className='space-y-4'>
              {/* File Type */}
              <div className='grid grid-cols-[120px_1fr] gap-2'>
                <div className='font-medium text-sm'>Type:</div>
                <div>
                  <Badge variant='outline' className='capitalize'>
                    {formatFileType(selectedViewFile.type)}
                  </Badge>
                </div>
              </div>

              {/* Description */}
              {selectedViewFile.description && (
                <div className='grid grid-cols-[120px_1fr] gap-2'>
                  <div className='font-medium text-sm'>Description:</div>
                  <div>{selectedViewFile.description}</div>
                </div>
              )}

              {/* Status */}
              {selectedViewFile.status && (
                <div className='grid grid-cols-[120px_1fr] gap-2'>
                  <div className='font-medium text-sm'>Status:</div>
                  <div>
                    <Badge
                      variant='outline'
                      className={`capitalize ${
                        selectedViewFile.status === 'paid'
                          ? 'bg-green-50 text-green-700'
                          : selectedViewFile.status === 'draft'
                          ? 'bg-gray-50 text-gray-700'
                          : 'bg-blue-50 text-blue-700'
                      }`}
                    >
                      {selectedViewFile.status}
                    </Badge>
                  </div>
                </div>
              )}

              {/* Price */}
              <div className='grid grid-cols-[120px_1fr] gap-2'>
                <div className='font-medium text-sm'>Estimated Price:</div>
                <div className='font-medium text-green-600'>
                  ${getEstimatedPrice(selectedViewFile).toFixed(2)}
                </div>
              </div>

              {/* Date */}
              <div className='grid grid-cols-[120px_1fr] gap-2'>
                <div className='font-medium text-sm'>Date Created:</div>
                <div>{new Date(selectedViewFile.dateUploaded).toLocaleDateString()}</div>
              </div>

              {/* Template Values if applicable */}
              {selectedViewFile.templateValues && selectedViewFile.templateValues.length > 0 && (
                <div className='mt-4'>
                  <h4 className='font-medium mb-2'>Template Values:</h4>
                  <div className='border rounded-md p-3 space-y-2'>
                    {selectedViewFile.templateValues.map((value, index) => (
                      <div key={index} className='grid grid-cols-[120px_1fr] gap-2'>
                        <div className='font-medium text-sm'>
                          {getFieldNameById(value.fieldId)}:
                        </div>
                        <div>
                          {value.inventoryItemId ? (
                            <div className='flex items-center'>
                              <span>{value.value?.toString() || 'N/A'}</span>
                              <Badge className='ml-2 bg-blue-100 text-blue-800 hover:bg-blue-200'>
                                Inventory Item
                              </Badge>
                            </div>
                          ) : (
                            value.value?.toString() || 'N/A'
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <DialogFooter className='mt-6'>
              <Button
                variant='default'
                onClick={() => {
                  handleAddProjectItem(selectedViewFile);
                  setSelectedViewFile(null);
                }}
              >
                <Plus className='h-4 w-4 mr-1' />
                Add to Invoice
              </Button>
              <Button variant='outline' onClick={() => setSelectedViewFile(null)}>
                Close
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      )}
    </Dialog>
  );
};

export default InvoiceCreatorModal;
