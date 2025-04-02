import type React from 'react';
import { useEffect, useRef, useState } from 'react';

type Column = {
  id: string;
  name: string;
  sortable: boolean;
};

type TagType = {
  id: string;
  name: string;
};

type Record = {
  id: number;
  [key: string]: any;
  selected: boolean;
  tags: TagType[];
};

type PropertyType = {
  id: string;
  name: string;
  icon: string;
};

const propertyTypeIcons = {
  text: 'Type',
  number: 'Hash',
  date: 'Calendar',
  checkbox: 'CheckSquare',
  select: 'ChevronDown',
  multiselect: 'CheckSquare2',
  url: 'Link',
  email: 'Mail',
  phone: 'Phone',
  file: 'FileText',
};

const iconOptions = [
  { icon: 'AlertCircle', name: 'Alert Circle' },
  { icon: 'Bell', name: 'Bell' },
  { icon: 'Calendar', name: 'Calendar' },
  { icon: 'Clock', name: 'Clock' },
  { icon: 'FileText', name: 'File' },
  { icon: 'Heart', name: 'Heart' },
  { icon: 'Mail', name: 'Mail' },
  { icon: 'MapPin', name: 'Map Pin' },
  { icon: 'Star', name: 'Star' },
  { icon: 'Tag', name: 'Tag' },
  { icon: 'Box', name: 'Box' },
  { icon: 'Users', name: 'Users' },
];

const defaultPropertyTypes: PropertyType[] = [
  { id: 'text', name: 'Text', icon: 'Type' },
  { id: 'number', name: 'Number', icon: 'Hash' },
  { id: 'date', name: 'Date', icon: 'Calendar' },
  { id: 'checkbox', name: 'Checkbox', icon: 'CheckSquare' },
  { id: 'select', name: 'Select', icon: 'ChevronDown' },
  { id: 'multiselect', name: 'Multi-select', icon: 'CheckSquare2' },
  { id: 'url', name: 'URL', icon: 'Link' },
  { id: 'email', name: 'Email', icon: 'Mail' },
  { id: 'phone', name: 'Phone', icon: 'Phone' },
  { id: 'file', name: 'File', icon: 'FileText' },
];

export function useDatabase() {
  const [columns, setColumns] = useState<Column[]>([
    { id: 'name', name: 'Name', sortable: true },
    { id: 'leads', name: 'Leads', sortable: true },
    { id: 'tags', name: 'Tags', sortable: true },
  ]);

  const [records, setRecords] = useState<Record[]>([
    {
      id: 1,
      name: 'Database Entry',
      leads: '',
      tags: [{ id: '1', name: 'sfs' }],
      selected: false,
    },
  ]);

  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(
    null,
  );
  const [editingCell, setEditingCell] = useState<{
    recordId: number | null;
    columnId: string | null;
  }>({
    recordId: null,
    columnId: null,
  });
  const [newTagText, setNewTagText] = useState<{ [key: number]: string }>({});
  const [allSelected, setAllSelected] = useState(false);
  const [isAddColumnSheetOpen, setIsAddColumnSheetOpen] = useState(false);
  const [propertySearchQuery, setPropertySearchQuery] = useState('');
  const inputRef = useRef<HTMLInputElement>(null);
  const [selectedPropertyType, setSelectedPropertyType] = useState<PropertyType | null>(null);
  const [newPropertyName, setNewPropertyName] = useState('');
  const [newPropertyPrefix, setNewPropertyPrefix] = useState('');
  const [isIconPickerOpen, setIsIconPickerOpen] = useState(false);

  const filteredPropertyTypes = defaultPropertyTypes.filter((type) => {
    return type.name.toLowerCase().includes(propertySearchQuery.toLowerCase());
  });

  // Focus input when editing starts
  useEffect(() => {
    if (editingCell.recordId !== null && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editingCell]);

  // Handle sorting
  const requestSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const getSortedRecords = () => {
    if (!sortConfig) return records;

    return [...records].sort((a, b) => {
      if (sortConfig.key === 'tags') {
        // Sort by first tag name or empty string if no tags
        const aValue = a.tags.length > 0 ? a.tags[0].name : '';
        const bValue = b.tags.length > 0 ? b.tags[0].name : '';

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      } else {
        // Sort by other column values
        const aValue = a[sortConfig.key] || '';
        const bValue = b[sortConfig.key] || '';

        if (aValue < bValue) {
          return sortConfig.direction === 'asc' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'asc' ? 1 : -1;
        }
        return 0;
      }
    });
  };

  // Add new row
  const addNewRow = () => {
    const newId =
      records.length > 0
        ? Math.max(
            ...records.map((r) => {
              return r.id;
            }),
          ) + 1
        : 1;
    const newRecord: Record = {
      id: newId,
      selected: false,
      tags: [],
    };

    // Initialize all column values
    columns.forEach((col) => {
      if (col.id !== 'tags') {
        newRecord[col.id] = '';
      }
    });

    setRecords([...records, newRecord]);
  };

  // Add new column
  const addNewColumn = (propertyType: PropertyType) => {
    setSelectedPropertyType(propertyType);
    setNewPropertyName(`New ${propertyType.name}`);
    setNewPropertyPrefix('');
  };

  const saveNewColumn = () => {
    if (!selectedPropertyType) return;

    const newId = `column${columns.length + 1}`;
    setColumns([...columns, { id: newId, name: newPropertyName || `New Column`, sortable: true }]);

    // Add the new column to all existing records
    setRecords(
      records.map((record) => {
        return {
          ...record,
          [newId]: '',
        };
      }),
    );

    // Reset state
    setSelectedPropertyType(null);
    setNewPropertyName('');
    setNewPropertyPrefix('');
    setIsAddColumnSheetOpen(false);
  };

  const backToPropertySelection = () => {
    setSelectedPropertyType(null);
    setNewPropertyName('');
    setNewPropertyPrefix('');
  };

  const selectIcon = (iconName: string) => {
    setNewPropertyPrefix(iconName);
    setIsIconPickerOpen(false);
  };

  // Handle cell editing
  const startEditing = (recordId: number, columnId: string) => {
    if (columnId !== 'tags') {
      setEditingCell({ recordId, columnId });
    }
  };

  const stopEditing = () => {
    setEditingCell({ recordId: null, columnId: null });
  };

  const handleCellChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    recordId: number,
    columnId: string,
  ) => {
    setRecords(
      records.map((record) => {
        return record.id === recordId ? { ...record, [columnId]: e.target.value } : record;
      }),
    );
  };

  const handleCellKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === 'Escape') {
      stopEditing();
    }
  };

  // Handle tag management
  const addTag = (recordId: number) => {
    if (newTagText[recordId] && newTagText[recordId].trim() !== '') {
      setRecords(
        records.map((record) => {
          if (record.id === recordId) {
            const newTagId = `tag-${Date.now()}`;
            return {
              ...record,
              tags: [...record.tags, { id: newTagId, name: newTagText[recordId].trim() }],
            };
          }
          return record;
        }),
      );
      setNewTagText({ ...newTagText, [recordId]: '' });
    }
  };

  const removeTag = (recordId: number, tagId: string) => {
    setRecords(
      records.map((record) => {
        if (record.id === recordId) {
          return {
            ...record,
            tags: record.tags.filter((tag) => {
              return tag.id !== tagId;
            }),
          };
        }
        return record;
      }),
    );
  };

  const handleTagInputKeyDown = (e: React.KeyboardEvent, recordId: number) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      addTag(recordId);
    }
  };

  // Handle selection
  const toggleSelectAll = () => {
    const newSelected = !allSelected;
    setAllSelected(newSelected);
    setRecords(
      records.map((record) => {
        return { ...record, selected: newSelected };
      }),
    );
  };

  const toggleSelectRecord = (recordId: number) => {
    const updatedRecords = records.map((record) => {
      return record.id === recordId ? { ...record, selected: !record.selected } : record;
    });
    setRecords(updatedRecords);

    // Update allSelected state based on whether all records are selected
    setAllSelected(
      updatedRecords.every((r) => {
        return r.selected;
      }),
    );
  };

  return {
    columns,
    records: getSortedRecords(),
    sortConfig,
    editingCell,
    newTagText,
    allSelected,
    isAddColumnSheetOpen,
    propertySearchQuery,
    inputRef,
    selectedPropertyType,
    newPropertyName,
    newPropertyPrefix,
    isIconPickerOpen,
    propertyTypes: filteredPropertyTypes,
    iconOptions,
    requestSort,
    addNewRow,
    addNewColumn,
    saveNewColumn,
    backToPropertySelection,
    selectIcon,
    startEditing,
    stopEditing,
    handleCellChange,
    handleCellKeyDown,
    addTag,
    removeTag,
    handleTagInputKeyDown,
    toggleSelectAll,
    toggleSelectRecord,
    setNewTagText,
    setIsAddColumnSheetOpen,
    setPropertySearchQuery,
    setNewPropertyName,
    setNewPropertyPrefix,
    setIsIconPickerOpen,
  };
}
