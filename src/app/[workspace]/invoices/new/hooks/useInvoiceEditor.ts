import { useProject } from '@/contexts/ProjectContext';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useParticipation } from '@/hooks/useParticipation';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface Customer {
  id: string;
  name: string;
  email: string;
  phone?: string;
  company?: string;
}

interface Item {
  id: string;
  description: string;
  quantity: number;
  unitPrice: number;
  projectIds: string[];
  moduleIds: string[];
  options: Record<string, any>;
  currency: string;
  total?: number;
  discount?: number; // Discount percentage
}

export function useInvoiceEditor() {
  const { participants, isLoading } = useParticipation();
  const [showPreview, setShowPreview] = useState(true);
  const [previewScale, setPreviewScale] = useState(1.4);
  const [isCustomerPicked, setIsCustomerPicked] = useState(false);
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [currency, setCurrency] = useState('usd');
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const { project } = useProject();
  const [deliveryMethod, setDeliveryMethod] = useState('email');
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<Item>({
    id: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    projectIds: [],
    moduleIds: [],
    options: {},
    currency: 'usd',
    discount: 0,
  });
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [newCustomer, setNewCustomer] = useState<Customer>({
    id: '',
    name: '',
    email: '',
  });
  const [currentCustomer, setCurrentCustomer] = useState<Customer>({
    id: '',
    name: '',
    email: '',
    phone: '',
    company: '',
  });
  const { data: invoiceSettings } = useInvoiceSettings();
  const [icon, setIcon] = useState('');
  const [logo, setLogo] = useState('');
  const router = useRouter();
  const [editingItem, setEditingItem] = useState<Item | null>(null);
  const [localTaxId, setLocalTaxId] = useState(invoiceSettings?.taxId || '');
  const [memo, setMemo] = useState('');
  const [footer, setFooter] = useState('');
  const [selectedTax, setSelectedTax] = useState<string>('');
  const queryClient = useQueryClient();

  // Fetch items from product catalog
  const { data: productCatalogItems, isLoading: isLoadingItems } = useQuery({
    queryKey: ['product-catalog'],
    queryFn: async () => {
      const response = await newRequest.get('/product-catalog');
      return response.data.data.products;
    },
  });

  // Fetch projects
  const { data: projects = [], isLoading: isLoadingProjects } = useQuery({
    queryKey: ['projects'],
    queryFn: async () => {
      const response = await newRequest.get('/projects');
      return response.data.data;
    },
  });

  // Fetch modules
  const { data: modules = [], isLoading: isLoadingModules } = useQuery({
    queryKey: ['modules'],
    queryFn: async () => {
      const response = await newRequest.get('/project-modules');
      return response.data.data;
    },
  });

  // Format projects and modules for dropdown options
  const projectOptions = projects.map((project: any) => {
    return {
      label: project.name,
      value: project._id,
    };
  });

  const moduleOptions = modules.map((module: any) => {
    return {
      label: module.name,
      value: module._id,
    };
  });

  // Update available items when product catalog data changes
  useEffect(() => {
    if (productCatalogItems) {
      const formattedItems = productCatalogItems.map((item: any) => {
        return {
          id: item._id,
          description: item.name,
          quantity: item.quantity || 1,
          unitPrice: item.price,
          projectIds: item.projects || [],
          moduleIds: item.modules || [],
          options: item.options || {},
          currency: item.currency || 'usd',
        };
      });
      setAvailableItems(formattedItems);
    }
  }, [productCatalogItems]);

  // Update customers when participants are loaded
  useEffect(() => {
    if (!isLoading && participants.length > 0) {
      setCustomers(
        participants.map((participant) => {
          return {
            id: participant._id,
            name: participant.name,
            email: participant.email || '',
          };
        }),
      );
    }
  }, [participants, isLoading]);

  // Update icon and logo when invoice settings change
  useEffect(() => {
    if (invoiceSettings) {
      setIcon(invoiceSettings.icon || '');
      setLogo(invoiceSettings.logo || '');
    }
  }, [invoiceSettings]);

  // Update localTaxId when invoiceSettings changes
  useEffect(() => {
    if (invoiceSettings?.taxId !== undefined) {
      setLocalTaxId(invoiceSettings.taxId);
    }
  }, [invoiceSettings?.taxId]);

  const handleCustomerSelect = (value: string) => {
    if (value === 'new') {
      setIsNewCustomerDialogOpen(true);
    } else {
      setSelectedCustomer(value);
      const participant = project?.participants.find((p) => {
        return p._id === value;
      });
      if (participant) {
        setCurrentCustomer({
          id: participant._id,
          name: participant.name,
          email: participant.email,
        });
        setIsCustomerPicked(true);
      }
    }
  };

  const handleAddCustomer = () => {
    const newId = (customers.length + 2).toString();
    const newCustomerData = {
      id: newId,
      name: newCustomer.name,
      email: newCustomer.email,
    };

    setCustomers([...customers, newCustomerData]);
    setSelectedCustomer(newId);
    setIsNewCustomerDialogOpen(false);
    setCurrentCustomer(newCustomerData);
    setIsCustomerPicked(true);
    setNewCustomer({ id: '', name: '', email: '' });
  };

  const handleClientCreated = (client: any) => {
    const clientParticipant = client.participant;

    const newCustomerData = {
      id: clientParticipant._id || (customers.length + 2).toString(),
      name: clientParticipant.name,
      email: clientParticipant.email,
    };

    setCustomers([...customers, newCustomerData]);
    setSelectedCustomer(newCustomerData.id);
    setCurrentCustomer(newCustomerData);
    setIsCustomerPicked(true);
    setIsNewCustomerDialogOpen(false);
  };

  const handleItemSelect = (value: string) => {
    if (value === 'new') {
      setIsNewItemDialogOpen(true);
    } else {
      setSelectedItem(value);
      const item = availableItems.find((i) => {
        return i.id === value;
      });
      if (item) {
        setSelectedItems([...selectedItems, item]);
      }
    }
  };

  const handleEditItem = (item: Item) => {
    setEditingItem(item);
    setIsNewItemDialogOpen(true);
  };

  const handleSaveItem = (item: Item) => {
    // Calculate total and prepare item data
    const discount = item.discount || 0;
    const discountAmount = (item.quantity * item.unitPrice * discount) / 100;
    const total = item.quantity * item.unitPrice - discountAmount;

    const itemToSave = {
      ...item,
      total,
      currency: item.currency || 'usd',
    };

    // Make the API call
    addItemMutation.mutate(itemToSave);
  };

  const addItemMutation = useMutation({
    mutationFn: async (item: Item) => {
      if (item.id) {
        // Update existing item
        const response = await newRequest.put(`/product-catalog/${item.id}`, {
          name: item.description,
          quantity: item.quantity,
          price: item.unitPrice,
          discount: item.discount || 0,
          projects: item.projectIds || [project?._id],
          modules: item.moduleIds || [],
          currency: item.currency || 'usd',
        });
        return response.data.data.product;
      } else {
        // Create new item
        const response = await newRequest.post('/product-catalog', {
          name: item.description,
          quantity: item.quantity,
          price: item.unitPrice,
          discount: item.discount || 0,
          projects: item.projectIds || [project?._id],
          modules: item.moduleIds || [],
          currency: item.currency || 'usd',
        });
        return response.data.data.product;
      }
    },
    onSuccess: (data) => {
      if (editingItem) {
        // Update existing item in both lists
        setAvailableItems((prev) => {
          return prev.map((item) => {
            return item.id === data._id
              ? {
                  id: data._id,
                  description: data.name,
                  quantity: data.quantity,
                  unitPrice: data.price,
                  discount: data.discount || 0,
                  currency: data.currency,
                  total: data.quantity * data.price * (1 - (data.discount || 0) / 100),
                  projectIds: data.projects || [],
                  moduleIds: data.modules || [],
                  options: {},
                }
              : item;
          });
        });
        setSelectedItems((prev) => {
          return prev.map((item) => {
            return item.id === data._id
              ? {
                  id: data._id,
                  description: data.name,
                  quantity: data.quantity,
                  unitPrice: data.price,
                  discount: data.discount || 0,
                  currency: data.currency,
                  total: data.quantity * data.price * (1 - (data.discount || 0) / 100),
                  projectIds: data.projects || [],
                  moduleIds: data.modules || [],
                  options: {},
                }
              : item;
          });
        });
        toast.success('Item updated successfully');
      } else {
        // Add new item to both lists
        const newItem = {
          id: data._id,
          description: data.name,
          quantity: data.quantity,
          unitPrice: data.price,
          discount: data.discount || 0,
          currency: data.currency,
          total: data.quantity * data.price * (1 - (data.discount || 0) / 100),
          projectIds: data.projects || [],
          moduleIds: data.modules || [],
          options: {},
        };
        setAvailableItems((prev) => {
          return [...prev, newItem];
        });
        setSelectedItems((prev) => {
          return [...prev, newItem];
        });
        toast.success('Item added successfully');
      }

      // Reset the form state and close dialog
      setEditingItem(null);
      setIsNewItemDialogOpen(false);
    },
    onError: (error) => {
      console.error('Error saving item:', error);
      toast.error('Failed to save item');
    },
  });

  const sendInvoiceMutation = useMutation({
    mutationFn: async () => {
      if (!currentCustomer || selectedItems.length === 0) {
        throw new Error('Customer and items are required');
      }

      // Get the selected tax information
      const selectedTaxInfo = invoiceSettings?.taxes?.find((tax) => {
        return tax.id === selectedTax;
      });

      const invoiceData = {
        clientId: currentCustomer.id,
        items: selectedItems.map((item) => {
          return item.id;
        }),

        deliveryMethod,
        memo,
        footer,
        tax: selectedTaxInfo
          ? {
              id: selectedTaxInfo.id,
              name: selectedTaxInfo.name,
              rate: selectedTaxInfo.rate,
            }
          : null,
      };

      const response = await newRequest.post(`/projects/${project?._id}/invoices`, invoiceData);
      return response.data.data;
    },
    onSuccess: (data) => {
      console.log('🚀 data:', data);
      toast.success('Invoice created successfully');
      // router.push(`/invoices/${data.id}`);
      queryClient.invalidateQueries({ queryKey: ['invoices'] });
    },
    onError: (error: any) => {
      console.error('Error creating invoice:', error);
      toast.error(error.message || 'Failed to create invoice');
    },
  });

  const handleRemoveItem = (itemId: string) => {
    setSelectedItems(
      selectedItems.filter((item) => {
        return item.id !== itemId;
      }),
    );
  };

  const zoomIn = () => {
    setPreviewScale((prev) => {
      return Math.min(prev + 0.1, 1.2);
    });
  };

  const zoomOut = () => {
    setPreviewScale((prev) => {
      return Math.max(prev - 0.1, 0.5);
    });
  };

  return {
    showPreview,
    setShowPreview,
    previewScale,
    isCustomerPicked,
    setIsCustomerPicked,
    isNewCustomerDialogOpen,
    setIsNewCustomerDialogOpen,
    isEditCustomerDialogOpen,
    setIsEditCustomerDialogOpen,
    selectedCustomer,
    setSelectedCustomer,
    isNewItemDialogOpen,
    setIsNewItemDialogOpen,
    selectedItem,
    setSelectedItem,
    availableItems,
    setAvailableItems,
    selectedItems,
    setSelectedItems,
    newItem,
    setNewItem,
    customers,
    setCustomers,
    currency,
    setCurrency,
    newCustomer,
    setNewCustomer,
    currentCustomer,
    setCurrentCustomer,
    handleCustomerSelect,
    handleAddCustomer,
    handleItemSelect,
    handleEditItem,
    handleSaveItem,
    handleRemoveItem,
    zoomIn,
    zoomOut,
    icon,
    setIcon,
    logo,
    setLogo,
    handleClientCreated,
    projectOptions,
    moduleOptions,
    sendInvoiceMutation,
    deliveryMethod,
    setDeliveryMethod,
    editingItem,
    localTaxId,
    setLocalTaxId,
    memo,
    setMemo,
    footer,
    setFooter,
    selectedTax,
    setSelectedTax,
  };
}
