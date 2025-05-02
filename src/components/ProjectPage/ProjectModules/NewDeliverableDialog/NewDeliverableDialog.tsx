import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, FileText, ListChecks, Settings } from 'lucide-react';
import { useState } from 'react';

// Define the stages
const STAGES = [
  {
    id: 1,
    title: 'Basic Info',
    value: 'basic-info',
    icon: <FileText className='mr-2 opacity-70' size={15} aria-hidden='true' />,
  },
  {
    id: 2,
    title: 'Details',
    value: 'details',
    icon: <Settings className='mr-2 opacity-70' size={15} aria-hidden='true' />,
  },
  {
    id: 3,
    title: 'Review',
    value: 'review',
    icon: <ListChecks className='mr-2 opacity-70' size={15} aria-hidden='true' />,
  },
];

const NewDeliverableDialog = ({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) => {
  const [currentStage, setCurrentStage] = useState(STAGES[0].value);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    dueDate: '',
    priority: 'Medium',
    assignee: '',
    notes: '',
  });

  // Handle input changes
  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => {
      return { ...prev, [name]: value };
    });
  };

  // Navigate to next stage
  const handleNext = () => {
    const currentIndex = STAGES.findIndex((stage) => {
      return stage.value === currentStage;
    });
    if (currentIndex < STAGES.length - 1) {
      setCurrentStage(STAGES[currentIndex + 1].value);
    }
  };

  // Navigate to previous stage
  const handleBack = () => {
    const currentIndex = STAGES.findIndex((stage) => {
      return stage.value === currentStage;
    });
    if (currentIndex > 0) {
      setCurrentStage(STAGES[currentIndex - 1].value);
    }
  };

  // Get current stage index for footer buttons display
  const getCurrentStageIndex = () => {
    return STAGES.findIndex((stage) => {
      return stage.value === currentStage;
    });
  };

  // Handle form submission
  const handleSubmit = () => {
    console.log('Submitted data:', formData);
    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='sm:max-w-[640px] p-0 overflow-hidden shadow-sm border-neutral-200 transition-all duration-150 ease-in-out'>
        <div className='flex flex-col h-[520px]'>
          <DialogHeader className='px-5 py-4 border-b border-neutral-100'>
            <DialogTitle className='text-base font-medium'>New Deliverable</DialogTitle>
          </DialogHeader>

          <div className='flex flex-1 overflow-hidden'>
            <Tabs
              value={currentStage}
              onValueChange={setCurrentStage}
              className='flex flex-row w-full h-full'
            >
              <div className='flex h-full w-full'>
                <TabsList className='flex-col gap-0.5 rounded-none bg-transparent px-3 py-4 w-48 border-r border-neutral-100 h-full justify-start'>
                  {STAGES.map((stage) => {
                    return (
                      <TabsTrigger
                        key={stage.value}
                        value={stage.value}
                        className='relative w-full justify-start px-3 py-2 text-sm font-normal text-neutral-600 data-[state=active]:text-neutral-900 transition-colors duration-150 
                      hover:bg-neutral-50 data-[state=active]:bg-neutral-100/50 
                      data-[state=active]:after:bg-neutral-900 after:absolute after:inset-y-0 after:left-0 
                      after:w-[2px] data-[state=active]:after:opacity-100 after:opacity-0 
                      rounded-md data-[state=active]:shadow-none'
                      >
                        {stage.icon}
                        {stage.title}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <div className='flex-1'>
                  <TabsContent value='basic-info' className='p-5 m-0 h-full overflow-y-auto'>
                    <div className='space-y-5'>
                      <div className='space-y-1.5'>
                        <Label htmlFor='name' className='text-sm font-medium text-neutral-700'>
                          Deliverable Name
                        </Label>
                        <Input
                          id='name'
                          name='name'
                          value={formData.name}
                          onChange={handleChange}
                          placeholder='Enter deliverable name'
                          className='transition-shadow duration-150 focus:ring-1 focus:ring-neutral-200'
                        />
                      </div>
                      <div className='space-y-1.5'>
                        <Label
                          htmlFor='description'
                          className='text-sm font-medium text-neutral-700'
                        >
                          Description
                        </Label>
                        <Textarea
                          id='description'
                          name='description'
                          value={formData.description}
                          onChange={handleChange}
                          placeholder='Brief description of the deliverable'
                          rows={4}
                          className='resize-none transition-shadow duration-150 focus:ring-1 focus:ring-neutral-200'
                        />
                      </div>
                      <div className='space-y-1.5'>
                        <Label htmlFor='dueDate' className='text-sm font-medium text-neutral-700'>
                          Due Date
                        </Label>
                        <Input
                          id='dueDate'
                          name='dueDate'
                          value={formData.dueDate}
                          onChange={handleChange}
                          type='date'
                          className='transition-shadow duration-150 focus:ring-1 focus:ring-neutral-200'
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value='details' className='p-5 m-0 h-full overflow-y-auto'>
                    <div className='space-y-5'>
                      <div className='space-y-1.5'>
                        <Label htmlFor='priority' className='text-sm font-medium text-neutral-700'>
                          Priority
                        </Label>
                        <Input
                          id='priority'
                          name='priority'
                          value={formData.priority}
                          onChange={handleChange}
                          placeholder='Set priority level'
                          className='transition-shadow duration-150 focus:ring-1 focus:ring-neutral-200'
                        />
                      </div>
                      <div className='space-y-1.5'>
                        <Label htmlFor='assignee' className='text-sm font-medium text-neutral-700'>
                          Assignee
                        </Label>
                        <Input
                          id='assignee'
                          name='assignee'
                          value={formData.assignee}
                          onChange={handleChange}
                          placeholder='Assign to team member'
                          className='transition-shadow duration-150 focus:ring-1 focus:ring-neutral-200'
                        />
                      </div>
                      <div className='space-y-1.5'>
                        <Label htmlFor='notes' className='text-sm font-medium text-neutral-700'>
                          Additional Notes
                        </Label>
                        <Textarea
                          id='notes'
                          name='notes'
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder='Any additional details or requirements'
                          rows={4}
                          className='resize-none transition-shadow duration-150 focus:ring-1 focus:ring-neutral-200'
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value='review' className='p-5 m-0 h-full overflow-y-auto'>
                    <div className='space-y-4'>
                      <h3 className='text-sm font-medium text-neutral-600'>Review Information</h3>
                      <div className='space-y-3 rounded-md border border-neutral-100 p-4 bg-neutral-50/50'>
                        <div className='flex flex-row gap-1 text-sm'>
                          <span className='w-24 font-medium text-neutral-700'>Name:</span>
                          <span className='text-neutral-800'>{formData.name || '—'}</span>
                        </div>
                        <div className='flex flex-row gap-1 text-sm'>
                          <span className='w-24 font-medium text-neutral-700'>Description:</span>
                          <span className='text-neutral-800'>{formData.description || '—'}</span>
                        </div>
                        <div className='flex flex-row gap-1 text-sm'>
                          <span className='w-24 font-medium text-neutral-700'>Due Date:</span>
                          <span className='text-neutral-800'>{formData.dueDate || '—'}</span>
                        </div>
                        <div className='flex flex-row gap-1 text-sm'>
                          <span className='w-24 font-medium text-neutral-700'>Priority:</span>
                          <span className='text-neutral-800'>{formData.priority || '—'}</span>
                        </div>
                        <div className='flex flex-row gap-1 text-sm'>
                          <span className='w-24 font-medium text-neutral-700'>Assignee:</span>
                          <span className='text-neutral-800'>{formData.assignee || '—'}</span>
                        </div>
                        <div className='flex flex-row gap-1 text-sm'>
                          <span className='w-24 font-medium text-neutral-700'>Notes:</span>
                          <span className='text-neutral-800'>{formData.notes || '—'}</span>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>

          {/* Bottom Buttons */}
          <div className='flex justify-between px-5 py-4 border-t border-neutral-100'>
            {getCurrentStageIndex() > 0 ? (
              <Button
                variant='outline'
                onClick={handleBack}
                className='text-sm font-normal border-neutral-200 hover:bg-neutral-50 transition-colors duration-150'
              >
                <ChevronLeft className='mr-1.5 h-3.5 w-3.5' />
                Back
              </Button>
            ) : (
              <div></div> // Empty div to maintain flex layout
            )}

            {getCurrentStageIndex() < STAGES.length - 1 ? (
              <Button
                onClick={handleNext}
                className='text-sm font-normal transition-colors duration-150'
              >
                Continue
                <ChevronRight className='ml-1.5 h-3.5 w-3.5' />
              </Button>
            ) : (
              <Button
                onClick={handleSubmit}
                className='text-sm font-normal transition-colors duration-150'
              >
                Create Deliverable
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewDeliverableDialog;
