import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { usePipelineSettings } from '@/hooks/usePipelineSettings';
import { ArrowUpDown, Check, Edit, MoreHorizontal, Plus, Settings, Trash2, X } from 'lucide-react';

// Function to render status badge with appropriate color
const renderStatusBadge = (status: { name: string; color: string }) => {
  return (
    <Badge
      className='flex items-center text-xs font-medium'
      style={{
        backgroundColor: `${status.color}20`,
        color: status.color,
        borderColor: `${status.color}40`,
      }}
    >
      <div className='h-2 w-2 rounded-full mr-1.5' style={{ backgroundColor: status.color }}></div>
      {status.name}
    </Badge>
  );
};

// Function to render stage with color
const renderStage = (stage: { name: string; color: string }) => {
  return (
    <div className='flex items-center'>
      <div className='h-2 w-2 rounded-full mr-2' style={{ backgroundColor: stage.color }}></div>
      <span className='text-sm font-normal'>{stage.name}</span>
    </div>
  );
};

export function PipelineSettings() {
  const {
    stages,
    statuses,
    isEditStatusDialogOpen,
    newStageName,
    newStatusName,
    newStatusColor,
    customColor,
    editingStageIndex,
    editingStatusIndex,
    isAddingStage,
    setNewStageName,
    setNewStatusName,
    setNewStatusColor,
    setCustomColor,
    setIsEditStatusDialogOpen,
    handleAddStage,
    handleDeleteStage,
    handleEditStage,
    handleEditStatus,
    handleUpdateStatus,
    handleDeleteStatus,
    moveStage,
    setEditingStageIndex,
    setEditingStatusIndex,
    setIsAddingStage,
  } = usePipelineSettings();

  return (
    <>
      <Sheet modal>
        <SheetTrigger asChild>
          <Button variant='outline' size='icon' className=''>
            <Settings className='h-4 w-4' />
            <span className='sr-only'>Pipeline Settings</span>
          </Button>
        </SheetTrigger>
        <SheetContent className='overflow-y-auto max-h-screen flex flex-col scrollbar-hide'>
          <SheetHeader>
            <SheetTitle className='text-base font-medium tracking-tight'>
              Project Pipeline Configuration
            </SheetTitle>
            <SheetDescription className='text-xs leading-relaxed text-muted-foreground'>
              Customize your project pipeline stages and workflow.
            </SheetDescription>
          </SheetHeader>
          <div className='py-4 space-y-8 flex-grow overflow-auto scrollbar-hide'>
            <div>
              <h3 className='text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide'>
                Pipeline Stages
              </h3>
              <div className='space-y-1.5'>
                {stages.map((stage, index) => {
                  return (
                    <div
                      key={stage._id}
                      className='flex items-center justify-between p-2 border rounded-md bg-background'
                    >
                      {editingStageIndex === index ? (
                        <Input
                          value={newStageName}
                          onChange={(e) => {
                            return setNewStageName(e.target.value);
                          }}
                          className='h-7 text-xs flex-1 mr-2'
                          autoFocus
                          onKeyDown={(e) => {
                            if (e.key === 'Enter') handleAddStage();
                            if (e.key === 'Escape') {
                              setEditingStageIndex(null);
                              setNewStageName('');
                            }
                          }}
                        />
                      ) : (
                        renderStage(stage)
                      )}
                      <div className='flex space-x-1'>
                        {editingStageIndex === index ? (
                          <>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7'
                              onClick={handleAddStage}
                            >
                              <Check className='h-3.5 w-3.5 text-green-600' />
                            </Button>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7'
                              onClick={() => {
                                setEditingStageIndex(null);
                                setNewStageName('');
                              }}
                            >
                              <X className='h-3.5 w-3.5 text-red-600' />
                            </Button>
                          </>
                        ) : (
                          <>
                            <Button
                              variant='ghost'
                              size='icon'
                              className='h-7 w-7'
                              onClick={() => {
                                return moveStage(index, 'up');
                              }}
                              disabled={index === 0}
                            >
                              <ArrowUpDown className='h-3.5 w-3.5' />
                            </Button>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='icon' className='h-7 w-7'>
                                  <MoreHorizontal className='h-3.5 w-3.5' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuItem
                                  onClick={() => {
                                    return handleEditStage(index);
                                  }}
                                >
                                  <Edit className='h-3.5 w-3.5 mr-2' />
                                  Edit Stage
                                </DropdownMenuItem>
                                <DropdownMenuItem
                                  className='text-red-500'
                                  onClick={() => {
                                    return handleDeleteStage(index);
                                  }}
                                >
                                  <Trash2 className='h-3.5 w-3.5 mr-2' />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              {isAddingStage && editingStageIndex === null ? (
                <div className='p-1 mt-3 flex items-center space-x-2'>
                  <Input
                    value={newStageName}
                    onChange={(e) => {
                      return setNewStageName(e.target.value);
                    }}
                    placeholder='Enter stage name...'
                    className='h-8 text-xs'
                    autoFocus
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') handleAddStage();
                      if (e.key === 'Escape') {
                        setIsAddingStage(false);
                        setNewStageName('');
                        setEditingStageIndex(null);
                      }
                    }}
                  />
                  <Button variant='ghost' size='icon' className='h-7 w-7' onClick={handleAddStage}>
                    <Check className='h-3.5 w-3.5 text-green-600' />
                  </Button>
                  <Button
                    variant='ghost'
                    size='icon'
                    className='h-7 w-7'
                    onClick={() => {
                      setIsAddingStage(false);
                      setNewStageName('');
                      setEditingStageIndex(null);
                    }}
                  >
                    <X className='h-3.5 w-3.5 text-red-600' />
                  </Button>
                </div>
              ) : (
                !editingStageIndex && (
                  <Button
                    className='mt-3'
                    variant='outline'
                    size='sm'
                    onClick={() => {
                      setNewStageName('');
                      setEditingStageIndex(null);
                      setIsAddingStage(true);
                    }}
                  >
                    <Plus className='h-3.5 w-3.5 mr-1.5' />
                    <span className='text-xs'>Add Stage</span>
                  </Button>
                )
              )}
            </div>
            <div>
              <h3 className='text-xs font-medium mb-2 text-muted-foreground uppercase tracking-wide'>
                Project States
              </h3>
              <div className='space-y-1.5'>
                {statuses.map((status, index) => {
                  return (
                    <div
                      key={status._id}
                      className='flex items-center justify-between p-2 border rounded-md bg-background'
                    >
                      <div className='flex items-center'>{renderStatusBadge(status)}</div>
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant='ghost' size='icon' className='h-7 w-7'>
                            <MoreHorizontal className='h-3.5 w-3.5' />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align='end'>
                          <DropdownMenuItem
                            onClick={() => {
                              return handleEditStatus(index);
                            }}
                          >
                            Edit Status
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            className='text-red-500'
                            onClick={() => {
                              return handleDeleteStatus(index);
                            }}
                          >
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </SheetContent>
      </Sheet>

      <Dialog open={isEditStatusDialogOpen} onOpenChange={setIsEditStatusDialogOpen}>
        <DialogContent className='sm:max-w-[425px]'>
          <DialogHeader>
            <DialogTitle>Edit Status</DialogTitle>
            <DialogDescription>Customize the appearance of this project status.</DialogDescription>
          </DialogHeader>
          <div className='py-4 space-y-4'>
            <div className='space-y-2'>
              <Label htmlFor='status-name'>Status Name</Label>
              <Input
                id='status-name'
                value={newStatusName}
                onChange={(e) => {
                  return setNewStatusName(e.target.value);
                }}
                placeholder='Status name'
                className='w-full'
              />
            </div>

            <div className='space-y-2'>
              <Label>Status Color</Label>
              <RadioGroup
                value={newStatusColor}
                onValueChange={setNewStatusColor}
                className='grid grid-cols-6 gap-2'
              >
                <div className='flex flex-col items-center space-y-1'>
                  <RadioGroupItem value='slate' id='color-slate' className='sr-only peer' />
                  <Label
                    htmlFor='color-slate'
                    className='w-8 h-8 rounded-full bg-slate-100 border-2 peer-data-[state=checked]:border-slate-800 cursor-pointer'
                  />
                  <span className='text-xs'>Default</span>
                </div>
                <div className='flex flex-col items-center space-y-1'>
                  <RadioGroupItem value='green' id='color-green' className='sr-only peer' />
                  <Label
                    htmlFor='color-green'
                    className='w-8 h-8 rounded-full bg-green-100 border-2 peer-data-[state=checked]:border-green-800 cursor-pointer'
                  />
                  <span className='text-xs'>Success</span>
                </div>
                <div className='flex flex-col items-center space-y-1'>
                  <RadioGroupItem value='blue' id='color-blue' className='sr-only peer' />
                  <Label
                    htmlFor='color-blue'
                    className='w-8 h-8 rounded-full bg-blue-100 border-2 peer-data-[state=checked]:border-blue-800 cursor-pointer'
                  />
                  <span className='text-xs'>Info</span>
                </div>
                <div className='flex flex-col items-center space-y-1'>
                  <RadioGroupItem value='amber' id='color-amber' className='sr-only peer' />
                  <Label
                    htmlFor='color-amber'
                    className='w-8 h-8 rounded-full bg-amber-100 border-2 peer-data-[state=checked]:border-amber-800 cursor-pointer'
                  />
                  <span className='text-xs'>Warning</span>
                </div>
                <div className='flex flex-col items-center space-y-1'>
                  <RadioGroupItem value='red' id='color-red' className='sr-only peer' />
                  <Label
                    htmlFor='color-red'
                    className='w-8 h-8 rounded-full bg-red-100 border-2 peer-data-[state=checked]:border-red-800 cursor-pointer'
                  />
                  <span className='text-xs'>Danger</span>
                </div>
                <div className='flex flex-col items-center space-y-1'>
                  <RadioGroupItem value='custom' id='color-custom' className='sr-only peer' />
                  <Label
                    htmlFor='color-custom'
                    className='w-8 h-8 rounded-full border-2 peer-data-[state=checked]:border-black cursor-pointer overflow-hidden'
                    style={{ background: customColor }}
                  >
                    {newStatusColor === 'custom' && (
                      <input
                        type='color'
                        value={customColor}
                        onChange={(e) => {
                          return setCustomColor(e.target.value);
                        }}
                        className='opacity-0 w-full h-full cursor-pointer'
                      />
                    )}
                  </Label>
                  <span className='text-xs'>Custom</span>
                </div>
              </RadioGroup>
            </div>

            {newStatusColor === 'custom' && (
              <div className='space-y-2'>
                <Label htmlFor='custom-color'>Custom Color</Label>
                <div className='flex space-x-2'>
                  <div
                    className='w-8 h-8 rounded-md border'
                    style={{ backgroundColor: customColor }}
                  ></div>
                  <Input
                    id='custom-color'
                    type='color'
                    value={customColor}
                    onChange={(e) => {
                      return setCustomColor(e.target.value);
                    }}
                    className='w-full h-8'
                  />
                </div>
              </div>
            )}

            <div className='mt-4 p-3 border rounded-md'>
              <Label className='text-xs text-muted-foreground mb-2 block'>Preview</Label>
              <div className='flex justify-center'>
                {newStatusColor === 'custom' ? (
                  <Badge
                    className='flex items-center text-xs font-medium'
                    style={{
                      backgroundColor: `${customColor}20`,
                      color: customColor,
                      borderColor: `${customColor}40`,
                    }}
                  >
                    <div
                      className='h-2 w-2 rounded-full mr-1.5'
                      style={{ backgroundColor: customColor }}
                    ></div>
                    {newStatusName || 'Status Name'}
                  </Badge>
                ) : (
                  <Badge
                    className={`bg-${newStatusColor}-50 text-${newStatusColor}-700 hover:bg-${newStatusColor}-100 flex items-center text-xs font-medium`}
                  >
                    <div className={`bg-${newStatusColor}-700 h-2 w-2 rounded-full mr-1.5`}></div>
                    {newStatusName || 'Status Name'}
                  </Badge>
                )}
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => {
                return setIsEditStatusDialogOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button onClick={handleUpdateStatus}>Update Status</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
