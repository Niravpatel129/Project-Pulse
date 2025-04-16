import { Badge } from '@/components/ui/badge';
import { File, Star } from 'lucide-react';

// Date formatter for table cells
export const dateFormatter = (params) => {
  if (!params.value) return '-';
  // Format date in a user-friendly way
  const date = new Date(params.value);
  return date.toLocaleDateString();
};

// Number formatter
export const numberFormatter = (params) => {
  if (!params.value && params.value !== 0) return '-';
  return Number(params.value).toLocaleString();
};

// Currency formatter
export const currencyFormatter = (params) => {
  if (!params.value && params.value !== 0) return '-';
  const currency = params.column?.colDef?.currencySymbol || '$';
  return `${currency}${Number(params.value).toLocaleString()}`;
};

// Percent formatter
export const percentFormatter = (params) => {
  if (!params.value && params.value !== 0) return '-';
  return `${Number(params.value).toLocaleString()}%`;
};

// Tags cell renderer
export const tagsCellRenderer = (params) => {
  if (!params.value || !Array.isArray(params.value) || params.value.length === 0) return '-';

  // Render array of tags as badges
  return (
    <div className='flex flex-wrap gap-1'>
      {params.value.map((tag, index) => {
        return (
          <Badge
            key={index}
            variant='outline'
            className='bg-amber-50 text-amber-700'
            onClick={(e) => {
              return e.stopPropagation();
            }}
          >
            {typeof tag === 'object' ? tag.name : tag}
          </Badge>
        );
      })}
    </div>
  );
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

// Renderer for link cells
export const linkCellRenderer = (params) => {
  if (!params.value) return '-';
  // Display a clickable link
  let url = params.value;
  if (!url.startsWith('http://') && !url.startsWith('https://')) {
    url = `https://${url}`;
  }

  return (
    <a
      href={url}
      target='_blank'
      rel='noopener noreferrer'
      className='text-blue-600 hover:underline'
      onClick={(e) => {
        return e.stopPropagation();
      }}
    >
      {params.value}
    </a>
  );
};

// Phone cell renderer
export const phoneCellRenderer = (params) => {
  if (!params.value) return '-';

  // Get phone format from column definition or use international as default
  const phoneFormat = params.colDef?.phoneFormat || 'international';
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
