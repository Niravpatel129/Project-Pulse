import { InputHTMLAttributes } from 'react';

import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

interface InputWithErrorProps extends InputHTMLAttributes<HTMLInputElement> {
  label: string;
  id?: string;
  error?: string;
}

export default function InputWithError({
  label,
  id,
  error,
  className,
  placeholder,
  type,
  defaultValue,
  ...props
}: InputWithErrorProps) {
  const generatedId = id || `input-${Math.random().toString(36).substring(2, 9)}`;

  return (
    <div className='*:not-first:mt-2'>
      <Label htmlFor={generatedId}>{label}</Label>
      <Input
        id={generatedId}
        className={`peer ${className || ''}`}
        placeholder={placeholder}
        type={type}
        defaultValue={defaultValue}
        aria-invalid={!!error}
        {...props}
      />
      {error && (
        <p className='text-destructive mt-2 text-xs' role='alert' aria-live='polite'>
          {error}
        </p>
      )}
    </div>
  );
}
