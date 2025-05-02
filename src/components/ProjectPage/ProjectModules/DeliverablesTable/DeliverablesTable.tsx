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
          <div className='space-y-2'>
            {field.attachments && field.attachments.length > 0 ? (
              <div className='grid grid-cols-1 sm:grid-cols-2 gap-2'>
                {field.attachments.map((attachment, i) => {
                  return (
                    <div
                      key={i}
                      className='group relative rounded-md border border-neutral-200 overflow-hidden transition-all hover:border-neutral-300 duration-150'
                    >
                      {/* Preview area */}
                      <div
                        className='relative bg-neutral-50 h-28 flex items-center justify-center cursor-pointer'
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
                            <div className='absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors flex items-center justify-center opacity-0 group-hover:opacity-100'>
                              <Maximize2 className='text-neutral-700 drop-shadow-sm' size={18} />
                            </div>
                          </div>
                        ) : (
                          <div className='flex flex-col items-center justify-center h-full w-full'>
                            <div className='mb-1.5'>{getFileIcon(attachment.name)}</div>
                            <div className='text-xs font-normal bg-neutral-100 text-neutral-600 px-2 py-0.5 rounded-full'>
                              {getFileTypeLabel(attachment.name)}
                            </div>
                          </div>
                        )}
                      </div>

                      {/* File info area */}
                      <div className='px-3 py-2 bg-white border-t border-neutral-100'>
                        <div className='text-xs font-medium text-neutral-700 truncate pb-0.5'>
                          {attachment.name}
                        </div>
                        <div className='text-xs text-neutral-500 flex items-center'>
                          <span className='inline-block w-1.5 h-1.5 rounded-full bg-green-500/80 mr-1'></span>
                          {formatFileSize(attachment.size)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className='text-neutral-500 text-xs italic'>No attachments</div>
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
                <div className='bg-neutral-50 border border-neutral-100 rounded-md px-3 py-2'>
                  <div className='flex flex-col gap-1.5'>
                    <div className='text-neutral-700 text-sm'>{field.selectedItem.name}</div>
                    {field.selectedItem.Price !== undefined && (
                      <div className='flex items-center text-green-600/90 text-xs'>
                        <DollarSign className='h-3 w-3 mr-0.5' />
                        <span>${field.selectedItem.Price}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className='text-neutral-500 text-xs italic'>No item selected</div>
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

  const getDeliverableTypeColor = (type: string) => {
    switch (type) {
      case 'service':
        return 'bg-purple-500/10 text-purple-500';
      case 'digital':
        return 'bg-blue-500/10 text-blue-500';
      case 'custom':
        return 'bg-green-500/10 text-green-500';
      case 'package':
        return 'bg-orange-500/10 text-orange-500';
      case 'physical':
        return 'bg-red-500/10 text-red-500';
      default:
        return 'bg-fuchsia-500/10 text-fuchsia-500';
    }
  };

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <div className='relative w-full max-w-sm'>
          <Search className='absolute left-2.5 top-2.5 h-3.5 w-3.5 text-muted-foreground/70' />
          <Input
            placeholder='Search deliverables...'
            value={searchQuery}
            onChange={(e) => {
              return setSearchQuery(e.target.value);
            }}
            className='pl-8 h-9 text-sm'
          />
        </div>
      </div>

      <div className='rounded-md border overflow-hidden border-neutral-200 bg-white'>
        <Table>
          <TableHeader>
            <TableRow className='border-neutral-200'>
              <TableHead
                className='cursor-pointer hover:bg-neutral-50 transition-colors h-9 text-xs font-medium text-neutral-600'
                onClick={() => {
                  return handleSort('name');
                }}
              >
                <div className='flex items-center gap-1'>
                  Name
                  {sortConfig.key === 'name' &&
                    (sortConfig.direction === 'asc' ? (
                      <SortAsc className='h-3 w-3' />
                    ) : (
                      <SortDesc className='h-3 w-3' />
                    ))}
                </div>
              </TableHead>
              <TableHead className='text-xs font-medium text-neutral-600 h-9'>
                Description
              </TableHead>
              <TableHead
                className='cursor-pointer hover:bg-neutral-50 transition-colors text-xs font-medium text-neutral-600 h-9'
                onClick={() => {
                  return handleSort('deliverableType');
                }}
              >
                <div className='flex items-center gap-1'>
                  Type
                  {sortConfig.key === 'deliverableType' &&
                    (sortConfig.direction === 'asc' ? (
                      <SortAsc className='h-3 w-3' />
                    ) : (
                      <SortDesc className='h-3 w-3' />
                    ))}
                </div>
              </TableHead>
              <TableHead
                className='text-right cursor-pointer hover:bg-neutral-50 transition-colors text-xs font-medium text-neutral-600 h-9'
                onClick={() => {
                  return handleSort('price');
                }}
              >
                <div className='flex items-center justify-end gap-1'>
                  Price
                  {sortConfig.key === 'price' &&
                    (sortConfig.direction === 'asc' ? (
                      <SortAsc className='h-3 w-3' />
                    ) : (
                      <SortDesc className='h-3 w-3' />
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
                    <div className='text-muted-foreground text-sm'>
                      No matching deliverables found
                    </div>
                    {searchQuery && (
                      <Button
                        variant='ghost'
                        size='sm'
                        onClick={() => {
                          return setSearchQuery('');
                        }}
                        className='h-8 text-xs mt-1'
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
                    <TableRow
                      className={cn(
                        isExpanded ? 'bg-neutral-50' : 'bg-white',
                        'cursor-pointer hover:bg-neutral-50/70 transition-colors border-neutral-200',
                      )}
                      onClick={(e) => {
                        // Prevent toggling when clicking on dropdown menu
                        if ((e.target as HTMLElement).closest('.dropdown-action')) return;
                        toggleRowExpansion(deliverable._id);
                      }}
                    >
                      <TableCell className='py-2.5 text-sm font-medium text-neutral-800'>
                        {deliverable.name}
                      </TableCell>
                      <TableCell
                        className='max-w-[300px] truncate py-2.5 text-sm text-neutral-600'
                        title={deliverable.description}
                      >
                        {deliverable.description}
                      </TableCell>
                      <TableCell className='py-2.5'>
                        <Badge
                          variant='secondary'
                          className={cn(
                            'text-xs font-normal py-0.5 px-2 rounded',
                            getDeliverableTypeColor(deliverable.deliverableType),
                          )}
                        >
                          {deliverable.deliverableType}
                        </Badge>
                      </TableCell>
                      <TableCell className='text-right font-medium text-sm py-2.5 text-neutral-800'>
                        $
                        {parseFloat(deliverable.price).toLocaleString('en-US', {
                          minimumFractionDigits: 2,
                          maximumFractionDigits: 2,
                        })}
                      </TableCell>
                      <TableCell className='py-2.5'>
                        <div className='flex items-center gap-1 dropdown-action'>
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                              <Button
                                variant='ghost'
                                size='sm'
                                className='h-7 w-7 p-0'
                                onClick={(e) => {
                                  return e.stopPropagation();
                                }}
                              >
                                <MoreHorizontal className='h-3.5 w-3.5 text-neutral-600' />
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                              align='end'
                              className='dropdown-action min-w-[140px]'
                            >
                              <DropdownMenuItem
                                onClick={(e) => {
                                  e.stopPropagation();
                                  return handleEdit(deliverable._id);
                                }}
                                className='text-xs py-1.5'
                              >
                                <Pencil className='mr-2 h-3.5 w-3.5 text-neutral-500' />
                                Edit
                              </DropdownMenuItem>
                              <DropdownMenuItem
                                className='text-xs text-destructive py-1.5'
                                onClick={(e) => {
                                  e.stopPropagation();
                                  return setDeliverableToDelete(deliverable._id);
                                }}
                              >
                                <Trash2 className='mr-2 h-3.5 w-3.5' />
                                Delete
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
                        </div>
                      </TableCell>
                    </TableRow>

                    {isExpanded && (
                      <TableRow className='bg-neutral-50/80 border-neutral-200'>
                        <TableCell colSpan={5} className='p-0 border-t-0'>
                          <div className='p-4 space-y-6'>
                            {/* Basic Details Section */}
                            <section className='border border-neutral-200 rounded-lg overflow-hidden bg-white'>
                              <header className='px-4 py-3 border-b border-neutral-100 flex items-center'>
                                <FileText className='mr-3 text-neutral-500/70' size={16} />
                                <h3 className='font-medium text-sm text-neutral-700'>
                                  Basic Details
                                </h3>
                              </header>

                              <div className='p-4 space-y-4'>
                                <div className='grid grid-cols-1 sm:grid-cols-2 gap-5'>
                                  <div>
                                    <h4 className='text-xs text-neutral-500 mb-1.5'>Name</h4>
                                    <p className='font-medium text-sm'>{deliverable.name || '-'}</p>
                                  </div>
                                  <div>
                                    <h4 className='text-xs text-neutral-500 mb-1.5'>Type</h4>
                                    <p className='font-medium text-sm'>
                                      {getDeliverableTypeLabel(
                                        deliverable.deliverableType,
                                        deliverable.customDeliverableType,
                                      )}
                                    </p>
                                  </div>
                                  <div>
                                    <h4 className='text-xs text-neutral-500 mb-1.5'>Price</h4>
                                    <p className='font-medium text-sm flex items-center'>
                                      <DollarSign className='text-green-600/80 mr-1 h-3.5 w-3.5' />
                                      {parseFloat(deliverable.price).toLocaleString('en-US', {
                                        minimumFractionDigits: 2,
                                        maximumFractionDigits: 2,
                                      })}
                                    </p>
                                  </div>
                                </div>
                                {deliverable.description && (
                                  <div className='border-t border-neutral-100 pt-4 mt-1'>
                                    <h4 className='text-xs text-neutral-500 mb-1.5'>Description</h4>
                                    <p className='text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed'>
                                      {deliverable.description}
                                    </p>
                                  </div>
                                )}
                              </div>
                            </section>

                            {/* Custom Fields Section */}
                            {deliverable.customFields && deliverable.customFields.length > 0 && (
                              <section className='border border-neutral-200 rounded-lg overflow-hidden bg-white'>
                                <header className='px-4 py-3 border-b border-neutral-100 flex items-center'>
                                  <Package className='mr-3 text-neutral-500/70' size={16} />
                                  <h3 className='font-medium text-sm text-neutral-700'>
                                    Content Details
                                  </h3>
                                </header>

                                <div className='p-4 space-y-5'>
                                  <div className='space-y-5'>
                                    {deliverable.customFields.map((field) => {
                                      if (!hasContent(field)) return null;
                                      return (
                                        <div key={field._id} className='space-y-1.5'>
                                          <h4 className='text-xs text-neutral-500'>
                                            {field.label || 'Untitled Field'}
                                          </h4>
                                          <div className='text-sm text-neutral-700'>
                                            {formatFieldContent(field)}
                                          </div>
                                        </div>
                                      );
                                    })}
                                    {deliverable.customFields.filter(hasContent).length === 0 && (
                                      <p className='text-sm text-neutral-500 italic'>
                                        No content fields added
                                      </p>
                                    )}
                                  </div>
                                </div>
                              </section>
                            )}

                            {/* Team Notes Section */}
                            {deliverable.teamNotes && (
                              <section className='border border-neutral-200 rounded-lg overflow-hidden bg-white'>
                                <header className='px-4 py-3 border-b border-neutral-100 flex items-center'>
                                  <FileText className='mr-3 text-neutral-500/70' size={16} />
                                  <h3 className='font-medium text-sm text-neutral-700'>
                                    Team Notes
                                  </h3>
                                </header>
                                <div className='p-4'>
                                  <p className='text-sm text-neutral-700 whitespace-pre-wrap leading-relaxed'>
                                    {deliverable.teamNotes}
                                  </p>
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
        <AlertDialogContent className='max-w-md rounded-md'>
          <AlertDialogHeader>
            <AlertDialogTitle className='text-base'>Delete deliverable?</AlertDialogTitle>
            <AlertDialogDescription className='text-sm text-neutral-600'>
              This action cannot be undone. This will permanently delete the deliverable and remove
              it from the project.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter className='gap-2'>
            <AlertDialogCancel className='h-9 text-sm'>Cancel</AlertDialogCancel>
            <AlertDialogAction
              className='bg-destructive text-destructive-foreground hover:bg-destructive/90 h-9 text-sm'
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
