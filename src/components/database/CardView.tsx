import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';

interface CardViewProps {
  records: any[];
  columns: any[];
  toggleSelectRecord: (id: string) => void;
}

export function CardView({ records, columns, toggleSelectRecord }: CardViewProps) {
  if (records.length === 0) {
    // Render skeleton loading for card view
    return (
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
        {Array.from({ length: 6 }).map((_, index) => {
          return (
            <div key={`skeleton-card-${index}`} className='border rounded-md p-3'>
              <div className='flex justify-between items-center mb-2'>
                <div className='h-5 w-32 bg-gray-200 rounded'></div>
                <div className='h-4 w-4 bg-gray-200 rounded'></div>
              </div>
              {Array.from({ length: 3 }).map((_, fieldIndex) => {
                return (
                  <div key={`skeleton-field-${index}-${fieldIndex}`} className='flex py-1 text-sm'>
                    <div className='h-4 w-1/3 mr-2 bg-gray-200 rounded'></div>
                    <div className='h-4 w-2/3 bg-gray-200 rounded'></div>
                  </div>
                );
              })}
            </div>
          );
        })}
      </div>
    );
  }

  // Render actual card data
  return (
    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 p-4'>
      {records
        .sort((a, b) => {
          // Sort by position or createdAt
          if (a.position !== undefined && b.position !== undefined) {
            return a.position - b.position;
          }
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        })
        .map((record) => {
          return (
            <div
              key={`card-${record._id}`}
              className='border rounded-md p-3 hover:shadow-md transition-shadow relative'
            >
              <div className='flex justify-between items-center mb-2 absolute top-2 right-2'>
                <Checkbox
                  checked={record.values?.selected}
                  onCheckedChange={() => {
                    return toggleSelectRecord(record._id);
                  }}
                />
              </div>
              {columns
                .filter((col) => {
                  return !col.hidden && col.id !== 'name';
                })
                .sort((a, b) => {
                  return (a.order || 0) - (b.order || 0);
                })
                .map((column) => {
                  return (
                    <div
                      key={`card-field-${record._id}-${column.id}`}
                      className='flex py-1 text-sm'
                    >
                      <span className='text-gray-500 w-1/3'>{column.name}:</span>
                      <span className='w-2/3'>
                        {column.id === 'tags' ? (
                          <div className='flex flex-wrap gap-1'>
                            {record.values.tags?.map((tag: any) => {
                              return (
                                <Badge
                                  key={`tag-${tag.id}`}
                                  variant='outline'
                                  className='bg-amber-50 text-amber-700'
                                >
                                  {tag.name}
                                </Badge>
                              );
                            })}
                          </div>
                        ) : column.type === 'attachment' ? (
                          // Handle attachment type
                          Array.isArray(record.values[column.id]) ? (
                            <div className='flex flex-wrap gap-1'>
                              {record.values[column.id]?.map((file: any, idx: number) => {
                                return (
                                  <a
                                    key={`file-${idx}-${file.id}`}
                                    href={file.downloadURL || file.url}
                                    target='_blank'
                                    rel='noopener noreferrer'
                                    className='no-underline hover:opacity-80 transition-opacity'
                                  >
                                    <Badge
                                      variant='outline'
                                      className='bg-blue-50 text-blue-700 cursor-pointer'
                                    >
                                      {file.name || file.originalName || 'File'}
                                    </Badge>
                                  </a>
                                );
                              })}
                            </div>
                          ) : record.values[column.id] ? (
                            // Handle single attachment
                            <a
                              href={
                                record.values[column.id].downloadURL || record.values[column.id].url
                              }
                              target='_blank'
                              rel='noopener noreferrer'
                              className='no-underline hover:opacity-80 transition-opacity'
                            >
                              <Badge
                                variant='outline'
                                className='bg-blue-50 text-blue-700 cursor-pointer'
                              >
                                {record.values[column.id].name ||
                                  record.values[column.id].originalName ||
                                  'File'}
                              </Badge>
                            </a>
                          ) : (
                            '-'
                          )
                        ) : (
                          record.values[column.id] || '-'
                        )}
                      </span>
                    </div>
                  );
                })}
            </div>
          );
        })}
    </div>
  );
}
