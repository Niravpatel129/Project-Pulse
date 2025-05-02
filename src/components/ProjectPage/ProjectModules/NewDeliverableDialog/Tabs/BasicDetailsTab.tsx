import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';

interface BasicDetailsTabProps {
  formData: any;
  errors: any;
  handleChange: (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
  handleSelectChange: (name: string, value: string) => void;
}

const BasicDetailsTab = ({
  formData,
  errors,
  handleChange,
  handleSelectChange,
}: BasicDetailsTabProps) => {
  return (
    <div className='space-y-5 max-w-3xl mx-auto'>
      <div className='space-y-1'>
        <Label htmlFor='name' className='text-sm font-medium text-neutral-700'>
          Deliverable Name <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='name'
          name='name'
          value={formData.name}
          onChange={handleChange}
          placeholder='Name of the product or service'
          className={`transition-shadow duration-150 focus:ring-1 focus:ring-neutral-200 ${
            errors.name ? 'border-red-500' : ''
          }`}
        />
        {errors.name && <p className='text-xs text-red-500 mt-1'>{errors.name}</p>}
      </div>
      <div className='space-y-1'>
        <Label htmlFor='description' className='text-sm font-medium text-neutral-700'>
          Description
        </Label>
        <Textarea
          id='description'
          name='description'
          value={formData.description}
          onChange={handleChange}
          placeholder='Describe what this deliverable includes (will appear on invoices)'
          rows={3}
          className='resize-none transition-shadow duration-150 focus:ring-1 focus:ring-neutral-200'
        />
        <span className='text-xs text-neutral-500'>
          This description will help clients understand what they&apos;re being billed for.
        </span>
      </div>
      <div className='space-y-1'>
        <Label htmlFor='price' className='text-sm font-medium text-neutral-700'>
          Price <span className='text-red-500'>*</span>
        </Label>
        <Input
          id='price'
          name='price'
          value={formData.price}
          onChange={handleChange}
          placeholder='Default price for this deliverable'
          type='text'
          className={`transition-shadow duration-150 focus:ring-1 focus:ring-neutral-200 ${
            errors.price ? 'border-red-500' : ''
          }`}
        />
        {errors.price && <p className='text-xs text-red-500 mt-1'>{errors.price}</p>}
        <span className='text-xs text-neutral-500'>
          You can adjust the price when creating an invoice
        </span>
      </div>
      <div className='space-y-1'>
        <Label htmlFor='deliverableType' className='text-sm font-medium text-neutral-700'>
          Deliverable Type
        </Label>
        <Select
          value={formData.deliverableType}
          onValueChange={(value) => {
            return handleSelectChange('deliverableType', value);
          }}
        >
          <SelectTrigger className='w-full'>
            <SelectValue>
              {formData.deliverableType === 'digital' && 'Digital Product'}
              {formData.deliverableType === 'service' && 'Custom Service'}
              {formData.deliverableType === 'physical' && 'Physical Product'}
              {formData.deliverableType === 'package' && 'Package'}
              {formData.deliverableType === 'other' && 'Other'}
              {!formData.deliverableType && 'Select type'}
            </SelectValue>
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='digital'>
              <div>
                <span className='font-medium'>Digital Product</span>
                <p className='text-xs text-neutral-500 mt-0.5'>
                  Downloadable files, templates, designs, or software
                </p>
              </div>
            </SelectItem>
            <SelectItem value='service'>
              <div>
                <span className='font-medium'>Custom Service</span>
                <p className='text-xs text-neutral-500 mt-0.5'>
                  Professional service with defined scope and deliverables
                </p>
              </div>
            </SelectItem>
            <SelectItem value='physical'>
              <div>
                <span className='font-medium'>Physical Product</span>
                <p className='text-xs text-neutral-500 mt-0.5'>
                  Tangible items that will be shipped to clients
                </p>
              </div>
            </SelectItem>
            <SelectItem value='package'>
              <div>
                <span className='font-medium'>Package</span>
                <p className='text-xs text-neutral-500 mt-0.5'>
                  Bundle of multiple products or services offered together
                </p>
              </div>
            </SelectItem>
            <SelectItem value='other'>
              <div>
                <span className='font-medium'>Other</span>
                <p className='text-xs text-neutral-500 mt-0.5'>
                  Custom deliverable type not listed above
                </p>
              </div>
            </SelectItem>
          </SelectContent>
        </Select>
        {formData.deliverableType === 'other' && (
          <div className='mt-2'>
            <Input
              id='customDeliverableType'
              name='customDeliverableType'
              value={formData.customDeliverableType || ''}
              onChange={handleChange}
              placeholder='Specify deliverable type'
              className='text-sm'
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default BasicDetailsTab;
