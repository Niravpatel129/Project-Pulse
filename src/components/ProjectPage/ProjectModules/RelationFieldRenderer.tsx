import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Paperclip } from 'lucide-react';
import { useState } from 'react';

interface RelationItem {
  id: string;
  value: string;
  [key: string]: any; // For additional fields
}

interface RelationField {
  _id: string;
  name: string;
  type: string;
  required?: boolean;
  description?: string;
  selectOptions?: { label: string; value: string }[];
  // New properties for relation display
  relationConfig?: {
    displayFields: Array<{
      key: string;
      label: string;
    }>;
    data?: RelationItem[];
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

  // Mock data if not provided through field.relationConfig
  const relationItems = field.relationConfig?.data || [
    {
      1: { id: '1', value: 'John Doe', label: 'Name', type: 'text' },
      2: { id: '2', value: '22', label: 'Age', type: 'text' },
      3: { id: '3', value: '14 street', label: 'Address', type: 'text' },
      4: { id: '4', value: 'www.imageurl.com', label: 'Attachment', type: 'attachment' },
    },
    {
      1: { id: '1', value: 'John Doe', label: 'Name', type: 'text' },
      2: { id: '2', value: '22', label: 'Age', type: 'text' },
      3: { id: '3', value: '14 street', label: 'Address', type: 'text' },
      4: { id: '4', value: 'www.imageurl.com', label: 'Attachment', type: 'attachment' },
    },
  ];

  // Find the selected item
  const selectedItem = relationItems.find((item) => {
    return item[1].value === value;
  });

  // Generate grid template columns style based on the number of display fields
  const gridStyle = {
    gridTemplateColumns: `repeat(${field.relationConfig?.displayFields?.length || 2}, 1fr)`,
  };

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className='w-full justify-start text-left h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
        >
          {selectedItem ? selectedItem[1].value : `Select ${field.name}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[400px] p-0' align='start'>
        {/* Scrollable content with relation items */}
        <div className='max-h-[200px] overflow-y-auto'>
          {relationItems.map((item) => {
            return (
              <div
                key={item.id}
                className={`flex items-center p-3 hover:bg-gray-50 cursor-pointer ${
                  item.value === value ? 'bg-gray-50' : ''
                }`}
                onClick={() => {
                  onChange(item.value);
                  setIsOpen(false);
                }}
              >
                <div className='flex-1 grid gap-4 items-center'>
                  <div className='flex justify-between w-full items-center'>
                    {Object.keys(item).map((key) => {
                      if (item[key].type === 'attachment') {
                        return (
                          <>
                            <div className='flex-shrink-0'>
                              <Paperclip className='h-5 w-5 text-gray-400' />
                            </div>
                          </>
                        );
                      }
                      return (
                        <div key={`item-${item.id}-field-${key}`} className='text-sm'>
                          <div className='text-gray-500 text-xs truncate'>{item[key].label}</div>
                          <div className='truncate'>{item[key].value}</div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </PopoverContent>
    </Popover>
  );
}
