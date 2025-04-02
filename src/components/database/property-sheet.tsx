import { Button } from '@/components/ui/button';
import { IconSelector } from '@/components/ui/icon-selector';
import { Input } from '@/components/ui/input';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ArrowLeft, Save, Search } from 'lucide-react';
import React from 'react';
import { IconType } from 'react-icons';

interface PropertyType {
  id: string;
  name: string;
  iconName: string;
}

interface PropertySheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPropertyType: PropertyType | null;
  propertySearchQuery: string;
  propertyTypes: PropertyType[];
  newPropertyName: string;
  newPropertyIconName: string;
  onBackToPropertySelection: () => void;
  onPropertySearchChange: (value: string) => void;
  onPropertyNameChange: (value: string) => void;
  onIconSelect: (name: string) => void;
  onSaveProperty: () => void;
  onAddNewColumn: (type: PropertyType) => void;
  getIconComponent: (name: string) => IconType;
}

export function PropertySheet({
  isOpen,
  onOpenChange,
  selectedPropertyType,
  propertySearchQuery,
  propertyTypes,
  newPropertyName,
  newPropertyIconName,
  onBackToPropertySelection,
  onPropertySearchChange,
  onPropertyNameChange,
  onIconSelect,
  onSaveProperty,
  onAddNewColumn,
  getIconComponent,
}: PropertySheetProps) {
  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-[400px] sm:w-[540px]'>
        <SheetHeader>
          <SheetTitle>
            <div className='flex items-center gap-2'>
              {selectedPropertyType ? (
                <>
                  <div className='cursor-pointer' onClick={onBackToPropertySelection}>
                    <ArrowLeft className='text-muted-foreground hover:text-black' size={20} />
                  </div>
                  {selectedPropertyType.name}
                </>
              ) : (
                'New property'
              )}
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className='py-4'>
          {selectedPropertyType ? (
            <div className='space-y-4'>
              <div className='space-y-2'>
                <label className='text-sm font-medium'>Property Type</label>
                <Button
                  variant='outline'
                  className='w-full justify-start h-12 px-4'
                  onClick={onBackToPropertySelection}
                >
                  <div className='flex items-center'>
                    <div>{selectedPropertyType.name}</div>
                  </div>
                </Button>
              </div>

              <div className='space-y-2'>
                <label htmlFor='property-name' className='text-sm font-medium'>
                  Property Name
                </label>
                <div className='flex gap-1 relative'>
                  <div className='absolute right-1 top-1/2 -translate-y-1/2'>
                    <IconSelector
                      onSelect={onIconSelect}
                      selectedIcon={getIconComponent(newPropertyIconName)}
                    />
                  </div>
                  <Input
                    className='h-12 pr-10'
                    id='property-name'
                    value={newPropertyName}
                    onChange={(e) => {
                      return onPropertyNameChange(e.target.value);
                    }}
                    placeholder='Enter property name'
                  />
                </div>
              </div>

              <Button className='w-full mt-4' onClick={onSaveProperty}>
                <Save className='mr-2 h-4 w-4' />
                Save Property
              </Button>
            </div>
          ) : (
            <>
              <div className='relative mb-4'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search property types...'
                  className='pl-8'
                  value={propertySearchQuery}
                  onChange={(e) => {
                    return onPropertySearchChange(e.target.value);
                  }}
                />
              </div>
              <div className='grid grid-cols-1 gap-0'>
                {propertyTypes.map((type) => {
                  return (
                    <Button
                      key={type.id}
                      variant='ghost'
                      className='justify-start h-10 px-2 hover:bg-blue-50'
                      onClick={() => {
                        return onAddNewColumn(type);
                      }}
                    >
                      <div className='mr-2'>
                        {React.createElement(getIconComponent(type.iconName))}
                      </div>
                      <div className='flex items-center'>
                        <div>{type.name}</div>
                      </div>
                    </Button>
                  );
                })}
              </div>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}
