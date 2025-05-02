import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  FileText,
  Link as LinkIcon,
  List,
  ListChecks,
  Menu,
  MoveDown,
  MoveUp,
  Plus,
  Settings,
  Trash2,
  Type,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';

// Define the stages
const STAGES = [
  {
    id: 1,
    title: 'Basic Details',
    value: 'general-info',
    icon: <FileText className='mr-2 opacity-70' size={15} aria-hidden='true' />,
  },
  {
    id: 2,
    title: 'Deliverable Content',
    value: 'custom-fields',
    icon: <Settings className='mr-2 opacity-70' size={15} aria-hidden='true' />,
  },
  {
    id: 3,
    title: 'Review & Save',
    value: 'review-notes',
    icon: <ListChecks className='mr-2 opacity-70' size={15} aria-hidden='true' />,
  },
];

// Define custom field types
const FIELD_TYPES = [
  { id: 'shortText', label: 'Short Text', icon: <Type className='mr-2' size={16} /> },
  { id: 'longText', label: 'Long Text', icon: <FileText className='mr-2' size={16} /> },
  { id: 'bulletList', label: 'Bullet List', icon: <List className='mr-2' size={16} /> },
  { id: 'numberList', label: 'Numbered List', icon: <ListChecks className='mr-2' size={16} /> },
  { id: 'link', label: 'Link', icon: <LinkIcon className='mr-2' size={16} /> },
  { id: 'specification', label: 'Specification', icon: <AlertCircle className='mr-2' size={16} /> },
];

const NewDeliverableDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [currentStage, setCurrentStage] = useState(STAGES[0].value);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    deliverableType: 'digital',
    availabilityDate: '',
    customFields: [],
    teamNotes: '',
    customDeliverableType: '',
  });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      return { ...prev, [name]: value };
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setHasUnsavedChanges(true);
  };

  // Handle select changes
  const handleSelectChange = (name: string, value: string) => {
    setFormData((prev) => {
      return { ...prev, [name]: value };
    });

    // Clear error when field is changed
    if (errors[name]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }

    setHasUnsavedChanges(true);
  };

  // Add custom field
  const addCustomField = (type: string) => {
    const newField = {
      id: Date.now().toString(),
      type,
      label: `New ${type}`,
      content: '',
    };

    setFormData((prev) => {
      return { ...prev, customFields: [...prev.customFields, newField] };
    });

    setHasUnsavedChanges(true);
  };

  // Remove custom field
  const removeCustomField = (id: string) => {
    setFormData((prev) => {
      return {
        ...prev,
        customFields: prev.customFields.filter((field: any) => {
          return field.id !== id;
        }),
      };
    });

    setHasUnsavedChanges(true);
  };

  // Move field up in the order
  const moveFieldUp = (index: number) => {
    if (index === 0) return; // Can't move up if already at the top

    setFormData((prev) => {
      const newFields = [...prev.customFields];
      const temp = newFields[index];
      newFields[index] = newFields[index - 1];
      newFields[index - 1] = temp;
      return { ...prev, customFields: newFields };
    });

    setHasUnsavedChanges(true);
  };

  // Move field down in the order
  const moveFieldDown = (index: number) => {
    setFormData((prev) => {
      if (index === prev.customFields.length - 1) return prev; // Can't move down if already at the bottom

      const newFields = [...prev.customFields];
      const temp = newFields[index];
      newFields[index] = newFields[index + 1];
      newFields[index + 1] = temp;
      return { ...prev, customFields: newFields };
    });

    setHasUnsavedChanges(true);
  };

  // Navigate to next stage
  const handleNext = () => {
    if (!validateCurrentStage()) return;

    const currentIndex = STAGES.findIndex((stage) => {
      return stage.value === currentStage;
    });
    if (currentIndex < STAGES.length - 1) {
      setCurrentStage(STAGES[currentIndex + 1].value);
    }
  };

  // Navigate to previous stage
  const handleBack = () => {
    const currentIndex = STAGES.findIndex((stage) => {
      return stage.value === currentStage;
    });
    if (currentIndex > 0) {
      setCurrentStage(STAGES[currentIndex - 1].value);
    }
  };

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
  };

  // Get current stage index for footer buttons display
  const getCurrentStageIndex = () => {
    return STAGES.findIndex((stage) => {
      return stage.value === currentStage;
    });
  };

  // Handle form submission
  const handleSubmit = async () => {
    if (!validateCurrentStage()) return;

    setIsSubmitting(true);
    try {
      // Simulate API call with timeout
      await new Promise((resolve) => {
        return setTimeout(resolve, 1000);
      });
      console.log('Submitted data:', formData);
      setHasUnsavedChanges(false);
      onClose();
    } catch (error) {
      console.error('Error submitting deliverable:', error);
      // Handle submission error
    } finally {
      setIsSubmitting(false);
    }
  };

  // Handle dialog close
  const handleClose = () => {
    if (hasUnsavedChanges) {
      setShowUnsavedWarning(true);
    } else {
      onClose();
    }
  };

  // Confirm discard changes
  const confirmDiscard = () => {
    setShowUnsavedWarning(false);
    onClose();
  };

  // Update field label or content
  const updateFieldProperty = (id: string, property: string, value: string | boolean | any[]) => {
    setFormData((prev) => {
      return {
        ...prev,
        customFields: prev.customFields.map((field: any) => {
          return field.id === id ? { ...field, [property]: value } : field;
        }),
      };
    });

    setHasUnsavedChanges(true);
  };

  // Get current stage title
  const getCurrentStageTitle = () => {
    const stage = STAGES.find((s) => {
      return s.value === currentStage;
    });
    return stage ? stage.title : '';
  };

  // Validate form based on current stage
  const validateCurrentStage = () => {
    const newErrors: { [key: string]: string } = {};

    if (currentStage === 'general-info') {
      if (!formData.name.trim()) {
        newErrors.name = 'Deliverable name is required';
      }

      if (!formData.price.trim()) {
        newErrors.price = 'Price is required';
      } else if (!/^\$?\d+(\.\d{1,2})?$/.test(formData.price.trim())) {
        newErrors.price = 'Please enter a valid price';
      }

      if (!formData.availabilityDate) {
        newErrors.availabilityDate = 'Availability date is required';
      }
    } else if (currentStage === 'custom-fields') {
      // Add validation for custom fields if needed
    } else if (currentStage === 'review-notes') {
      // Add validation for review section if needed
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Add a click handler to the document to handle clicking outside content items
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        editingFieldId &&
        !(event.target as Element).closest('.content-item') &&
        !(event.target as Element).closest('#addContentMenu')
      ) {
        setEditingFieldId(null);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [editingFieldId]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-[90vw] sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px] p-0 overflow-hidden shadow-sm border-neutral-200 transition-all duration-150 ease-in-out h-[90vh] sm:h-[600px] md:h-[650px] flex flex-col'>
        {showUnsavedWarning && (
          <div className='absolute inset-0 bg-black/50 z-50 flex items-center justify-center p-4'>
            <div className='bg-white rounded-md p-6 max-w-md shadow-lg'>
              <h3 className='text-lg font-medium mb-2'>Unsaved Changes</h3>
              <p className='text-neutral-600 mb-4'>
                You have unsaved changes. Are you sure you want to discard them?
              </p>
              <div className='flex gap-2 justify-end'>
                <Button
                  variant='outline'
                  onClick={() => {
                    return setShowUnsavedWarning(false);
                  }}
                  className='border-neutral-200'
                >
                  Cancel
                </Button>
                <Button
                  variant='destructive'
                  onClick={confirmDiscard}
                  className='bg-red-500 hover:bg-red-600'
                >
                  Discard
                </Button>
              </div>
            </div>
          </div>
        )}

        {/* Header (fixed) */}
        <DialogHeader className='px-5 py-1 border-b border-neutral-100 flex flex-row items-center justify-between flex-shrink-0'>
          <div className='flex items-center'>
            <Button variant='ghost' size='icon' onClick={toggleSidebar} className='md:hidden mr-2'>
              <Menu size={18} />
            </Button>
            <DialogTitle className='text-base font-medium'>Create Deliverable</DialogTitle>
          </div>
          <Button
            variant='ghost'
            size='icon'
            onClick={onClose}
            className='text-neutral-500 hover:text-neutral-900'
          >
            <X size={18} />
          </Button>
        </DialogHeader>

        {/* Content (scrollable) */}
        <div className='flex flex-1 min-h-0'>
          <Tabs
            value={currentStage}
            onValueChange={setCurrentStage}
            className='flex flex-row w-full h-full'
          >
            <div className='flex h-full w-full'>
              {/* Sidebar */}
              <TabsList
                className={`absolute md:relative z-10 md:z-0 bg-white flex-col gap-0.5 rounded-none bg-transparent px-3 py-4 border-r border-neutral-100 h-full justify-start transition-all duration-200
                ${
                  isSidebarOpen
                    ? 'w-48 translate-x-0'
                    : 'w-0 -translate-x-full md:translate-x-0 md:w-14 xl:w-16'
                }`}
              >
                {STAGES.map((stage) => {
                  return (
                    <TabsTrigger
                      key={stage.value}
                      value={stage.value}
                      onClick={() => {
                        // On mobile, clicking a tab also closes the sidebar
                        if (window.innerWidth < 768) {
                          setSidebarOpen(false);
                        }
                      }}
                      className={`relative w-full justify-start px-3 py-2 font-normal text-neutral-600 data-[state=active]:text-neutral-900 transition-colors duration-150 
                    hover:bg-neutral-50 data-[state=active]:bg-neutral-100/50 
                    data-[state=active]:after:bg-neutral-900 after:absolute after:inset-y-0 after:left-0 
                    after:w-[2px] data-[state=active]:after:opacity-100 after:opacity-0 
                    rounded-md data-[state=active]:shadow-none whitespace-nowrap ${
                      !isSidebarOpen ? 'md:justify-center md:px-1' : ''
                    }`}
                    >
                      {stage.icon}
                      <span className={`${!isSidebarOpen ? 'md:hidden' : ''}`}>{stage.title}</span>
                    </TabsTrigger>
                  );
                })}

                {/* Sidebar toggle button for desktop */}
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={toggleSidebar}
                  className='hidden md:flex mt-auto mx-auto mb-2'
                >
                  {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                </Button>
              </TabsList>

              {/* Dark overlay for mobile when sidebar is open */}
              {isSidebarOpen && (
                <div
                  className='md:hidden fixed inset-0 bg-black bg-opacity-40 z-0'
                  onClick={() => {
                    return setSidebarOpen(false);
                  }}
                />
              )}

              {/* Main content area */}
              <div className='flex-1 flex flex-col min-h-0'>
                {/* Mobile breadcrumb */}
                <div className='md:hidden bg-neutral-50/80 px-4 py-3 border-b border-neutral-100 flex items-center flex-shrink-0'>
                  <span className='text-sm font-medium text-neutral-900'>
                    {getCurrentStageTitle()}
                  </span>
                </div>

                {/* Scrollable tab content */}
                <div className='flex-1 overflow-y-auto'>
                  <TabsContent
                    value='general-info'
                    className='p-4 sm:p-5 m-0 data-[state=inactive]:hidden'
                  >
                    <div className='space-y-5 max-w-3xl mx-auto'>
                      <div className='space-y-1'>
                        <Label htmlFor='name' className='text-sm font-medium text-neutral-700'>
                          Deliverable Name <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          id='name'
                          name='name'
                          value={formData.name}
                          onChange={handleChange}
                          placeholder='Name of the product or service'
                          className={`transition-shadow duration-150 focus:ring-1 focus:ring-neutral-200 ${
                            errors.name ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.name && <p className='text-xs text-red-500 mt-1'>{errors.name}</p>}
                      </div>
                      <div className='space-y-1'>
                        <Label
                          htmlFor='description'
                          className='text-sm font-medium text-neutral-700'
                        >
                          Description
                        </Label>
                        <Textarea
                          id='description'
                          name='description'
                          value={formData.description}
                          onChange={handleChange}
                          placeholder='Describe what this deliverable includes (will appear on invoices)'
                          rows={3}
                          className='resize-none transition-shadow duration-150 focus:ring-1 focus:ring-neutral-200'
                        />
                        <span className='text-xs text-neutral-500'>
                          This description will help clients understand what they&apos;re being
                          billed for.
                        </span>
                      </div>
                      <div className='space-y-1'>
                        <Label htmlFor='price' className='text-sm font-medium text-neutral-700'>
                          Price <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          id='price'
                          name='price'
                          value={formData.price}
                          onChange={handleChange}
                          placeholder='Default price for this deliverable'
                          type='text'
                          className={`transition-shadow duration-150 focus:ring-1 focus:ring-neutral-200 ${
                            errors.price ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.price && (
                          <p className='text-xs text-red-500 mt-1'>{errors.price}</p>
                        )}
                        <span className='text-xs text-neutral-500'>
                          You can adjust the price when creating an invoice
                        </span>
                      </div>
                      <div className='space-y-1'>
                        <Label
                          htmlFor='deliverableType'
                          className='text-sm font-medium text-neutral-700'
                        >
                          Deliverable Type
                        </Label>
                        <Select
                          value={formData.deliverableType}
                          onValueChange={(value) => {
                            return handleSelectChange('deliverableType', value);
                          }}
                        >
                          <SelectTrigger className='w-full'>
                            <SelectValue>
                              {formData.deliverableType === 'digital' && 'Digital Product'}
                              {formData.deliverableType === 'service' && 'Custom Service'}
                              {formData.deliverableType === 'physical' && 'Physical Product'}
                              {formData.deliverableType === 'package' && 'Package'}
                              {formData.deliverableType === 'other' && 'Other'}
                              {!formData.deliverableType && 'Select type'}
                            </SelectValue>
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value='digital'>
                              <div>
                                <span className='font-medium'>Digital Product</span>
                                <p className='text-xs text-neutral-500 mt-0.5'>
                                  Downloadable files, templates, designs, or software
                                </p>
                              </div>
                            </SelectItem>
                            <SelectItem value='service'>
                              <div>
                                <span className='font-medium'>Custom Service</span>
                                <p className='text-xs text-neutral-500 mt-0.5'>
                                  Professional service with defined scope and deliverables
                                </p>
                              </div>
                            </SelectItem>
                            <SelectItem value='physical'>
                              <div>
                                <span className='font-medium'>Physical Product</span>
                                <p className='text-xs text-neutral-500 mt-0.5'>
                                  Tangible items that will be shipped to clients
                                </p>
                              </div>
                            </SelectItem>
                            <SelectItem value='package'>
                              <div>
                                <span className='font-medium'>Package</span>
                                <p className='text-xs text-neutral-500 mt-0.5'>
                                  Bundle of multiple products or services offered together
                                </p>
                              </div>
                            </SelectItem>
                            <SelectItem value='other'>
                              <div>
                                <span className='font-medium'>Other</span>
                                <p className='text-xs text-neutral-500 mt-0.5'>
                                  Custom deliverable type not listed above
                                </p>
                              </div>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                        {formData.deliverableType === 'other' && (
                          <div className='mt-2'>
                            <Input
                              id='customDeliverableType'
                              name='customDeliverableType'
                              value={formData.customDeliverableType || ''}
                              onChange={handleChange}
                              placeholder='Specify deliverable type'
                              className='text-sm'
                            />
                          </div>
                        )}
                      </div>
                      <div className='space-y-1'>
                        <Label
                          htmlFor='availabilityDate'
                          className='text-sm font-medium text-neutral-700'
                        >
                          Available From <span className='text-red-500'>*</span>
                        </Label>
                        <Input
                          id='availabilityDate'
                          name='availabilityDate'
                          value={formData.availabilityDate}
                          onChange={handleChange}
                          type='date'
                          className={`transition-shadow duration-150 focus:ring-1 focus:ring-neutral-200 ${
                            errors.availabilityDate ? 'border-red-500' : ''
                          }`}
                        />
                        {errors.availabilityDate && (
                          <p className='text-xs text-red-500 mt-1'>{errors.availabilityDate}</p>
                        )}
                        <span className='text-xs text-neutral-500'>
                          Date from which this deliverable can be used
                        </span>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value='custom-fields'
                    className='p-4 sm:p-5 m-0 data-[state=inactive]:hidden'
                  >
                    <div className='space-y-5 max-w-3xl mx-auto'>
                      <div className='flex flex-col gap-2'>
                        <h3 className='text-sm font-medium text-neutral-700'>
                          Deliverable Content
                        </h3>
                        <p className='text-xs text-neutral-500'>
                          Add details about what&apos;s included in this deliverable.
                        </p>
                      </div>

                      <div className='bg-white border rounded-md p-5 min-h-[350px]'>
                        {formData.customFields.length === 0 ? (
                          <div className='h-full flex flex-col items-center justify-center text-center p-6'>
                            <div className='w-12 h-12 bg-neutral-50 rounded-full flex items-center justify-center mb-4'>
                              <FileText className='w-6 h-6 text-neutral-400' />
                            </div>
                            <h4 className='text-sm font-medium text-neutral-700 mb-2'>
                              No content yet
                            </h4>
                            <p className='text-xs text-neutral-500 mb-4 max-w-md'>
                              Start by adding content to describe what&apos;s included in this
                              deliverable.
                            </p>
                            <div className='flex flex-wrap gap-2 justify-center'>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  return addCustomField('shortText');
                                }}
                                className='text-xs'
                              >
                                <Type className='mr-1.5 w-3.5 h-3.5' />
                                Add Text
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  return addCustomField('bulletList');
                                }}
                                className='text-xs'
                              >
                                <List className='mr-1.5 w-3.5 h-3.5' />
                                Add List
                              </Button>
                              <Button
                                variant='outline'
                                size='sm'
                                onClick={() => {
                                  return addCustomField('specification');
                                }}
                                className='text-xs'
                              >
                                <AlertCircle className='mr-1.5 w-3.5 h-3.5' />
                                Add Specs
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <div className='space-y-4'>
                            {formData.customFields.map((field: any, index: number) => {
                              return (
                                <div key={field.id} className='group relative'>
                                  {/* Content block */}
                                  <div
                                    className={`rounded-md border p-3 transition-colors ${
                                      editingFieldId === field.id
                                        ? 'border-blue-200 bg-blue-50/30'
                                        : 'border-transparent hover:border-neutral-200 hover:bg-neutral-50'
                                    }`}
                                    onClick={() => {
                                      return setEditingFieldId(field.id);
                                    }}
                                  >
                                    {/* Control buttons - only show when editing or hovering */}
                                    {(editingFieldId === field.id || true) && (
                                      <div
                                        className={`absolute right-3 top-3 bg-white rounded-md border border-neutral-100 shadow-sm ${
                                          editingFieldId === field.id
                                            ? 'flex'
                                            : 'hidden group-hover:flex'
                                        }`}
                                      >
                                        <Button
                                          variant='ghost'
                                          size='icon'
                                          className='h-7 w-7 text-neutral-500'
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            return moveFieldUp(index);
                                          }}
                                          disabled={index === 0}
                                        >
                                          <MoveUp size={14} />
                                        </Button>
                                        <Button
                                          variant='ghost'
                                          size='icon'
                                          className='h-7 w-7 text-neutral-500'
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            return moveFieldDown(index);
                                          }}
                                          disabled={index === formData.customFields.length - 1}
                                        >
                                          <MoveDown size={14} />
                                        </Button>
                                        <Button
                                          variant='ghost'
                                          size='icon'
                                          className='h-7 w-7 text-red-500 hover:text-red-600 hover:bg-red-50'
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            return removeCustomField(field.id);
                                          }}
                                        >
                                          <Trash2 size={14} />
                                        </Button>
                                      </div>
                                    )}

                                    {/* EDIT MODE - Type-specific content editors */}
                                    {editingFieldId === field.id ? (
                                      <>
                                        {field.type === 'shortText' && (
                                          <div className='space-y-1 max-w-2xl'>
                                            <Input
                                              value={field.label || ''}
                                              onChange={(e) => {
                                                return updateFieldProperty(
                                                  field.id,
                                                  'label',
                                                  e.target.value,
                                                );
                                              }}
                                              className='text-base font-medium text-neutral-800 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-400'
                                              placeholder='Enter heading...'
                                            />
                                            <Input
                                              value={field.content || ''}
                                              onChange={(e) => {
                                                return updateFieldProperty(
                                                  field.id,
                                                  'content',
                                                  e.target.value,
                                                );
                                              }}
                                              className='border-none p-0 h-auto text-sm text-neutral-600 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-400'
                                              placeholder='Enter text...'
                                            />
                                          </div>
                                        )}

                                        {field.type === 'longText' && (
                                          <div className='space-y-1 max-w-2xl'>
                                            <Input
                                              value={field.label || ''}
                                              onChange={(e) => {
                                                return updateFieldProperty(
                                                  field.id,
                                                  'label',
                                                  e.target.value,
                                                );
                                              }}
                                              className='text-base font-medium text-neutral-800 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-400'
                                              placeholder='Enter heading...'
                                            />
                                            <Textarea
                                              value={field.content || ''}
                                              onChange={(e) => {
                                                return updateFieldProperty(
                                                  field.id,
                                                  'content',
                                                  e.target.value,
                                                );
                                              }}
                                              className='border-none p-0 text-sm text-neutral-600 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-400 min-h-[80px] resize-none'
                                              placeholder='Enter detailed description...'
                                            />
                                          </div>
                                        )}

                                        {field.type === 'bulletList' && (
                                          <div className='space-y-2 max-w-2xl'>
                                            <Input
                                              value={field.label || ''}
                                              onChange={(e) => {
                                                return updateFieldProperty(
                                                  field.id,
                                                  'label',
                                                  e.target.value,
                                                );
                                              }}
                                              className='text-base font-medium text-neutral-800 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-400'
                                              placeholder='List title...'
                                            />
                                            <div className='pl-2'>
                                              <Textarea
                                                value={field.content || ''}
                                                onChange={(e) => {
                                                  return updateFieldProperty(
                                                    field.id,
                                                    'content',
                                                    e.target.value,
                                                  );
                                                }}
                                                className='border-none p-0 text-sm text-neutral-600 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-400 min-h-[80px] resize-none'
                                                placeholder='Enter items (one per line)...'
                                              />
                                            </div>
                                          </div>
                                        )}

                                        {field.type === 'numberList' && (
                                          <div className='space-y-2 max-w-2xl'>
                                            <Input
                                              value={field.label || ''}
                                              onChange={(e) => {
                                                return updateFieldProperty(
                                                  field.id,
                                                  'label',
                                                  e.target.value,
                                                );
                                              }}
                                              className='text-base font-medium text-neutral-800 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-400'
                                              placeholder='List title...'
                                            />
                                            <div className='pl-2'>
                                              <Textarea
                                                value={field.content || ''}
                                                onChange={(e) => {
                                                  return updateFieldProperty(
                                                    field.id,
                                                    'content',
                                                    e.target.value,
                                                  );
                                                }}
                                                className='border-none p-0 text-sm text-neutral-600 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-400 min-h-[80px] resize-none'
                                                placeholder='Enter items (one per line)...'
                                              />
                                            </div>
                                          </div>
                                        )}

                                        {field.type === 'link' && (
                                          <div className='space-y-2 max-w-2xl'>
                                            <Input
                                              value={field.label || ''}
                                              onChange={(e) => {
                                                return updateFieldProperty(
                                                  field.id,
                                                  'label',
                                                  e.target.value,
                                                );
                                              }}
                                              className='text-base font-medium text-neutral-800 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-400'
                                              placeholder='Link title...'
                                            />
                                            <div className='flex items-center'>
                                              <LinkIcon className='w-4 h-4 text-neutral-400 mr-2' />
                                              <Input
                                                value={field.url || ''}
                                                onChange={(e) => {
                                                  return updateFieldProperty(
                                                    field.id,
                                                    'url',
                                                    e.target.value,
                                                  );
                                                }}
                                                className='border-none p-0 h-auto text-sm text-blue-600 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-400'
                                                placeholder='https://example.com'
                                              />
                                            </div>
                                          </div>
                                        )}

                                        {field.type === 'specification' && (
                                          <div className='space-y-3 max-w-2xl'>
                                            <Input
                                              value={field.label || ''}
                                              onChange={(e) => {
                                                return updateFieldProperty(
                                                  field.id,
                                                  'label',
                                                  e.target.value,
                                                );
                                              }}
                                              className='text-base font-medium text-neutral-800 border-none p-0 h-auto bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 placeholder:text-neutral-400'
                                              placeholder='Specifications'
                                            />
                                            <div className='grid grid-cols-2 gap-2 mt-1'>
                                              {field.specs ? (
                                                field.specs.map((spec: any, i: number) => {
                                                  return (
                                                    <div
                                                      key={i}
                                                      className='flex gap-2 items-center'
                                                    >
                                                      <Input
                                                        value={spec.name}
                                                        onChange={(e) => {
                                                          const newSpecs = [...field.specs];
                                                          newSpecs[i] = {
                                                            ...spec,
                                                            name: e.target.value,
                                                          };
                                                          updateFieldProperty(
                                                            field.id,
                                                            'specs',
                                                            newSpecs,
                                                          );
                                                        }}
                                                        className='text-xs font-medium border border-neutral-200 h-7 bg-white'
                                                        placeholder='Name'
                                                      />
                                                      <Input
                                                        value={spec.value}
                                                        onChange={(e) => {
                                                          const newSpecs = [...field.specs];
                                                          newSpecs[i] = {
                                                            ...spec,
                                                            value: e.target.value,
                                                          };
                                                          updateFieldProperty(
                                                            field.id,
                                                            'specs',
                                                            newSpecs,
                                                          );
                                                        }}
                                                        className='text-xs border border-neutral-200 h-7 bg-white'
                                                        placeholder='Value'
                                                      />
                                                      <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        className='h-6 w-6 text-red-500 hover:text-red-600 hover:bg-red-50'
                                                        onClick={(e) => {
                                                          e.stopPropagation();
                                                          const newSpecs = field.specs.filter(
                                                            (_: any, index: number) => {
                                                              return index !== i;
                                                            },
                                                          );
                                                          updateFieldProperty(
                                                            field.id,
                                                            'specs',
                                                            newSpecs,
                                                          );
                                                        }}
                                                      >
                                                        <X size={12} />
                                                      </Button>
                                                    </div>
                                                  );
                                                })
                                              ) : (
                                                <div className='col-span-2 p-3 border border-dashed border-neutral-200 rounded-md text-center'>
                                                  <p className='text-xs text-neutral-500 mb-2'>
                                                    No specifications yet
                                                  </p>
                                                </div>
                                              )}
                                            </div>
                                            <Button
                                              variant='outline'
                                              size='sm'
                                              onClick={(e) => {
                                                e.stopPropagation();
                                                const specs = field.specs || [];
                                                const newSpecs = [
                                                  ...specs,
                                                  { name: '', value: '' },
                                                ];
                                                updateFieldProperty(field.id, 'specs', newSpecs);
                                              }}
                                              className='text-xs mt-1 w-full'
                                            >
                                              <Plus className='mr-1.5 w-3 h-3' />
                                              Add Specification
                                            </Button>
                                          </div>
                                        )}

                                        {/* Done button */}
                                        <div className='mt-2 text-right'>
                                          <Button
                                            variant='ghost'
                                            size='sm'
                                            className='text-xs text-blue-600 hover:text-blue-700'
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              setEditingFieldId(null);
                                            }}
                                          >
                                            Done
                                          </Button>
                                        </div>
                                      </>
                                    ) : (
                                      /* VIEW MODE - Formatted content display */
                                      <>
                                        {field.type === 'shortText' && (
                                          <div className='space-y-1 max-w-2xl'>
                                            {field.label && (
                                              <h3 className='text-base font-medium text-neutral-800'>
                                                {field.label}
                                              </h3>
                                            )}
                                            {field.content && (
                                              <p className='text-sm text-neutral-600'>
                                                {field.content}
                                              </p>
                                            )}
                                          </div>
                                        )}

                                        {field.type === 'longText' && (
                                          <div className='space-y-2 max-w-2xl'>
                                            {field.label && (
                                              <h3 className='text-base font-medium text-neutral-800'>
                                                {field.label}
                                              </h3>
                                            )}
                                            {field.content && (
                                              <div className='text-sm text-neutral-600 whitespace-pre-wrap'>
                                                {field.content}
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {field.type === 'bulletList' && (
                                          <div className='space-y-2 max-w-2xl'>
                                            {field.label && (
                                              <h3 className='text-base font-medium text-neutral-800'>
                                                {field.label}
                                              </h3>
                                            )}
                                            {field.content && (
                                              <ul className='list-disc pl-5 text-sm text-neutral-600 space-y-1'>
                                                {field.content
                                                  .split('\n')
                                                  .filter(Boolean)
                                                  .map((item: string, i: number) => {
                                                    return <li key={i}>{item}</li>;
                                                  })}
                                              </ul>
                                            )}
                                          </div>
                                        )}

                                        {field.type === 'numberList' && (
                                          <div className='space-y-2 max-w-2xl'>
                                            {field.label && (
                                              <h3 className='text-base font-medium text-neutral-800'>
                                                {field.label}
                                              </h3>
                                            )}
                                            {field.content && (
                                              <ol className='list-decimal pl-5 text-sm text-neutral-600 space-y-1'>
                                                {field.content
                                                  .split('\n')
                                                  .filter(Boolean)
                                                  .map((item: string, i: number) => {
                                                    return <li key={i}>{item}</li>;
                                                  })}
                                              </ol>
                                            )}
                                          </div>
                                        )}

                                        {field.type === 'link' && (
                                          <div className='space-y-2 max-w-2xl'>
                                            {field.url && (
                                              <div className='flex items-center'>
                                                <LinkIcon className='w-4 h-4 text-blue-500 mr-2 flex-shrink-0' />
                                                <a
                                                  href={field.url}
                                                  target='_blank'
                                                  rel='noopener noreferrer'
                                                  className='text-blue-600 hover:text-blue-800 hover:underline text-sm font-medium'
                                                  onClick={(e) => {
                                                    return e.stopPropagation();
                                                  }}
                                                >
                                                  {field.label || field.url}
                                                </a>
                                              </div>
                                            )}
                                          </div>
                                        )}

                                        {field.type === 'specification' && (
                                          <div className='space-y-3 max-w-2xl'>
                                            {field.label && (
                                              <h3 className='text-base font-medium text-neutral-800'>
                                                {field.label}
                                              </h3>
                                            )}
                                            {field.specs?.length > 0 ? (
                                              <div className='grid grid-cols-2 gap-x-6 gap-y-2'>
                                                {field.specs.map((spec: any, i: number) => {
                                                  return (
                                                    spec.name && (
                                                      <div
                                                        key={i}
                                                        className='flex items-baseline justify-between border-b border-neutral-100 pb-1'
                                                      >
                                                        <span className='text-sm font-medium text-neutral-700'>
                                                          {spec.name}:
                                                        </span>
                                                        <span className='text-sm text-neutral-600'>
                                                          {spec.value || '—'}
                                                        </span>
                                                      </div>
                                                    )
                                                  );
                                                })}
                                              </div>
                                            ) : null}
                                          </div>
                                        )}

                                        {/* "Click to edit" hint on hover */}
                                        <div className='hidden group-hover:block absolute top-2 right-16 bg-neutral-100 text-neutral-500 text-xs px-2 py-1 rounded'>
                                          Click to edit
                                        </div>
                                      </>
                                    )}
                                  </div>
                                </div>
                              );
                            })}

                            {/* Add more content button */}
                            <div className='flex gap-2 pt-4'>
                              <div className='relative'>
                                <Button
                                  variant='outline'
                                  onClick={() => {
                                    const menu = document.getElementById('addContentMenu');
                                    if (menu) menu.classList.toggle('hidden');
                                  }}
                                  className='flex items-center text-sm'
                                >
                                  <Plus className='mr-2 w-4 h-4' />
                                  Add Content
                                </Button>
                                <div
                                  id='addContentMenu'
                                  className='hidden absolute left-0 top-full mt-1 z-10 bg-white rounded-md border border-neutral-200 shadow-md p-1.5 w-48'
                                >
                                  <button
                                    className='flex items-center text-sm w-full text-left rounded px-3 py-2 hover:bg-neutral-50'
                                    onClick={() => {
                                      addCustomField('shortText');
                                      document
                                        .getElementById('addContentMenu')
                                        ?.classList.add('hidden');
                                    }}
                                  >
                                    <Type className='mr-2 w-4 h-4 text-neutral-500' />
                                    Short Text
                                  </button>
                                  <button
                                    className='flex items-center text-sm w-full text-left rounded px-3 py-2 hover:bg-neutral-50'
                                    onClick={() => {
                                      addCustomField('longText');
                                      document
                                        .getElementById('addContentMenu')
                                        ?.classList.add('hidden');
                                    }}
                                  >
                                    <FileText className='mr-2 w-4 h-4 text-neutral-500' />
                                    Long Text
                                  </button>
                                  <button
                                    className='flex items-center text-sm w-full text-left rounded px-3 py-2 hover:bg-neutral-50'
                                    onClick={() => {
                                      addCustomField('bulletList');
                                      document
                                        .getElementById('addContentMenu')
                                        ?.classList.add('hidden');
                                    }}
                                  >
                                    <List className='mr-2 w-4 h-4 text-neutral-500' />
                                    Bullet List
                                  </button>
                                  <button
                                    className='flex items-center text-sm w-full text-left rounded px-3 py-2 hover:bg-neutral-50'
                                    onClick={() => {
                                      addCustomField('numberList');
                                      document
                                        .getElementById('addContentMenu')
                                        ?.classList.add('hidden');
                                    }}
                                  >
                                    <ListChecks className='mr-2 w-4 h-4 text-neutral-500' />
                                    Numbered List
                                  </button>
                                  <button
                                    className='flex items-center text-sm w-full text-left rounded px-3 py-2 hover:bg-neutral-50'
                                    onClick={() => {
                                      addCustomField('link');
                                      document
                                        .getElementById('addContentMenu')
                                        ?.classList.add('hidden');
                                    }}
                                  >
                                    <LinkIcon className='mr-2 w-4 h-4 text-neutral-500' />
                                    Link
                                  </button>
                                  <button
                                    className='flex items-center text-sm w-full text-left rounded px-3 py-2 hover:bg-neutral-50'
                                    onClick={() => {
                                      addCustomField('specification');
                                      document
                                        .getElementById('addContentMenu')
                                        ?.classList.add('hidden');
                                    }}
                                  >
                                    <AlertCircle className='mr-2 w-4 h-4 text-neutral-500' />
                                    Specifications
                                  </button>
                                </div>
                              </div>
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent
                    value='review-notes'
                    className='p-4 sm:p-5 m-0 data-[state=inactive]:hidden'
                  >
                    <div className='space-y-6 max-w-3xl mx-auto'>
                      <div className='flex items-center justify-between mb-2'>
                        <div>
                          <h3 className='text-base font-medium text-neutral-800'>
                            Deliverable Summary
                          </h3>
                          <p className='text-sm text-neutral-500'>
                            Review your deliverable before creating it
                          </p>
                        </div>
                        <div className='px-3 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-medium border border-blue-100'>
                          Ready to Create
                        </div>
                      </div>

                      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                        <div className='bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden'>
                          <div className='px-5 py-3 bg-neutral-50 border-b border-neutral-200'>
                            <h4 className='text-sm font-medium text-neutral-800 flex items-center'>
                              <FileText className='w-4 h-4 mr-2 text-neutral-500' />
                              Basic Information
                            </h4>
                          </div>
                          <div className='p-4 space-y-3'>
                            <div className='space-y-1'>
                              <div className='text-xs font-medium text-neutral-500'>Name</div>
                              <div className='text-sm font-medium text-neutral-800'>
                                {formData.name || '—'}
                              </div>
                            </div>
                            <div className='space-y-1'>
                              <div className='text-xs font-medium text-neutral-500'>
                                Description
                              </div>
                              <div className='text-sm text-neutral-700'>
                                {formData.description || '—'}
                              </div>
                            </div>
                            <div className='space-y-1'>
                              <div className='text-xs font-medium text-neutral-500'>
                                Invoice Price
                              </div>
                              <div className='text-sm font-bold text-neutral-800'>
                                {formData.price || '—'}
                              </div>
                            </div>
                            <div className='space-y-1'>
                              <div className='text-xs font-medium text-neutral-500'>Type</div>
                              <div className='text-sm text-neutral-700'>
                                {formData.deliverableType === 'other'
                                  ? `Other: ${formData.customDeliverableType || 'Not specified'}`
                                  : formData.deliverableType === 'digital'
                                  ? 'Digital Product'
                                  : formData.deliverableType === 'service'
                                  ? 'Custom Service'
                                  : formData.deliverableType === 'physical'
                                  ? 'Physical Product'
                                  : formData.deliverableType === 'package'
                                  ? 'Package'
                                  : formData.deliverableType || '—'}
                              </div>
                            </div>
                            <div className='space-y-1'>
                              <div className='text-xs font-medium text-neutral-500'>
                                Available From
                              </div>
                              <div className='text-sm text-neutral-700'>
                                {formData.availabilityDate || '—'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className='bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden'>
                          <div className='px-5 py-3 bg-neutral-50 border-b border-neutral-200'>
                            <h4 className='text-sm font-medium text-neutral-800 flex items-center'>
                              <Settings className='w-4 h-4 mr-2 text-neutral-500' />
                              Deliverable Content
                              <span className='ml-2 px-2 py-0.5 bg-neutral-100 text-neutral-600 rounded-full text-xs'>
                                {formData.customFields.length || '0'}
                              </span>
                            </h4>
                          </div>
                          <div className='p-4'>
                            {formData.customFields.length === 0 ? (
                              <div className='text-sm text-neutral-500 italic'>
                                No custom content added
                              </div>
                            ) : (
                              <div className='max-h-[300px] overflow-y-auto pr-2 space-y-4'>
                                {formData.customFields.map((field: any) => {
                                  return (
                                    <div
                                      key={field.id}
                                      className='pb-3 border-b border-neutral-100 last:border-0 last:pb-0'
                                    >
                                      <div className='flex items-center mb-1'>
                                        {
                                          FIELD_TYPES.find((f) => {
                                            return f.id === field.type;
                                          })?.icon
                                        }
                                        <span className='text-sm font-medium text-neutral-700 ml-1.5'>
                                          {field.label}
                                        </span>
                                      </div>

                                      {field.content && (
                                        <div className='text-sm text-neutral-600 mt-1 pl-6'>
                                          {field.content}
                                        </div>
                                      )}

                                      {field.url && (
                                        <div className='text-sm text-blue-600 mt-1 pl-6 truncate'>
                                          {field.url}
                                        </div>
                                      )}
                                    </div>
                                  );
                                })}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className='bg-white rounded-lg border border-neutral-200 shadow-sm overflow-hidden'>
                        <div className='px-5 py-3 bg-neutral-50 border-b border-neutral-200'>
                          <h4 className='text-sm font-medium text-neutral-800 flex items-center'>
                            <ListChecks className='w-4 h-4 mr-2 text-neutral-500' />
                            Internal Notes
                            <span className='ml-2 text-xs text-neutral-500 bg-neutral-100 px-2 py-0.5 rounded-full'>
                              Not shown to clients
                            </span>
                          </h4>
                        </div>
                        <div className='p-4'>
                          <Textarea
                            id='teamNotes'
                            name='teamNotes'
                            value={formData.teamNotes}
                            onChange={handleChange}
                            placeholder='Add production requirements or other notes for your team'
                            rows={3}
                            className='resize-none transition-shadow duration-150 focus:ring-1 focus:ring-neutral-200 mb-3'
                          />
                          <p className='text-xs text-neutral-500 mb-3'>
                            These notes are only for your team and won&apos;t be visible to clients.
                          </p>
                          <h5 className='text-xs font-medium text-neutral-600 mb-1'>
                            Current Notes:
                          </h5>
                          {formData.teamNotes ? (
                            <div className='text-sm text-neutral-700 bg-neutral-50 p-3 rounded-md border border-neutral-100'>
                              {formData.teamNotes}
                            </div>
                          ) : (
                            <div className='text-sm text-neutral-500 italic'>
                              No internal notes added
                            </div>
                          )}
                        </div>
                      </div>

                      <div className='bg-gradient-to-r from-blue-50 to-indigo-50 rounded-lg border border-blue-100 p-4 flex items-center'>
                        <div className='bg-white p-2 rounded-full shadow-sm mr-3'>
                          <AlertCircle className='w-5 h-5 text-blue-500' />
                        </div>
                        <div>
                          <h4 className='text-sm font-medium text-blue-700'>Next Steps</h4>
                          <p className='text-xs text-blue-600 mt-0.5'>
                            After creating this deliverable, you can attach it to invoices when
                            billing your clients.
                          </p>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Footer (fixed) */}
        <div className='flex justify-between px-5 py-4 border-t border-neutral-100 bg-white z-10 shadow-sm flex-shrink-0'>
          {getCurrentStageIndex() > 0 ? (
            <Button
              variant='outline'
              onClick={handleBack}
              className='text-sm font-normal border-neutral-200 hover:bg-neutral-50 transition-colors duration-150'
            >
              <ChevronLeft className='mr-1.5 h-3.5 w-3.5' />
              Back
            </Button>
          ) : (
            <div></div> // Empty div to maintain flex layout
          )}

          {getCurrentStageIndex() < STAGES.length - 1 ? (
            <Button
              onClick={handleNext}
              className='text-sm font-normal transition-colors duration-150'
            >
              Continue
              <ChevronRight className='ml-1.5 h-3.5 w-3.5' />
            </Button>
          ) : (
            <Button
              onClick={handleSubmit}
              disabled={isSubmitting}
              className='text-sm font-normal transition-colors duration-150'
            >
              {isSubmitting ? 'Creating...' : 'Create Deliverable'}
            </Button>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewDeliverableDialog;
