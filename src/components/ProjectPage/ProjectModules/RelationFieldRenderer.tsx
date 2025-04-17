import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Paperclip } from 'lucide-react';
import { useState } from 'react';

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
  console.log('🚀 field:', field.popoverOptions);

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

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button
          variant='outline'
          className='w-full justify-start text-left h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
        >
          {selectedItem ? getDisplayValue(selectedItem) : `Select ${field.name}`}
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[400px] p-0' align='start'>
        {/* Scrollable content with relation items */}
        <div className='max-h-[300px] overflow-y-auto'>
          {relationItems.map((item) => {
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
                <div className='flex flex-row gap-2 justify-between w-full'>
                  {item.fields.map((field) => {
                    return (
                      <div key={field.id} className='flex justify-between w-full items-center'>
                        {field.type === 'attachment' ? (
                          <div className='flex-shrink-0'>
                            <Paperclip className='h-5 w-5 text-gray-400' />
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
