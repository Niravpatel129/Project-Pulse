import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Textarea } from '@/components/ui/textarea';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useUpdateInvoiceSettings } from '@/hooks/useUpdateInvoiceSettings';
import { UploadCloud, X } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useRef, useState } from 'react';

interface BusinessSettingsProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function BusinessSettings({ open, onOpenChange }: BusinessSettingsProps) {
  const { data: invoiceSettings } = useInvoiceSettings();
  const updateInvoiceSettings = useUpdateInvoiceSettings();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Business settings state
  const [businessName, setBusinessName] = useState('');
  const [businessAddress, setBusinessAddress] = useState('');
  const [taxId, setTaxId] = useState('');
  const [showTaxId, setShowTaxId] = useState(false);
  const [logoPreview, setLogoPreview] = useState<string | null>(null);

  // Initialize business settings from invoice settings when available
  useEffect(() => {
    if (invoiceSettings) {
      setBusinessName(invoiceSettings.businessName || '');
      setBusinessAddress(invoiceSettings.businessAddress || '');
      setTaxId(invoiceSettings.taxId || '');
      setShowTaxId(invoiceSettings.showTaxId || false);
      setLogoPreview(invoiceSettings.logo || null);
    }
  }, [invoiceSettings]);

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemoveLogo = () => {
    setLogoPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSave = () => {
    updateInvoiceSettings.mutate({
      settings: {
        taxId,
        showTaxId,
        logo: logoPreview === null ? '' : logoPreview || invoiceSettings?.logo || '',
        businessName,
        businessAddress,
      },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[600px]'>
        <DialogHeader>
          <DialogTitle>Business Settings</DialogTitle>
          <DialogDescription>
            Update your business information that appears on invoices
          </DialogDescription>
        </DialogHeader>
        <div className='space-y-6 py-4'>
          <div>
            <Label>Company Name</Label>
            <Input
              value={businessName}
              className='w-full text-black dark:text-white'
              onChange={(e) => {
                return setBusinessName(e.target.value);
              }}
              placeholder='Your company name'
            />
          </div>
          <div>
            <Label>Business Address</Label>
            <Textarea
              value={businessAddress}
              onChange={(e) => {
                return setBusinessAddress(e.target.value);
              }}
              placeholder='Enter your business address'
              className='h-20'
            />
          </div>
          <div className='space-y-2'>
            <Label>Tax ID / VAT Number</Label>
            <div className='space-y-2'>
              <Input
                value={taxId}
                onChange={(e) => {
                  return setTaxId(e.target.value);
                }}
                className='w-full text-black dark:text-white'
                placeholder='Enter your tax ID'
              />
              <div className='flex items-center gap-2'>
                <Switch id='showTaxId' checked={showTaxId} onCheckedChange={setShowTaxId} />
                <Label htmlFor='showTaxId' className='text-sm text-muted-foreground'>
                  Show tax ID on invoices
                </Label>
              </div>
            </div>
          </div>
          <div className='space-y-2'>
            <Label>Business Logo</Label>
            <div className='flex flex-col gap-4'>
              {!logoPreview ? (
                <Button
                  type='button'
                  variant='outline'
                  onClick={() => {
                    return fileInputRef.current?.click();
                  }}
                  className='w-[200px]'
                >
                  Choose File
                </Button>
              ) : (
                <div className='relative w-32 h-32 border rounded-md overflow-hidden group p-2'>
                  <div className='relative w-full h-full p-2'>
                    <Image
                      src={logoPreview}
                      alt='Business logo preview'
                      fill
                      unoptimized
                      className='object-contain'
                      onError={(e) => {
                        console.error('Error loading image:', e);
                        // Optionally set a fallback image
                        // setLogoPreview('/path-to-fallback-image.png');
                      }}
                    />
                  </div>
                  <div className='absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2'>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={() => {
                        return fileInputRef.current?.click();
                      }}
                      className='h-8 w-8 bg-black/90 hover:bg-black text-white hover:text-white dark:text-white dark:hover:text-white'
                    >
                      <UploadCloud />
                    </Button>
                    <Button
                      type='button'
                      variant='ghost'
                      size='icon'
                      onClick={handleRemoveLogo}
                      className='h-8 w-8 bg-black/90 hover:bg-black text-white hover:text-white dark:text-white dark:hover:text-white'
                    >
                      <X className='h-4 w-4' />
                    </Button>
                  </div>
                </div>
              )}
              <Input
                ref={fileInputRef}
                type='file'
                accept='image/*'
                onChange={handleLogoChange}
                className='hidden'
              />
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button
            variant='outline'
            onClick={() => {
              return onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
