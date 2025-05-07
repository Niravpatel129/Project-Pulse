'use client';

import { useClients } from '@/hooks/useClients';
import { useRef, useState } from 'react';
import ClientSection from './ClientSection';
import InvoiceSection from './InvoiceSection';
import ItemsSection from './ItemsSection';
import LeftSidebar from './LeftSidebar';
import { InvoiceSettings, Item, Section } from './types';

type ProjectManagementProps = {
  onClose: () => void;
  initialStatus?: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
};

export default function ProjectManagement({
  onClose,
  initialStatus = 'draft',
}: ProjectManagementProps) {
  const [activeSection, setActiveSection] = useState<Section>('items');
  const [selectedClient, setSelectedClient] = useState('');
  const [items, setItems] = useState<Item[]>([]);
  const [projectCurrency, setProjectCurrency] = useState('USD');
  const { clients } = useClients();

  // Workspace tax settings would normally be loaded from a global state or context
  // For demo purposes, we're initializing with default values
  const [workspaceTaxSettings, setWorkspaceTaxSettings] = useState({
    defaultTaxRate: 20,
    taxId: '',
  });

  // Project-specific invoice settings
  const [invoiceSettings, setInvoiceSettings] = useState<InvoiceSettings>({
    requireDeposit: false,
    depositPercentage: 50,
    defaultTaxRate: workspaceTaxSettings.defaultTaxRate, // Initialize from workspace settings
    taxId: workspaceTaxSettings.taxId, // Initialize from workspace settings
    allowDiscount: true,
    defaultDiscountRate: 0,
    invoiceNotes: '',
    teamNotes: '',
  });

  const [dueDate, setDueDate] = useState<Date | null>(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // Default to 30 days from now
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
    <div className='flex h-full bg-[#FAFAFA]'>
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
      <div className='flex-1 flex flex-col h-full overflow-hidden'>
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
          />
        )}
      </div>
    </div>
  );
}
