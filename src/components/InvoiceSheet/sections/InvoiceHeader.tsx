import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SeamlessInput } from '@/components/ui/seamless-input';
import { useInvoiceSettings } from '@/hooks/useInvoiceSettings';
import { useUpdateInvoiceSettings } from '@/hooks/useUpdateInvoiceSettings';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { X } from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import { toast } from 'sonner';

interface InvoiceHeaderProps {
  dateFormat?: string;
  invoiceNumber: string;
  onInvoiceNumberChange: (value: string) => void;
  issueDate: Date;
  onIssueDateChange: (date: Date) => void;
  dueDate: Date;
  onDueDateChange: (date: Date) => void;
  invoiceTitle: string;
  onInvoiceTitleChange: (value: string) => void;
}

export default function InvoiceHeader({
  dateFormat = 'MM/dd/yyyy',
  invoiceNumber,
  onInvoiceNumberChange,
  issueDate,
  onIssueDateChange,
  dueDate,
  onDueDateChange,
  invoiceTitle,
  onInvoiceTitleChange,
}: InvoiceHeaderProps) {
  const { data: invoiceSettings } = useInvoiceSettings();
  const updateInvoiceSettings = useUpdateInvoiceSettings();
  const [logoPreview, setLogoPreview] = useState<string | null>(invoiceSettings?.logo || null);
  const [issueDateOpen, setIssueDateOpen] = useState(false);
  const [dueDateOpen, setDueDateOpen] = useState(false);

  const formatDate = (date: Date) => {
    // Convert from MM/DD/YYYY or DD/MM/YYYY to date-fns format
    const formatMap: Record<string, string> = {
      'MM/DD/YYYY': 'MM/dd/yyyy',
      'DD/MM/YYYY': 'dd/MM/yyyy',
    };
    return format(date, formatMap[dateFormat] || 'MM/dd/yyyy');
  };

  const handleLogoChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        const base64String = reader.result as string;
        setLogoPreview(base64String);
        updateInvoiceSettings.mutate(
          {
            settings: {
              logo: base64String,
            },
          },
          {
            onSuccess: () => {
              toast.success('Logo updated successfully');
            },
            onError: () => {
              toast.error('Failed to update logo');
              setLogoPreview(invoiceSettings?.logo || null);
            },
          },
        );
      };
      reader.readAsDataURL(file);
    }
  };

  const handleDeleteLogo = () => {
    setLogoPreview(null);
    updateInvoiceSettings.mutate(
      {
        settings: {
          logo: '',
        },
      },
      {
        onSuccess: () => {
          toast.success('Logo removed successfully');
        },
        onError: () => {
          toast.error('Failed to remove logo');
          setLogoPreview(invoiceSettings?.logo || null);
        },
      },
    );
  };

  return (
    <div>
      <div className='flex justify-between mt-2'>
        <>
          <div>
            <div className='relative mb-1'>
              <SeamlessInput
                className='!text-[21px] font-medium'
                value={invoiceTitle}
                onChange={(e) => {
                  return onInvoiceTitleChange(e.target.value);
                }}
                name='invoice_title'
              />
            </div>
            <div className='flex flex-col gap-0.5'>
              <div className=''>
                <div className='flex space-x-1 items-center'>
                  <div className='flex items-center flex-shrink-0'>
                    <span
                      className='text-xs text-[#878787] min-w-10 font-mono outline-none truncate'
                      id='template.invoice_no_label'
                    >
                      Invoice No
                    </span>
                    <span className='text-xs text-[#878787] font-mono flex-shrink-0'>:</span>
                  </div>
                  <div className='relative'>
                    <SeamlessInput
                      className='!text-[11px] !h-5'
                      value={invoiceNumber}
                      onChange={(e) => {
                        return onInvoiceNumberChange(e.target.value);
                      }}
                      name='invoice_number'
                    />
                  </div>
                </div>
              </div>
              <div className='mb-[2px]'>
                <div className='flex space-x-1 items-center'>
                  <div className='flex items-center'>
                    <span
                      className='text-xs text-[#878787] min-w-10 font-mono outline-none'
                      id='template.issue_date_label'
                    >
                      Issue Date
                    </span>
                    <span className='text-xs text-[#878787] font-mono'>:</span>
                  </div>
                  <div className=''>
                    <Popover modal open={issueDateOpen} onOpenChange={setIssueDateOpen}>
                      <PopoverTrigger asChild>
                        <Button
                          variant='ghost'
                          className={cn(
                            'text-primary text-xs font-mono whitespace-nowrap flex h-auto p-0 hover:bg-transparent',
                          )}
                        >
                          <span className='flex overflow-hidden shadow-none focus:border-none active:border-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 p-0 !text-[11px] border-none bg-transparent'>
                            {formatDate(issueDate)}
                          </span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-auto p-0' align='start'>
                        <Calendar
                          mode='single'
                          selected={issueDate}
                          onSelect={(date) => {
                            if (date) {
                              onIssueDateChange(date);
                              setIssueDateOpen(false);
                            }
                          }}
                          initialFocus
                        />
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </div>
              <div className=''>
                <div className='flex space-x-1 items-center'>
                  <div className='flex items-center'>
                    <span
                      className='text-xs text-[#878787] min-w-10 font-mono outline-none'
                      id='template.due_date_label'
                    >
                      Due Date
                    </span>
                    <span className='text-xs text-[#878787] font-mono'>:</span>
                  </div>
                  <Popover modal open={dueDateOpen} onOpenChange={setDueDateOpen}>
                    <PopoverTrigger asChild>
                      <Button
                        variant='ghost'
                        className={cn(
                          'text-primary text-xs font-mono whitespace-nowrap flex h-auto p-0 hover:bg-transparent',
                        )}
                      >
                        <span className='flex overflow-hidden shadow-none focus:border-none active:border-none focus-visible:ring-0 focus-visible:ring-offset-0 border-0 p-0 !text-[11px] border-none bg-transparent'>
                          {formatDate(dueDate)}
                        </span>
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className='w-auto p-0' align='start'>
                      <Calendar
                        mode='single'
                        selected={dueDate}
                        onSelect={(date) => {
                          if (date) {
                            onDueDateChange(date);
                            setDueDateOpen(false);
                          }
                        }}
                        initialFocus
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>
        </>
        <div className='relative group'>
          <label htmlFor='logo-upload' className='block h-full'>
            {logoPreview ? (
              <div className='h-[80px] w-[80px] relative group/logo'>
                <Image
                  src={logoPreview}
                  alt='Company Logo'
                  fill
                  className='object-contain'
                  unoptimized
                />
                <div className='absolute inset-0 bg-black/40 opacity-0 group-hover/logo:opacity-100 transition-opacity flex items-center justify-center'>
                  <Button
                    type='button'
                    variant='ghost'
                    size='icon'
                    onClick={(e) => {
                      e.preventDefault();
                      handleDeleteLogo();
                    }}
                    className='h-8 w-8 bg-black/90 hover:bg-black text-white hover:text-white'
                  >
                    <X className='h-4 w-4' />
                  </Button>
                </div>
              </div>
            ) : (
              <div className='h-[80px] w-[80px] bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)] hover:cursor-pointer' />
            )}
          </label>
          <input
            id='logo-upload'
            accept='image/jpeg,image/jpg,image/png'
            className='hidden'
            type='file'
            onChange={handleLogoChange}
          />
        </div>
      </div>
    </div>
  );
}
