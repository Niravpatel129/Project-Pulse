// Types for DeliverableContent components

export interface DeliverableContentTabProps {
  formData: any;
  errors: any;
  editingFieldId: string | null;
  setEditingFieldId: (id: string | null) => void;
  addCustomField: (type: string) => void;
  removeCustomField: (id: string) => void;
  moveFieldUp: (index: number) => void;
  moveFieldDown: (index: number) => void;
  updateFieldProperty: (id: string, property: string, value: string | boolean | any[]) => void;
  setHasUnsavedChanges: (value: boolean) => void;
}

export interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  attachment: any;
}

export interface DatabaseItemDialogProps {
  isOpen: boolean;
  onClose: () => void;
  selectedDatabaseId: string | null;
  setSelectedDatabaseId: (id: string | null) => void;
  selectedItem: any;
  onSelectItem: (item: any) => void;
  onSave: (
    item: any,
    databaseId: string | null,
    visibleColumns: Record<string, boolean>,
    alignment: string,
  ) => void;
  alignment: string;
  setAlignment: (alignment: string) => void;
  initialVisibleColumns?: Record<string, boolean>;
}

export interface SharedDisplayItemDetailsProps {
  item: any;
  useFieldVisibility?: boolean;
  tableColumns?: any[];
  visibleColumns?: Record<string, boolean>;
}

// Type definitions for database items
export interface DatabaseItem {
  id: string;
  name?: string;
  invoiceNumber?: string;
  [key: string]: any;
}

export interface DatabaseItems {
  [key: string]: DatabaseItem[];
}
