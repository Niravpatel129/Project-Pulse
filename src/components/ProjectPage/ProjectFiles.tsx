'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { BarChart, FolderClock, Plus, Receipt, Search, X } from 'lucide-react';
import { useState } from 'react';
import {
  FileDetailsDialog,
  FileTable,
  InventoryReportModal,
  ProductionTrackingModal,
  SendEmailDialog,
  UploadFileDialog,
  VersionHistoryDialog,
} from './FileComponents';
import InvoiceCreatorModal from './InvoiceCreatorModal';

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
    templates,
    inventoryItems,
    inventoryCategories,
    handleAddProductToFileItem,
    handleCreateTemplate,
    handleAddTemplateItem,
    handleDeleteTemplateItem,
    handleUpdateTemplateItem,
    handleRestoreTemplateItemVersion,
    showInventoryReportModal,
    setShowInventoryReportModal,
    getInventoryUsageReports,
    updateInventoryStock,
    trackInventoryUsage,
    showProductionTrackingModal,
    setShowProductionTrackingModal,
    handleUpdateProductionStatus,

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

    // Invoice-related states
    invoices,
    selectedInvoice,
    setSelectedInvoice,
    showInvoiceCreatorModal,
    setShowInvoiceCreatorModal,
    showInvoiceDetailsModal,
    setShowInvoiceDetailsModal,
    handleCreateInvoice,
    handleUpdateInvoice,
    handleSendInvoice,
    handleMarkInvoiceAsPaid,
    getInvoiceById,
    handleDeleteInvoice,
  } = useProjectFiles();

  // Add a new state for the selected client
  const [selectedClient, setSelectedClient] = useState<{
    id: string;
    name: string;
    email: string;
  } | null>(null);

  // Helper function to format invoice status
  const formatInvoiceStatus = (status: string): string => {
    switch (status) {
      case 'draft':
        return 'Draft';
      case 'sent':
        return 'Sent';
      case 'paid':
        return 'Paid';
      case 'overdue':
        return 'Overdue';
      case 'cancelled':
        return 'Cancelled';
      default:
        return status.charAt(0).toUpperCase() + status.slice(1);
    }
  };

  // Helper function to get invoice status badge class
  const getInvoiceStatusClass = (status: string): string => {
    switch (status) {
      case 'draft':
        return 'bg-gray-100 text-gray-800';
      case 'sent':
        return 'bg-blue-100 text-blue-800';
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'overdue':
        return 'bg-red-100 text-red-800';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

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
            <Button
              variant='outline'
              onClick={() => setShowProductionTrackingModal(true)}
              className='flex items-center gap-1'
            >
              <FolderClock className='h-4 w-4' />
              Production
            </Button>
            <Button
              variant='outline'
              onClick={() => setShowInventoryReportModal(true)}
              className='flex items-center gap-1'
            >
              <BarChart className='h-4 w-4' />
              Inventory
            </Button>
            <Button
              variant='outline'
              onClick={() => {
                // Default to the project client if available
                if (filteredFiles().length > 0) {
                  const clientFile = filteredFiles().find((f) => f.clientEmail);
                  if (clientFile) {
                    setSelectedClient({
                      id: 'client1', // In a real app, this would be a proper client ID
                      name: clientFile.clientEmail?.split('@')[0] || 'Client',
                      email: clientFile.clientEmail || '',
                    });
                  }
                }
                setShowInvoiceCreatorModal(true);
              }}
              className='flex items-center gap-1'
            >
              <Receipt className='h-4 w-4 mr-2' />
              Create Invoice
            </Button>
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
          onClose={() => setShowSendEmailDialog(false)}
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
          }}
          projectFiles={filteredFiles()}
          products={products}
          inventoryItems={inventoryItems}
          templates={templates}
          existingInvoice={selectedInvoice || undefined}
          defaultClient={selectedClient || undefined}
        />
      )}

      {/* Production Tracking Modal */}
      {showProductionTrackingModal && (
        <ProductionTrackingModal
          onClose={() => setShowProductionTrackingModal(false)}
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
          onClose={() => setShowInventoryReportModal(false)}
        />
      )}
    </div>
  );
}
