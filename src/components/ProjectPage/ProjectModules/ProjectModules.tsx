'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProject } from '@/contexts/ProjectContext';
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { newRequest } from '@/utils/newRequest';
import { Plus, Search, X } from 'lucide-react';
import { useState } from 'react';
import {
  FileDetailsDialog,
  FileTable,
  InventoryReportModal,
  ProductionTrackingModal,
  SendEmailDialog,
  VersionHistoryDialog,
} from '../FileComponents';
import CreateModuleDialog from '../FileComponents/CreateModuleDialog';
import InvoiceCreatorModal from '../InvoiceCreatorModal';

export default function ProjectModules() {
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

    // File-related states
    files,
    selectedFile,
    setSelectedFile,
    getFileIcon,
    getAttachmentIcon,
    getStatusBadgeClass,

    // Dialog states
    showFileDetailsDialog,
    setShowFileDetailsDialog,
    showVersionHistoryDialog,
    setShowVersionHistoryDialog,
    showSendEmailDialog,
    setShowSendEmailDialog,
    showProductionTrackingModal,
    setShowProductionTrackingModal,
    showInventoryReportModal,
    setShowInventoryReportModal,

    // Email states
    emailSubject,
    setEmailSubject,
    emailMessage,
    setEmailMessage,
    requestApproval,
    setRequestApproval,

    // Version history states
    changeDescription,
    setChangeDescription,
    notifyClient,
    setNotifyClient,
    selectedAttachment,
    setSelectedAttachment,
    handleCreateNewVersion,
    handleRevertToVersion,
    handleCompareVersions,

    // Products and inventory
    products,
    inventoryItems,
    inventoryCategories,
    templates,
    getInventoryUsageReports,

    // Logic functions
    handleAddFile,
    filteredFiles,
    handleFileClick,
    handleAddComment,
    handleSendEmail,
    handleSimulateApproval,
    handleFileUpload,
    handleOpenVersionHistory,
    handleAddAttachmentToFileItem,
    handleAddProductToFileItem,
    handleAddTemplateItem,
    handleCreateTemplate,
    handleDeleteTemplateItem,
    handleUpdateTemplateItem,
    handleRestoreTemplateItemVersion,
    updateInventoryStock,
    trackInventoryUsage,
    handleUpdateProductionStatus,

    // Invoice-related states
    selectedInvoice,
    setSelectedInvoice,
    showInvoiceCreatorModal,
    setShowInvoiceCreatorModal,
    handleCreateInvoice,
    handleUpdateInvoice,
  } = useProjectFiles();
  const { project } = useProject();

  const [commentText, setCommentText] = useState('');
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showCreateModuleDialog, setShowCreateModuleDialog] = useState(false);

  const handleCreateModule = async (moduleData: {
    name: string;
    description: string;
    status: 'draft' | 'active' | 'completed' | 'archived';
    isTemplate: boolean;
  }) => {
    try {
      const response = await newRequest.post('/modules', {
        ...moduleData,
        project: project?._id,
      });
      console.log('Module created successfully:', response);
      setShowCreateModuleDialog(false);
      // TODO: Refresh the modules list or update the UI
    } catch (error) {
      console.error('Error creating module:', error);
      // TODO: Show error toast or handle error appropriately
    }
  };

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 pb-4'>
          <div>
            <CardTitle>Project Modules</CardTitle>
            <CardDescription>
              Manage all project documents and module items in one place
            </CardDescription>
          </div>
          <div className='flex space-x-2'>
            <div className='relative'>
              <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-gray-500' />
              <Input
                type='search'
                placeholder='Search module items...'
                className='w-full sm:w-[250px] pl-8'
                value={search}
                onChange={(e) => {
                  return setSearch(e.target.value);
                }}
              />
              {search && (
                <button
                  onClick={() => {
                    return setSearch('');
                  }}
                  className='absolute right-2.5 top-2.5 text-gray-500 hover:text-gray-700'
                >
                  <X className='h-4 w-4' />
                </button>
              )}
            </div>

            <Dialog open={showCreateModuleDialog} onOpenChange={setShowCreateModuleDialog}>
              <Button
                onClick={() => {
                  return setShowCreateModuleDialog(true);
                }}
              >
                <Plus className='mr-2 h-4 w-4' />
                Create Module
              </Button>
              <CreateModuleDialog
                onClose={() => {
                  return setShowCreateModuleDialog(false);
                }}
                onCreateModule={handleCreateModule}
              />
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
            <TabsList className='mb-4'>
              <TabsTrigger value='all'>All Module Items</TabsTrigger>
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
                  setEmailSubject(`Modules shared: ${file.name}`);
                  setEmailMessage(`I'm sharing the following modules with you: ${file.name}`);
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
            setEmailSubject(`Modules shared: ${selectedFile?.name}`);
            setEmailMessage(`I'm sharing the following modules with you: ${selectedFile?.name}`);
            setShowSendEmailDialog(true);
          }}
          handleFileUpload={handleFileUpload}
          uploadedFiles={uploadedFiles}
          handleAddAttachmentToFileItem={handleAddAttachmentToFileItem}
          products={products}
          templates={templates}
          inventoryItems={inventoryItems}
          inventoryCategories={inventoryCategories}
          handleAddProductToFileItem={handleAddProductToFileItem}
          handleAddTemplateItem={handleAddTemplateItem}
          handleCreateTemplate={handleCreateTemplate}
          handleDeleteTemplateItem={handleDeleteTemplateItem}
          handleUpdateTemplateItem={handleUpdateTemplateItem}
          handleRestoreTemplateItemVersion={handleRestoreTemplateItemVersion}
          updateInventoryStock={updateInventoryStock}
          trackInventoryUsage={trackInventoryUsage}
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
          onClose={() => {
            return setShowSendEmailDialog(false);
          }}
        />
      </Dialog>

      {/* Invoice Creator Modal */}
      {showInvoiceCreatorModal && (
        <InvoiceCreatorModal
          onClose={() => {
            setShowInvoiceCreatorModal(false);
            setSelectedInvoice(null);
          }}
          onSave={(invoice) => {
            if (selectedInvoice) {
              handleUpdateInvoice(invoice);
            } else {
              handleCreateInvoice(invoice);
            }
            setShowInvoiceCreatorModal(false);
          }}
          projectFiles={filteredFiles()}
          products={products}
          inventoryItems={inventoryItems}
          existingInvoice={selectedInvoice}
          defaultClient={
            selectedFile && selectedFile.clientEmail
              ? {
                  id: selectedFile.id,
                  name: 'Client from ' + selectedFile.name,
                  email: selectedFile.clientEmail,
                }
              : undefined
          }
          onUpdateProductionStatus={handleUpdateProductionStatus}
        />
      )}

      {/* Production Tracking Modal */}
      {showProductionTrackingModal && (
        <ProductionTrackingModal
          onClose={() => {
            return setShowProductionTrackingModal(false);
          }}
          files={filteredFiles()}
          templates={templates}
          onUpdateStatus={handleUpdateProductionStatus}
        />
      )}

      {/* Inventory Report Modal */}
      {showInventoryReportModal && (
        <InventoryReportModal
          inventoryItems={inventoryItems}
          usageReports={getInventoryUsageReports()}
          onClose={() => {
            return setShowInventoryReportModal(false);
          }}
        />
      )}
    </div>
  );
}
