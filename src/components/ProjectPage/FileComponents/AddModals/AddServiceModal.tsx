import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { ProjectFile } from '@/lib/mock/projectFiles';
import { Plus, Shirt, X } from 'lucide-react';
import { useState } from 'react';

interface ServiceOption {
  name: string;
  description: string;
  price: string;
  duration: string;
}

interface AddServiceModalProps {
  selectedFile: ProjectFile;
  onClose: () => void;
}

const AddServiceModal: React.FC<AddServiceModalProps> = ({ selectedFile, onClose }) => {
  const [showModal, setShowModal] = useState(true);

  const [service, setService] = useState({
    name: '',
    description: '',
    category: '',
    pricingModel: 'fixed', // fixed, hourly, package
    basePrice: '',
    baseHours: '',
    packages: [] as ServiceOption[],
  });

  const serviceCategories = [
    'Photography',
    'Design',
    'Consultation',
    'Editing',
    'Training',
    'Support',
    'Other',
  ];

  const handleClose = () => {
    setShowModal(false);
    onClose();
  };

  const handleCreateService = () => {
    // In a real implementation, this would create and add the service
    // For now, we just close the modal
    handleClose();
  };

  const addPackage = () => {
    setService({
      ...service,
      packages: [
        ...service.packages,
        {
          name: `Package ${service.packages.length + 1}`,
          description: '',
          price: '',
          duration: '',
        },
      ],
    });
  };

  const removePackage = (index: number) => {
    const packages = [...service.packages];
    packages.splice(index, 1);
    setService({
      ...service,
      packages,
    });
  };

  const updatePackage = (index: number, field: string, value: string) => {
    const packages = [...service.packages];
    packages[index] = {
      ...packages[index],
      [field]: value,
    };
    setService({
      ...service,
      packages,
    });
  };

  return (
    <Dialog open={showModal} onOpenChange={setShowModal}>
      <DialogContent className='max-w-3xl'>
        <DialogHeader>
          <DialogTitle>Create Service</DialogTitle>
          <DialogDescription>Define a service to add to {selectedFile.name}</DialogDescription>
        </DialogHeader>

        <div className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='service-name'>Service Name*</Label>
              <Input
                id='service-name'
                value={service.name}
                onChange={(e) => setService({ ...service, name: e.target.value })}
                placeholder='Photography Session'
              />
            </div>
            <div className='space-y-2'>
              <Label htmlFor='service-category'>Category</Label>
              <Select
                value={service.category}
                onValueChange={(value) => setService({ ...service, category: value })}
              >
                <SelectTrigger id='service-category'>
                  <SelectValue placeholder='Select a category' />
                </SelectTrigger>
                <SelectContent>
                  {serviceCategories.map((category) => (
                    <SelectItem key={category} value={category.toLowerCase()}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='service-description'>Description</Label>
            <Textarea
              id='service-description'
              value={service.description}
              onChange={(e) => setService({ ...service, description: e.target.value })}
              placeholder='Describe what this service includes...'
              rows={3}
            />
          </div>

          <div className='border rounded-md p-4 space-y-4'>
            <h4 className='font-medium'>Pricing Model</h4>
            <RadioGroup
              value={service.pricingModel}
              onValueChange={(value) => setService({ ...service, pricingModel: value })}
              className='grid grid-cols-3 gap-4'
            >
              <div className='flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50'>
                <RadioGroupItem value='fixed' id='pricing-fixed' />
                <Label htmlFor='pricing-fixed' className='cursor-pointer'>
                  Fixed Price
                </Label>
              </div>
              <div className='flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50'>
                <RadioGroupItem value='hourly' id='pricing-hourly' />
                <Label htmlFor='pricing-hourly' className='cursor-pointer'>
                  Hourly Rate
                </Label>
              </div>
              <div className='flex items-center space-x-2 border rounded-md p-3 cursor-pointer hover:bg-gray-50'>
                <RadioGroupItem value='package' id='pricing-package' />
                <Label htmlFor='pricing-package' className='cursor-pointer'>
                  Package Options
                </Label>
              </div>
            </RadioGroup>

            {service.pricingModel === 'fixed' && (
              <div className='pt-2'>
                <div className='space-y-2'>
                  <Label htmlFor='service-price'>Price*</Label>
                  <Input
                    id='service-price'
                    value={service.basePrice}
                    onChange={(e) => setService({ ...service, basePrice: e.target.value })}
                    placeholder='199.99'
                    type='number'
                    step='0.01'
                  />
                </div>
              </div>
            )}

            {service.pricingModel === 'hourly' && (
              <div className='grid grid-cols-2 gap-4 pt-2'>
                <div className='space-y-2'>
                  <Label htmlFor='service-hourly-rate'>Hourly Rate*</Label>
                  <Input
                    id='service-hourly-rate'
                    value={service.basePrice}
                    onChange={(e) => setService({ ...service, basePrice: e.target.value })}
                    placeholder='75.00'
                    type='number'
                    step='0.01'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='service-hours'>Estimated Hours</Label>
                  <Input
                    id='service-hours'
                    value={service.baseHours}
                    onChange={(e) => setService({ ...service, baseHours: e.target.value })}
                    placeholder='2'
                    type='number'
                    step='0.5'
                  />
                </div>
              </div>
            )}

            {service.pricingModel === 'package' && (
              <div className='space-y-4 pt-2'>
                <div className='flex justify-between items-center'>
                  <Label>Package Options</Label>
                  <Button type='button' variant='outline' size='sm' onClick={addPackage}>
                    <Plus className='h-4 w-4 mr-1' />
                    Add Package
                  </Button>
                </div>

                {service.packages.length === 0 ? (
                  <div className='text-center py-6 text-gray-500'>
                    <Shirt className='h-12 w-12 mx-auto mb-2 text-gray-300' />
                    <p>No packages defined yet</p>
                    <p className='text-sm mt-1'>
                      Click &quot;Add Package&quot; to create your first package option
                    </p>
                  </div>
                ) : (
                  <div className='space-y-4'>
                    {service.packages.map((pkg, index) => (
                      <div key={index} className='border rounded-md p-3 space-y-3'>
                        <div className='flex items-center justify-between'>
                          <h5 className='font-medium'>Package {index + 1}</h5>
                          <Button
                            type='button'
                            variant='ghost'
                            size='icon'
                            onClick={() => removePackage(index)}
                            className='h-8 w-8'
                          >
                            <X className='h-4 w-4' />
                          </Button>
                        </div>

                        <div className='grid grid-cols-2 gap-3'>
                          <div className='space-y-2'>
                            <Label htmlFor={`package-name-${index}`}>Name*</Label>
                            <Input
                              id={`package-name-${index}`}
                              value={pkg.name}
                              onChange={(e) => updatePackage(index, 'name', e.target.value)}
                              placeholder='Basic Package'
                            />
                          </div>
                          <div className='space-y-2'>
                            <Label htmlFor={`package-price-${index}`}>Price*</Label>
                            <Input
                              id={`package-price-${index}`}
                              value={pkg.price}
                              onChange={(e) => updatePackage(index, 'price', e.target.value)}
                              placeholder='99.99'
                              type='number'
                              step='0.01'
                            />
                          </div>
                        </div>

                        <div className='grid grid-cols-2 gap-3'>
                          <div className='space-y-2'>
                            <Label htmlFor={`package-duration-${index}`}>Duration</Label>
                            <Input
                              id={`package-duration-${index}`}
                              value={pkg.duration}
                              onChange={(e) => updatePackage(index, 'duration', e.target.value)}
                              placeholder='1 hour'
                            />
                          </div>
                        </div>

                        <div className='space-y-2'>
                          <Label htmlFor={`package-desc-${index}`}>Description</Label>
                          <Textarea
                            id={`package-desc-${index}`}
                            value={pkg.description}
                            onChange={(e) => updatePackage(index, 'description', e.target.value)}
                            placeholder='Describe the package contents...'
                            rows={2}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          <div className='space-y-2'>
            <h4 className='font-medium'>Additional Information</h4>
            <p className='text-sm text-gray-600'>
              This service will be linked directly to this item. You can later associate specific
              client bookings, scheduling, and payment details to this service.
            </p>
          </div>
        </div>

        <DialogFooter className='pt-4 space-x-2'>
          <Button variant='outline' onClick={handleClose}>
            Cancel
          </Button>
          <Button
            onClick={handleCreateService}
            disabled={
              !service.name ||
              (service.pricingModel === 'fixed' && !service.basePrice) ||
              (service.pricingModel === 'hourly' && !service.basePrice) ||
              (service.pricingModel === 'package' &&
                (service.packages.length === 0 ||
                  service.packages.some((pkg) => !pkg.name || !pkg.price)))
            }
          >
            Create & Add Service
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default AddServiceModal;
