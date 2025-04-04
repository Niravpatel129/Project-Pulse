'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import {
  Clock,
  Copy,
  Download,
  Edit,
  ExternalLink,
  FileText,
  RefreshCw,
  Send,
  Trash,
  Upload,
} from 'lucide-react';
import { useState } from 'react';

export default function ModuleDialog({ module, onOpenChange }) {
  const [isEditing, setIsEditing] = useState(false);
  const [moduleName, setModuleName] = useState(module?.name || '');
  const [moduleStatus, setModuleStatus] = useState<'active' | 'archived'>(
    module?.status || 'active',
  );
  const [activeTab, setActiveTab] = useState<'preview' | 'history' | 'comments'>('preview');
  const [selectedVersion, setSelectedVersion] = useState(module?.version?.current || 1);

  if (!module) return null;

  const totalVersions = module.version?.total || 1;
  const currentVersion = module.version?.current || 1;
  const moduleType = module.type || 'file';
  const approvalStatus = module.approvalStatus || 'not_requested';
  const projectName = module.project?.name || 'Unknown Project';
  const projectId = module.project?.id || '';
  const fileDetails = module.fileDetails || {
    size: 'Unknown',
    type: 'Unknown',
    url: '',
    previewUrl: '/placeholder.svg',
  };
  const templateDetails = module.templateDetails || { sections: [] };

  const handleSave = () => {
    // Save logic would go here
    setIsEditing(false);
  };

  const getApprovalStatusColor = (status) => {
    switch (status) {
      case 'approved':
        return 'bg-green-100 text-green-800 hover:bg-green-100';
      case 'rejected':
        return 'bg-red-100 text-red-800 hover:bg-red-100';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800 hover:bg-yellow-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  const getApprovalStatusText = (status) => {
    switch (status) {
      case 'approved':
        return 'Approved';
      case 'rejected':
        return 'Rejected';
      case 'pending':
        return 'Pending Approval';
      default:
        return 'Not Requested';
    }
  };

  const getModuleTypeLabel = (type) => {
    switch (type) {
      case 'file':
        return 'File';
      case 'template':
        return 'Form Response';
      default:
        return 'Unknown';
    }
  };

  const getModuleTypeColor = (type) => {
    switch (type) {
      case 'file':
        return 'bg-purple-100 text-purple-800 hover:bg-purple-100';
      case 'template':
        return 'bg-teal-100 text-teal-800 hover:bg-teal-100';
      default:
        return 'bg-gray-100 text-gray-800 hover:bg-gray-100';
    }
  };

  return (
    <Dialog open={!!module} onOpenChange={onOpenChange}>
      <DialogContent className='max-w-[1000px] p-0 h-[85vh] max-h-[900px] overflow-hidden flex'>
        {/* Left Panel - Module Info & Actions */}
        <div className='w-[35%] border-r p-6 flex flex-col h-full overflow-y-auto'>
          <div className='space-y-6'>
            {/* Module Name and Status */}
            <div className='space-y-2'>
              <div className='flex items-center justify-between'>
                <h2 className='text-xl font-semibold'>{module.name}</h2>
              </div>

              {/* Status Badge and Module Type */}
              <div className='flex items-center justify-between'>
                <Badge
                  variant='outline'
                  className={cn('font-normal', getModuleTypeColor(moduleType))}
                >
                  {getModuleTypeLabel(moduleType)}
                </Badge>

                <Select
                  value={moduleStatus}
                  onValueChange={(value) => {
                    setModuleStatus(value as 'active' | 'archived');
                  }}
                >
                  <SelectTrigger className='w-[120px] h-7'>
                    <SelectValue placeholder='Status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='active'>Active</SelectItem>
                    <SelectItem value='archived'>Archived</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <Card className='border-muted'>
              <CardContent className='p-4 space-y-4'>
                {/* Added By */}
                <div className='flex items-center gap-3'>
                  <Avatar className='h-8 w-8'>
                    <AvatarImage
                      src={module.createdBy?.avatar || '/placeholder.svg'}
                      alt={module.createdBy?.name || 'User'}
                    />
                    <AvatarFallback>{module.createdBy?.name?.charAt(0) || 'U'}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p className='text-sm font-medium'>
                      {module.createdBy?.name || 'Unknown User'}
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Added {module.createdAt || 'Unknown date'}
                    </p>
                  </div>
                </div>

                {/* Approval Status */}
                <div className='space-y-1'>
                  <Label className='text-xs text-muted-foreground'>Approval Status</Label>
                  <div className='flex items-center justify-between'>
                    <div className='flex items-center gap-2'>
                      <Badge
                        variant='outline'
                        className={cn('font-normal', getApprovalStatusColor(approvalStatus))}
                      >
                        {getApprovalStatusText(approvalStatus)}
                      </Badge>

                      {approvalStatus === 'approved' && module.approvedBy && (
                        <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                          <Clock className='h-3 w-3' />
                          <span>{module.approvedBy.time || 'Unknown time'}</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Action Buttons */}
            <div className='space-y-3'>
              {approvalStatus === 'not_requested' && (
                <Button className='w-full justify-start gap-2'>
                  <Send className='h-4 w-4' />
                  Request Approval
                </Button>
              )}

              {approvalStatus === 'pending' && (
                <Button className='w-full justify-start gap-2'>
                  <RefreshCw className='h-4 w-4' />
                  Resend Approval Request
                </Button>
              )}

              {(approvalStatus === 'approved' || approvalStatus === 'rejected') && (
                <Button className='w-full justify-start gap-2'>
                  <RefreshCw className='h-4 w-4' />
                  Request New Approval
                </Button>
              )}

              {moduleType === 'file' && (
                <Button variant='outline' className='w-full justify-start gap-2'>
                  <Upload className='h-4 w-4' />
                  Replace File
                </Button>
              )}

              {moduleType === 'template' && (
                <Button variant='outline' className='w-full justify-start gap-2'>
                  <Edit className='h-4 w-4' />
                  Edit Form Response
                </Button>
              )}

              <Button variant='outline' className='w-full justify-start gap-2'>
                <Copy className='h-4 w-4' />
                Duplicate Module
              </Button>

              <Button variant='outline' className='w-full justify-start gap-2 text-red-600'>
                <Trash className='h-4 w-4' />
                Delete Module
              </Button>
            </div>
          </div>

          {/* Activity Log */}
          <div className='mt-auto pt-6'>
            <Separator className='mb-4' />
            <div className='text-xs text-muted-foreground space-y-2'>
              <div className='flex items-center gap-1'>
                <Clock className='h-3 w-3' />
                <span>Last updated {module.updatedAt}</span>
              </div>
              {approvalStatus === 'pending' && (
                <div className='flex items-center gap-1'>
                  <Send className='h-3 w-3' />
                  <span>{module.createdBy?.name} sent for approval 2 days ago</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Panel - Module Content Preview */}
        <div className='w-[65%] h-full flex flex-col'>
          {/* Tabs */}
          <div className='border-b'>
            <Tabs
              defaultValue='preview'
              className='w-full'
              onValueChange={(value) => {
                setActiveTab(value as any);
              }}
            >
              <div className='px-6 pt-4'>
                <TabsList className='grid w-[300px] grid-cols-3'>
                  <TabsTrigger value='preview'>Preview</TabsTrigger>
                  <TabsTrigger value='history'>History</TabsTrigger>
                  <TabsTrigger value='comments'>Comments</TabsTrigger>
                </TabsList>
              </div>
            </Tabs>
          </div>

          {/* Content Area */}
          <div className='flex-1 overflow-y-auto bg-gray-50 p-6'>
            {activeTab === 'preview' && (
              <>
                {/* File Preview */}
                {moduleType === 'file' && (
                  <div className='space-y-6'>
                    <div className='bg-white rounded-lg border shadow-sm overflow-hidden'>
                      {fileDetails.previewUrl ? (
                        <div className='flex justify-center p-6'>
                          <img
                            src={fileDetails.previewUrl || '/placeholder.svg'}
                            alt={module.name}
                            className='object-contain max-h-[400px]'
                          />
                        </div>
                      ) : (
                        <div className='flex items-center justify-center h-[300px] w-full'>
                          <FileText className='h-24 w-24 text-muted-foreground' />
                        </div>
                      )}
                    </div>

                    <div className='bg-white rounded-lg border shadow-sm p-4'>
                      <div className='grid grid-cols-2 gap-4 text-sm'>
                        <div>
                          <Label className='text-xs text-muted-foreground'>File Name</Label>
                          <p className='font-medium'>{module.name}</p>
                        </div>
                        <div>
                          <Label className='text-xs text-muted-foreground'>File Type</Label>
                          <p className='font-medium'>{fileDetails.type || 'Unknown'}</p>
                        </div>
                        <div>
                          <Label className='text-xs text-muted-foreground'>File Size</Label>
                          <p className='font-medium'>{fileDetails.size || 'Unknown'}</p>
                        </div>
                        <div>
                          <Label className='text-xs text-muted-foreground'>Upload Date</Label>
                          <p className='font-medium'>{module.createdAt || 'Unknown'}</p>
                        </div>
                      </div>
                    </div>

                    <div className='flex gap-3'>
                      <Button className='gap-2'>
                        <Download className='h-4 w-4' />
                        Download
                      </Button>
                      <Button variant='outline' className='gap-2'>
                        <ExternalLink className='h-4 w-4' />
                        View Fullscreen
                      </Button>
                    </div>
                  </div>
                )}

                {/* Template Preview */}
                {moduleType === 'template' && (
                  <div className='space-y-8'>
                    {templateDetails.sections.map((section, sectionIndex) => {
                      return (
                        <div key={sectionIndex} className='space-y-4'>
                          <h3 className='font-medium text-sm uppercase tracking-wide text-muted-foreground'>
                            {section.title || 'Untitled Section'}
                          </h3>
                          <div className='space-y-4'>
                            {section.questions.map((item, itemIndex) => {
                              return (
                                <div
                                  key={itemIndex}
                                  className='bg-white p-4 rounded-lg border shadow-sm'
                                >
                                  <Label className='font-medium'>
                                    {item.question || 'Untitled Question'}
                                  </Label>
                                  <div className='mt-2 p-3 bg-gray-50 border rounded-md'>
                                    <p>{item.answer || 'No answer provided'}</p>
                                  </div>
                                  <div className='mt-2 flex justify-end'>
                                    <Button variant='ghost' size='sm' className='h-7 text-xs gap-1'>
                                      <Edit className='h-3 w-3' />
                                      Add Comment
                                    </Button>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </>
            )}

            {activeTab === 'history' && (
              <div className='space-y-4'>
                <h3 className='font-medium'>Version History</h3>
                <div className='space-y-3'>
                  {Array.from({ length: totalVersions }, (_, i) => {
                    return (
                      <div
                        key={i}
                        className={cn(
                          'flex items-center justify-between p-4 rounded-lg border',
                          selectedVersion === i + 1
                            ? 'bg-white border-primary'
                            : 'bg-white hover:border-muted-foreground/20',
                        )}
                      >
                        <div className='space-y-1'>
                          <div className='flex items-center gap-2'>
                            <span className='font-medium'>Version {i + 1}</span>
                            {currentVersion === i + 1 && (
                              <Badge
                                variant='outline'
                                className='bg-green-100 text-green-800 hover:bg-green-100'
                              >
                                Current
                              </Badge>
                            )}
                          </div>
                          <div className='text-sm text-muted-foreground'>
                            Updated on {new Date(Date.now() - i * 86400000).toLocaleDateString()} by{' '}
                            {module.createdBy?.name || 'Unknown User'}
                          </div>
                          {i < totalVersions - 1 && (
                            <div className='text-xs text-muted-foreground mt-2'>
                              <span className='text-primary'>Changes:</span> Updated logo size,
                              adjusted colors
                            </div>
                          )}
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            size='sm'
                            variant={selectedVersion === i + 1 ? 'default' : 'outline'}
                            onClick={() => {
                              setSelectedVersion(i + 1);
                            }}
                          >
                            View
                          </Button>
                          {currentVersion !== i + 1 && selectedVersion === i + 1 && (
                            <Button size='sm' variant='outline'>
                              Restore
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className='space-y-4'>
                <h3 className='font-medium'>Comments & Feedback</h3>

                {approvalStatus === 'rejected' ? (
                  <div className='bg-white rounded-lg border shadow-sm p-4 space-y-3'>
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-8 w-8'>
                        <AvatarImage src='/placeholder.svg' alt='Client' />
                        <AvatarFallback>CL</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className='text-sm font-medium'>Client Name</p>
                        <p className='text-xs text-muted-foreground'>April 2, 2025</p>
                      </div>
                      <Badge
                        variant='outline'
                        className='ml-auto bg-red-100 text-red-800 hover:bg-red-100'
                      >
                        Rejected
                      </Badge>
                    </div>
                    <div className='p-3 bg-red-50 border border-red-100 rounded-md'>
                      <p className='text-sm'>
                        The logo needs to be larger and the colors don&apos;t match our brand
                        guidelines. Please adjust according to the style guide we provided earlier.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className='bg-white rounded-lg border shadow-sm p-4 flex items-center justify-center h-[200px]'>
                    <div className='text-center text-muted-foreground'>
                      <p>No comments yet</p>
                      <p className='text-sm'>Comments will appear here when feedback is provided</p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
