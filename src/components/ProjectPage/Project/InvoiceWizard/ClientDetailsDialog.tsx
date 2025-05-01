import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { newRequest } from '@/utils/newRequest';
import { useQueryClient } from '@tanstack/react-query';
import { Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';

interface ClientDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  client: any | null;
  onClientUpdated: (client: any) => void;
  project?: any;
}

export type ClientFormValues = {
  name: string;
  email: string;
  phone: string;
  website: string;
  jobTitle: string;
  mailingAddress: string;
  comments: string;
  customFields: {
    company: string;
    address: string;
    [key: string]: string;
  };
};

export default function ClientDetailsDialog({
  open,
  onOpenChange,
  client,
  onClientUpdated,
  project,
}: ClientDetailsDialogProps) {
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customFieldKey, setCustomFieldKey] = useState('');
  const [customFieldValue, setCustomFieldValue] = useState('');

  const [values, setValues] = useState<ClientFormValues>({
    name: '',
    email: '',
    phone: '',
    website: '',
    jobTitle: '',
    mailingAddress: '',
    comments: '',
    customFields: {
      company: '',
      address: '',
    },
  });

  // Initialize client data when editing
  useEffect(() => {
    if (client) {
      setValues({
        name: client.name || '',
        email: client.email || '',
        phone: client.phone || '',
        website: client.website || '',
        jobTitle: client.jobTitle || '',
        mailingAddress: client.mailingAddress || '',
        comments: client.comments || '',
        customFields: {
          company: client.customFields?.company || '',
          address: client.customFields?.address || '',
          ...(client.customFields || {}),
        },
      });
    }
  }, [client, open]);

  const handleSave = async () => {
    if (!client) return;

    setIsSubmitting(true);

    try {
      const clientId = client.id || client._id;

      // Format the data for the API
      const clientData = {
        name: values.name,
        email: values.email,
        phone: values.phone,
        website: values.website,
        jobTitle: values.jobTitle,
        mailingAddress: values.mailingAddress,
        comments: values.comments,
        customFields: values.customFields,
      };

      // Update client using the clients endpoint only
      const response = await newRequest.put(`/participants/${clientId}`, clientData);

      // Handle the response based on the structure returned by the backend
      const updatedClient = response.data.data || { ...client, ...clientData };
      toast.success('Client updated successfully');

      // Update parent with the updated client
      onClientUpdated(updatedClient);
      onOpenChange(false);

      // Invalidate queries to refresh data
      queryClient.invalidateQueries({ queryKey: ['clients'] });

      if (project?._id) {
        queryClient.invalidateQueries({ queryKey: ['project'] });
      }
    } catch (error) {
      console.error('Error updating client:', error);
      toast.error('Failed to update client');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Add a new custom field
  const addCustomField = () => {
    if (!customFieldKey.trim()) return;

    setValues({
      ...values,
      customFields: {
        ...values.customFields,
        [customFieldKey.trim()]: customFieldValue,
      },
    });

    // Reset the input fields
    setCustomFieldKey('');
    setCustomFieldValue('');
  };

  // Remove a custom field
  const removeCustomField = (key: string) => {
    const updatedCustomFields = { ...values.customFields };
    delete updatedCustomFields[key];

    setValues({
      ...values,
      customFields: updatedCustomFields,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='sm:max-w-[480px] p-0 overflow-hidden bg-white rounded-lg border-none shadow-md'>
        <div className='px-6 pt-6 pb-5'>
          <DialogTitle className='text-base font-medium text-gray-800'>
            Client Information
          </DialogTitle>
        </div>

        <Tabs defaultValue='basic' className='w-full'>
          <div className='px-6'>
            <TabsList className='w-full flex border-b border-gray-200 mb-5 p-0 bg-transparent space-x-5'>
              <TabsTrigger
                value='basic'
                className='px-0 py-2.5 text-sm rounded-none font-normal data-[state=active]:font-medium data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-800 text-gray-500 hover:text-gray-700 bg-transparent'
              >
                Basic
              </TabsTrigger>
              <TabsTrigger
                value='contact'
                className='px-0 py-2.5 text-sm rounded-none font-normal data-[state=active]:font-medium data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-800 text-gray-500 hover:text-gray-700 bg-transparent'
              >
                Contact
              </TabsTrigger>
              <TabsTrigger
                value='custom'
                className='px-0 py-2.5 text-sm rounded-none font-normal data-[state=active]:font-medium data-[state=active]:text-gray-900 data-[state=active]:border-b-2 data-[state=active]:border-gray-800 text-gray-500 hover:text-gray-700 bg-transparent'
              >
                Custom
              </TabsTrigger>
            </TabsList>
          </div>

          <div className='px-6 pb-6'>
            <TabsContent value='basic' className='mt-0 space-y-5'>
              <div className='grid grid-cols-2 gap-5'>
                <div>
                  <Label
                    htmlFor='client-name'
                    className='block text-xs font-medium text-gray-600 mb-1.5'
                  >
                    Name
                  </Label>
                  <Input
                    id='client-name'
                    value={values.name}
                    onChange={(e) => {
                      return setValues({
                        ...values,
                        name: e.target.value,
                      });
                    }}
                    className='h-9 w-full border-gray-200 rounded-md bg-white focus:border-gray-300 focus:ring-0 text-sm text-gray-800'
                  />
                </div>

                <div>
                  <Label
                    htmlFor='client-email'
                    className='block text-xs font-medium text-gray-600 mb-1.5'
                  >
                    Email
                  </Label>
                  <Input
                    id='client-email'
                    type='email'
                    value={values.email}
                    onChange={(e) => {
                      return setValues({
                        ...values,
                        email: e.target.value,
                      });
                    }}
                    className='h-9 w-full border-gray-200 rounded-md bg-white focus:border-gray-300 focus:ring-0 text-sm text-gray-800'
                  />
                </div>

                <div>
                  <Label
                    htmlFor='client-company'
                    className='block text-xs font-medium text-gray-600 mb-1.5'
                  >
                    Company
                  </Label>
                  <Input
                    id='client-company'
                    value={values.customFields?.company || ''}
                    onChange={(e) => {
                      return setValues({
                        ...values,
                        customFields: {
                          ...values.customFields,
                          company: e.target.value,
                        },
                      });
                    }}
                    className='h-9 w-full border-gray-200 rounded-md bg-white focus:border-gray-300 focus:ring-0 text-sm text-gray-800'
                  />
                </div>

                <div>
                  <Label
                    htmlFor='client-jobTitle'
                    className='block text-xs font-medium text-gray-600 mb-1.5'
                  >
                    Job Title
                  </Label>
                  <Input
                    id='client-jobTitle'
                    value={values.jobTitle}
                    onChange={(e) => {
                      return setValues({
                        ...values,
                        jobTitle: e.target.value,
                      });
                    }}
                    className='h-9 w-full border-gray-200 rounded-md bg-white focus:border-gray-300 focus:ring-0 text-sm text-gray-800'
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value='contact' className='mt-0 space-y-5'>
              <div className='grid grid-cols-2 gap-5'>
                <div>
                  <Label
                    htmlFor='client-phone'
                    className='block text-xs font-medium text-gray-600 mb-1.5'
                  >
                    Phone
                  </Label>
                  <Input
                    id='client-phone'
                    type='tel'
                    value={values.phone}
                    onChange={(e) => {
                      return setValues({
                        ...values,
                        phone: e.target.value,
                      });
                    }}
                    className='h-9 w-full border-gray-200 rounded-md bg-white focus:border-gray-300 focus:ring-0 text-sm text-gray-800'
                  />
                </div>

                <div>
                  <Label
                    htmlFor='client-website'
                    className='block text-xs font-medium text-gray-600 mb-1.5'
                  >
                    Website
                  </Label>
                  <Input
                    id='client-website'
                    type='url'
                    value={values.website}
                    onChange={(e) => {
                      return setValues({
                        ...values,
                        website: e.target.value,
                      });
                    }}
                    className='h-9 w-full border-gray-200 rounded-md bg-white focus:border-gray-300 focus:ring-0 text-sm text-gray-800'
                  />
                </div>

                <div className='col-span-2'>
                  <Label
                    htmlFor='client-custom-address'
                    className='block text-xs font-medium text-gray-600 mb-1.5'
                  >
                    Address
                  </Label>
                  <Input
                    id='client-custom-address'
                    value={values.customFields?.address || ''}
                    onChange={(e) => {
                      return setValues({
                        ...values,
                        customFields: {
                          ...values.customFields,
                          address: e.target.value,
                        },
                      });
                    }}
                    className='h-9 w-full border-gray-200 rounded-md bg-white focus:border-gray-300 focus:ring-0 text-sm text-gray-800'
                  />
                </div>

                <div className='col-span-2'>
                  <Label
                    htmlFor='client-mailingAddress'
                    className='block text-xs font-medium text-gray-600 mb-1.5'
                  >
                    Mailing Address
                  </Label>
                  <Textarea
                    id='client-mailingAddress'
                    value={values.mailingAddress}
                    onChange={(e) => {
                      return setValues({
                        ...values,
                        mailingAddress: e.target.value,
                      });
                    }}
                    placeholder='Street, City, State, ZIP, Country'
                    className='min-h-[64px] w-full border-gray-200 rounded-md bg-white focus:border-gray-300 focus:ring-0 resize-none text-sm text-gray-800'
                  />
                </div>

                <div className='col-span-2'>
                  <Label
                    htmlFor='client-comments'
                    className='block text-xs font-medium text-gray-600 mb-1.5'
                  >
                    Notes
                  </Label>
                  <Textarea
                    id='client-comments'
                    value={values.comments}
                    onChange={(e) => {
                      return setValues({
                        ...values,
                        comments: e.target.value,
                      });
                    }}
                    placeholder='Additional notes about this client'
                    className='min-h-[64px] w-full border-gray-200 rounded-md bg-white focus:border-gray-300 focus:ring-0 resize-none text-sm text-gray-800'
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value='custom' className='mt-0'>
              {/* Custom Fields List */}
              {Object.entries(values.customFields || {}).filter(([key]) => {
                return !['company', 'address'].includes(key);
              }).length > 0 && (
                <div className='mb-6'>
                  {Object.entries(values.customFields || {})
                    .filter(([key]) => {
                      return !['company', 'address'].includes(key);
                    })
                    .map(([key, value], index) => {
                      return (
                        <div
                          key={key}
                          className='flex items-center py-3 border-b border-gray-100 group'
                        >
                          <div className='w-1/3 text-sm text-gray-700'>{key}</div>
                          <div className='flex-1 flex items-center'>
                            <Input
                              className='flex-1 h-8 border-gray-200 bg-white focus:border-gray-300 focus:ring-0 text-sm text-gray-800'
                              value={value}
                              onChange={(e) => {
                                return setValues({
                                  ...values,
                                  customFields: {
                                    ...values.customFields,
                                    [key]: e.target.value,
                                  },
                                });
                              }}
                            />
                            <Button
                              variant='ghost'
                              size='icon'
                              className='ml-2 h-8 w-8 text-gray-300 opacity-0 group-hover:opacity-100 hover:text-gray-500 hover:bg-transparent transition-opacity duration-150'
                              onClick={() => {
                                return removeCustomField(key);
                              }}
                              aria-label={`Remove ${key} field`}
                            >
                              <Trash2 className='h-3.5 w-3.5' />
                            </Button>
                          </div>
                        </div>
                      );
                    })}
                </div>
              )}

              {/* Empty State - Only shown when no custom fields */}
              {Object.entries(values.customFields || {}).filter(([key]) => {
                return !['company', 'address'].includes(key);
              }).length === 0 && (
                <div className='flex items-center justify-center py-8 text-gray-400 text-sm mb-6'>
                  No custom fields
                </div>
              )}

              {/* Add New Field */}
              <div className='flex items-end space-x-3'>
                <div className='w-1/3'>
                  <Label className='block text-xs font-medium text-gray-600 mb-1.5'>Field</Label>
                  <Input
                    placeholder='Name'
                    value={customFieldKey}
                    onChange={(e) => {
                      return setCustomFieldKey(e.target.value);
                    }}
                    className='h-9 w-full border-gray-200 bg-white focus:border-gray-300 focus:ring-0 text-sm text-gray-800'
                  />
                </div>

                <div className='flex-1'>
                  <Label className='block text-xs font-medium text-gray-600 mb-1.5'>Value</Label>
                  <Input
                    placeholder='Value'
                    value={customFieldValue}
                    onChange={(e) => {
                      return setCustomFieldValue(e.target.value);
                    }}
                    className='h-9 w-full border-gray-200 bg-white focus:border-gray-300 focus:ring-0 text-sm text-gray-800'
                  />
                </div>

                <Button
                  variant='ghost'
                  className='h-9 px-3 border border-gray-200 text-gray-700 hover:bg-gray-50 hover:text-gray-800'
                  onClick={addCustomField}
                  disabled={!customFieldKey.trim()}
                >
                  Add
                </Button>
              </div>
            </TabsContent>
          </div>
        </Tabs>

        <div className='flex justify-end items-center gap-3 px-6 py-4 border-t border-gray-100'>
          <Button
            variant='ghost'
            className='h-9 text-gray-600 hover:text-gray-800 hover:bg-transparent'
            onClick={() => {
              return onOpenChange(false);
            }}
          >
            Cancel
          </Button>
          <Button
            type='submit'
            className='h-9 bg-gray-800 hover:bg-gray-900 text-white'
            onClick={handleSave}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : 'Save'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
