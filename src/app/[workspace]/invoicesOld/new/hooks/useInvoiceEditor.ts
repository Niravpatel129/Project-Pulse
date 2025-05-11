'use client';

import { useProject } from '@/contexts/ProjectContext';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useProjectModules } from '@/hooks/useProjectModules';
import { useUpdateInvoiceSettings } from '@/hooks/useUpdateInvoiceSettings';
import { newRequest } from '@/utils/newRequest';
import { useMutation } from '@tanstack/react-query';
import { useState } from 'react';

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  discount?: number;
}

export function useInvoiceEditor() {
  const { project } = useProject();
  const { modules } = useProjectModules();
  const { data: invoiceSettings } = useInvoiceSettings();
  const updateInvoiceSettings = useUpdateInvoiceSettings();

  // UI State
  const [showPreview, setShowPreview] = useState(false);
  const [previewScale, setPreviewScale] = useState(1);
  const [isCustomerPicked, setIsCustomerPicked] = useState(false);
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] = useState(false);
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);

  // Customer State
  const [selectedCustomer, setSelectedCustomer] = useState<string>('');
  const [customers, setCustomers] = useState<any[]>([]);
  const [newCustomer, setNewCustomer] = useState<any>(null);
  const [currentCustomer, setCurrentCustomer] = useState<any>(null);

  // Item State
  const [selectedItem, setSelectedItem] = useState<string>('');
  const [availableItems, setAvailableItems] = useState<InvoiceItem[]>([]);
  const [selectedItems, setSelectedItems] = useState<InvoiceItem[]>([]);
  const [editingItem, setEditingItem] = useState<InvoiceItem | null>(null);

  // Settings State
  const [icon, setIcon] = useState(invoiceSettings?.icon || '');
  const [logo, setLogo] = useState(invoiceSettings?.logo || '');
  const [currency, setCurrency] = useState(invoiceSettings?.currency || 'usd');
  const [deliveryMethod, setDeliveryMethod] = useState('email');
  const [localTaxId, setLocalTaxId] = useState(invoiceSettings?.taxId || '');
  const [memo, setMemo] = useState('');
  const [footer, setFooter] = useState('');
  const [selectedTax, setSelectedTax] = useState('no-tax');

  // Project and Module Options
  const projectOptions = project ? [{ id: project._id, name: project.name }] : [];
  const moduleOptions = modules || [];

  // Customer Handlers
  const handleCustomerSelect = (customerId: string) => {
    setSelectedCustomer(customerId);
    if (customerId === 'new') {
      setIsNewCustomerDialogOpen(true);
    } else {
      const customer = customers.find((c) => {
        return c.id === customerId;
      });
      setCurrentCustomer(customer);
      setIsCustomerPicked(true);
    }
  };

  const handleAddCustomer = (customer: any) => {
    setCustomers([...customers, customer]);
    setNewCustomer(customer);
  };

  const handleClientCreated = (client: any) => {
    setCustomers([...customers, client]);
    setCurrentCustomer(client);
    setIsCustomerPicked(true);
    setIsNewCustomerDialogOpen(false);
  };

  // Item Handlers
  const handleItemSelect = (itemId: string) => {
    setSelectedItem(itemId);
    if (itemId === 'new') {
      setIsNewItemDialogOpen(true);
    } else {
      const item = availableItems.find((i) => {
        return i.id === itemId;
      });
      if (item) {
        setSelectedItems([...selectedItems, item]);
      }
    }
  };

  const handleEditItem = (item: InvoiceItem) => {
    setEditingItem(item);
    setIsNewItemDialogOpen(true);
  };

  const handleSaveItem = (item: InvoiceItem) => {
    if (editingItem) {
      setSelectedItems(
        selectedItems.map((i) => {
          return i.id === item.id ? item : i;
        }),
      );
    } else {
      setSelectedItems([...selectedItems, item]);
    }
    setEditingItem(null);
    setIsNewItemDialogOpen(false);
  };

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(
      selectedItems.filter((item) => {
        return item.id !== itemId;
      }),
    );
  };

  // Preview Handlers
  const zoomIn = () => {
    setPreviewScale(Math.min(previewScale + 0.1, 2));
  };

  const zoomOut = () => {
    setPreviewScale(Math.max(previewScale - 0.1, 0.5));
  };

  // Send Invoice Mutation
  const sendInvoiceMutation = useMutation({
    mutationFn: async (data: any) => {
      const response = await newRequest.post('/invoices', data);
      return response.data;
    },
  });

  return {
    // UI State
    showPreview,
    setShowPreview,
    previewScale,
    isCustomerPicked,
    setIsCustomerPicked,
    isNewCustomerDialogOpen,
    setIsNewCustomerDialogOpen,
    isEditCustomerDialogOpen,
    setIsEditCustomerDialogOpen,
    isNewItemDialogOpen,
    setIsNewItemDialogOpen,

    // Customer State
    selectedCustomer,
    customers,
    setCustomers,
    newCustomer,
    setNewCustomer,
    currentCustomer,
    setCurrentCustomer,

    // Item State
    selectedItem,
    availableItems,
    selectedItems,
    editingItem,

    // Settings State
    icon,
    setIcon,
    logo,
    setLogo,
    currency,
    setCurrency,
    deliveryMethod,
    setDeliveryMethod,
    localTaxId,
    setLocalTaxId,
    memo,
    setMemo,
    footer,
    setFooter,
    selectedTax,
    setSelectedTax,

    // Project and Module Options
    projectOptions,
    moduleOptions,

    // Handlers
    handleCustomerSelect,
    handleAddCustomer,
    handleClientCreated,
    handleItemSelect,
    handleEditItem,
    handleSaveItem,
    handleRemoveItem,
    zoomIn,
    zoomOut,

    // Mutations
    sendInvoiceMutation,
  };
}
