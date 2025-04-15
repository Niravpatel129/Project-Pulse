'use client';

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip';
import { VisuallyHidden } from '@/components/ui/visually-hidden';
import { useProject } from '@/contexts/ProjectContext';
import { useApproverDialog } from '@/hooks/useApproverDialog';
import { useModuleDialog } from '@/hooks/useModuleDialog';
import { cn } from '@/lib/utils';
import { format, formatDistanceToNow } from 'date-fns';
import { AnimatePresence, motion } from 'framer-motion';
import {
  Ban,
  Check,
  Clock,
  Download,
  Edit,
  ExternalLink,
  Eye,
  Figma,
  FileText,
  HelpCircle,
  MoreHorizontal,
  RefreshCw,
  Send,
  Trash,
  Undo,
  Upload,
} from 'lucide-react';
import Image from 'next/image';
import { useState } from 'react';
import EditModuleFromTemplateSheet from '../FileComponents/EditModuleFromTemplateSheet';
import FigmaManagerModal from '../FileComponents/FigmaManagerModal';
import FileUploadManagerModal from '../FileComponents/FileUploadManagerModal';
import { ApproverDialog } from './ApproverDialog';

interface ModuleDialogProps {
  moduleId: string;
  onOpenChange: (open: boolean) => void;
}

const ApprovalBanner = ({
  approvalDetails,
  onApprove,
  onReject,
  onDelete,
}: {
  approvalDetails: any[];
  onApprove: (approvalId: string) => void;
  onReject: (approvalId: string) => void;
  onDelete: (approvalId: string) => void;
}) => {
  console.log('🚀 approvalDetails:', approvalDetails);
  if (!approvalDetails?.length) return null;

  return (
    <div className='mb-4 space-y-3'>
      <h3 className='text-sm font-medium text-muted-foreground'>Approval Request</h3>
      <div className='space-y-2'>
        {approvalDetails.map((approval) => {
          const status = approval.status;
          const isStatusPending = status === 'pending';
          const isStatusApproved = status === 'approved';

          let statusColor = 'gray';
          let statusText = 'Canceled';
          let statusIcon = <Ban className='h-3 w-3 mr-1' />;

          if (isStatusPending) {
            statusColor = 'yellow';
            statusText = 'Pending';
            statusIcon = <Clock className='h-3 w-3 mr-1' />;
          } else if (isStatusApproved) {
            statusColor = 'green';
            statusText = 'Approved';
            statusIcon = <Check className='h-3 w-3 mr-1' />;
          }

          return (
            <Card
              key={approval._id}
              className={` relative border-l-4 border-l-${statusColor}-500 group`}
            >
              <CardContent className='p-4 '>
                <div className='flex items-start justify-between'>
                  <div className='space-y-1'>
                    <div className='flex items-center gap-2'>
                      <Avatar className='h-6 w-6'>
                        <AvatarImage
                          src={approval.requestedBy.avatar}
                          alt={approval.requestedBy.name}
                        />
                        <AvatarFallback>{approval.requestedBy.name[0]}</AvatarFallback>
                      </Avatar>
                      <span className='text-sm font-medium'>{approval.requestedBy.name}</span>
                      <Badge
                        variant='outline'
                        className={`bg-${statusColor}-100 text-${statusColor}-800 border-${statusColor}-200`}
                      >
                        {statusIcon}
                        {statusText}
                      </Badge>
                    </div>
                    <p className='text-sm text-muted-foreground'>
                      {approval.moduleDetails.name} (version {approval.moduleDetails.version})
                    </p>
                    <p className='text-xs text-muted-foreground'>
                      Sent to {approval.approverEmail} •{' '}
                      {format(new Date(approval.createdAt), 'MMM d, yyyy')}
                    </p>
                  </div>
                  <div className='opacity-0 group-hover:opacity-100 transition-opacity absolute right-2 top-2'>
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant='ghost' size='icon' className='h-8 w-8'>
                          <MoreHorizontal className='h-4 w-4' />
                          <span className='sr-only'>Open actions menu</span>
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className='w-48 p-2'>
                        <div className='flex flex-col space-y-1'>
                          {isStatusPending && (
                            <Button
                              variant='ghost'
                              size='sm'
                              className='justify-start'
                              onClick={() => {
                                return onApprove(approval._id);
                              }}
                            >
                              <Check className='h-4 w-4 mr-2' />
                              Approve
                            </Button>
                          )}
                          {isStatusPending && (
                            <Button
                              variant='ghost'
                              size='sm'
                              className='justify-start'
                              onClick={() => {
                                return onApprove(approval._id);
                              }}
                            >
                              <Check className='h-4 w-4 mr-2' />
                              Reject
                            </Button>
                          )}
                          <Button
                            variant='ghost'
                            size='sm'
                            className='justify-start text-destructive'
                            onClick={() => {
                              return onDelete(approval._id);
                            }}
                          >
                            <Ban className='h-4 w-4 mr-2' />
                            Delete Request
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
};

export default function ModuleDialog({ moduleId, onOpenChange }: ModuleDialogProps) {
  const [showDeleteDialog, setShowDeleteDialog] = useState(false);
  const [showEditSheet, setShowEditSheet] = useState(false);
  const [showFileUploadManager, setShowFileUploadManager] = useState(false);
  const [showFigmaManager, setShowFigmaManager] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const {
    module,
    isLoading,
    activeTab,
    setActiveTab,
    selectedVersion,
    setSelectedVersion,
    moduleStatus,
    setModuleStatus,
    updateStatusMutation,
    deleteModuleMutation,
    replaceFileMutation,
    replaceFigmaMutation,
    restoreVersionMutation,
    getApprovalStatusColor,
    getApprovalStatusText,
    getModuleTypeLabel,
    getModuleTypeColor,
    approvalDetails,
    isLoadingApprovalDetails,
    approveApprovalMutation,
    rejectApprovalMutation,
    deleteApprovalMutation,
  } = useModuleDialog({ moduleId });
  const { project } = useProject();

  const {
    isOpen: showApproverDialog,
    setIsOpen: setShowApproverDialog,
    selectedApprovers,
    setSelectedApprovers,
    manualEmail,
    setManualEmail,
    requestApprovalMutation,
    handleAddCustomEmail,
    handleRemoveApprover,
  } = useApproverDialog({
    moduleId,
    moduleDetails: {
      name: module?.name || 'Untitled',
      version: module?.currentVersion || 1,
      updatedAt: module?.updatedAt || '5 min ago',
      fileType: module?.fileType,
    },
  });

  // Get approvers from project participants
  const approvers =
    project?.participants.map((c) => {
      return {
        id: c._id,
        name: c.name,
        email: c.email!,
        avatar: c.avatar,
        isProjectParticipant: true,
      };
    }) || [];

  const handleDelete = async () => {
    try {
      await deleteModuleMutation.mutateAsync();
      setShowDeleteDialog(false);
      onOpenChange(false);
    } catch (error) {}
  };

  const handleViewVersion = (versionNumber: number) => {
    setSelectedVersion(versionNumber);
    setActiveTab('preview');
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  const totalVersions = module?.versions?.length || 1;
  const currentVersion = module?.currentVersion || 1;
  const moduleType = module?.moduleType || 'file';
  const approvalStatus = module?.approvalStatus || 'not_requested';
  const selectedVersionData = module?.versions?.[selectedVersion - 1];
  const fileDetails = {
    size:
      selectedVersionData?.contentSnapshot?.fileId?.size ||
      module?.content?.fileId?.size ||
      'Unknown',
    type:
      selectedVersionData?.contentSnapshot?.fileId?.contentType ||
      module?.content?.fileId?.contentType ||
      'Unknown',
    url:
      selectedVersionData?.contentSnapshot?.fileId?.downloadURL ||
      module?.content?.fileId?.downloadURL ||
      '',
    previewUrl:
      selectedVersionData?.contentSnapshot?.fileId?.downloadURL ||
      module?.content?.fileId?.downloadURL ||
      '/placeholder.svg',
  };

  const figmaDetails = {
    url: selectedVersionData?.contentSnapshot?.figmaUrl || module?.content?.figmaUrl || '',
  };

  const templateDetails =
    selectedVersionData?.contentSnapshot?.sections || module?.contentSnapshot?.sections || [];

  console.log('🚀 templateDetails:', templateDetails);
  console.log('🚀 selectedVersionData:', selectedVersionData);

  const handleReplaceFigma = async (figmaFile: any) => {
    try {
      await replaceFigmaMutation.mutateAsync(figmaFile._id);
      setShowFigmaManager(false);
    } catch (error) {
      console.error('Failed to replace Figma file:', error);
    }
  };

  return (
    <>
      <Dialog
        open={!!module}
        onOpenChange={(open) => {
          onOpenChange(open);
          if (open) {
            setActiveTab('preview');
          }
        }}
      >
        <DialogContent
          className={cn(
            'p-0 h-[90vh] max-h-[1000px] overflow-hidden flex flex-col md:flex-row gap-0',
            isFullscreen ? 'max-w-[100vw] h-[100vh] max-h-[100vh]' : 'max-w-[1100px]',
          )}
        >
          <VisuallyHidden>
            <DialogTitle>Module Details</DialogTitle>
          </VisuallyHidden>
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
            className='w-full md:w-[35%] border-b md:border-b-0 md:border-r p-4 md:p-6 flex flex-col h-auto md:h-full overflow-y-auto'
          >
            <div className='space-y-4 md:space-y-6'>
              {/* Module Name and Status */}
              <div className='space-y-2'>
                <div className='flex items-center justify-between'>
                  <h2 className='text-lg md:text-xl font-semibold'>
                    {module?.name || 'Untitled Module'}
                  </h2>
                </div>
                {/* Status Badge and Module Type */}
                <div className='flex items-center justify-between'>
                  <Badge
                    variant='outline'
                    className={cn('font-normal', getModuleTypeColor(moduleType))}
                  >
                    {getModuleTypeLabel(moduleType)}
                  </Badge>
                </div>
              </div>

              <h3 className='text-sm font-medium text-muted-foreground'>Module Details</h3>
              <Card className='border-muted !mt-2'>
                <CardContent className='p-3 md:p-4 pt-0 mt-0'>
                  {/* Added By */}
                  <div className='flex items-center gap-3'>
                    <Avatar className='h-8 w-8'>
                      <AvatarImage
                        src={module?.addedBy?.avatar || '/placeholder.svg'}
                        alt={module?.addedBy?.name || 'User'}
                      />
                      <AvatarFallback>{module?.addedBy?.name?.charAt(0) || 'U'}</AvatarFallback>
                    </Avatar>
                    <div>
                      <p className='text-sm font-medium'>
                        {module?.addedBy?.name || 'Unknown User'}
                      </p>
                      <p className='text-xs text-muted-foreground'>
                        Added{' '}
                        {module?.createdAt
                          ? formatDistanceToNow(new Date(module?.createdAt), { addSuffix: true })
                          : 'Unknown date'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Action Buttons */}
              <div className='space-y-2 md:space-y-3'>
                {approvalStatus === 'not_requested' && !approvalDetails?.length && (
                  <Button
                    className='w-full justify-start gap-2'
                    onClick={() => {
                      return setShowApproverDialog(true);
                    }}
                  >
                    <Send className='h-4 w-4' />
                    Request Approval
                  </Button>
                )}

                {/* Approval Banner */}
                {approvalDetails && (
                  <ApprovalBanner
                    approvalDetails={approvalDetails}
                    onApprove={approveApprovalMutation.mutate}
                    onReject={rejectApprovalMutation.mutate}
                    onDelete={deleteApprovalMutation.mutate}
                  />
                )}
                {approvalDetails?.length > 0 && (
                  <Button
                    className='w-full justify-start gap-2'
                    onClick={() => {
                      setShowApproverDialog(true);
                    }}
                  >
                    <Eye className='h-4 w-4' />
                    View Approval Details
                  </Button>
                )}

                {approvalStatus === 'pending' && (
                  <Button
                    className='w-full justify-start gap-2'
                    onClick={() => {
                      return setShowApproverDialog(true);
                    }}
                  >
                    <RefreshCw className='h-4 w-4' />
                    Resend Approval Request
                  </Button>
                )}

                {(approvalStatus === 'approved' || approvalStatus === 'rejected') && (
                  <Button
                    className='w-full justify-start gap-2'
                    onClick={() => {
                      return setShowApproverDialog(true);
                    }}
                  >
                    <RefreshCw className='h-4 w-4' />
                    Request New Approval
                  </Button>
                )}

                {moduleType === 'figma' && (
                  <Button
                    variant='outline'
                    className='w-full justify-start gap-2'
                    onClick={() => {
                      setShowFigmaManager(true);
                    }}
                  >
                    <Upload className='h-4 w-4' />
                    Replace Figma File
                  </Button>
                )}

                {moduleType === 'file' && (
                  <Button
                    variant='outline'
                    className='w-full justify-start gap-2'
                    onClick={() => {
                      setShowFileUploadManager(true);
                    }}
                  >
                    <Upload className='h-4 w-4' />
                    Replace File
                  </Button>
                )}

                {moduleType === 'template' && (
                  <Button
                    variant='outline'
                    className='w-full justify-start gap-2'
                    onClick={() => {
                      return setShowEditSheet(true);
                    }}
                  >
                    <Edit className='h-4 w-4' />
                    Edit
                  </Button>
                )}

                <Button
                  variant='outline'
                  className='w-full justify-start gap-2 text-red-600'
                  onClick={() => {
                    return setShowDeleteDialog(true);
                  }}
                >
                  <Trash className='h-4 w-4' />
                  Delete Module
                </Button>
              </div>
            </div>

            {/* Activity Log */}
            <div className='mt-auto pt-4 md:pt-6 hidden md:block'>
              <Separator className='mb-4' />
              <div className='text-xs text-muted-foreground space-y-2'>
                <div className='flex items-center gap-1'>
                  <Clock className='h-3 w-3' />
                  <span>
                    Last updated{' '}
                    {module?.updatedAt
                      ? formatDistanceToNow(new Date(module?.updatedAt), { addSuffix: true })
                      : 'Unknown date'}
                  </span>
                </div>
                {approvalStatus === 'pending' && (
                  <div className='flex items-center gap-1'>
                    <Send className='h-3 w-3' />
                    <span>{module?.addedBy?.name} sent for approval 2 days ago</span>
                  </div>
                )}
              </div>
            </div>
          </motion.div>

          {/* Right Panel - Module Content Preview */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            transition={{ duration: 0.2 }}
            className='w-full md:w-[65%] h-full flex flex-col'
          >
            {/* Version Indicator Bar */}
            <AnimatePresence mode='wait'>
              {selectedVersion !== currentVersion && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className='bg-yellow-50 border-b border-yellow-200 p-2 md:p-3 flex flex-col md:flex-row items-start md:items-center justify-between'
                >
                  <div className='flex items-center gap-2 mb-2 md:mb-0'>
                    <span className='text-sm font-medium text-yellow-800'>
                      Viewing Version {selectedVersion}
                    </span>
                    <Badge variant='outline' className='bg-yellow-100 text-yellow-800'>
                      Historical
                    </Badge>
                  </div>
                  <div className='flex items-center gap-2 w-full md:w-auto'>
                    <Button
                      size='sm'
                      variant='outline'
                      className='md:flex-none'
                      onClick={() => {
                        handleViewVersion(currentVersion);
                      }}
                    >
                      <Undo className='h-3 w-3 mr-1 md:mr-0' />
                      <span className='md:hidden'>Back to Current</span>
                    </Button>
                    <Button
                      size='sm'
                      variant='outline'
                      className='flex-1 md:flex-none'
                      onClick={() => {
                        restoreVersionMutation.mutate(selectedVersion);
                      }}
                    >
                      Restore this version
                    </Button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* Tabs */}
            <div className='border-b'>
              <Tabs
                value={activeTab}
                className='w-full'
                onValueChange={(value) => {
                  setActiveTab(value as any);
                }}
              >
                <div className='px-4 pl-0 md:px-6 pt-3 md:pt-4 pb-4'>
                  <TabsList className='grid w-full md:w-[300px] grid-cols-3'>
                    <TabsTrigger value='preview'>Preview</TabsTrigger>
                    <TabsTrigger value='history'>History</TabsTrigger>
                    <TabsTrigger value='comments'>Comments</TabsTrigger>
                  </TabsList>
                </div>
              </Tabs>
            </div>

            {/* Content Area */}
            <div className='flex-1 overflow-y-auto bg-gray-50 p-4 md:p-6'>
              <AnimatePresence mode='wait'>
                <motion.div
                  key={activeTab}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: 10 }}
                  transition={{ duration: 0.2 }}
                >
                  {activeTab === 'preview' && (
                    <>
                      {/* File Preview */}
                      {moduleType === 'file' && (
                        <div className='space-y-4 md:space-y-6'>
                          <div className='bg-white rounded-lg border shadow-sm overflow-hidden'>
                            {fileDetails.previewUrl ? (
                              <div className='flex justify-center p-4 md:p-6'>
                                <Image
                                  src={fileDetails.previewUrl || '/placeholder.svg'}
                                  alt={module?.name}
                                  className='object-contain max-h-[250px] md:max-h-[350px]'
                                  width={1000}
                                  height={1000}
                                />
                              </div>
                            ) : (
                              <div className='flex items-center justify-center h-[200px] md:h-[300px] w-full'>
                                <FileText className='h-16 md:h-24 w-16 md:w-24 text-muted-foreground' />
                              </div>
                            )}
                          </div>

                          <div className='bg-white rounded-lg border shadow-sm p-3 md:p-4'>
                            <div className='grid grid-cols-1 sm:grid-cols-2 gap-3 md:gap-4 text-sm'>
                              <div>
                                <Label className='text-xs text-muted-foreground'>File Name</Label>
                                <p className='font-medium'>{module?.name}</p>
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
                                <p className='font-medium'>{module?.createdAt || 'Unknown'}</p>
                              </div>
                            </div>
                          </div>

                          <div className='flex flex-col sm:flex-row gap-2 md:gap-3'>
                            <Button className='gap-2 w-full sm:w-auto'>
                              <Download className='h-4 w-4' />
                              Download
                            </Button>
                            <Button
                              variant='outline'
                              className='gap-2 w-full sm:w-auto'
                              onClick={handleFullscreen}
                            >
                              <ExternalLink className='h-4 w-4' />
                              {isFullscreen ? 'Exit Fullscreen' : 'View Fullscreen'}
                            </Button>
                          </div>
                        </div>
                      )}

                      {/* Figma Preview */}
                      {moduleType === 'figma' && (
                        <div className='space-y-4 md:space-y-6'>
                          <div className='bg-white rounded-lg border shadow-sm overflow-hidden'>
                            {figmaDetails.url ? (
                              <div className='flex flex-col'>
                                <div className='relative w-full aspect-video'>
                                  <iframe
                                    src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(
                                      figmaDetails.url,
                                    )}`}
                                    className='w-full h-full'
                                    allowFullScreen
                                    title={`Figma Preview - ${module?.name}`}
                                  />
                                </div>
                                <div className='p-4 space-y-2'>
                                  <div className='flex items-center justify-between'>
                                    {/* <h3 className='text-lg font-medium'>{module?.name}</h3> */}
                                    <Button
                                      variant='outline'
                                      size='sm'
                                      className='gap-2'
                                      onClick={() => {
                                        return window.open(figmaDetails.url, '_blank');
                                      }}
                                    >
                                      <ExternalLink className='h-4 w-4' />
                                      Open in Figma
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <div className='flex flex-col items-center justify-center p-8 text-center'>
                                <div className='bg-muted rounded-full p-4 mb-4'>
                                  <Figma className='h-8 w-8 text-muted-foreground' />
                                </div>
                                <h3 className='text-lg font-medium mb-2'>
                                  No Figma Preview Available
                                </h3>
                                <p className='text-sm text-muted-foreground'>
                                  The Figma file URL is not available for this version.
                                </p>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {/* Template Preview */}
                      {moduleType === 'template' && (
                        <div className='space-y-6 md:space-y-8'>
                          {templateDetails.map((section) => {
                            return (
                              <div
                                key={section.sectionId}
                                className='bg-white rounded-lg border shadow-sm p-4 md:p-6'
                              >
                                <div className='space-y-4 md:space-y-6'>
                                  <div>
                                    <Label className='text-xs text-muted-foreground flex items-center gap-1 mb-1'>
                                      {section.templateName}
                                      {section.templateDescription && (
                                        <Tooltip>
                                          <TooltipTrigger asChild>
                                            <Button
                                              variant='ghost'
                                              className='h-2 w-2 p-0 ml-1 inline-flex items-center justify-center'
                                            >
                                              <HelpCircle className='h-4 w-4 text-muted-foreground' />
                                              <span className='sr-only'>Template description</span>
                                            </Button>
                                          </TooltipTrigger>
                                          <TooltipContent>
                                            {section.templateDescription}
                                          </TooltipContent>
                                        </Tooltip>
                                      )}
                                    </Label>
                                  </div>
                                  <div>
                                    <div className='mt-3 space-y-3 md:space-y-4'>
                                      {section.fields.map((field) => {
                                        return (
                                          <div
                                            key={field.templateFieldId}
                                            className='bg-gray-50 p-3 md:p-4 rounded-lg border'
                                          >
                                            <div className='flex flex-col sm:flex-row sm:items-center sm:justify-between'>
                                              <div>
                                                <p className='font-medium'>{field.fieldName}</p>
                                                <div className='flex flex-wrap items-center gap-1 md:gap-2 mt-1'>
                                                  <Badge variant='outline' className='text-xs'>
                                                    {field.fieldType}
                                                  </Badge>
                                                  {field.isRequired && (
                                                    <Badge
                                                      variant='outline'
                                                      className='text-xs bg-red-50 text-red-700'
                                                    >
                                                      Required
                                                    </Badge>
                                                  )}
                                                  {field.multiple && (
                                                    <Badge
                                                      variant='outline'
                                                      className='text-xs bg-blue-50 text-blue-700'
                                                    >
                                                      Multiple
                                                    </Badge>
                                                  )}
                                                </div>
                                                {field.description && (
                                                  <p className='text-xs text-muted-foreground mt-1'>
                                                    {field.description}
                                                  </p>
                                                )}
                                              </div>
                                            </div>
                                            <div className='mt-2'>
                                              <Label className='text-xs text-muted-foreground'>
                                                Response
                                              </Label>
                                              <div className='mt-1'>
                                                {field.fieldType === 'relation' ? (
                                                  <div className='bg-white p-2 rounded border'>
                                                    {field.fieldValue?.displayValues ? (
                                                      Object.entries(
                                                        field.fieldValue.displayValues,
                                                      ).map(([key, value]) => {
                                                        return (
                                                          <div key={key} className='flex gap-2'>
                                                            <span className='text-xs font-medium'>
                                                              {key}:
                                                            </span>
                                                            <span className='text-xs'>
                                                              {value as string}
                                                            </span>
                                                          </div>
                                                        );
                                                      })
                                                    ) : (
                                                      <span className='text-xs text-muted-foreground'>
                                                        No relation data
                                                      </span>
                                                    )}
                                                  </div>
                                                ) : field.fieldType === 'longtext' ? (
                                                  <div className='bg-white p-2 rounded border max-h-32 overflow-y-auto'>
                                                    <span className='text-sm whitespace-pre-wrap'>
                                                      {field.fieldValue || 'No response'}
                                                    </span>
                                                  </div>
                                                ) : Array.isArray(field.fieldValue) ? (
                                                  <div className='bg-white p-2 rounded border'>
                                                    {field.fieldValue.length > 0 ? (
                                                      field.fieldValue.map((value, idx) => {
                                                        return (
                                                          <div
                                                            key={idx}
                                                            className='text-sm mb-1 last:mb-0'
                                                          >
                                                            {value}
                                                          </div>
                                                        );
                                                      })
                                                    ) : (
                                                      <span className='text-xs text-muted-foreground'>
                                                        No values selected
                                                      </span>
                                                    )}
                                                  </div>
                                                ) : (
                                                  <div className='bg-white p-2 rounded border'>
                                                    {field.fieldValue ? (
                                                      <span className='text-sm'>
                                                        {field.fieldValue}
                                                      </span>
                                                    ) : (
                                                      <span className='text-xs text-muted-foreground'>
                                                        No response
                                                      </span>
                                                    )}
                                                  </div>
                                                )}
                                              </div>
                                            </div>
                                          </div>
                                        );
                                      })}
                                    </div>
                                  </div>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      )}
                    </>
                  )}

                  {activeTab === 'history' && (
                    <div className='space-y-3 md:space-y-4'>
                      <h3 className='font-medium'>Version History</h3>
                      <div className='space-y-2 md:space-y-3'>
                        {Array.from({ length: totalVersions }, (_, i) => {
                          return totalVersions - i - 1;
                        }).map((i) => {
                          const version = module.versions?.[i];
                          const isCurrentVersion = currentVersion === i + 1;
                          const isSelectedVersion = selectedVersion === i + 1;

                          return (
                            <div
                              key={i}
                              className={cn(
                                'flex flex-col sm:flex-row sm:items-center justify-between p-3 md:p-4 rounded-lg border',
                                isSelectedVersion
                                  ? 'bg-white border-primary'
                                  : 'bg-white hover:border-muted-foreground/20',
                              )}
                            >
                              <div className='space-y-1 mb-2 sm:mb-0'>
                                <div className='flex items-center gap-2'>
                                  <span className='font-medium'>Version {i + 1}</span>
                                  {isCurrentVersion && (
                                    <Badge
                                      variant='outline'
                                      className='bg-green-100 text-green-800 hover:bg-green-100'
                                    >
                                      Current
                                    </Badge>
                                  )}
                                </div>
                                <div className='text-sm text-muted-foreground'>
                                  Updated on{' '}
                                  {version?.updatedAt
                                    ? new Date(version.updatedAt).toLocaleDateString()
                                    : 'Unknown date'}{' '}
                                  by {version?.updatedBy?.name || 'Unknown User'}
                                </div>
                              </div>
                              <div className='flex gap-2'>
                                <Button
                                  size='sm'
                                  variant={isSelectedVersion ? 'default' : 'outline'}
                                  onClick={() => {
                                    handleViewVersion(i + 1);
                                    setActiveTab('preview');
                                  }}
                                  disabled={isSelectedVersion}
                                  className='w-full sm:w-auto'
                                >
                                  {isSelectedVersion ? 'Viewing' : 'View'}
                                </Button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {activeTab === 'comments' && (
                    <div className='space-y-3 md:space-y-4'>
                      <h3 className='font-medium'>Comments & Feedback</h3>

                      {approvalStatus === 'rejected' ? (
                        <div className='bg-white rounded-lg border shadow-sm p-3 md:p-4 space-y-3'>
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
                              guidelines. Please adjust according to the style guide we provided
                              earlier.
                            </p>
                          </div>
                        </div>
                      ) : (
                        <div className='bg-white rounded-lg border shadow-sm p-4 flex items-center justify-center h-[150px] md:h-[200px]'>
                          <div className='text-center text-muted-foreground'>
                            <p>No comments yet</p>
                            <p className='text-sm'>
                              Comments will appear here when feedback is provided
                            </p>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </motion.div>
              </AnimatePresence>
            </div>
          </motion.div>
        </DialogContent>
      </Dialog>

      <AlertDialog open={showDeleteDialog} onOpenChange={setShowDeleteDialog}>
        <AlertDialogContent>
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete the module and all its
                associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={handleDelete}
                className='bg-red-600 hover:bg-red-700 focus:ring-red-600'
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </motion.div>
        </AlertDialogContent>
      </AlertDialog>

      {moduleType === 'template' && (
        <EditModuleFromTemplateSheet
          isOpen={showEditSheet}
          onClose={() => {
            return setShowEditSheet(false);
          }}
          template={module.content?.templateId}
          moduleId={moduleId}
          initialData={{
            name: module?.name,
            fields: module?.versions?.[currentVersion - 1]?.contentSnapshot?.fields || [],
          }}
        />
      )}

      <FileUploadManagerModal
        isOpen={showFileUploadManager}
        onClose={() => {
          return setShowFileUploadManager(false);
        }}
        handleAddFileToProject={(file) => {
          replaceFileMutation.mutate(file._id);
          setShowFileUploadManager(false);
        }}
      />

      <FigmaManagerModal
        isOpen={showFigmaManager}
        onClose={() => {
          return setShowFigmaManager(false);
        }}
        handleAddFigmaToProject={handleReplaceFigma}
        isReplacing={true}
      />

      {/* Approver Dialog */}
      <ApproverDialog
        onDelete={deleteApprovalMutation.mutate}
        approvalId={approvalDetails?.[0]?._id}
        isOpen={showApproverDialog}
        status={approvalDetails?.[0]?.status}
        onClose={() => {
          setShowApproverDialog(false);
          setSelectedApprovers([]);
          setManualEmail('');
        }}
        potentialApprovers={approvers}
        selectedApprovers={
          approvalDetails?.length > 0
            ? approvalDetails.map((approval) => {
                return {
                  name: approval.requestedBy.name,
                  email: approval.approverEmail,
                  avatar: approval.requestedBy.avatar,
                  isProjectParticipant: true,
                };
              })
            : selectedApprovers
        }
        onSelectApprover={(approver) => {
          if (
            !selectedApprovers.some((a) => {
              return a.email === approver.email;
            })
          ) {
            setSelectedApprovers((prev) => {
              return [...prev, approver];
            });
          }
        }}
        onRemoveApprover={handleRemoveApprover}
        manualEmail={manualEmail}
        onManualEmailChange={setManualEmail}
        onAddManualEmail={handleAddCustomEmail}
        onRequestApproval={() => {
          return requestApprovalMutation.mutate();
        }}
        isLoading={requestApprovalMutation.isPending}
        isPreview={approvalDetails?.length > 0}
        moduleDetails={{
          name: module?.name,
          version: module?.currentVersion,
          updatedAt: module?.updatedAt,
          fileType: module?.fileType,
        }}
        previewMessage={approvalDetails?.[0]?.message || ''}
      />
    </>
  );
}
