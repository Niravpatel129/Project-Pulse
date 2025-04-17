import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { getFileIcon } from '@/utils/fileIcons';
import { Paperclip } from 'lucide-react';
import Image from 'next/image';
import { useEffect, useLayoutEffect, useRef, useState } from 'react';

interface FieldItem {
  id: string;
  value: any;
  label: string;
  type: string;
}

interface RelationItem {
  rowId: string;
  fields: FieldItem[];
}

interface RelationField {
  _id: string;
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  selectOptions?: { label: string; value: string }[];
  popoverOptions?: RelationItem[];
  // New properties for relation display
  relationConfig?: {
    displayFields: Array<{
      key: string;
      label: string;
    }>;
    data?: any[];
  };
}

interface RelationFieldRendererProps {
  field: RelationField;
  value: any;
  onChange: (value: any) => void;
}

export default function RelationFieldRenderer({
  field,
  value,
  onChange,
}: RelationFieldRendererProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const [buttonWidth, setButtonWidth] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState('');

  // Measure button width
  useLayoutEffect(() => {
    if (buttonRef.current) {
      setButtonWidth(buttonRef.current.offsetWidth);
    }
  }, []);

  // Update width on window resize
  useEffect(() => {
    const updateWidth = () => {
      if (buttonRef.current) {
        setButtonWidth(buttonRef.current.offsetWidth);
      }
    };

    window.addEventListener('resize', updateWidth);
    return () => {
      return window.removeEventListener('resize', updateWidth);
    };
  }, []);

  // Check if we're on mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    // Initial check
    checkIfMobile();

    // Add event listener for window resize
    window.addEventListener('resize', checkIfMobile);

    // Cleanup
    return () => {
      return window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  // Use the popoverOptions if provided, otherwise use empty array
  const relationItems: RelationItem[] = field.popoverOptions || [];

  // Find the selected item by looking for a match in the fields array
  const selectedItem = relationItems.find((item) => {
    return item.rowId === value;
  });

  // Get the display value from the first field if available
  const getDisplayValue = (item: RelationItem) => {
    return item.fields.length > 0 ? `${item.fields[0].label}: ${item.fields[0].value}` : '';
  };

  // Enhanced search function that searches across all fields and values
  const filterItems = (items: RelationItem[], query: string) => {
    if (!query.trim()) return items;

    const lowercaseQuery = query.toLowerCase().trim();

    return items.filter((item) => {
      // Search through all fields
      return item.fields.some((field) => {
        // Check field label
        if (field.label.toLowerCase().includes(lowercaseQuery)) return true;

        // Check field value - handle different types of values
        if (field.value !== null && field.value !== undefined) {
          // Handle string values
          if (
            typeof field.value === 'string' &&
            field.value.toLowerCase().includes(lowercaseQuery)
          ) {
            return true;
          }

          // Handle number values
          if (typeof field.value === 'number' && field.value.toString().includes(lowercaseQuery)) {
            return true;
          }

          // Handle array values (like attachments)
          if (Array.isArray(field.value) && field.value.length > 0) {
            return field.value.some((val) => {
              if (val.name && val.name.toLowerCase().includes(lowercaseQuery)) return true;
              if (val.url && val.url.toLowerCase().includes(lowercaseQuery)) return true;
              return false;
            });
          }

          // Handle object values
          if (typeof field.value === 'object') {
            return Object.values(field.value).some((val) => {
              return typeof val === 'string' && val.toLowerCase().includes(lowercaseQuery);
            });
          }
        }

        return false;
      });
    });
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen} modal>
      <PopoverTrigger asChild>
        <Button
          ref={buttonRef}
          variant='outline'
          className='w-full justify-start text-left h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
        >
          {selectedItem ? getDisplayValue(selectedItem) : `Select ${field.name}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='p-0'
        align='start'
        side={isMobile ? 'bottom' : undefined}
        sideOffset={isMobile ? 4 : 8}
        style={{
          width: buttonWidth > 0 ? `${buttonWidth}px` : isMobile ? 'calc(100vw-32px)' : '400px',
        }}
      >
        {/* Search bar */}
        <div className='p-3'>
          <Input
            className='outline-none focus-visible:ring-0'
            placeholder='Search across all fields'
            value={searchQuery}
            onChange={(e) => {
              return setSearchQuery(e.target.value);
            }}
          />
        </div>
        {/* Scrollable content with relation items */}
        <div className={`${isMobile ? 'max-h-[50vh]' : 'max-h-[300px]'} overflow-y-auto`}>
          {filterItems(relationItems, searchQuery).map((item) => {
            return (
              <div
                key={item.rowId}
                className={`flex flex-row w-full p-3 hover:bg-gray-50 cursor-pointer ${
                  selectedItem?.rowId === item.rowId ? 'bg-gray-50' : ''
                }`}
                onClick={() => {
                  // Use the rowId as the selected value
                  onChange(item.rowId);
                  setIsOpen(false);
                }}
              >
                <div
                  className={`flex ${isMobile ? 'flex-col' : 'flex-row'} gap-2 ${
                    isMobile ? '' : 'justify-between'
                  } w-full`}
                >
                  {item.fields.map((field, index) => {
                    return (
                      <div key={field.id} className={isMobile ? 'mb-2' : ''}>
                        {field.type === 'attachment' ? (
                          <div className='flex flex-row items-center gap-2'>
                            {field.value && field.value.length > 0 ? (
                              <>
                                {field.value[0].contentType?.startsWith('image/') ? (
                                  <div className='relative h-12 w-12 rounded overflow-hidden border border-gray-200'>
                                    <Image
                                      height={74}
                                      width={74}
                                      src={field.value[0].url}
                                      alt={field.value[0].name}
                                      className='h-full w-full object-cover'
                                    />
                                    {field.value.length > 1 && (
                                      <div className='absolute bottom-0 right-0 bg-gray-800 text-white text-[8px] px-1 rounded-tl'>
                                        +{field.value.length - 1}
                                      </div>
                                    )}
                                  </div>
                                ) : (
                                  <div className='flex-shrink-0 border border-gray-200 rounded-md p-2'>
                                    {getFileIcon(
                                      field.value[0].name,
                                      field.value[0].contentType,
                                      'h-8 w-8',
                                    )}
                                    {field.value.length > 1 && (
                                      <span className='text-xs text-gray-500 ml-1'>
                                        +{field.value.length - 1}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </>
                            ) : (
                              <div className='border border-gray-200 rounded-md p-2'>
                                <Paperclip className='h-8 w-8 text-gray-400' />
                                <div className='text-sm text-gray-500'></div>
                              </div>
                            )}
                          </div>
                        ) : (
                          <div className='text-sm'>
                            <div className='text-gray-500 text-xs'>{field.label}</div>
                            <div className='font-medium'>{field.value}</div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
