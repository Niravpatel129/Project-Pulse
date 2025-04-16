import { Button } from '@/components/ui/button';
import { IconSelector } from '@/components/ui/icon-selector';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ScrollArea } from '@/components/ui/scroll-area';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  ArrowLeft,
  Calendar,
  Check,
  Clock,
  DollarSign,
  File,
  FormInput,
  Hash,
  ImageIcon,
  Link,
  List,
  Mail,
  Percent,
  Phone,
  Plus,
  Save,
  Search,
  Star,
  Trash,
  Type,
} from 'lucide-react';
import React, { useState } from 'react';
import { IconType } from 'react-icons';

interface FieldOption {
  id: string;
  name: string;
  color?: string;
}

interface PropertyType {
  id: string;
  name: string;
  iconName: string;
  description?: string;
  icon?: React.ReactNode;
  hasOptions?: boolean;
  hasFormat?: boolean;
  hasRange?: boolean;
  hasDefault?: boolean;
  hasDecimals?: boolean;
  hasSymbol?: boolean;
  hasValidation?: boolean;
  editorType?: string;
  cellRenderer?: string;
  valueFormatter?: string;
  cellEditor?: string;
}

interface PropertySheetProps {
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  selectedPropertyType: PropertyType | null;
  propertySearchQuery: string;
  propertyTypes?: PropertyType[];
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

// Define default property types if not provided
const defaultPropertyTypes: PropertyType[] = [
  {
    id: 'text',
    name: 'text',
    iconName: 'text',
    icon: <Type size={18} />,
    description: 'For short text like names, emails, etc.',
    hasValidation: true,
    editorType: 'agTextCellEditor',
  },
  {
    id: 'attachment',
    name: 'Attachment',
    iconName: 'attachment',
    icon: <File size={18} />,
    description: 'Upload and link to files',
    cellRenderer: 'fileCellRenderer',
    cellEditor: 'attachmentCellEditor',
  },
  {
    id: 'image',
    name: 'Image',
    iconName: 'image',
    icon: <ImageIcon size={18} />,
    description: 'Upload and display images',
    cellRenderer: 'imageCellRenderer',
  },
  {
    id: 'checkbox',
    name: 'Checkbox',
    iconName: 'checkbox',
    icon: <Check size={18} />,
    description: 'Binary yes/no values',
    hasDefault: true,
    editorType: 'agCheckboxCellEditor',
  },
  {
    id: 'multi_select',
    name: 'Multiple select',
    iconName: 'multiselect',
    icon: <List size={18} />,
    description: 'Choose multiple options from a list',
    hasOptions: true,
    cellRenderer: 'tagsCellRenderer',
  },
  {
    id: 'single_select',
    name: 'Single select',
    iconName: 'select',
    icon: <FormInput size={18} />,
    description: 'Choose one option from a list',
    hasOptions: true,
    editorType: 'agSelectCellEditor',
  },
  {
    id: 'phone',
    name: 'Phone',
    iconName: 'phone',
    icon: <Phone size={18} />,
    description: 'Phone numbers with optional formatting',
    editorType: 'agTextCellEditor',
    cellRenderer: 'phoneCellRenderer',
    hasOptions: true,
  },
  {
    id: 'date',
    name: 'Date',
    iconName: 'date',
    icon: <Calendar size={18} />,
    description: 'Date and time values',
    hasFormat: true,
    editorType: 'agDateCellEditor',
    valueFormatter: 'dateFormatter',
  },
  {
    id: 'email',
    name: 'Email',
    iconName: 'email',
    icon: <Mail size={18} />,
    description: 'Email addresses',
    editorType: 'agTextCellEditor',
  },
  {
    id: 'url',
    name: 'URL',
    iconName: 'url',
    icon: <Link size={18} />,
    description: 'Web addresses and links',
    cellRenderer: 'linkCellRenderer',
  },
  {
    id: 'number',
    name: 'Number',
    iconName: 'number',
    icon: <Hash size={18} />,
    description: 'Numeric values for calculations',
    hasRange: true,
    hasDecimals: true,
    hasValidation: true,
    editorType: 'agNumberCellEditor',
    valueFormatter: 'numberFormatter',
  },
  {
    id: 'currency',
    name: 'Currency',
    iconName: 'currency',
    icon: <DollarSign size={18} />,
    description: 'Monetary values with currency symbol',
    hasSymbol: true,
    hasDecimals: true,
    editorType: 'agNumberCellEditor',
    valueFormatter: 'currencyFormatter',
  },
  {
    id: 'percent',
    name: 'Percent',
    iconName: 'percent',
    icon: <Percent size={18} />,
    description: 'Percentage values',
    hasRange: true,
    editorType: 'agNumberCellEditor',
    valueFormatter: 'percentFormatter',
  },
  {
    id: 'rating',
    name: 'Rating',
    iconName: 'rating',
    icon: <Star size={18} />,
    description: 'Rate items on a scale',
    hasRange: true,
    cellRenderer: 'ratingCellRenderer',
  },
  {
    id: 'time',
    name: 'Time',
    iconName: 'time',
    icon: <Clock size={18} />,
    description: 'Time values',
    valueFormatter: 'timeFormatter',
  },
];

export function PropertySheet({
  isOpen,
  onOpenChange,
  selectedPropertyType,
  propertySearchQuery,
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
  // Local state for field configuration
  const [fieldOptions, setFieldOptions] = useState<FieldOption[]>([]);
  const [newOptionName, setNewOptionName] = useState('');
  const [selectedTab, setSelectedTab] = useState('general');
  const [decimalsEnabled, setDecimalsEnabled] = useState(false);
  const [decimalPlaces, setDecimalPlaces] = useState('2');
  const [minValue, setMinValue] = useState('');
  const [maxValue, setMaxValue] = useState('');
  const [defaultValue, setDefaultValue] = useState('');
  const [currencySymbol, setCurrencySymbol] = useState('$');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [phoneFormat, setPhoneFormat] = useState('international');

  // Filter property types based on search query
  const filteredPropertyTypes = propertySearchQuery
    ? defaultPropertyTypes.filter((type) => {
        return (
          type.name.toLowerCase().includes(propertySearchQuery.toLowerCase()) ||
          (type.description &&
            type.description.toLowerCase().includes(propertySearchQuery.toLowerCase()))
        );
      })
    : defaultPropertyTypes;

  // Add a new option to select/multi-select fields
  const addFieldOption = () => {
    if (newOptionName.trim()) {
      const newOption: FieldOption = {
        id: `option-${Date.now()}`,
        name: newOptionName.trim(),
        color: getRandomColor(),
      };
      setFieldOptions([...fieldOptions, newOption]);
      setNewOptionName('');
    }
  };

  // Remove an option
  const removeFieldOption = (id: string) => {
    setFieldOptions(
      fieldOptions.filter((option) => {
        return option.id !== id;
      }),
    );
  };

  // Generate a random color for select options
  const getRandomColor = () => {
    const colors = [
      'bg-blue-100 text-blue-800',
      'bg-green-100 text-green-800',
      'bg-yellow-100 text-yellow-800',
      'bg-red-100 text-red-800',
      'bg-purple-100 text-purple-800',
      'bg-pink-100 text-pink-800',
      'bg-indigo-100 text-indigo-800',
    ];
    return colors[Math.floor(Math.random() * colors.length)];
  };

  return (
    <Sheet open={isOpen} onOpenChange={onOpenChange}>
      <SheetContent side='right' className='w-[400px] sm:w-[540px]'>
        <SheetHeader>
          <SheetTitle>
            <div className='flex items-center gap-2'>
              {selectedPropertyType ? (
                <>
                  <button
                    className='cursor-pointer flex items-center justify-center hover:bg-gray-100 rounded-full p-1 transition-colors'
                    onClick={onBackToPropertySelection}
                    aria-label='Back to property selection'
                  >
                    <ArrowLeft className='text-muted-foreground hover:text-black' size={20} />
                  </button>
                  <span className='font-medium'>{selectedPropertyType.name}</span>
                </>
              ) : (
                'Add field'
              )}
            </div>
          </SheetTitle>
        </SheetHeader>
        <div className='py-4'>
          {selectedPropertyType ? (
            <>
              <Tabs value={selectedTab} onValueChange={setSelectedTab} className='w-full'>
                <TabsList className='grid w-full grid-cols-2 mb-4'>
                  <TabsTrigger value='general'>General</TabsTrigger>
                  <TabsTrigger value='advanced'>Advanced</TabsTrigger>
                </TabsList>

                <TabsContent value='general' className='space-y-4'>
                  <div className='space-y-2'>
                    <label className='text-sm font-medium'>Field Type</label>
                    <Button
                      variant='outline'
                      className='w-full justify-start h-12 px-4 transition-colors'
                      onClick={onBackToPropertySelection}
                    >
                      <div className='flex items-center'>
                        {selectedPropertyType.icon ||
                          React.createElement(getIconComponent(selectedPropertyType.iconName), {
                            className: 'mr-2',
                            size: 18,
                          })}
                        <span className='ml-2'>{selectedPropertyType.name}</span>
                      </div>
                    </Button>
                  </div>

                  <div className='space-y-2'>
                    <label htmlFor='property-name' className='text-sm font-medium'>
                      Field Name
                    </label>
                    <div className='flex gap-1 relative'>
                      <div className='absolute right-1 top-1/2 -translate-y-1/2'>
                        <IconSelector
                          onSelect={onIconSelect}
                          selectedIcon={getIconComponent(newPropertyIconName)}
                        />
                      </div>
                      <Input
                        className='h-12 pr-10 transition-all focus:ring-2 focus:ring-blue-500'
                        id='property-name'
                        value={newPropertyName}
                        onChange={(e) => {
                          return onPropertyNameChange(e.target.value);
                        }}
                        placeholder='Enter field name'
                      />
                    </div>
                  </div>

                  {/* Type-specific configuration options */}
                  {selectedPropertyType.hasOptions && (
                    <div className='space-y-2 mt-6'>
                      <label className='text-sm font-medium'>Options</label>
                      <div className='space-y-2'>
                        <div className='flex items-center gap-2'>
                          <Input
                            value={newOptionName}
                            onChange={(e) => {
                              return setNewOptionName(e.target.value);
                            }}
                            placeholder='Enter option name'
                            className='flex-1'
                          />
                          <Button
                            variant='outline'
                            size='icon'
                            onClick={addFieldOption}
                            disabled={!newOptionName.trim()}
                          >
                            <Plus className='h-4 w-4' />
                          </Button>
                        </div>

                        <div className='max-h-40 overflow-y-auto space-y-2 mt-2'>
                          {fieldOptions.map((option) => {
                            return (
                              <div
                                key={option.id}
                                className='flex items-center justify-between bg-gray-50 p-2 rounded'
                              >
                                <div className='flex items-center gap-2'>
                                  <div className={`w-4 h-4 rounded-full ${option.color}`}></div>
                                  <span>{option.name}</span>
                                </div>
                                <Button
                                  variant='ghost'
                                  size='icon'
                                  onClick={() => {
                                    return removeFieldOption(option.id);
                                  }}
                                  className='h-6 w-6'
                                >
                                  <Trash className='h-4 w-4' />
                                </Button>
                              </div>
                            );
                          })}
                          {fieldOptions.length === 0 && (
                            <div className='text-sm text-muted-foreground text-center py-2'>
                              No options yet. Add some above.
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPropertyType.hasRange && (
                    <div className='space-y-2 mt-6'>
                      <label className='text-sm font-medium'>Range (Optional)</label>
                      <div className='grid grid-cols-2 gap-2'>
                        <div>
                          <label className='text-xs'>Min Value</label>
                          <Input
                            type='number'
                            value={minValue}
                            onChange={(e) => {
                              return setMinValue(e.target.value);
                            }}
                            placeholder='Minimum'
                          />
                        </div>
                        <div>
                          <label className='text-xs'>Max Value</label>
                          <Input
                            type='number'
                            value={maxValue}
                            onChange={(e) => {
                              return setMaxValue(e.target.value);
                            }}
                            placeholder='Maximum'
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {selectedPropertyType.hasDecimals && (
                    <div className='space-y-2 mt-6'>
                      <div className='flex items-center justify-between'>
                        <label className='text-sm font-medium'>Decimal Places</label>
                        <Switch checked={decimalsEnabled} onCheckedChange={setDecimalsEnabled} />
                      </div>
                      {decimalsEnabled && (
                        <Select value={decimalPlaces} onValueChange={setDecimalPlaces}>
                          <SelectTrigger>
                            <SelectValue placeholder='Select decimal places' />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='0'>0 - Whole numbers only (1)</SelectItem>
                            <SelectItem value='1'>1 - Tenth precision (1.5)</SelectItem>
                            <SelectItem value='2'>2 - Hundredth precision (1.25)</SelectItem>
                            <SelectItem value='3'>3 - Thousandth precision (1.234)</SelectItem>
                            <SelectItem value='4'>4 - Ten-thousandth precision (1.2345)</SelectItem>
                          </SelectContent>
                        </Select>
                      )}
                    </div>
                  )}

                  {selectedPropertyType.hasSymbol && (
                    <div className='space-y-2 mt-6'>
                      <label className='text-sm font-medium'>Currency Symbol</label>
                      <Select value={currencySymbol} onValueChange={setCurrencySymbol}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select currency symbol' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='$'>$ - Dollar</SelectItem>
                          <SelectItem value='€'>€ - Euro</SelectItem>
                          <SelectItem value='£'>£ - Pound</SelectItem>
                          <SelectItem value='¥'>¥ - Yen/Yuan</SelectItem>
                          <SelectItem value='₹'>₹ - Indian Rupee</SelectItem>
                          <SelectItem value='₽'>₽ - Russian Ruble</SelectItem>
                          <SelectItem value='₩'>₩ - Korean Won</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedPropertyType.hasFormat && selectedPropertyType.id === 'date' && (
                    <div className='space-y-2 mt-6'>
                      <label className='text-sm font-medium'>Date Format</label>
                      <Select value={dateFormat} onValueChange={setDateFormat}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select date format' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='MM/DD/YYYY'>MM/DD/YYYY (US)</SelectItem>
                          <SelectItem value='DD/MM/YYYY'>DD/MM/YYYY (EU)</SelectItem>
                          <SelectItem value='YYYY-MM-DD'>YYYY-MM-DD (ISO)</SelectItem>
                          <SelectItem value='MM/DD/YYYY HH:mm'>
                            MM/DD/YYYY HH:mm (with time)
                          </SelectItem>
                          <SelectItem value='YYYY-MM-DD HH:mm'>
                            YYYY-MM-DD HH:mm (ISO with time)
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedPropertyType.hasFormat && selectedPropertyType.id === 'phone' && (
                    <div className='space-y-2 mt-6'>
                      <label className='text-sm font-medium'>Phone Format</label>
                      <Select value={phoneFormat} onValueChange={setPhoneFormat}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select phone format' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='international'>
                            International Format (+1 234 567 8900)
                          </SelectItem>
                          <SelectItem value='us'>US Format (123-456-7890)</SelectItem>
                          <SelectItem value='custom'>Custom Format</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  )}

                  {selectedPropertyType.hasDefault && (
                    <div className='space-y-2 mt-6'>
                      <div className='flex items-center space-x-2'>
                        <Switch
                          id='default-value'
                          checked={defaultValue === 'true'}
                          onCheckedChange={(checked) => {
                            setDefaultValue(checked ? 'true' : 'false');
                          }}
                        />
                        <label
                          htmlFor='default-value'
                          className='text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70'
                        >
                          Default value for new records
                        </label>
                      </div>
                    </div>
                  )}

                  {selectedPropertyType.hasRange && selectedPropertyType.id === 'rating' && (
                    <div className='space-y-2 mt-6'>
                      <label className='text-sm font-medium'>Rating Scale</label>
                      <Select value={maxValue || '5'} onValueChange={setMaxValue}>
                        <SelectTrigger>
                          <SelectValue placeholder='Select max stars' />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value='3'>3 Stars</SelectItem>
                          <SelectItem value='5'>5 Stars</SelectItem>
                          <SelectItem value='10'>10 Stars</SelectItem>
                        </SelectContent>
                      </Select>
                      <div className='mt-2 flex'>
                        {Array.from({ length: parseInt(maxValue || '5', 10) }).map((_, i) => {
                          return (
                            <Star
                              key={i}
                              className={`h-4 w-4 ${i < 3 ? 'text-yellow-400' : 'text-gray-300'}`}
                              fill={i < 3 ? 'currentColor' : 'none'}
                            />
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {selectedPropertyType.hasDefault && selectedPropertyType.id === 'checkbox' && (
                    <div className='space-y-2 mt-6'>
                      <label className='text-sm font-medium'>Default Value</label>
                      <div className='flex gap-4 mt-1'>
                        <div className='flex items-center space-x-2'>
                          <input
                            type='radio'
                            id='default-checked'
                            name='default-checkbox'
                            checked={defaultValue === 'true'}
                            onChange={() => {
                              return setDefaultValue('true');
                            }}
                          />
                          <label htmlFor='default-checked'>Checked</label>
                        </div>
                        <div className='flex items-center space-x-2'>
                          <input
                            type='radio'
                            id='default-unchecked'
                            name='default-checkbox'
                            checked={defaultValue === 'false' || defaultValue === ''}
                            onChange={() => {
                              return setDefaultValue('false');
                            }}
                          />
                          <label htmlFor='default-unchecked'>Unchecked</label>
                        </div>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value='advanced' className='space-y-4'>
                  <div className='space-y-4'>
                    <div className='space-y-2 border-b pb-4'>
                      <Label className='text-sm font-medium'>Column Options</Label>

                      <div className='flex items-center justify-between mt-2'>
                        <Label htmlFor='sortable' className='cursor-pointer select-none text-sm'>
                          Allow sorting
                        </Label>
                        <Switch id='sortable' defaultChecked />
                      </div>

                      <div className='flex items-center justify-between mt-2'>
                        <Label htmlFor='filterable' className='cursor-pointer select-none text-sm'>
                          Allow filtering
                        </Label>
                        <Switch id='filterable' defaultChecked />
                      </div>

                      <div className='flex items-center justify-between mt-2'>
                        <Label htmlFor='editable' className='cursor-pointer select-none text-sm'>
                          Allow editing
                        </Label>
                        <Switch id='editable' defaultChecked />
                      </div>

                      <div className='flex items-center justify-between mt-2'>
                        <Label htmlFor='resizable' className='cursor-pointer select-none text-sm'>
                          Allow column resize
                        </Label>
                        <Switch id='resizable' defaultChecked />
                      </div>
                    </div>

                    {/* Width settings */}
                    <div className='space-y-2 mt-2'>
                      <Label className='text-sm font-medium'>Column Width</Label>
                      <div className='grid grid-cols-2 gap-2'>
                        <div>
                          <Label htmlFor='min-width' className='text-xs'>
                            Min Width (px)
                          </Label>
                          <Input
                            id='min-width'
                            type='number'
                            placeholder='60'
                            min={60}
                            className='mt-1'
                          />
                        </div>
                        <div>
                          <Label htmlFor='default-width' className='text-xs'>
                            Default Width (px)
                          </Label>
                          <Input
                            id='default-width'
                            type='number'
                            placeholder='200'
                            min={60}
                            className='mt-1'
                          />
                        </div>
                      </div>
                    </div>

                    {/* Basic validation - focus on what AG Grid supports easily */}
                    {['text', 'number', 'email', 'url'].includes(
                      selectedPropertyType?.id || '',
                    ) && (
                      <div className='space-y-2 mt-4 pt-2 border-t'>
                        <Label className='text-sm font-medium'>Validation</Label>

                        <div className='flex items-center justify-between mt-2'>
                          <Label
                            htmlFor='required-field'
                            className='cursor-pointer select-none text-sm'
                          >
                            Required field
                          </Label>
                          <Switch id='required-field' />
                        </div>

                        {['number'].includes(selectedPropertyType?.id || '') && (
                          <div className='flex items-center justify-between mt-2'>
                            <Label
                              htmlFor='unique-value'
                              className='cursor-pointer select-none text-sm'
                            >
                              Must be unique
                            </Label>
                            <Switch id='unique-value' />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Default value section */}
                    {!['attachment', 'image', 'created_time', 'last_modified'].includes(
                      selectedPropertyType?.id || '',
                    ) && (
                      <div className='space-y-2 mt-4 pt-2 border-t'>
                        <Label className='text-sm font-medium'>Default Value</Label>

                        {['single_line', 'long_text', 'email', 'url', 'phone'].includes(
                          selectedPropertyType?.id || '',
                        ) && <Input className='mt-1' placeholder='Enter default value...' />}

                        {['number', 'currency', 'percent'].includes(
                          selectedPropertyType?.id || '',
                        ) && <Input type='number' className='mt-1' placeholder='0' />}

                        {['date'].includes(selectedPropertyType?.id || '') && (
                          <div className='flex items-center gap-2 mt-1'>
                            <div className='flex items-center space-x-2'>
                              <input type='radio' id='today' name='date-default' />
                              <label htmlFor='today' className='text-sm'>
                                Today
                              </label>
                            </div>
                            <div className='flex items-center space-x-2'>
                              <input type='radio' id='custom-date' name='date-default' />
                              <label htmlFor='custom-date' className='text-sm'>
                                Custom
                              </label>
                            </div>
                            <Input type='date' className='flex-1' disabled />
                          </div>
                        )}
                      </div>
                    )}

                    {/* AG Grid specific options */}
                    <div className='space-y-2 mt-4 pt-2 border-t'>
                      <Label className='text-sm font-medium'>Cell Display (AG Grid)</Label>

                      <div className='flex flex-col space-y-2 mt-2'>
                        <Label htmlFor='header-align' className='text-sm'>
                          Header Alignment
                        </Label>
                        <Select defaultValue='left'>
                          <SelectTrigger id='header-align'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='left'>Left</SelectItem>
                            <SelectItem value='center'>Center</SelectItem>
                            <SelectItem value='right'>Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      <div className='flex flex-col space-y-2 mt-2'>
                        <Label htmlFor='cell-align' className='text-sm'>
                          Cell Alignment
                        </Label>
                        <Select defaultValue='left'>
                          <SelectTrigger id='cell-align'>
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='left'>Left</SelectItem>
                            <SelectItem value='center'>Center</SelectItem>
                            <SelectItem value='right'>Right</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>

                      {['single_select', 'multi_select'].includes(
                        selectedPropertyType?.id || '',
                      ) && (
                        <div className='flex items-center justify-between mt-2'>
                          <Label
                            htmlFor='use-badges'
                            className='cursor-pointer select-none text-sm'
                          >
                            Show as colored badges
                          </Label>
                          <Switch id='use-badges' defaultChecked />
                        </div>
                      )}
                    </div>

                    <div className='space-y-2 mt-2'>
                      <Label htmlFor='description'>Field description (optional)</Label>
                      <Textarea
                        id='description'
                        placeholder='Add a description to help users understand this field'
                      />
                    </div>
                  </div>
                </TabsContent>
              </Tabs>

              <Button
                className='w-full mt-8 transition-colors hover:bg-blue-600'
                onClick={onSaveProperty}
                disabled={!newPropertyName.trim()}
              >
                <Save className='mr-2 h-4 w-4' />
                Add Field
              </Button>
            </>
          ) : (
            <>
              <div className='relative mb-4'>
                <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input
                  placeholder='Search field types...'
                  className='pl-8 transition-all focus:ring-2 focus:ring-blue-500'
                  value={propertySearchQuery}
                  onChange={(e) => {
                    return onPropertySearchChange(e.target.value);
                  }}
                />
              </div>
              <ScrollArea className='h-[calc(100vh-200px)]'>
                <div className='grid grid-cols-1 gap-1 pr-1'>
                  <div className='mb-2 mt-1 text-xs font-medium text-muted-foreground uppercase'>
                    Basic fields
                  </div>
                  {filteredPropertyTypes
                    .filter((type) => {
                      return ['text', 'checkbox'].includes(type.id);
                    })
                    .map((type) => {
                      return (
                        <FieldTypeButton
                          key={type.id}
                          type={type}
                          onClick={() => {
                            return onAddNewColumn(type);
                          }}
                          getIconComponent={getIconComponent}
                        />
                      );
                    })}

                  <div className='mb-2 mt-4 text-xs font-medium text-muted-foreground uppercase'>
                    Numbers & Data
                  </div>
                  {filteredPropertyTypes
                    .filter((type) => {
                      return ['number', 'currency', 'percent', 'rating'].includes(type.id);
                    })
                    .map((type) => {
                      return (
                        <FieldTypeButton
                          key={type.id}
                          type={type}
                          onClick={() => {
                            return onAddNewColumn(type);
                          }}
                          getIconComponent={getIconComponent}
                        />
                      );
                    })}

                  <div className='mb-2 mt-4 text-xs font-medium text-muted-foreground uppercase'>
                    Selection fields
                  </div>
                  {filteredPropertyTypes
                    .filter((type) => {
                      return ['single_select', 'multi_select', 'user'].includes(type.id);
                    })
                    .map((type) => {
                      return (
                        <FieldTypeButton
                          key={type.id}
                          type={type}
                          onClick={() => {
                            return onAddNewColumn(type);
                          }}
                          getIconComponent={getIconComponent}
                        />
                      );
                    })}

                  <div className='mb-2 mt-4 text-xs font-medium text-muted-foreground uppercase'>
                    Contact & URLs
                  </div>
                  {filteredPropertyTypes
                    .filter((type) => {
                      return ['phone', 'email', 'url'].includes(type.id);
                    })
                    .map((type) => {
                      return (
                        <FieldTypeButton
                          key={type.id}
                          type={type}
                          onClick={() => {
                            return onAddNewColumn(type);
                          }}
                          getIconComponent={getIconComponent}
                        />
                      );
                    })}

                  <div className='mb-2 mt-4 text-xs font-medium text-muted-foreground uppercase'>
                    Media
                  </div>
                  {filteredPropertyTypes
                    .filter((type) => {
                      return ['attachment', 'image'].includes(type.id);
                    })
                    .map((type) => {
                      return (
                        <FieldTypeButton
                          key={type.id}
                          type={type}
                          onClick={() => {
                            return onAddNewColumn(type);
                          }}
                          getIconComponent={getIconComponent}
                        />
                      );
                    })}

                  <div className='mb-2 mt-4 text-xs font-medium text-muted-foreground uppercase'>
                    Date & Time
                  </div>
                  {filteredPropertyTypes
                    .filter((type) => {
                      return ['date', 'time'].includes(type.id);
                    })
                    .map((type) => {
                      return (
                        <FieldTypeButton
                          key={type.id}
                          type={type}
                          onClick={() => {
                            return onAddNewColumn(type);
                          }}
                          getIconComponent={getIconComponent}
                        />
                      );
                    })}

                  {filteredPropertyTypes
                    .filter((type) => {
                      return ['lookup'].includes(type.id);
                    })
                    .map((type) => {
                      return (
                        <FieldTypeButton
                          key={type.id}
                          type={type}
                          onClick={() => {
                            return onAddNewColumn(type);
                          }}
                          getIconComponent={getIconComponent}
                        />
                      );
                    })}
                </div>
              </ScrollArea>
            </>
          )}
        </div>
      </SheetContent>
    </Sheet>
  );
}

// Helper component for field type buttons
function FieldTypeButton({
  type,
  onClick,
  getIconComponent,
}: {
  type: PropertyType;
  onClick: () => void;
  getIconComponent: (name: string) => IconType;
}) {
  return (
    <Button
      variant='ghost'
      className='justify-start h-12 px-3 hover:bg-blue-50 transition-colors rounded-md w-full'
      onClick={onClick}
    >
      <div className='mr-3 text-blue-600'>
        {type.icon || React.createElement(getIconComponent(type.iconName), { size: 18 })}
      </div>
      <div className='flex flex-col items-start'>
        <span className='font-medium text-sm'>{type.name}</span>
        {type.description && (
          <span className='text-xs text-muted-foreground'>{type.description}</span>
        )}
      </div>
    </Button>
  );
}
