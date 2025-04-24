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

// Password form interface
export interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export function useProfile() {
  const { user, reloadAuth } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

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

  // Password form state
  const [passwordForm, setPasswordForm] = useState<PasswordForm>({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

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

  // Handle avatar file upload
  const handleAvatarUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const validImageTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!validImageTypes.includes(file.type)) {
      toast({
        title: 'Invalid file type',
        description: 'Please upload a JPG, PNG, GIF, or WebP image.',
        variant: 'destructive',
      });
      return;
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast({
        title: 'File too large',
        description: 'Please upload an image smaller than 5MB.',
        variant: 'destructive',
      });
      return;
    }

    try {
      setIsUploadingAvatar(true);

      // Create form data for upload
      const formData = new FormData();
      formData.append('avatar', file);

      // Upload avatar
      const response = await newRequest.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Update avatar in state
      const { avatarUrl } = response.data.data;

      // Update local form state
      setFormData((prev) => {
        return {
          ...prev,
          avatar: avatarUrl,
        };
      });

      // Reload user data from the server to update AuthContext
      await reloadAuth();

      toast({
        title: 'Avatar updated',
        description: 'Your profile picture has been updated successfully.',
      });
    } catch (error) {
      console.error('Error uploading avatar:', error);
      toast({
        title: 'Upload failed',
        description: 'There was an error uploading your avatar. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setIsUploadingAvatar(false);
    }
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

  // Handle password form input changes
  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { id, value } = e.target;
    setPasswordForm((prev) => {
      return {
        ...prev,
        [id]: value,
      };
    });

    // Clear errors when user starts typing
    if (passwordError) {
      setPasswordError(null);
    }
  };

  // Validate password form
  const validatePasswordForm = (): boolean => {
    if (!passwordForm.currentPassword) {
      setPasswordError('Current password is required');
      return false;
    }

    if (!passwordForm.newPassword) {
      setPasswordError('New password is required');
      return false;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long');
      return false;
    }

    if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      setPasswordError('New passwords do not match');
      return false;
    }

    return true;
  };

  // Update password
  const updatePassword = async () => {
    // Validate form first
    if (!validatePasswordForm()) {
      return;
    }

    try {
      setIsUpdatingPassword(true);

      // Call API to update password
      await newRequest.put('/auth/update-password', {
        currentPassword: passwordForm.currentPassword,
        newPassword: passwordForm.newPassword,
      });

      // Reset form
      setPasswordForm({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });

      toast({
        title: 'Password updated',
        description: 'Your password has been updated successfully.',
      });
    } catch (error: any) {
      console.error('Error updating password:', error);

      // Handle different types of errors
      if (error.response?.status === 401) {
        setPasswordError('Current password is incorrect');
      } else {
        setPasswordError('Failed to update password. Please try again.');
      }

      toast({
        title: 'Password update failed',
        description: error.response?.data?.message || 'There was an error updating your password.',
        variant: 'destructive',
      });
    } finally {
      setIsUpdatingPassword(false);
    }
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

        // Reload user data after successful update
        await reloadAuth();

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
    isUploadingAvatar,
    isUpdatingPassword,
    passwordError,
    passwordForm,
    handleInputChange,
    handleNotificationChange,
    handleAvatarUpload,
    handlePasswordChange,
    updatePassword,
    saveProfile,
    getInitials,
  };
}
