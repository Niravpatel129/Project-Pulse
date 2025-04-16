import { Badge } from '@/components/ui/badge';
import { File, Star } from 'lucide-react';

// Date formatter for table cells
export const dateFormatter = (params) => {
  if (!params.value) return '-';
  // Format date in a user-friendly way
  const date = new Date(params.value);
  return date.toLocaleDateString();
};

// Time formatter for table cells
export const timeFormatter = (params) => {
  if (!params.value) return '-';
  // Format time in HH:MM format
  const time = new Date(params.value);
  return time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

// Currency formatter for table cells
export const currencyFormatter = (params) => {
  if (!params.value && params.value !== 0) return '-';
  // Format as currency with 2 decimal places
  return `$${Number(params.value).toFixed(2)}`;
};

// Percentage formatter for table cells
export const percentFormatter = (params) => {
  if (!params.value && params.value !== 0) return '-';
  // Format as percentage
  return `${Number(params.value).toFixed(1)}%`;
};

// Number formatter for table cells
export const numberFormatter = (params) => {
  if (!params.value && params.value !== 0) return '-';
  // Format number with commas for thousands
  return Number(params.value).toLocaleString();
};

// Link cell renderer
export const linkCellRenderer = (params) => {
  if (!params.value) return '-';

  const value = params.value;
  const displayText = value.length > 30 ? value.substring(0, 27) + '...' : value;

  return (
    <div className='text-blue-500 underline'>
      <a
        href={value.startsWith('http') ? value : `https://${value}`}
        target='_blank'
        rel='noopener noreferrer'
      >
        {displayText}
      </a>
    </div>
  );
};

// Time cell renderer
export const timeCellRenderer = (params) => {
  if (!params.value) return '-';

  const time = new Date(params.value);
  const timeString = time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

  // Use a simple div without extra styling that might interfere with editing
  return timeString;
};

// Renderer for image cells
export const imageCellRenderer = (params) => {
  if (!params.value) return '-';
  // Display an image with a maximum width
  return (
    <img
      src={params.value}
      alt='Image'
      className='max-w-[100px] max-h-[50px] object-contain'
      onClick={(e) => {
        return e.stopPropagation();
      }}
    />
  );
};

// Renderer for file attachment cells
export const fileCellRenderer = (params) => {
  if (!params.value) return '-';
  // Display a file link with an icon
  return (
    <a
      href={params.value.url}
      target='_blank'
      rel='noopener noreferrer'
      className='flex items-center text-blue-600 hover:underline'
      onClick={(e) => {
        return e.stopPropagation();
      }}
    >
      <File className='h-4 w-4 mr-1' />
      {params.value.name || 'Download'}
    </a>
  );
};

// Renderer for rating cells (stars)
export const ratingCellRenderer = (params) => {
  if (!params.value && params.value !== 0) return '-';
  // Display stars for rating (1-5)
  const rating = Math.min(Math.max(0, Number(params.value)), 5);
  return (
    <div className='flex items-center'>
      {Array.from({ length: 5 }).map((_, i) => {
        return (
          <Star
            key={i}
            className={`h-4 w-4 ${
              i < rating ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'
            }`}
          />
        );
      })}
    </div>
  );
};

// Renderer for tags/multi-select values
export const tagsCellRenderer = (params) => {
  if (!params.value) return '-';

  // Assuming tags are in the format [{id: string, name: string}]
  return (
    <div className='flex flex-wrap gap-1'>
      {params.value.map((tag) => {
        return (
          <Badge key={tag.id} variant='outline' className='bg-amber-50 text-amber-700'>
            {tag.name}
          </Badge>
        );
      })}
    </div>
  );
};

// Phone cell renderer
export const phoneCellRenderer = (params) => {
  if (!params.value) return '-';

  // Get phone format from column definition or use international as default
  const phoneFormat = params.colDef?.cellRendererParams?.phoneFormat || 'international';
  const phoneNumber = params.value.toString();
  let formattedNumber = phoneNumber;

  try {
    // Format the phone number based on the specified format
    if (phoneNumber) {
      // Clean the phone number to just digits
      const digits = phoneNumber.replace(/\D/g, '');

      switch (phoneFormat) {
        case 'international':
          // Format as international number with country code
          if (digits.length === 10) {
            formattedNumber = `+1 ${digits.substring(0, 3)} ${digits.substring(
              3,
              6,
            )} ${digits.substring(6)}`;
          } else if (digits.length > 10) {
            // Assume first digit(s) are country code
            const countryCode = digits.substring(0, digits.length - 10);
            const nationalDigits = digits.substring(digits.length - 10);
            formattedNumber = `+${countryCode} ${nationalDigits.substring(
              0,
              3,
            )} ${nationalDigits.substring(3, 6)} ${nationalDigits.substring(6)}`;
          }
          break;
        case 'us':
          // Format as US number (123-456-7890)
          if (digits.length >= 10) {
            const nationalDigits = digits.substring(Math.max(0, digits.length - 10));
            formattedNumber = `${nationalDigits.substring(0, 3)}-${nationalDigits.substring(
              3,
              6,
            )}-${nationalDigits.substring(6)}`;
          }
          break;
        default:
          // Keep as cleaned digits with spaces for readability
          if (digits.length >= 10) {
            const nationalDigits = digits.substring(Math.max(0, digits.length - 10));
            formattedNumber = `${nationalDigits.substring(0, 3)} ${nationalDigits.substring(
              3,
              6,
            )} ${nationalDigits.substring(6)}`;
          }
      }
    }

    // Display the formatted phone number with a phone icon
    return (
      <div className='flex items-center'>
        <span className='mr-1'>📞</span>
        <a href={`tel:${phoneNumber}`} className='text-blue-600 hover:underline'>
          {formattedNumber}
        </a>
      </div>
    );
  } catch (error) {
    console.error('Error formatting phone number:', error);
    return phoneNumber;
  }
};

// Helper function to get the appropriate value formatter based on name
export const getValueFormatter = (formatterName) => {
  switch (formatterName) {
    case 'dateFormatter':
      return dateFormatter;
    case 'timeFormatter':
      return timeFormatter;
    case 'numberFormatter':
      return numberFormatter;
    case 'currencyFormatter':
      return currencyFormatter;
    case 'percentFormatter':
      return percentFormatter;
    default:
      return undefined;
  }
};
