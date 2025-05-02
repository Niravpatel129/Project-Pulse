import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { useProject } from '@/contexts/ProjectContext';
import { newRequest } from '@/utils/newRequest';
import { useQuery } from '@tanstack/react-query';
import { Eye } from 'lucide-react';
import React, { useState } from 'react';

interface CustomField {
  id: string;
  type: string;
  label: string;
  content: string;
  _id: string;
  attachments: Array<{
    name: string;
    type: string;
    size: number;
    url: string;
    firebaseUrl: string;
    storagePath: string;
    uploadFailed: boolean;
  }>;
  selectedItem?: {
    id: string;
    position: number;
    Name: string;
    name: string;
    Price: number;
  };
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

const fetchDeliverables = async (projectId: string) => {
  if (!projectId) return [];

  const response = await newRequest.get(`/deliverables/project/${projectId}`);
  // The API returns { statusCode, data: [...deliverables], message, success }
  return response.data.data || [];
};

const DeliverablesTable = () => {
  const { project } = useProject();
  const [expandedRow, setExpandedRow] = useState<string | null>(null);

  const {
    data: deliverables = [],
    isLoading,
    error,
  } = useQuery({
    queryKey: ['deliverables', project?._id],
    queryFn: () => {
      return fetchDeliverables(project?._id || '');
    },
    enabled: !!project?._id,
  });

  // Helper function to render custom fields
  const renderCustomField = (field: CustomField) => {
    switch (field.type) {
      case 'shortText':
      case 'longText':
        return field.content;
      case 'attachment':
        return field.attachments.length > 0 ? (
          <a
            href={field.attachments[0].url}
            target='_blank'
            rel='noopener noreferrer'
            className='text-blue-500 hover:underline flex items-center gap-1'
          >
            <span>{field.attachments[0].name}</span>
            <span className='text-xs opacity-75'>
              ({(field.attachments[0].size / 1024).toFixed(1)} KB)
            </span>
          </a>
        ) : (
          'No attachments'
        );
      case 'databaseItem':
        return field.selectedItem ? (
          <div>
            <span>{field.selectedItem.name}</span>
            {field.selectedItem.Price && (
              <Badge variant='outline' className='ml-2'>
                ${field.selectedItem.Price}
              </Badge>
            )}
          </div>
        ) : (
          'None selected'
        );
      default:
        return 'Unknown field type';
    }
  };

  const toggleRowExpansion = (id: string) => {
    setExpandedRow(expandedRow === id ? null : id);
  };

  if (isLoading) {
    return <div className='text-center py-10 text-muted-foreground'>Loading deliverables...</div>;
  }

  if (error) {
    return <div className='text-center py-10 text-destructive'>Error loading deliverables</div>;
  }

  if (deliverables.length === 0) {
    return <div className='text-center py-10 text-muted-foreground'>No deliverables found</div>;
  }

  return (
    <div className='rounded-md border'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Type</TableHead>
            <TableHead className='text-right'>Price</TableHead>
            <TableHead className='w-[50px]'></TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {deliverables.map((deliverable) => {
            const isExpanded = expandedRow === deliverable._id;

            return (
              <React.Fragment key={deliverable._id}>
                <TableRow>
                  <TableCell className='font-medium'>{deliverable.name}</TableCell>
                  <TableCell>{deliverable.description}</TableCell>
                  <TableCell>
                    <Badge variant='secondary'>{deliverable.deliverableType}</Badge>
                  </TableCell>
                  <TableCell className='text-right font-semibold'>${deliverable.price}</TableCell>
                  <TableCell>
                    <Button
                      variant='ghost'
                      size='sm'
                      onClick={() => {
                        return toggleRowExpansion(deliverable._id);
                      }}
                      className='h-8 w-8 p-0'
                    >
                      <Eye className='h-4 w-4' />
                    </Button>
                  </TableCell>
                </TableRow>

                {isExpanded && deliverable.customFields.length > 0 && (
                  <TableRow className='bg-muted/50'>
                    <TableCell colSpan={5} className='p-4'>
                      <div className='text-sm font-medium mb-2'>Custom Fields</div>
                      <div className='grid grid-cols-1 md:grid-cols-2 gap-3'>
                        {deliverable.customFields.map((field) => {
                          return (
                            <div key={field._id} className='bg-background p-3 rounded-md'>
                              <div className='font-medium text-xs text-muted-foreground mb-1'>
                                {field.label}
                              </div>
                              <div>{renderCustomField(field)}</div>
                            </div>
                          );
                        })}
                      </div>
                    </TableCell>
                  </TableRow>
                )}
              </React.Fragment>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
};

export default DeliverablesTable;
