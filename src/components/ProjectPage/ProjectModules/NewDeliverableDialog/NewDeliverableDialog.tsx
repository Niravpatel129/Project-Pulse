import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { newRequest } from '@/utils/newRequest';
import { ChevronLeft, ChevronRight, FileText, ListChecks, Menu, Settings, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

// Import tab components
import BasicDetailsTab from './Tabs/BasicDetailsTab';
import DeliverableContentTab from './Tabs/DeliverableContentTab';
import ReviewTab from './Tabs/ReviewTab';

// Import the context provider
import { useProject } from '@/contexts/ProjectContext';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
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

// Fetch deliverable by ID
const fetchDeliverable = async (id: string) => {
  if (!id) return null;
  const response = await newRequest.get(`/deliverables/${id}`);
  return response.data.data || null;
};

// Create a new deliverable
const createDeliverable = async (formData: FormData) => {
  const response = await newRequest.post('/deliverables', formData);
  return response.data.data;
};

// Update an existing deliverable
const updateDeliverable = async ({ id, formData }: { id: string; formData: FormData }) => {
  const response = await newRequest.put(`/deliverables/${id}`, formData);
  return response.data.data;
};

/**
 * DeliverableDialog Component
 * Used for both creating new deliverables and editing existing ones
 * If deliverableId is provided, it operates in edit mode, otherwise in create mode
 */
const NewDeliverableDialog = ({
  isOpen,
  onClose,
  deliverableId,
  previewMode = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  deliverableId?: string | null;
  previewMode?: boolean;
}) => {
  return (
    <DeliverableFormProvider>
      <DeliverableDialogContent
        isOpen={isOpen}
        onClose={onClose}
        deliverableId={deliverableId}
        previewMode={previewMode}
      />
    </DeliverableFormProvider>
  );
};

// Inner component that consumes the context
const DeliverableDialogContent = ({
  isOpen,
  onClose,
  deliverableId,
  previewMode = false,
}: {
  isOpen: boolean;
  onClose: () => void;
  deliverableId?: string | null;
  previewMode?: boolean;
}) => {
  const {
    formData,
    errors,
    editingFieldId,
    hasUnsavedChanges,
    setFormData,
    setEditingFieldId,
    setHasUnsavedChanges,
    setErrors,
  } = useDeliverableForm();

  const [currentStage, setCurrentStage] = useState(previewMode ? STAGES[2].value : STAGES[0].value);
  const [isSidebarOpen, setSidebarOpen] = useState(true);
  const [showUnsavedWarning, setShowUnsavedWarning] = useState(false);
  const { project } = useProject();
  const isEditMode = !!deliverableId;
  const queryClient = useQueryClient();

  // Fetch deliverable data if in edit mode
  const { data: existingDeliverable, isLoading: isLoadingDeliverable } = useQuery({
    queryKey: ['deliverable', deliverableId],
    queryFn: () => {
      return fetchDeliverable(deliverableId || '');
    },
    enabled: isEditMode,
  });

  // Create mutation
  const createMutation = useMutation({
    mutationFn: createDeliverable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverables'] });
      setHasUnsavedChanges(false);
      onClose();
    },
    onError: (error: any) => {
      console.error('Error creating deliverable:', error);

      // Get error message from the API response
      const errorMessage = error.response?.data?.message || 'Failed to create deliverable';

      // Display error message to the user
      toast.error('Failed to create deliverable', {
        description: errorMessage,
      });

      // Check for specific validation errors
      if (errorMessage === 'Missing required fields') {
        // Set form to the general info tab if we need to fill in basic fields
        setCurrentStage('general-info');

        // If backend provides field names that are missing
        if (error.response?.data?.fields && Array.isArray(error.response.data.fields)) {
          const newErrors: { [key: string]: string } = {};
          error.response.data.fields.forEach((field: string) => {
            newErrors[field] = `${field} is required`;
          });
          setErrors(newErrors);
        } else {
          // Generic message if specific fields aren't provided
          setErrors({
            name: 'Deliverable name is required',
            price: 'Price is required',
          });
        }
      }
    },
  });

  // Update mutation
  const updateMutation = useMutation({
    mutationFn: updateDeliverable,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['deliverables'] });
      queryClient.invalidateQueries({ queryKey: ['deliverable', deliverableId] });
      setHasUnsavedChanges(false);
      onClose();
    },
    onError: (error: any) => {
      console.error('Error updating deliverable:', error);

      // Get error message from the API response
      const errorMessage = error.response?.data?.message || 'Failed to update deliverable';

      // Display error message to the user
      toast.error('Failed to update deliverable', {
        description: errorMessage,
      });

      // Check for specific validation errors
      if (errorMessage === 'Missing required fields') {
        // Set form to the general info tab if we need to fill in basic fields
        setCurrentStage('general-info');

        // If backend provides field names that are missing
        if (error.response?.data?.fields && Array.isArray(error.response.data.fields)) {
          const newErrors: { [key: string]: string } = {};
          error.response.data.fields.forEach((field: string) => {
            newErrors[field] = `${field} is required`;
          });
          setErrors(newErrors);
        } else {
          // Generic message if specific fields aren't provided
          setErrors({
            name: 'Deliverable name is required',
            price: 'Price is required',
          });
        }
      }
    },
  });

  // Check if either mutation is in progress
  const isSubmitting = createMutation.isPending || updateMutation.isPending;

  // Populate form with existing data when in edit mode
  useEffect(() => {
    if (isEditMode && existingDeliverable) {
      setFormData({
        name: existingDeliverable.name || '',
        description: existingDeliverable.description || '',
        price: existingDeliverable.price || '',
        deliverableType: existingDeliverable.deliverableType || 'default',
        customDeliverableType: existingDeliverable.customDeliverableType || '',
        customFields: existingDeliverable.customFields || [],
        teamNotes: existingDeliverable.teamNotes || '',
      });
      setHasUnsavedChanges(false);
    }
  }, [existingDeliverable, isEditMode, setFormData, setHasUnsavedChanges]);

  // Navigate to next stage
  const handleNext = () => {
    if (!validateCurrentStage()) {
      // Show error toast when validation fails
      toast.error('Please fix the validation errors before continuing', {
        description: 'Required fields are highlighted in red.',
      });

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

    try {
      // Create a FormData object for the HTTP request
      const requestFormData = new FormData();

      // Create a deep copy of the form data
      const processedData = JSON.parse(JSON.stringify(formData));

      // Process attachments and prepare files
      if (processedData.customFields && processedData.customFields.length > 0) {
        for (const field of processedData.customFields) {
          if (field.type === 'attachment' && field.attachments?.length > 0) {
            // Process each attachment
            field.attachments = await Promise.all(
              field.attachments.map(async (attachment: any) => {
                if (attachment.url && !attachment.firebaseUrl) {
                  // Only process new attachments that don't have a firebaseUrl
                  // Generate a unique file ID
                  const fileId = `file_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

                  // Fetch the file from the blob URL
                  try {
                    const response = await fetch(attachment.url);
                    const blob = await response.blob();

                    // Append the file to FormData with the fileId as the field name
                    requestFormData.append(fileId, blob, attachment.name);

                    // Return updated attachment object with fileId reference
                    return {
                      name: attachment.name,
                      type: attachment.type,
                      size: attachment.size,
                      fileId: fileId, // Reference to the file in FormData
                    };
                  } catch (error) {
                    console.error('Error fetching file from URL:', error);
                    // Return attachment without fileId if fetch fails
                    return {
                      name: attachment.name,
                      type: attachment.type,
                      size: attachment.size,
                    };
                  }
                }

                // Return attachment as is if no URL or if it already has a firebaseUrl
                return attachment;
              }),
            );
          }
        }
      }

      // Add project ID to form data
      const finalPayload = {
        ...processedData,
        project: project?._id,
      };

      // Append the JSON data to FormData
      requestFormData.append('data', JSON.stringify(finalPayload));

      // Send the request as FormData - either POST for new or PUT for update
      if (isEditMode && deliverableId) {
        updateMutation.mutate({ id: deliverableId, formData: requestFormData });
      } else {
        createMutation.mutate(requestFormData);
      }
    } catch (error) {
      console.error(`Error preparing ${isEditMode ? 'update' : 'create'} data:`, error);
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
        // Track the first field with an error to auto-focus
        let firstFieldWithError: string | null = null;

        // Validate that content fields have content
        formData.customFields.forEach((field: any, index: number) => {
          const fieldId = field.id;
          const fieldName = `customField_${index}`;

          if (!field.label || field.label.trim() === '') {
            newErrors[`${fieldName}_label`] = 'Field label is required';
            if (!firstFieldWithError) firstFieldWithError = fieldId;
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
                if (!firstFieldWithError) firstFieldWithError = fieldId;
              }
              break;
            case 'bulletList':
            case 'numberList':
              if (!field.items || field.items.length === 0) {
                newErrors[`${fieldName}_items`] = `At least one item is required for "${
                  field.label || 'this list'
                }"`;
                if (!firstFieldWithError) firstFieldWithError = fieldId;
              }
              break;
            case 'link':
              if (!field.url || field.url.trim() === '') {
                newErrors[`${fieldName}_url`] = `URL is required for "${
                  field.label || 'this link'
                }"`;
                if (!firstFieldWithError) firstFieldWithError = fieldId;
              }
              break;
          }
        });

        // If there are errors, put the first field with an error into edit mode
        if (firstFieldWithError) {
          setEditingFieldId(firstFieldWithError);
        }
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

  // Loading state while fetching deliverable data
  if (isEditMode && isLoadingDeliverable) {
    return (
      <Dialog open={isOpen} onOpenChange={handleClose}>
        <DialogContent className='max-w-[95vw] sm:max-w-[1000px] p-0 overflow-hidden shadow-sm border-neutral-200 h-[95vh] sm:h-[800px] flex items-center justify-center'>
          <DialogHeader className='sr-only'>
            <DialogTitle>{isEditMode ? 'Edit Deliverable' : 'Create Deliverable'}</DialogTitle>
          </DialogHeader>
          <div className='text-center'>Loading deliverable data...</div>
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className='max-w-[95vw] sm:max-w-[1000px] md:max-w-[1200px] lg:max-w-[1400px] p-0 overflow-hidden shadow-sm border-neutral-200 transition-all duration-150 ease-in-out h-[95vh] sm:h-[800px] md:h-[800px] flex flex-col'>
        {showUnsavedWarning && !previewMode && (
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
            {!previewMode && (
              <Button
                variant='ghost'
                size='icon'
                onClick={toggleSidebar}
                className='md:hidden mr-2'
              >
                <Menu size={18} />
              </Button>
            )}
            <DialogTitle className='text-base font-medium'>
              {previewMode
                ? 'Deliverable Details'
                : isEditMode
                ? 'Edit Deliverable'
                : 'Create Deliverable'}
            </DialogTitle>
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
              {/* Sidebar - hide completely in preview mode */}
              {!previewMode && (
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
                        <span className={`${!isSidebarOpen ? 'md:hidden' : ''}`}>
                          {stage.title}
                        </span>
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
              )}

              {/* Dark overlay for mobile when sidebar is open */}
              {!previewMode && isSidebarOpen && (
                <div
                  className='md:hidden fixed inset-0 bg-black bg-opacity-40 z-0'
                  onClick={() => {
                    return setSidebarOpen(false);
                  }}
                />
              )}

              {/* Main content area */}
              <div className='flex-1 flex flex-col min-h-0'>
                {/* Mobile breadcrumb - hide in preview mode */}
                {!previewMode && (
                  <div className='md:hidden bg-neutral-50/80 px-4 py-3 border-b border-neutral-100 flex items-center flex-shrink-0'>
                    <span className='text-sm font-medium text-neutral-900'>
                      {getCurrentStageTitle()}
                    </span>
                  </div>
                )}

                {/* Scrollable tab content */}
                <div className='flex-1 overflow-y-auto'>
                  {!previewMode && (
                    <>
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
                    </>
                  )}

                  <TabsContent
                    value='review-notes'
                    className='p-4 sm:p-5 m-0 data-[state=inactive]:hidden'
                  >
                    <ReviewTab previewMode={previewMode} />
                  </TabsContent>
                </div>
              </div>
            </div>
          </Tabs>
        </div>

        {/* Footer (fixed) - show simplified footer in preview mode */}
        <div className='flex justify-between px-5 py-4 border-t border-neutral-100 bg-white z-10 shadow-sm flex-shrink-0'>
          {previewMode ? (
            <Button
              onClick={onClose}
              className='ml-auto text-sm font-normal transition-colors duration-150'
            >
              Close
            </Button>
          ) : (
            <>
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
                  {isSubmitting
                    ? isEditMode
                      ? 'Updating...'
                      : 'Creating...'
                    : isEditMode
                    ? 'Update Deliverable'
                    : 'Create Deliverable'}
                </Button>
              )}
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewDeliverableDialog;
