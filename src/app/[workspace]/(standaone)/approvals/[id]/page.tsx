'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { AnimatePresence, motion } from 'framer-motion';
import { CheckCircle, Download, Eye, FileImage, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useParams, useSearchParams } from 'next/navigation';
import { useState } from 'react';

export default function ApprovalRequestPage() {
  const { id } = useParams();
  const searchParams = useSearchParams();
  const userId = searchParams.get('user');

  const {
    approvalRequest,
    loading,
    error,
    addComment,
    updateStatus,
    selectedVersion,
    switchVersion,
  } = useApprovalRequest(id as string, userId || undefined);

  const [confirmAction, setConfirmAction] = useState<'approve' | 'reject' | null>(null);
  const [comment, setComment] = useState('');

  if (loading) {
    return <div className='h-screen flex items-center justify-center'>Loading...</div>;
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
      image: 'https://picsum.photos/200/300',
    },
    ...(approvalRequest?.timeline.slice(1).map((item, index) => {
      return {
        id: index + 2,
        date: item.createdAt,
        title: item.action === 'commented' ? item.author : approvalRequest?.requestedBy?.name,
        action: item.action,
        description: item.description,
        image: '/placeholder.svg?height=32&width=32',
      };
    }) || []),
  ];

  const handleStatusUpdate = async (status: 'approved' | 'rejected') => {
    try {
      await updateStatus(status, comment.trim() ? comment : undefined);
      setConfirmAction(null);
      setComment('');
    } catch (error) {
      console.error('Error updating status:', error);
      // You might want to add a toast notification here to show the error to the user
    }
  };

  return (
    <motion.div
      className='h-screen flex flex-col bg-slate-50'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className='flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden'
        layout
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {/* Module Preview Section */}
        <motion.div
          className='rounded-lg flex flex-col overflow-hidden border bg-white shadow-sm'
          initial={{ y: 20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.4 }}
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
            <Tabs defaultValue='file' className='w-full h-full flex flex-col'>
              <TabsList className='bg-slate-100'>
                <TabsTrigger value='file' className='text-xs data-[state=active]:bg-white'>
                  File
                </TabsTrigger>
              </TabsList>

              <div className='flex-1 overflow-auto'>
                <AnimatePresence mode='wait' key='tabs-content'>
                  <TabsContent value='file' className='mt-0 h-full' key='file-tab'>
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
                              <FileImage className='h-4 w-4 text-gray-500' />
                              {approvalRequest.moduleId.content.fileId.name}
                            </CardTitle>
                            <Badge
                              variant='outline'
                              className='bg-gray-50 text-xs text-gray-700 border-gray-200'
                            >
                              {approvalRequest.moduleId.content.fileId.contentType}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className='p-3 flex flex-col flex-1'>
                          <div
                            className='relative flex-1 bg-slate-50 border rounded-md overflow-hidden'
                            style={{ minHeight: '300px' }}
                          >
                            <div className='absolute inset-0 flex items-center justify-center h-full w-full'>
                              <Image
                                src={approvalRequest.moduleId.content.fileId.downloadURL}
                                alt='Document preview'
                                width={500}
                                height={300}
                                className='object-contain'
                                priority
                              />
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
                        </CardContent>
                      </Card>
                    </motion.div>
                  </TabsContent>
                </AnimatePresence>
              </div>
            </Tabs>
          </div>
        </motion.div>

        {/* Approval Request Section */}
        <motion.div
          className='bg-white rounded-lg flex flex-col overflow-hidden border shadow-sm'
          initial={{ y: 20, opacity: 0 }}
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
                        className='group-data-[orientation=vertical]/timeline:ms-10 group-data-[orientation=vertical]/timeline:not-last:pb-8'
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
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.image}
                              alt={item.title}
                              className='size-6 rounded-full'
                            />
                          </TimelineIndicator>
                        </TimelineHeader>
                        <TimelineContent className='text-foreground mt-2 rounded-lg border px-4 py-3 whitespace-pre-wrap'>
                          {item.description}
                          <TimelineDate className='mt-1 mb-0'>{item.date}</TimelineDate>
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
          initial={{ y: 20, opacity: 0 }}
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
                    return handleStatusUpdate('rejected');
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
                    return handleStatusUpdate('approved');
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
