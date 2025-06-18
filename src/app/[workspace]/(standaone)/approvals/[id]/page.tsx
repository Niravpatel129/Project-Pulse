'use client';

import FilePreview from '@/components/ProjectPage/ProjectModules/FilePreview';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Skeleton } from '@/components/ui/skeleton';
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import {
  Timeline,
  TimelineContent,
  TimelineDate,
  TimelineHeader,
  TimelineIndicator,
  TimelineItem,
  TimelineSeparator,
  TimelineTitle,
} from '@/components/ui/timeline';
import { useApprovalRequest } from '@/hooks/useApprovalRequest';
import { motion } from 'framer-motion';
import {
  CheckCircle,
  Download,
  ExternalLink,
  Eye,
  Figma,
  FileImage,
  FileText,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';

interface User {
  _id: string;
  name: string;
  email: string;
  avatar: string | null;
}

interface FileData {
  _id: string;
  name: string;
  originalName: string;
  downloadURL: string;
  contentType: string;
  size: number;
  updatedAt?: string;
}

interface ContentSnapshot {
  fileId: FileData;
  fileName?: string;
  fileSize?: number;
  fields: any[];
  sections?: Array<{
    sectionId: string;
    templateId: string;
    templateName: string;
    templateDescription?: string;
    fields: Array<{
      templateFieldId: string;
      fieldName: string;
      fieldType: string;
      fieldValue: any;
      description?: string;
      isRequired?: boolean;
      multiple?: boolean;
      relationType?: string;
    }>;
  }>;
}

interface ModuleVersion {
  number: number;
  contentSnapshot: ContentSnapshot;
  updatedAt: string;
  _id: string;
  updatedBy: User;
}

interface Module {
  _id: string;
  name: string;
  moduleType: string;
  currentVersion: number;
  versions: ModuleVersion[];
  content: {
    fileId?: {
      name: string;
      contentType: string;
      downloadURL: string;
    };
    figmaUrl?: string;
    sections?: Array<{
      sectionId: string;
      templateId: string;
      templateName: string;
      templateDescription?: string;
      fields: Array<{
        templateFieldId: string;
        fieldName: string;
        fieldType: string;
        fieldValue: any;
        description?: string;
      }>;
    }>;
  };
}

interface ApprovalRequest {
  _id: string;
  moduleId: Module;
  status: string;
  requestedBy: {
    name: string;
    avatar?: string;
  };
  approverEmail: string;
  createdAt: string;
}

// RelationFieldDisplay component for showing relation data in read-only mode
function RelationFieldDisplay({ field }: { field: any }) {
  if (
    !field.fieldValue ||
    typeof field.fieldValue !== 'object' ||
    !('displayValues' in field.fieldValue) ||
    !field.fieldValue.displayValues
  ) {
    return <span className='text-xs text-muted-foreground'>No relation data</span>;
  }

  return (
    <div className='space-y-2'>
      {Object.entries(field.fieldValue.displayValues).map(([key, value]) => {
        return (
          <div key={key} className='flex items-start gap-2'>
            <span className='font-medium text-gray-500 min-w-[100px]'>{key}</span>
            <span className='text-gray-700 flex-1'>{renderRelationValue(value)}</span>
          </div>
        );
      })}
    </div>
  );
}

// Helper function specifically for rendering relation values
function renderRelationValue(value: any) {
  if (value === null || value === undefined) {
    return <span className='text-xs text-muted-foreground'>None</span>;
  }

  if (Array.isArray(value)) {
    if (value.length === 0) {
      return <span className='text-xs text-muted-foreground'>Empty list</span>;
    }

    return (
      <div className='flex flex-col gap-1'>
        {value.map((item, idx) => {
          return (
            <div key={idx} className='text-sm'>
              {typeof item === 'object' && item !== null
                ? item.originalName || item.name || JSON.stringify(item)
                : String(item)}
            </div>
          );
        })}
      </div>
    );
  }

  if (typeof value === 'object' && value !== null) {
    if (value.contentType?.startsWith('image/') && value.downloadURL) {
      return (
        <div className='h-12 w-12 relative rounded overflow-hidden border'>
          <Image
            src={value.downloadURL}
            alt={value.originalName || 'Image'}
            fill
            className='object-cover'
          />
        </div>
      );
    }

    return (
      <span className='text-sm'>{value.originalName || value.name || JSON.stringify(value)}</span>
    );
  }

  return <span className='text-sm'>{String(value)}</span>;
}

export default function ApprovalRequestPage() {
  const params = useParams();
  const id = params?.id as string;
  const searchParams = useSearchParams() || new URLSearchParams();
  const userId = searchParams.get('user') || undefined;

  const { approvalRequest, loading, error, updateStatus, selectedVersion, switchVersion } =
    useApprovalRequest(id as string, userId || undefined);

  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');

  if (loading) {
    return (
      <div className='h-screen flex flex-col bg-slate-50'>
        <div className='flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden'>
          {/* Module Preview Section Skeleton */}
          <div className='rounded-lg flex flex-col overflow-hidden border bg-white shadow-sm'>
            <div className='p-3 flex justify-between items-center border-b bg-white'>
              <Skeleton className='h-6 w-32' />
              <Skeleton className='h-8 w-48' />
            </div>
            <div className='p-3 flex-1 overflow-auto pb-0'>
              <div className='h-full'>
                <div className='h-full flex flex-col'>
                  <div className='py-3 px-4 border-b bg-white'>
                    <div className='flex justify-between items-center'>
                      <Skeleton className='h-5 w-48' />
                      <Skeleton className='h-5 w-24' />
                    </div>
                  </div>
                  <div className='p-3 flex flex-col flex-1'>
                    <Skeleton className='h-[300px] w-full rounded-md' />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Approval Request Section Skeleton */}
          <div className='bg-white rounded-lg flex flex-col overflow-hidden border shadow-sm'>
            <div className='p-3 flex justify-between items-center border-b bg-white'>
              <Skeleton className='h-6 w-40' />
              <Skeleton className='h-5 w-24' />
            </div>
            <div className='flex-1 flex flex-col overflow-hidden'>
              <div className='p-4 border-b'>
                <div className='grid grid-cols-[1fr_2fr] gap-y-3 text-sm'>
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-32' />
                  <Skeleton className='h-4 w-24' />
                  <Skeleton className='h-4 w-32' />
                </div>
              </div>
              <div className='flex-1 flex flex-col overflow-hidden'>
                <div className='p-3 flex justify-between items-center'>
                  <Skeleton className='h-4 w-32' />
                </div>
                <div className='flex-1 overflow-y-auto p-4'>
                  <div className='space-y-4'>
                    {[1, 2, 3].map((i) => {
                      return (
                        <div key={i} className='flex items-start gap-4'>
                          <Skeleton className='h-8 w-8 rounded-full' />
                          <div className='flex-1 space-y-2'>
                            <Skeleton className='h-4 w-48' />
                            <Skeleton className='h-4 w-full' />
                            <Skeleton className='h-3 w-32' />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !approvalRequest) {
    return (
      <div className='h-screen flex items-center justify-center'>
        Error loading approval request
      </div>
    );
  }

  const timelineItems = [
    {
      id: 1,
      date: approvalRequest?.timeline[0]?.createdAt || '',
      title: approvalRequest?.requestedBy?.name || '',
      action: 'requested approval for',
      description: approvalRequest?.timeline[0]?.description || '',
      image: approvalRequest?.requestedBy?.avatar || undefined,
    },
    ...(approvalRequest?.timeline.slice(1).map((item, index) => {
      return {
        id: index + 2,
        date: item.createdAt,
        title: item.action === 'commented' ? item.author : approvalRequest?.requestedBy?.name,
        action: item.action,
        description: item.description,
        image: approvalRequest?.requestedBy?.avatar || undefined,
      };
    }) || []),
  ];

  const handleConfirmAction = async () => {
    try {
      await updateStatus(confirmAction as 'approved' | 'rejected', comment.trim() || undefined);
      setConfirmAction(null);
      setComment('');
    } catch (error) {
      console.error('Error updating status:', error);
    }
  };

  return (
    <motion.div
      className='h-screen flex flex-col bg-slate-50'
      initial={{ opacity: 1 }}
      animate={{ opacity: 1 }}
    >
      <motion.div
        className='flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden'
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Module Preview Section */}
        <motion.div
          className='rounded-lg flex flex-col overflow-hidden border bg-white shadow-sm'
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          layout
        >
          <div className='p-3 flex justify-between items-center border-b bg-white'>
            <h2 className='text-xl font-semibold tracking-tight text-slate-800'>Module Preview</h2>

            {/* Version Tabs */}
            <div className='flex items-center gap-2'>
              <Tabs defaultValue={selectedVersion?.toString()} className=''>
                <TabsList className='h-8 bg-slate-100'>
                  {approvalRequest.moduleId.versions.map((version) => {
                    return (
                      <TabsTrigger
                        key={version._id}
                        value={version.number.toString()}
                        className='text-xs px-2 data-[state=active]:bg-white'
                        onClick={() => {
                          return switchVersion(version.number);
                        }}
                      >
                        v{version.number}
                        {version.number === approvalRequest.moduleId.currentVersion && ' (Current)'}
                      </TabsTrigger>
                    );
                  })}
                </TabsList>
              </Tabs>
            </div>
          </div>

          <div className='p-3 flex-1 overflow-auto pb-0'>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.2 }}
              className='h-full'
            >
              <Card className='h-full flex flex-col border-0 shadow-none'>
                <CardHeader className='py-3 px-4 border-b bg-white'>
                  <div className='flex justify-between items-center'>
                    <CardTitle className='text-base font-medium flex items-center gap-2'>
                      {approvalRequest.moduleId.moduleType === 'file' ? (
                        <>
                          <FileImage className='h-4 w-4 text-gray-500' />
                          {approvalRequest.moduleId.content.fileId?.name}
                        </>
                      ) : approvalRequest.moduleId.moduleType === 'figma' ? (
                        <>
                          <Figma className='h-4 w-4 text-gray-500' />
                          {approvalRequest.moduleId.name}
                        </>
                      ) : (
                        approvalRequest.moduleId.name
                      )}
                    </CardTitle>
                    <Badge
                      variant='outline'
                      className='bg-gray-50 text-xs text-gray-700 border-gray-200'
                    >
                      {approvalRequest.moduleId.moduleType === 'file'
                        ? approvalRequest.moduleId.content.fileId?.contentType
                        : approvalRequest.moduleId.moduleType === 'figma'
                        ? 'Figma'
                        : 'Form'}
                    </Badge>
                  </div>
                </CardHeader>
                <CardContent className='p-3 flex flex-col flex-1'>
                  {approvalRequest.moduleId.moduleType === 'file' ? (
                    <>
                      <div
                        className='relative flex-1 bg-slate-50 border rounded-md overflow-hidden'
                        style={{ minHeight: '300px' }}
                      >
                        <div className='absolute inset-0 flex items-center justify-center h-full w-full'>
                          {approvalRequest.moduleId.content.fileId?.downloadURL ? (
                            <Image
                              src={approvalRequest.moduleId.content.fileId.downloadURL}
                              alt='Document preview'
                              width={500}
                              height={300}
                              className='object-contain'
                              priority
                            />
                          ) : (
                            <div className='flex flex-col items-center justify-center text-gray-400'>
                              <FileImage className='h-12 w-12 mb-2' />
                              <span className='text-sm'>No preview available</span>
                            </div>
                          )}
                        </div>
                      </div>
                      <div className='flex justify-between items-center text-xs text-slate-500 mt-2'>
                        <div className='font-normal'>
                          Uploaded on{' '}
                          {new Date(
                            approvalRequest.moduleId.versions[0].updatedAt,
                          ).toLocaleDateString()}
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-7 text-xs flex items-center gap-1 text-gray-600 border-gray-200 hover:bg-gray-50'
                          >
                            <Eye className='h-3.5 w-3.5' />
                            Preview
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-7 text-xs flex items-center gap-1 text-gray-600 border-gray-200 hover:bg-gray-50'
                          >
                            <Download className='h-3.5 w-3.5' />
                            Download
                          </Button>
                        </div>
                      </div>
                    </>
                  ) : approvalRequest.moduleId.moduleType === 'figma' ? (
                    <div className='space-y-4'>
                      <div className='bg-white rounded-lg border shadow-sm overflow-hidden'>
                        {approvalRequest.moduleId.content.figmaUrl ? (
                          <div className='flex flex-col'>
                            <div className='relative w-full aspect-video'>
                              <iframe
                                src={`https://www.figma.com/embed?embed_host=share&url=${encodeURIComponent(
                                  approvalRequest.moduleId.content.figmaUrl,
                                )}`}
                                className='w-full h-full'
                                allowFullScreen
                                title={`Figma Preview - ${approvalRequest.moduleId.name}`}
                              />
                            </div>
                            <div className='p-4 space-y-2'>
                              <div className='flex items-center justify-between'>
                                <Button
                                  variant='outline'
                                  size='sm'
                                  className='gap-2'
                                  onClick={() => {
                                    return window.open(
                                      approvalRequest.moduleId.content.figmaUrl,
                                      '_blank',
                                    );
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
                            <h3 className='text-lg font-medium mb-2'>No Figma Preview Available</h3>
                            <p className='text-sm text-muted-foreground'>
                              The Figma file URL is not available for this version.
                            </p>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-6 p-4'>
                      <div className='grid gap-6'>
                        {selectedVersion &&
                          approvalRequest.moduleId.versions
                            .find((v: ModuleVersion) => {
                              return v.number === selectedVersion;
                            })
                            ?.contentSnapshot?.sections?.map((section) => {
                              return (
                                <div key={section.sectionId} className='space-y-4'>
                                  <div className='flex items-center gap-2'>
                                    <div className='flex h-6 w-6 items-center justify-center rounded border border-gray-200 bg-gray-50'>
                                      <FileText className='h-3.5 w-3.5 text-gray-500' />
                                    </div>
                                    <span className='text-sm font-medium text-gray-800'>
                                      {section.templateName}
                                    </span>
                                    {section.templateDescription && (
                                      <span className='text-xs text-gray-500'>
                                        ({section.templateDescription})
                                      </span>
                                    )}
                                  </div>
                                  <div className='grid gap-4 pl-8'>
                                    {section.fields.map((field) => {
                                      return (
                                        <div
                                          key={field.templateFieldId}
                                          className='bg-gray-50 rounded-lg p-4 border border-gray-100'
                                        >
                                          <div className='flex items-center justify-between mb-2'>
                                            <div className='text-sm font-medium text-gray-700'>
                                              {field.fieldName}
                                            </div>
                                            <Badge variant='outline' className='text-xs bg-white'>
                                              {field.fieldType === 'text'
                                                ? 'Text Field'
                                                : field.fieldType === 'files'
                                                ? 'File'
                                                : 'Linked Item'}
                                            </Badge>
                                          </div>
                                          {field.fieldType === 'text' && (
                                            <div className='text-sm text-gray-600 bg-white rounded-md p-3 border border-gray-200'>
                                              {typeof field.fieldValue === 'string'
                                                ? field.fieldValue
                                                : typeof field.fieldValue === 'object'
                                                ? JSON.stringify(field.fieldValue)
                                                : field.fieldValue || 'No response'}
                                            </div>
                                          )}
                                          {(field.fieldType === 'files' ||
                                            field.fieldType === 'attachment') && (
                                            <div className='text-sm text-gray-600 bg-white rounded-md p-3 border border-gray-200'>
                                              {field.fieldValue &&
                                              typeof field.fieldValue === 'object' &&
                                              field.fieldValue._id &&
                                              field.fieldValue.downloadURL &&
                                              field.fieldValue.originalName &&
                                              field.fieldValue.contentType ? (
                                                <FilePreview
                                                  file={{
                                                    _id: field.fieldValue._id,
                                                    downloadURL: field.fieldValue.downloadURL,
                                                    originalName: field.fieldValue.originalName,
                                                    contentType: field.fieldValue.contentType,
                                                  }}
                                                />
                                              ) : (
                                                <span className='text-xs text-muted-foreground'>
                                                  No file uploaded
                                                </span>
                                              )}
                                            </div>
                                          )}
                                          {field.fieldType === 'longtext' && (
                                            <div className='text-sm text-gray-600 bg-white rounded-md p-3 border border-gray-200 max-h-32 overflow-y-auto'>
                                              <span className='whitespace-pre-wrap'>
                                                {typeof field.fieldValue === 'string'
                                                  ? field.fieldValue
                                                  : ''}
                                              </span>
                                            </div>
                                          )}
                                          {Array.isArray(field.fieldValue) && (
                                            <div className='text-sm text-gray-600 bg-white rounded-md p-3 border border-gray-200'>
                                              {field.fieldValue.length > 0 ? (
                                                field.fieldValue.map((value, idx) => {
                                                  return (
                                                    <div key={idx} className='mb-1 last:mb-0'>
                                                      {typeof value === 'string'
                                                        ? value
                                                        : JSON.stringify(value)}
                                                    </div>
                                                  );
                                                })
                                              ) : (
                                                <span className='text-xs text-muted-foreground'>
                                                  No values selected
                                                </span>
                                              )}
                                            </div>
                                          )}
                                          {field.fieldType === 'relation' && (
                                            <div className='text-sm text-gray-600 bg-white rounded-md p-3 border border-gray-200'>
                                              <RelationFieldDisplay field={field} />
                                            </div>
                                          )}
                                          {field.description && (
                                            <div className='mt-2 text-xs text-gray-500'>
                                              {field.description}
                                            </div>
                                          )}
                                        </div>
                                      );
                                    })}
                                  </div>
                                </div>
                              );
                            })}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            </motion.div>
          </div>
        </motion.div>

        {/* Approval Request Section */}
        <motion.div
          className='bg-white rounded-lg flex flex-col overflow-hidden border shadow-sm'
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.1 }}
          layout
        >
          <div className='p-3 flex justify-between items-center border-b bg-white'>
            <h1 className='text-xl font-semibold tracking-tight text-slate-800'>
              Approval Request
            </h1>
            <Badge
              variant='outline'
              className={`${
                approvalRequest.status === 'pending'
                  ? 'bg-amber-50 text-amber-700 border-amber-200'
                  : approvalRequest.status === 'approved'
                  ? 'bg-green-50 text-green-700 border-green-200'
                  : 'bg-rose-50 text-rose-700 border-rose-200'
              } text-xs`}
            >
              {approvalRequest.status.charAt(0).toUpperCase() + approvalRequest.status.slice(1)}{' '}
              Approval
            </Badge>
          </div>

          <div className='flex-1 flex flex-col overflow-hidden'>
            {/* Request Details */}
            <motion.div
              className='p-4 border-b'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3 }}
            >
              <div className='grid grid-cols-[1fr_2fr] gap-y-3 text-sm'>
                <div className='font-medium text-slate-600'>Module:</div>
                <div className='text-slate-800'>{approvalRequest.moduleId.name}</div>

                <div className='font-medium text-slate-600'>Requested by:</div>
                <div className='text-slate-800'>{approvalRequest.requestedBy.name}</div>

                <div className='font-medium text-slate-600'>Approver:</div>
                <div className='text-slate-800'>{approvalRequest.approverEmail}</div>

                <div className='font-medium text-slate-600'>Date requested:</div>
                <div className='text-slate-800'>
                  {new Date(approvalRequest.createdAt).toLocaleDateString()}
                </div>
              </div>
            </motion.div>

            {/* Timeline Section */}
            <div className='flex-1 flex flex-col overflow-hidden'>
              <div className='p-3 flex justify-between items-center'>
                <div className='font-medium text-sm text-slate-600'>Activity Timeline</div>
              </div>

              <div className='flex-1 overflow-y-auto p-4'>
                <Timeline>
                  {timelineItems.map((item) => {
                    return (
                      <TimelineItem
                        key={item.id}
                        step={item.id}
                        className='group-data-[orientation=vertical]/timeline:ms-10 group-data-[orientation=vertical]/timeline:not-last:pb-10'
                      >
                        <TimelineHeader>
                          <TimelineSeparator className='group-data-[orientation=vertical]/timeline:-left-7 group-data-[orientation=vertical]/timeline:h-[calc(100%-1.5rem-0.25rem)] group-data-[orientation=vertical]/timeline:translate-y-6.5' />
                          <TimelineTitle className='mt-0.5'>
                            {item.title}{' '}
                            <span className='text-muted-foreground text-sm font-normal'>
                              {item.action}
                            </span>
                          </TimelineTitle>
                          <TimelineIndicator className='bg-primary/10 group-data-completed/timeline-item:bg-primary group-data-completed/timeline-item:text-primary-foreground flex size-6 items-center justify-center border-none group-data-[orientation=vertical]/timeline:-left-7'>
                            <Avatar className='size-6'>
                              {item.image ? (
                                <AvatarImage src={item.image} alt={item.title} />
                              ) : null}
                              <AvatarFallback>{item.title ? item.title[0] : '?'}</AvatarFallback>
                            </Avatar>
                          </TimelineIndicator>
                        </TimelineHeader>
                        <TimelineContent className='text-foreground mt-2 mb-4 rounded-lg border px-4 py-3 whitespace-pre-wrap'>
                          {item.description}
                          <TimelineDate className='mt-1 mb-0'>
                            {new Date(item.date).toLocaleString()}
                          </TimelineDate>
                        </TimelineContent>
                      </TimelineItem>
                    );
                  })}
                </Timeline>
              </div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Approval Actions - Fixed at bottom of screen */}
      {approvalRequest.status === 'pending' && (
        <motion.div
          className='w-full p-4 flex justify-end gap-3 border-t bg-white shadow-[0_-2px_4px_-1px_rgba(0,0,0,0.06)] z-10'
          initial={{ y: 0, opacity: 1 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4, delay: 0.3 }}
        >
          <Popover
            open={confirmAction === 'reject'}
            onOpenChange={(open) => {
              return !open && setConfirmAction(null);
            }}
          >
            <PopoverTrigger asChild>
              <Button
                variant='outline'
                size='sm'
                className={`h-9 text-sm flex items-center gap-1.5 font-medium ${
                  confirmAction === 'reject'
                    ? 'bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100'
                    : 'border-rose-200 text-rose-600 hover:bg-rose-50'
                }`}
                disabled={confirmAction === 'reject'}
                onClick={() => {
                  return setConfirmAction('reject');
                }}
              >
                <XCircle className='h-4 w-4' />
                Reject
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80 p-4 space-y-3'>
              <div className='text-sm font-medium'>Add an optional comment</div>
              <Textarea
                placeholder='Enter your comment here...'
                value={comment}
                onChange={(e) => {
                  return setComment(e.target.value);
                }}
                className='min-h-[100px]'
              />
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setConfirmAction(null);
                    setComment('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size='sm'
                  className='bg-rose-600 hover:bg-rose-700'
                  onClick={() => {
                    return handleConfirmAction();
                  }}
                >
                  Confirm Reject
                </Button>
              </div>
            </PopoverContent>
          </Popover>

          <Popover
            open={confirmAction === 'approve'}
            onOpenChange={(open) => {
              return !open && setConfirmAction(null);
            }}
          >
            <PopoverTrigger asChild>
              <Button
                size='sm'
                disabled={confirmAction === 'approve'}
                className={`h-9 text-sm flex items-center gap-1.5 font-medium ${
                  confirmAction === 'approve'
                    ? 'bg-teal-700 hover:bg-teal-800'
                    : 'bg-teal-600 hover:bg-teal-700'
                }`}
                onClick={() => {
                  return setConfirmAction('approve');
                }}
              >
                <CheckCircle className='h-4 w-4' />
                Approve
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-80 p-4 space-y-3'>
              <div className='text-sm font-medium'>Add an optional comment</div>
              <Textarea
                placeholder='Enter your comment here...'
                value={comment}
                onChange={(e) => {
                  return setComment(e.target.value);
                }}
                className='min-h-[100px]'
              />
              <div className='flex justify-end gap-2'>
                <Button
                  variant='outline'
                  size='sm'
                  onClick={() => {
                    setConfirmAction(null);
                    setComment('');
                  }}
                >
                  Cancel
                </Button>
                <Button
                  size='sm'
                  className='bg-teal-600 hover:bg-teal-700'
                  onClick={() => {
                    return handleConfirmAction();
                  }}
                >
                  Confirm Approve
                </Button>
              </div>
            </PopoverContent>
          </Popover>
        </motion.div>
      )}
    </motion.div>
  );
}
