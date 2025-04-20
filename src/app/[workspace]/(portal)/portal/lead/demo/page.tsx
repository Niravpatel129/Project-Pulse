'use client';
import { FormBuilder, FormData, FormElement } from '@/components/LeadForm/FormBuilder';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import { toast } from 'sonner';

// Create a demo form with all field types
const createDemoForm = (): FormData => {
  const elements: FormElement[] = [];
  let order = 0;

  // Add a text block
  elements.push({
    id: 'text-block-1',
    type: 'Text Block',
    title: 'Form Field Types Demo',
    description:
      'This is a demonstration of all available form field types you can use in your lead forms.',
    order: order++,
  });

  // Text input
  elements.push({
    id: 'text-input',
    type: 'Short Answer',
    title: 'Text Input',
    description: 'Standard single-line text input field',
    placeholder: 'Enter some text',
    required: true,
    order: order++,
  });

  // Email input
  elements.push({
    id: 'email-input',
    type: 'Email',
    title: 'Email Input',
    description: 'Email address input with validation',
    placeholder: 'your@email.com',
    required: true,
    order: order++,
  });

  // Phone input
  elements.push({
    id: 'phone-input',
    type: 'Phone',
    title: 'Phone Input',
    description: 'Phone number input',
    placeholder: 'Your phone number',
    required: false,
    order: order++,
  });

  // Textarea
  elements.push({
    id: 'textarea-input',
    type: 'Long Answer',
    title: 'Text Area',
    description: 'Multi-line text input for longer responses',
    placeholder: 'Write a longer response here...',
    required: false,
    order: order++,
  });

  // Number input
  elements.push({
    id: 'number-input',
    type: 'Number',
    title: 'Number Input',
    description: 'Numeric input with min/max/step controls',
    placeholder: 'Enter a number',
    min: 0,
    max: 100,
    step: 1,
    required: false,
    order: order++,
  });

  // Date picker
  elements.push({
    id: 'date-input',
    type: 'Date',
    title: 'Date Picker',
    description: 'Calendar date selection',
    required: false,
    order: order++,
  });

  // Select dropdown
  elements.push({
    id: 'select-input',
    type: 'Dropdown',
    title: 'Select Dropdown',
    description: 'Single option selection from a dropdown',
    required: false,
    options: [
      { label: 'Option 1', value: 'option-1' },
      { label: 'Option 2', value: 'option-2' },
      { label: 'Option 3', value: 'option-3' },
    ],
    order: order++,
  });

  // Checkbox
  elements.push({
    id: 'checkbox-input',
    type: 'Checkbox',
    title: 'Checkbox Input',
    description: 'Single checkbox for boolean values',
    required: false,
    order: order++,
  });

  // Switch
  elements.push({
    id: 'switch-input',
    type: 'Switch',
    title: 'Switch Input',
    description: 'Toggle switch for boolean values',
    required: false,
    order: order++,
  });

  // Radio group
  elements.push({
    id: 'radio-input',
    type: 'Multiple Choice',
    title: 'Radio Group',
    description: 'Mutually exclusive option selection',
    required: true,
    options: [
      { label: 'Option A', value: 'option-a' },
      { label: 'Option B', value: 'option-b' },
      { label: 'Option C', value: 'option-c' },
    ],
    order: order++,
  });

  // File upload
  elements.push({
    id: 'file-input',
    type: 'File Upload',
    title: 'File Upload',
    description: 'Allows uploading of documents or images',
    required: false,
    order: order++,
  });

  // Client details (compound field)
  elements.push({
    id: 'client-details',
    type: 'Client Details',
    title: 'Client Information',
    description: 'Collection of client contact details',
    required: true,
    clientFields: {
      email: true,
      name: true,
      phone: true,
      company: true,
      address: true,
      custom: [
        {
          id: 'custom1',
          label: 'Job Title',
          placeholder: 'Your job title',
        },
        {
          id: 'custom2',
          label: 'Referral Source',
          placeholder: 'How did you hear about us?',
        },
      ],
    },
    order: order++,
  });

  return {
    id: 'demo-form',
    title: 'Form Field Types Demo',
    description: 'A showcase of all available form field types',
    elements,
    status: 'published',
  };
};

// Create a conditional demo form
const createConditionalForm = (): FormData => {
  return {
    id: 'conditional-form',
    title: 'Conditional Logic Demo',
    description:
      'This form demonstrates how fields can be shown or hidden based on previous responses',
    elements: [
      {
        id: 'contact-preference',
        type: 'Dropdown',
        title: 'How would you like us to contact you?',
        description: 'Please select your preferred contact method',
        required: true,
        options: [
          { label: 'Email', value: 'email' },
          { label: 'Phone', value: 'phone' },
          { label: 'Mail', value: 'mail' },
        ],
        order: 0,
      },
      {
        id: 'email-address',
        type: 'Email',
        title: 'Email Address',
        description: 'Please provide your email address',
        required: true,
        order: 1,
        showWhen: 'all',
        conditions: [{ fieldId: 'contact-preference', operator: 'equals', value: 'email' }],
      },
      {
        id: 'phone-number',
        type: 'Phone',
        title: 'Phone Number',
        description: 'Please provide your phone number',
        required: true,
        order: 2,
        showWhen: 'all',
        conditions: [{ fieldId: 'contact-preference', operator: 'equals', value: 'phone' }],
      },
      {
        id: 'mailing-address',
        type: 'Long Answer',
        title: 'Mailing Address',
        description: 'Please provide your full mailing address',
        required: true,
        order: 3,
        showWhen: 'all',
        conditions: [{ fieldId: 'contact-preference', operator: 'equals', value: 'mail' }],
      },
      {
        id: 'additional-comments',
        type: 'Long Answer',
        title: 'Additional Comments',
        description: 'Any other information you would like to provide',
        required: false,
        order: 4,
      },
    ],
    status: 'published',
  };
};

export default function FormDemo() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const demoForm = createDemoForm();
  const conditionalForm = createConditionalForm();

  const handleSubmit = async (formData: {
    formId: string;
    fields: Array<{
      id: string;
      label: string;
      value: any;
      type?: string;
    }>;
    files: Record<string, File>;
  }) => {
    setIsSubmitting(true);

    // Simulate submission delay
    await new Promise((resolve) => {
      return setTimeout(resolve, 1500);
    });

    console.log('Form data submitted:', formData);

    // Log files separately if any
    if (Object.keys(formData.files).length > 0) {
      console.log('Files to be uploaded:', formData.files);
    }

    toast.success('Form submitted successfully (demo only)');

    setIsSubmitting(false);
    return Promise.resolve();
  };

  return (
    <div className='min-h-screen bg-gray-50 p-4 md:p-8'>
      <div className='max-w-4xl mx-auto'>
        <Card className='mb-8'>
          <CardHeader>
            <CardTitle className='text-2xl'>Form Field Types Demo</CardTitle>
            <CardDescription>
              A showcase of all the different form field types available for your lead forms
            </CardDescription>
          </CardHeader>
        </Card>

        <Tabs defaultValue='all-fields' className='space-y-6'>
          <TabsList className='grid w-full grid-cols-2'>
            <TabsTrigger value='all-fields'>All Field Types</TabsTrigger>
            <TabsTrigger value='conditional'>Conditional Logic</TabsTrigger>
          </TabsList>

          <TabsContent value='all-fields' className='space-y-4'>
            <FormBuilder formData={demoForm} onSubmit={handleSubmit} isLoading={isSubmitting} />
          </TabsContent>

          <TabsContent value='conditional' className='space-y-4'>
            <div className='mb-4 p-4 bg-amber-50 border border-amber-200 rounded-md'>
              <div className='flex items-center gap-2 text-amber-800 font-medium mb-2'>
                <ArrowRight className='h-4 w-4' />
                <span>Try it out!</span>
              </div>
              <p className='text-sm text-amber-700'>
                Select different options in the &quot;Contact Preference&quot; field to see how
                other fields appear or disappear.
              </p>
            </div>

            <FormBuilder
              formData={conditionalForm}
              onSubmit={handleSubmit}
              isLoading={isSubmitting}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
