import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAvailability } from '@/hooks/useAvailability';
import { useGoogleCalendar } from '@/hooks/useGoogleCalendar';
import { regions, timezones } from '@/lib/timezones';
import {
  createContext,
  memo,
  Suspense,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { FcCheckmark, FcGoogle } from 'react-icons/fc';
import WeeklyAvailability from './WeeklyAvailability';

interface ManageAvailabilityDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: () => void;
}

interface TimeSlot {
  start: string;
  end: string;
}

interface DayAvailability {
  isEnabled: boolean;
  slots: TimeSlot[];
}

interface AvailabilitySettings {
  timezone: string;
  minimumNotice: number;
  bufferTime: number;
  preventOverlap: boolean;
  requireConfirmation: boolean;
  availabilitySlots: {
    sunday: DayAvailability;
    monday: DayAvailability;
    tuesday: DayAvailability;
    wednesday: DayAvailability;
    thursday: DayAvailability;
    friday: DayAvailability;
    saturday: DayAvailability;
  };
}

// Settings Context to avoid prop drilling
type SettingsContextType = {
  settings: AvailabilitySettings;
  updateSetting: (
    key: keyof AvailabilitySettings,
    value: AvailabilitySettings[keyof AvailabilitySettings],
  ) => void;
  isLoading: boolean;
};

// Export the context so it can be imported in other components
export const SettingsContext = createContext<SettingsContextType | null>(null);

function useSettings() {
  const context = useContext(SettingsContext);
  if (!context) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}

// Individual setting components that use context directly
const TimezoneSetting = memo(() => {
  const { settings, updateSetting, isLoading } = useSettings();
  const memoizedRegions = useMemo(() => {
    return regions;
  }, []);
  const memoizedTimezones = useMemo(() => {
    return timezones;
  }, []);

  return (
    <div className='space-y-2'>
      <Label>Timezone</Label>
      <Select
        value={settings.timezone}
        onValueChange={(value) => {
          return updateSetting('timezone', value);
        }}
        disabled={isLoading}
      >
        <SelectTrigger className='w-[268px]'>
          <SelectValue placeholder='Select your timezone' />
        </SelectTrigger>
        <SelectContent className='w-[268px]'>
          {memoizedRegions.map((region) => {
            return (
              <SelectGroup key={region}>
                <SelectLabel>{region}</SelectLabel>
                {memoizedTimezones
                  .filter((tz) => {
                    return tz.region === region;
                  })
                  .map((tz) => {
                    return (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label} ({tz.offset})
                      </SelectItem>
                    );
                  })}
              </SelectGroup>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
});

TimezoneSetting.displayName = 'TimezoneSetting';

const NoticeSetting = memo(() => {
  const { settings, updateSetting, isLoading } = useSettings();
  const options = useMemo(() => {
    return [
      { value: '0', label: 'No minimum' },
      { value: '1', label: '1 hour before' },
      { value: '24', label: '24 hours before' },
      { value: '48', label: '48 hours before' },
    ];
  }, []);

  return (
    <div className='space-y-2'>
      <Label>Minimum Scheduling Notice</Label>
      <Select
        value={settings.minimumNotice.toString()}
        onValueChange={(v) => {
          return updateSetting('minimumNotice', parseInt(v));
        }}
        disabled={isLoading}
      >
        <SelectTrigger className='w-[268px]'>
          <SelectValue placeholder='Select minimum notice' />
        </SelectTrigger>
        <SelectContent className='w-[268px]'>
          {options.map((option) => {
            return (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
});

NoticeSetting.displayName = 'NoticeSetting';

const BufferSetting = memo(() => {
  const { settings, updateSetting, isLoading } = useSettings();
  const options = useMemo(() => {
    return [
      { value: '0', label: 'No buffer' },
      { value: '5', label: '5 minutes' },
      { value: '10', label: '10 minutes' },
      { value: '15', label: '15 minutes' },
      { value: '30', label: '30 minutes' },
    ];
  }, []);

  return (
    <div className='space-y-2'>
      <Label>Buffer Time Between Meetings</Label>
      <Select
        value={settings.bufferTime.toString()}
        onValueChange={(v) => {
          return updateSetting('bufferTime', parseInt(v));
        }}
        disabled={isLoading}
      >
        <SelectTrigger className='w-[268px]'>
          <SelectValue placeholder='Select buffer time' />
        </SelectTrigger>
        <SelectContent className='w-[268px]'>
          {options.map((option) => {
            return (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>
    </div>
  );
});

BufferSetting.displayName = 'BufferSetting';

const CheckboxSettings = memo(() => {
  const { settings, updateSetting, isLoading } = useSettings();

  return (
    <div className='space-y-3'>
      <div className='flex items-center space-x-2'>
        <Checkbox
          id='prevent-overlap'
          checked={settings.preventOverlap}
          onCheckedChange={(checked) => {
            return updateSetting('preventOverlap', checked as boolean);
          }}
          disabled={isLoading}
        />
        <Label htmlFor='prevent-overlap' className='text-sm'>
          Prevent overlapping meetings
        </Label>
      </div>
      <div className='flex items-center space-x-2'>
        <Checkbox
          id='require-confirmation'
          checked={settings.requireConfirmation}
          onCheckedChange={(checked) => {
            return updateSetting('requireConfirmation', checked as boolean);
          }}
          disabled={isLoading}
        />
        <Label htmlFor='require-confirmation' className='text-sm'>
          Require confirmation
        </Label>
      </div>
    </div>
  );
});

CheckboxSettings.displayName = 'CheckboxSettings';

// Settings panel that provides context to its children
const SettingsPanel = memo(() => {
  return (
    <div className='w-[300px] flex flex-col space-y-6 border-l border-border p-6'>
      <div>
        <h3 className='mb-4 text-lg font-semibold'>Scheduling Settings</h3>
        <div className='space-y-6'>
          <TimezoneSetting />
          <NoticeSetting />
          <BufferSetting />
          <CheckboxSettings />
        </div>
      </div>
    </div>
  );
});

SettingsPanel.displayName = 'SettingsPanel';

// Google Calendar component
const GoogleCalendarSync = memo(
  ({
    isConnected,
    isLoading,
    error,
    onConnect,
    onDisconnect,
  }: {
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    onConnect: () => void;
    onDisconnect: () => void;
  }) => {
    return (
      <div className='space-y-4'>
        <p className='text-sm text-gray-500'>
          Connect your external calendars to automatically sync availability.
        </p>
        <Card>
          <CardHeader className='py-3'>
            <div className='flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2'>
              <div className='flex items-center gap-2 justify-center'>
                <FcGoogle className='w-5 h-5' />
                <CardTitle className='text-base'>Google Calendar</CardTitle>
                {isConnected && <FcCheckmark className='w-5 h-5 text-green-500' />}
              </div>
              {error && <p className='text-sm text-red-500'>{error}</p>}
              <Button
                variant='default'
                size='sm'
                className='bg-black hover:bg-black/90 text-white'
                onClick={isConnected ? onDisconnect : onConnect}
                disabled={isLoading}
              >
                {isLoading ? 'Connecting...' : isConnected ? 'Disconnect' : 'Connect'}
              </Button>
            </div>
          </CardHeader>
        </Card>
      </div>
    );
  },
);

GoogleCalendarSync.displayName = 'GoogleCalendarSync';

// Loading skeleton
const LoadingSkeleton = () => {
  return (
    <div className='animate-pulse space-y-4'>
      <div className='h-8 bg-gray-200 rounded w-1/4'></div>
      <div className='space-y-3'>
        <div className='h-4 bg-gray-200 rounded'></div>
        <div className='h-4 bg-gray-200 rounded w-5/6'></div>
      </div>
    </div>
  );
};

// Weekly Schedule tab content
const WeeklyScheduleContent = memo(() => {
  return (
    <div className='flex-1 space-y-6'>
      <div className='flex items-center justify-between'>
        <h3 className='text-sm font-medium'>Weekly Hours</h3>
      </div>
      <Suspense fallback={<LoadingSkeleton />}>
        <WeeklyAvailability />
      </Suspense>
    </div>
  );
});

WeeklyScheduleContent.displayName = 'WeeklyScheduleContent';

// Availability tab content
const AvailabilityContent = memo(() => {
  return (
    <div className='flex gap-8'>
      <WeeklyScheduleContent />
      <SettingsPanel />
    </div>
  );
});

AvailabilityContent.displayName = 'AvailabilityContent';

// Sync tab content
const SyncContent = memo(
  ({
    isConnected,
    isLoading,
    error,
    onConnect,
    onDisconnect,
  }: {
    isConnected: boolean;
    isLoading: boolean;
    error: string | null;
    onConnect: () => void;
    onDisconnect: () => void;
  }) => {
    return (
      <GoogleCalendarSync
        isConnected={isConnected}
        isLoading={isLoading}
        error={error}
        onConnect={onConnect}
        onDisconnect={onDisconnect}
      />
    );
  },
);

SyncContent.displayName = 'SyncContent';

// Dialog Content with tabs
const DialogTabs = memo(
  ({
    activeTab,
    setActiveTab,
    isConnected,
    isGoogleLoading,
    googleError,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
  }: {
    activeTab: string;
    setActiveTab: (tab: string) => void;
    isConnected: boolean;
    isGoogleLoading: boolean;
    googleError: string | null;
    connectGoogleCalendar: () => void;
    disconnectGoogleCalendar: () => void;
  }) => {
    return (
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className='w-full flex flex-wrap sm:flex-nowrap'>
          <TabsTrigger value='availability' className='flex-1'>
            Availability
          </TabsTrigger>
          <TabsTrigger value='sync' className='flex-1'>
            Calendar Sync
          </TabsTrigger>
        </TabsList>

        <TabsContent value='availability' className='mt-4'>
          <AvailabilityContent />
        </TabsContent>

        <TabsContent value='sync' className='mt-4'>
          <SyncContent
            isConnected={isConnected}
            isLoading={isGoogleLoading}
            error={googleError}
            onConnect={connectGoogleCalendar}
            onDisconnect={disconnectGoogleCalendar}
          />
        </TabsContent>
      </Tabs>
    );
  },
);

DialogTabs.displayName = 'DialogTabs';

// Main dialog component
export default function ManageAvailabilityDialog({
  open,
  onOpenChange,
  onSave,
}: ManageAvailabilityDialogProps) {
  const [activeTab, setActiveTab] = useState('availability');
  const [isInitialLoad, setIsInitialLoad] = useState(true);

  // Batch updates to avoid cascading re-renders
  const updateQueue = useRef<Record<string, any>>({});

  const {
    isConnected,
    isLoading: isGoogleLoading,
    error: googleError,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
  } = useGoogleCalendar();

  const {
    settings: originalSettings,
    isLoading: isSettingsLoading,
    fetchAvailability,
    updateAvailability,
  } = useAvailability();

  // Create a local copy of settings to avoid re-renders
  const [settings, setSettings] = useState(originalSettings);

  // Update local settings when original settings change
  useEffect(() => {
    if (Object.keys(originalSettings).length > 0) {
      setSettings(originalSettings);
    }
  }, [originalSettings]);

  // Handle initial data loading
  useEffect(() => {
    let isMounted = true;

    if (open) {
      const loadData = async () => {
        try {
          await fetchAvailability();
        } finally {
          if (isMounted) {
            setIsInitialLoad(false);
          }
        }
      };

      loadData();
    } else {
      setIsInitialLoad(true);
    }

    return () => {
      isMounted = false;
    };
  }, [open, fetchAvailability]);

  // Batch setting updates to reduce API calls
  const debouncedUpdate = useCallback(() => {
    if (Object.keys(updateQueue.current).length > 0) {
      updateAvailability(updateQueue.current);
      updateQueue.current = {};
    }
  }, [updateAvailability]);

  // Update a single setting locally and queue for API update
  const updateSetting = useCallback(
    (key: keyof AvailabilitySettings, value: AvailabilitySettings[keyof AvailabilitySettings]) => {
      setSettings((prev) => {
        return {
          ...prev,
          [key]: value,
        };
      });

      updateQueue.current[key] = value;

      // Debounce the API call
      setTimeout(debouncedUpdate, 500);
    },
    [debouncedUpdate],
  );

  // Settings context value
  const settingsContextValue = useMemo<SettingsContextType>(() => {
    return {
      settings,
      updateSetting,
      isLoading: isSettingsLoading,
    };
  }, [settings, updateSetting, isSettingsLoading]);

  // Memoize dialog content to prevent re-renders
  const dialogContent = useMemo(() => {
    return (
      <DialogContent className='sm:max-w-[900px] max-h-[90vh] overflow-y-auto'>
        <DialogHeader>
          <DialogTitle>Manage Availability Settings</DialogTitle>
          <DialogDescription>Set your weekly availability for meetings</DialogDescription>
        </DialogHeader>

        {isInitialLoad ? (
          <div className='py-4'>
            <LoadingSkeleton />
          </div>
        ) : (
          <div className='py-4'>
            <SettingsContext.Provider value={settingsContextValue}>
              <DialogTabs
                activeTab={activeTab}
                setActiveTab={setActiveTab}
                isConnected={isConnected}
                isGoogleLoading={isGoogleLoading}
                googleError={googleError}
                connectGoogleCalendar={connectGoogleCalendar}
                disconnectGoogleCalendar={disconnectGoogleCalendar}
              />
            </SettingsContext.Provider>
          </div>
        )}
      </DialogContent>
    );
  }, [
    activeTab,
    setActiveTab,
    isInitialLoad,
    isConnected,
    isGoogleLoading,
    googleError,
    connectGoogleCalendar,
    disconnectGoogleCalendar,
    settingsContextValue,
  ]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      {dialogContent}
    </Dialog>
  );
}
