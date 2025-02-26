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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ProjectFile } from '@/lib/mock/projectFiles';
import { format } from 'date-fns';
import { DollarSign, Plus, X } from 'lucide-react';
import { useState } from 'react';

interface InvoiceLineItem {
  description: string;
  quantity: string;
  unitPrice: string;
  amount: string;
}

interface AddInvoiceModalProps {
  selectedFile: ProjectFile;
  onClose: () => void;
}

const AddInvoiceModal: React.FC<AddInvoiceModalProps> = ({ selectedFile, onClose }) => {
  const [showModal, setShowModal] = useState(true);

  const [invoice, setInvoice] = useState({
    number: `INV-${Math.floor(Math.random() * 10000)
      .toString()
      .padStart(4, '0')}`,
    clientName: '',
    clientEmail: '',
    issueDate: format(new Date(), 'yyyy-MM-dd'),
    dueDate: format(new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), 'yyyy-MM-dd'),
    paymentTerms: '30',
    notes: '',
    status: 'draft',
    lineItems: [] as InvoiceLineItem[],
  });

  const paymentTerms = [
    { value: '7', label: 'Net 7 - Due in 7 days' },
    { value: '14', label: 'Net 14 - Due in 14 days' },
    { value: '30', label: 'Net 30 - Due in 30 days' },
    { value: '60', label: 'Net 60 - Due in 60 days' },
    { value: 'due_on_receipt', label: 'Due on Receipt' },
  ];

  const invoiceStatuses = [
    { value: 'draft', label: 'Draft' },
    { value: 'pending', label: 'Pending' },
    { value: 'sent', label: 'Sent' },
    { value: 'paid', label: 'Paid' },
    { value: 'overdue', label: 'Overdue' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const handleCreateInvoice = () => {
    // In a real implementation, this would create and add the invoice
    // For now, we just close the modal
    handleClose();
  };

  const addLineItem = () => {
    setInvoice({
      ...invoice,
      lineItems: [
        ...invoice.lineItems,
        {
          description: '',
          quantity: '1',
          unitPrice: '',
          amount: '',
        },
      ],
    });
  };

  const removeLineItem = (index: number) => {
    const lineItems = [...invoice.lineItems];
    lineItems.splice(index, 1);
    setInvoice({
      ...invoice,
      lineItems,
    });
  };

  const updateLineItem = (index: number, field: string, value: string) => {
    const lineItems = [...invoice.lineItems];
    lineItems[index] = {
      ...lineItems[index],
      [field]: value,
    };

    // Calculate amount if quantity and unit price are present
    if (field === 'quantity' || field === 'unitPrice') {
      const quantity = parseFloat(lineItems[index].quantity) || 0;
      const unitPrice = parseFloat(lineItems[index].unitPrice) || 0;
      lineItems[index].amount = (quantity * unitPrice).toFixed(2);
    }

    setInvoice({
      ...invoice,
      lineItems,
    });
  };

  const calculateTotal = () => {
    return invoice.lineItems
      .reduce((total, item) => total + (parseFloat(item.amount) || 0), 0)
      .toFixed(2);
  };

  const updatePaymentTerms = (terms: string) => {
    setInvoice({
      ...invoice,
      paymentTerms: terms,
    });

    // Update due date based on payment terms
    const issueDate = new Date(invoice.issueDate);
    const dueDate = new Date(issueDate);

    if (terms === 'due_on_receipt') {
      // Same day
    } else {
      // Add days according to the terms
      dueDate.setDate(issueDate.getDate() + parseInt(terms, 10));
    }

    setInvoice({
      ...invoice,
      paymentTerms: terms,
      dueDate: format(dueDate, 'yyyy-MM-dd'),
    });
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className='max-w-3xl max-h-[90vh] overflow-hidden flex flex-col'>
        <DialogHeader>
          <DialogTitle>Create Invoice</DialogTitle>
          <DialogDescription>Create an invoice to add to {selectedFile.name}</DialogDescription>
        </DialogHeader>

        <div className='flex-1 overflow-auto space-y-6 py-2'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='invoice-number'>Invoice Number*</Label>
              <Input
                id='invoice-number'
                value={invoice.number}
                onChange={(e) => setInvoice({ ...invoice, number: e.target.value })}
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='invoice-status'>Status</Label>
              <Select
                value={invoice.status}
                onValueChange={(value) => setInvoice({ ...invoice, status: value })}
              >
                <SelectTrigger id='invoice-status'>
                  <SelectValue placeholder='Select status' />
                </SelectTrigger>
                <SelectContent>
                  {invoiceStatuses.map((status) => (
                    <SelectItem key={status.value} value={status.value}>
                      {status.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='border-t pt-4'>
            <h4 className='font-medium mb-4'>Client Information</h4>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='client-name'>Client Name*</Label>
                <Input
                  id='client-name'
                  value={invoice.clientName}
                  onChange={(e) => setInvoice({ ...invoice, clientName: e.target.value })}
                  placeholder='Client or Company Name'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='client-email'>Client Email</Label>
                <Input
                  id='client-email'
                  value={invoice.clientEmail}
                  onChange={(e) => setInvoice({ ...invoice, clientEmail: e.target.value })}
                  placeholder='client@example.com'
                  type='email'
                />
              </div>
            </div>
          </div>

          <div className='border-t pt-4'>
            <h4 className='font-medium mb-4'>Invoice Details</h4>
            <div className='grid grid-cols-1 md:grid-cols-3 gap-4'>
              <div className='space-y-2'>
                <Label htmlFor='issue-date'>Issue Date*</Label>
                <Input
                  id='issue-date'
                  value={invoice.issueDate}
                  onChange={(e) => setInvoice({ ...invoice, issueDate: e.target.value })}
                  type='date'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='due-date'>Due Date*</Label>
                <Input
                  id='due-date'
                  value={invoice.dueDate}
                  onChange={(e) => setInvoice({ ...invoice, dueDate: e.target.value })}
                  type='date'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='payment-terms'>Payment Terms</Label>
                <Select value={invoice.paymentTerms} onValueChange={updatePaymentTerms}>
                  <SelectTrigger id='payment-terms'>
                    <SelectValue placeholder='Select terms' />
                  </SelectTrigger>
                  <SelectContent>
                    {paymentTerms.map((term) => (
                      <SelectItem key={term.value} value={term.value}>
                        {term.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <div className='border-t pt-4'>
            <div className='flex justify-between items-center mb-4'>
              <h4 className='font-medium'>Line Items</h4>
              <Button variant='outline' size='sm' onClick={addLineItem}>
                <Plus className='h-4 w-4 mr-1' />
                Add Item
              </Button>
            </div>

            {invoice.lineItems.length === 0 ? (
              <div className='text-center py-6 text-gray-500 border border-dashed rounded-md'>
                <DollarSign className='h-12 w-12 mx-auto mb-2 text-gray-300' />
                <p>No line items added yet</p>
                <p className='text-sm mt-1'>Add items to your invoice using the button above</p>
              </div>
            ) : (
              <>
                <div className='bg-gray-50 border rounded-t-md px-3 py-2 hidden md:grid md:grid-cols-12 text-sm font-medium text-gray-600'>
                  <div className='col-span-6'>Description</div>
                  <div className='col-span-2'>Quantity</div>
                  <div className='col-span-2'>Unit Price</div>
                  <div className='col-span-2'>Amount</div>
                </div>
                <div className='space-y-3'>
                  {invoice.lineItems.map((item, index) => (
                    <div
                      key={index}
                      className='border rounded-md md:rounded-none md:border-t-0 md:first:rounded-t-none p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center'
                    >
                      <div className='col-span-6 space-y-1 md:space-y-0'>
                        <Label className='md:hidden'>Description</Label>
                        <div className='flex items-center'>
                          <Input
                            value={item.description}
                            onChange={(e) => updateLineItem(index, 'description', e.target.value)}
                            placeholder='Service or product description'
                          />
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => removeLineItem(index)}
                            className='h-8 w-8 ml-2 md:hidden flex-shrink-0'
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>
                      </div>
                      <div className='col-span-2 space-y-1 md:space-y-0'>
                        <Label className='md:hidden'>Quantity</Label>
                        <Input
                          value={item.quantity}
                          onChange={(e) => updateLineItem(index, 'quantity', e.target.value)}
                          placeholder='1'
                          type='number'
                          min='0'
                          step='1'
                        />
                      </div>
                      <div className='col-span-2 space-y-1 md:space-y-0'>
                        <Label className='md:hidden'>Unit Price</Label>
                        <Input
                          value={item.unitPrice}
                          onChange={(e) => updateLineItem(index, 'unitPrice', e.target.value)}
                          placeholder='0.00'
                          type='number'
                          min='0'
                          step='0.01'
                        />
                      </div>
                      <div className='col-span-2 flex items-center space-y-1 md:space-y-0'>
                        <div className='w-full'>
                          <Label className='md:hidden'>Amount</Label>
                          <Input value={item.amount} readOnly className='bg-gray-50' />
                        </div>
                        <Button
                          type='button'
                          variant='ghost'
                          size='icon'
                          onClick={() => removeLineItem(index)}
                          className='h-8 w-8 ml-2 hidden md:flex'
                        >
                          <X className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>

                <div className='flex justify-end pt-4'>
                  <div className='w-full md:w-1/3 space-y-2'>
                    <div className='flex justify-between py-1'>
                      <span className='font-medium'>Total:</span>
                      <span className='font-medium'>${calculateTotal()}</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          <div className='border-t pt-4'>
            <div className='space-y-2'>
              <Label htmlFor='invoice-notes'>Notes</Label>
              <Textarea
                id='invoice-notes'
                value={invoice.notes}
                onChange={(e) => setInvoice({ ...invoice, notes: e.target.value })}
                placeholder='Additional notes or payment instructions...'
                rows={3}
              />
            </div>
          </div>
        </div>

        <DialogFooter className='pt-4 space-x-2 border-t mt-4'>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateInvoice}
            disabled={
              !invoice.number || !invoice.clientName || !invoice.issueDate || !invoice.dueDate
            }
          >
            Create Invoice
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddInvoiceModal;
