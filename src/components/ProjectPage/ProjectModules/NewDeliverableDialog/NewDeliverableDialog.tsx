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
    icon: <FileText className='-ms-0.5 me-1.5 opacity-60' size={16} aria-hidden='true' />,
  },
  {
    id: 2,
    title: 'Details',
    value: 'details',
    icon: <Settings className='-ms-0.5 me-1.5 opacity-60' size={16} aria-hidden='true' />,
  },
  {
    id: 3,
    title: 'Review',
    value: 'review',
    icon: <ListChecks className='-ms-0.5 me-1.5 opacity-60' size={16} aria-hidden='true' />,
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
      <DialogContent className='sm:max-w-[800px] p-0 overflow-hidden'>
        <div className='flex flex-col h-[500px]'>
          <DialogHeader className='p-4 pb-3 border-b mb-0'>
            <DialogTitle>New Deliverable</DialogTitle>
          </DialogHeader>

          <div className='flex flex-1 overflow-hidden'>
            <Tabs
              value={currentStage}
              onValueChange={setCurrentStage}
              className='flex flex-row w-full h-full'
            >
              <div className='flex h-full w-full'>
                <TabsList className='text-foreground flex-col gap-1 rounded-none bg-transparent p-4 w-52 border-r h-full justify-start'>
                  {STAGES.map((stage) => {
                    return (
                      <TabsTrigger
                        key={stage.value}
                        value={stage.value}
                        className='hover:bg-accent hover:text-foreground data-[state=active]:after:bg-primary data-[state=active]:hover:bg-accent relative w-full justify-start after:absolute after:inset-y-0 after:start-0 after:-ms-1 after:w-0.5 data-[state=active]:bg-transparent data-[state=active]:shadow-none'
                      >
                        {stage.icon}
                        {stage.title}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>

                <div className='flex-1'>
                  <TabsContent value='basic-info' className='p-6 m-0 h-full overflow-y-auto'>
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='name'>Deliverable Name</Label>
                        <Input
                          id='name'
                          name='name'
                          value={formData.name}
                          onChange={handleChange}
                          placeholder='Enter deliverable name'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='description'>Description</Label>
                        <Textarea
                          id='description'
                          name='description'
                          value={formData.description}
                          onChange={handleChange}
                          placeholder='Brief description of the deliverable'
                          rows={4}
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='dueDate'>Due Date</Label>
                        <Input
                          id='dueDate'
                          name='dueDate'
                          value={formData.dueDate}
                          onChange={handleChange}
                          type='date'
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value='details' className='p-6 m-0 h-full overflow-y-auto'>
                    <div className='space-y-4'>
                      <div className='space-y-2'>
                        <Label htmlFor='priority'>Priority</Label>
                        <Input
                          id='priority'
                          name='priority'
                          value={formData.priority}
                          onChange={handleChange}
                          placeholder='Set priority level'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='assignee'>Assignee</Label>
                        <Input
                          id='assignee'
                          name='assignee'
                          value={formData.assignee}
                          onChange={handleChange}
                          placeholder='Assign to team member'
                        />
                      </div>
                      <div className='space-y-2'>
                        <Label htmlFor='notes'>Additional Notes</Label>
                        <Textarea
                          id='notes'
                          name='notes'
                          value={formData.notes}
                          onChange={handleChange}
                          placeholder='Any additional details or requirements'
                          rows={4}
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value='review' className='p-6 m-0 h-full overflow-y-auto'>
                    <div className='space-y-4'>
                      <h3 className='text-lg font-medium'>Review Information</h3>
                      <div className='space-y-3 rounded-lg border p-4'>
                        <div>
                          <span className='font-medium'>Name:</span> {formData.name}
                        </div>
                        <div>
                          <span className='font-medium'>Description:</span> {formData.description}
                        </div>
                        <div>
                          <span className='font-medium'>Due Date:</span> {formData.dueDate}
                        </div>
                        <div>
                          <span className='font-medium'>Priority:</span> {formData.priority}
                        </div>
                        <div>
                          <span className='font-medium'>Assignee:</span> {formData.assignee}
                        </div>
                        <div>
                          <span className='font-medium'>Notes:</span> {formData.notes}
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </div>
              </div>
            </Tabs>
          </div>

          {/* Bottom Buttons */}
          <div className='flex justify-between p-6 border-t w-full'>
            {getCurrentStageIndex() > 0 ? (
              <Button variant='outline' onClick={handleBack}>
                <ChevronLeft className='mr-2 h-4 w-4' />
                Back
              </Button>
            ) : (
              <div></div> // Empty div to maintain flex layout
            )}

            {getCurrentStageIndex() < STAGES.length - 1 ? (
              <Button onClick={handleNext}>
                Continue
                <ChevronRight className='ml-2 h-4 w-4' />
              </Button>
            ) : (
              <Button onClick={handleSubmit}>Create Deliverable</Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default NewDeliverableDialog;
