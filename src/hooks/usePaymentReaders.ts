import { useToast } from '@/components/ui/use-toast';
import { useState } from 'react';

export interface Reader {
  id: string;
  name: string;
  model: string;
  serial: string;
  status: 'active' | 'inactive' | 'syncing';
  locationId?: string;
}

export interface Location {
  id: string;
  name: string;
  address: string;
}

export interface StripeStatus {
  status?: string;
  accountId?: string;
  chargesEnabled?: boolean;
  payoutsEnabled?: boolean;
  detailsSubmitted?: boolean;
}

export function usePaymentReaders(
  stripeStatus: StripeStatus | null,
  connectStripe: () => Promise<void>,
  disconnectStripe: () => Promise<void>,
) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);
  const [isSyncingReader, setIsSyncingReader] = useState<string | null>(null);
  const [isLocationDialogOpen, setIsLocationDialogOpen] = useState(false);
  const [isReaderDialogOpen, setIsReaderDialogOpen] = useState(false);
  const [isEditingLocation, setIsEditingLocation] = useState<string | null>(null);

  // Mock data - replace with actual data from your backend
  const [readers, setReaders] = useState<Reader[]>([
    {
      id: '1',
      name: 'FRONT COUNTER',
      model: 'BBPOS WisePOS E',
      serial: 'WSC513124045532',
      status: 'active',
      locationId: '1',
    },
  ]);

  const [locations, setLocations] = useState<Location[]>([
    {
      id: '1',
      name: 'Main Store',
      address: '1326 Maguire Ave., Montreal, QC, CAN, G1T 1Z3',
    },
  ]);

  const [newLocation, setNewLocation] = useState<Omit<Location, 'id'>>({
    name: '',
    address: '',
  });

  const [newReader, setNewReader] = useState<Omit<Reader, 'id' | 'status'>>({
    name: '',
    model: '',
    serial: '',
    locationId: '',
  });

  const handleConnect = async () => {
    setIsLoading(true);
    try {
      await connectStripe();
      toast({
        title: 'Success',
        description: 'Successfully connected to Stripe',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to connect to Stripe',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleDisconnect = async () => {
    setIsDisconnecting(true);
    try {
      await disconnectStripe();
      toast({
        title: 'Success',
        description: 'Successfully disconnected from Stripe',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to disconnect from Stripe',
        variant: 'destructive',
      });
    } finally {
      setIsDisconnecting(false);
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newLocation.name || !newLocation.address) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => {
        return setTimeout(resolve, 500);
      });
      const newLocationWithId: Location = {
        ...newLocation,
        id: Math.random().toString(36).substr(2, 9),
      };
      setLocations([...locations, newLocationWithId]);
      setNewLocation({ name: '', address: '' });
      setIsLocationDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Location added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add location',
        variant: 'destructive',
      });
    }
  };

  const handleDeleteLocation = async (locationId: string) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => {
        return setTimeout(resolve, 500);
      });
      setLocations(
        locations.filter((l) => {
          return l.id !== locationId;
        }),
      );
      // Also remove readers associated with this location
      setReaders(
        readers.filter((r) => {
          return r.locationId !== locationId;
        }),
      );
      toast({
        title: 'Success',
        description: 'Location deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete location',
        variant: 'destructive',
      });
    }
  };

  const handleSyncReader = async (readerId: string) => {
    setIsSyncingReader(readerId);
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => {
        return setTimeout(resolve, 1000);
      });
      toast({
        title: 'Success',
        description: 'Reader synced successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to sync reader',
        variant: 'destructive',
      });
    } finally {
      setIsSyncingReader(null);
    }
  };

  const handleDeleteReader = async (readerId: string) => {
    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => {
        return setTimeout(resolve, 500);
      });
      setReaders(
        readers.filter((r) => {
          return r.id !== readerId;
        }),
      );
      toast({
        title: 'Success',
        description: 'Reader deleted successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to delete reader',
        variant: 'destructive',
      });
    }
  };

  const handleAddReader = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReader.name || !newReader.model || !newReader.serial || !newReader.locationId) {
      toast({
        title: 'Error',
        description: 'Please fill in all fields',
        variant: 'destructive',
      });
      return;
    }

    try {
      // TODO: Replace with actual API call
      await new Promise((resolve) => {
        return setTimeout(resolve, 500);
      });
      const newReaderWithId: Reader = {
        ...newReader,
        id: Math.random().toString(36).substr(2, 9),
        status: 'active',
      };
      setReaders([...readers, newReaderWithId]);
      setNewReader({ name: '', model: '', serial: '', locationId: '' });
      setIsReaderDialogOpen(false);
      toast({
        title: 'Success',
        description: 'Reader added successfully',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to add reader',
        variant: 'destructive',
      });
    }
  };

  const getLocationReaders = (locationId: string) => {
    return readers.filter((r) => {
      return r.locationId === locationId;
    });
  };

  return {
    // State
    stripeStatus,
    isLoading,
    isDisconnecting,
    readers,
    locations,
    newReader,
    newLocation,
    isSyncingReader,
    isLocationDialogOpen,
    isReaderDialogOpen,
    isEditingLocation,

    // Setters
    setNewReader,
    setNewLocation,
    setIsLocationDialogOpen,
    setIsReaderDialogOpen,
    setIsEditingLocation,

    // Handlers
    handleConnect,
    handleDisconnect,
    handleAddLocation,
    handleDeleteLocation,
    handleAddReader,
    handleDeleteReader,
    handleSyncReader,
    getLocationReaders,
  };
}
