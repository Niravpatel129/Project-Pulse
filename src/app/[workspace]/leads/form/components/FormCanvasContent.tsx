import { Button } from '@/components/ui/button';
import { AlertCircle, Eye } from 'lucide-react';
import React from 'react';
import { FormElement as FormElementType, FormValues } from '../types';
import { getOperatorText, getValidationErrorMessage, shouldShowElement } from '../utils';
import EmptyFormState from './EmptyFormState';
import FormElement from './FormElement';

interface FormCanvasContentProps {
  formElements: FormElementType[];
  previewMode: boolean;
  formValues: FormValues;
  selectedElementId: string | null;
  openElementEditor: (element: FormElementType) => void;
  selectElement: (id: string) => void;
  duplicateElement: (id: string) => void;
  deleteElement: (id: string) => void;
  removeCondition: (elementId: string, conditionId: string) => void;
  handleFormValueChange: (elementId: string, value: string | string[] | boolean | number) => void;
  addElement: (elementType: string) => void;
  addClientDetailsSection: () => void;
  handleDragStart: (e: React.DragEvent, elementId: string) => void;
  handleDragOver: (e: React.DragEvent, elementId: string) => void;
  handleDrop: (e: React.DragEvent, targetElementId: string) => void;
  showElementMenu: (e: React.MouseEvent) => void;
  isMobile: boolean;
  setPreviewMode: (mode: boolean) => void;
}

const FormCanvasContent: React.FC<FormCanvasContentProps> = ({
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
  showElementMenu,
  isMobile,
  setPreviewMode,
}) => {
  const hasClientDetails = formElements.some((el) => {
    return el.type === 'Client Details';
  });

  return (
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

      {!previewMode && formElements.length > 0 && !hasClientDetails && (
        <div className='mb-6 p-4 bg-amber-50/70 text-amber-700 rounded-xl flex items-center justify-between shadow-sm'>
          <div className='flex items-center gap-2'>
            <AlertCircle className='h-5 w-5' />
            <span className='font-medium'>
              Missing Client Details: Add a Client Details section to collect required client
              information
            </span>
          </div>
          <Button
            variant='outline'
            size='sm'
            onClick={() => {
              return addClientDetailsSection();
            }}
            className='rounded-full'
          >
            Add Client Details
          </Button>
        </div>
      )}

      {formElements.length === 0 ? (
        <EmptyFormState addElement={addElement} addClientDetailsSection={addClientDetailsSection} />
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
  );
};

export default FormCanvasContent;
