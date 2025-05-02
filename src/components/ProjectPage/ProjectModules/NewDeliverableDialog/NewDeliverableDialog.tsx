import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { ChevronLeft, ChevronRight, FileText, ListChecks, Menu, Settings, X } from 'lucide-react';
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
  const [isSidebarOpen, setSidebarOpen] = useState(true);
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

  // Toggle sidebar
  const toggleSidebar = () => {
    setSidebarOpen(!isSidebarOpen);
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

  // Get current stage title
  const getCurrentStageTitle = () => {
    const stage = STAGES.find((s) => {
      return s.value === currentStage;
    });
    return stage ? stage.title : '';
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className='max-w-[90vw] sm:max-w-[800px] md:max-w-[900px] lg:max-w-[1000px] p-0 overflow-hidden shadow-sm border-neutral-200 transition-all duration-150 ease-in-out h-[90vh] sm:h-[600px] md:h-[650px]'>
        <div className='flex flex-col h-full'>
          <DialogHeader className='px-5 py-1 border-b border-neutral-100 flex flex-row items-center justify-between'>
            <div className='flex items-center'>
              <Button
                variant='ghost'
                size='icon'
                onClick={toggleSidebar}
                className='md:hidden mr-2'
              >
                <Menu size={18} />
              </Button>
              <DialogTitle className='text-base font-medium'>New Deliverable</DialogTitle>
            </div>
            <Button
              variant='ghost'
              size='icon'
              onClick={onClose}
              className='text-neutral-500 hover:text-neutral-900'
            >
              <X size={18} />
            </Button>
          </DialogHeader>

          <div className='flex flex-1 overflow-hidden'>
            <Tabs
              value={currentStage}
              onValueChange={setCurrentStage}
              className='flex flex-row w-full h-full'
            >
              <div className='flex h-full w-full'>
                {/* Sidebar */}
                <TabsList
                  className={`absolute md:relative z-10 md:z-0 bg-white flex-col gap-0.5 rounded-none bg-transparent px-3 py-4 border-r border-neutral-100 h-full justify-start transition-all duration-200
                  ${
                    isSidebarOpen
                      ? 'w-48 translate-x-0'
                      : 'w-0 -translate-x-full md:translate-x-0 md:w-14 xl:w-16'
                  }`}
                >
                  {STAGES.map((stage) => {
                    return (
                      <TabsTrigger
                        key={stage.value}
                        value={stage.value}
                        onClick={() => {
                          // On mobile, clicking a tab also closes the sidebar
                          if (window.innerWidth < 768) {
                            setSidebarOpen(false);
                          }
                        }}
                        className={`relative w-full justify-start px-3 py-2 text-sm font-normal text-neutral-600 data-[state=active]:text-neutral-900 transition-colors duration-150 
                      hover:bg-neutral-50 data-[state=active]:bg-neutral-100/50 
                      data-[state=active]:after:bg-neutral-900 after:absolute after:inset-y-0 after:left-0 
                      after:w-[2px] data-[state=active]:after:opacity-100 after:opacity-0 
                      rounded-md data-[state=active]:shadow-none whitespace-nowrap ${
                        !isSidebarOpen ? 'md:justify-center md:px-1' : ''
                      }`}
                      >
                        {stage.icon}
                        <span className={`${!isSidebarOpen ? 'md:hidden' : ''}`}>
                          {stage.title}
                        </span>
                      </TabsTrigger>
                    );
                  })}

                  {/* Sidebar toggle button for desktop */}
                  <Button
                    variant='ghost'
                    size='icon'
                    onClick={toggleSidebar}
                    className='hidden md:flex mt-auto mx-auto mb-2'
                  >
                    {isSidebarOpen ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                  </Button>
                </TabsList>

                {/* Dark overlay for mobile when sidebar is open */}
                {isSidebarOpen && (
                  <div
                    className='md:hidden fixed inset-0 bg-black bg-opacity-40 z-0'
                    onClick={() => {
                      return setSidebarOpen(false);
                    }}
                  />
                )}

                {/* Main content area */}
                <div className='flex-1 z-0'>
                  {/* Mobile breadcrumb */}
                  <div className='md:hidden bg-neutral-50/80 px-4 py-3 border-b border-neutral-100 flex items-center'>
                    <span className='text-sm font-medium text-neutral-900'>
                      {getCurrentStageTitle()}
                    </span>
                  </div>

                  <TabsContent value='basic-info' className='p-4 sm:p-5 m-0 h-full overflow-y-auto'>
                    <div className='space-y-5 max-w-3xl mx-auto'>
                      <div className='space-y-1'>
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
                      <div className='space-y-1'>
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
                      <div className='space-y-1'>
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

                  <TabsContent value='details' className='p-4 sm:p-5 m-0 h-full overflow-y-auto'>
                    <div className='space-y-5 max-w-3xl mx-auto'>
                      <div className='space-y-1'>
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
                      <div className='space-y-1'>
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
                      <div className='space-y-1'>
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

                  <TabsContent value='review' className='p-4 sm:p-5 m-0 h-full overflow-y-auto'>
                    <div className='space-y-4 max-w-3xl mx-auto'>
                      <h3 className='text-sm font-medium text-neutral-600'>Review Information</h3>
                      <div className='space-y-3 rounded-md border border-neutral-100 p-4 bg-neutral-50/50'>
                        <div className='flex flex-row gap-1 text-sm'>
                          <span className='w-24 font-medium text-neutral-700'>Name:</span>
                          <span className='text-neutral-800'>{formData.name || '—'}</span>
                        </div>
                        <div className='flex flex-col sm:flex-row gap-1 text-sm'>
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
                        <div className='flex flex-col sm:flex-row gap-1 text-sm'>
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
