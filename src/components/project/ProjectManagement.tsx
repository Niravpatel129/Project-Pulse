'use client';

import { useClients } from '@/hooks/useClients';
import { useRef, useState } from 'react';
import ClientSection from './ClientSection';
import InvoiceSection from './InvoiceSection';
import ItemsSection from './ItemsSection';
import LeftSidebar from './LeftSidebar';
import RightSidebar from './RightSidebar';
import { InvoiceSettings, Item, Section } from './types';

type ProjectManagementProps = {
  onClose: () => void;
  initialStatus?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  existingInvoice?: {
    _id: string;
    client: {
      _id: string;
      user: {
        name: string;
        email: string;
      };
    };
    items: Array<{
      name: string;
      description: string;
      quantity: number;
      price: number;
      discount: number;
      tax: number;
    }>;
    total: number;
    status: string;
    dueDate: string;
    notes?: string;
    teamNotes?: string;
    currency: string;
    taxRate: number;
    taxId?: string;
    showTaxId: boolean;
    requireDeposit: boolean;
    depositPercentage: number;
    discount: number;
    discountAmount: number;
    subtotal: number;
    taxAmount: number;
  };
};

export default function ProjectManagement({
  onClose,
  initialStatus = 'draft',
  existingInvoice,
}: ProjectManagementProps) {
  const [activeSection, setActiveSection] = useState<Section>('items');
  const [selectedClient, setSelectedClient] = useState(existingInvoice?.client?._id || '');
  const [isRightSidebarOpen, setIsRightSidebarOpen] = useState(true);
  const [items, setItems] = useState<Item[]>(
    existingInvoice?.items.map((item) => {
      return {
        id: Math.random().toString(36).substr(2, 9),
        name: item.name,
        description: item.description,
        quantity: item.quantity.toString(),
        price: item.price.toString(),
        taxRate: item.tax || 0,
        taxName: 'VAT', // Default tax name, should be configurable
        taxable: item.tax > 0,
        discount: item.discount || 0,
        currency: existingInvoice.currency,
      };
    }) || [],
  );
  const [projectCurrency, setProjectCurrency] = useState(existingInvoice?.currency || 'USD');
  const { clients } = useClients();

  // Workspace tax settings would normally be loaded from a global state or context
  // For demo purposes, we're initializing with default values
  const [workspaceTaxSettings, setWorkspaceTaxSettings] = useState({
    defaultTaxRate: existingInvoice?.taxRate || 20,
    taxId: existingInvoice?.taxId || '',
  });

  // Project-specific invoice settings
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    requireDeposit: existingInvoice?.requireDeposit || false,
    depositPercentage: existingInvoice?.depositPercentage || 50,
    defaultTaxRate: existingInvoice?.taxRate || workspaceTaxSettings.defaultTaxRate,
    taxId: existingInvoice?.taxId || workspaceTaxSettings.taxId,
    allowDiscount: true,
    defaultDiscountRate: existingInvoice?.discount || 0,
    invoiceNotes: existingInvoice?.notes || '',
    teamNotes: existingInvoice?.teamNotes || '',
  });

  const [dueDate, setDueDate] = useState<Date | null>(
    existingInvoice?.dueDate
      ? new Date(existingInvoice.dueDate)
      : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
  );

  // Handle workspace tax settings update
  const handleWorkspaceTaxSettingsChange = (settings: typeof workspaceTaxSettings) => {
    // In a real app, this would update the workspace settings via API
    setWorkspaceTaxSettings(settings);

    // Also update the current project's invoice settings to match
    setInvoiceSettings((prev) => {
      return {
        ...prev,
        defaultTaxRate: settings.defaultTaxRate,
        taxId: settings.taxId,
      };
    });
  };

  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Handle currency change
  const handleCurrencyChange = (newCurrency: string) => {
    setProjectCurrency(newCurrency);

    // Update all items to use the new currency
    if (items.length > 0) {
      const updatedItems = items.map((item) => {
        return {
          ...item,
          currency: newCurrency,
        };
      });
      setItems(updatedItems);
    }
  };

  // Calculate total
  const total = items
    .reduce((sum, item) => {
      return (
        sum + Number.parseFloat(item.price.replace(/,/g, '')) * Number.parseFloat(item.quantity)
      );
    }, 0)
    .toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  const handleRemoveItem = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    // Store the deleted item for potential undo
    const itemToDelete = items.find((item) => {
      return item.id === id;
    });

    // Remove the item
    setItems(
      items.filter((item) => {
        return item.id !== id;
      }),
    );
  };

  return (
    <div className='flex h-full'>
      <LeftSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        total={total}
        currency={projectCurrency}
        onCurrencyChange={handleCurrencyChange}
        clientSelected={!!selectedClient}
        items={items}
        hasInvoice={!!invoiceSettings}
      />

      {/* Main Content */}
      <div className='flex-1 flex flex-col h-full overflow-hidden relative'>
        {activeSection === 'items' && (
          <ItemsSection
            items={items}
            setItems={setItems}
            setActiveSection={setActiveSection}
            handleRemoveItem={handleRemoveItem}
            projectCurrency={projectCurrency}
          />
        )}

        {activeSection === 'client' && (
          <ClientSection
            clients={clients}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            setActiveSection={setActiveSection}
          />
        )}

        {activeSection === 'invoice' && (
          <InvoiceSection
            items={items}
            client={
              clients.find((c) => {
                return c._id === selectedClient;
              })!
            }
            projectCurrency={projectCurrency}
            invoiceSettings={invoiceSettings}
            setInvoiceSettings={setInvoiceSettings}
            workspaceTaxSettings={workspaceTaxSettings}
            onWorkspaceTaxSettingsChange={handleWorkspaceTaxSettingsChange}
            dueDate={dueDate}
            setDueDate={setDueDate}
            onClose={onClose}
            existingInvoice={existingInvoice}
          />
        )}

        {/* Floating button to reopen sidebar */}
        {!isRightSidebarOpen && (
          <button
            onClick={() => {
              return setIsRightSidebarOpen(true);
            }}
            className='absolute right-4 top-4 bg-white border border-[#E5E7EB] rounded-full p-2 shadow-sm hover:shadow-md transition-all duration-200 flex items-center gap-2 text-sm text-[#6B7280] hover:text-[#111827]'
          >
            <svg
              width='16'
              height='16'
              viewBox='0 0 16 16'
              fill='none'
              xmlns='http://www.w3.org/2000/svg'
            >
              <path
                d='M6 12L10 8L6 4'
                stroke='currentColor'
                strokeWidth='1.5'
                strokeLinecap='round'
                strokeLinejoin='round'
              />
            </svg>
            <span>Show Details</span>
          </button>
        )}
      </div>

      {/* Right Sidebar with Toggle */}
      <div
        className={`relative transition-all duration-300 ${
          isRightSidebarOpen ? 'w-[350px]' : 'w-0'
        }`}
      >
        <div
          className={`h-full transition-all duration-300 ${
            isRightSidebarOpen ? 'opacity-100' : 'opacity-0'
          }`}
        >
          <RightSidebar />
        </div>
      </div>
    </div>
  );
}
