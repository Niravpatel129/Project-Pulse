import { Badge } from '@/components/ui/badge';
import { File, Star } from 'lucide-react';

// Date formatter for table cells
export const dateFormatter = (params) => {
  if (!params.value) return '-';
  // Format date in a user-friendly way
  const date = new Date(params.value);
  return date.toLocaleDateString();
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

// Renderer for URL links
export const linkCellRenderer = (params) => {
  if (!params.value) return '-';
  // Return a clickable link
  return (
    <a
      href={params.value.startsWith('http') ? params.value : `https://${params.value}`}
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
