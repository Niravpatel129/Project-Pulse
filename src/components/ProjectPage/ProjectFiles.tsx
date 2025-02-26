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
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { FileType } from '@/lib/mock/projectFiles';
import { format } from 'date-fns';
import {
  Check,
  Clock,
  Download,
  Eye,
  FileClock,
  FilePlus,
  FileText,
  History,
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

export default function ProjectFiles() {
  const {
    // States
    activeTab,
    setActiveTab,
    search,
    setSearch,
    showUploadDialog,
    setShowUploadDialog,
    selectedFileType,
    setSelectedFileType,
    showFileDetailsDialog,
    setShowFileDetailsDialog,
    selectedFile,
    setSelectedFile,
    commentText,
    setCommentText,
    showSendEmailDialog,
    setShowSendEmailDialog,
    emailSubject,
    setEmailSubject,
    emailMessage,
    setEmailMessage,
    requestApproval,
    setRequestApproval,
    uploadedFiles,
    setUploadedFiles,
    showVersionHistoryDialog,
    setShowVersionHistoryDialog,
    selectedAttachment,
    setSelectedAttachment,
    changeDescription,
    setChangeDescription,
    showVersionCompareDialog,
    setShowVersionCompareDialog,
    compareVersions,
    setCompareVersions,
    notifyClient,
    setNotifyClient,
    showVariationDialog,
    setShowVariationDialog,
    variationName,
    setVariationName,
    variationDescription,
    setVariationDescription,
    files,
    setFiles,

    // Helper functions
    getFileIcon,
    getAttachmentIcon,
    getStatusBadgeClass,

    // Logic functions
    handleAddFile,
    filteredFiles,
    handleFileClick,
    handleAddComment,
    handleSendEmail,
    handleSimulateApproval,
    handleFileUpload,
    handleOpenVersionHistory,
    handleCreateNewVersion,
    handleRevertToVersion,
    handleCompareVersions,
    handleCreateVariation,
  } = useProjectFiles();

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
