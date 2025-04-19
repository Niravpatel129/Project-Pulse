'use client';

import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { FormElement, FormValues } from '../types';
import { generateId } from '../utils';

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
};

const FormBuilderContext = createContext<FormBuilderContextType | undefined>(undefined);

export const useFormBuilder = () => {
  const context = useContext(FormBuilderContext);
  if (context === undefined) {
    throw new Error('useFormBuilder must be used within a FormBuilderProvider');
  }
  return context;
};

export const FormBuilderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
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
      title: 'Client Details',
      description: 'Collect client information',
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

    setFormElements([...formElements, newElement]);
    setChangesSaved(false);
    // Switch to My Form tab after adding an element
    setActiveTab('myform');
    // Select the new element
    setSelectedElementId(newElement.id);
    // Hide the element type menu if it's open
    setShowElementTypeMenu(false);
  };

  const saveChanges = () => {
    setChangesSaved(true);
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

    // Functions
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
  };

  return <FormBuilderContext.Provider value={value}>{children}</FormBuilderContext.Provider>;
};
