import { createContext, ReactNode, useContext, useState } from 'react';

interface FormData {
  name: string;
  description: string;
  price: string;
  deliverableType: string;
  availabilityDate: string;
  customFields: any[];
  teamNotes: string;
  customDeliverableType: string;
}

interface DeliverableFormContextType {
  formData: FormData;
  errors: { [key: string]: string };
  editingFieldId: string | null;
  hasUnsavedChanges: boolean;

  // Form handlers
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
  addCustomField: (type: string) => void;
  removeCustomField: (id: string) => void;
  moveFieldUp: (index: number) => void;
  moveFieldDown: (index: number) => void;
  updateFieldProperty: (id: string, property: string, value: string | boolean | any[]) => void;
  setEditingFieldId: (id: string | null) => void;
  setHasUnsavedChanges: (value: boolean) => void;
  setErrors: (errors: { [key: string]: string }) => void;
}

export const DeliverableFormContext = createContext<DeliverableFormContextType | undefined>(
  undefined,
);

export const DeliverableFormProvider = ({ children }: { children: ReactNode }) => {
  const [formData, setFormData] = useState<FormData>({
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
  const [editingFieldId, setEditingFieldId] = useState<string | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

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
      label: '',
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

  // Update field property
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

  const value = {
    formData,
    errors,
    editingFieldId,
    hasUnsavedChanges,

    // Form handlers
    handleChange,
    handleSelectChange,
    addCustomField,
    removeCustomField,
    moveFieldUp,
    moveFieldDown,
    updateFieldProperty,
    setEditingFieldId,
    setHasUnsavedChanges,
    setErrors,
  };

  return (
    <DeliverableFormContext.Provider value={value}>{children}</DeliverableFormContext.Provider>
  );
};

export const useDeliverableForm = () => {
  const context = useContext(DeliverableFormContext);
  if (context === undefined) {
    throw new Error('useDeliverableForm must be used within a DeliverableFormProvider');
  }
  return context;
};
