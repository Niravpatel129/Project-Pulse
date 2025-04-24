import { toast } from '@/components/ui/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { newRequest } from '@/utils/newRequest';
import { useEffect, useState } from 'react';

// Profile data interface
export interface UserProfile {
  name: string;
  jobTitle: string;
  email: string;
  phone?: string;
  bio?: string;
  avatar: string;
  notificationPreferences?: Record<string, boolean>;
}

// Default notification preferences
const DEFAULT_NOTIFICATION_PREFERENCES = [
  {
    id: 'email-projects',
    label: 'Project updates',
    description: 'Get notified about new milestones and project changes',
    enabled: true,
  },
  {
    id: 'email-tasks',
    label: 'Task assignments',
    description: "Receive emails when you're assigned to a task",
    enabled: true,
  },
  {
    id: 'email-calendar',
    label: 'Calendar events',
    description: 'Daily summary of upcoming events and meetings',
    enabled: false,
  },
  {
    id: 'email-billing',
    label: 'Billing updates',
    description: 'Get invoices and payment notifications',
    enabled: true,
  },
];

export interface NotificationPreference {
  id: string;
  label: string;
  description: string;
  enabled: boolean;
}

export function useProfile() {
  const { user } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [formData, setFormData] = useState<UserProfile>({
    name: '',
    jobTitle: '',
    email: '',
    phone: '',
    bio: '',
    avatar: '',
  });

  // Notification preferences state
  const [notificationPreferences, setNotificationPreferences] = useState<NotificationPreference[]>(
    DEFAULT_NOTIFICATION_PREFERENCES,
  );

  // Fetch user profile data
  const fetchUserProfile = async () => {
    if (!user) return;

    try {
      setIsLoading(true);
      // Use the real API to fetch user profile
      const response = await newRequest.get('/users/profile');
      const profileData = response.data.data;

      // Update form data with fetched profile data
      setFormData({
        name: profileData.name || user.name || '',
        jobTitle: profileData.jobTitle || '', // Professional job title
        email: profileData.email || user.email || '',
        phone: profileData.phone || '',
        bio: profileData.bio || '',
        avatar: profileData.avatar || user.avatar || '',
      });

      // Update notification preferences if available
      if (profileData.notificationPreferences) {
        setNotificationPreferences((prev) => {
          return prev.map((pref) => {
            return {
              ...pref,
              enabled: profileData.notificationPreferences[pref.id] ?? pref.enabled,
            };
          });
        });
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
      // Fallback to basic user data if API fails
      setFormData({
        name: user.name || '',
        jobTitle: '',
        email: user.email || '',
        phone: '',
        bio: '',
        avatar: user.avatar || '',
      });

      // Try to load preferences from localStorage as fallback
      loadPreferencesFromLocalStorage();
    } finally {
      setIsLoading(false);
    }
  };

  // Load preferences from localStorage
  const loadPreferencesFromLocalStorage = () => {
    const savedPrefs = localStorage.getItem('notificationPreferences');
    if (savedPrefs) {
      try {
        const parsedPrefs = JSON.parse(savedPrefs);
        setNotificationPreferences((prev) => {
          return prev.map((pref) => {
            return {
              ...pref,
              enabled: parsedPrefs[pref.id] ?? pref.enabled,
            };
          });
        });
      } catch (e) {
        console.error('Failed to parse notification preferences:', e);
      }
    }
  };

  // Update form data when user data changes
  useEffect(() => {
    if (user) {
      fetchUserProfile();
    }
  }, [user]);

  // Handle input changes
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { id, value } = e.target;
    setFormData((prev) => {
      return {
        ...prev,
        [id]: value,
      };
    });
  };

  // Handle notification preference changes
  const handleNotificationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, checked } = e.target;
    setNotificationPreferences((prev) => {
      return prev.map((pref) => {
        return pref.id === id ? { ...pref, enabled: checked } : pref;
      });
    });
  };

  // Handle form submission
  const saveProfile = async () => {
    try {
      setIsLoading(true);

      // Convert notification preferences to object format
      const notificationPrefsObj = notificationPreferences.reduce((obj, pref) => {
        obj[pref.id] = pref.enabled;
        return obj;
      }, {} as Record<string, boolean>);

      // Save to API
      try {
        // Send profile data to the API
        await newRequest.put('/users/profile', {
          ...formData,
          notificationPreferences: notificationPrefsObj,
        });

        // Save notification preferences in localStorage as backup
        localStorage.setItem('notificationPreferences', JSON.stringify(notificationPrefsObj));

        toast({
          title: 'Profile updated',
          description: 'Your profile has been successfully updated.',
        });
      } catch (error) {
        console.error('API Error updating profile:', error);
        // Fallback to localStorage only if API fails
        localStorage.setItem('notificationPreferences', JSON.stringify(notificationPrefsObj));

        toast({
          title: 'Profile partially updated',
          description: 'Your preferences were saved locally, but server update failed.',
          variant: 'destructive',
        });
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        title: 'Update failed',
        description: 'There was an error updating your profile. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Calculate initials for avatar fallback
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => {
        return n[0];
      })
      .join('');
  };

  return {
    formData,
    notificationPreferences,
    isLoading,
    handleInputChange,
    handleNotificationChange,
    saveProfile,
    getInitials,
  };
}
