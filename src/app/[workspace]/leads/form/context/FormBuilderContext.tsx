'use client';

import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { FormElement, FormValues } from '../types';
import { generateId } from '../utils';

// Define the automation types
type AutomationType = 'send_email' | 'create_project' | 'assign_project_manager';

// Define the automation interface
interface Automation {
  id: string;
  name: string;
  type: AutomationType;
  enabled: boolean;
  config?: Record<string, any>;
}

type FormBuilderContextType = {
  // State
  formElements: FormElement[];
  changesSaved: boolean;
  activeTab: string;
  selectedElementId: string | null;
  editingElement: FormElement | null;
  showConditionBuilder: boolean;
  previewMode: boolean;
  formValues: FormValues;
  isDragging: boolean;
  draggedElementId: string | null;
  dragOverElementId: string | null;
  showElementTypeMenu: boolean;
  elementTypeMenuPosition: { x: number; y: number };
  showValidationSettings: boolean;
  showMobileNav: boolean;
  showMobileMenu: boolean;
  isMobile: boolean;
  validationErrors: string[];
  isEditMode: boolean;
  formId: string | undefined;
  automations: Automation[];

  // Functions
  setFormElements: React.Dispatch<React.SetStateAction<FormElement[]>>;
  setChangesSaved: React.Dispatch<React.SetStateAction<boolean>>;
  setActiveTab: React.Dispatch<React.SetStateAction<string>>;
  setSelectedElementId: React.Dispatch<React.SetStateAction<string | null>>;
  setEditingElement: React.Dispatch<React.SetStateAction<FormElement | null>>;
  setShowConditionBuilder: React.Dispatch<React.SetStateAction<boolean>>;
  setPreviewMode: React.Dispatch<React.SetStateAction<boolean>>;
  setFormValues: React.Dispatch<React.SetStateAction<FormValues>>;
  setIsDragging: React.Dispatch<React.SetStateAction<boolean>>;
  setDraggedElementId: React.Dispatch<React.SetStateAction<string | null>>;
  setDragOverElementId: React.Dispatch<React.SetStateAction<string | null>>;
  setShowElementTypeMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setElementTypeMenuPosition: React.Dispatch<React.SetStateAction<{ x: number; y: number }>>;
  setShowValidationSettings: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMobileNav: React.Dispatch<React.SetStateAction<boolean>>;
  setShowMobileMenu: React.Dispatch<React.SetStateAction<boolean>>;
  setValidationErrors: React.Dispatch<React.SetStateAction<string[]>>;

  // Helper functions
  addElement: (elementType: string) => void;
  addClientDetailsSection: () => void;
  saveChanges: () => void;
  selectElement: (id: string) => void;
  deleteElement: (id: string) => void;
  openElementEditor: (element: FormElement) => void;
  saveElementChanges: (updatedElement: FormElement) => void;
  removeCondition: (elementId: string, conditionId: string) => void;
  handleFormValueChange: (elementId: string, value: string | string[] | boolean | number) => void;
  handleDragStart: (e: React.DragEvent, elementId: string) => void;
  handleDragOver: (e: React.DragEvent, elementId: string) => void;
  handleDrop: (e: React.DragEvent, targetElementId: string) => void;
  handleDragEnd: () => void;
  showElementMenu: (e: React.MouseEvent) => void;
  duplicateElement: (elementId: string) => void;
  generateId: () => string;
  validateForm: () => boolean;
  setFormTitle: (title: string) => void;
  formTitle: string;

  // Automation functions
  addAutomation: (automation?: Automation) => void;
  editAutomation: (automation: Automation) => void;
  deleteAutomation: (id: string) => void;
  toggleAutomation: (id: string) => void;
  getDefaultAutomations: () => Automation[];
};

const FormBuilderContext = createContext<FormBuilderContextType | undefined>(undefined);

export const useFormBuilder = () => {
  const context = useContext(FormBuilderContext);
  if (context === undefined) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  }
  return context;
};

export const FormBuilderProvider: React.FC<{
  children: ReactNode;
  formId?: string;
  isEditMode?: boolean;
}> = ({ children, formId, isEditMode = false }) => {
  const [formElements, setFormElements] = useState<FormElement[]>([]);
  const [changesSaved, setChangesSaved] = useState(true);
  const [activeTab, setActiveTab] = useState('elements');
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingElement, setEditingElement] = useState<FormElement | null>(null);
  const [showConditionBuilder, setShowConditionBuilder] = useState(false);
  const [previewMode, setPreviewMode] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({});
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOverElementId, setDragOverElementId] = useState<string | null>(null);
  const [showElementTypeMenu, setShowElementTypeMenu] = useState(false);
  const [elementTypeMenuPosition, setElementTypeMenuPosition] = useState({ x: 0, y: 0 });
  const [showValidationSettings, setShowValidationSettings] = useState(false);
  const [showMobileNav, setShowMobileNav] = useState(false);
  const [showMobileMenu, setShowMobileMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [formTitle, setFormTitle] = useState('Untitled form');
  const [automations, setAutomations] = useState<Automation[]>([]);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const router = useRouter();
  const queryClient = useQueryClient();

  // Fetch existing form data if in edit mode
  const { data: formData, isLoading: isLoadingForm } = useQuery({
    queryKey: ['lead-form', formId],
    queryFn: async () => {
      if (!formId) return null;
      const { data } = await newRequest.get(`/lead-forms/${formId}`);
      return data;
    },
    enabled: isEditMode && !!formId,
  });

  // Create default automations only on initial load for new forms
  useEffect(() => {
    if (!isEditMode && !initialLoadComplete) {
      setAutomations(getDefaultAutomations());
      setInitialLoadComplete(true);
    }
  }, [isEditMode, initialLoadComplete]);

  // Initialize form with existing data if in edit mode
  useEffect(() => {
    if (isEditMode && formData && !isLoadingForm) {
      setFormTitle(formData.title || 'Untitled form');
      if (formData.elements && Array.isArray(formData.elements)) {
        setFormElements(formData.elements);
      }
      if (formData.automations && Array.isArray(formData.automations)) {
        setAutomations(formData.automations);
      } else if (!initialLoadComplete) {
        // Only set default automations if this is the first load
        setAutomations(getDefaultAutomations());
      }
      setInitialLoadComplete(true);
      setChangesSaved(true);
    }
  }, [isEditMode, formData, isLoadingForm, initialLoadComplete]);

  // Initialize form values for preview mode
  useEffect(() => {
    if (previewMode) {
      const initialValues: FormValues = {};
      formElements.forEach((element) => {
        if (element.defaultValue) {
          initialValues[element.id] = element.defaultValue;
        } else if (element.type === 'Checkboxes') {
          initialValues[element.id] = [];
        } else if (element.type === 'Rating') {
          initialValues[element.id] = 0;
        } else {
          initialValues[element.id] = '';
        }
      });
      setFormValues(initialValues);
    }
  }, [previewMode, formElements]);

  // Check if the device is mobile
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkIfMobile();
    window.addEventListener('resize', checkIfMobile);
    return () => {
      return window.removeEventListener('resize', checkIfMobile);
    };
  }, []);

  const createFormMutation = useMutation({
    mutationFn: (formData: any) => {
      return newRequest.post('/lead-forms', formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-forms'] });
      router.push('/leads');
    },
    onError: (error) => {
      console.error('Error submitting form:', error);
    },
  });

  const updateFormMutation = useMutation({
    mutationFn: (formData: any) => {
      return newRequest.put(`/lead-forms/${formId}`, formData);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['lead-forms'] });
      queryClient.invalidateQueries({ queryKey: ['lead-form', formId] });
      router.push('/leads');
    },
    onError: (error) => {
      console.error('Error updating form:', error);
    },
  });

  const addElement = (elementType: string) => {
    const newElement: FormElement = {
      id: generateId(),
      type: elementType,
      title: `New ${elementType}`,
      required: false,
      order: formElements.length,
      showWhen: 'all',
      options:
        elementType === 'Radio Buttons' ||
        elementType === 'Checkboxes' ||
        elementType === 'Dropdown'
          ? ['Option 1', 'Option 2', 'Option 3']
          : undefined,
    };

    setFormElements([...formElements, newElement]);
    setChangesSaved(false);
    // Switch to My Form tab after adding an element
    setActiveTab('myform');
    // Select the new element
    setSelectedElementId(newElement.id);
    // Hide the element type menu if it's open
    setShowElementTypeMenu(false);
  };

  const addClientDetailsSection = () => {
    const newElement: FormElement = {
      id: generateId(),
      type: 'Client Details',
      title: 'Contact Details',
      description: 'Contact Information',
      required: true, // Client details section is required
      order: formElements.length,
      showWhen: 'all',
      clientFields: {
        email: true, // Email is required by default
        name: false,
        phone: false,
        address: false,
        company: false,
        custom: [],
      },
    };

    // First update the form elements
    const updatedElements = [...formElements, newElement];
    setFormElements(updatedElements);
    setChangesSaved(false);

    // Switch to My Form tab after adding an element
    setActiveTab('myform');

    // Select the new element
    setSelectedElementId(newElement.id);

    // Hide the element type menu if it's open
    setShowElementTypeMenu(false);

    // Immediately validate with the updated elements to clear errors
    // instead of using setTimeout which can cause race conditions
    const errors: string[] = [];
    // No need to check for empty form since we just added an element

    // We know there is a Client Details section now, so no need to check
    // Just clear the validation errors
    setValidationErrors([]);

    return newElement.id;
  };

  const validateForm = () => {
    const errors: string[] = [];

    // Check if form has at least one element
    if (formElements.length === 0) {
      errors.push('Empty Form: Add at least one element to your form');
    }

    // Check if client details section exists
    const hasClientDetails = formElements.some((el) => {
      return el.type === 'Client Details';
    });
    if (!hasClientDetails) {
      errors.push(
        'Missing Client Details: Add a Client Details section to collect required client information',
      );
    }

    // Set the validation errors
    setValidationErrors(errors);

    // Return true if no errors, false otherwise
    return errors.length === 0;
  };

  const saveChanges = async () => {
    // Check if we have a Client Details section
    const hasClientDetails = formElements.some((el) => {
      return el.type === 'Client Details';
    });

    // If no client details section, show an error
    if (!hasClientDetails) {
      setValidationErrors([
        'Missing Client Details: Add a Client Details section to collect required client information',
      ]);
      return;
    }

    // Check if form is empty
    if (formElements.length === 0) {
      setValidationErrors(['Empty Form: Add at least one element to your form']);
      return;
    }

    // Clear validation errors
    setValidationErrors([]);

    // Prepare the form data to be saved
    const formData = {
      title: formTitle,
      elements: formElements,
      automations: automations,
      status: 'draft',
    };

    // Save the form
    try {
      if (isEditMode) {
        await updateFormMutation.mutateAsync(formData);
      } else {
        await createFormMutation.mutateAsync(formData);
      }
      setChangesSaved(true);
    } catch (error) {
      console.error('Error saving form:', error);
    }
  };

  const selectElement = (id: string) => {
    setSelectedElementId(id);
    // Scroll to the element in the form canvas
    const element = document.getElementById(`form-element-${id}`);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  const deleteElement = (id: string) => {
    // First, remove any conditions that reference this element
    const updatedElements = formElements.map((element) => {
      if (element.conditions) {
        return {
          ...element,
          conditions: element.conditions.filter((condition) => {
            return condition.sourceElementId !== id;
          }),
        };
      }
      return element;
    });

    // Then remove the element itself
    setFormElements(
      updatedElements.filter((element) => {
        return element.id !== id;
      }),
    );
    setChangesSaved(false);
    if (selectedElementId === id) {
      setSelectedElementId(null);
    }
  };

  const openElementEditor = (element: FormElement) => {
    setEditingElement({ ...element });
  };

  const saveElementChanges = (updatedElement: FormElement) => {
    const newElements = formElements.map((el) => {
      return el.id === updatedElement.id ? updatedElement : el;
    });
    setFormElements(newElements);
    setEditingElement(null);
    setChangesSaved(false);
  };

  const removeCondition = (elementId: string, conditionId: string) => {
    const updatedElements = formElements.map((element) => {
      if (element.id === elementId && element.conditions) {
        return {
          ...element,
          conditions: element.conditions.filter((condition) => {
            return condition.id !== conditionId;
          }),
        };
      }
      return element;
    });

    setFormElements(updatedElements);

    if (editingElement && editingElement.id === elementId) {
      setEditingElement({
        ...editingElement,
        conditions: editingElement.conditions?.filter((condition) => {
          return condition.id !== conditionId;
        }),
      });
    }

    setChangesSaved(false);
  };

  // Handle form value changes in preview mode
  const handleFormValueChange = (
    elementId: string,
    value: string | string[] | boolean | number,
  ) => {
    setFormValues({
      ...formValues,
      [elementId]: value,
    });
  };

  // Handle drag and drop
  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    setIsDragging(true);
    setDraggedElementId(elementId);
    e.dataTransfer.setData('text/plain', elementId);
    // Use a custom drag image (optional)
    const element = formElements.find((el) => {
      return el.id === elementId;
    });
    if (element) {
      const dragImage = document.createElement('div');
      dragImage.className = 'bg-white border rounded-md p-2 shadow-md';
      dragImage.textContent = element.title;
      document.body.appendChild(dragImage);
      e.dataTransfer.setDragImage(dragImage, 0, 0);
      setTimeout(() => {
        document.body.removeChild(dragImage);
      }, 0);
    }
  };

  const handleDragOver = (e: React.DragEvent, elementId: string) => {
    e.preventDefault();
    if (draggedElementId === elementId) return;
    setDragOverElementId(elementId);
  };

  const handleDrop = (e: React.DragEvent, targetElementId: string) => {
    e.preventDefault();
    if (!draggedElementId || draggedElementId === targetElementId) {
      setIsDragging(false);
      setDraggedElementId(null);
      setDragOverElementId(null);
      return;
    }

    const sourceIndex = formElements.findIndex((el) => {
      return el.id === draggedElementId;
    });
    const targetIndex = formElements.findIndex((el) => {
      return el.id === targetElementId;
    });

    if (sourceIndex === -1 || targetIndex === -1) return;

    const newElements = [...formElements];
    const [movedElement] = newElements.splice(sourceIndex, 1);
    newElements.splice(targetIndex, 0, movedElement);

    // Update order property
    newElements.forEach((element, idx) => {
      element.order = idx;
    });

    setFormElements(newElements);
    setChangesSaved(false);
    setIsDragging(false);
    setDraggedElementId(null);
    setDragOverElementId(null);
  };

  const handleDragEnd = () => {
    setIsDragging(false);
    setDraggedElementId(null);
    setDragOverElementId(null);
  };

  // Show element type menu at cursor position
  const showElementMenu = (e: React.MouseEvent) => {
    e.preventDefault();
    // Ensure the menu doesn't overflow the viewport
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const menuWidth = 224; // Width of the menu (56 * 4)
    const menuHeight = 400; // Approximate max height of the menu

    let x = e.clientX;
    let y = e.clientY;

    // Adjust position if it would overflow right edge
    if (x + menuWidth > viewportWidth) {
      x = viewportWidth - menuWidth - 10;
    }

    // Adjust position if it would overflow bottom edge
    if (y + menuHeight > viewportHeight) {
      y = viewportHeight - menuHeight - 10;
    }

    setElementTypeMenuPosition({ x, y });
    setShowElementTypeMenu(true);
  };

  // Duplicate an element
  const duplicateElement = (elementId: string) => {
    const elementToDuplicate = formElements.find((el) => {
      return el.id === elementId;
    });
    if (!elementToDuplicate) return;

    const newElement = {
      ...elementToDuplicate,
      id: generateId(),
      title: `${elementToDuplicate.title} (Copy)`,
      order: formElements.length,
      // Don't copy conditions to avoid circular references
      conditions: undefined,
    };

    setFormElements([...formElements, newElement]);
    setChangesSaved(false);
  };

  // Get default automations
  const getDefaultAutomations = (): Automation[] => {
    return [
      {
        id: generateId(),
        name: 'Create Project Automatically',
        type: 'create_project',
        enabled: true,
        config: {
          projectNameTemplate: 'Form Submission - {{submission_date}}',
          description: 'Project created',
        },
      },
      {
        id: generateId(),
        name: 'Assign Project Manager',
        type: 'assign_project_manager',
        enabled: true,
        config: {
          assigneeType: 'auto',
          notifyAssignee: true,
        },
      },
      {
        id: generateId(),
        name: 'Send Welcome Email',
        type: 'send_email',
        enabled: true,
        config: {
          subject: 'Welcome to our project!',
          body: 'Dear {{client_name}},\n\nThank you for submitting your request. We have created a new project: {{project_name}}.\n\nYou can view your project status at any time using this link: {{project_link}}\n\nBest regards,\nYour Project Team',
          ccTeam: false,
        },
      },
    ];
  };

  // Automation functions
  const addAutomation = (automation?: Automation) => {
    console.log('Adding automation to context:', automation);

    if (!automation) {
      console.log('No automation provided, skipping');
      return;
    }

    // Check if automation with this ID already exists
    const exists = automations.some((a) => {
      return a.id === automation.id;
    });
    if (exists) {
      console.log('Automation with this ID already exists, updating instead of adding');
      editAutomation(automation);
      return;
    }

    const newAutomation: Automation = {
      id: automation.id || generateId(),
      name: automation.name || 'New Automation',
      type: automation.type || 'send_email',
      enabled: automation.enabled ?? true,
      config: automation.config || {},
    };

    console.log('Adding new automation to state:', newAutomation);
    console.log('Current automations before adding:', automations);

    // Use functional update to ensure we get the latest state
    setAutomations((prevAutomations) => {
      const newState = [...prevAutomations, newAutomation];
      console.log('New automations state after adding:', newState);
      return newState;
    });

    setChangesSaved(false);
  };

  const editAutomation = (automation: Automation) => {
    console.log('Editing automation in context:', automation);

    if (!automation || !automation.id) {
      console.log('Invalid automation for editing, missing ID');
      return;
    }

    // Check if automation exists
    const exists = automations.some((a) => {
      return a.id === automation.id;
    });
    if (!exists) {
      console.log('Automation not found for editing, adding instead');
      addAutomation(automation);
      return;
    }

    // Use functional update to ensure we get the latest state
    setAutomations((prevAutomations) => {
      const newState = prevAutomations.map((item) => {
        return item.id === automation.id ? automation : item;
      });
      console.log('New automations state after editing:', newState);
      return newState;
    });

    setChangesSaved(false);
  };

  const deleteAutomation = (id: string) => {
    console.log('Deleting automation with ID:', id);

    if (!id) {
      console.log('Invalid ID for deletion');
      return;
    }

    // Use functional update to ensure we get the latest state
    setAutomations((prevAutomations) => {
      const newState = prevAutomations.filter((item) => {
        return item.id !== id;
      });
      console.log('New automations state after deletion:', newState);
      return newState;
    });

    setChangesSaved(false);
  };

  const toggleAutomation = (id: string) => {
    setAutomations(
      automations.map((item) => {
        if (item.id === id) {
          return { ...item, enabled: !item.enabled };
        }
        return item;
      }),
    );
    setChangesSaved(false);
  };

  const value = {
    // State
    formElements,
    changesSaved,
    activeTab,
    selectedElementId,
    editingElement,
    showConditionBuilder,
    previewMode,
    formValues,
    isDragging,
    draggedElementId,
    dragOverElementId,
    showElementTypeMenu,
    elementTypeMenuPosition,
    showValidationSettings,
    showMobileNav,
    showMobileMenu,
    isMobile,
    validationErrors,
    isEditMode,
    formId,
    automations,

    // Setters
    setFormElements,
    setChangesSaved,
    setActiveTab,
    setSelectedElementId,
    setEditingElement,
    setShowConditionBuilder,
    setPreviewMode,
    setFormValues,
    setIsDragging,
    setDraggedElementId,
    setDragOverElementId,
    setShowElementTypeMenu,
    setElementTypeMenuPosition,
    setShowValidationSettings,
    setShowMobileNav,
    setShowMobileMenu,
    setValidationErrors,

    // Helper functions
    addElement,
    addClientDetailsSection,
    saveChanges,
    selectElement,
    deleteElement,
    openElementEditor,
    saveElementChanges,
    removeCondition,
    handleFormValueChange,
    handleDragStart,
    handleDragOver,
    handleDrop,
    handleDragEnd,
    showElementMenu,
    duplicateElement,
    generateId,
    validateForm,
    formTitle,
    setFormTitle,

    // Automation functions
    addAutomation,
    editAutomation,
    deleteAutomation,
    toggleAutomation,
    getDefaultAutomations,
  };

  return <FormBuilderContext.Provider value={value}>{children}</FormBuilderContext.Provider>;
};
