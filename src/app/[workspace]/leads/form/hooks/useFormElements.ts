import { useEffect, useState } from 'react';
import { ElementType, FormElement, FormValues } from '../types/formTypes';
import { generateId } from '../utils/elementUtils';

export const useFormElements = () => {
  const [formElements, setFormElements] = useState<FormElement[]>([]);
  const [selectedElementId, setSelectedElementId] = useState<string | null>(null);
  const [editingElement, setEditingElement] = useState<FormElement | null>(null);
  const [changesSaved, setChangesSaved] = useState(true);
  const [previewMode, setPreviewMode] = useState(false);
  const [formValues, setFormValues] = useState<FormValues>({});

  // Drag-and-drop state
  const [isDragging, setIsDragging] = useState(false);
  const [draggedElementId, setDraggedElementId] = useState<string | null>(null);
  const [dragOverElementId, setDragOverElementId] = useState<string | null>(null);

  // Load form elements from localStorage on initial load
  useEffect(() => {
    const savedElements = localStorage.getItem('formElements');
    if (savedElements) {
      try {
        setFormElements(JSON.parse(savedElements));
      } catch (e) {
        console.error('Failed to parse saved form elements', e);
      }
    }
  }, []);

  // Save form elements to localStorage when they change
  useEffect(() => {
    if (formElements.length > 0) {
      localStorage.setItem('formElements', JSON.stringify(formElements));
    }
  }, [formElements]);

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

  const addElement = (elementType: ElementType) => {
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
    setSelectedElementId(newElement.id);
    return newElement.id;
  };

  const addClientDetailsSection = () => {
    const newElement: FormElement = {
      id: generateId(),
      type: 'Client Details',
      title: 'Client Details',
      description: 'Contact Information',
      required: true, // Client details section is required
      order: formElements.length,
      showWhen: 'all',
      clientTitle: 'Client Information', // Default title for the client information section
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
    setSelectedElementId(newElement.id);
    return newElement.id;
  };

  const saveChanges = () => {
    localStorage.setItem('formElements', JSON.stringify(formElements));
    setChangesSaved(true);
  };

  const selectElement = (id: string) => {
    setSelectedElementId(id);
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

  const moveElementUp = (index: number) => {
    if (index === 0) return;

    const newElements = [...formElements];
    const temp = newElements[index];
    newElements[index] = newElements[index - 1];
    newElements[index - 1] = temp;

    // Update order property
    newElements.forEach((element, idx) => {
      element.order = idx;
    });

    setFormElements(newElements);
    setChangesSaved(false);
  };

  const moveElementDown = (index: number) => {
    if (index === formElements.length - 1) return;

    const newElements = [...formElements];
    const temp = newElements[index];
    newElements[index] = newElements[index + 1];
    newElements[index + 1] = temp;

    // Update order property
    newElements.forEach((element, idx) => {
      element.order = idx;
    });

    setFormElements(newElements);
    setChangesSaved(false);
  };

  const openElementEditor = (element: FormElement) => {
    setEditingElement({ ...element });
  };

  const saveElementChanges = () => {
    if (!editingElement) return;

    const updatedElements = formElements.map((element) => {
      return element.id === editingElement.id ? editingElement : element;
    });
    setFormElements(updatedElements);
    setEditingElement(null);
    setChangesSaved(false);
  };

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
    return newElement.id;
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

  // Drag and drop handlers
  const handleDragStart = (e: React.DragEvent, elementId: string) => {
    setIsDragging(true);
    setDraggedElementId(elementId);
    e.dataTransfer.setData('text/plain', elementId);
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

  return {
    formElements,
    selectedElementId,
    editingElement,
    changesSaved,
    previewMode,
    formValues,
    isDragging,
    draggedElementId,
    dragOverElementId,
    setFormElements,
    setSelectedElementId,
    setEditingElement,
    setPreviewMode,
    addElement,
    addClientDetailsSection,
    saveChanges,
    selectElement,
    deleteElement,
    moveElementUp,
    moveElementDown,
    openElementEditor,
    saveElementChanges,
    duplicateElement,
    handleFormValueChange,
    handleDragStart,
    handleDragOver,
    handleDragEnd,
    handleDrop,
  };
};
