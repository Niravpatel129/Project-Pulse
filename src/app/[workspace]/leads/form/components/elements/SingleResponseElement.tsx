'use client';

import { Input } from '@/components/ui/input';
import { FC } from 'react';
import { FormElementProps } from '../../types/formTypes';
import { getElementIcon } from '../../utils/elementUtils';
import { FormElementWrapper } from './FormElementWrapper';

export const SingleResponseElement: FC<FormElementProps> = (props) => {
  const { element, previewMode, formValues, handleFormValueChange } = props;

  return (
    <FormElementWrapper {...props}>
      <div className='flex items-center gap-2 mb-2'>
        {getElementIcon(element.type)}
        <span className='text-xs text-gray-500'>Single Response</span>
      </div>
      <Input
        placeholder={element.placeholder || 'Enter your answer'}
        className='mt-2'
        value={previewMode ? (formValues[element.id] as string) || '' : ''}
        onChange={(e) => {
          return previewMode && handleFormValueChange(element.id, e.target.value);
        }}
      />
    </FormElementWrapper>
  );
};
