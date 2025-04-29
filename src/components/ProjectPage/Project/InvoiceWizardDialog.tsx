import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { format } from 'date-fns';
import { Filter, PlusCircle, Search } from 'lucide-react';
import { useState } from 'react';

type InvoiceItem = {
  id: string;
  name: string;
  description: string;
  price: number;
  date: string;
  status: 'completed' | 'in-progress' | 'pending';
  type: 'physical' | 'digital';
  sku?: string;
  weight?: string;
  stock?: number;
  tax?: string;
  isAiPriced?: boolean;
};

const InvoiceWizardDialog = ({ open, onOpenChange, projectId, clients = [] }) => {
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);
  const [invoiceNumber, setInvoiceNumber] = useState('INV-440349');
  const [dueDate, setDueDate] = useState(new Date('2025-05-28'));
  const [aiSuggestions, setAiSuggestions] = useState(false);

  const sampleItems: InvoiceItem[] = [
    {
      id: '1',
      name: 'Custom T-Shirt Design',
      description: "Original artwork for client's band merchandise",
      price: 250.0,
      date: 'Jun 15, 2023',
      status: 'completed',
      type: 'physical',
      sku: 'TSHIRT-CUSTOM-001',
      weight: '0.25 kg',
      stock: 50,
      tax: 'Standard',
    },
    {
      id: '2',
      name: 'Brand Identity Package',
      description: 'Logo, color palette, and brand guidelines',
      price: 1800.0,
      date: 'Jul 2, 2023',
      status: 'completed',
      type: 'digital',
    },
    {
      id: '3',
      name: 'Marketing Materials',
      description: 'Digital assets for social media campaign',
      price: 950.0,
      date: 'Jul 20, 2023',
      status: 'in-progress',
      type: 'digital',
      isAiPriced: true,
    },
    {
      id: '4',
      name: 'SEO Optimization',
      description: 'Keyword research and on-page optimization',
      price: 750.0,
      date: 'Aug 5, 2023',
      status: 'pending',
      type: 'digital',
      isAiPriced: true,
    },
  ];

  const handleAddItem = (item: InvoiceItem) => {
    setSelectedItems([...selectedItems, item]);
  };

  const calculateTotal = () => {
    return selectedItems.reduce((sum, item) => {
      return sum + item.price;
    }, 0);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[1400px] p-0 overflow-hidden'>
        <DialogTitle className='sr-only'>Invoice Wizard</DialogTitle>
        <div className='flex h-[800px]'>
          {/* Sidebar Navigation */}
          <div className='w-[280px] border-r'>
            <div className='flex justify-between items-center p-4 border-b'>
              <h2 className='font-semibold'>Invoice Wizard</h2>
            </div>

            <div className='p-1'>
              <button className='flex items-center gap-3 w-full p-4 rounded-md bg-gray-100'>
                <div className='p-1 rounded bg-gray-200'>
                  <svg
                    viewBox='0 0 24 24'
                    width='18'
                    height='18'
                    strokeWidth='2'
                    stroke='currentColor'
                    fill='none'
                  >
                    <path d='M4 6h16M4 12h16M4 18h16' />
                  </svg>
                </div>
                <span className='font-medium'>Items</span>
              </button>

              <button className='flex items-center gap-3 w-full p-4 rounded-md'>
                <div className='p-1 rounded'>
                  <svg
                    viewBox='0 0 24 24'
                    width='18'
                    height='18'
                    strokeWidth='2'
                    stroke='currentColor'
                    fill='none'
                  >
                    <circle cx='12' cy='8' r='4' />
                    <path d='M20 21a8 8 0 10-16 0' />
                  </svg>
                </div>
                <span>Client</span>
              </button>

              <button className='flex items-center gap-3 w-full p-4 rounded-md'>
                <div className='p-1 rounded'>
                  <svg
                    viewBox='0 0 24 24'
                    width='18'
                    height='18'
                    strokeWidth='2'
                    stroke='currentColor'
                    fill='none'
                  >
                    <path d='M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z' />
                    <path d='M14 2v6h6M16 13H8M16 17H8M10 9H8' />
                  </svg>
                </div>
                <span>Details</span>
              </button>
            </div>

            <div className='p-4 border-t mt-auto'>
              <div className='mb-4'>
                <label className='text-sm text-gray-500'>Invoice Number</label>
                <Input
                  value={invoiceNumber}
                  onChange={(e) => {
                    setInvoiceNumber(e.target.value);
                  }}
                  className='mt-1'
                />
              </div>

              <div>
                <label className='text-sm text-gray-500'>Due Date</label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant='outline' className='w-full justify-between mt-1'>
                      {format(dueDate, 'MMMM do, yyyy')}
                      <svg
                        viewBox='0 0 24 24'
                        width='16'
                        height='16'
                        strokeWidth='2'
                        stroke='currentColor'
                        fill='none'
                      >
                        <path d='M6 9l6 6 6-6' />
                      </svg>
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className='w-auto p-0'>
                    <Calendar
                      mode='single'
                      selected={dueDate}
                      onSelect={(date) => {
                        if (date) setDueDate(date);
                      }}
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className='flex items-center justify-between mt-4'>
                <span className='text-sm'>AI Suggestions</span>
                <Switch
                  checked={aiSuggestions}
                  onCheckedChange={(value) => {
                    setAiSuggestions(value);
                  }}
                />
              </div>

              <div className='mt-6 space-y-2'>
                <div className='flex justify-between'>
                  <span className='text-sm'>Subtotal</span>
                  <span className='font-medium'>${calculateTotal().toFixed(2)}</span>
                </div>
                <div className='flex justify-between'>
                  <span className='text-sm'>Total</span>
                  <span className='font-medium'>${calculateTotal().toFixed(2)}</span>
                </div>
              </div>

              <Button className='w-full mt-4 bg-black text-white hover:bg-gray-800'>
                Create Invoice
              </Button>
            </div>
          </div>

          {/* Main Content */}
          <div className='flex-1 flex flex-col'>
            {/* Select Items Header */}
            <div className='flex justify-between items-center p-4 border-b'>
              <h2 className='font-semibold'>Select Items</h2>
              <div className='flex items-center gap-2'>
                <div className='relative'>
                  <Search
                    className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400'
                    size={16}
                  />
                  <Input placeholder='Search items...' className='pl-9 w-[250px]' />
                </div>
                <Button variant='outline' className='gap-1'>
                  <Filter size={16} />
                  Filter
                </Button>
                <Button variant='outline' className='gap-1'>
                  <svg
                    viewBox='0 0 24 24'
                    width='16'
                    height='16'
                    strokeWidth='2'
                    stroke='currentColor'
                    fill='none'
                  >
                    <path d='M12 4v16m-8-8h16' />
                  </svg>
                  AI Assistant
                </Button>
              </div>
            </div>

            {/* Content Area */}
            <div className='flex h-full'>
              {/* Items Selection */}
              <div className='flex-1 p-4 overflow-y-auto'>
                <Tabs defaultValue='deliverables'>
                  <TabsList className='mb-4'>
                    <TabsTrigger value='deliverables'>Deliverables</TabsTrigger>
                    <TabsTrigger value='tasks'>Tasks & Hours</TabsTrigger>
                  </TabsList>

                  <TabsContent value='deliverables' className='space-y-4'>
                    {sampleItems.map((item) => {
                      return (
                        <div key={item.id} className='border rounded-lg p-4 relative'>
                          <div className='flex justify-between'>
                            <div>
                              <div className='flex items-center gap-2'>
                                <h3 className='font-medium'>{item.name}</h3>
                                <Badge
                                  variant={item.status === 'completed' ? 'default' : 'outline'}
                                  className='text-xs'
                                >
                                  {item.status}
                                </Badge>
                                {item.type === 'physical' && (
                                  <Badge
                                    variant='outline'
                                    className='bg-blue-50 text-blue-600 border-blue-200 text-xs'
                                  >
                                    Physical Product
                                  </Badge>
                                )}
                                {item.isAiPriced && (
                                  <Badge
                                    variant='outline'
                                    className='bg-amber-50 text-amber-600 border-amber-200 text-xs'
                                  >
                                    AI Priced
                                  </Badge>
                                )}
                              </div>
                              <p className='text-gray-500 text-sm mt-1'>{item.description}</p>
                            </div>
                            <Button
                              variant='outline'
                              onClick={() => {
                                handleAddItem(item);
                              }}
                              className='bg-black text-white hover:bg-gray-800'
                            >
                              Add
                            </Button>
                          </div>

                          <div className='mt-3 flex items-center gap-2'>
                            <span className='text-gray-700'>${item.price.toFixed(2)}</span>
                            <span className='text-gray-400'>•</span>
                            <span className='text-gray-500 text-sm'>{item.date}</span>
                          </div>

                          {item.sku && (
                            <div className='mt-3 flex flex-wrap gap-x-6 gap-y-2 text-xs text-gray-500'>
                              <div className='flex items-center gap-1'>
                                <span>SKU:</span>
                                <span className='text-gray-700'>{item.sku}</span>
                              </div>
                              {item.weight && (
                                <div className='flex items-center gap-1'>
                                  <span>Weight:</span>
                                  <span className='text-gray-700'>{item.weight}</span>
                                </div>
                              )}
                              {item.stock !== undefined && (
                                <div className='flex items-center gap-1'>
                                  <span>Stock:</span>
                                  <span className='text-gray-700'>{item.stock} units</span>
                                </div>
                              )}
                              {item.tax && (
                                <div className='flex items-center gap-1'>
                                  <span>Tax:</span>
                                  <span className='text-gray-700'>{item.tax}</span>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </TabsContent>

                  <TabsContent value='tasks'>
                    <div className='py-8 text-center text-gray-500'>No tasks available</div>
                  </TabsContent>
                </Tabs>
              </div>

              {/* Invoice Preview */}
              <div className='w-[400px] border-l p-4 flex flex-col'>
                <div className='flex justify-between items-center mb-4'>
                  <h2 className='font-semibold'>Invoice Preview</h2>
                  <Button variant='outline' className='gap-1'>
                    <PlusCircle size={16} />
                    Add Custom Item
                  </Button>
                </div>

                <div className='flex flex-col items-center justify-center py-10 border-b'>
                  <div className='w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-2'>
                    <svg
                      viewBox='0 0 24 24'
                      width='24'
                      height='24'
                      strokeWidth='2'
                      stroke='currentColor'
                      fill='none'
                    >
                      <circle cx='12' cy='8' r='4' />
                      <path d='M20 21a8 8 0 10-16 0' />
                    </svg>
                  </div>
                  <p className='text-gray-500'>No client selected</p>
                  <Button variant='link' className='mt-1'>
                    Select Client
                  </Button>
                </div>

                <div className='mt-4'>
                  <div className='flex justify-between font-medium border-b pb-2'>
                    <span>Item</span>
                    <div className='flex gap-8'>
                      <span>Quantity</span>
                      <span>Price</span>
                      <span>Total</span>
                    </div>
                  </div>

                  {selectedItems.length === 0 ? (
                    <div className='text-center py-8 text-gray-500'>No items added to invoice</div>
                  ) : (
                    <div className='space-y-2 mt-2'>
                      {selectedItems.map((item) => {
                        return (
                          <div key={item.id} className='flex justify-between'>
                            <span>{item.name}</span>
                            <div className='flex gap-8'>
                              <span>1</span>
                              <span>${item.price.toFixed(2)}</span>
                              <span>${item.price.toFixed(2)}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                <div className='mt-auto space-y-2'>
                  <div className='flex justify-between'>
                    <span>Subtotal</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                  <div className='flex justify-between font-semibold'>
                    <span>Total</span>
                    <span>${calculateTotal().toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default InvoiceWizardDialog;
