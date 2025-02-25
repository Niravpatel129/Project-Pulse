'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Check, Download, File, MoreHorizontal, Plus, Search, Upload, X } from 'lucide-react';
import { useState } from 'react';

type FileType = 'proposal' | 'invoice' | 'contract' | 'questionnaire' | 'upload';

interface ProjectFile {
  id: string;
  name: string;
  type: FileType;
  dateUploaded: string;
  size: string;
  status?: 'draft' | 'sent' | 'signed' | 'paid' | 'viewed';
  uploadedBy: string;
}

export default function ProjectFiles() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState<FileType>('upload');

  // Example files data
  const [files, setFiles] = useState<ProjectFile[]>([
    {
      id: '1',
      name: 'Wedding Photography Proposal',
      type: 'proposal',
      dateUploaded: '2023-11-15',
      size: '2.4 MB',
      status: 'sent',
      uploadedBy: 'Hitarth',
    },
    {
      id: '2',
      name: 'Photography Contract',
      type: 'contract',
      dateUploaded: '2023-11-18',
      size: '1.8 MB',
      status: 'signed',
      uploadedBy: 'Hitarth',
    },
    {
      id: '3',
      name: 'Initial Payment Invoice',
      type: 'invoice',
      dateUploaded: '2023-11-20',
      size: '0.5 MB',
      status: 'paid',
      uploadedBy: 'Hitarth',
    },
    {
      id: '4',
      name: 'Wedding Details Questionnaire',
      type: 'questionnaire',
      dateUploaded: '2023-11-21',
      size: '0.8 MB',
      status: 'viewed',
      uploadedBy: 'Sam',
    },
    {
      id: '5',
      name: 'Venue Photos',
      type: 'upload',
      dateUploaded: '2023-11-25',
      size: '15.2 MB',
      uploadedBy: 'Sam',
    },
  ]);

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'proposal':
        return <File className='h-5 w-5 text-blue-500' />;
      case 'invoice':
        return <File className='h-5 w-5 text-green-500' />;
      case 'contract':
        return <File className='h-5 w-5 text-purple-500' />;
      case 'questionnaire':
        return <File className='h-5 w-5 text-orange-500' />;
      case 'upload':
        return <File className='h-5 w-5 text-gray-500' />;
    }
  };

  const getStatusBadgeClass = (status?: string) => {
    if (!status) return 'bg-gray-100 text-gray-600';

    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-600';
      case 'sent':
        return 'bg-blue-100 text-blue-600';
      case 'signed':
        return 'bg-green-100 text-green-600';
      case 'paid':
        return 'bg-emerald-100 text-emerald-600';
      case 'viewed':
        return 'bg-amber-100 text-amber-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleAddFile = () => {
    // Generate a simple ID (would use a proper UUID in production)
    const newId = (Math.max(...files.map((f) => parseInt(f.id))) + 1).toString();

    const newFile: ProjectFile = {
      id: newId,
      name: `New ${selectedFileType.charAt(0).toUpperCase() + selectedFileType.slice(1)}`,
      type: selectedFileType,
      dateUploaded: new Date().toISOString().split('T')[0],
      size: '0.1 MB',
      status: selectedFileType === 'upload' ? undefined : 'draft',
      uploadedBy: 'Hitarth',
    };

    setFiles([...files, newFile]);
    setShowUploadDialog(false);
  };

  const filteredFiles = () => {
    let filtered = files;

    // Filter by search
    if (search) {
      const searchLower = search.toLowerCase();
      filtered = filtered.filter(
        (file) =>
          file.name.toLowerCase().includes(searchLower) ||
          file.type.toLowerCase().includes(searchLower) ||
          file.uploadedBy.toLowerCase().includes(searchLower),
      );
    }

    // Filter by tab
    if (activeTab !== 'all') {
      filtered = filtered.filter((file) => file.type === activeTab);
    }

    return filtered;
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 pb-4'>
          <div>
            <CardTitle>Project Files</CardTitle>
            <CardDescription>Manage all project documents in one place</CardDescription>
          </div>
          <div className='flex space-x-2'>
            <div className='relative'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
              <Input
                type='search'
                placeholder='Search files...'
                className='w-full sm:w-[250px] pl-8'
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
              {search && (
                <button
                  onClick={() => setSearch('')}
                  className='absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700'
                >
                  <X className='h-4 w-4' />
                </button>
              )}
            </div>
            <Dialog open={showUploadDialog} onOpenChange={setShowUploadDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className='mr-2 h-4 w-4' />
                  Add File
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Add New File</DialogTitle>
                  <DialogDescription>
                    Choose a file type and upload or create a new document.
                  </DialogDescription>
                </DialogHeader>
                <div className='space-y-4 py-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='file-type'>File Type</Label>
                    <Select
                      value={selectedFileType}
                      onValueChange={(val) => setSelectedFileType(val as FileType)}
                    >
                      <SelectTrigger id='file-type'>
                        <SelectValue placeholder='Select file type' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='proposal'>Proposal</SelectItem>
                        <SelectItem value='invoice'>Invoice</SelectItem>
                        <SelectItem value='contract'>Contract</SelectItem>
                        <SelectItem value='questionnaire'>Questionnaire</SelectItem>
                        <SelectItem value='upload'>Upload File</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  {selectedFileType === 'upload' ? (
                    <div className='space-y-2'>
                      <Label htmlFor='file-upload'>Upload File</Label>
                      <div className='border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center'>
                        <Upload className='h-8 w-8 text-gray-400 mb-2' />
                        <p className='text-sm text-gray-500 mb-2'>Drag and drop your file here</p>
                        <Button size='sm' variant='outline'>
                          Browse Files
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className='space-y-2'>
                      <Label htmlFor='doc-name'>Document Name</Label>
                      <Input
                        id='doc-name'
                        placeholder={`New ${
                          selectedFileType.charAt(0).toUpperCase() + selectedFileType.slice(1)
                        }`}
                      />
                    </div>
                  )}
                </div>
                <DialogFooter>
                  <Button variant='outline' onClick={() => setShowUploadDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddFile}>
                    {selectedFileType === 'upload' ? 'Upload' : 'Create'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='mb-4'>
              <TabsTrigger value='all'>All Files</TabsTrigger>
              <TabsTrigger value='proposal'>Proposals</TabsTrigger>
              <TabsTrigger value='invoice'>Invoices</TabsTrigger>
              <TabsTrigger value='contract'>Contracts</TabsTrigger>
              <TabsTrigger value='questionnaire'>Questionnaires</TabsTrigger>
              <TabsTrigger value='upload'>Uploads</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className='mt-0'>
              {filteredFiles().length === 0 ? (
                <div className='text-center py-10'>
                  <p className='text-gray-500'>No files found</p>
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='w-full'>
                    <thead>
                      <tr className='border-b text-left'>
                        <th className='px-4 py-3 text-sm font-medium'>Name</th>
                        <th className='px-4 py-3 text-sm font-medium'>Type</th>
                        <th className='px-4 py-3 text-sm font-medium'>Date</th>
                        <th className='px-4 py-3 text-sm font-medium'>Size</th>
                        <th className='px-4 py-3 text-sm font-medium'>Status</th>
                        <th className='px-4 py-3 text-sm font-medium'>Uploaded By</th>
                        <th className='px-4 py-3 text-sm font-medium'></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles().map((file) => (
                        <tr key={file.id} className='border-b hover:bg-gray-50'>
                          <td className='px-4 py-3'>
                            <div className='flex items-center'>
                              {getFileIcon(file.type)}
                              <span className='ml-2'>{file.name}</span>
                            </div>
                          </td>
                          <td className='px-4 py-3 capitalize'>{file.type}</td>
                          <td className='px-4 py-3'>{file.dateUploaded}</td>
                          <td className='px-4 py-3'>{file.size}</td>
                          <td className='px-4 py-3'>
                            {file.status && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                                  file.status,
                                )}`}
                              >
                                {file.status}
                              </span>
                            )}
                          </td>
                          <td className='px-4 py-3'>{file.uploadedBy}</td>
                          <td className='px-4 py-3'>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='icon'>
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem>
                                  <Download className='mr-2 h-4 w-4' />
                                  Download
                                </DropdownMenuItem>
                                {file.type !== 'upload' && file.status === 'draft' && (
                                  <DropdownMenuItem>
                                    <Check className='mr-2 h-4 w-4' />
                                    Mark as Sent
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuItem className='text-red-600'>
                                  <X className='mr-2 h-4 w-4' />
                                  Delete
                                </DropdownMenuItem>
                              </DropdownMenuContent>
                            </DropdownMenu>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
