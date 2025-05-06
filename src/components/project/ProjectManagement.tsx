'use client';

import { useRef, useState } from 'react';
import ClientSection from './ClientSection';
import CommentsSection from './CommentsSection';
import ItemsSection from './ItemsSection';
import LeftSidebar from './LeftSidebar';
import NotificationSystem from './NotificationSystem';
import { Client, Item, Notification, Section } from './types';

type ProjectManagementProps = {
  onClose: () => void;
};

export default function ProjectManagement({ onClose }: ProjectManagementProps) {
  const [activeSection, setActiveSection] = useState<Section>('items');
  const [selectedClient, setSelectedClient] = useState('client1');
  const [deletedItem, setDeletedItem] = useState<Item | null>(null);
  const [showUndoNotification, setShowUndoNotification] = useState(false);
  const [notification, setNotification] = useState<Notification>({
    show: false,
    message: '',
    type: 'success',
  });
  const [items, setItems] = useState<Item[]>([]);
  const [clients, setClients] = useState<Client[]>([
    { id: 'client1', name: 'Acme Corporation', email: 'contact@acmecorp.com' },
    { id: 'client2', name: 'Globex Industries', email: 'info@globex.com' },
    { id: 'client3', name: 'Stark Enterprises', email: 'tony@stark.com' },
  ]);
  const [notes, setNotes] = useState(
    'Project deadline is end of Q2. Client prefers minimalist design approach.',
  );

  const undoTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Calculate total
  const total = items
    .reduce((sum, item) => {
      return sum + Number.parseFloat(item.price.replace(/,/g, ''));
    }, 0)
    .toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });

  // Show notification
  const showNotification = (message: string, type = 'success') => {
    setNotification({ show: true, message, type: type as 'success' | 'error' | 'info' });
    setTimeout(() => {
      setNotification({ show: false, message: '', type: 'success' });
    }, 3000);
  };

  const handleRemoveItem = (id: string, e?: React.MouseEvent) => {
    if (e) {
      e.stopPropagation();
    }

    // Store the deleted item for potential undo
    const itemToDelete = items.find((item) => {
      return item.id === id;
    });

    if (itemToDelete) {
      setDeletedItem(itemToDelete);
    }

    // Remove the item
    setItems(
      items.filter((item) => {
        return item.id !== id;
      }),
    );

    // Show undo notification
    setShowUndoNotification(true);

    // Clear any existing timeout
    if (undoTimeoutRef.current) {
      clearTimeout(undoTimeoutRef.current);
    }

    // Set a timeout to clear the undo option
    undoTimeoutRef.current = setTimeout(() => {
      setShowUndoNotification(false);
      setDeletedItem(null);
    }, 5000);

    showNotification('Item removed', 'info');
  };

  const handleUndoDelete = () => {
    if (deletedItem) {
      setItems((prev) => {
        return [...prev, deletedItem];
      });
      setShowUndoNotification(false);
      setDeletedItem(null);
      if (undoTimeoutRef.current) {
        clearTimeout(undoTimeoutRef.current);
      }
      showNotification('Item restored', 'success');
    }
  };

  return (
    <div className='flex h-full bg-[#FAFAFA]'>
      {/* Notification System */}
      <NotificationSystem
        notification={notification}
        showUndoNotification={showUndoNotification}
        setShowUndoNotification={setShowUndoNotification}
        handleUndoDelete={handleUndoDelete}
      />

      {/* Left Sidebar */}
      <LeftSidebar
        activeSection={activeSection}
        setActiveSection={setActiveSection}
        total={total}
      />

      {/* Main Content */}
      <div className='flex-1 flex flex-col h-full overflow-hidden'>
        {activeSection === 'items' && (
          <ItemsSection
            items={items}
            setItems={setItems}
            showNotification={showNotification}
            setActiveSection={setActiveSection}
            handleRemoveItem={handleRemoveItem}
          />
        )}

        {activeSection === 'client' && (
          <ClientSection
            clients={clients}
            selectedClient={selectedClient}
            setSelectedClient={setSelectedClient}
            showNotification={showNotification}
            setActiveSection={setActiveSection}
          />
        )}

        {activeSection === 'comments' && (
          <CommentsSection
            notes={notes}
            setNotes={setNotes}
            showNotification={showNotification}
            onClose={onClose}
          />
        )}
      </div>
    </div>
  );
}
