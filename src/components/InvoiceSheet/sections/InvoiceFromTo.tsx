import { AddCustomerDialog } from '@/app/[workspace]/dashboard/customers/components/AddCustomerDialog';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from '@/components/ui/command';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { SeamlessInput } from '@/components/ui/seamless-input';
import { Textarea } from '@/components/ui/textarea';
import { useClients } from '@/hooks/useClients';
import { Plus } from 'lucide-react';
import { useEffect, useRef, useState } from 'react';
import { FiEdit } from 'react-icons/fi';

interface InvoiceFromToProps {
  onCustomerSelect: (customerId: string) => void;
  onFromAddressChange: (address: string) => void;
  onToAddressChange: (address: string) => void;
  fromAddress: string;
  selectedCustomer?: string;
  toAddress?: string;
}

const InvoiceFromTo = ({
  onCustomerSelect,
  onFromAddressChange,
  onToAddressChange,
  fromAddress,
  selectedCustomer,
  toAddress,
}: InvoiceFromToProps) => {
  const [isFocused, setIsFocused] = useState(false);
  const [content, setContent] = useState(fromAddress);
  const [open, setOpen] = useState(false);
  const [isNewCustomerDialogOpen, setIsNewCustomerDialogOpen] = useState(false);
  const [editingCustomer, setEditingCustomer] = useState<any>(null);
  const [toContent, setToContent] = useState(toAddress || '');
  const [isToFocused, setIsToFocused] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const toTextareaRef = useRef<HTMLTextAreaElement>(null);
  const { clients } = useClients();

  useEffect(() => {
    if (toAddress) {
      setToContent(toAddress);
    }
  }, [toAddress]);

  useEffect(() => {
    if (fromAddress) {
      setContent(fromAddress);
    }
  }, [fromAddress]);

  const adjustHeight = (ref: React.RefObject<HTMLTextAreaElement>) => {
    const textarea = ref.current;
    if (textarea) {
      textarea.style.height = 'auto';
      textarea.style.height = `${textarea.scrollHeight}px`;
    }
  };

  useEffect(() => {
    adjustHeight(textareaRef);
  }, [content]);

  useEffect(() => {
    adjustHeight(toTextareaRef);
  }, [toContent]);

  const handleEditCustomer = (e: React.MouseEvent, client: any) => {
    console.log('🚀 client 12:', client);
    e.stopPropagation();
    setEditingCustomer(client);
    setIsNewCustomerDialogOpen(true);
    setOpen(false);
  };

  return (
    <div className='flex justify-between mt-8 gap-4'>
      <div className='flex-1'>
        <div className='mb-2'>
          <span className='text-[11px] text-[#878787] font-mono'>From</span>
        </div>
        <div className='relative'>
          <Textarea
            ref={textareaRef}
            className={`!text-[11px] min-h-[100px] resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 overflow-hidden ${
              !isFocused && !content
                ? 'bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)] p-0'
                : 'p-0 h-auto'
            }`}
            value={content}
            name='from_address'
            onFocus={() => {
              return setIsFocused(true);
            }}
            onBlur={() => {
              return setIsFocused(false);
            }}
            onChange={(e) => {
              setContent(e.target.value);
              onFromAddressChange(e.target.value);
              adjustHeight(textareaRef);
            }}
          />
        </div>
      </div>
      <div className='flex-1'>
        <div className='mb-2'>
          <span className='text-[11px] text-[#878787] font-mono'>To</span>
        </div>
        <div className='space-y-0'>
          {!selectedCustomer && !isToFocused ? (
            <Popover open={open} onOpenChange={setOpen} modal>
              <PopoverTrigger asChild>
                <div className='relative'>
                  <SeamlessInput
                    className='!text-[11px] cursor-pointer'
                    value='Select customer...'
                    readOnly
                    onClick={() => {
                      return setOpen(true);
                    }}
                  />
                </div>
              </PopoverTrigger>
              <PopoverContent className='w-full p-0' align='start'>
                <Command>
                  <CommandInput placeholder='Search customers...' className='h-9' />
                  <CommandEmpty>No customers found.</CommandEmpty>
                  <CommandGroup className='max-h-[300px] overflow-auto'>
                    {clients.map((client) => {
                      return (
                        <CommandItem
                          key={client._id}
                          value={client._id}
                          onSelect={() => {
                            onCustomerSelect(client._id);
                            setToContent(`${client.user.name}\n${client.user.email}`);
                            onToAddressChange(`${client.user.name}\n${client.user.email}`);
                            setOpen(false);
                          }}
                          className='!text-[11px] group'
                        >
                          <div className='flex items-center justify-between w-full'>
                            <div
                              className={`flex items-center max-w-[150px] ${
                                selectedCustomer === client._id ? 'font-bold' : ''
                              }`}
                            >
                              {client.user.name}
                            </div>
                            <button
                              onClick={(e) => {
                                return handleEditCustomer(e, client);
                              }}
                              className='text-[#333333] dark:text-[#fff] hover:opacity-80 transition-opacity opacity-0 group-hover:opacity-100'
                            >
                              <FiEdit className='h-3 w-3' />
                            </button>
                          </div>
                        </CommandItem>
                      );
                    })}
                  </CommandGroup>
                  <CommandItem
                    value='create-customer'
                    onSelect={() => {
                      setIsNewCustomerDialogOpen(true);
                      setOpen(false);
                    }}
                    className='!text-[11px] text-[#0891B2] dark:text-[#8b5df8]'
                  >
                    <Plus className='mr-2 h-4 w-4' />
                    Create Customer
                  </CommandItem>
                </Command>
              </PopoverContent>
            </Popover>
          ) : (
            <div className='relative group'>
              <Textarea
                ref={toTextareaRef}
                className={`!text-[11px] min-h-[100px] resize-none border-0 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0 overflow-hidden ${
                  !isToFocused && !toContent
                    ? 'bg-[repeating-linear-gradient(-60deg,#DBDBDB,#DBDBDB_1px,transparent_1px,transparent_5px)] dark:bg-[repeating-linear-gradient(-60deg,#2C2C2C,#2C2C2C_1px,transparent_1px,transparent_5px)] p-0'
                    : 'p-0 h-auto'
                }`}
                value={toContent}
                onFocus={() => {
                  return setIsToFocused(true);
                }}
                onBlur={() => {
                  return setIsToFocused(false);
                }}
                onChange={(e) => {
                  const newValue = e.target.value;
                  setToContent(newValue);
                  onToAddressChange(newValue);
                  adjustHeight(toTextareaRef);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Backspace' && toContent === '') {
                    onCustomerSelect('');
                  }
                }}
                name='to_address'
              />
              <button
                onClick={() => {
                  setToContent('');
                  onCustomerSelect('');
                  onToAddressChange('');
                }}
                className='absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition-opacity text-[#333333] dark:text-[#fff] hover:opacity-80'
              >
                <svg
                  width='12'
                  height='12'
                  viewBox='0 0 12 12'
                  fill='none'
                  xmlns='http://www.w3.org/2000/svg'
                >
                  <path
                    d='M9 3L3 9M3 3L9 9'
                    stroke='currentColor'
                    strokeWidth='1'
                    strokeLinecap='round'
                    strokeLinejoin='round'
                  />
                </svg>
              </button>
            </div>
          )}
        </div>
      </div>
      <AddCustomerDialog
        open={isNewCustomerDialogOpen}
        onOpenChange={setIsNewCustomerDialogOpen}
        initialData={editingCustomer}
        onEdit={(client) => {
          if (editingCustomer) {
            // Handle the edited customer
            onCustomerSelect(client._id);
            setEditingCustomer(null);
          } else {
            // Handle the newly created customer
            onCustomerSelect(client._id);
          }
        }}
      />
    </div>
  );
};

export default InvoiceFromTo;
