import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { ChevronLeft, Eye, X } from 'lucide-react';
import InvoiceClient from './InvoiceClient';
import InvoiceDetails from './InvoiceDetails';
import InvoiceItems from './InvoiceItems';
import InvoicePreview from './InvoicePreview';
import InvoiceShipping from './InvoiceShipping';
import InvoiceSidebar from './InvoiceSidebar';
import { InvoiceWizardProvider, useInvoiceWizardContext } from './InvoiceWizardContext';

interface InvoiceWizardDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  projectId: string;
  clients?: any[];
}

const InvoiceWizardContent = ({
  open,
  onOpenChange,
  clients = [],
}: Omit<InvoiceWizardDialogProps, 'projectId'>) => {
  const {
    activeTab,
    setActiveTab,
    selectedItems,
    allItems,
    showPreview,
    setShowPreview,
    shippingRequired,
    hasPhysicalProducts,
    calculateInvoiceSubtotal,
    calculateInvoiceTotal,
    handleCreateInvoice,
    isGenerating,
    error,
    selectedClient,
    toggleItemSelection,
    addAllItems,
    removeAllItems,
    handleSelectClient,
    taxRate,
    setTaxRate,
    reducedTaxRate,
    setReducedTaxRate,
    notes,
    setNotes,
    setShippingRequired,
    selectedTax,
    setSelectedTax,
    selectedShippingMethod,
    setSelectedShippingMethod,
    useShippingAddress,
    setUseShippingAddress,
    shippingAddress,
    setShippingAddress,
    addShippingToInvoice,
    handleUpdateItems,
    handleUpdateClient,
  } = useInvoiceWizardContext();

  // Function to toggle preview on mobile
  const togglePreview = () => {
    setShowPreview(!showPreview);
  };

  return (
    <DialogContent className='max-w-[1400px] p-0 sm:max-h-[95vh] h-full md:h-[800px] w-full'>
      <DialogTitle className='sr-only'>Invoice Wizard</DialogTitle>
      <div className='flex flex-col md:flex-row h-full overflow-hidden'>
        {/* Sidebar Navigation - Hidden on mobile, shown on tablet/desktop */}
        <div className='hidden md:block'>
          <InvoiceSidebar
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            shippingRequired={shippingRequired}
            hasPhysicalProducts={hasPhysicalProducts}
          />
        </div>

        {/* Mobile Sidebar - Only visible on mobile */}
        <div className='flex md:hidden border-b p-4 justify-between items-center'>
          <h2 className='font-semibold'>Invoice Wizard</h2>
          <div className='flex items-center gap-2'>
            <Button variant='outline' size='sm' className='px-2 py-1' onClick={togglePreview}>
              {showPreview ? <ChevronLeft size={18} /> : <Eye size={18} />}
              {showPreview ? 'Back' : 'Preview'}
            </Button>
            <Button
              variant='ghost'
              size='sm'
              className='px-2 py-1'
              onClick={() => {
                return onOpenChange(false);
              }}
            >
              <X size={18} />
            </Button>
          </div>
        </div>

        {/* Mobile Tab Navigation */}
        <div className='flex md:hidden overflow-x-auto border-b'>
          <button
            className={`p-3 ${activeTab === 'items' ? 'border-b-2 border-black' : ''}`}
            onClick={() => {
              return setActiveTab('items');
            }}
          >
            Items
          </button>
          <button
            className={`p-3 ${activeTab === 'client' ? 'border-b-2 border-black' : ''}`}
            onClick={() => {
              return setActiveTab('client');
            }}
          >
            Client
          </button>
          <button
            className={`p-3 ${activeTab === 'details' ? 'border-b-2 border-black' : ''}`}
            onClick={() => {
              return setActiveTab('details');
            }}
          >
            Details
          </button>
          {(shippingRequired || hasPhysicalProducts) && (
            <button
              className={`p-3 ${activeTab === 'shipping' ? 'border-b-2 border-black' : ''}`}
              onClick={() => {
                return setActiveTab('shipping');
              }}
            >
              Shipping
            </button>
          )}
        </div>

        {/* Main Content */}
        <div className='flex-1 flex flex-col h-full overflow-hidden'>
          {/* Select Items Header - Desktop only */}
          <div className='hidden md:flex justify-between items-center p-4 border-b'>
            <h2 className='font-semibold'>
              {activeTab === 'items' && 'Select Items'}
              {activeTab === 'client' && 'Select Client'}
              {activeTab === 'details' && 'Invoice Details'}
              {activeTab === 'shipping' && 'Shipping Details'}
            </h2>
          </div>

          {/* Content Area */}
          <div className='flex h-full flex-col md:flex-row overflow-hidden'>
            {/* Main Content - Hidden when preview is shown on mobile */}
            <div
              className={`flex-1 p-4 overflow-y-auto pb-24 ${
                showPreview ? 'hidden md:block' : 'block'
              }`}
            >
              {activeTab === 'items' && (
                <InvoiceItems
                  allItems={allItems}
                  selectedItems={selectedItems}
                  toggleItemSelection={toggleItemSelection}
                  addAllItems={addAllItems}
                  removeAllItems={removeAllItems}
                />
              )}

              {activeTab === 'client' && (
                <InvoiceClient
                  clients={clients}
                  selectedClient={selectedClient}
                  handleSelectClient={handleSelectClient}
                />
              )}

              {activeTab === 'details' && (
                <InvoiceDetails
                  taxRate={taxRate}
                  setTaxRate={setTaxRate}
                  reducedTaxRate={reducedTaxRate}
                  setReducedTaxRate={setReducedTaxRate}
                  notes={notes}
                  setNotes={setNotes}
                  shippingRequired={shippingRequired}
                  setShippingRequired={setShippingRequired}
                  hasPhysicalProducts={hasPhysicalProducts}
                  selectedTax={selectedTax}
                  setSelectedTax={setSelectedTax}
                  setActiveTab={setActiveTab}
                />
              )}

              {activeTab === 'shipping' && (
                <InvoiceShipping
                  selectedShippingMethod={selectedShippingMethod}
                  setSelectedShippingMethod={setSelectedShippingMethod}
                  selectedClient={selectedClient}
                  useShippingAddress={useShippingAddress}
                  setUseShippingAddress={setUseShippingAddress}
                  shippingAddress={shippingAddress}
                  setShippingAddress={setShippingAddress}
                  addShippingToInvoice={addShippingToInvoice}
                  setActiveTab={setActiveTab}
                />
              )}
            </div>

            {/* Invoice Preview - Hidden by default on mobile, shown when toggled */}
            <div
              className={`${
                showPreview ? 'block' : 'hidden md:block'
              } md:w-[400px] border-l overflow-y-auto`}
            >
              <InvoicePreview
                selectedItems={selectedItems}
                calculateSubtotal={calculateInvoiceSubtotal}
                calculateTotal={calculateInvoiceTotal}
                selectedClient={selectedClient}
                setActiveTab={setActiveTab}
                onUpdateItems={handleUpdateItems}
                onUpdateClient={handleUpdateClient}
              />
            </div>
          </div>

          {/* Mobile Action Bar */}
          <div className='md:hidden fixed bottom-0 left-0 right-0 bg-white border-t p-4 flex justify-between gap-2'>
            <div className='text-sm'>
              <div>Total: ${calculateInvoiceTotal().toFixed(2)}</div>
              {error && <div className='text-red-500 text-xs'>{error}</div>}
            </div>
            <Button
              className='bg-black text-white hover:bg-gray-800'
              onClick={handleCreateInvoice}
              disabled={isGenerating}
            >
              {isGenerating ? 'Creating...' : 'Create Invoice'}
            </Button>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

const InvoiceWizardDialog = (props: InvoiceWizardDialogProps) => {
  const { projectId, ...rest } = props;

  return (
    <Dialog open={props.open} onOpenChange={props.onOpenChange}>
      <InvoiceWizardProvider projectId={projectId}>
        <InvoiceWizardContent {...rest} />
      </InvoiceWizardProvider>
    </Dialog>
  );
};

export default InvoiceWizardDialog;
