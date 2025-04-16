import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface ICellEditorParams {
  value?: string | Date;
  stopEditing?: (suppressNavigate?: boolean) => void;
  api?: any;
  onKeyDown?: (event: React.KeyboardEvent) => void;
  cellStartedEdit?: boolean;
  formatValue?: (value: any) => any;
  parseValue?: (value: any) => any;
  column?: any;
  node?: any;
  data?: any;
  rowIndex?: number;
  colDef?: any;
  eGridCell?: HTMLElement;
  eParentOfValue?: HTMLElement;
}

const TimeEditor = forwardRef<any, ICellEditorParams>((props, ref) => {
  const [value, setValue] = useState<string>(
    props.value instanceof Date
      ? `${props.value.getHours().toString().padStart(2, '0')}:${props.value
          .getMinutes()
          .toString()
          .padStart(2, '0')}`
      : props.value?.toString() || '',
  );
  const inputRef = useRef<HTMLInputElement>(null);
  const originalValue = useRef(props.value);
  const valueChanged = useRef(false);

  console.log('TimeEditor initialized with value:', props.value, 'type:', typeof props.value);
  console.log('TimeEditor props.column:', props.column?.getId ? props.column.getId() : 'unknown');
  console.log('TimeEditor props.colDef:', props.colDef?.field);
  console.log('TimeEditor props.data:', props.data?._id);

  // Mark if the input has actually changed
  const hasValueChanged = () => {
    // Convert both to string format HH:MM for comparison
    const currentValue = value;
    let origValue = '';

    if (originalValue.current instanceof Date) {
      const hours = originalValue.current.getHours().toString().padStart(2, '0');
      const minutes = originalValue.current.getMinutes().toString().padStart(2, '0');
      origValue = `${hours}:${minutes}`;
    } else if (typeof originalValue.current === 'string') {
      if (originalValue.current.includes('T')) {
        // It's probably an ISO date string
        try {
          const date = new Date(originalValue.current);
          if (!isNaN(date.getTime())) {
            const hours = date.getHours().toString().padStart(2, '0');
            const minutes = date.getMinutes().toString().padStart(2, '0');
            origValue = `${hours}:${minutes}`;
          } else {
            origValue = originalValue.current;
          }
        } catch (e) {
          origValue = originalValue.current;
        }
      } else {
        origValue = originalValue.current;
      }
    }

    console.log('Comparing values - Current:', currentValue, 'Original:', origValue);
    // Consider empty original value and non-empty current value as a change
    if (!origValue && currentValue) {
      return true;
    }
    return currentValue !== origValue;
  };

  // Expose AG Grid-required methods
  useImperativeHandle(ref, () => {
    return {
      // Return the current value
      getValue() {
        console.log('TimeEditor getValue called, returning:', value);
        // Always mark as changed to ensure the onCellValueChanged event fires
        valueChanged.current = true;
        return value;
      },

      // Initialize the editor
      afterGuiAttached() {
        console.log('TimeEditor afterGuiAttached');
        // Focus the input after the editor is attached
        if (inputRef.current) {
          inputRef.current.focus();
          // Select the contents for easy editing
          inputRef.current.select();
        }
      },

      // Return the DOM element for the editor
      getGui() {
        return inputRef.current;
      },

      // Tell AG Grid this is not a popup editor
      isPopup() {
        return false;
      },

      // AG Grid will call this to check if the value has changed
      isCancelBeforeStart() {
        console.log('TimeEditor isCancelBeforeStart called');
        return false; // Always allow editing
      },

      // AG Grid will call this to check if edits should be committed
      isCancelAfterEnd() {
        const changed = hasValueChanged();
        console.log('TimeEditor isCancelAfterEnd called, valueChanged:', changed);

        // If there was no original value and we have a new value, or if values are different
        if (changed) {
          valueChanged.current = true;
          // Return false to tell AG Grid to commit the edit
          return false;
        }

        // If no change, tell AG Grid to cancel the edit
        return !valueChanged.current;
      },

      // Clean up any resources
      destroy() {
        console.log('TimeEditor destroy called');
        // No cleanup needed for this simple editor
      },
    };
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = event.target.value;
    console.log('TimeEditor handleChange:', newValue);
    setValue(newValue);
    valueChanged.current = true;
  };

  const handleBlur = () => {
    console.log('TimeEditor handleBlur, value:', value);
    // Check if the value has actually changed
    const changed = hasValueChanged();
    console.log('TimeEditor value has changed on blur:', changed);

    // Only stop editing if we have a value
    if (value && props.stopEditing) {
      console.log('TimeEditor calling stopEditing on blur with value:', value);
      // Set valueChanged to true to force value update
      valueChanged.current = true;

      // Update the value directly in the model if possible
      if (props.node && props.column && props.api) {
        try {
          const columnId = props.colDef?.field;
          if (columnId) {
            console.log('Updating model value directly:', value, 'for column:', columnId);

            // Create a date object for today with the specified time
            const [hours, minutes] = value.split(':').map(Number);
            const dateWithTime = new Date();
            dateWithTime.setHours(hours, minutes, 0, 0);

            // Store the time as an ISO string
            const processedValue = dateWithTime.toISOString();

            // Update the cell value directly
            console.log('Setting cell value directly to:', processedValue);

            // First update the node data
            props.node.setDataValue(columnId, value);

            // Then manually trigger an API update
            const rowId = props.data?._id;
            const colId = columnId.replace('values.', '');

            if (rowId && colId) {
              // Get table ID from URL
              const pathParts = window.location.pathname.split('/');
              const tableIndex = pathParts.indexOf('database') + 1;
              const tableId = pathParts[tableIndex];

              console.log(
                'Manually sending API request with tableId:',
                tableId,
                'rowId:',
                rowId,
                'columnId:',
                colId,
              );
            }
          }
        } catch (error) {
          console.error('Error updating model value:', error);
        }
      }

      // Pass false to not suppress navigation
      props.stopEditing(false);
    } else {
      console.log('TimeEditor not calling stopEditing because value is empty or unchanged');
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      console.log('TimeEditor Enter key pressed');
      // Set valueChanged to true to force an update
      valueChanged.current = true;
      if (props.stopEditing) {
        console.log('TimeEditor calling stopEditing on Enter');
        props.stopEditing();
      }
    } else if (e.key === 'Escape') {
      console.log('TimeEditor Escape key pressed');
      // Set valueChanged to false to cancel the edit
      valueChanged.current = false;
      if (props.stopEditing) {
        console.log('TimeEditor calling stopEditing on Escape');
        props.stopEditing();
      }
    }

    // If props.onKeyDown exists, call it with the event
    if (props.onKeyDown) {
      props.onKeyDown(e);
    }
  };

  // Initialize the value from props when component mounts
  useEffect(() => {
    if (props.value) {
      // Store the original value for comparison
      originalValue.current = props.value;

      // Convert date value to time string if needed
      if (props.value instanceof Date) {
        const hours = props.value.getHours().toString().padStart(2, '0');
        const minutes = props.value.getMinutes().toString().padStart(2, '0');
        const timeString = `${hours}:${minutes}`;
        console.log('TimeEditor converting Date to string:', timeString);
        setValue(timeString);
      } else {
        // Try to parse the value if it's a string that could be a date
        try {
          if (typeof props.value === 'string' && props.value.includes('T')) {
            // Might be an ISO date string
            const date = new Date(props.value);
            if (!isNaN(date.getTime())) {
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              const timeString = `${hours}:${minutes}`;
              console.log('TimeEditor parsed date string to:', timeString);
              setValue(timeString);
              return;
            }
          }
        } catch (e) {
          console.log('TimeEditor failed to parse date string:', e);
        }

        console.log('TimeEditor using string value directly:', props.value.toString());
        setValue(props.value.toString());
      }
    }
  }, [props.value]);

  // Add a ref to track if component is mounted
  const isMounted = useRef(true);

  // Set isMounted to false on unmount
  useEffect(() => {
    return () => {
      isMounted.current = false;
    };
  }, []);

  return (
    <input
      ref={inputRef}
      type='time'
      value={value}
      onChange={handleChange}
      onBlur={handleBlur}
      onKeyDown={handleKeyDown}
      className='w-full h-full px-2 py-1 text-sm border-0 focus:outline-none'
      style={{ height: '100%' }}
    />
  );
});

TimeEditor.displayName = 'TimeEditor';

export default TimeEditor;
