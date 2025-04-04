'use client';

import { FileType, InventoryItem, Invoice, ProjectFile, Template } from '@/api/models';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useApi } from '@/hooks/useApi';
import { Loader2, Plus } from 'lucide-react';
import { useEffect, useState } from 'react';

// Helper function to format dates
const formatDate = (dateString?: string) => {
  if (!dateString) return 'N/A';
  return new Date(dateString).toLocaleDateString();
};

// Status color mapping
const getStatusColor = (status: string): string => {
  const statusMap: Record<string, string> = {
    draft: 'bg-gray-200 text-gray-800',
    'in-progress': 'bg-blue-200 text-blue-800',
    'pending-review': 'bg-yellow-200 text-yellow-800',
    completed: 'bg-green-200 text-green-800',
    paid: 'bg-green-200 text-green-800',
    unpaid: 'bg-red-200 text-red-800',
    active: 'bg-green-200 text-green-800',
    inactive: 'bg-gray-200 text-gray-800',
    archived: 'bg-gray-300 text-gray-700',
  };

  return statusMap[status] || 'bg-gray-200 text-gray-800';
};

export default function ApiTestPage() {
  const { services, isLoading, getError } = useApi();
  const [activeTab, setActiveTab] = useState('project-files');
  const [projectFiles, setProjectFiles] = useState<ProjectFile[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [inventoryItems, setInventoryItems] = useState<InventoryItem[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  // Parameters for API calls in the format expected by the client
  type ApiParams = Record<string, string | number | boolean | null | undefined>;

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch project files - pass parameters directly as expected by the API client
        const filesParams: ApiParams = { page: 1, limit: 10 };
        const filesResponse = await services.projectFiles.getAll(filesParams);
        if (filesResponse) {
          setProjectFiles(filesResponse.items);
        }

        // Fetch templates
        const templatesParams: ApiParams = { page: 1, limit: 10 };
        const templatesResponse = await services.templates.getAll(templatesParams);
        if (templatesResponse) {
          setTemplates(templatesResponse.items);
        }

        // Fetch inventory items
        const inventoryParams: ApiParams = { page: 1, limit: 10 };
        const inventoryResponse = await services.inventory.getItems(inventoryParams);
        if (inventoryResponse) {
          setInventoryItems(inventoryResponse.items);
        }

        // Fetch invoices
        const invoicesParams: ApiParams = { page: 1, limit: 10 };
        const invoicesResponse = await services.invoices.getAll(invoicesParams);
        if (invoicesResponse) {
          setInvoices(invoicesResponse.items);
        }
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    };

    fetchData();
  }, [services]);

  const handleCreateFile = async () => {
    const newFile = await services.projectFiles.create({
      name: 'New Test Project File',
      description: 'Created as a test from the API Test page',
      type: 'other' as FileType,
      status: 'draft',
      priority: 'medium',
      clientName: 'Test Client',
      attachments: [],
      comments: [],
    });

    if (newFile) {
      setProjectFiles((prev) => {
        return [newFile, ...prev];
      });
    }
  };

  const handleCreateTemplate = async () => {
    const newTemplate = await services.templates.create({
      _id: `template-${Date.now()}`,
      name: 'New Test Template',
      description: 'Created as a test from the API Test page',
      fields: [
        {
          id: 'field-1',
          name: 'Text Field',
          type: 'text',
          required: true,
        },
        {
          id: 'field-2',
          name: 'Number Field',
          type: 'number',
          required: false,
        },
      ],
    });

    if (newTemplate) {
      setTemplates((prev) => {
        return [newTemplate, ...prev];
      });
    }
  };

  const handleCreateInventoryItem = async () => {
    const newItem = await services.inventory.createItem({
      name: 'New Test Item',
      description: 'Created as a test from the API Test page',
      sku: `ITEM-${Date.now()}`,
      price: 19.99,
      cost: 9.99,
      stock: 100,
      isActive: true,
    });

    if (newItem) {
      setInventoryItems((prev) => {
        return [newItem, ...prev];
      });
    }
  };

  const handleCreateInvoice = async () => {
    const today = new Date();
    const dueDate = new Date();
    dueDate.setDate(today.getDate() + 14); // Due in 14 days

    const newInvoice = await services.invoices.create({
      invoiceNumber: `INV-${Date.now()}`,
      clientId: 'client-1',
      clientName: 'Test Client',
      issueDate: today.toISOString(),
      dueDate: dueDate.toISOString(),
      status: 'draft',
      total: 299.99,
      items: [
        {
          id: `item-${Date.now()}`,
          description: 'Test Service',
          quantity: 1,
          unitPrice: 299.99,
          total: 299.99,
        },
      ],
      subtotal: 299.99,
    });

    if (newInvoice) {
      setInvoices((prev) => {
        return [newInvoice, ...prev];
      });
    }
  };

  return (
    <div className='container mx-auto py-10'>
      <h1 className='text-3xl font-bold mb-8'>API Test Page</h1>
      <p className='mb-8 text-gray-600'>
        This page demonstrates the API client integration with mock data. Use the tabs below to view
        different data types and test creating new records.
      </p>

      <Tabs value={activeTab} onValueChange={setActiveTab} className='w-full'>
        <TabsList className='grid grid-cols-4 mb-8'>
          <TabsTrigger value='project-files'>Project Files</TabsTrigger>
          <TabsTrigger value='templates'>Templates</TabsTrigger>
          <TabsTrigger value='inventory'>Inventory</TabsTrigger>
          <TabsTrigger value='invoices'>Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value='project-files' className='space-y-4'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold'>Project Files</h2>
            <Button onClick={handleCreateFile}>
              <Plus className='h-4 w-4 mr-2' />
              Create File
            </Button>
          </div>

          {isLoading('projectFiles.getAll') ? (
            <div className='flex justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
            </div>
          ) : getError('projectFiles.getAll') ? (
            <Card>
              <CardContent className='pt-6 text-red-500'>
                Error loading project files: {getError('projectFiles.getAll')?.message}
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {projectFiles.map((file) => {
                return (
                  <Card key={file.id} className='overflow-hidden'>
                    <CardHeader className='pb-2'>
                      <div className='flex justify-between items-start'>
                        <CardTitle className='text-lg'>{file.name}</CardTitle>
                        <Badge className={getStatusColor(file.status)}>{file.status}</Badge>
                      </div>
                      <CardDescription>{file.description || 'No description'}</CardDescription>
                    </CardHeader>
                    <CardContent className='pb-2'>
                      <div className='space-y-1 text-sm'>
                        <div>
                          <span className='font-medium'>Type:</span> {file.type}
                        </div>
                        <div>
                          <span className='font-medium'>Client:</span> {file.clientName}
                        </div>
                        <div>
                          <span className='font-medium'>Created:</span> {formatDate(file.createdAt)}
                        </div>
                        {file.dueDate && (
                          <div>
                            <span className='font-medium'>Due:</span> {formatDate(file.dueDate)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className='pt-0 text-xs text-gray-500'>ID: {file.id}</CardFooter>
                  </Card>
                );
              })}
              {projectFiles.length === 0 && (
                <Card className='col-span-full'>
                  <CardContent className='pt-6 text-center text-gray-500'>
                    No project files found
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value='templates' className='space-y-4'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold'>Templates</h2>
            <Button onClick={handleCreateTemplate}>
              <Plus className='h-4 w-4 mr-2' />
              Create Template
            </Button>
          </div>

          {isLoading('templates.getAll') ? (
            <div className='flex justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
            </div>
          ) : getError('templates.getAll') ? (
            <Card>
              <CardContent className='pt-6 text-red-500'>
                Error loading templates: {getError('templates.getAll')?.message}
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {templates.map((template) => {
                return (
                  <Card key={template._id} className='overflow-hidden'>
                    <CardHeader className='pb-2'>
                      <CardTitle className='text-lg'>{template.name}</CardTitle>
                      <CardDescription>{template.description || 'No description'}</CardDescription>
                    </CardHeader>
                    <CardContent className='pb-2'>
                      <div className='space-y-1 text-sm'>
                        <div>
                          <span className='font-medium'>Fields:</span> {template.fields.length}
                        </div>
                        <div>
                          <span className='font-medium'>Created:</span>{' '}
                          {formatDate(template.createdAt)}
                        </div>
                        <div className='flex flex-wrap gap-1 mt-2'>
                          {template.fields.slice(0, 3).map((field) => {
                            return (
                              <Badge key={field.id} variant='outline' className='text-xs'>
                                {field.name} ({field.type})
                              </Badge>
                            );
                          })}
                          {template.fields.length > 3 && (
                            <Badge variant='outline' className='text-xs'>
                              +{template.fields.length - 3} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className='pt-0 text-xs text-gray-500'>
                      ID: {template._id}
                    </CardFooter>
                  </Card>
                );
              })}
              {templates.length === 0 && (
                <Card className='col-span-full'>
                  <CardContent className='pt-6 text-center text-gray-500'>
                    No templates found
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value='inventory' className='space-y-4'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold'>Inventory Items</h2>
            <Button onClick={handleCreateInventoryItem}>
              <Plus className='h-4 w-4 mr-2' />
              Create Item
            </Button>
          </div>

          {isLoading('inventory.getItems') ? (
            <div className='flex justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
            </div>
          ) : getError('inventory.getItems') ? (
            <Card>
              <CardContent className='pt-6 text-red-500'>
                Error loading inventory: {getError('inventory.getItems')?.message}
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {inventoryItems.map((item) => {
                return (
                  <Card key={item.id} className='overflow-hidden'>
                    <CardHeader className='pb-2'>
                      <div className='flex justify-between items-start'>
                        <CardTitle className='text-lg'>{item.name}</CardTitle>
                        <Badge
                          className={
                            item.isActive
                              ? 'bg-green-200 text-green-800'
                              : 'bg-gray-200 text-gray-800'
                          }
                        >
                          {item.isActive ? 'Active' : 'Inactive'}
                        </Badge>
                      </div>
                      <CardDescription>{item.description || 'No description'}</CardDescription>
                    </CardHeader>
                    <CardContent className='pb-2'>
                      <div className='space-y-1 text-sm'>
                        <div>
                          <span className='font-medium'>SKU:</span> {item.sku}
                        </div>
                        <div>
                          <span className='font-medium'>Price:</span> ${item.price.toFixed(2)}
                        </div>
                        <div>
                          <span className='font-medium'>Stock:</span> {item.stock}{' '}
                          {item.unit || 'units'}
                        </div>
                        {item.cost && (
                          <div>
                            <span className='font-medium'>Cost:</span> ${item.cost.toFixed(2)}
                          </div>
                        )}
                      </div>
                    </CardContent>
                    <CardFooter className='pt-0 text-xs text-gray-500'>ID: {item.id}</CardFooter>
                  </Card>
                );
              })}
              {inventoryItems.length === 0 && (
                <Card className='col-span-full'>
                  <CardContent className='pt-6 text-center text-gray-500'>
                    No inventory items found
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>

        <TabsContent value='invoices' className='space-y-4'>
          <div className='flex justify-between items-center mb-4'>
            <h2 className='text-xl font-semibold'>Invoices</h2>
            <Button onClick={handleCreateInvoice}>
              <Plus className='h-4 w-4 mr-2' />
              Create Invoice
            </Button>
          </div>

          {isLoading('invoices.getAll') ? (
            <div className='flex justify-center py-8'>
              <Loader2 className='h-8 w-8 animate-spin text-gray-500' />
            </div>
          ) : getError('invoices.getAll') ? (
            <Card>
              <CardContent className='pt-6 text-red-500'>
                Error loading invoices: {getError('invoices.getAll')?.message}
              </CardContent>
            </Card>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4'>
              {invoices.map((invoice) => {
                return (
                  <Card key={invoice.id} className='overflow-hidden'>
                    <CardHeader className='pb-2'>
                      <div className='flex justify-between items-start'>
                        <CardTitle className='text-lg'>Invoice #{invoice.invoiceNumber}</CardTitle>
                        <Badge className={getStatusColor(invoice.status)}>{invoice.status}</Badge>
                      </div>
                      <CardDescription>{invoice.clientName}</CardDescription>
                    </CardHeader>
                    <CardContent className='pb-2'>
                      <div className='space-y-1 text-sm'>
                        <div>
                          <span className='font-medium'>Total:</span> ${invoice.total.toFixed(2)}
                        </div>
                        <div>
                          <span className='font-medium'>Issue Date:</span>{' '}
                          {formatDate(invoice.issueDate)}
                        </div>
                        {invoice.dueDate && (
                          <div>
                            <span className='font-medium'>Due Date:</span>{' '}
                            {formatDate(invoice.dueDate)}
                          </div>
                        )}
                        <div>
                          <span className='font-medium'>Items:</span> {invoice.items?.length || 0}
                        </div>
                      </div>
                    </CardContent>
                    <CardFooter className='pt-0 text-xs text-gray-500'>ID: {invoice.id}</CardFooter>
                  </Card>
                );
              })}
              {invoices.length === 0 && (
                <Card className='col-span-full'>
                  <CardContent className='pt-6 text-center text-gray-500'>
                    No invoices found
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}
