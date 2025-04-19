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
  content?: string; // For Text Block content
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
  clientTitle?: string; // Title for the Client Details section
};

// Define the form values type for preview mode
export type FormValues = {
  [key: string]: string | string[] | boolean | number | null;
};
