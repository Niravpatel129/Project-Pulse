import { Label } from '@/components/ui/label';
import { motion } from 'framer-motion';
import FilePreview from './FilePreview';

interface TemplateField {
  templateFieldId: string;
  fieldName: string;
  fieldType: string;
  isRequired: boolean;
  multiple: boolean;
  description?: string;
  fieldValue: any;
}

interface TemplateSection {
  sectionId: string;
  templateName: string;
  templateDescription?: string;
  fields: TemplateField[];
}

interface TemplatePreviewProps {
  templateDetails: TemplateSection[];
}

export default function TemplatePreview({ templateDetails }: TemplatePreviewProps) {
  const renderFieldLabel = (label: string) => {
    return <Label className='text-muted-foreground text-sm'>{label}</Label>;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
      className='space-y-6 md:space-y-8'
    >
      {templateDetails.map((section) => {
        return (
          <motion.div
            key={section.sectionId}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className='bg-white rounded-lg border shadow-sm p-4 md:p-6 relative'
          >
            <div className='space-y-4 md:space-y-6'>
              <div>
                <Label className='text-xs text-muted-foreground flex items-center gap-1 mb-1 absolute -top-3 left-6 bg-gray-100 border rounded px-2 py-1 text-black'>
                  {section.templateName}
                </Label>
              </div>
              <div className='!m-2'>
                <div className='flex justify-between flex-wrap flex-col gap-6'>
                  {section.fields.map((field) => {
                    return (
                      <div key={field.templateFieldId} className='rounded-lg '>
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
                          <div>
                            {renderFieldLabel(field.fieldName)}
                            {field.description && (
                              <p className='text-xs text-muted-foreground mt-1'>
                                {field.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className=''>
                          <div className=''>
                            {field.fieldType === 'relation' ? (
                              <div className=''>
                                {field.fieldValue?.displayValues ? (
                                  Object.entries(field.fieldValue.displayValues).map(
                                    ([key, value]) => {
                                      return (
                                        <div key={key} className='flex gap-2'>
                                          <span className='text-xs font-medium'>{key}:</span>
                                          {renderFieldValue(value)}
                                        </div>
                                      );
                                    },
                                  )
                                ) : (
                                  <span className='text-xs text-muted-foreground'>
                                    No relation data
                                  </span>
                                )}
                              </div>
                            ) : field.fieldType === 'attachment' || field.fieldType === 'files' ? (
                              <div className=''>
                                {field.fieldValue ? (
                                  <FilePreview
                                    file={{
                                      _id: field.fieldValue._id,
                                      downloadURL: field.fieldValue.downloadURL,
                                      originalName: field.fieldValue.originalName,
                                      contentType: field.fieldValue.contentType,
                                    }}
                                  />
                                ) : (
                                  <span className='text-xs text-muted-foreground'>
                                    No file uploaded
                                  </span>
                                )}
                              </div>
                            ) : field.fieldType === 'longtext' ? (
                              <div className=' max-h-32 overflow-y-auto'>
                                <span className='text-sm whitespace-pre-wrap'>
                                  {field.fieldValue || 'No response'}
                                </span>
                              </div>
                            ) : Array.isArray(field.fieldValue) ? (
                              <div className=''>
                                {field.fieldValue.length > 0 ? (
                                  field.fieldValue.map((value, idx) => {
                                    return (
                                      <div key={idx} className='text-sm mb-1 last:mb-0'>
                                        {value}
                                      </div>
                                    );
                                  })
                                ) : (
                                  <span className='text-xs text-muted-foreground'>
                                    No values selected
                                  </span>
                                )}
                              </div>
                            ) : (
                              <div className=''>
                                {field.fieldValue && typeof field.fieldValue === 'object' ? (
                                  <span className='text-xs text-muted-foreground'>
                                    Cannot render this field type
                                  </span>
                                ) : field.fieldValue ? (
                                  <span className='text-sm'>{field.fieldValue}</span>
                                ) : (
                                  <span className='text-xs text-muted-foreground'>No response</span>
                                )}
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </motion.div>
        );
      })}
    </motion.div>
  );
}

// Helper function to render different types of field values
function renderFieldValue(value: any) {
  if (value === null || value === undefined) {
    return <span className='text-xs text-muted-foreground'>None</span>;
  }

  if (Array.isArray(value)) {
    return (
      <div className='flex flex-col'>
        {value.length === 0 ? (
          <span className='text-xs text-muted-foreground'>Empty list</span>
        ) : (
          value.map((item, idx) => {
            return (
              <div key={idx} className='text-xs'>
                {typeof item === 'object' && item !== null ? (
                  item.originalName || item.name ? (
                    <span>{item.originalName || item.name}</span>
                  ) : (
                    <span>[Complex object]</span>
                  )
                ) : (
                  String(item)
                )}
              </div>
            );
          })
        )}
      </div>
    );
  }

  if (typeof value === 'object' && value !== null) {
    return <span className='text-xs'>[Complex object]</span>;
  }

  return <span className='text-xs'>{String(value)}</span>;
}
