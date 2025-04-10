import { useParticipation } from '@/hooks/useParticipation';
import { useEffect, useState } from 'react';

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
  const [icon, setIcon] = useState<string>('');
  const [logo, setLogo] = useState<string>('');

  // Mock data for projects and modules - replace with actual data from your API
  const projectOptions = [
    { label: 'Project 1', value: 'project-1' },
    { label: 'Project 2', value: 'project-2' },
    { label: 'Project 3', value: 'project-3' },
  ];

  const moduleOptions = [
    { label: 'Module 1', value: 'module-1' },
    { label: 'Module 2', value: 'module-2' },
    { label: 'Module 3', value: 'module-3' },
  ];

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

  const handleAddItem = () => {
    if (!newItem.description || !newItem.quantity || !newItem.unitPrice) return;

    const newId = (availableItems.length + 1).toString();
    const total = newItem.quantity * newItem.unitPrice;

    const newItemWithId = {
      id: newId,
      description: newItem.description,
      quantity: newItem.quantity,
      unitPrice: newItem.unitPrice,
      total,
    };

    setAvailableItems([...availableItems, newItemWithId]);
    setSelectedItems([...selectedItems, newItemWithId]);

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
