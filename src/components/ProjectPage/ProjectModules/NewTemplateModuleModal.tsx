'use client';

import { AnimatePresence, motion } from 'framer-motion';
import { useEffect, useRef } from 'react';

import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { Grid, InfoIcon, Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import { FcDocument } from 'react-icons/fc';
import { LuFolder } from 'react-icons/lu';
import AllTemplatesModal from './AllTemplatesModal';
import ModuleFieldRenderer from './ModuleFieldRenderer';

interface ModuleData {
  name: string;
  description: string;
  sections: Array<{
    templateId: string;
    templateName: string;
    templateDescription: string;
    fields: any[];
    sectionId: string;
    formValues: Record<string, any>;
  }>;
}

interface NewTemplateModuleModalProps {
  isOpen: boolean;
  onClose: () => void;
  template: any;
  templateName: string;
  onTemplateSelect?: (template: any) => void;
  onEdit?: (template: any) => void;
}

export default function NewTemplateModuleModal({
  isOpen,
  onClose,
  template,
  onTemplateSelect,
  onEdit,
}: NewTemplateModuleModalProps) {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(['shipping']);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [formErrors, setFormErrors] = useState<Record<string, string[]>>({});
  const [showAllTemplates, setShowAllTemplates] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(template);
  const [sections, setSections] = useState([
    {
      templateId: template._id,
      templateName: template.name,
      templateDescription: template.description,
      fields: [],
      sectionId: `${template._id}-0`,
      formValues: {},
    },
  ]);
  const [templateDataMap, setTemplateDataMap] = useState<Record<string, any>>({});
  const [sectionFormValues, setSectionFormValues] = useState<Record<string, Record<string, any>>>(
    {},
  );
  const { project } = useProject();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});
  const queryClient = useQueryClient();

  const { data: availableTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await newRequest.get('/module-templates');
      return response.data.data;
    },
    enabled: isOpen,
  });

  // Fetch template data for initial template
  const { data: initialTemplateData } = useQuery({
    queryKey: ['template', template._id],
    queryFn: async () => {
      const response = await newRequest.get(`/module-templates/${template._id}`);
      return response.data;
    },
    enabled: isOpen,
  });

  // Effect to handle template data when it's loaded
  useEffect(() => {
    if (initialTemplateData) {
      setTemplateDataMap((prev) => {
        return {
          ...prev,
          [template._id]: initialTemplateData,
        };
      });

      // Initialize form values for the first section
      const initialValues: Record<string, any> = {};
      if (initialTemplateData.data && Array.isArray(initialTemplateData.data.fields)) {
        initialTemplateData.data.fields.forEach((field) => {
          initialValues[field._id] = field.multiple ? [] : '';
        });
      } else {
        console.warn(
          `Initial template data does not have the expected structure`,
          initialTemplateData,
        );
      }

      setSectionFormValues((prev) => {
        return {
          ...prev,
          [`${template._id}-0`]: initialValues,
        };
      });
    }
  }, [initialTemplateData, template._id]);

  // Monitor templateDataMap changes to ensure UI is updated when template data is fetched
  useEffect(() => {
    console.log('templateDataMap changed:', templateDataMap);
    // This will force re-render of the component when templateDataMap changes
  }, [templateDataMap]);

  // Function to fetch template data using React Query
  const fetchTemplateData = async (templateId: string, sectionId: string) => {
    try {
      console.log(`Fetching template data for ${templateId}, section ${sectionId}`);

      // Use a different approach to handle the async query
      const response = await newRequest.get(`/module-templates/${templateId}`);
      console.log(`API response for template ${templateId}:`, response.data);
      const data = response.data;

      // Immediately update the template data map with the fetched data
      setTemplateDataMap((prev) => {
        const updated = {
          ...prev,
          [templateId]: data,
        };
        console.log('Updated templateDataMap:', updated);
        return updated;
      });

      // Initialize form values for the new section
      const initialValues: Record<string, any> = {};
      if (data && data.data && Array.isArray(data.data.fields)) {
        console.log(`Found ${data.data.fields.length} fields for template ${templateId}`);
        data.data.fields.forEach((field) => {
          initialValues[field._id] = field.multiple ? [] : '';
        });
      } else {
        console.warn(`Template data for ${templateId} does not have the expected structure`, data);
      }

      console.log(`Setting form values for section ${sectionId}:`, initialValues);
      setSectionFormValues((prev) => {
        const updated = {
          ...prev,
          [sectionId]: initialValues,
        };
        console.log('Updated sectionFormValues:', updated);
        return updated;
      });

      // Invalidate the query to ensure the UI updates
      queryClient.invalidateQueries({ queryKey: ['template', templateId] });

      return data;
    } catch (error) {
      console.error(`Failed to fetch template data for ${templateId}:`, error);
    }
  };

  const createModuleMutation = useMutation({
    mutationFn: async (moduleData: ModuleData) => {
      const response = await newRequest.post(
        `/project-modules/templated-module/${project._id}`,
        moduleData,
      );
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['projectModules'] });
      onClose();
    },
    onError: (error) => {
      console.error('Failed to create module:', error);
    },
  });

  const validateForm = () => {
    const errors: Record<string, string[]> = {};
    let isValid = true;

    sections.forEach((section) => {
      const template = templateDataMap[section.templateId]?.data;
      if (!template) return;

      const sectionErrors: string[] = [];
      template.fields.forEach((field) => {
        if (field.required) {
          const value = sectionFormValues[section.sectionId]?.[field._id];
          if (!value || (Array.isArray(value) && value.length === 0)) {
            sectionErrors.push(`${field.name} is required`);
            isValid = false;
          }
        }
      });

      if (sectionErrors.length > 0) {
        errors[section.sectionId] = sectionErrors;
      }
    });

    setFormErrors(errors);
    return isValid;
  };

  const handleCreateModule = async () => {
    if (!validateForm()) {
      return;
    }

    const moduleData = {
      name: template.name,
      description: template.description,
      sections: sections.map((section) => {
        // Include the form values directly in each section
        return {
          ...section,
          formValues: sectionFormValues[section.sectionId] || {},
        };
      }),
    };

    createModuleMutation.mutate(moduleData);
  };

  const handleAddTemplate = (templateId: string) => {
    console.log(`Adding template: ${templateId}`);
    const selectedTemplate = availableTemplates?.find((t) => {
      return t._id === templateId;
    });
    if (!selectedTemplate) {
      console.warn(`Template with ID ${templateId} not found in availableTemplates`);
      return;
    }
    console.log(`Selected template:`, selectedTemplate);

    // Create unique sectionId with timestamp
    const newSectionId = `${templateId}-${Date.now()}`; // Use timestamp to ensure uniqueness
    console.log(`Generated section ID: ${newSectionId}`);

    // Add new section
    setSections((prev) => {
      const newSections = [
        ...prev,
        {
          templateId: selectedTemplate._id,
          templateName: selectedTemplate.name,
          templateDescription: selectedTemplate.description,
          fields: [],
          sectionId: newSectionId,
          formValues: {},
        },
      ];
      console.log('Updated sections:', newSections);
      return newSections;
    });

    // Fetch and add new template data if not already in map
    console.log(
      `Checking if template ${templateId} exists in templateDataMap:`,
      templateDataMap[templateId] ? true : false,
    );
    if (!templateDataMap[templateId]) {
      console.log(`Template ${templateId} not in templateDataMap, fetching data...`);
      fetchTemplateData(templateId, newSectionId);
    } else {
      // If template data already exists, just initialize the form values
      console.log(`Template ${templateId} already in templateDataMap, reusing data`);
      const templateData = templateDataMap[templateId];
      console.log(`Existing template data:`, templateData);
      const initialValues: Record<string, any> = {};

      if (templateData && templateData.data && Array.isArray(templateData.data.fields)) {
        console.log(`Found ${templateData.data.fields.length} fields in existing template data`);
        templateData.data.fields.forEach((field) => {
          initialValues[field._id] = field.multiple ? [] : '';
        });
      } else {
        console.warn(
          `Template data for ${templateId} does not have the expected structure`,
          templateData,
        );
      }

      console.log(`Setting form values for section ${newSectionId}:`, initialValues);
      setSectionFormValues((prev) => {
        const updated = {
          ...prev,
          [newSectionId]: initialValues,
        };
        console.log('Updated sectionFormValues:', updated);
        return updated;
      });
    }

    setIsPopoverOpen(false);
  };

  const handleRemoveTemplate = (templateId: string) => {
    setSelectedTemplates(
      selectedTemplates.filter((id) => {
        return id !== templateId;
      }),
    );
  };

  const removeSection = (sectionId: string) => {
    setSections(
      sections.filter((section) => {
        return section.sectionId !== sectionId;
      }),
    );
  };

  const scrollToSection = (sectionId: string) => {
    const section = sectionRefs.current[sectionId];
    if (section) {
      section.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const renderSection = (section) => {
    console.log(`Rendering section ${section.sectionId} for template ${section.templateId}`);
    console.log(`Section data:`, section);
    console.log(`Template data from map:`, templateDataMap[section.templateId]);
    const template = templateDataMap[section.templateId]?.data;
    if (!template || !template.fields) {
      console.warn(`Cannot render section: missing template data for ${section.templateId}`);
      return null;
    }
    console.log(`Template fields:`, template.fields);

    return (
      <AnimatePresence mode='wait' key={section.sectionId}>
        <motion.div
          key={section.sectionId}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20, transition: { duration: 0.2 } }}
          transition={{ duration: 0.3, ease: 'easeOut' }}
        >
          <Card
            ref={(el) => {
              if (el) {
                sectionRefs.current[section.sectionId] = el;
              }
            }}
            className='overflow-hidden border border-gray-200 shadow-sm relative group/section'
          >
            {sections.length > 1 && (
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
                    <div key={field._id}>
                      <ModuleFieldRenderer
                        field={field}
                        value={sectionFormValues[section.sectionId]?.[field._id] || ''}
                        onChange={(value) => {
                          setSectionFormValues((prev) => {
                            return {
                              ...prev,
                              [section.sectionId]: {
                                ...(prev[section.sectionId] || {}),
                                [field._id]: value,
                              },
                            };
                          });
                          // Clear error when field is updated
                          if (formErrors[section.sectionId]?.length > 0) {
                            setFormErrors((prev) => {
                              const newErrors = { ...prev };
                              if (newErrors[section.sectionId]) {
                                newErrors[section.sectionId] = newErrors[section.sectionId].filter(
                                  (error) => {
                                    return !error.includes(field.name);
                                  },
                                );
                                if (newErrors[section.sectionId].length === 0) {
                                  delete newErrors[section.sectionId];
                                }
                              }
                              return newErrors;
                            });
                          }
                        }}
                      />
                      {formErrors[section.sectionId]?.some((error) => {
                        return error.includes(field.name);
                      }) && (
                        <p className='text-sm text-red-500 mt-1'>
                          {formErrors[section.sectionId].find((error) => {
                            return error.includes(field.name);
                          })}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>
    );
  };

  const handleTemplateSelect = (selectedTemplate) => {
    setCurrentTemplate(selectedTemplate);
    const newSectionId = `${selectedTemplate._id}-0`;
    setSections([
      {
        templateId: selectedTemplate._id,
        templateName: selectedTemplate.name,
        templateDescription: selectedTemplate.description,
        fields: [],
        sectionId: newSectionId,
        formValues: {},
      },
    ]);
    setSectionFormValues({});
    setFormErrors({});
    setShowAllTemplates(false);

    // Fetch template data and initialize form values
    fetchTemplateData(selectedTemplate._id, newSectionId);

    if (onTemplateSelect) {
      onTemplateSelect(selectedTemplate);
    }
  };

  return (
    <>
      <Dialog open={isOpen} onOpenChange={onClose}>
        <DialogContent className='max-w-5xl p-0 gap-0 '>
          <DialogTitle className='sr-only'>Create Order Template</DialogTitle>
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
                <Breadcrumb>
                  <BreadcrumbList>
                    <BreadcrumbItem>
                      <BreadcrumbLink
                        href='#'
                        className='flex items-center cursor-pointer'
                        onClick={() => {
                          return setShowAllTemplates(true);
                        }}
                      >
                        <LuFolder className='w-4 h-4 mr-1' /> All Templates
                      </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator> / </BreadcrumbSeparator>
                    <BreadcrumbItem>
                      <BreadcrumbPage>{currentTemplate.name}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </BreadcrumbList>
                </Breadcrumb>

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
                        {sections[0]?.templateName || currentTemplate.name}
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
                      const templateData = templateDataMap[section.templateId]?.data;
                      if (!templateData) return null;

                      return (
                        <motion.div
                          key={`${section.sectionId}-${index}`}
                          className='flex cursor-pointer items-center justify-between rounded-md p-2 transition-all hover:bg-gray-50'
                          whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => {
                            return scrollToSection(section.sectionId);
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
                                  onClick={() => {
                                    return removeSection(section.sectionId);
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
                <h1 className='text-lg font-medium tracking-tight text-gray-900'>New Module</h1>

                <div className='mt-4 space-y-4'>
                  <motion.div
                    className='flex flex-col gap-4'
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    {sections.map((section) => {
                      return renderSection(section);
                    })}
                  </motion.div>
                </div>
              </div>

              <div className='sticky bottom-0 bg-white border-t border-gray-100 px-5 py-4'>
                <motion.div className='flex justify-end'>
                  <Button
                    className='h-9 px-4 text-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors'
                    onClick={handleCreateModule}
                    disabled={createModuleMutation.isPending}
                  >
                    {createModuleMutation.isPending ? 'Creating...' : 'Create'}
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      <AllTemplatesModal
        isOpen={showAllTemplates}
        onClose={() => {
          return setShowAllTemplates(false);
        }}
        onTemplateSelect={handleTemplateSelect}
        onEdit={onEdit}
      />
    </>
  );
}
