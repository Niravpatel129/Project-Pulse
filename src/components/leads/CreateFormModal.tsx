'use client';

import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useState } from 'react';
import { FormPreview } from './FormPreview';
import { BrandingSettings } from './FormSettings';

interface CreateFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onFormCreated: () => void;
}

interface FormField {
  id: string;
  label: string;
  type: 'text' | 'email' | 'phone' | 'textarea' | 'file';
  required: boolean;
}

export function CreateFormModal({ open, onOpenChange, onFormCreated }: CreateFormModalProps) {
  const [step, setStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    fields: [] as FormField[],
    autoCreateProject: false,
    projectTemplateId: '',
    successMessage: '',
    redirectUrl: '',
    notifyOnSubmission: false,
    sendConfirmationEmail: false,
  });

  const [brandingSettings, setBrandingSettings] = useState<BrandingSettings>({
    logoUrl: '',
    companyName: '',
    primaryColor: '#3b82f6',
    accentColor: '#8b5cf6',
    faviconUrl: '',
    headerTitle: '',
    headerSubtext: '',
    backgroundImageUrl: '',
    formAlignment: 'center',
    fontStyle: 'system',
    customFontUrl: '',
    successMessage: '',
    redirectUrl: '',
    customSubdomain: '',
    metaTitle: '',
    metaDescription: '',
    googleAnalyticsId: '',
    facebookPixelId: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement API call to create form
    console.log('Creating form:', { ...formData, brandingSettings });
    onFormCreated();
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[800px]'>
        <DialogHeader>
          <DialogTitle>Create New Form</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className='space-y-6'>
          <Tabs
            value={step.toString()}
            onValueChange={(value) => {
              return setStep(parseInt(value));
            }}
          >
            <TabsList className='grid w-full grid-cols-6'>
              <TabsTrigger value='1'>Basic Info</TabsTrigger>
              <TabsTrigger value='2'>Fields</TabsTrigger>
              <TabsTrigger value='3'>Behavior</TabsTrigger>
              <TabsTrigger value='4'>Confirmation</TabsTrigger>
              <TabsTrigger value='5'>Notifications</TabsTrigger>
              <TabsTrigger value='6'>Preview</TabsTrigger>
            </TabsList>

            <TabsContent value='1' className='space-y-4'>
              <div className='space-y-2'>
                <Label htmlFor='name'>Form Name</Label>
                <Input
                  id='name'
                  value={formData.name}
                  onChange={(e) => {
                    return setFormData({ ...formData, name: e.target.value });
                  }}
                  placeholder='e.g. Contact Us Form'
                  required
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='description'>Description</Label>
                <Textarea
                  id='description'
                  value={formData.description}
                  onChange={(e) => {
                    return setFormData({ ...formData, description: e.target.value });
                  }}
                  placeholder="Internal description of this form's purpose"
                />
              </div>
            </TabsContent>

            <TabsContent value='2' className='space-y-4'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <h3 className='font-medium'>Form Fields</h3>
                  <Button
                    type='button'
                    variant='outline'
                    onClick={() => {
                      setFormData({
                        ...formData,
                        fields: [
                          ...formData.fields,
                          {
                            id: Math.random().toString(36).substr(2, 9),
                            label: '',
                            type: 'text',
                            required: false,
                          },
                        ],
                      });
                    }}
                  >
                    Add Field
                  </Button>
                </div>
                <div className='space-y-4'>
                  {formData.fields.map((field, index) => {
                    return (
                      <div key={field.id} className='flex items-start gap-4'>
                        <div className='flex-1 space-y-2'>
                          <Input
                            placeholder='Field Label'
                            value={field.label}
                            onChange={(e) => {
                              const newFields = [...formData.fields];
                              newFields[index].label = e.target.value;
                              setFormData({ ...formData, fields: newFields });
                            }}
                          />
                          <Select
                            value={field.type}
                            onValueChange={(value) => {
                              const newFields = [...formData.fields];
                              newFields[index].type = value as FormField['type'];
                              setFormData({ ...formData, fields: newFields });
                            }}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder='Select field type' />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value='text'>Text</SelectItem>
                              <SelectItem value='email'>Email</SelectItem>
                              <SelectItem value='phone'>Phone</SelectItem>
                              <SelectItem value='textarea'>Text Area</SelectItem>
                              <SelectItem value='file'>File Upload</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div className='flex items-center gap-2 pt-2'>
                          <Switch
                            checked={field.required}
                            onCheckedChange={(checked) => {
                              const newFields = [...formData.fields];
                              newFields[index].required = checked;
                              setFormData({ ...formData, fields: newFields });
                            }}
                          />
                          <Label>Required</Label>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </TabsContent>

            <TabsContent value='3' className='space-y-4'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>Auto-create Project</h3>
                    <p className='text-sm text-gray-500'>
                      Automatically create a project when this form is submitted
                    </p>
                  </div>
                  <Switch
                    checked={formData.autoCreateProject}
                    onCheckedChange={(checked) => {
                      return setFormData({ ...formData, autoCreateProject: checked });
                    }}
                  />
                </div>
                {formData.autoCreateProject && (
                  <div className='space-y-2'>
                    <Label>Project Template</Label>
                    <Select
                      value={formData.projectTemplateId}
                      onValueChange={(value) => {
                        return setFormData({ ...formData, projectTemplateId: value });
                      }}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder='Select project template' />
                      </SelectTrigger>
                      <SelectContent>{/* Add project template options here */}</SelectContent>
                    </Select>
                  </div>
                )}
              </div>
            </TabsContent>

            <TabsContent value='4' className='space-y-4'>
              <div className='space-y-4'>
                <div className='space-y-2'>
                  <Label>Success Message</Label>
                  <Textarea
                    value={formData.successMessage}
                    onChange={(e) => {
                      return setFormData({ ...formData, successMessage: e.target.value });
                    }}
                    placeholder="Thank you for your submission! We'll be in touch soon."
                  />
                </div>
                <div className='space-y-2'>
                  <Label>Redirect URL (optional)</Label>
                  <Input
                    value={formData.redirectUrl}
                    onChange={(e) => {
                      return setFormData({ ...formData, redirectUrl: e.target.value });
                    }}
                    placeholder='https://example.com/thank-you'
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value='5' className='space-y-4'>
              <div className='space-y-4'>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>Notify on Submission</h3>
                    <p className='text-sm text-gray-500'>
                      Receive an email when this form is submitted
                    </p>
                  </div>
                  <Switch
                    checked={formData.notifyOnSubmission}
                    onCheckedChange={(checked) => {
                      return setFormData({ ...formData, notifyOnSubmission: checked });
                    }}
                  />
                </div>
                <div className='flex items-center justify-between'>
                  <div>
                    <h3 className='font-medium'>Send Confirmation Email</h3>
                    <p className='text-sm text-gray-500'>
                      Send a confirmation email to the person who submitted the form
                    </p>
                  </div>
                  <Switch
                    checked={formData.sendConfirmationEmail}
                    onCheckedChange={(checked) => {
                      return setFormData({ ...formData, sendConfirmationEmail: checked });
                    }}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value='6' className='space-y-4'>
              <div className='rounded-lg border p-4'>
                <h3 className='font-medium mb-4'>Form Preview</h3>
                <div className='border rounded-lg overflow-hidden'>
                  <FormPreview
                    settings={{
                      ...brandingSettings,
                      successMessage: formData.successMessage,
                      redirectUrl: formData.redirectUrl,
                    }}
                    fields={formData.fields}
                  />
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className='flex justify-end gap-2'>
            {step > 1 && (
              <Button
                type='button'
                variant='outline'
                onClick={() => {
                  return setStep(step - 1);
                }}
              >
                Previous
              </Button>
            )}
            {step < 6 ? (
              <Button
                type='button'
                onClick={() => {
                  return setStep(step + 1);
                }}
              >
                Next
              </Button>
            ) : (
              <Button type='submit'>Create Form</Button>
            )}
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
