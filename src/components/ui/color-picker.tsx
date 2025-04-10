import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { ChromePicker, ColorResult } from 'react-color';

interface ColorPickerProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ColorPicker({ label, value, onChange, className }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [localColor, setLocalColor] = useState(value);

  // Update local state while picking
  const handleColorChange = (color: ColorResult) => {
    const newColor = color.hex;
    setLocalColor(newColor);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newValue = e.target.value;
    setLocalColor(newValue);
  };

  const handleBlur = () => {
    // Validate hex color format and trigger onChange only on blur
    if (/^#[0-9A-Fa-f]{6}$/.test(localColor)) {
      onChange(localColor);
    }
  };

  const handlePopoverOpenChange = (open: boolean) => {
    setIsOpen(open);
    // When popover closes, trigger onChange if color is valid
    if (!open && /^#[0-9A-Fa-f]{6}$/.test(localColor)) {
      onChange(localColor);
    }
  };

  return (
    <div className={cn('w-full', className)}>
      <Label htmlFor={label.toLowerCase()} className='text-sm text-gray-700 mb-2 block'>
        {label}
      </Label>
      <div className='flex'>
        <Popover open={isOpen} onOpenChange={handlePopoverOpenChange}>
          <PopoverTrigger asChild>
            <div
              className='w-10 h-10 rounded-l-md border border-r-0 border-gray-200 cursor-pointer hover:ring-2 hover:ring-gray-200 transition-all'
              style={{ backgroundColor: localColor }}
            />
          </PopoverTrigger>
          <PopoverContent className='w-auto p-0' align='start'>
            <ChromePicker color={localColor} onChange={handleColorChange} />
          </PopoverContent>
        </Popover>
        <Input
          id={label.toLowerCase()}
          value={localColor}
          onChange={handleInputChange}
          onBlur={handleBlur}
          placeholder='#000000'
          className='rounded-l-none bg-white border-gray-200 h-10 focus-visible:ring-0'
        />
      </div>
    </div>
  );
}
