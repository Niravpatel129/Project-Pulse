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
  const [showRightSidebar, setShowRightSidebar] = useState(false);
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
  const [projectCurrency, setProjectCurrency] = useState(() => {
    // Try to get currency from local storage first, then fallback to existing invoice or default
    return localStorage.getItem('projectCurrency') || existingInvoice?.currency || 'USD';
  });
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
    // Save to local storage
    localStorage.setItem('projectCurrency', newCurrency);

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
    <div className='flex h-full relative bg-background'>
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
            onChatClick={() => {
              return setShowRightSidebar(!showRightSidebar);
            }}
            onSectionChange={(section) => {
              const sections: Section[] = ['items', 'client', 'invoice'];
              setActiveSection(sections[section - 1]);
            }}
          />
        )}

        {activeSection === 'client' && (
          <ClientSection
            clients={clients}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            setActiveSection={setActiveSection}
            onChatClick={() => {
              return setShowRightSidebar(!showRightSidebar);
            }}
            onSectionChange={(section) => {
              const sections: Section[] = ['items', 'client', 'invoice'];
              setActiveSection(sections[section - 1]);
            }}
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
            onChatClick={() => {
              return setShowRightSidebar(!showRightSidebar);
            }}
            onSectionChange={(section) => {
              const sections: Section[] = ['items', 'client', 'invoice'];
              setActiveSection(sections[section - 1]);
            }}
          />
        )}
      </div>

      {/* Desktop Right Sidebar */}
      {!isMobile && (
        <div className='w-[350px]'>
          <RightSidebar
            setItems={setItems}
            projectCurrency={projectCurrency}
            setSelectedClient={setSelectedClient}
          />
        </div>
      )}

      {/* Mobile Chat Panel */}
      {isMobile && showRightSidebar && (
        <div
          className='fixed inset-0 bg-black/50 z-40'
          onClick={() => {
            return setShowRightSidebar(false);
          }}
        >
          <div
            className='absolute inset-0 bg-[#141414] flex flex-col'
            onClick={(e) => {
              return e.stopPropagation();
            }}
          >
            <div className='flex items-center justify-between p-4 border-b border-[#232428]'>
              <h2 className='text-lg font-semibold text-[#fafafa]'>Chat</h2>
              <button
                onClick={() => {
                  return setShowRightSidebar(false);
                }}
                className='p-2 hover:bg-[#232428] rounded-full text-[#8C8C8C] hover:text-[#fafafa] transition-colors'
              >
                <svg
                  xmlns='http://www.w3.org/2000/svg'
                  className='h-5 w-5'
                  viewBox='0 0 20 20'
                  fill='currentColor'
                >
                  <path
                    fillRule='evenodd'
                    d='M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z'
                    clipRule='evenodd'
                  />
                </svg>
              </button>
            </div>
            <div className='flex-1 overflow-y-auto pb-20'>
              <RightSidebar
                setItems={setItems}
                projectCurrency={projectCurrency}
                setSelectedClient={setSelectedClient}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
