import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useParticipation } from '@/hooks/useParticipation';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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
  total: number;
  projectIds?: string[];
  moduleIds?: string[];
  options?: {
    [key: string]: string | number | boolean;
  };
}

export function useInvoiceEditor() {
  const { participants, isLoading } = useParticipation();
  const [showPreview, setShowPreview] = useState(true);
  const [previewScale, setPreviewScale] = useState(1.4);
  const [isCustomerPicked, setIsCustomerPicked] = useState(false);
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [isEditCustomerDialogOpen, setIsEditCustomerDialogOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState('');
  const [isNewItemDialogOpen, setIsNewItemDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState('');
  const [availableItems, setAvailableItems] = useState<Item[]>([]);
  const [selectedItems, setSelectedItems] = useState<Item[]>([]);
  const [newItem, setNewItem] = useState<Item>({
    id: '',
    description: '',
    quantity: 1,
    unitPrice: 0,
    total: 0,
    projectIds: [],
    moduleIds: [],
    options: {},
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
          total: (item.quantity || 1) * item.price,
          projectIds: item.projects || [],
          moduleIds: item.modules || [],
          options: item.options || {},
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

  const handleCustomerSelect = (value: string) => {
    if (value === 'new') {
      setIsNewCustomerDialogOpen(true);
    } else {
      setSelectedCustomer(value);
      const customer = customers.find((c) => {
        return c.id === value;
      });
      if (customer) {
        setCurrentCustomer(customer);
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

  const addItemMutation = useMutation({
    mutationFn: async (item: Item) => {
      const response = await newRequest.post('/product-catalog', {
        name: item.description,
        quantity: item.quantity,
        price: item.unitPrice,
        projects: item.projectIds || [],
        modules: item.moduleIds || [],
      });
      return response.data.data.product;
    },
    onSuccess: (data) => {
      // Update the available items list with the new item
      setAvailableItems((prev) => {
        return [
          ...prev,
          {
            id: data._id,
            description: data.name,
            quantity: data.quantity,
            unitPrice: data.price,
            total: data.quantity * data.price,
            projectIds: data.projects,
            moduleIds: data.modules,
          },
        ];
      });
      // Add the new item to selected items
      setSelectedItems((prev) => {
        return [
          ...prev,
          {
            id: data._id,
            description: data.name,
            quantity: data.quantity,
            unitPrice: data.price,
            total: data.quantity * data.price,
            projectIds: data.projects,
            moduleIds: data.modules,
          },
        ];
      });
      // Reset the new item form
      setNewItem({
        id: '',
        description: '',
        quantity: 1,
        unitPrice: 0,
        total: 0,
        projectIds: [],
        moduleIds: [],
        options: {},
      });
      setIsNewItemDialogOpen(false);
      toast.success('Item added successfully');
    },
    onError: (error) => {
      console.error('Error adding item:', error);
      toast.error('Failed to add item');
    },
  });

  const handleAddItem = () => {
    if (!newItem.description || !newItem.quantity || !newItem.unitPrice) {
      toast.error('Please fill in all required fields');
      return;
    }

    const total = newItem.quantity * newItem.unitPrice;
    const itemToAdd = {
      ...newItem,
      total,
    };

    addItemMutation.mutate(itemToAdd);
  };

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
    newCustomer,
    setNewCustomer,
    currentCustomer,
    setCurrentCustomer,
    handleCustomerSelect,
    handleAddCustomer,
    handleItemSelect,
    handleAddItem,
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
  };
}
