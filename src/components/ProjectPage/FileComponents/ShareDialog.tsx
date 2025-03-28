import { Button } from '@/components/ui/button';
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { toast } from '@/components/ui/use-toast';
import { useDebounce } from '@/hooks/useDebounce';
import { updateProjectSharingSettings } from '@/lib/api/projects';
import { Check, Copy, ExternalLink, Loader2, Mail } from 'lucide-react';
import { useCallback, useEffect, useState } from 'react';

interface SharingSettings {
  accessType: 'signup_required' | 'email_restricted' | 'public';
  requirePassword: boolean;
  password: string;
  customMessage: string;
  expirationDays: string;
  allowedEmails: string[];
}

interface ShareDialogProps {
  projectId: string;
  initialSettings: SharingSettings;
  onClose: () => void;
  onSendEmail: () => void;
}

export function ShareDialog({
  projectId,
  initialSettings,
  onClose,
  onSendEmail,
}: ShareDialogProps) {
  const [settings, setSettings] = useState<SharingSettings>({
    accessType: initialSettings.accessType || 'signup_required',
    requirePassword: initialSettings.requirePassword || false,
    password: initialSettings.password || '',
    customMessage: initialSettings.customMessage || '',
    expirationDays: initialSettings.expirationDays || '30',
    allowedEmails: initialSettings.allowedEmails || [],
  });
  const [isSaving, setIsSaving] = useState(false);
  const [showSavedIndicator, setShowSavedIndicator] = useState(false);
  const [showCopiedIndicator, setShowCopiedIndicator] = useState(false);
  const [validationErrors, setValidationErrors] = useState<{
    accessType?: string;
    passwordProtected?: string;
  }>({});
  const [portalUrl, setPortalUrl] = useState<string>('');

  // Set portal URL after component mounts to avoid SSR issues with window
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const currentUrl = window.location.origin;
      setPortalUrl(`${currentUrl}/portal/${projectId}`);
    }
  }, [projectId]);

  // Handle copy to clipboard
  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(portalUrl);
      setShowCopiedIndicator(true);
      setTimeout(() => {
        return setShowCopiedIndicator(false);
      }, 2000);
      toast({
        title: 'Link copied',
        description: 'Portal URL has been copied to clipboard',
      });
    } catch (error) {
      toast({
        title: 'Error',
        description: 'Failed to copy link to clipboard',
        variant: 'destructive',
      });
    }
  };

  // Debounce the settings changes to avoid too many API calls
  const debouncedSettings = useDebounce(settings, 1000);

  const validateSettings = useCallback(() => {
    const errors: { accessType?: string; passwordProtected?: string } = {};

    if (!settings.accessType) {
      errors.accessType = 'Access type is required';
    }

    if (settings.requirePassword && !settings.password) {
      errors.passwordProtected = 'Password is required when password protection is enabled';
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [settings.accessType, settings.requirePassword, settings.password]);

  useEffect(() => {
    const saveSettings = async () => {
      if (!validateSettings()) return;

      setIsSaving(true);
      try {
        await updateProjectSharingSettings(projectId, debouncedSettings);
        toast({
          title: 'Success',
          description: 'Sharing settings updated successfully',
        });
      } catch (error) {
        toast({
          title: 'Error',
          description: 'Failed to save sharing settings',
          variant: 'destructive',
        });
      } finally {
        setIsSaving(false);
      }
    };

    saveSettings();
  }, [debouncedSettings, projectId, validateSettings]);

  const handleSettingsChange = (key: keyof SharingSettings, value: string | boolean | string[]) => {
    setSettings((prev) => {
      return {
        ...prev,
        [key]: value,
      };
    });

    // Clear validation errors when fields are updated
    if (key === 'accessType' && validationErrors.accessType) {
      setValidationErrors((prev) => {
        return { ...prev, accessType: undefined };
      });
    }
    if (key === 'requirePassword' && validationErrors.passwordProtected) {
      setValidationErrors((prev) => {
        return { ...prev, passwordProtected: undefined };
      });
    }
  };

  // Handle opening portal in new tab
  const handleOpenPortal = () => {
    if (typeof window !== 'undefined' && portalUrl) {
      window.open(portalUrl, '_blank');
    }
  };

  return (
    <DialogContent className='sm:max-w-[500px]'>
      <DialogHeader>
        <DialogTitle>Client Portal Access</DialogTitle>
        <DialogDescription>
          Configure portal settings and send your client access credentials
        </DialogDescription>
      </DialogHeader>

      <div className='space-y-4 py-2'>
        <div className='space-y-3'>
          {/* Portal URL Section */}
          <div className='space-y-1.5'>
            <Label>Portal URL</Label>
            <div className='flex items-center gap-2'>
              <Input
                value={portalUrl}
                readOnly
                className='bg-gray-50 font-mono text-sm'
                onClick={(e) => {
                  return (e.target as HTMLInputElement).select();
                }}
              />
              <Button variant='outline' size='icon' onClick={handleCopyUrl} className='shrink-0'>
                {showCopiedIndicator ? (
                  <Check className='h-4 w-4 text-green-500' />
                ) : (
                  <Copy className='h-4 w-4' />
                )}
              </Button>
              <Button variant='outline' size='icon' onClick={handleOpenPortal} className='shrink-0'>
                <ExternalLink className='h-4 w-4' />
              </Button>
            </div>
            <p className='text-xs text-muted-foreground'>
              Your client can access the project portal using this URL
            </p>
          </div>

          <div className='space-y-1.5'>
            <Label>
              Access Type <span className='text-red-500'>*</span>
            </Label>
            <Select
              value={settings.accessType}
              onValueChange={(value) => {
                return handleSettingsChange('accessType', value);
              }}
            >
              <SelectTrigger className={validationErrors.accessType ? 'border-red-500' : ''}>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value='public'>Public Link (Anyone with link)</SelectItem>
                <SelectItem value='signup_required'>Require Account Signup</SelectItem>
                <SelectItem value='email_restricted'>Email Addresses Only</SelectItem>
              </SelectContent>
            </Select>
            {validationErrors.accessType && (
              <p className='text-xs text-red-500'>{validationErrors.accessType}</p>
            )}
          </div>

          <div className='flex items-center justify-between'>
            <div className='space-y-0.5'>
              <Label>
                Password Protection <span className='text-red-500'>*</span>
              </Label>
              <p className='text-xs text-muted-foreground'>
                Require a password to access the portal
              </p>
            </div>
            <Switch
              checked={settings.requirePassword}
              onCheckedChange={(checked) => {
                return handleSettingsChange('requirePassword', checked);
              }}
            />
          </div>

          {settings.requirePassword && (
            <div className='space-y-1.5'>
              <Label htmlFor='portal-password'>
                Portal Password <span className='text-red-500'>*</span>
              </Label>
              <Input
                id='portal-password'
                type='password'
                placeholder='Enter a secure password'
                value={settings.password}
                onChange={(e) => {
                  return handleSettingsChange('password', e.target.value);
                }}
                className={validationErrors.passwordProtected ? 'border-red-500' : ''}
              />
              {validationErrors.passwordProtected && (
                <p className='text-xs text-red-500'>{validationErrors.passwordProtected}</p>
              )}
            </div>
          )}
        </div>
      </div>

      <DialogFooter className='mt-4'>
        <div className='flex items-center gap-2 text-sm text-muted-foreground'>
          {isSaving && (
            <>
              <Loader2 className='h-4 w-4 animate-spin' />
              Saving...
            </>
          )}
          {showSavedIndicator && (
            <>
              <Check className='h-4 w-4 text-green-500' />
              Settings saved
            </>
          )}
        </div>
        <div className='flex gap-2'>
          <Button onClick={onSendEmail}>
            <Mail className='mr-2 h-4 w-4' />
            Send Portal Access
          </Button>
        </div>
      </DialogFooter>
    </DialogContent>
  );
}
