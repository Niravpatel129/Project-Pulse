'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AnimatePresence, motion } from 'framer-motion';
import {
  CheckCircle,
  Download,
  Eye,
  FileImage,
  FileText,
  Paperclip,
  Send,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';

export default function ApprovalRequestPage() {
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
              <Tabs defaultValue='v3' className=''>
                <TabsList className='h-8 bg-slate-100'>
                  <TabsTrigger value='v1' className='text-xs px-2 data-[state=active]:bg-white'>
                    v1
                  </TabsTrigger>
                  <TabsTrigger value='v2' className='text-xs px-2 data-[state=active]:bg-white'>
                    v2
                  </TabsTrigger>
                  <TabsTrigger value='v3' className='text-xs px-2 data-[state=active]:bg-white'>
                    v3 (Current)
                  </TabsTrigger>
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
                <AnimatePresence mode='wait'>
                  <TabsContent value='file' className='mt-0 h-full'>
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
                              presentation-v2.pdf
                            </CardTitle>
                            <Badge
                              variant='outline'
                              className='bg-gray-50 text-xs text-gray-700 border-gray-200'
                            >
                              PDF Document
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
                                src='https://picsum.photos/500/300'
                                alt='Document preview'
                                width={500}
                                height={300}
                                className='object-contain'
                                priority
                              />
                            </div>
                          </div>
                          <div className='flex justify-between items-center text-xs text-slate-500 mt-2'>
                            <div className='font-normal'>Uploaded on April 2, 2025</div>
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

                  <TabsContent value='form' className='mt-0 h-full'>
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
                          <div className='space-y-4'>
                            <div className='grid grid-cols-2 gap-4'>
                              <div className='space-y-1.5'>
                                <div className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                                  Project Name
                                </div>
                                <div className='text-sm font-medium text-slate-800 leading-snug'>
                                  Q1 Marketing Campaign
                                </div>
                              </div>
                              <div className='space-y-1.5'>
                                <div className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                                  Department
                                </div>
                                <div className='text-sm font-medium text-slate-800 leading-snug'>
                                  Marketing
                                </div>
                              </div>
                              <div className='space-y-1.5'>
                                <div className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                                  Budget
                                </div>
                                <div className='text-sm font-medium text-slate-800 leading-snug'>
                                  $15,000
                                </div>
                              </div>
                              <div className='space-y-1.5'>
                                <div className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                                  Timeline
                                </div>
                                <div className='text-sm font-medium text-slate-800 leading-snug'>
                                  3 months
                                </div>
                              </div>
                            </div>

                            <div className='space-y-1.5'>
                              <div className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                                Description
                              </div>
                              <div className='text-xs text-slate-700 bg-slate-50 p-3 rounded-md border leading-relaxed'>
                                This project aims to increase brand awareness through targeted
                                digital marketing campaigns across multiple platforms. The strategy
                                includes content creation, paid advertising, and influencer
                                partnerships.
                              </div>
                            </div>

                            <div className='space-y-1.5'>
                              <div className='text-xs font-medium text-slate-500 uppercase tracking-wide'>
                                Expected Outcomes
                              </div>
                              <ul className='list-disc list-inside text-xs text-slate-700 space-y-1.5 pl-2 leading-relaxed'>
                                <li>20% increase in website traffic</li>
                                <li>15% growth in social media engagement</li>
                                <li>10% increase in lead generation</li>
                              </ul>
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
              className='bg-amber-50 text-amber-700 border-amber-200 text-xs'
            >
              Pending Approval
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
                <div className='text-slate-800'>Module A</div>

                <div className='font-medium text-slate-600'>Requested by:</div>
                <div className='text-slate-800'>Jane Smith</div>

                <div className='font-medium text-slate-600'>Approver:</div>
                <div className='text-slate-800'>john.doe@example.com</div>

                <div className='font-medium text-slate-600'>Date requested:</div>
                <div className='text-slate-800'>April 5, 2025</div>
              </div>
            </motion.div>

            {/* Message */}
            <motion.div
              className='p-4 border-b'
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <div className='font-medium text-sm text-slate-600 mb-2'>Message</div>
              <div className='text-xs text-slate-700 bg-slate-50 p-3 rounded-md border leading-relaxed'>
                Please review and approve the module. This is the updated version with all the
                requested changes implemented.
              </div>
            </motion.div>

            {/* Comments Section - Scrollable */}
            <div className='flex-1 flex flex-col overflow-hidden'>
              <div className='p-3 border-b flex justify-between items-center'>
                <div className='font-medium text-sm text-slate-600'>Comments (3)</div>
              </div>

              {/* Scrollable Comments */}
              <motion.div
                className='flex-1 overflow-y-auto p-4 space-y-4'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.4, delay: 0.2 }}
              >
                {/* Comment 1 */}
                <motion.div
                  className='bg-slate-50 rounded-lg p-3 border'
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3 }}
                  layout
                >
                  <div className='flex gap-3'>
                    <Avatar className='h-8 w-8 border bg-white'>
                      <AvatarImage src='/placeholder.svg?height=32&width=32' />
                      <AvatarFallback className='bg-gray-100 text-gray-700'>JD</AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <p className='font-medium text-slate-800 text-sm'>John Doe</p>
                          <p className='text-slate-500 text-xs'>2 hours ago</p>
                        </div>
                      </div>
                      <div className='mt-1.5 text-slate-700 text-xs leading-relaxed'>
                        Looks good to me.
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Comment 2 */}
                <motion.div
                  className='bg-slate-50 rounded-lg p-3 border'
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.1 }}
                  layout
                >
                  <div className='flex gap-3'>
                    <Avatar className='h-8 w-8 border bg-white'>
                      <AvatarImage src='/placeholder.svg?height=32&width=32' />
                      <AvatarFallback className='bg-rose-100 text-rose-700'>JS</AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <p className='font-medium text-slate-800 text-sm'>Jane Smith</p>
                          <p className='text-slate-500 text-xs'>1 hour ago</p>
                        </div>
                      </div>
                      <div className='mt-1.5 text-slate-700 text-xs leading-relaxed'>
                        Some minor changes are needed. Could you please update the budget section to
                        include the quarterly breakdown?
                      </div>
                    </div>
                  </div>
                </motion.div>

                {/* Comment 3 */}
                <motion.div
                  className='bg-slate-50 rounded-lg p-3 border'
                  initial={{ y: 10, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ duration: 0.3, delay: 0.2 }}
                  layout
                >
                  <div className='flex gap-3'>
                    <Avatar className='h-8 w-8 border bg-white'>
                      <AvatarImage src='/placeholder.svg?height=32&width=32' />
                      <AvatarFallback className='bg-gray-100 text-gray-700'>JD</AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <p className='font-medium text-slate-800 text-sm'>John Doe</p>
                          <p className='text-slate-500 text-xs'>20 minutes ago</p>
                        </div>
                      </div>
                      <div className='mt-1.5 text-slate-700 text-xs leading-relaxed'>
                        I&apos;ve uploaded a new version with the quarterly budget breakdown. Please
                        check the updated file.
                      </div>
                      <div className='mt-2 bg-white rounded p-2 flex items-center gap-2 text-xs border'>
                        <FileText className='h-3.5 w-3.5 text-gray-500' />
                        <span className='text-gray-600 font-medium'>budget-breakdown-q1.xlsx</span>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-5 ml-auto p-0 w-5 text-slate-500 hover:text-gray-600'
                        >
                          <Download className='h-3 w-3' />
                        </Button>
                      </div>
                    </div>
                  </div>
                </motion.div>
              </motion.div>

              {/* Add Comment - Fixed at bottom */}
              <motion.div
                className='p-4 border-t bg-white'
                initial={{ y: 10, opacity: 0 }}
                animate={{ y: 0, opacity: 1 }}
                transition={{ duration: 0.3 }}
              >
                <div className='flex gap-3'>
                  <div className='flex-1'>
                    <div className='border rounded-lg overflow-hidden flex'>
                      <input
                        className='w-full p-2.5 text-xs focus:outline-none text-slate-800 placeholder:text-slate-400'
                        placeholder='Add a comment...'
                      />
                      <div className='flex items-center px-2 border-l bg-slate-50'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 w-6 p-0 text-slate-500 hover:text-gray-600'
                        >
                          <Paperclip className='h-3.5 w-3.5' />
                        </Button>
                        <Button
                          size='sm'
                          className='ml-2 h-6 text-xs flex items-center gap-1  text-gray-600 border-gray-200 hover:bg-gray-100'
                          variant='outline'
                        >
                          <Send className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </motion.div>

      {/* Approval Actions - Fixed at bottom of screen */}
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
        >
          <XCircle className='h-4 w-4' />
          Reject
        </Button>
        <Button
          size='sm'
          className='h-9 text-sm flex items-center gap-1.5 bg-teal-600 hover:bg-teal-700 font-medium'
        >
          <CheckCircle className='h-4 w-4' />
          Approve
        </Button>
      </motion.div>
    </motion.div>
  );
}
