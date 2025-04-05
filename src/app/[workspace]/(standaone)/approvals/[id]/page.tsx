import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle,
  Download,
  Eye,
  FileImage,
  FileText,
  History,
  MoreHorizontal,
  Paperclip,
  Reply,
  ThumbsUp,
  XCircle,
} from 'lucide-react';
import Image from 'next/image';

export default function ApprovalRequestPage() {
  return (
    <div className='h-screen flex flex-col bg-white'>
      <div className='flex-1 grid grid-cols-1 lg:grid-cols-2 gap-4 p-4 overflow-hidden'>
        {/* Module Preview Section */}
        <div className='rounded-lg flex flex-col overflow-hidden'>
          <div className='p-3 flex justify-between items-center border-b bg-white'>
            <h2 className='text-xl font-bold text-gray-800'>Module Preview</h2>

            {/* Version Tabs */}
            <div className='flex items-center gap-2'>
              <Tabs defaultValue='v3' className='w-[200px]'>
                <TabsList className='h-8'>
                  <TabsTrigger value='v1' className='text-xs px-2'>
                    v1
                  </TabsTrigger>
                  <TabsTrigger value='v2' className='text-xs px-2'>
                    v2
                  </TabsTrigger>
                  <TabsTrigger value='v3' className='text-xs px-2'>
                    v3 (Current)
                  </TabsTrigger>
                </TabsList>
              </Tabs>
              <Button variant='ghost' size='icon' className='h-8 w-8'>
                <History className='h-4 w-4' />
              </Button>
            </div>
          </div>

          <div className='p-3 flex-1 overflow-auto'>
            <Tabs defaultValue='file' className='w-full h-full flex flex-col'>
              <TabsList className='w-[260px] h-8 mb-3'>
                <TabsTrigger value='file' className='text-xs'>
                  File
                </TabsTrigger>
                <TabsTrigger value='form' className='text-xs'>
                  Form Results
                </TabsTrigger>
              </TabsList>

              <div className='flex-1 overflow-auto'>
                <TabsContent value='file' className='mt-0 h-full'>
                  <Card className='h-full flex flex-col'>
                    <CardHeader className='py-3 px-4'>
                      <div className='flex justify-between items-center'>
                        <CardTitle className='text-base font-medium flex items-center gap-2'>
                          <FileImage className='h-4 w-4 text-blue-500' />
                          presentation-v2.pdf
                        </CardTitle>
                        <Badge variant='outline' className='bg-blue-50 text-xs'>
                          PDF Document
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className='flex-1 p-3 flex flex-col'>
                      <div className='relative flex-1 bg-white border rounded-md overflow-hidden mb-2'>
                        <div className='absolute inset-0 flex items-center justify-center'>
                          <Image
                            src='/placeholder.svg?height=300&width=500'
                            alt='Document preview'
                            width={500}
                            height={300}
                            className='object-contain'
                          />
                        </div>
                      </div>
                      <div className='flex justify-between items-center text-xs text-gray-500'>
                        <div>Uploaded on April 2, 2025</div>
                        <div className='flex gap-2'>
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-7 text-xs flex items-center gap-1'
                          >
                            <Eye className='h-3.5 w-3.5' />
                            Preview
                          </Button>
                          <Button
                            variant='outline'
                            size='sm'
                            className='h-7 text-xs flex items-center gap-1'
                          >
                            <Download className='h-3.5 w-3.5' />
                            Download
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value='form' className='mt-0 h-full'>
                  <Card className='h-full flex flex-col'>
                    <CardHeader className='py-3 px-4'>
                      <CardTitle className='text-base font-medium flex items-center gap-2'>
                        <FileText className='h-4 w-4 text-green-500' />
                        Form Submission Results
                      </CardTitle>
                    </CardHeader>
                    <CardContent className='flex-1 p-3 overflow-auto'>
                      <div className='space-y-3'>
                        <div className='grid grid-cols-2 gap-3'>
                          <div className='space-y-1'>
                            <div className='text-xs font-medium text-gray-500'>Project Name</div>
                            <div className='text-sm font-medium'>Q1 Marketing Campaign</div>
                          </div>
                          <div className='space-y-1'>
                            <div className='text-xs font-medium text-gray-500'>Department</div>
                            <div className='text-sm font-medium'>Marketing</div>
                          </div>
                          <div className='space-y-1'>
                            <div className='text-xs font-medium text-gray-500'>Budget</div>
                            <div className='text-sm font-medium'>$15,000</div>
                          </div>
                          <div className='space-y-1'>
                            <div className='text-xs font-medium text-gray-500'>Timeline</div>
                            <div className='text-sm font-medium'>3 months</div>
                          </div>
                        </div>

                        <div className='space-y-1'>
                          <div className='text-xs font-medium text-gray-500'>Description</div>
                          <div className='text-xs text-gray-700 bg-gray-50 p-2 rounded-md'>
                            This project aims to increase brand awareness through targeted digital
                            marketing campaigns across multiple platforms. The strategy includes
                            content creation, paid advertising, and influencer partnerships.
                          </div>
                        </div>

                        <div className='space-y-1'>
                          <div className='text-xs font-medium text-gray-500'>Expected Outcomes</div>
                          <ul className='list-disc list-inside text-xs text-gray-700 space-y-1 pl-2'>
                            <li>20% increase in website traffic</li>
                            <li>15% growth in social media engagement</li>
                            <li>10% increase in lead generation</li>
                          </ul>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>
              </div>
            </Tabs>
          </div>
        </div>

        {/* Approval Request Section */}
        <div className='bg-white rounded-lg flex flex-col overflow-hidden border'>
          <div className='p-3 flex justify-between items-center border-b'>
            <h1 className='text-xl font-bold text-gray-900'>Approval Request</h1>
            <Badge
              variant='outline'
              className='bg-yellow-50 text-yellow-700 border-yellow-200 text-xs'
            >
              Pending Approval
            </Badge>
          </div>

          <div className='flex-1 flex flex-col overflow-hidden'>
            {/* Request Details */}
            <div className='p-3 border-b'>
              <div className='grid grid-cols-[1fr_2fr] gap-y-2 text-sm'>
                <div className='font-semibold text-gray-700'>Module:</div>
                <div>Module A</div>

                <div className='font-semibold text-gray-700'>Requested by:</div>
                <div>Jane Smith</div>

                <div className='font-semibold text-gray-700'>Approver:</div>
                <div>john.doe@example.com</div>

                <div className='font-semibold text-gray-700'>Date requested:</div>
                <div>April 5, 2025</div>
              </div>
            </div>

            {/* Message */}
            <div className='p-3 border-b'>
              <div className='font-semibold text-sm text-gray-700 mb-1'>Message</div>
              <div className='text-xs text-gray-700 bg-gray-50 p-2 rounded-md'>
                Please review and approve the module. This is the updated version with all the
                requested changes implemented.
              </div>
            </div>

            {/* Comments Section - Scrollable */}
            <div className='flex-1 flex flex-col overflow-hidden'>
              <div className='p-3 border-b flex justify-between items-center'>
                <div className='font-semibold text-sm text-gray-700'>Comments (3)</div>
              </div>

              {/* Scrollable Comments */}
              <div className='flex-1 overflow-y-auto p-3 space-y-3'>
                {/* Comment 1 */}
                <div className='bg-gray-50 rounded-lg p-3'>
                  <div className='flex gap-2'>
                    <Avatar className='h-8 w-8 border bg-white'>
                      <AvatarImage src='/placeholder.svg?height=32&width=32' />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <p className='font-medium text-gray-900 text-sm'>John Doe</p>
                          <p className='text-gray-500 text-xs'>2 hours ago</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
                              <MoreHorizontal className='h-3.5 w-3.5' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className='mt-1 text-gray-800 text-xs'>Looks good to me.</div>
                      <div className='mt-2 flex items-center gap-3'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 text-xs flex items-center gap-1 text-gray-500 px-2'
                        >
                          <ThumbsUp className='h-3 w-3' />
                          <span>Like (2)</span>
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 text-xs flex items-center gap-1 text-gray-500 px-2'
                        >
                          <Reply className='h-3 w-3' />
                          <span>Reply</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment 2 */}
                <div className='bg-gray-50 rounded-lg p-3'>
                  <div className='flex gap-2'>
                    <Avatar className='h-8 w-8 border bg-white'>
                      <AvatarImage src='/placeholder.svg?height=32&width=32' />
                      <AvatarFallback>JS</AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <p className='font-medium text-gray-900 text-sm'>Jane Smith</p>
                          <p className='text-gray-500 text-xs'>1 hour ago</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
                              <MoreHorizontal className='h-3.5 w-3.5' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className='mt-1 text-gray-800 text-xs'>
                        Some minor changes are needed. Could you please update the budget section to
                        include the quarterly breakdown?
                      </div>
                      <div className='mt-2 flex items-center gap-3'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 text-xs flex items-center gap-1 text-gray-500 px-2'
                        >
                          <ThumbsUp className='h-3 w-3' />
                          <span>Like</span>
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 text-xs flex items-center gap-1 text-gray-500 px-2'
                        >
                          <Reply className='h-3 w-3' />
                          <span>Reply</span>
                        </Button>
                      </div>

                      {/* Nested Reply */}
                      <div className='mt-2 ml-4 pt-2 border-t border-gray-200'>
                        <div className='flex gap-2'>
                          <Avatar className='h-6 w-6 border bg-white'>
                            <AvatarImage src='/placeholder.svg?height=24&width=24' />
                            <AvatarFallback>JD</AvatarFallback>
                          </Avatar>
                          <div className='flex-1'>
                            <div className='flex justify-between items-start'>
                              <div>
                                <p className='font-medium text-gray-900 text-xs'>John Doe</p>
                                <p className='text-gray-500 text-xs'>30 minutes ago</p>
                              </div>
                            </div>
                            <div className='mt-1 text-gray-800 text-xs'>
                              I&apos;ll update that right away and send a new version.
                            </div>
                            <div className='mt-1 flex items-center gap-3'>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-5 text-xs flex items-center gap-1 text-gray-500 px-2'
                              >
                                <ThumbsUp className='h-2.5 w-2.5' />
                                <span>Like (1)</span>
                              </Button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Comment 3 */}
                <div className='bg-gray-50 rounded-lg p-3'>
                  <div className='flex gap-2'>
                    <Avatar className='h-8 w-8 border bg-white'>
                      <AvatarImage src='/placeholder.svg?height=32&width=32' />
                      <AvatarFallback>JD</AvatarFallback>
                    </Avatar>
                    <div className='flex-1'>
                      <div className='flex justify-between items-start'>
                        <div>
                          <p className='font-medium text-gray-900 text-sm'>John Doe</p>
                          <p className='text-gray-500 text-xs'>20 minutes ago</p>
                        </div>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
                              <MoreHorizontal className='h-3.5 w-3.5' />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align='end'>
                            <DropdownMenuItem>Edit</DropdownMenuItem>
                            <DropdownMenuItem>Delete</DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </div>
                      <div className='mt-1 text-gray-800 text-xs'>
                        I&apos;ve uploaded a new version with the quarterly budget breakdown. Please
                        check the updated file.
                      </div>
                      <div className='mt-1 bg-gray-100 rounded p-1.5 flex items-center gap-2 text-xs'>
                        <FileText className='h-3.5 w-3.5 text-blue-500' />
                        <span className='text-blue-600 font-medium'>budget-breakdown-q1.xlsx</span>
                        <Button variant='ghost' size='sm' className='h-5 ml-auto p-0 w-5'>
                          <Download className='h-3 w-3' />
                        </Button>
                      </div>
                      <div className='mt-2 flex items-center gap-3'>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 text-xs flex items-center gap-1 text-gray-500 px-2'
                        >
                          <ThumbsUp className='h-3 w-3' />
                          <span>Like</span>
                        </Button>
                        <Button
                          variant='ghost'
                          size='sm'
                          className='h-6 text-xs flex items-center gap-1 text-gray-500 px-2'
                        >
                          <Reply className='h-3 w-3' />
                          <span>Reply</span>
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Add Comment - Fixed at bottom */}
              <div className='p-3 border-t bg-white'>
                <div className='flex gap-2'>
                  <Avatar className='h-8 w-8 border bg-white'>
                    <AvatarImage src='/placeholder.svg?height=32&width=32' />
                    <AvatarFallback>YO</AvatarFallback>
                  </Avatar>
                  <div className='flex-1'>
                    <div className='border rounded-lg overflow-hidden flex'>
                      <input
                        className='w-full p-2 text-xs focus:outline-none'
                        placeholder='Add a comment...'
                      />
                      <div className='flex items-center px-2 border-l bg-gray-50'>
                        <Button variant='ghost' size='sm' className='h-6 w-6 p-0'>
                          <Paperclip className='h-3.5 w-3.5' />
                        </Button>
                        <Button size='sm' className='ml-2 h-6 text-xs'>
                          Post
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Approval Actions - Fixed at bottom */}
          <div className='p-3 flex justify-end gap-3 border-t bg-gray-50'>
            <Button variant='outline' size='sm' className='h-8 text-xs flex items-center gap-1'>
              <XCircle className='h-3.5 w-3.5 text-red-500' />
              Reject
            </Button>
            <Button
              size='sm'
              className='h-8 text-xs flex items-center gap-1 bg-green-600 hover:bg-green-700'
            >
              <CheckCircle className='h-3.5 w-3.5' />
              Approve
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
