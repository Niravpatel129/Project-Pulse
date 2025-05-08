'use client';

import { useClients } from '@/hooks/useClients';
import { useMediaQuery } from '@/hooks/useMediaQuery';
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
  const isMobile = useMediaQuery('(max-width: 768px)');
  const [selectedClient, setSelectedClient] = useState(existingInvoice?.client?._id || '');
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
    <div className='flex h-full relative'>
      {/* Desktop Left Sidebar */}
      {!isMobile && (
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
      )}

      {/* Main Content */}
      <div
        className={`flex-1 flex flex-col h-full overflow-hidden relative ${
          isMobile ? 'w-full' : ''
        }`}
      >
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
      </div>

      {/* Desktop Right Sidebar */}
      {!isMobile && (
        <div className='w-[350px]'>
          <RightSidebar />
        </div>
      )}

      {/* Mobile Bottom Navigation */}
      {isMobile && (
        <div className='fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 p-2 flex justify-around items-center'>
          <button
            onClick={() => {
              return setActiveSection('items');
            }}
            className={`flex flex-col items-center p-2 ${
              activeSection === 'items' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2'
              />
            </svg>
            <span className='text-xs mt-1'>Items</span>
          </button>
          <button
            onClick={() => {
              return setActiveSection('client');
            }}
            className={`flex flex-col items-center p-2 ${
              activeSection === 'client' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z'
              />
            </svg>
            <span className='text-xs mt-1'>Client</span>
          </button>
          <button
            onClick={() => {
              return setActiveSection('invoice');
            }}
            className={`flex flex-col items-center p-2 ${
              activeSection === 'invoice' ? 'text-blue-600' : 'text-gray-600'
            }`}
          >
            <svg
              xmlns='http://www.w3.org/2000/svg'
              className='h-6 w-6'
              fill='none'
              viewBox='0 0 24 24'
              stroke='currentColor'
            >
              <path
                strokeLinecap='round'
                strokeLinejoin='round'
                strokeWidth={2}
                d='M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z'
              />
            </svg>
            <span className='text-xs mt-1'>Invoice</span>
          </button>
        </div>
      )}
    </div>
  );
}
