import { TemplateField } from '@/api/models';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Grid, InfoIcon, Plus, Search, X } from 'lucide-react';
import { useEffect, useState } from 'react';
import { FcDocument } from 'react-icons/fc';
import { toast } from 'sonner';
import ModuleFieldRenderer from '../ProjectModules/ModuleFieldRenderer';

interface Module {
  _id: string;
  name: string;
  moduleType: string;
  versions: Array<{
    number: number;
    contentSnapshot: {
      sections: Array<{
        templateId: string;
        templateName: string;
        templateDescription: string;
        fields: Array<{
          templateFieldId: string;
          fieldName: string;
          fieldType: string;
          isRequired: boolean;
          description?: string;
          multiple?: boolean;
          fieldValue: any;
          relationType?: string;
        }>;
        sectionId: string;
      }>;
    };
  }>;
  currentVersion: number;
}

interface EditModuleFromTemplateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  module: Module;
}

interface ExtendedTemplateField extends Omit<TemplateField, 'id' | 'relationType'> {
  _id: string;
  selectOptions?: Array<{
    value: string;
    label: string;
    rowData: Record<string, any>;
  }>;
  relationType?: {
    _id: string;
    name: string;
  };
  relationTable?: {
    _id: string;
    name: string;
  };
  lookupFields?: string[];
}

interface ApiResponse {
  success: boolean;
  data: {
    _id: string;
    name: string;
    description: string;
    fields: ExtendedTemplateField[];
    workspace: string;
    createdBy: string;
    createdAt: string;
    updatedAt: string;
    __v: number;
  };
  message: string;
}

interface FormFieldValue {
  fieldName: string;
  fieldType: string;
  fieldValue: string | string[] | { rowId: string; displayValues: Record<string, any> } | null;
  templateFieldId: string;
  isRequired: boolean;
  description?: string;
  relationType?: {
    _id: string;
    name: string;
  };
  relationTable?: {
    _id: string;
    name: string;
  };
  lookupFields?: string[];
  multiple?: boolean;
}

interface ModuleData {
  name: string;
  sections: Array<{
    templateId: string;
    templateName: string;
    templateDescription: string;
    fields: Array<{
      templateFieldId: string;
      fieldName: string;
      fieldType: string;
      isRequired: boolean;
      description?: string;
      multiple?: boolean;
      fieldValue: any;
      relationType?: string;
    }>;
    sectionId: string;
  }>;
}

export default function EditModuleFromTemplateSheet({
  isOpen,
  onClose,
  module,
}: EditModuleFromTemplateSheetProps) {
  const [formValues, setFormValues] = useState<Record<string, any>>({});
  const [moduleName, setModuleName] = useState(module.name);
  const [isLoading, setIsLoading] = useState(true);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [templateDataMap, setTemplateDataMap] = useState<Record<string, any>>({});
  const [sectionFormValues, setSectionFormValues] = useState<Record<string, Record<string, any>>>(
    {},
  );
  const [localSections, setLocalSections] = useState(module.versions[0].contentSnapshot.sections);
  const queryClient = useQueryClient();

  // Get the current version's content
  const currentVersion = module.versions.find((v) => {
    return v.number === module.currentVersion;
  });
  const sections = localSections;

  // Fetch template data for each section
  const { data: templatesData } = useQuery<Record<string, ApiResponse>>({
    queryKey: [
      'templates',
      sections.map((s) => {
        return s.templateId;
      }),
    ],
    queryFn: async () => {
      const responses = await Promise.all(
        sections.map((section) => {
          return newRequest.get(`/module-templates/${section.templateId}`);
        }),
      );
      return responses.reduce((acc, response, index) => {
        acc[sections[index].templateId] = response.data;
        return acc;
      }, {} as Record<string, ApiResponse>);
    },
    enabled: isOpen && sections.length > 0,
  });

  // Fetch available templates for the append button
  const { data: availableTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await newRequest.get('/module-templates');
      return response.data.data;
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (templatesData) {
      setTemplateDataMap(templatesData);
      // Initialize form values for each section
      const initialValues: Record<string, Record<string, any>> = {};
      sections.forEach((section) => {
        const templateData = templatesData[section.templateId]?.data;
        if (templateData) {
          initialValues[section.sectionId] = {};
          templateData.fields.forEach((field) => {
            initialValues[section.sectionId][field._id] = field.multiple ? [] : '';
          });
        }
      });
      setSectionFormValues(initialValues);
      setIsLoading(false);
    }
  }, [templatesData, sections]);

  // Mutation for updating a module
  const updateModuleMutation = useMutation({
    mutationFn: async (moduleData: {
      name: string;
      versions: Array<{
        number: number;
        contentSnapshot: {
          sections: Array<{
            templateId: string;
            templateName: string;
            templateDescription: string;
            fields: Array<{
              templateFieldId: string;
              fieldName: string;
              fieldType: string;
              isRequired: boolean;
              description?: string;
              multiple?: boolean;
              fieldValue: any;
              relationType?: string;
            }>;
            sectionId: string;
          }>;
        };
      }>;
    }) => {
      const response = await newRequest.put(
        `/project-modules/templated-module/${module._id}`,
        moduleData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectModules'] });
      queryClient.invalidateQueries({ queryKey: ['module', module._id] });
      toast.success('Module updated successfully');
      onClose();
      setFormValues({});
    },
  });

  const removeSection = (sectionId: string) => {
    // Update local sections
    const updatedSections = sections.filter((section) => {
      return section.sectionId !== sectionId;
    });
    setLocalSections(updatedSections);
  };

  const handleAddTemplate = (templateId: string) => {
    const selectedTemplate = availableTemplates?.find((t) => {
      return t._id === templateId;
    });
    if (!selectedTemplate) return;

    // Create new section with empty fields
    const newSection = {
      templateId: selectedTemplate._id,
      templateName: selectedTemplate.name,
      templateDescription: selectedTemplate.description,
      fields: [],
      sectionId: `${templateId}-${Date.now()}`,
    };

    // Update local sections
    setLocalSections([...sections, newSection]);

    // Initialize form values for the new section
    const initialValues: Record<string, any> = {};
    selectedTemplate.fields.forEach((field) => {
      initialValues[field._id] = field.multiple ? [] : '';
    });
    setSectionFormValues((prev) => {
      return {
        ...prev,
        [newSection.sectionId]: initialValues,
      };
    });

    setIsPopoverOpen(false);
  };

  const handleFieldChange = (sectionId: string, fieldId: string, value: any) => {
    setSectionFormValues((prev) => {
      return {
        ...prev,
        [sectionId]: {
          ...(prev[sectionId] || {}),
          [fieldId]: value,
        },
      };
    });
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!templatesData) return;

    const updatedSections = sections.map((section) => {
      const templateData = templatesData[section.templateId]?.data;
      if (!templateData) return section;

      const updatedFields = templateData.fields.map((field) => {
        const fieldValue = sectionFormValues[section.sectionId]?.[field._id] || '';
        const existingField = section.fields.find((f) => {
          return f.templateFieldId === field._id;
        });

        if (field.type === 'relation') {
          const selectedOption = field.selectOptions?.find((opt) => {
            return opt.value === fieldValue;
          });
          return {
            ...existingField,
            fieldValue: selectedOption
              ? {
                  rowId: selectedOption.value,
                  displayValues: selectedOption.rowData,
                  selectedAt: new Date().toISOString(),
                }
              : null,
          };
        }

        return {
          ...existingField,
          fieldValue: fieldValue || '',
        };
      });

      return {
        ...section,
        fields: updatedFields,
      };
    });

    const moduleData = {
      name: moduleName,
      versions: [
        {
          number: module.currentVersion + 1,
          contentSnapshot: {
            sections: updatedSections,
          },
        },
      ],
    };

    updateModuleMutation.mutate(moduleData);
  };

  const renderSection = (section) => {
    const template = templateDataMap[section.templateId]?.data;
    if (!template || !template.fields) return null;

    return (
      <Card
        key={section.sectionId}
        id={section.sectionId}
        className='overflow-hidden border border-gray-200 shadow-sm relative group/section'
      >
        {sections.length > 1 && section.sectionId !== `${sections[0].templateId}-0` && (
          <X
            className='absolute top-2 right-2 cursor-pointer text-gray-400 hover:text-gray-700 transition-all h-4 w-4 opacity-0 group-hover/section:opacity-100'
            onClick={() => {
              return removeSection(section.sectionId);
            }}
          />
        )}
        <CardContent className='p-4'>
          <div className='flex items-center gap-2 pb-3'>
            <div className='flex h-6 w-6 items-center justify-center rounded border border-gray-200 bg-gray-50'>
              <Grid className='h-3.5 w-3.5 text-gray-500' />
            </div>
            <span className='text-sm font-medium text-gray-800'>{template.name}</span>
          </div>
          <div className='space-y-3'>
            {template.fields.map((field) => {
              return (
                <ModuleFieldRenderer
                  key={field._id}
                  field={field}
                  value={sectionFormValues[section.sectionId]?.[field._id] || ''}
                  onChange={(value) => {
                    return handleFieldChange(section.sectionId, field._id, value);
                  }}
                />
              );
            })}
          </div>
        </CardContent>
      </Card>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-5xl p-0 gap-0'>
        <DialogTitle className='sr-only'>Edit Module</DialogTitle>
        <button
          onClick={onClose}
          className='absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground'
        >
          <X className='h-4 w-4' />
          <span className='sr-only'>Close</span>
        </button>
        <div className='flex w-full overflow-hidden rounded-lg bg-white'>
          {/* Left sidebar */}
          <div className='w-72 border-r border-gray-100 bg-white'>
            <div className='p-5'>
              <h2 className='text-base font-medium tracking-tight text-gray-900'>Templates</h2>

              <div className='mt-6'>
                <p className='mb-2 text-xs font-medium uppercase tracking-wider text-gray-500'>
                  BASE Template
                </p>
                <motion.div
                  className='mt-1 rounded-md bg-gray-50 p-2 transition-all'
                  whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                  whileTap={{ scale: 0.98 }}
                >
                  <div className='flex items-center gap-2'>
                    <div className='flex h-6 w-6 items-center justify-center rounded bg-blue-500 text-white shadow-sm'>
                      <Grid className='h-3.5 w-3.5' />
                    </div>
                    <span className='text-sm font-medium text-gray-800 capitalize'>
                      {sections[0]?.templateName}
                    </span>
                  </div>
                </motion.div>
              </div>

              <div className='mt-6'>
                <p className='mb-2 text-xs font-medium uppercase tracking-wider text-gray-500'>
                  APPENDED TEMPLATES
                </p>
                <div className='space-y-0.5'>
                  {sections.slice(1).map((section, index) => {
                    return (
                      <motion.div
                        key={`${section.sectionId}-${index}`}
                        className='flex cursor-pointer items-center justify-between rounded-md p-2 transition-all hover:bg-gray-50'
                        whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => {
                          const sectionElement = document.getElementById(section.sectionId);
                          if (sectionElement) {
                            sectionElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
                          }
                        }}
                      >
                        <div className='flex items-center gap-2'>
                          <div className='flex h-6 w-6 items-center justify-center rounded border border-gray-200 bg-gray-50'>
                            <Grid className='h-3.5 w-3.5 text-gray-500' />
                          </div>
                          <span className='text-sm font-medium text-gray-700'>
                            {section.templateName}
                          </span>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.button
                                className='text-gray-400 hover:text-gray-600'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  // TODO: Implement remove section functionality
                                }}
                                whileHover={{ scale: 1.1 }}
                                whileTap={{ scale: 0.9 }}
                              >
                                <X className='h-3.5 w-3.5' />
                              </motion.button>
                            </TooltipTrigger>
                            <TooltipContent side='right'>
                              <p className='text-xs'>Remove template</p>
                            </TooltipContent>
                          </Tooltip>
                        </TooltipProvider>
                      </motion.div>
                    );
                  })}

                  <Popover open={isPopoverOpen} onOpenChange={setIsPopoverOpen}>
                    <PopoverTrigger asChild>
                      <motion.div
                        className='flex cursor-pointer items-center gap-2 rounded-md p-2 transition-all border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                        whileTap={{ scale: 0.98 }}
                      >
                        <Plus className='h-4 w-4 text-gray-400' />
                        <span className='text-sm font-medium text-gray-700'>Append Template</span>
                      </motion.div>
                    </PopoverTrigger>
                    <PopoverContent
                      className='w-60 p-0 border border-gray-200 shadow-md'
                      align='start'
                      sideOffset={5}
                      avoidCollisions={false}
                    >
                      <div className='p-2 border-b border-gray-100'>
                        <div className='relative'>
                          <Search className='absolute left-2 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400' />
                          <input
                            type='text'
                            placeholder='Search templates...'
                            className='w-full pl-8 pr-2 py-1.5 text-sm border border-gray-200 rounded-md focus:outline-none focus:ring-1 focus:ring-blue-500'
                            value={searchTerm}
                            onChange={(e) => {
                              return setSearchTerm(e.target.value);
                            }}
                          />
                        </div>
                      </div>
                      <div className='py-1 max-h-[300px] overflow-y-auto'>
                        {availableTemplates
                          ?.filter((template) => {
                            return template.name.toLowerCase().includes(searchTerm.toLowerCase());
                          })
                          .map((template) => {
                            return (
                              <motion.div
                                key={template._id}
                                className='flex cursor-pointer items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  return handleAddTemplate(template._id);
                                }}
                              >
                                <div className='flex items-center gap-2'>
                                  <FcDocument className='h-4 w-4 text-gray-400' />
                                  {template.icon}
                                  <span>{template.name}</span>
                                </div>
                                <TooltipProvider>
                                  <Tooltip>
                                    <TooltipTrigger asChild>
                                      <InfoIcon className='h-3 w-3 text-gray-400' />
                                    </TooltipTrigger>
                                    <TooltipContent side='right'>
                                      <p className='text-xs max-w-[200px]'>
                                        {template.description}
                                      </p>
                                    </TooltipContent>
                                  </Tooltip>
                                </TooltipProvider>
                              </motion.div>
                            );
                          })}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className='flex-1 overflow-auto bg-white p-0 scrollbar-hide max-h-[80vh] min-h-[85vh] overflow-y-auto flex flex-col'>
            <div className='flex-1 px-5 pt-5'>
              <h1 className='text-lg font-medium tracking-tight text-gray-900'>Edit Module</h1>

              <div className='mt-4 space-y-4'>
                <motion.div
                  className='flex flex-col gap-4'
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                >
                  <Card className='overflow-hidden border border-gray-200 shadow-sm'>
                    <CardContent className='p-4'>
                      <div className='space-y-4'>
                        <div className='space-y-2'>
                          <Label htmlFor='moduleName'>Module Name</Label>
                          <Input
                            id='moduleName'
                            value={moduleName}
                            onChange={(e) => {
                              return setModuleName(e.target.value);
                            }}
                            placeholder='Enter module name'
                          />
                        </div>

                        {isLoading ? (
                          <>
                            <div className='space-y-2'>
                              <Skeleton className='h-4 w-24' />
                              <Skeleton className='h-10 w-full' />
                            </div>
                            <div className='space-y-2'>
                              <Skeleton className='h-4 w-32' />
                              <Skeleton className='h-10 w-full' />
                            </div>
                          </>
                        ) : (
                          sections.map((section) => {
                            return renderSection(section);
                          })
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              </div>
            </div>

            <div className='sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4'>
              <motion.div className='flex justify-end'>
                <Button
                  className='h-9 px-4 text-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors'
                  onClick={handleSubmit}
                  disabled={updateModuleMutation.isPending || isLoading}
                >
                  {updateModuleMutation.isPending ? 'Saving...' : 'Save Changes'}
                </Button>
              </motion.div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
