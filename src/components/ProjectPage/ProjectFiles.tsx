'use client';

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
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
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import {
  Check,
  Clock,
  Download,
  Eye,
  File,
  FileClock,
  FilePlus,
  FileText,
  History,
  Image,
  Link,
  Mail,
  MessageSquare,
  MoreHorizontal,
  Paperclip,
  Plus,
  RefreshCw,
  RotateCcw,
  Search,
  Send,
  Upload,
  X,
} from 'lucide-react';
import { useState } from 'react';

type FileType = 'proposal' | 'invoice' | 'contract' | 'questionnaire' | 'upload';

interface FileVersion {
  id: string;
  versionNumber: number;
  versionId: string;
  dateCreated: string;
  createdBy: string;
  changeDescription: string;
  size: string;
  url: string;
  isCurrent: boolean;
}

interface Attachment {
  id: string;
  name: string;
  size: string;
  type: string; // file extension or mime type
  url: string;
  thumbnailUrl?: string;
  versions?: FileVersion[]; // Add versions to attachments
}

interface Comment {
  id: string;
  text: string;
  author: string;
  authorRole: string;
  timestamp: string;
  avatarUrl?: string;
}

interface ProjectFile {
  id: string;
  name: string;
  type: FileType;
  dateUploaded: string;
  size: string;
  status?: 'draft' | 'sent' | 'signed' | 'paid' | 'viewed' | 'awaiting_approval';
  uploadedBy: string;
  attachments: Attachment[];
  comments: Comment[];
  description?: string;
  clientEmail?: string;
  needsApproval?: boolean;
  emailSent?: boolean;
  emailSentDate?: string;
  variation?: string; // Renamed from branch
  latestVersion?: string; // Renamed from latestCommit
}

export default function ProjectFiles() {
  const [activeTab, setActiveTab] = useState<string>('all');
  const [search, setSearch] = useState<string>('');
  const [showUploadDialog, setShowUploadDialog] = useState(false);
  const [selectedFileType, setSelectedFileType] = useState<FileType>('upload');
  const [showFileDetailsDialog, setShowFileDetailsDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<ProjectFile | null>(null);
  const [commentText, setCommentText] = useState('');
  const [showSendEmailDialog, setShowSendEmailDialog] = useState(false);
  const [emailSubject, setEmailSubject] = useState('');
  const [emailMessage, setEmailMessage] = useState('');
  const [requestApproval, setRequestApproval] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);

  // Version history related states
  const [showVersionHistoryDialog, setShowVersionHistoryDialog] = useState(false);
  const [selectedAttachment, setSelectedAttachment] = useState<Attachment | null>(null);
  const [changeDescription, setChangeDescription] = useState('');
  const [showVersionCompareDialog, setShowVersionCompareDialog] = useState(false);
  const [compareVersions, setCompareVersions] = useState<{
    older: FileVersion | null;
    newer: FileVersion | null;
  }>({ older: null, newer: null });
  const [notifyClient, setNotifyClient] = useState(false);

  // Variation related states (renamed from branch)
  const [showVariationDialog, setShowVariationDialog] = useState(false);
  const [variationName, setVariationName] = useState('');
  const [variationDescription, setVariationDescription] = useState('');

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
      variation: 'Main',
      latestVersion: 'v2',
      attachments: [
        {
          id: 'a1',
          name: 'proposal.pdf',
          size: '2.4 MB',
          type: 'pdf',
          url: '#',
          versions: [
            {
              id: 'v1',
              versionNumber: 1,
              versionId: 'a1b2c3d4',
              dateCreated: '2023-11-15T10:30:00Z',
              createdBy: 'Hitarth',
              changeDescription: 'Initial proposal draft',
              size: '2.1 MB',
              url: '#',
              isCurrent: false,
            },
            {
              id: 'v2',
              versionNumber: 2,
              versionId: 'e5f6g7h8',
              dateCreated: '2023-11-15T14:45:00Z',
              createdBy: 'Hitarth',
              changeDescription: 'Updated pricing details',
              size: '2.4 MB',
              url: '#',
              isCurrent: true,
            },
          ],
        },
      ],
      comments: [
        {
          id: 'c1',
          text: 'This looks great! Can we add more details about the engagement shoot?',
          author: 'Shannon',
          authorRole: 'Client',
          timestamp: '2023-11-16T14:30:00Z',
        },
      ],
      clientEmail: 'shannon@example.com',
      emailSent: true,
      emailSentDate: '2023-11-15',
    },
    {
      id: '2',
      name: 'Photography Contract',
      type: 'contract',
      dateUploaded: '2023-11-18',
      size: '1.8 MB',
      status: 'signed',
      uploadedBy: 'Hitarth',
      variation: 'Main',
      latestVersion: 'v1',
      attachments: [
        {
          id: 'a2',
          name: 'contract.pdf',
          size: '1.8 MB',
          type: 'pdf',
          url: '#',
          versions: [
            {
              id: 'v1',
              versionNumber: 1,
              versionId: 'i9j0k1l2',
              dateCreated: '2023-11-18T09:15:00Z',
              createdBy: 'Hitarth',
              changeDescription: 'Initial contract draft',
              size: '1.8 MB',
              url: '#',
              isCurrent: true,
            },
          ],
        },
      ],
      comments: [],
      clientEmail: 'shannon@example.com',
      emailSent: true,
      emailSentDate: '2023-11-18',
    },
    {
      id: '3',
      name: 'Initial Payment Invoice',
      type: 'invoice',
      dateUploaded: '2023-11-20',
      size: '0.5 MB',
      status: 'paid',
      uploadedBy: 'Hitarth',
      attachments: [
        {
          id: 'a3',
          name: 'invoice.pdf',
          size: '0.5 MB',
          type: 'pdf',
          url: '#',
        },
      ],
      comments: [],
      clientEmail: 'shannon@example.com',
      emailSent: true,
      emailSentDate: '2023-11-20',
    },
    {
      id: '4',
      name: 'Wedding Details Questionnaire',
      type: 'questionnaire',
      dateUploaded: '2023-11-21',
      size: '0.8 MB',
      status: 'viewed',
      uploadedBy: 'Sam',
      attachments: [
        {
          id: 'a4',
          name: 'questionnaire.docx',
          size: '0.8 MB',
          type: 'docx',
          url: '#',
        },
      ],
      comments: [],
      clientEmail: 'shannon@example.com',
      emailSent: true,
      emailSentDate: '2023-11-21',
    },
    {
      id: '5',
      name: 'Venue Photos',
      type: 'upload',
      dateUploaded: '2023-11-25',
      size: '15.2 MB',
      uploadedBy: 'Sam',
      attachments: [
        {
          id: 'a5-1',
          name: 'venue-front.jpg',
          size: '4.7 MB',
          type: 'jpg',
          url: '#',
          thumbnailUrl: '/placeholders/venue-thumb-1.jpg',
        },
        {
          id: 'a5-2',
          name: 'venue-garden.jpg',
          size: '5.1 MB',
          type: 'jpg',
          url: '#',
          thumbnailUrl: '/placeholders/venue-thumb-2.jpg',
        },
        {
          id: 'a5-3',
          name: 'venue-hall.jpg',
          size: '5.4 MB',
          type: 'jpg',
          url: '#',
          thumbnailUrl: '/placeholders/venue-thumb-3.jpg',
        },
      ],
      comments: [
        {
          id: 'c2',
          text: 'These are beautiful! Can you get some shots of the back garden area too?',
          author: 'Shannon',
          authorRole: 'Client',
          timestamp: '2023-11-26T10:15:00Z',
        },
        {
          id: 'c3',
          text: "Yes, I'll schedule another visit next week to capture those areas.",
          author: 'Sam',
          authorRole: 'Photographer',
          timestamp: '2023-11-26T11:30:00Z',
        },
      ],
      description: 'Photos from the venue scouting visit on November 25th.',
      clientEmail: 'shannon@example.com',
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
        return <Image className='h-5 w-5 text-gray-500' />;
    }
  };

  const getAttachmentIcon = (type: string) => {
    switch (type.toLowerCase()) {
      case 'pdf':
        return <FileText className='h-5 w-5 text-red-500' />;
      case 'docx':
      case 'doc':
        return <FileText className='h-5 w-5 text-blue-500' />;
      case 'jpg':
      case 'jpeg':
      case 'png':
        return <Image className='h-5 w-5 text-green-500' />;
      default:
        return <Paperclip className='h-5 w-5 text-gray-500' />;
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
      case 'awaiting_approval':
        return 'bg-purple-100 text-purple-600';
      default:
        return 'bg-gray-100 text-gray-600';
    }
  };

  const handleAddFile = () => {
    // Generate a simple ID (would use a proper UUID in production)
    const newId = (Math.max(...files.map((f) => parseInt(f.id))) + 1).toString();

    const newAttachments: Attachment[] = uploadedFiles.map((file, index) => ({
      id: `a-${newId}-${index}`,
      name: file.name,
      size: `${Math.round(file.size / 1024)} KB`,
      type: file.name.split('.').pop() || 'unknown',
      url: '#', // Would be a real URL in production
    }));

    const newFile: ProjectFile = {
      id: newId,
      name: `New ${
        selectedFileType === 'upload'
          ? 'Upload'
          : selectedFileType.charAt(0).toUpperCase() + selectedFileType.slice(1)
      }`,
      type: selectedFileType,
      dateUploaded: new Date().toISOString().split('T')[0],
      size:
        uploadedFiles.length > 0
          ? `${Math.round(uploadedFiles.reduce((total, file) => total + file.size, 0) / 1024)} KB`
          : '0.1 MB',
      status: selectedFileType === 'upload' ? undefined : 'draft',
      uploadedBy: 'Hitarth',
      attachments: newAttachments,
      comments: [],
    };

    setFiles([...files, newFile]);
    setShowUploadDialog(false);
    setUploadedFiles([]);
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

  const handleFileClick = (file: ProjectFile) => {
    setSelectedFile(file);
    setShowFileDetailsDialog(true);
  };

  const handleAddComment = () => {
    if (!selectedFile || !commentText.trim()) return;

    const newComment: Comment = {
      id: `c${Date.now()}`,
      text: commentText,
      author: 'Hitarth', // Would be current user in production
      authorRole: 'Photographer',
      timestamp: new Date().toISOString(),
    };

    const updatedFile = {
      ...selectedFile,
      comments: [...selectedFile.comments, newComment],
    };

    setFiles(files.map((file) => (file.id === selectedFile.id ? updatedFile : file)));
    setSelectedFile(updatedFile);
    setCommentText('');
  };

  const handleSendEmail = () => {
    if (!selectedFile) return;

    // In a real app, this would send an API request to send the email
    const updatedFile = {
      ...selectedFile,
      status: requestApproval ? 'awaiting_approval' : ('sent' as const),
      emailSent: true,
      emailSentDate: new Date().toISOString().split('T')[0],
      needsApproval: requestApproval,
    };
    setFiles(
      files.map((file) => (file.id === selectedFile.id ? (updatedFile as ProjectFile) : file)),
    );
    setSelectedFile(updatedFile as ProjectFile);
    setShowSendEmailDialog(false);
    setEmailSubject('');
    setEmailMessage('');
    setRequestApproval(false);
  };

  const handleSimulateApproval = () => {
    if (!selectedFile) return;

    // Simulate client approving the file
    const updatedFile = {
      ...selectedFile,
      status: 'signed' as const,
      needsApproval: false,
    };

    const newComment: Comment = {
      id: `c${Date.now()}`,
      text: "I've approved these files.",
      author: 'Shannon',
      authorRole: 'Client',
      timestamp: new Date().toISOString(),
    };

    updatedFile.comments = [...updatedFile.comments, newComment];

    setFiles(files.map((file) => (file.id === selectedFile.id ? updatedFile : file)));
    setSelectedFile(updatedFile);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setUploadedFiles(Array.from(e.target.files));
    }
  };

  // Version history handlers
  const handleOpenVersionHistory = (attachment: Attachment) => {
    setSelectedAttachment(attachment);
    setShowVersionHistoryDialog(true);
  };

  const handleCreateNewVersion = () => {
    if (!selectedFile || !selectedAttachment || !changeDescription.trim()) return;

    // Create a new version object
    const currentVersions = selectedAttachment.versions || [];
    const newVersionNumber =
      currentVersions.length > 0 ? Math.max(...currentVersions.map((v) => v.versionNumber)) + 1 : 1;

    // Create a simple version ID
    const versionId = `v${newVersionNumber}`;

    const newVersion: FileVersion = {
      id: `v${Date.now()}`,
      versionNumber: newVersionNumber,
      versionId,
      dateCreated: new Date().toISOString(),
      createdBy: 'Hitarth', // Would be current user in production
      changeDescription: changeDescription.trim(),
      size: selectedAttachment.size,
      url: '#', // Would be a real URL in production
      isCurrent: true,
    };

    // Set all other versions to not current
    const updatedVersions = currentVersions.map((v) => ({
      ...v,
      isCurrent: false,
    }));

    // Add new version
    updatedVersions.push(newVersion);

    // Update the attachment with new versions
    const updatedAttachment = {
      ...selectedAttachment,
      versions: updatedVersions,
    };

    // Update the file with the new attachment
    const updatedAttachments = selectedFile.attachments.map((att) =>
      att.id === selectedAttachment.id ? updatedAttachment : att,
    );

    const updatedFile = {
      ...selectedFile,
      attachments: updatedAttachments,
      latestVersion: versionId,
    };

    // Update files state
    setFiles(files.map((file) => (file.id === selectedFile.id ? updatedFile : file)));
    setSelectedFile(updatedFile);
    setSelectedAttachment(updatedAttachment);
    setChangeDescription('');

    // If notify client is checked, prepare email
    if (notifyClient && selectedFile.clientEmail) {
      setEmailSubject(`New version uploaded: ${selectedFile.name}`);
      setEmailMessage(
        `I've uploaded a new version of ${selectedFile.name} with the following changes:\n\n${changeDescription}`,
      );
      setShowVersionHistoryDialog(false);
      setShowSendEmailDialog(true);
    } else {
      // Close the dialog after creating a new version
      setShowVersionHistoryDialog(false);
    }

    // Reset notify client checkbox
    setNotifyClient(false);
  };

  const handleRevertToVersion = (version: FileVersion) => {
    if (!selectedFile || !selectedAttachment) return;

    // Update all versions, setting only the selected one to current
    const updatedVersions = (selectedAttachment.versions || []).map((v) => ({
      ...v,
      isCurrent: v.id === version.id,
    }));

    // Update the attachment
    const updatedAttachment = {
      ...selectedAttachment,
      size: version.size, // Update size to match reverted version
      versions: updatedVersions,
    };

    // Update the file
    const updatedAttachments = selectedFile.attachments.map((att) =>
      att.id === selectedAttachment.id ? updatedAttachment : att,
    );

    const updatedFile = {
      ...selectedFile,
      attachments: updatedAttachments,
      latestVersion: version.versionId,
    };

    // Update files state
    setFiles(files.map((file) => (file.id === selectedFile.id ? updatedFile : file)));
    setSelectedFile(updatedFile);
    setSelectedAttachment(updatedAttachment);

    // Create a reversion comment
    const newComment: Comment = {
      id: `c${Date.now()}`,
      text: `Restored version ${version.versionNumber} (${version.changeDescription})`,
      author: 'Hitarth', // Would be current user in production
      authorRole: 'Photographer',
      timestamp: new Date().toISOString(),
    };

    // Add the comment to the file
    const updatedFileWithComment = {
      ...updatedFile,
      comments: [...updatedFile.comments, newComment],
    };

    setFiles(files.map((file) => (file.id === selectedFile.id ? updatedFileWithComment : file)));
    setSelectedFile(updatedFileWithComment);
  };

  const handleCompareVersions = (olderVersion: FileVersion, newerVersion: FileVersion) => {
    setCompareVersions({
      older: olderVersion,
      newer: newerVersion,
    });
    setShowVersionCompareDialog(true);
  };

  const handleCreateVariation = () => {
    if (!selectedFile || !variationName.trim()) return;

    // Create a new variation by copying the file with a new name
    const newId = (Math.max(...files.map((f) => parseInt(f.id))) + 1).toString();

    const newFile: ProjectFile = {
      ...selectedFile,
      id: newId,
      name: `${selectedFile.name} (${variationName})`,
      variation: variationName,
      description: variationDescription || `Variation of ${selectedFile.name}`,
      comments: [], // Start with no comments on the new variation
    };

    setFiles([...files, newFile]);
    setShowVariationDialog(false);
    setVariationName('');
    setVariationDescription('');
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
              <DialogContent className='max-w-md'>
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
                        <SelectItem value='upload'>Upload Files</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='file-upload'>Upload Files</Label>
                    <div className='border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center'>
                      <Upload className='h-8 w-8 text-gray-400 mb-2' />
                      <p className='text-sm text-gray-500 mb-2'>Drag and drop your files here</p>
                      <Input
                        id='file-upload'
                        type='file'
                        className='hidden'
                        multiple
                        onChange={handleFileUpload}
                      />
                      <Button
                        size='sm'
                        variant='outline'
                        onClick={() => document.getElementById('file-upload')?.click()}
                      >
                        Browse Files
                      </Button>
                    </div>

                    {uploadedFiles.length > 0 && (
                      <div className='mt-4'>
                        <Label>Selected Files</Label>
                        <div className='mt-2 space-y-2 max-h-40 overflow-y-auto p-2 border rounded'>
                          {uploadedFiles.map((file, index) => (
                            <div key={index} className='flex justify-between items-center text-sm'>
                              <div className='flex items-center'>
                                <Paperclip className='h-4 w-4 text-gray-500 mr-2' />
                                <span>{file.name}</span>
                              </div>
                              <span className='text-gray-500'>
                                {Math.round(file.size / 1024)} KB
                              </span>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='doc-name'>File Group Name</Label>
                    <Input id='doc-name' placeholder='Wedding Venue Photos' />
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='description'>Description (Optional)</Label>
                    <Textarea
                      id='description'
                      placeholder='Add a description of these files...'
                      rows={3}
                    />
                  </div>

                  <div className='flex items-center space-x-2'>
                    <Switch id='send-email' />
                    <Label htmlFor='send-email'>Send email notification to client</Label>
                  </div>
                </div>
                <DialogFooter>
                  <Button variant='outline' onClick={() => setShowUploadDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddFile} disabled={uploadedFiles.length === 0}>
                    Upload Files
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
                        <th className='px-4 py-3 text-sm font-medium'>Files</th>
                        <th className='px-4 py-3 text-sm font-medium'>Date</th>
                        <th className='px-4 py-3 text-sm font-medium'>Size</th>
                        <th className='px-4 py-3 text-sm font-medium'>Status</th>
                        <th className='px-4 py-3 text-sm font-medium'>Comments</th>
                        <th className='px-4 py-3 text-sm font-medium'></th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredFiles().map((file) => (
                        <tr
                          key={file.id}
                          className='border-b hover:bg-gray-50 cursor-pointer'
                          onClick={() => handleFileClick(file)}
                        >
                          <td className='px-4 py-3'>
                            <div className='flex items-center'>
                              {getFileIcon(file.type)}
                              <span className='ml-2'>{file.name}</span>
                            </div>
                          </td>
                          <td className='px-4 py-3'>
                            <div className='flex items-center'>
                              {file.attachments.length > 0 && (
                                <>
                                  <div className='w-8 h-8 rounded border bg-gray-100 flex items-center justify-center'>
                                    {getAttachmentIcon(file.attachments[0].type)}
                                  </div>
                                  {file.attachments.length > 1 && (
                                    <span className='ml-2 text-xs text-gray-500'>
                                      +{file.attachments.length - 1}
                                    </span>
                                  )}
                                </>
                              )}
                            </div>
                          </td>
                          <td className='px-4 py-3'>{file.dateUploaded}</td>
                          <td className='px-4 py-3'>{file.size}</td>
                          <td className='px-4 py-3'>
                            {file.status && (
                              <span
                                className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                                  file.status,
                                )}`}
                              >
                                {file.status.replace('_', ' ')}
                              </span>
                            )}
                          </td>
                          <td className='px-4 py-3'>
                            <div className='flex items-center'>
                              <MessageSquare className='h-4 w-4 text-gray-500 mr-1' />
                              <span>{file.comments.length}</span>
                            </div>
                          </td>
                          <td className='px-4 py-3' onClick={(e) => e.stopPropagation()}>
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <Button variant='ghost' size='icon'>
                                  <MoreHorizontal className='h-4 w-4' />
                                </Button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align='end'>
                                <DropdownMenuLabel>Actions</DropdownMenuLabel>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                  onClick={() => {
                                    setSelectedFile(file);
                                    setShowFileDetailsDialog(true);
                                  }}
                                >
                                  <FileText className='mr-2 h-4 w-4' />
                                  View Details
                                </DropdownMenuItem>
                                <DropdownMenuItem>
                                  <Download className='mr-2 h-4 w-4' />
                                  Download All
                                </DropdownMenuItem>
                                {file.attachments[0]?.versions &&
                                  file.attachments[0].versions.length > 0 && (
                                    <DropdownMenuItem
                                      onClick={() => {
                                        setSelectedFile(file);
                                        setSelectedAttachment(file.attachments[0]);
                                        setShowVersionHistoryDialog(true);
                                      }}
                                    >
                                      <History className='mr-2 h-4 w-4' />
                                      View Version History
                                    </DropdownMenuItem>
                                  )}
                                {!file.emailSent && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedFile(file);
                                      setEmailSubject(`Files shared: ${file.name}`);
                                      setEmailMessage(
                                        `I'm sharing the following files with you: ${file.name}`,
                                      );
                                      setShowSendEmailDialog(true);
                                    }}
                                  >
                                    <Mail className='mr-2 h-4 w-4' />
                                    Email to Client
                                  </DropdownMenuItem>
                                )}
                                {file.status === 'awaiting_approval' && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedFile(file);
                                      handleSimulateApproval();
                                    }}
                                  >
                                    <Check className='mr-2 h-4 w-4' />
                                    Simulate Approval
                                  </DropdownMenuItem>
                                )}
                                {file.variation && (
                                  <DropdownMenuItem
                                    onClick={() => {
                                      setSelectedFile(file);
                                      setShowVariationDialog(true);
                                    }}
                                  >
                                    <FilePlus className='mr-2 h-4 w-4' />
                                    Create Variation
                                  </DropdownMenuItem>
                                )}
                                <DropdownMenuSeparator />
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

      {/* File Details Dialog */}
      <Dialog open={showFileDetailsDialog} onOpenChange={setShowFileDetailsDialog}>
        <DialogHeader className='sr-only'>
          <DialogTitle>{selectedFile?.name}</DialogTitle>
        </DialogHeader>
        <DialogContent className='max-w-4xl h-[80vh]'>
          {selectedFile && (
            <>
              <div className='flex flex-col md:flex-row h-full overflow-hidden'>
                {/* Left side - file details and attachments */}
                <div className='w-full md:w-2/3 pr-0 md:pr-4 overflow-y-auto'>
                  {selectedFile.description && (
                    <div className='mb-4'>
                      <h4 className='text-sm font-medium mb-1'>Description</h4>
                      <p className='text-sm text-gray-600'>{selectedFile.description}</p>
                    </div>
                  )}

                  <div className='mb-4'>
                    <h2 className='text-lg font-medium mb-1'>{selectedFile.name}</h2>

                    <h4 className='text-sm font-medium mb-1'>Status</h4>
                    {selectedFile.status ? (
                      <span
                        className={`px-2 py-1 rounded-full text-xs ${getStatusBadgeClass(
                          selectedFile.status,
                        )}`}
                      >
                        {selectedFile.status.replace('_', ' ')}
                      </span>
                    ) : (
                      <span className='text-sm text-gray-600'>No status</span>
                    )}
                  </div>

                  {selectedFile.emailSent && (
                    <div className='mb-4'>
                      <h4 className='text-sm font-medium mb-1'>Email Status</h4>
                      <div className='flex items-center'>
                        <Mail className='h-4 w-4 text-green-500 mr-2' />
                        <span className='text-sm'>
                          Sent to {selectedFile.clientEmail} on {selectedFile.emailSentDate}
                        </span>
                      </div>
                    </div>
                  )}

                  <div className='mb-6'>
                    <h4 className='text-sm font-medium mb-2'>Files</h4>
                    <div className='space-y-2'>
                      {selectedFile.attachments.map((attachment) => (
                        <div
                          key={attachment.id}
                          className='flex items-center justify-between p-2 border rounded hover:bg-gray-50'
                        >
                          <div className='flex items-center'>
                            {getAttachmentIcon(attachment.type)}
                            <span className='ml-2 text-sm'>{attachment.name}</span>
                          </div>
                          <div className='flex items-center'>
                            <span className='text-xs text-gray-500 mr-3'>{attachment.size}</span>
                            {attachment.versions && attachment.versions.length > 1 && (
                              <Button
                                variant='outline'
                                size='sm'
                                className='mr-2'
                                onClick={() => handleOpenVersionHistory(attachment)}
                              >
                                <History className='h-4 w-4 mr-1' />
                                <span className='text-xs'>
                                  {attachment.versions.length} versions
                                </span>
                              </Button>
                            )}
                            <Button variant='ghost' size='icon'>
                              <Download className='h-4 w-4' />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className='flex justify-end space-x-2 mt-4'>
                    {!selectedFile.emailSent && (
                      <Button
                        onClick={() => {
                          setEmailSubject(`Files shared: ${selectedFile.name}`);
                          setEmailMessage(
                            `I'm sharing the following files with you: ${selectedFile.name}`,
                          );
                          setShowSendEmailDialog(true);
                        }}
                      >
                        <Mail className='mr-2 h-4 w-4' />
                        Email to Client
                      </Button>
                    )}
                    <Button variant='outline'>
                      <Link className='mr-2 h-4 w-4' />
                      Copy Share Link
                    </Button>
                  </div>
                </div>

                {/* Right side - comments */}
                <div className='w-full md:w-1/3 mt-4 md:mt-0 border-t md:border-t-0 md:border-l pt-4 md:pt-0 md:pl-4 flex flex-col h-full'>
                  <h4 className='text-sm font-medium mb-2'>Comments</h4>

                  <div className='flex-grow overflow-y-auto mb-4 space-y-4'>
                    {selectedFile.comments.length === 0 ? (
                      <p className='text-sm text-gray-500'>No comments yet</p>
                    ) : (
                      selectedFile.comments.map((comment) => (
                        <div key={comment.id} className='flex space-x-3'>
                          <Avatar className='h-8 w-8'>
                            {comment.avatarUrl ? (
                              <AvatarImage src={comment.avatarUrl} alt={comment.author} />
                            ) : (
                              <AvatarFallback>{comment.author.charAt(0)}</AvatarFallback>
                            )}
                          </Avatar>
                          <div>
                            <div className='flex items-center space-x-2'>
                              <span className='font-medium text-sm'>{comment.author}</span>
                              <span className='text-xs text-gray-500'>{comment.authorRole}</span>
                            </div>
                            <p className='text-sm mt-1'>{comment.text}</p>
                            <p className='text-xs text-gray-500 mt-1'>
                              {format(new Date(comment.timestamp), 'MMM d, yyyy h:mm a')}
                            </p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className='border-t pt-4'>
                    <Textarea
                      placeholder='Add a comment...'
                      value={commentText}
                      onChange={(e) => setCommentText(e.target.value)}
                      className='resize-none'
                      rows={3}
                    />
                    <div className='flex justify-end mt-2'>
                      <Button onClick={handleAddComment} disabled={!commentText.trim()}>
                        <Send className='mr-2 h-4 w-4' />
                        Send
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistoryDialog} onOpenChange={setShowVersionHistoryDialog}>
        <DialogContent className='max-w-3xl'>
          <DialogHeader>
            <DialogTitle>Version History</DialogTitle>
            <DialogDescription>
              {selectedAttachment?.name} - Track changes and manage file versions
            </DialogDescription>
          </DialogHeader>

          <div className='py-4'>
            {/* New version form */}
            <div className='mb-6 p-4 border rounded-md bg-gray-50'>
              <h4 className='text-sm font-medium mb-2'>Upload New Version</h4>
              <div className='flex flex-col gap-3'>
                <div className='flex'>
                  <div className='flex-grow'>
                    <Label htmlFor='change-description' className='text-xs'>
                      What changed in this version?
                    </Label>
                    <Textarea
                      id='change-description'
                      placeholder='Describe what changes you made to the design...'
                      value={changeDescription}
                      onChange={(e) => setChangeDescription(e.target.value)}
                      rows={2}
                    />
                  </div>
                </div>

                <div className='border-2 border-dashed rounded-md p-4 flex flex-col items-center justify-center'>
                  <Upload className='h-8 w-8 text-gray-400 mb-2' />
                  <p className='text-sm text-gray-500 mb-2'>Drag and drop your updated file here</p>
                  <Button
                    size='sm'
                    variant='outline'
                    onClick={() => document.getElementById('version-file-upload')?.click()}
                  >
                    Browse Files
                  </Button>
                  <Input id='version-file-upload' type='file' className='hidden' />
                </div>

                <div className='flex justify-between items-center'>
                  <div className='flex items-center space-x-2'>
                    <Switch
                      id='notify-client'
                      checked={notifyClient}
                      onCheckedChange={setNotifyClient}
                    />
                    <Label htmlFor='notify-client' className='text-sm'>
                      Notify client(s) about this update
                    </Label>
                  </div>
                  <Button onClick={handleCreateNewVersion} disabled={!changeDescription.trim()}>
                    <Plus className='h-4 w-4 mr-1' />
                    Save as New Version
                  </Button>
                </div>
              </div>
            </div>

            {/* Version timeline */}
            <div className='mb-4'>
              <h4 className='text-sm font-medium mb-2'>Version Timeline</h4>
              <div className='relative pt-2 pb-2'>
                <div className='absolute left-4 top-0 bottom-0 w-0.5 bg-gray-200'></div>
                <div className='space-y-4'>
                  {selectedAttachment?.versions?.map((version, index, versions) => (
                    <div key={version.id} className='relative pl-12'>
                      <div
                        className={`absolute left-0 top-2 h-8 w-8 rounded-full flex items-center justify-center ${
                          version.isCurrent ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-600'
                        }`}
                      >
                        {version.isCurrent ? (
                          <Check className='h-5 w-5' />
                        ) : (
                          <span>{version.versionNumber}</span>
                        )}
                      </div>
                      <div
                        className={`p-3 border rounded-md ${
                          version.isCurrent ? 'bg-blue-50 border-blue-200' : 'bg-white'
                        }`}
                      >
                        <div className='flex items-start justify-between'>
                          <div>
                            <div className='flex items-center mb-1'>
                              {version.isCurrent ? (
                                <span className='bg-blue-100 text-blue-700 text-xs px-2 py-0.5 rounded-full mr-2'>
                                  Current
                                </span>
                              ) : (
                                <span className='text-xs text-gray-500'>
                                  Version {version.versionNumber}
                                </span>
                              )}
                              <span className='text-sm font-medium ml-2'>
                                {version.changeDescription}
                              </span>
                            </div>
                            <div className='flex items-center text-xs text-gray-500'>
                              <Clock className='h-3 w-3 mr-1' />
                              <span className='mr-2'>
                                {format(new Date(version.dateCreated), 'MMM d, yyyy h:mm a')}
                              </span>
                              <span className='mr-2'>• by {version.createdBy}</span>
                            </div>
                          </div>
                          <div className='flex items-center'>
                            {!version.isCurrent && (
                              <Button
                                variant='outline'
                                size='sm'
                                className='mr-2'
                                onClick={() => handleRevertToVersion(version)}
                              >
                                <RefreshCw className='h-3 w-3 mr-1' />
                                Restore
                              </Button>
                            )}
                            <Button variant='ghost' size='sm'>
                              <Eye className='h-3 w-3 mr-1' />
                              View
                            </Button>
                            <Button variant='ghost' size='sm'>
                              <Download className='h-3 w-3 mr-1' />
                              Download
                            </Button>
                          </div>
                        </div>

                        {/* Compare with previous version button */}
                        {index < versions.length - 1 && (
                          <div className='mt-2 flex justify-end'>
                            <Button
                              variant='ghost'
                              size='sm'
                              className='text-xs'
                              onClick={() => handleCompareVersions(versions[index + 1], version)}
                            >
                              <History className='h-3 w-3 mr-1' />
                              Compare with Version {versions[index + 1].versionNumber}
                            </Button>
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Version Compare Dialog */}
      <Dialog open={showVersionCompareDialog} onOpenChange={setShowVersionCompareDialog}>
        <DialogContent className='max-w-4xl h-[80vh]'>
          <DialogHeader>
            <DialogTitle>Compare Versions</DialogTitle>
            <DialogDescription>
              Comparing Version {compareVersions.older?.versionNumber} with Version{' '}
              {compareVersions.newer?.versionNumber}
            </DialogDescription>
          </DialogHeader>

          <div className='h-full overflow-hidden py-4'>
            <div className='flex justify-between mb-4'>
              <div className='flex-1 border-r pr-4'>
                <div className='flex items-center mb-2'>
                  <span className='text-sm font-medium mr-3'>
                    Version {compareVersions.older?.versionNumber}
                  </span>
                  <span className='text-xs text-gray-500'>
                    {compareVersions.older?.dateCreated &&
                      format(new Date(compareVersions.older.dateCreated), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className='text-sm text-gray-700 mb-2'>
                  {compareVersions.older?.changeDescription}
                </div>
              </div>
              <div className='flex-1 pl-4'>
                <div className='flex items-center mb-2'>
                  <span className='text-sm font-medium mr-3'>
                    Version {compareVersions.newer?.versionNumber}
                  </span>
                  <span className='text-xs text-gray-500'>
                    {compareVersions.newer?.dateCreated &&
                      format(new Date(compareVersions.newer.dateCreated), 'MMM d, yyyy h:mm a')}
                  </span>
                </div>
                <div className='text-sm text-gray-700 mb-2'>
                  {compareVersions.newer?.changeDescription}
                </div>
              </div>
            </div>

            {/* Comparison view */}
            <div className='border rounded-md h-[calc(100%-120px)] overflow-hidden flex'>
              {/* Left side: older version */}
              <div className='w-1/2 border-r overflow-auto p-1'>
                <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                  <div className='text-center p-4'>
                    <FileClock className='mx-auto h-12 w-12 text-gray-400 mb-2' />
                    <p className='text-sm text-gray-500'>
                      Version {compareVersions.older?.versionNumber} Preview
                    </p>
                  </div>
                </div>
              </div>

              {/* Right side: newer version */}
              <div className='w-1/2 overflow-auto p-1'>
                <div className='w-full h-full bg-gray-100 flex items-center justify-center'>
                  <div className='text-center p-4'>
                    <FileClock className='mx-auto h-12 w-12 text-gray-400 mb-2' />
                    <p className='text-sm text-gray-500'>
                      Version {compareVersions.newer?.versionNumber} Preview
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant='outline'
              onClick={() => handleRevertToVersion(compareVersions.older!)}
              disabled={!compareVersions.older}
            >
              <RotateCcw className='h-4 w-4 mr-1' />
              Restore Version {compareVersions.older?.versionNumber}
            </Button>
            <Button variant='default' onClick={() => setShowVersionCompareDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Variation Dialog */}
      <Dialog open={showVariationDialog} onOpenChange={setShowVariationDialog}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Create New Variation</DialogTitle>
            <DialogDescription>Create a new variation from {selectedFile?.name}</DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='variation-name'>Variation Name</Label>
              <Input
                id='variation-name'
                placeholder='Client Feedback Version'
                value={variationName}
                onChange={(e) => setVariationName(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='variation-description'>Description (Optional)</Label>
              <Textarea
                id='variation-description'
                placeholder='Describe the purpose of this variation...'
                value={variationDescription}
                onChange={(e) => setVariationDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowVariationDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleCreateVariation} disabled={!variationName.trim()}>
              <FilePlus className='mr-2 h-4 w-4' />
              Create Variation
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={showSendEmailDialog} onOpenChange={setShowSendEmailDialog}>
        <DialogContent className='max-w-md'>
          <DialogHeader>
            <DialogTitle>Send Files to Client</DialogTitle>
            <DialogDescription>Email these files directly to your client.</DialogDescription>
          </DialogHeader>

          <div className='space-y-4 py-4'>
            <div className='space-y-2'>
              <Label htmlFor='client-email'>To</Label>
              <Input
                id='client-email'
                value={selectedFile?.clientEmail || 'client@example.com'}
                readOnly
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email-subject'>Subject</Label>
              <Input
                id='email-subject'
                value={emailSubject}
                onChange={(e) => setEmailSubject(e.target.value)}
              />
            </div>

            <div className='space-y-2'>
              <Label htmlFor='email-message'>Message</Label>
              <Textarea
                id='email-message'
                value={emailMessage}
                onChange={(e) => setEmailMessage(e.target.value)}
                rows={4}
              />
            </div>

            <div className='flex items-center space-x-2'>
              <Switch
                id='request-approval'
                checked={requestApproval}
                onCheckedChange={setRequestApproval}
              />
              <Label htmlFor='request-approval'>Request Approval</Label>
            </div>

            {requestApproval && (
              <div className='rounded bg-gray-50 p-3 text-sm'>
                <p className='flex items-center text-gray-700'>
                  <Clock className='h-4 w-4 mr-2' />
                  Client will receive an approval request that they can accept or decline.
                </p>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant='outline' onClick={() => setShowSendEmailDialog(false)}>
              Cancel
            </Button>
            <Button onClick={handleSendEmail}>
              <Send className='mr-2 h-4 w-4' />
              Send Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
