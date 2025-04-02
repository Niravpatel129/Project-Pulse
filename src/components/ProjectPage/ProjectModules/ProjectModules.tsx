'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog } from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProject } from '@/contexts/ProjectContext';
import { useProjectFiles } from '@/hooks/useProjectFiles';
import { newRequest } from '@/utils/newRequest';
import {
  ArrowDown,
  ArrowUp,
  ChevronsUpDown,
  Eye,
  EyeOff,
  MoreVertical,
  Plus,
  Search,
  Settings,
  Trash,
  X,
} from 'lucide-react';
import { useEffect, useState } from 'react';
import {
  FileDetailsDialog,
  InventoryReportModal,
  ProductionTrackingModal,
  SendEmailDialog,
  VersionHistoryDialog,
} from '../FileComponents';
import CreateModuleDialog from '../FileComponents/CreateModuleDialog';
import InvoiceCreatorModal from '../InvoiceCreatorModal';
import { DeleteModuleDialog, ModuleDetailsDialog, type Module } from '../ModuleComponents';
import NewProjectModules from './NewProjectModules';

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
  const [modules, setModules] = useState<Module[]>([]);
  const [isLoadingModules, setIsLoadingModules] = useState(false);
  const [selectedModule, setSelectedModule] = useState<Module | null>(null);
  const [showModuleDetailsDialog, setShowModuleDetailsDialog] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [moduleToDelete, setModuleToDelete] = useState<Module | null>(null);
  const [sortField, setSortField] = useState<string | null>(null);
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [hiddenColumns, setHiddenColumns] = useState<string[]>([]);

  useEffect(() => {
    const fetchModules = async () => {
      if (!project?._id) return;

      setIsLoadingModules(true);
      try {
        const response = await newRequest.get(`/modules/project/${project._id}`);
        setModules(response.data);
      } catch (error) {
        console.error('Error fetching modules:', error);
      } finally {
        setIsLoadingModules(false);
      }
    };

    fetchModules();
  }, [project?._id]);

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
      // Refresh the modules list
      setModules([...modules, response.data]);
    } catch (error) {
      console.error('Error creating module:', error);
      // TODO: Show error toast or handle error appropriately
    }
  };

  const handleDeleteModule = async (module: Module) => {
    try {
      await newRequest.delete(`/modules/${module._id}`);
      setModules(
        modules.filter((m) => {
          return m._id !== module._id;
        }),
      );
      setShowDeleteConfirmation(false);
      setModuleToDelete(null);
    } catch (error) {
      console.error('Error deleting module:', error);
      // TODO: Show error toast or handle error appropriately
    }
  };

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDirection('asc');
    }
  };

  const toggleColumnVisibility = (column: string) => {
    if (hiddenColumns.includes(column)) {
      setHiddenColumns(
        hiddenColumns.filter((col) => {
          return col !== column;
        }),
      );
    } else {
      setHiddenColumns([...hiddenColumns, column]);
    }
  };

  const sortedModules = [...modules].sort((a, b) => {
    if (!sortField) return 0;

    let valueA, valueB;

    if (sortField === 'name') {
      valueA = a.name.toLowerCase();
      valueB = b.name.toLowerCase();
    } else if (sortField === 'description') {
      valueA = a.description.toLowerCase();
      valueB = b.description.toLowerCase();
    } else if (sortField === 'status') {
      valueA = a.status.toLowerCase();
      valueB = b.status.toLowerCase();
    } else if (sortField === 'createdAt') {
      valueA = new Date(a.createdAt).getTime();
      valueB = new Date(b.createdAt).getTime();
    } else {
      return 0;
    }

    if (valueA < valueB) return sortDirection === 'asc' ? -1 : 1;
    if (valueA > valueB) return sortDirection === 'asc' ? 1 : -1;
    return 0;
  });

  return (
    <div>
      <NewProjectModules />
    </div>
  );

  return (
    <div className='space-y-4'>
      <Card>
        <CardHeader className='flex flex-col sm:flex-row justify-between space-y-2 sm:space-y-0 pb-4'>
          <div className='flex justify-between w-full'>
            <div>
              <CardTitle>Project Modules</CardTitle>
              <CardDescription>
                Manage all project documents and modules in one place.
              </CardDescription>
            </div>
            <div className='flex flex-wrap gap-2'>
              {/* Search button for mobile view */}
              <Button
                variant='outline'
                size='icon'
                className='sm:hidden'
                onClick={() => {
                  return setSearch(search ? '' : ' ');
                }}
              >
                <Search className='h-4 w-4' />
              </Button>

              {/* Search input that collapses on mobile */}
              <div className={`relative ${!search && 'hidden sm:block'}`}>
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

              {/* Table settings dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant='outline' size='icon'>
                    <Settings className='h-4 w-4' />
                    <span className='sr-only'>Table settings</span>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align='end'>
                  <DropdownMenuItem
                    onClick={() => {
                      return toggleColumnVisibility('name');
                    }}
                  >
                    {hiddenColumns.includes('name') ? (
                      <Eye className='h-4 w-4 mr-2' />
                    ) : (
                      <EyeOff className='h-4 w-4 mr-2' />
                    )}
                    {hiddenColumns.includes('name') ? 'Show' : 'Hide'} Name
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      return toggleColumnVisibility('description');
                    }}
                  >
                    {hiddenColumns.includes('description') ? (
                      <Eye className='h-4 w-4 mr-2' />
                    ) : (
                      <EyeOff className='h-4 w-4 mr-2' />
                    )}
                    {hiddenColumns.includes('description') ? 'Show' : 'Hide'} Description
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      return toggleColumnVisibility('status');
                    }}
                  >
                    {hiddenColumns.includes('status') ? (
                      <Eye className='h-4 w-4 mr-2' />
                    ) : (
                      <EyeOff className='h-4 w-4 mr-2' />
                    )}
                    {hiddenColumns.includes('status') ? 'Show' : 'Hide'} Status
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => {
                      return toggleColumnVisibility('createdAt');
                    }}
                  >
                    {hiddenColumns.includes('createdAt') ? (
                      <Eye className='h-4 w-4 mr-2' />
                    ) : (
                      <EyeOff className='h-4 w-4 mr-2' />
                    )}
                    {hiddenColumns.includes('createdAt') ? 'Show' : 'Hide'} Created Date
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              <Dialog open={showCreateModuleDialog} onOpenChange={setShowCreateModuleDialog}>
                <Button
                  onClick={() => {
                    return setShowCreateModuleDialog(true);
                  }}
                  className='whitespace-nowrap'
                >
                  <Plus className='mr-2 h-4 w-4' />
                  <span className='hidden sm:inline'>Create Module</span>
                  <span className='sm:hidden'>Create</span>
                </Button>
                <CreateModuleDialog
                  onClose={() => {
                    return setShowCreateModuleDialog(false);
                  }}
                  onCreateModule={handleCreateModule}
                />
              </Dialog>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className='rounded-md border'>
            <Table>
              <TableHeader className=''>
                <TableRow>
                  {!hiddenColumns.includes('name') && (
                    <TableHead className=''>
                      <DropdownMenu>
                        <DropdownMenuTrigger className='flex items-center gap-1 cursor-pointer'>
                          Name <ChevronsUpDown className='h-3 w-3' />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              return handleSort('name');
                            }}
                          >
                            <ArrowUp className=' text-muted-foreground/70 text-xs' />
                            Asc
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              return handleSort('name');
                            }}
                          >
                            <ArrowDown className=' text-muted-foreground/70 text-xs' />
                            Desc
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              return toggleColumnVisibility('name');
                            }}
                          >
                            <EyeOff className='text-muted-foreground/70 text-xs' />
                            Hide
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                  )}
                  {!hiddenColumns.includes('description') && (
                    <TableHead className=''>
                      <DropdownMenu>
                        <DropdownMenuTrigger className='flex items-center gap-1 cursor-pointer'>
                          Description <ChevronsUpDown className='h-3 w-3' />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              return handleSort('description');
                            }}
                          >
                            <ArrowUp className=' text-muted-foreground/70 text-xs' />
                            Asc
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              return handleSort('description');
                            }}
                          >
                            <ArrowDown className=' text-muted-foreground/70 text-xs' />
                            Desc
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              return toggleColumnVisibility('description');
                            }}
                          >
                            <EyeOff className='text-muted-foreground/70 text-xs' />
                            Hide
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                  )}
                  {!hiddenColumns.includes('status') && (
                    <TableHead className=''>
                      <DropdownMenu>
                        <DropdownMenuTrigger className='flex items-center gap-1 cursor-pointer'>
                          Status <ChevronsUpDown className='h-3 w-3' />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              return handleSort('status');
                            }}
                          >
                            <ArrowUp className=' text-muted-foreground/70 text-xs' />
                            Asc
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              return handleSort('status');
                            }}
                          >
                            <ArrowDown className=' text-muted-foreground/70 text-xs' />
                            Desc
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              return toggleColumnVisibility('status');
                            }}
                          >
                            <EyeOff className='text-muted-foreground/70 text-xs' />
                            Hide
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                  )}
                  {!hiddenColumns.includes('createdAt') && (
                    <TableHead className=''>
                      <DropdownMenu>
                        <DropdownMenuTrigger className='flex items-center gap-1 cursor-pointer'>
                          Created <ChevronsUpDown className='h-3 w-3' />
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem
                            onClick={() => {
                              return handleSort('createdAt');
                            }}
                          >
                            <ArrowUp className=' text-muted-foreground/70 text-xs' />
                            Asc
                          </DropdownMenuItem>
                          <DropdownMenuItem
                            onClick={() => {
                              return handleSort('createdAt');
                            }}
                          >
                            <ArrowDown className=' text-muted-foreground/70 text-xs' />
                            Desc
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem
                            onClick={() => {
                              return toggleColumnVisibility('createdAt');
                            }}
                          >
                            <EyeOff className='text-muted-foreground/70 text-xs' />
                            Hide
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </TableHead>
                  )}
                  <TableHead className=' w-[50px]'></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {isLoadingModules ? (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center py-4'>
                      Loading modules...
                    </TableCell>
                  </TableRow>
                ) : sortedModules.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className='text-center py-4'>
                      No modules found. Create your first module to get started.
                    </TableCell>
                  </TableRow>
                ) : (
                  sortedModules.map((module) => {
                    return (
                      <TableRow
                        key={module._id}
                        className='cursor-pointer hover:bg-muted/50'
                        onClick={() => {
                          setSelectedModule(module);
                          setShowModuleDetailsDialog(true);
                        }}
                      >
                        {!hiddenColumns.includes('name') && (
                          <TableCell className=''>{module.name}</TableCell>
                        )}
                        {!hiddenColumns.includes('description') && (
                          <TableCell className='truncate max-w-xs'>{module.description}</TableCell>
                        )}
                        {!hiddenColumns.includes('status') && (
                          <TableCell>
                            <span
                              className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs  capitalize ${
                                module.status === 'active'
                                  ? 'bg-green-100 text-green-800'
                                  : module.status === 'completed'
                                  ? 'bg-blue-100 text-blue-800'
                                  : module.status === 'archived'
                                  ? 'bg-gray-100 text-gray-800'
                                  : 'bg-yellow-100 text-yellow-800'
                              }`}
                            >
                              {module.status}
                            </span>
                          </TableCell>
                        )}
                        {!hiddenColumns.includes('createdAt') && (
                          <TableCell className='text-sm'>
                            {new Date(module.createdAt).toLocaleDateString()}
                          </TableCell>
                        )}
                        <TableCell>
                          <DropdownMenu>
                            <DropdownMenuTrigger
                              asChild
                              onClick={(e) => {
                                return e.stopPropagation();
                              }}
                            >
                              <Button variant='ghost' size='icon'>
                                <MoreVertical className='h-4 w-4' />
                                <span className='sr-only'>Open menu</span>
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setModuleToDelete(module);
                                  setShowDeleteConfirmation(true);
                                }}
                                className='text-red-600'
                              >
                                <Trash className='h-4 w-4 mr-2' />
                                Delete Module
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
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
          onClose={async () => {
            setShowSendEmailDialog(false);
            return Promise.resolve();
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

      {/* Module Details Dialog */}
      <Dialog open={showModuleDetailsDialog} onOpenChange={setShowModuleDetailsDialog}>
        <ModuleDetailsDialog
          selectedModule={selectedModule}
          onClose={() => {
            setShowModuleDetailsDialog(false);
            setSelectedModule(null);
          }}
        />
      </Dialog>

      {/* Delete Module Dialog */}
      <DeleteModuleDialog
        open={showDeleteConfirmation}
        onOpenChange={setShowDeleteConfirmation}
        moduleToDelete={moduleToDelete}
        onDelete={handleDeleteModule}
      />
    </div>
  );
}
