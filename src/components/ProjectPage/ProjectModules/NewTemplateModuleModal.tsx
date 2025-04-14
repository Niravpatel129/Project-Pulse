'use client';

import React from 'react';

import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronRight, CreditCard, FileText, Grid, Paperclip, Plus, User, X } from 'lucide-react';
import { useState } from 'react';

export default function NewTemplateModuleModal({ isOpen, onClose, template }) {
  const [hoveredItem, setHoveredItem] = useState<string | null>(null);
  const [selectedTemplates, setSelectedTemplates] = useState<string[]>(['shipping']);

  const templateOptions = [
    { id: 'shipping', name: 'Shipping Template', icon: <Paperclip className='h-3.5 w-3.5' /> },
    { id: 'billing', name: 'Billing Template', icon: <CreditCard className='h-3.5 w-3.5' /> },
    { id: 'product', name: 'Product Template', icon: <FileText className='h-3.5 w-3.5' /> },
    { id: 'customer', name: 'Customer Template', icon: <User className='h-3.5 w-3.5' /> },
  ];

  const handleAddTemplate = (templateId: string) => {
    if (!selectedTemplates.includes(templateId)) {
      setSelectedTemplates([...selectedTemplates, templateId]);
    }
  };

  const handleRemoveTemplate = (templateId: string) => {
    setSelectedTemplates(
      selectedTemplates.filter((id) => {
        return id !== templateId;
      }),
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-5xl p-0 gap-0'>
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
                    <span className='text-sm font-medium text-gray-800'>Order Template</span>
                  </div>
                </motion.div>
              </div>

              <div className='mt-6'>
                <p className='mb-2 text-xs font-medium uppercase tracking-wider text-gray-500'>
                  APPENDED TEMPLATES
                </p>
                <div className='space-y-0.5'>
                  {selectedTemplates.map((templateId) => {
                    const template = templateOptions.find((t) => {
                      return t.id === templateId;
                    });
                    if (!template) return null;

                    return (
                      <motion.div
                        key={template.id}
                        className='flex cursor-pointer items-center justify-between rounded-md p-2 transition-all hover:bg-gray-50'
                        whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                        whileTap={{ scale: 0.98 }}
                        onHoverStart={() => {
                          return setHoveredItem(template.id);
                        }}
                        onHoverEnd={() => {
                          return setHoveredItem(null);
                        }}
                        layout
                      >
                        <div className='flex items-center gap-2'>
                          {React.cloneElement(template.icon, {
                            className: `h-4 w-4 ${
                              hoveredItem === template.id ? 'text-gray-800' : 'text-gray-400'
                            }`,
                          })}
                          <span className='text-sm font-medium text-gray-700'>{template.name}</span>
                        </div>
                        <TooltipProvider>
                          <Tooltip>
                            <TooltipTrigger asChild>
                              <motion.button
                                className='text-gray-400 hover:text-gray-600'
                                onClick={() => {
                                  return handleRemoveTemplate(template.id);
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

                  <Popover>
                    <PopoverTrigger asChild>
                      <motion.div
                        className='flex cursor-pointer items-center gap-2 rounded-md p-2 transition-all border border-dashed border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                        whileTap={{ scale: 0.98 }}
                        onHoverStart={() => {
                          return setHoveredItem('append');
                        }}
                        onHoverEnd={() => {
                          return setHoveredItem(null);
                        }}
                      >
                        <Plus
                          className={`h-4 w-4 ${
                            hoveredItem === 'append' ? 'text-gray-800' : 'text-gray-400'
                          }`}
                        />
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
                        {templateOptions
                          .filter((template) => {
                            return !selectedTemplates.includes(template.id);
                          })
                          .map((template) => {
                            return (
                              <motion.div
                                key={template.id}
                                className='flex cursor-pointer items-center justify-between px-3 py-2 text-sm text-gray-700 hover:bg-gray-50'
                                whileHover={{ backgroundColor: 'rgba(249, 250, 251, 1)' }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => {
                                  return handleAddTemplate(template.id);
                                }}
                              >
                                <div className='flex items-center gap-2'>
                                  {template.icon}
                                  <span>{template.name}</span>
                                </div>
                                <ChevronRight className='h-3 w-3 text-gray-400' />
                              </motion.div>
                            );
                          })}
                        {templateOptions.length === selectedTemplates.length && (
                          <div className='px-3 py-2 text-sm text-gray-500 italic'>
                            All templates added
                          </div>
                        )}
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </div>
          </div>

          {/* Main content */}
          <div className='flex-1 overflow-auto bg-white p-5'>
            <h1 className='text-lg font-medium tracking-tight text-gray-900'>Create Order</h1>

            <div className='mt-4 space-y-4'>
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
                layout
              >
                <Card className='overflow-hidden border border-gray-200 shadow-sm'>
                  <CardContent className='p-4'>
                    <div className='flex items-center gap-2 pb-3'>
                      <div className='flex h-6 w-6 items-center justify-center rounded border border-gray-200 bg-gray-50'>
                        <Grid className='h-3.5 w-3.5 text-gray-500' />
                      </div>
                      <span className='text-sm font-medium text-gray-800'>Template A</span>
                    </div>

                    <div className='space-y-3'>
                      <div>
                        <Label htmlFor='name' className='text-xs font-medium text-gray-700'>
                          Name
                        </Label>
                        <Input
                          id='name'
                          defaultValue='John Doe'
                          className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
                        />
                      </div>
                      <div>
                        <Label htmlFor='email' className='text-xs font-medium text-gray-700'>
                          Email
                        </Label>
                        <Input
                          id='email'
                          defaultValue='john@email.com'
                          className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
                        />
                      </div>
                      <div>
                        <Label htmlFor='phone' className='text-xs font-medium text-gray-700'>
                          Phone
                        </Label>
                        <Input
                          id='phone'
                          defaultValue='+1 234 567 8900'
                          className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
                        />
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>

              <AnimatePresence>
                {selectedTemplates.includes('shipping') && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -5, height: 0 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <Card className='overflow-hidden border border-gray-200 shadow-sm'>
                      <CardContent className='p-4'>
                        <div className='flex items-center justify-between pb-3'>
                          <div className='flex items-center gap-2'>
                            <Paperclip className='h-4 w-4 text-gray-500' />
                            <span className='text-sm font-medium text-gray-800'>
                              Template B: Shipping Info
                            </span>
                          </div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-6 w-6 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                              onClick={() => {
                                return handleRemoveTemplate('shipping');
                              }}
                            >
                              <X className='h-3.5 w-3.5' />
                            </Button>
                          </motion.div>
                        </div>

                        <div className='space-y-3'>
                          <div>
                            <Label htmlFor='address' className='text-xs font-medium text-gray-700'>
                              Address
                            </Label>
                            <Input
                              id='address'
                              defaultValue='123 Main St'
                              className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
                            />
                          </div>
                          <div>
                            <Label htmlFor='city' className='text-xs font-medium text-gray-700'>
                              City
                            </Label>
                            <Input
                              id='city'
                              defaultValue='Springfield'
                              className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
                            />
                          </div>
                          <div>
                            <Label htmlFor='postal' className='text-xs font-medium text-gray-700'>
                              Postal Code
                            </Label>
                            <Input
                              id='postal'
                              defaultValue='90210'
                              className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
                            />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {selectedTemplates.includes('billing') && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -5, height: 0 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <Card className='overflow-hidden border border-gray-200 shadow-sm'>
                      <CardContent className='p-4'>
                        <div className='flex items-center justify-between pb-3'>
                          <div className='flex items-center gap-2'>
                            <CreditCard className='h-4 w-4 text-gray-500' />
                            <span className='text-sm font-medium text-gray-800'>
                              Billing Information
                            </span>
                          </div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-6 w-6 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                              onClick={() => {
                                return handleRemoveTemplate('billing');
                              }}
                            >
                              <X className='h-3.5 w-3.5' />
                            </Button>
                          </motion.div>
                        </div>

                        <div className='space-y-3'>
                          <div>
                            <Label htmlFor='cardName' className='text-xs font-medium text-gray-700'>
                              Name on Card
                            </Label>
                            <Input
                              id='cardName'
                              placeholder='John Doe'
                              className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
                            />
                          </div>
                          <div>
                            <Label
                              htmlFor='cardNumber'
                              className='text-xs font-medium text-gray-700'
                            >
                              Card Number
                            </Label>
                            <Input
                              id='cardNumber'
                              placeholder='•••• •••• •••• ••••'
                              className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
                            />
                          </div>
                          <div className='grid grid-cols-2 gap-3'>
                            <div>
                              <Label htmlFor='expiry' className='text-xs font-medium text-gray-700'>
                                Expiry Date
                              </Label>
                              <Input
                                id='expiry'
                                placeholder='MM/YY'
                                className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
                              />
                            </div>
                            <div>
                              <Label htmlFor='cvc' className='text-xs font-medium text-gray-700'>
                                CVC
                              </Label>
                              <Input
                                id='cvc'
                                placeholder='•••'
                                className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}

                {selectedTemplates.includes('product') && (
                  <motion.div
                    initial={{ opacity: 0, y: 5, height: 0 }}
                    animate={{ opacity: 1, y: 0, height: 'auto' }}
                    exit={{ opacity: 0, y: -5, height: 0 }}
                    transition={{ duration: 0.2 }}
                    layout
                  >
                    <Card className='overflow-hidden border border-gray-200 shadow-sm'>
                      <CardContent className='p-4'>
                        <div className='flex items-center justify-between pb-3'>
                          <div className='flex items-center gap-2'>
                            <FileText className='h-4 w-4 text-gray-500' />
                            <span className='text-sm font-medium text-gray-800'>
                              Product Information
                            </span>
                          </div>
                          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-6 w-6 rounded-full text-gray-500 hover:bg-gray-100 hover:text-gray-700'
                              onClick={() => {
                                return handleRemoveTemplate('product');
                              }}
                            >
                              <X className='h-3.5 w-3.5' />
                            </Button>
                          </motion.div>
                        </div>

                        <div className='space-y-3'>
                          <div>
                            <Label
                              htmlFor='productName'
                              className='text-xs font-medium text-gray-700'
                            >
                              Product Name
                            </Label>
                            <Input
                              id='productName'
                              placeholder='Premium Widget'
                              className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
                            />
                          </div>
                          <div className='grid grid-cols-2 gap-3'>
                            <div>
                              <Label
                                htmlFor='quantity'
                                className='text-xs font-medium text-gray-700'
                              >
                                Quantity
                              </Label>
                              <Input
                                id='quantity'
                                type='number'
                                defaultValue='1'
                                min='1'
                                className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
                              />
                            </div>
                            <div>
                              <Label htmlFor='price' className='text-xs font-medium text-gray-700'>
                                Price
                              </Label>
                              <Input
                                id='price'
                                placeholder='$0.00'
                                className='mt-1 h-9 border-gray-200 bg-white px-3 py-2 text-sm text-gray-800 shadow-sm transition-all focus-visible:border-gray-300 focus-visible:ring-1 focus-visible:ring-gray-300'
                              />
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className='mt-5 flex justify-end'>
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
