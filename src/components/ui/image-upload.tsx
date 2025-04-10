import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Maximize2, X } from 'lucide-react';
import { useState } from 'react';

interface ImageUploadProps {
  label: string;
  value?: string;
  onChange: (value: string) => void;
  className?: string;
}

export function ImageUpload({ label, value, onChange, className }: ImageUploadProps) {
  const [preview, setPreview] = useState<string | undefined>(value);
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        // Create an image element to get dimensions
        const img = new Image();
        img.onload = () => {
          // Create a canvas to resize the image
          const canvas = document.createElement('canvas');
          // Set max dimensions (smaller image)
          const maxWidth = 800;
          const maxHeight = 600;

          let width = img.width;
          let height = img.height;

          // Calculate new dimensions while maintaining aspect ratio
          if (width > height) {
            if (width > maxWidth) {
              height = Math.round(height * (maxWidth / width));
              width = maxWidth;
            }
          } else {
            if (height > maxHeight) {
              width = Math.round(width * (maxHeight / height));
              height = maxHeight;
            }
          }

          // Resize the image
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          ctx?.drawImage(img, 0, 0, width, height);

          // Get the resized image as base64
          const resizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
          setPreview(resizedBase64);
          onChange(resizedBase64);
        };
        img.src = reader.result as string;
      };
      reader.readAsDataURL(file);
    }
  };

  const handleRemove = () => {
    setPreview(undefined);
    onChange('');
  };

  return (
    <div className={cn('w-full flex flex-col items-center', className)}>
      <Label className='text-sm text-gray-700 mb-2 block'>{label}</Label>
      <div className='relative w-full flex justify-center'>
        <input
          type='file'
          id={`${label.toLowerCase()}-upload`}
          accept='image/*'
          onChange={handleFileChange}
          className='hidden'
        />
        <label
          htmlFor={`${label.toLowerCase()}-upload`}
          className={cn(
            'border border-dashed border-gray-200 rounded-lg p-4 text-center cursor-pointer hover:bg-gray-50 transition-colors block',
            preview && 'p-0',
            'aspect-square w-full max-w-[200px]', // Changed to square aspect ratio with max width
          )}
        >
          {preview ? (
            <div className='relative group h-full'>
              <img src={preview} alt={label} className='w-full h-full object-cover rounded-lg' />
              <div className='absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                <button
                  type='button'
                  onClick={(e) => {
                    e.preventDefault();
                    handleRemove();
                  }}
                  className='p-1 bg-white/80 rounded-full'
                >
                  <X className='h-4 w-4 text-gray-600' />
                </button>
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <button
                      type='button'
                      onClick={(e) => {
                        e.preventDefault();
                      }}
                      className='p-1 bg-white/80 rounded-full'
                    >
                      <Maximize2 className='h-4 w-4 text-gray-600' />
                    </button>
                  </DialogTrigger>
                  <DialogContent className='max-w-4xl p-1'>
                    <img
                      src={preview}
                      alt={label}
                      className='w-full h-auto object-contain max-h-[80vh]'
                    />
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          ) : (
            <div className='flex items-center justify-center h-full'>
              <p className='text-sm text-gray-500'>Upload {label.toLowerCase()}</p>
            </div>
          )}
        </label>
      </div>
    </div>
  );
}
