import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  ArrowLeft,
  CheckIcon,
  Edit2,
  Eye,
  HelpCircle,
  Menu,
  PencilIcon,
  Save,
  Settings,
} from 'lucide-react';
import React, { useState } from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useFormBuilder } from '../context/FormBuilderContext';

const FormBuilderHeader: React.FC = () => {
  const {
    previewMode,
    setPreviewMode,
    isMobile,
    showMobileMenu,
    setShowMobileMenu,
    changesSaved,
    saveChanges,
    validateForm,
    formElements,
    validationErrors,
    addClientDetailsSection,
    setValidationErrors,
    formValues,
    setActiveTab,
    formTitle,
    setFormTitle,
  } = useFormBuilder();

  const [editingFormTitle, setEditingFormTitle] = useState(false);

  // Initialize react-hook-form
  const methods = useForm();

  const handleCreateForm = () => {
    // Clear any previous validation errors first
    setValidationErrors([]);

    // Validate the form
    const isValid = validateForm();

    // If form validation fails and specifically needs client details, add it automatically
    if (
      !isValid &&
      validationErrors.some((error) => {
        return error.includes('Client Details');
      })
    ) {
      addClientDetailsSection();
      // Clear validation errors after adding client details
      setValidationErrors([]);

      // Re-validate after adding client details
      const isValidAfterClientDetails = validateForm();

      // If there are still validation errors, switch to the form tab to show errors
      if (!isValidAfterClientDetails) {
        setActiveTab('myform');
        return;
      }
    } else if (!isValid) {
      // If validation fails for other reasons, switch to the form tab to show errors
      setActiveTab('myform');
      return;
    }

    // Prepare payload for backend
    const payload = {
      formElements,
      formValues,
      metadata: {
        lastUpdated: new Date().toISOString(),
        createdBy: 'current-user', // This should be replaced with actual user info
        isValid,
      },
    };

    // Log the payload that would be sent to the backend
    console.log('Form payload for backend:', payload);

    // Save changes - we know validation has passed at this point
    saveChanges();
  };

  return (
    <FormProvider {...methods}>
      <header className='border-b bg-white/80 backdrop-blur-sm  z-20 shadow-sm w-full'>
        <div className='flex items-center px-4 md:px-6 h-14 md:h-16'>
          <Button
            variant='ghost'
            size='icon'
            className='mr-2 md:mr-3 text-gray-500 hover:text-gray-700'
            onClick={() => {
              return isMobile ? setShowMobileMenu(!showMobileMenu) : null;
            }}
          >
            {isMobile ? <Menu className='h-5 w-5' /> : <ArrowLeft className='h-5 w-5' />}
          </Button>
          <div className='flex flex-col'>
            <div className='flex items-center gap-2'>
              <span className='font-medium text-gray-800 text-base md:text-lg tracking-tight'>
                Form Builder
              </span>
              <span className='text-gray-400 hidden sm:inline'>/</span>
              <span className='text-gray-600 text-sm hidden sm:inline'>
                <div className='flex items-center gap-2'>
                  {editingFormTitle ? (
                    <Input
                      value={formTitle}
                      onChange={(e) => {
                        return setFormTitle(e.target.value);
                      }}
                    />
                  ) : (
                    formTitle
                  )}
                  {!editingFormTitle ? (
                    <div
                      className='flex items-center gap-1 cursor-pointer'
                      onClick={() => {
                        return setEditingFormTitle(true);
                      }}
                    >
                      <PencilIcon className='w-3 h-3' />
                    </div>
                  ) : (
                    <div
                      className='flex items-center gap-1 cursor-pointer'
                      onClick={() => {
                        return setEditingFormTitle(false);
                      }}
                    >
                      <CheckIcon className='w-3 h-3' />
                    </div>
                  )}
                </div>
              </span>
            </div>
          </div>
          <div className='ml-auto items-center gap-2 md:gap-3 hidden md:flex'>
            <Button
              variant={previewMode ? 'default' : 'outline'}
              size='sm'
              onClick={() => {
                return setPreviewMode(!previewMode);
              }}
              className='gap-1 md:gap-2 rounded-full text-xs aspect-square h-8 w-8 p-0 flex items-center justify-center'
            >
              {previewMode ? (
                <Edit2 className='h-3 w-3 md:h-4 md:w-4' />
              ) : (
                <Eye className='h-3 w-3 md:h-4 md:w-4' />
              )}
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='rounded-full text-gray-500 hover:text-gray-700 hidden md:flex'
            >
              <Settings className='h-5 w-5' />
            </Button>
            <Button
              variant='ghost'
              size='icon'
              className='rounded-full text-gray-500 hover:text-gray-700 hidden md:flex'
            >
              <HelpCircle className='h-5 w-5' />
            </Button>
            <Button
              className={cn(
                'rounded-full text-xs px-2 md:px-4 md:text-sm',
                changesSaved
                  ? 'bg-gray-100 hover:bg-gray-200 text-gray-700'
                  : 'bg-green-600 hover:bg-green-700 text-white',
              )}
              onClick={handleCreateForm}
            >
              <Save className='h-3 w-3 md:h-4 md:w-4 mr-1 md:mr-2' />
              <span className='hidden sm:inline'>Create Form</span>
              <span className='sm:hidden'>Create</span>
            </Button>
          </div>
        </div>
      </header>
    </FormProvider>
  );
};

export default FormBuilderHeader;
