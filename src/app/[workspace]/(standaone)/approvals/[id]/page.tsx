'use client';

import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
import { CheckCircle, Download, Eye, FileImage, FileText, XCircle } from 'lucide-react';
import Image from 'next/image';
import { useParams } from 'next/navigation';

export default function ApprovalRequestPage() {
  const { id } = useParams();
  const {
    approvalRequest,
    loading,
    error,
    addComment,
    updateStatus,
    selectedVersion,
    switchVersion,
  } = useApprovalRequest(id as string);

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
      date: approvalRequest?.dateRequested || '',
      title: approvalRequest?.requestedBy || '',
      action: 'requested approval for',
      description: approvalRequest?.message || '',
      image: 'https://picsum.photos/200/300',
    },
    ...(approvalRequest?.comments.map((comment, index) => {
      return {
        id: index + 2,
        date: comment.timestamp,
        title: comment.author,
        action: 'commented',
        description: comment.content,
        image: '/placeholder.svg?height=32&width=32',
      };
    }) || []),
  ];

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
                <TabsTrigger value='form' className='text-xs data-[state=active]:bg-white'>
                  Form Results
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
                              {approvalRequest.modulePreview.file.name}
                            </CardTitle>
                            <Badge
                              variant='outline'
                              className='bg-gray-50 text-xs text-gray-700 border-gray-200'
                            >
                              {approvalRequest.modulePreview.file.type}
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
                                src={approvalRequest.modulePreview.file.url}
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
                              Uploaded on {approvalRequest.modulePreview.file.uploadDate}
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

                  <TabsContent value='form' className='mt-0 h-full' key='form-tab'>
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                    >
                      <Card className='h-full flex flex-col border-0 shadow-none'>
                        <CardHeader className='py-3 px-4 border-b bg-white'>
                          <CardTitle className='text-base font-medium flex items-center gap-2'>
                            <FileText className='h-4 w-4 text-teal-500' />
                            Form Submission Results
                          </CardTitle>
                        </CardHeader>
                        <CardContent className='flex-1 p-3 overflow-auto'>
                          {approvalRequest.modulePreview.formResults && (
                            <div className='space-y-4'>
                              <div className='grid grid-cols-2 gap-4'>
                                <div className='space-y-1.5'>
                                  <div className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                                    Project Name
                                  </div>
                                  <div className='text-sm font-medium text-slate-800 leading-snug'>
                                    {approvalRequest.modulePreview.formResults.projectName}
                                  </div>
                                </div>
                                <div className='space-y-1.5'>
                                  <div className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                                    Department
                                  </div>
                                  <div className='text-sm font-medium text-slate-800 leading-snug'>
                                    {approvalRequest.modulePreview.formResults.department}
                                  </div>
                                </div>
                                <div className='space-y-1.5'>
                                  <div className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                                    Budget
                                  </div>
                                  <div className='text-sm font-medium text-slate-800 leading-snug'>
                                    {approvalRequest.modulePreview.formResults.budget}
                                  </div>
                                </div>
                                <div className='space-y-1.5'>
                                  <div className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                                    Timeline
                                  </div>
                                  <div className='text-sm font-medium text-slate-800 leading-snug'>
                                    {approvalRequest.modulePreview.formResults.timeline}
                                  </div>
                                </div>
                              </div>

                              <div className='space-y-1.5'>
                                <div className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                                  Description
                                </div>
                                <div className='text-xs text-slate-700 bg-slate-50 p-3 rounded-md border leading-relaxed'>
                                  {approvalRequest.modulePreview.formResults.description}
                                </div>
                              </div>

                              <div className='space-y-1.5'>
                                <div className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                                  Expected Outcomes
                                </div>
                                <ul className='list-disc list-inside text-xs text-slate-700 space-y-1.5 pl-2 leading-relaxed'>
                                  {approvalRequest.modulePreview.formResults.expectedOutcomes.map(
                                    (outcome, index) => {
                                      return <li key={index}>{outcome}</li>;
                                    },
                                  )}
                                </ul>
                              </div>
                            </div>
                          )}
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
                <div className='text-slate-800'>{approvalRequest.module}</div>

                <div className='font-medium text-slate-600'>Requested by:</div>
                <div className='text-slate-800'>{approvalRequest.requestedBy}</div>

                <div className='font-medium text-slate-600'>Approver:</div>
                <div className='text-slate-800'>{approvalRequest.approver}</div>

                <div className='font-medium text-slate-600'>Date requested:</div>
                <div className='text-slate-800'>{approvalRequest.dateRequested}</div>
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
          <Button
            variant='outline'
            size='sm'
            className='h-9 text-sm flex items-center gap-1.5 border-rose-200 text-rose-600 hover:bg-rose-50 font-medium'
            onClick={() => {
              return updateStatus('rejected');
            }}
          >
            <XCircle className='h-4 w-4' />
            Reject
          </Button>
          <Button
            size='sm'
            className='h-9 text-sm flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 font-medium'
            onClick={() => {
              return updateStatus('approved');
            }}
          >
            <CheckCircle className='h-4 w-4' />
            Approve
          </Button>
        </motion.div>
      )}
    </motion.div>
  );
}
