import { Button } from '@/components/ui/button';
import { AlertCircle, Eye } from 'lucide-react';
import React from 'react';
import { FormProvider, useForm } from 'react-hook-form';
import { useFormBuilder } from '../context/FormBuilderContext';
import { getOperatorText, getValidationErrorMessage, shouldShowElement } from '../utils';
import EmptyFormState from './EmptyFormState';
import FormElement from './FormElement';

const FormCanvasContent: React.FC = () => {
  const {
    formElements,
    previewMode,
    formValues,
    selectedElementId,
    openElementEditor,
    selectElement,
    duplicateElement,
    deleteElement,
    removeCondition,
    handleFormValueChange,
    addElement,
    addClientDetailsSection,
    handleDragStart,
    handleDragOver,
    handleDrop,
    setPreviewMode,
    validationErrors,
    setActiveTab,
    setValidationErrors,
  } = useFormBuilder();

  // Initialize react-hook-form to provide form context for any FormControl, FormItem, etc. components
  const methods = useForm();

  return (
    <FormProvider {...methods}>
      <div className='w-full'>
        {previewMode && (
          <div className='mb-6 p-4 bg-blue-50/70 text-blue-700 rounded-xl flex items-center justify-between shadow-sm'>
            <div className='flex items-center gap-2'>
              <Eye className='h-5 w-5' />
              <span className='font-medium'>
                Preview Mode: See how your form will appear to users
              </span>
            </div>
            <Button
              variant='outline'
              size='sm'
              onClick={() => {
                return setPreviewMode(false);
              }}
              className='rounded-full'
            >
              Exit Preview
            </Button>
          </div>
        )}

        {!previewMode && validationErrors.length > 0 && (
          <div className='mb-6 p-4 bg-amber-50/70 text-amber-700 rounded-xl flex items-center justify-between shadow-sm'>
            <div className='flex items-center gap-2'>
              <AlertCircle className='h-5 w-5' />
              <span className='font-medium'>{validationErrors[0]}</span>
            </div>
            {validationErrors[0].includes('Client Details') && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  addClientDetailsSection();
                  setValidationErrors([]);
                }}
                className='rounded-full'
              >
                Add Client Details
              </Button>
            )}
            {validationErrors[0].includes('Empty Form') && (
              <Button
                variant='outline'
                size='sm'
                onClick={() => {
                  return setActiveTab('elements');
                }}
                className='rounded-full'
              >
                Add Elements
              </Button>
            )}
          </div>
        )}

        {formElements.length === 0 ? (
          <EmptyFormState
            addElement={addElement}
            addClientDetailsSection={addClientDetailsSection}
          />
        ) : (
          <div className='space-y-6 mb-6'>
            {formElements.map((element) => {
              // In preview mode, check if element should be shown based on conditions
              const isVisible = previewMode
                ? shouldShowElement(element, formElements, formValues, previewMode)
                : true;

              if (!isVisible) return null;

              return (
                <FormElement
                  key={element.id}
                  element={element}
                  selectedElementId={selectedElementId}
                  previewMode={previewMode}
                  formValues={formValues}
                  openElementEditor={openElementEditor}
                  selectElement={selectElement}
                  duplicateElement={duplicateElement}
                  deleteElement={deleteElement}
                  removeCondition={removeCondition}
                  handleFormValueChange={handleFormValueChange}
                  getOperatorText={getOperatorText}
                  formElements={formElements}
                  handleDragStart={handleDragStart}
                  handleDragOver={handleDragOver}
                  handleDrop={handleDrop}
                  validationError={
                    previewMode && element.required && !formValues[element.id]
                      ? getValidationErrorMessage(element, formValues[element.id])
                      : null
                  }
                />
              );
            })}
          </div>
        )}
      </div>
    </FormProvider>
  );
};

export default FormCanvasContent;
