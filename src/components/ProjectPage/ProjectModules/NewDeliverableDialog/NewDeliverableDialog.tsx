import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ChevronLeft, ChevronRight, FileText, ListChecks, Menu, Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';

// Import tab components
import BasicDetailsTab from './Tabs/BasicDetailsTab';
import DeliverableContentTab from './Tabs/DeliverableContentTab';
import ReviewTab from './Tabs/ReviewTab';

// Import the context provider
import { DeliverableFormProvider, useDeliverableForm } from './DeliverableFormContext';

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

// Main component wrapper that provides the context
const NewDeliverableDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  return (
    <DeliverableFormProvider>
      <NewDeliverableDialogContent isOpen={isOpen} onClose={onClose} />
    </DeliverableFormProvider>
  );
};

// Inner component that consumes the context
const NewDeliverableDialogContent = ({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) => {
  const {
    formData,
    errors,
    editingFieldId,
    hasUnsavedChanges,
    setEditingFieldId,
    setHasUnsavedChanges,
    setErrors,
  } = useDeliverableForm();

  const [currentStage, setCurrentStage] = useState(STAGES[0].value);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);

  // Navigate to next stage
  const handleNext = () => {
    if (!validateCurrentStage()) {
      // Show an error toast or message
      // Focus the first field with an error
      const firstErrorField = document.querySelector('[aria-invalid="true"]');
      if (firstErrorField) {
        (firstErrorField as HTMLElement).focus();
      }
      return;
    }

    const currentIndex = STAGES.findIndex((stage) => {
      return stage.value === currentStage;
    });

    if (currentIndex < STAGES.length - 1) {
      // Clear editing mode when changing tabs
      setEditingFieldId(null);
      // Set the new stage
      setCurrentStage(STAGES[currentIndex + 1].value);
    }
  };

  // Navigate to previous stage
  const handleBack = () => {
    // Always clear editing mode when changing tabs
    setEditingFieldId(null);

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

  // Get current stage title
  const getCurrentStageTitle = () => {
    const stage = STAGES.find((s) => {
      return s.value === currentStage;
    });
    return stage ? stage.title : '';
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

  // Validate form based on current stage
  const validateCurrentStage = () => {
    const newErrors: { [key: string]: string } = {};

    if (currentStage === 'general-info') {
      if (!formData.name.trim()) {
        newErrors.name = 'Deliverable name is required';
      }

      if (!formData.price.trim()) {
        newErrors.price = 'Price is required';
      } else if (!/^\$?(\d*(\.\d{0,2})?)$/.test(formData.price.trim())) {
        newErrors.price = 'Please enter a valid price';
      }
    } else if (currentStage === 'custom-fields') {
      // Validate content fields if needed
      if (formData.customFields.length === 0) {
        // Not showing an error, but could implement if required
      } else {
        // Validate that content fields have content
        formData.customFields.forEach((field: any, index: number) => {
          const fieldId = field.id;
          const fieldName = `customField_${index}`;

          if (!field.label || field.label.trim() === '') {
            newErrors[`${fieldName}_label`] = 'Field label is required';
          }

          // Check for content based on type
          switch (field.type) {
            case 'shortText':
            case 'longText':
            case 'specification':
              if (!field.content || field.content.trim() === '') {
                newErrors[`${fieldName}_content`] = `Content is required for "${
                  field.label || 'this field'
                }"`;
              }
              break;
            case 'bulletList':
            case 'numberList':
              if (!field.items || field.items.length === 0) {
                newErrors[`${fieldName}_items`] = `At least one item is required for "${
                  field.label || 'this list'
                }"`;
              }
              break;
            case 'link':
              if (!field.url || field.url.trim() === '') {
                newErrors[`${fieldName}_url`] = `URL is required for "${
                  field.label || 'this link'
                }"`;
              }
              break;
          }
        });
      }
    } else if (currentStage === 'review-notes') {
      // Validation for review stage isn't typically needed
      // But could check that all previous validations pass
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
  }, [editingFieldId, setEditingFieldId]);

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-[95vw] sm:max-w-[1000px] md:max-w-[1200px] lg:max-w-[1400px] p-0 overflow-hidden shadow-sm border-neutral-200 transition-all duration-150 ease-in-out h-[95vh] sm:h-[800px] md:h-[800px] flex flex-col'>
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
                    <BasicDetailsTab />
                  </TabsContent>

                  <TabsContent
                    value='custom-fields'
                    className='p-4 sm:p-5 m-0 data-[state=inactive]:hidden'
                  >
                    <DeliverableContentTab />
                  </TabsContent>

                  <TabsContent
                    value='review-notes'
                    className='p-4 sm:p-5 m-0 data-[state=inactive]:hidden'
                  >
                    <ReviewTab />
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
