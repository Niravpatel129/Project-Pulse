import * as React from 'react';

import { cn } from '@/lib/utils';

const Input = React.forwardRef<HTMLInputElement, React.ComponentProps<'input'>>(
  ({ className, type, min, ...props }, ref) => {
    // Handle number inputs specially to allow empty values during editing
    const [localValue, setLocalValue] = React.useState<string>('');
    const [initialRender, setInitialRender] = React.useState(true);

    // Track if the input is being focused
    const [isFocused, setIsFocused] = React.useState(false);

    // Track if the user is currently editing/deleting
    const [isEditing, setIsEditing] = React.useState(false);

    // Reference to the real DOM input element
    const inputRef = React.useRef<HTMLInputElement>(null);

    // Combine the forwarded ref with our local ref
    const handleRef = (el: HTMLInputElement) => {
      inputRef.current = el;
      if (typeof ref === 'function') {
        ref(el);
      } else if (ref) {
        ref.current = el;
      }
    };

    // Only apply special handling for number inputs
    const isNumberInput = type === 'number';

    // On initial render, sync with any provided value
    React.useEffect(() => {
      if (initialRender && isNumberInput && props.value !== undefined) {
        setLocalValue(String(props.value));
        setInitialRender(false);
      }
    }, [initialRender, isNumberInput, props.value]);

    // Handle focus state
    const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    // Handle blur - validate min/max on blur
    const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
      setIsFocused(false);
      setIsEditing(false);

      if (isNumberInput) {
        // If empty, set to min value if specified
        if (localValue === '' && min !== undefined) {
          setLocalValue(String(min));

          // Manually dispatch change event to update parent components
          if (inputRef.current && props.onChange) {
            const event = new Event('change', { bubbles: true });
            Object.defineProperty(event, 'target', { value: { value: min, name: props.name } });
            props.onChange(event as unknown as React.ChangeEvent<HTMLInputElement>);
          }
        }
      }

      props.onBlur?.(e);
    };

    // Handle keyboard events to detect backspace/delete
    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (isNumberInput && (e.key === 'Backspace' || e.key === 'Delete')) {
        setIsEditing(true);
      }

      props.onKeyDown?.(e);
    };

    // Handle value changes
    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
      if (isNumberInput) {
        setLocalValue(e.target.value);
        // If value is changing and becoming empty or just "0", mark as editing
        if (e.target.value === '' || e.target.value === '0') {
          setIsEditing(true);
        }
      }

      props.onChange?.(e);
    };

    // If not a number input, render normally
    if (!isNumberInput) {
      return (
        <input
          type={type}
          className={cn(
            'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
            className,
          )}
          ref={ref}
          {...props}
        />
      );
    }

    // For number inputs, provide custom handling
    return (
      <input
        type={type}
        className={cn(
          'flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50 md:text-sm',
          className,
        )}
        ref={handleRef}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        // Allow empty string while focused
        {...props}
        value={
          isFocused
            ? props.value !== undefined
              ? props.value
              : localValue
            : props.value !== undefined
            ? props.value
            : localValue
        }
        // Remove min constraint during editing, when focused, or when value is 0
        min={isFocused && (isEditing || localValue === '' || localValue === '0') ? undefined : min}
      />
    );
  },
);
Input.displayName = 'Input';

export { Input };
