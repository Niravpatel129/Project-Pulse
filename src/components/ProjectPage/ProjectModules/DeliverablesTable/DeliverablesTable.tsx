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
  Download,
  MoreHorizontal,
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

  // Helper function to render custom fields
  const renderCustomField = (field: CustomField) => {
    switch (field.type) {
      case 'shortText':
      case 'longText':
        return <span className='break-words'>{field.content}</span>;

      case 'attachment':
        return field.attachments.length > 0 ? (
          <div className='flex flex-col gap-1'>
            {field.attachments.map((attachment, index) => {
              return (
                <a
                  key={index}
                  href={attachment.url}
                  target='_blank'
                  rel='noopener noreferrer'
                  className='flex items-center gap-2 text-blue-500 hover:text-blue-700 transition-colors'
                >
                  <span className='flex items-center gap-1'>
                    <Download className='h-3 w-3' />
                    <span className='truncate max-w-[200px]'>{attachment.name}</span>
                  </span>
                  <span className='text-xs text-muted-foreground'>
                    ({(attachment.size / 1024).toFixed(1)} KB)
                  </span>
                </a>
              );
            })}
          </div>
        ) : (
          <span className='text-muted-foreground text-sm italic'>No attachments</span>
        );

      case 'databaseItem':
        return field.selectedItem ? (
          <div className='flex items-center gap-2'>
            <span>{field.selectedItem.name}</span>
            {field.selectedItem.Price && (
              <Badge variant='outline' className='text-xs'>
                ${field.selectedItem.Price}
              </Badge>
            )}
          </div>
        ) : (
          <span className='text-muted-foreground text-sm italic'>None selected</span>
        );

      default:
        return <span className='text-muted-foreground text-sm italic'>Unknown field type</span>;
    }
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

        <div className='text-sm text-muted-foreground'>
          {sortedAndFilteredDeliverables.length} deliverable
          {sortedAndFilteredDeliverables.length !== 1 ? 's' : ''}
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
                          <div className='p-4'>
                            {deliverable.customFields.length > 0 ? (
                              <div className='space-y-3'>
                                <div className='text-sm font-medium'>Custom Fields</div>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                                  {deliverable.customFields.map((field) => {
                                    return (
                                      <div
                                        key={field._id}
                                        className='bg-background p-3 rounded-md border shadow-sm'
                                      >
                                        <div className='font-medium text-xs text-muted-foreground mb-1.5'>
                                          {field.label}
                                        </div>
                                        <div>{renderCustomField(field)}</div>
                                      </div>
                                    );
                                  })}
                                </div>
                              </div>
                            ) : (
                              <div className='text-center py-4 text-muted-foreground'>
                                No custom fields for this deliverable
                              </div>
                            )}

                            {deliverable.teamNotes && (
                              <div className='mt-4 pt-4 border-t'>
                                <div className='text-sm font-medium mb-2'>Team Notes</div>
                                <div className='bg-background p-3 rounded-md border'>
                                  {deliverable.teamNotes}
                                </div>
                              </div>
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
