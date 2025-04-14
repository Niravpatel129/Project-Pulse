'use client';

import { useEffect, useRef } from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Grid, InfoIcon, Plus, X } from 'lucide-react';
import { useState } from 'react';
import { FcDocument } from 'react-icons/fc';

export default function NewTemplateModuleModal({ isOpen, onClose, template, templateName }) {
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(['shipping']);
  const [moduleName, setModuleName] = useState(templateName || template.name);
  const [isPopoverOpen, setIsPopoverOpen] = useState(false);
  const [sections, setSections] = useState([
    {
      templateId: template._id,
      templateName: template.name,
      templateDescription: template.description,
      fields: [],
      sectionId: `${template._id}-0`,
    },
  ]);
  const [templateDataMap, setTemplateDataMap] = useState({});
  const [sectionFormValues, setSectionFormValues] = useState<Record<string, Record<string, any>>>(
    {},
  );
  const [sectionFieldErrors, setSectionFieldErrors] = useState<
    Record<string, Record<string, string>>
  >({});
  const queryClient = useQueryClient();
  const { project } = useProject();
  const sectionRefs = useRef<Record<string, HTMLDivElement | null>>({});

  console.log('🚀 sections:', sections);
  console.log('🚀 templateDataMap:', templateDataMap);

  const { data: availableTemplates } = useQuery({
    queryKey: ['templates'],
    queryFn: async () => {
      const response = await newRequest.get('/module-templates');
      return response.data.data;
    },
    enabled: isOpen,
  });

  useEffect(() => {
    if (isOpen) {
      newRequest.get(`/module-templates/${template._id}`).then((response) => {
        setTemplateDataMap((prev) => {
          return {
            ...prev,
            [template._id]: response.data,
          };
        });
        // Initialize form values for the first section
        const initialValues: Record<string, any> = {};
        response.data.data.fields.forEach((field) => {
          initialValues[field._id] = field.multiple ? [] : '';
        });
        setSectionFormValues((prev) => {
          return {
            ...prev,
            [template._id]: initialValues,
          };
        });
      });
    }
  }, [isOpen, template._id]);

  const handleAddTemplate = (templateId: string) => {
    const selectedTemplate = availableTemplates?.find((t) => {
      return t._id === templateId;
    });
    if (!selectedTemplate) return;

    // Count existing sections with this template to create unique sectionId
    const existingSectionsCount = sections.filter((s) => {
      return s.templateId === templateId;
    }).length;
    const newSectionId = `${templateId}-${Date.now()}`; // Use timestamp to ensure uniqueness

    // Add new section
    setSections((prev) => {
      return [
        ...prev,
        {
          templateId: selectedTemplate._id,
          templateName: selectedTemplate.name,
          templateDescription: selectedTemplate.description,
          fields: [],
          sectionId: newSectionId,
        },
      ];
    });

    // Fetch and add new template data if not already in map
    if (!templateDataMap[templateId]) {
      newRequest.get(`/module-templates/${templateId}`).then((response) => {
        const templateData = response.data;
        setTemplateDataMap((prev) => {
          return {
            ...prev,
            [templateId]: templateData,
          };
        });
        // Initialize form values for the new section
        const initialValues: Record<string, any> = {};
        templateData.data.fields.forEach((field) => {
          initialValues[field._id] = field.multiple ? [] : '';
        });
        setSectionFormValues((prev) => {
          return {
            ...prev,
            [newSectionId]: initialValues,
          };
        });
      });
    } else {
      // If template data already exists, just initialize the form values
      const templateData = templateDataMap[templateId];
      const initialValues: Record<string, any> = {};
      templateData.data.fields.forEach((field) => {
        initialValues[field._id] = field.multiple ? [] : '';
      });
      setSectionFormValues((prev) => {
        return {
          ...prev,
          [newSectionId]: initialValues,
        };
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
    const template = templateDataMap[section.templateId]?.data;
    if (!template || !template.fields) return null;

    return (
      <>
        <Card
          ref={(el) => {
            if (el) {
              sectionRefs.current[section.sectionId] = el;
            }
          }}
          className='overflow-hidden border border-gray-200 shadow-sm relative group'
        >
          {sections.length > 1 && (
            <X
              className='absolute top-2 right-2 cursor-pointer text-gray-400 hover:text-gray-700 transition-all h-4 w-4 opacity-0 group-hover:opacity-100'
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
                    <Label htmlFor={field._id} className='text-xs font-medium text-gray-700'>
                      {field.name}
                      {field.required && <span className='text-red-500 ml-1'>*</span>}
                    </Label>

                    {field.type === 'text' && (
                      <Input
                        id={field._id}
                        placeholder={`Enter ${field.name}`}
                        className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
                        value={sectionFormValues[section.templateId]?.[field._id] || ''}
                        onChange={(e) => {
                          const value = e.target.value;
                          setSectionFormValues((prev) => {
                            return {
                              ...prev,
                              [section.templateId]: {
                                ...(prev[section.templateId] || {}),
                                [field._id]: value,
                              },
                            };
                          });
                        }}
                      />
                    )}

                    {field.type === 'relation' && (
                      <Select
                        value={sectionFormValues[section.templateId]?.[field._id] || ''}
                        onValueChange={(value) => {
                          setSectionFormValues((prev) => {
                            return {
                              ...prev,
                              [section.templateId]: {
                                ...(prev[section.templateId] || {}),
                                [field._id]: value,
                              },
                            };
                          });
                        }}
                      >
                        <SelectTrigger className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'>
                          <SelectValue placeholder={`Select ${field.name}`} />
                        </SelectTrigger>
                        <SelectContent>
                          {field.selectOptions?.map((option) => {
                            return (
                              <SelectItem key={option.value} value={option.value}>
                                {option.label}
                              </SelectItem>
                            );
                          })}
                        </SelectContent>
                      </Select>
                    )}

                    {field.description && (
                      <p className='mt-1 text-xs text-gray-500'>{field.description}</p>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-5xl p-0 gap-0 '>
        <DialogTitle className='sr-only'>Create Order Template</DialogTitle>
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
                      {sections[0]?.templateName || template.name}
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
                        layout
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
                      <div className='py-1'>
                        {availableTemplates?.map((template) => {
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
                                    <p className='text-xs max-w-[200px]'>{template.description}</p>
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
          <div className='flex-1 overflow-auto bg-white p-0 scrollbar-hide max-h-[90vh] min-h-[85vh] overflow-y-auto flex flex-col'>
            <div className='px-5 pt-5'>
              <h1 className='text-lg font-medium tracking-tight text-gray-900'>New Module</h1>

              <div className='mt-4 space-y-4 flex-1'>
                <motion.div
                  className='flex flex-col gap-4'
                  initial={{ opacity: 0, y: 5 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.2 }}
                  layout
                >
                  {sections.map((section) => {
                    return renderSection(section);
                  })}
                </motion.div>
              </div>

              <div className='mt-5 flex justify-end sticky bottom-0 bg-white pt-4 border-t border-gray-100 pb-5'>
                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button className='h-9 px-4 text-sm bg-blue-500 text-white hover:bg-blue-600 transition-colors'>
                    Create
                  </Button>
                </motion.div>
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
