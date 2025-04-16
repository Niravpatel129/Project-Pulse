import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';

interface TimeEditorProps {
  value?: string | Date;
}

const TimeEditor = forwardRef<any, TimeEditorProps>((props, ref) => {
  const [value, setValue] = useState<string>(
    props.value instanceof Date
      ? `${props.value.getHours().toString().padStart(2, '0')}:${props.value
          .getMinutes()
          .toString()
          .padStart(2, '0')}`
      : props.value?.toString() || '',
  );
  const inputRef = useRef<HTMLInputElement>(null);

  // Expose AG Grid-required methods
  useImperativeHandle(ref, () => {
    return {
      // Return the current value
      getValue() {
        return value;
      },

      // Initialize the editor
      afterGuiAttached() {
        // Focus the input after the editor is attached
        if (inputRef.current) {
          inputRef.current.focus();
        }
      },

      // Return the DOM element for the editor
      getGui() {
        return inputRef.current;
      },
    };
  });

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setValue(event.target.value);
  };

  // Initialize the value from props when component mounts
  useEffect(() => {
    if (props.value) {
      // Convert date value to time string if needed
      if (props.value instanceof Date) {
        const hours = props.value.getHours().toString().padStart(2, '0');
        const minutes = props.value.getMinutes().toString().padStart(2, '0');
        setValue(`${hours}:${minutes}`);
      } else {
        setValue(props.value.toString());
      }
    }
  }, [props.value]);

  return (
    <input
      ref={inputRef}
      type='time'
      value={value}
      onChange={handleChange}
      className='w-full h-full px-2 py-1 text-sm border-0 focus:outline-none'
      style={{ height: '100%' }}
    />
  );
});

TimeEditor.displayName = 'TimeEditor';

export default TimeEditor;
