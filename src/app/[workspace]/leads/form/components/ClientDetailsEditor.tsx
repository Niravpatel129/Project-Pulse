import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Building2, Mail, MapPin, Phone, Plus, User2, X } from 'lucide-react';
import React from 'react';
import { FormElement } from '../types';

interface ClientDetailsEditorProps {
  editingElement: FormElement;
  setEditingElement: (element: FormElement) => void;
}

const ClientDetailsEditor: React.FC<ClientDetailsEditorProps> = ({
  editingElement,
  setEditingElement,
}) => {
  if (editingElement.type !== 'Client Details') return null;

  return (
    <div className='grid gap-4 pt-2 pb-2'>
      <div className='col-span-4 mb-2'>
        <h4 className='font-medium text-sm'>Client Information Fields</h4>
        <p className='text-xs text-gray-500 mt-1'>
          Select which client information fields to include
        </p>
      </div>

      <div className='space-y-3 border rounded-md p-4 bg-gray-50'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Mail className='h-4 w-4 text-blue-600' />
            <Label htmlFor='client-email' className='font-medium'>
              Email
            </Label>
            <Badge className='text-xs bg-blue-100 text-blue-700 border-blue-200'>Required</Badge>
          </div>
          <Switch id='client-email' checked={true} disabled={true} />
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <User2 className='h-4 w-4 text-gray-600' />
            <Label htmlFor='client-name'>Full Name</Label>
          </div>
          <Switch
            id='client-name'
            checked={editingElement.clientFields?.name || false}
            onCheckedChange={(checked) => {
              return setEditingElement({
                ...editingElement,
                clientFields: {
                  ...editingElement.clientFields,
                  name: checked,
                },
              });
            }}
          />
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Phone className='h-4 w-4 text-gray-600' />
            <Label htmlFor='client-phone'>Phone Number</Label>
          </div>
          <Switch
            id='client-phone'
            checked={editingElement.clientFields?.phone || false}
            onCheckedChange={(checked) => {
              return setEditingElement({
                ...editingElement,
                clientFields: {
                  ...editingElement.clientFields,
                  phone: checked,
                },
              });
            }}
          />
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <Building2 className='h-4 w-4 text-gray-600' />
            <Label htmlFor='client-company'>Company</Label>
          </div>
          <Switch
            id='client-company'
            checked={editingElement.clientFields?.company || false}
            onCheckedChange={(checked) => {
              return setEditingElement({
                ...editingElement,
                clientFields: {
                  ...editingElement.clientFields,
                  company: checked,
                },
              });
            }}
          />
        </div>

        <div className='flex items-center justify-between'>
          <div className='flex items-center gap-2'>
            <MapPin className='h-4 w-4 text-gray-600' />
            <Label htmlFor='client-address'>Address</Label>
          </div>
          <Switch
            id='client-address'
            checked={editingElement.clientFields?.address || false}
            onCheckedChange={(checked) => {
              return setEditingElement({
                ...editingElement,
                clientFields: {
                  ...editingElement.clientFields,
                  address: checked,
                },
              });
            }}
          />
        </div>
      </div>

      {/* Custom Fields */}
      <div className='mt-4'>
        <h4 className='font-medium text-sm mb-2'>Custom Fields</h4>
        <div className='space-y-2'>
          {editingElement.clientFields?.custom?.map((field, index) => {
            return (
              <div key={index} className='flex items-center gap-2'>
                <Input
                  value={field}
                  onChange={(e) => {
                    const newCustomFields = [...(editingElement.clientFields?.custom || [])];
                    newCustomFields[index] = e.target.value;
                    setEditingElement({
                      ...editingElement,
                      clientFields: {
                        ...editingElement.clientFields,
                        custom: newCustomFields,
                      },
                    });
                  }}
                  placeholder='Field name'
                />
                <Button
                  variant='ghost'
                  size='icon'
                  onClick={() => {
                    const newCustomFields = [...(editingElement.clientFields?.custom || [])];
                    newCustomFields.splice(index, 1);
                    setEditingElement({
                      ...editingElement,
                      clientFields: {
                        ...editingElement.clientFields,
                        custom: newCustomFields,
                      },
                    });
                  }}
                >
                  <X className='h-4 w-4' />
                </Button>
              </div>
            );
          })}
          <Button
            variant='outline'
            size='sm'
            className='mt-2'
            onClick={() => {
              const newCustomFields = [
                ...(editingElement.clientFields?.custom || []),
                `Custom Field ${(editingElement.clientFields?.custom?.length || 0) + 1}`,
              ];
              setEditingElement({
                ...editingElement,
                clientFields: {
                  ...editingElement.clientFields,
                  custom: newCustomFields,
                },
              });
            }}
          >
            <Plus className='h-4 w-4 mr-2' />
            Add Custom Field
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ClientDetailsEditor;
