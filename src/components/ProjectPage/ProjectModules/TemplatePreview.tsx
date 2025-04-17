import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { motion } from 'framer-motion';
import { HelpCircle } from 'lucide-react';
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
  console.log('🚀 templateDetails:', templateDetails);
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
            className='bg-white rounded-lg border shadow-sm p-4 md:p-6'
          >
            <div className='space-y-4 md:space-y-6'>
              <div>
                <Label className='text-xs text-muted-foreground flex items-center gap-1 mb-1'>
                  {section.templateName}
                  {section.templateDescription && (
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant='ghost'
                          className='h-2 w-2 p-0 ml-1 inline-flex items-center justify-center'
                        >
                          <HelpCircle className='h-4 w-4 text-muted-foreground' />
                          <span className='sr-only'>Template description</span>
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>{section.templateDescription}</TooltipContent>
                    </Tooltip>
                  )}
                </Label>
              </div>
              <div>
                <div className='mt-3 space-y-3 md:space-y-4'>
                  {section.fields.map((field) => {
                    return (
                      <div
                        key={field.templateFieldId}
                        className='bg-gray-50 p-3 md:p-4 rounded-lg border'
                      >
                        <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
                          <div>
                            <p className='font-medium'>{field.fieldName}</p>
                            <div className='flex flex-wrap items-center gap-1 md:gap-2 mt-1'>
                              <Badge variant='outline' className='text-xs'>
                                {field.fieldType}
                              </Badge>
                              {field.isRequired && (
                                <Badge variant='outline' className='text-xs bg-red-50 text-red-700'>
                                  Required
                                </Badge>
                              )}
                              {field.multiple && (
                                <Badge
                                  variant='outline'
                                  className='text-xs bg-blue-50 text-blue-700'
                                >
                                  Multiple
                                </Badge>
                              )}
                            </div>
                            {field.description && (
                              <p className='text-xs text-muted-foreground mt-1'>
                                {field.description}
                              </p>
                            )}
                          </div>
                        </div>
                        <div className='mt-2'>
                          <Label className='text-xs text-muted-foreground'>Response</Label>
                          <div className='mt-1'>
                            {field.fieldType === 'relation' ? (
                              <div className='bg-white p-2 rounded border'>
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
                              <div className='bg-white p-2 rounded border'>
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
                              <div className='bg-white p-2 rounded border max-h-32 overflow-y-auto'>
                                <span className='text-sm whitespace-pre-wrap'>
                                  {field.fieldValue || 'No response'}
                                </span>
                              </div>
                            ) : Array.isArray(field.fieldValue) ? (
                              <div className='bg-white p-2 rounded border'>
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
                              <div className='bg-white p-2 rounded border'>
                                {field.fieldValue && typeof field.fieldValue === 'object' ? (
                                  <span className='text-xs text-muted-foreground'>
                                    [Complex object]
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
