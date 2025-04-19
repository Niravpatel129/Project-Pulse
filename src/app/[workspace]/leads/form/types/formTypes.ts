// Define the condition type
export type Condition = {
  id: string;
  sourceElementId: string; // Element that triggers the condition
  operator:
    | 'equals'
    | 'not_equals'
    | 'contains'
    | 'not_contains'
    | 'greater_than'
    | 'less_than'
    | 'is_empty'
    | 'is_not_empty'
    | 'starts_with'
    | 'ends_with';
  value: string; // Value to compare against
};

// Define the form element type
export type FormElement = {
  id: string;
  type: string;
  title: string;
  description?: string;
  required: boolean;
  order: number;
  section?: string;
  options?: string[]; // For radio buttons, checkboxes, dropdowns
  placeholder?: string;
  defaultValue?: string;
  conditions?: Condition[]; // Conditions that determine if this element is shown
  showWhen: 'all' | 'any'; // Whether all conditions must be met or any condition
  validation?: {
    pattern?: string;
    minLength?: number;
    maxLength?: number;
    min?: number;
    max?: number;
  };
  clientFields?: {
    email: boolean;
    name: boolean;
    phone: boolean;
    address: boolean;
    company: boolean;
    custom: string[];
  };
};

// Define the form values type for preview mode
export type FormValues = {
  [key: string]: string | string[] | boolean | number | null;
};

// Props for different components
export interface ElementEditorProps {
  editingElement: FormElement | null;
  setEditingElement: (element: FormElement | null) => void;
  saveElementChanges: () => void;
  isMobile: boolean;
  showValidationSettings: boolean;
  setShowValidationSettings: (show: boolean) => void;
  showConditionBuilder: boolean;
  setShowConditionBuilder: (show: boolean) => void;
  formElements: FormElement[];
}

export interface FormElementProps {
  element: FormElement;
  isSelected: boolean;
  formValues: FormValues;
  previewMode: boolean;
  handleFormValueChange: (elementId: string, value: string | string[] | boolean | number) => void;
  selectElement: (id: string) => void;
  openElementEditor: (element: FormElement) => void;
  deleteElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  addCondition: (id: string) => void;
  getValidationErrorMessage: (element: FormElement, value: any) => string | null;
}

export type ElementType =
  | 'Text Block'
  | 'Single Response'
  | 'Long Answer'
  | 'Short Answer'
  | 'Phone Number'
  | 'Number'
  | 'Date'
  | 'Rating'
  | 'Dropdown'
  | 'Radio Buttons'
  | 'Checkboxes'
  | 'File Upload'
  | 'Client Details'
  | 'Email'
  | 'URL';
