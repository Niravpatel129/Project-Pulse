import { Client } from '@/api/models';
import { PaginatedResponse } from '@/api/types';
import { newRequest } from '@/utils/newRequest';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';

// Fallback mock data in case API fails
const MOCK_CLIENTS: Client[] = [
  {
    _id: '1',
    name: 'John Doe',
    email: 'john@example.com',
    phone: '+1 234-567-8900',
    company: 'Acme Corporation',
    status: 'active',
    notes: 'Key decision maker for all major projects',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    createdBy: 'system',
  },
];

export function useClients() {
  const queryClient = useQueryClient();
  const [activeItem, setActiveItem] = useState<Client | null>(null);

  // Fetch clients with React Query
  const {
    data: clientsData = { items: [], total: 0, page: 1, limit: 10, totalPages: 1 },
    isLoading,
    error,
  } = useQuery<PaginatedResponse<Client>>({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        return await newRequest.get('/workspaces/clients');
      } catch (err) {
        console.error('Failed to fetch clients:', err);
        return {
          items: MOCK_CLIENTS,
          total: MOCK_CLIENTS.length,
          page: 1,
          limit: 10,
          totalPages: 1,
        };
      }
    },
  });

  return {
    // State
    clients: clientsData.items,
    total: clientsData.total,
    isLoading,
    error,
    activeItem,
  };
}
