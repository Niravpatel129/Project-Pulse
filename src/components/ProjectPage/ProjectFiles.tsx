'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { Plus, Search, X } from 'lucide-react';
import {
  FileDetailsDialog,
  FileTable,
  SendEmailDialog,
  UploadFileDialog,
  VersionHistoryDialog,
} from './FileComponents';

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
    showVersionHistoryDialog,
    setShowVersionHistoryDialog,
    selectedAttachment,
    setSelectedAttachment,
    changeDescription,
    setChangeDescription,
    notifyClient,
    setNotifyClient,
    products,
    handleAddProductToFileItem,

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
    handleAddAttachmentToFileItem,
  } = useProjectFiles();

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 pb-4'>
          <div>
            <CardTitle>Project File Items</CardTitle>
            <CardDescription>
              Manage all project documents and file items in one place
            </CardDescription>
          </div>
          <div className='flex space-x-2'>
            <div className='relative'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
              <Input
                type='search'
                placeholder='Search file items...'
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
              <Button onClick={() => setShowUploadDialog(true)}>
                <Plus className='mr-2 h-4 w-4' />
                Add File Item
              </Button>
              <UploadFileDialog
                selectedFileType={selectedFileType}
                setSelectedFileType={setSelectedFileType}
                handleFileUpload={handleFileUpload}
                handleAddFile={handleAddFile}
                uploadedFiles={uploadedFiles}
                onClose={() => setShowUploadDialog(false)}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='mb-4'>
              <TabsTrigger value='all'>All File Items</TabsTrigger>
              <TabsTrigger value='upload'>Uploads</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className='mt-0'>
              <FileTable
                filteredFiles={filteredFiles()}
                getFileIcon={getFileIcon}
                getAttachmentIcon={getAttachmentIcon}
                getStatusBadgeClass={getStatusBadgeClass}
                handleFileClick={handleFileClick}
                onViewDetails={(file) => {
                  setSelectedFile(file);
                  setShowFileDetailsDialog(true);
                }}
                onViewVersionHistory={(file, attachment) => {
                  setSelectedFile(file);
                  setSelectedAttachment(attachment);
                  setShowVersionHistoryDialog(true);
                }}
                onSendEmail={(file) => {
                  setSelectedFile(file);
                  setEmailSubject(`Files shared: ${file.name}`);
                  setEmailMessage(`I'm sharing the following files with you: ${file.name}`);
                  setShowSendEmailDialog(true);
                }}
                onSimulateApproval={(file) => {
                  setSelectedFile(file);
                  handleSimulateApproval();
                }}
                onCreateVariation={(file) => {
                  setSelectedFile(file);
                }}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* File Details Dialog */}
      <Dialog open={showFileDetailsDialog} onOpenChange={setShowFileDetailsDialog}>
        <FileDetailsDialog
          selectedFile={selectedFile}
          getAttachmentIcon={getAttachmentIcon}
          getStatusBadgeClass={getStatusBadgeClass}
          commentText={commentText}
          setCommentText={setCommentText}
          handleAddComment={handleAddComment}
          handleOpenVersionHistory={handleOpenVersionHistory}
          onSendEmail={() => {
            setEmailSubject(`Files shared: ${selectedFile?.name}`);
            setEmailMessage(`I'm sharing the following files with you: ${selectedFile?.name}`);
            setShowSendEmailDialog(true);
          }}
          handleFileUpload={handleFileUpload}
          uploadedFiles={uploadedFiles}
          handleAddAttachmentToFileItem={handleAddAttachmentToFileItem}
          products={products}
          handleAddProductToFileItem={handleAddProductToFileItem}
        />
      </Dialog>

      {/* Version History Dialog */}
      <Dialog open={showVersionHistoryDialog} onOpenChange={setShowVersionHistoryDialog}>
        <VersionHistoryDialog
          selectedAttachment={selectedAttachment}
          changeDescription={changeDescription}
          setChangeDescription={setChangeDescription}
          notifyClient={notifyClient}
          setNotifyClient={setNotifyClient}
          handleCreateNewVersion={handleCreateNewVersion}
          handleRevertToVersion={handleRevertToVersion}
          handleCompareVersions={handleCompareVersions}
        />
      </Dialog>

      {/* Send Email Dialog */}
      <Dialog open={showSendEmailDialog} onOpenChange={setShowSendEmailDialog}>
        <SendEmailDialog
          selectedFile={selectedFile}
          emailSubject={emailSubject}
          setEmailSubject={setEmailSubject}
          emailMessage={emailMessage}
          setEmailMessage={setEmailMessage}
          requestApproval={requestApproval}
          setRequestApproval={setRequestApproval}
          handleSendEmail={handleSendEmail}
          onClose={() => setShowSendEmailDialog(false)}
        />
      </Dialog>
    </div>
  );
}
