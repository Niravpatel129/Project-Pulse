import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';

// Define client interface based on the new API response structure
interface Client {
  _id: string;
  user: {
    _id: string;
    name: string;
    email: string;
  };
  workspace: string;
  isActive: boolean;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

// Fallback mock data in case API fails
const MOCK_CLIENTS: Client[] = [];

export function useClients() {
  const [activeItem, setActiveItem] = useState<Client | null>(null);

  const {
    data: clientsResponse,
    isLoading,
    error,
  } = useQuery({
    queryKey: ['clients'],
    queryFn: async () => {
      try {
        const response = await newRequest.get('/clients');
        return response.data;
      } catch (err) {
        console.error('Failed to fetch clients:', err);
        return {
          data: MOCK_CLIENTS,
          message: 'Using mock data',
          success: true,
        };
      }
    },
  });

  const clients = clientsResponse?.data || [];

  return {
    clients,
    total: clients.length,
    isLoading,
    error,
    activeItem,
  };
}
