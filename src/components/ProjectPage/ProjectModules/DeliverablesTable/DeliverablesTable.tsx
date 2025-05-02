import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Input } from '@/components/ui/input';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProject } from '@/contexts/ProjectContext';
import { cn } from '@/lib/utils';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronDown,
  ChevronUp,
  DollarSign,
  FileText,
  Maximize2,
  MoreHorizontal,
  Package,
  Pencil,
  Search,
  SortAsc,
  SortDesc,
  Trash2,
} from 'lucide-react';
import React, { useMemo, useState } from 'react';
import NewDeliverableDialog from '../NewDeliverableDialog/NewDeliverableDialog';

interface Attachment {
  name: string;
  type: string;
  size: number;
  url: string;
  firebaseUrl: string;
  storagePath: string;
  uploadFailed: boolean;
}

interface SelectedItem {
  id: string;
  position: number;
  Name: string;
  name: string;
  Price: number;
}

interface CustomField {
  id: string;
  type: string;
  label: string;
  content: string;
  _id: string;
  attachments: Attachment[];
  selectedItem?: SelectedItem;
  selectedDatabaseId?: string;
  alignment?: string;
  visibleColumns?: Record<string, boolean>;
  selectedTableName?: string;
  items?: string[];
  url?: string;
  text?: string;
}

interface Deliverable {
  _id: string;
  name: string;
  description: string;
  price: string;
  deliverableType: string;
  customDeliverableType: string;
  customFields: CustomField[];
  teamNotes: string;
  project: string;
  workspace: string;
  createdBy: string;
  createdAt: string;
  updatedAt: string;
  __v: number;
}

type SortKey = 'name' | 'price' | 'deliverableType';
type SortDirection = 'asc' | 'desc';

const fetchDeliverables = async (projectId: string) => {
  if (!projectId) return [];
  const response = await newRequest.get(`/deliverables/project/${projectId}`);
  return response.data.data || [];
};

const DeliverablesTable = () => {
  const { project } = useProject();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [deliverableToDelete, setDeliverableToDelete] = useState<string | null>(null);
  const [editDialogOpen, setEditDialogOpen] = useState(false);
  const [deliverableToEdit, setDeliverableToEdit] = useState<string | null>(null);
  const [previewAttachment, setPreviewAttachment] = useState<Attachment | null>(null);
  const [sortConfig, setSortConfig] = useState<{
    key: SortKey;
    direction: SortDirection;
  }>({
    key: 'name',
    direction: 'asc',
  });

  const {
    data: deliverables = [],
    isLoading,
    error,
    refetch,
  } = useQuery({
    queryKey: ['deliverables', project?._id],
    queryFn: () => {
      return fetchDeliverables(project?._id || '');
    },
    enabled: !!project?._id,
  });

  const handleSort = (key: SortKey) => {
    setSortConfig({
      key,
      direction: sortConfig.key === key && sortConfig.direction === 'asc' ? 'desc' : 'asc',
    });
  };

  const sortedAndFilteredDeliverables = useMemo(() => {
    const filtered = searchQuery
      ? deliverables.filter((d) => {
          return (
            d.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
            d.deliverableType.toLowerCase().includes(searchQuery.toLowerCase())
          );
        })
      : deliverables;

    return [...filtered].sort((a, b) => {
      const { key, direction } = sortConfig;
      let comparison = 0;

      if (key === 'price') {
        comparison = parseFloat(a[key]) - parseFloat(b[key]);
      } else {
        comparison = a[key].localeCompare(b[key]);
      }

      return direction === 'asc' ? comparison : -comparison;
    });
  }, [deliverables, searchQuery, sortConfig]);

  const toggleRowExpansion = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  // Get the deliverable type label
  const getDeliverableTypeLabel = (type: string, customType?: string) => {
    switch (type) {
      case 'digital':
        return 'Digital Product';
      case 'service':
        return 'Custom Service';
      case 'physical':
        return 'Physical Product';
      case 'package':
        return 'Package';
      case 'other':
        return customType || 'Other';
      default:
        return '-';
    }
  };

  // Check if a field has content
  const hasContent = (field: CustomField) => {
    if (!field) return false;

    switch (field.type) {
      case 'shortText':
      case 'longText':
      case 'specification':
        return !!field.content;
      case 'bulletList':
      case 'numberList':
        return Array.isArray(field.items) && field.items.length > 0;
      case 'link':
        return !!field.url;
      case 'attachment':
        return Array.isArray(field.attachments) && field.attachments.length > 0;
      case 'databaseItem':
        return !!field.selectedItem;
      default:
        return false;
    }
  };

  // Format field content for display
  const formatFieldContent = (field: CustomField) => {
    switch (field.type) {
      case 'shortText':
      case 'longText':
        return <p className='whitespace-pre-wrap'>{field.content}</p>;

      case 'bulletList':
        return (
          <ul className='list-disc pl-5 space-y-1'>
            {field.items?.map((item, i) => {
              return <li key={i}>{item}</li>;
            })}
          </ul>
        );

      case 'numberList':
        return (
          <ol className='list-decimal pl-5 space-y-1'>
            {field.items?.map((item, i) => {
              return <li key={i}>{item}</li>;
            })}
          </ol>
        );

      case 'link':
        return (
          <div>
            <a
              href={field.url}
              target='_blank'
              rel='noopener noreferrer'
              className='text-blue-600 hover:underline flex items-center'
            >
              {field.text || field.url}
            </a>
          </div>
        );

      case 'specification':
        return (
          <div className='flex items-start space-x-2 text-amber-700 bg-amber-50 p-3 rounded-md'>
            <div className='text-sm'>{field.content}</div>
          </div>
        );

      case 'attachment':
        return (
          <div className='space-y-3'>
            {field.attachments && field.attachments.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-3'>
                {field.attachments.map((attachment, i) => {
                  return (
                    <div
                      key={i}
                      className='group relative rounded-lg shadow-sm border border-neutral-200 overflow-hidden transition-all hover:shadow-md hover:border-neutral-300 hover:-translate-y-1 duration-200'
                    >
                      {/* Preview area */}
                      <div
                        className='relative bg-neutral-50 h-32 flex items-center justify-center cursor-pointer'
                        onClick={() => {
                          return setPreviewAttachment(attachment);
                        }}
                      >
                        {isImageFile(attachment.name) ? (
                          <div className='relative w-full h-full overflow-hidden'>
                            <img
                              src={attachment.url}
                              alt={attachment.name}
                              className='h-full w-full object-cover'
                            />
                            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100'>
                              <Maximize2 className='text-white drop-shadow-md' size={22} />
                            </div>
                          </div>
                        ) : (
                          <div className='flex flex-col items-center justify-center h-full w-full group-hover:scale-105 transition-transform'>
                            <div className='mb-2 transform group-hover:scale-110 transition-transform'>
                              {getFileIcon(attachment.name)}
                            </div>
                            <div className='text-xs font-medium bg-neutral-200 text-neutral-700 px-2.5 py-1 rounded-full'>
                              {getFileTypeLabel(attachment.name)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* File info area */}
                      <div className='px-3 py-2.5 bg-white border-t border-neutral-100'>
                        <div className='text-sm font-medium text-neutral-800 truncate pb-0.5 group-hover:text-blue-600 transition-colors'>
                          {attachment.name}
                        </div>
                        <div className='text-xs text-neutral-500 flex items-center'>
                          <span className='inline-block w-2 h-2 rounded-full bg-green-500 mr-1.5'></span>
                          {formatFileSize(attachment.size)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='text-neutral-500 text-sm italic'>No attachments</div>
            )}
          </div>
        );

      case 'databaseItem':
        return (
          <div>
            {field.selectedItem ? (
              <div
                className={`w-full ${
                  field.alignment === 'center'
                    ? 'flex justify-center'
                    : field.alignment === 'right'
                    ? 'flex justify-end'
                    : ''
                }`}
              >
                <div className='bg-neutral-50 border border-neutral-200 rounded-md px-4 py-3'>
                  <div className='flex flex-col gap-2'>
                    <div className='text-neutral-800 font-medium'>{field.selectedItem.name}</div>
                    {field.selectedItem.Price !== undefined && (
                      <div className='flex items-center text-green-600'>
                        <DollarSign className='h-4 w-4 mr-1' />
                        <span>${field.selectedItem.Price}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-neutral-500 text-sm italic'>No item selected</div>
            )}
          </div>
        );

      default:
        return null;
    }
  };

  // Helper functions for handling file attachments
  const isImageFile = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ['jpg', 'jpeg', 'png', 'gif', 'webp', 'bmp'].includes(ext || '');
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();

    // Very simplified version - you might want to expand this based on file types
    return <FileText className='text-neutral-500' size={32} />;
  };

  const getFileTypeLabel = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    return ext ? ext.toUpperCase() : 'FILE';
  };

  const formatFileSize = (size: number) => {
    if (size < 1024) return `${size} B`;
    if (size < 1024 * 1024) return `${(size / 1024).toFixed(1)} KB`;
    return `${(size / (1024 * 1024)).toFixed(1)} MB`;
  };

  const handleEdit = (deliverableId: string) => {
    setDeliverableToEdit(deliverableId);
    setEditDialogOpen(true);
  };

  const handleCloseEditDialog = () => {
    setEditDialogOpen(false);
    setDeliverableToEdit(null);
    refetch(); // Refresh the list after editing
  };

  const handleDelete = async (deliverableId: string) => {
    try {
      await newRequest.delete(`/deliverables/${deliverableId}`);
      refetch(); // Refresh the list after deletion
    } catch (error) {
      console.error('Failed to delete deliverable:', error);
    } finally {
      setDeliverableToDelete(null);
    }
  };

  if (isLoading) {
    return (
      <div className='space-y-4'>
        <div className='flex justify-between items-center'>
          <Skeleton className='h-10 w-[250px]' />
          <Skeleton className='h-10 w-[120px]' />
        </div>
        <div className='rounded-md border'>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Skeleton className='h-4 w-[100px]' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-4 w-[150px]' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-4 w-[80px]' />
                </TableHead>
                <TableHead>
                  <Skeleton className='h-4 w-[50px]' />
                </TableHead>
                <TableHead className='w-[50px]'></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {[1, 2, 3].map((i) => {
                return (
                  <TableRow key={i}>
                    <TableCell>
                      <Skeleton className='h-5 w-[120px]' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-[200px]' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-[90px]' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-5 w-[60px]' />
                    </TableCell>
                    <TableCell>
                      <Skeleton className='h-8 w-8 rounded-full' />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <Card className='border-destructive/50'>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <div className='text-destructive mb-2 text-lg font-semibold'>
              Failed to load deliverables
            </div>
            <p className='text-muted-foreground mb-4'>
              There was an error retrieving the deliverables data.
            </p>
            <Button
              variant='outline'
              onClick={() => {
                return refetch();
              }}
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (deliverables.length === 0) {
    return (
      <Card>
        <CardContent className='pt-6'>
          <div className='flex flex-col items-center justify-center py-8 text-center'>
            <div className='text-lg font-medium mb-2'>No deliverables found</div>
            <p className='text-muted-foreground mb-4'>
              This project doesn&apos;t have any deliverables yet.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='relative w-full max-w-sm'>
          <Search className='absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground' />
          <Input
            placeholder='Search deliverables...'
            value={searchQuery}
            onChange={(e) => {
              return setSearchQuery(e.target.value);
            }}
            className='pl-8'
          />
        </div>
      </div>

      <div className='rounded-md border overflow-hidden'>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead
                className='cursor-pointer hover:bg-muted/50 transition-colors'
                onClick={() => {
                  return handleSort('name');
                }}
              >
                <div className='flex items-center gap-1'>
                  Name
                  {sortConfig.key === 'name' &&
                    (sortConfig.direction === 'asc' ? (
                      <SortAsc className='h-3.5 w-3.5' />
                    ) : (
                      <SortDesc className='h-3.5 w-3.5' />
                    ))}
                </div>
              </TableHead>
              <TableHead>Description</TableHead>
              <TableHead
                className='cursor-pointer hover:bg-muted/50 transition-colors'
                onClick={() => {
                  return handleSort('deliverableType');
                }}
              >
                <div className='flex items-center gap-1'>
                  Type
                  {sortConfig.key === 'deliverableType' &&
                    (sortConfig.direction === 'asc' ? (
                      <SortAsc className='h-3.5 w-3.5' />
                    ) : (
                      <SortDesc className='h-3.5 w-3.5' />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className='text-right cursor-pointer hover:bg-muted/50 transition-colors'
                onClick={() => {
                  return handleSort('price');
                }}
              >
                <div className='flex items-center justify-end gap-1'>
                  Price
                  {sortConfig.key === 'price' &&
                    (sortConfig.direction === 'asc' ? (
                      <SortAsc className='h-3.5 w-3.5' />
                    ) : (
                      <SortDesc className='h-3.5 w-3.5' />
                    ))}
                </div>
              </TableHead>
              <TableHead className='w-[50px]'></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {sortedAndFilteredDeliverables.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className='h-[200px] text-center'>
                  <div className='flex flex-col items-center justify-center gap-2'>
                    <div className='text-muted-foreground'>No matching deliverables found</div>
                    {searchQuery && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          return setSearchQuery('');
                        }}
                      >
                        Clear search
                      </Button>
                    )}
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              sortedAndFilteredDeliverables.map((deliverable) => {
                const isExpanded = expandedRow === deliverable._id;
                return (
                  <React.Fragment key={deliverable._id}>
                    <TableRow className={cn(isExpanded && 'bg-muted/30')}>
                      <TableCell className='font-medium'>{deliverable.name}</TableCell>
                      <TableCell className='max-w-[300px] truncate' title={deliverable.description}>
                        {deliverable.description}
                      </TableCell>
                      <TableCell>
                        <Badge variant='secondary' className='capitalize'>
                          {deliverable.deliverableType}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right font-semibold'>
                        $
                        {parseFloat(deliverable.price).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell>
                        <div className='flex items-center gap-2'>
                          <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => {
                              return toggleRowExpansion(deliverable._id);
                            }}
                            className='h-8 w-8 p-0'
                            aria-label={isExpanded ? 'Hide details' : 'Show details'}
                          >
                            {isExpanded ? (
                              <ChevronUp className='h-4 w-4' />
                            ) : (
                              <ChevronDown className='h-4 w-4' />
                            )}
                          </Button>

                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button variant='ghost' size='sm' className='h-8 w-8 p-0'>
                                <MoreHorizontal className='h-4 w-4' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align='end'>
                              <DropdownMenuItem
                                onClick={() => {
                                  return handleEdit(deliverable._id);
                                }}
                              >
                                <Pencil className='mr-2 h-4 w-4' />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className='text-destructive'
                                onClick={() => {
                                  return setDeliverableToDelete(deliverable._id);
                                }}
                              >
                                <Trash2 className='mr-2 h-4 w-4' />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className='bg-muted/50'>
                        <TableCell colSpan={5} className='p-0'>
                          <div className='p-4 space-y-6'>
                            {/* Basic Details Section */}
                            <section className='border border-neutral-200 rounded-lg overflow-hidden'>
                              <header className='bg-neutral-50 border-b border-neutral-200 px-4 py-3 flex items-center'>
                                <FileText className='mr-3 text-neutral-500' size={18} />
                                <h3 className='font-medium text-neutral-800'>Basic Details</h3>
                              </header>

                              <div className='p-5 space-y-5 bg-white'>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-4'>
                                  <div className='space-y-1'>
                                    <h4 className='text-sm text-neutral-500'>Deliverable Name</h4>
                                    <p className='font-medium'>{deliverable.name || '-'}</p>
                                  </div>
                                  <div className='space-y-1'>
                                    <h4 className='text-sm text-neutral-500'>Deliverable Type</h4>
                                    <p className='font-medium'>
                                      {getDeliverableTypeLabel(
                                        deliverable.deliverableType,
                                        deliverable.customDeliverableType,
                                      )}
                                    </p>
                                  </div>
                                  <div className='space-y-1'>
                                    <h4 className='text-sm text-neutral-500'>Price</h4>
                                    <p className='font-medium flex items-center'>
                                      <DollarSign className='text-green-600 mr-1 h-4 w-4' />
                                      {parseFloat(deliverable.price).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </p>
                                  </div>
                                </div>
                                {deliverable.description && (
                                  <div className='space-y-1 border-t border-neutral-100 pt-4 mt-4'>
                                    <h4 className='text-sm text-neutral-500'>Description</h4>
                                    <p className='text-neutral-700 whitespace-pre-wrap'>
                                      {deliverable.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </section>

                            {/* Custom Fields Section */}
                            {deliverable.customFields && deliverable.customFields.length > 0 && (
                              <section className='border border-neutral-200 rounded-lg overflow-hidden'>
                                <header className='bg-neutral-50 border-b border-neutral-200 px-4 py-3 flex items-center'>
                                  <Package className='mr-3 text-neutral-500' size={18} />
                                  <h3 className='font-medium text-neutral-800'>Content Details</h3>
                                </header>

                                <div className='p-5 space-y-5 bg-white'>
                                  <div className='space-y-6'>
                                    {deliverable.customFields.map((field) => {
                                      if (!hasContent(field)) return null;
                                      return (
                                        <div key={field._id} className='space-y-2'>
                                          <h4 className='font-medium text-neutral-800'>
                                            {field.label || 'Untitled Field'}
                                          </h4>
                                          <div className='text-neutral-700'>
                                            {formatFieldContent(field)}
                                          </div>
                                        </div>
                                      );
                                    })}
                                    {deliverable.customFields.filter(hasContent).length === 0 && (
                                      <p className='text-neutral-500 italic'>
                                        No content fields added
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </section>
                            )}

                            {/* Team Notes Section */}
                            {deliverable.teamNotes && (
                              <section className='border border-neutral-200 rounded-lg overflow-hidden'>
                                <header className='bg-neutral-50 border-b border-neutral-200 px-4 py-3 flex items-center'>
                                  <FileText className='mr-3 text-neutral-500' size={18} />
                                  <h3 className='font-medium text-neutral-800'>Team Notes</h3>
                                </header>
                                <div className='p-5'>
                                  <div className='bg-white p-3 rounded-md border border-neutral-200'>
                                    <p className='whitespace-pre-wrap'>{deliverable.teamNotes}</p>
                                  </div>
                                </div>
                              </section>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    )}
                  </React.Fragment>
                );
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog
        open={!!deliverableToDelete}
        onOpenChange={(open) => {
          return !open && setDeliverableToDelete(null);
        }}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete the deliverable and remove
              it from the project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90'
              onClick={() => {
                return deliverableToDelete && handleDelete(deliverableToDelete);
              }}
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {editDialogOpen && (
        <NewDeliverableDialog
          isOpen={editDialogOpen}
          onClose={handleCloseEditDialog}
          deliverableId={deliverableToEdit}
        />
      )}
    </div>
  );
};

export default DeliverablesTable;
