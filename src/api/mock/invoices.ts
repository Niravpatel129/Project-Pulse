import { Invoice, PaginatedResponse } from '../models';
import { mockInvoices } from './data/invoices';

/**
 * Handle invoices API requests in the mock API
 * @param method HTTP method (GET, POST, PUT, DELETE)
 * @param url Request URL
 * @param params URL parameters
 * @param data Request body
 * @returns Mock API response
 */
export const handleInvoicesRequest = (
  method: string,
  url: string,
  params: Record<string, string>,
  data?: unknown,
): Promise<unknown> => {
  return new Promise((resolve) => {
    // Simulate network delay
    setTimeout(() => {
      // GET requests
      if (method === 'GET') {
        // Get invoice by ID
        if (url.includes('/')) {
          const invoiceId = url.split('/').pop() as string;
          const invoice = mockInvoices.find((inv) => inv.id === invoiceId);

          if (invoice) {
            resolve(invoice);
          } else {
            resolve({
              error: 'Invoice not found',
              status: 404,
            });
          }

          return;
        }

        // Get all invoices with pagination
        const {
          page = '1',
          limit = '10',
          search = '',
          sort = 'createdAt',
          order = 'desc',
          status = '',
          from = '',
          to = '',
        } = params;

        const pageNum = parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        // Filter invoices
        let filteredInvoices = [...mockInvoices];

        // Filter by search term
        if (search) {
          const searchLower = search.toLowerCase();
          filteredInvoices = filteredInvoices.filter(
            (invoice) =>
              invoice.invoiceNumber.toLowerCase().includes(searchLower) ||
              invoice.clientName.toLowerCase().includes(searchLower) ||
              invoice.projectName.toLowerCase().includes(searchLower),
          );
        }

        // Filter by status
        if (status) {
          filteredInvoices = filteredInvoices.filter((invoice) => invoice.status === status);
        }

        // Filter by date range
        if (from) {
          const fromDate = new Date(from).getTime();
          filteredInvoices = filteredInvoices.filter(
            (invoice) => new Date(invoice.issueDate).getTime() >= fromDate,
          );
        }

        if (to) {
          const toDate = new Date(to).getTime();
          filteredInvoices = filteredInvoices.filter(
            (invoice) => new Date(invoice.issueDate).getTime() <= toDate,
          );
        }

        // Sort invoices
        filteredInvoices.sort((a, b) => {
          let aValue = a[sort as keyof Invoice];
          let bValue = b[sort as keyof Invoice];

          if (typeof aValue === 'string' && typeof bValue === 'string') {
            if (
              sort === 'createdAt' ||
              sort === 'updatedAt' ||
              sort === 'issueDate' ||
              sort === 'dueDate'
            ) {
              return order === 'asc'
                ? new Date(aValue).getTime() - new Date(bValue).getTime()
                : new Date(bValue).getTime() - new Date(aValue).getTime();
            }

            aValue = aValue.toLowerCase();
            bValue = bValue.toLowerCase();
          }

          return order === 'asc' ? (aValue < bValue ? -1 : 1) : aValue > bValue ? -1 : 1;
        });

        // Paginate
        const startIndex = (pageNum - 1) * limitNum;
        const endIndex = startIndex + limitNum;
        const paginatedInvoices = filteredInvoices.slice(startIndex, endIndex);

        const response: PaginatedResponse<Invoice> = {
          items: paginatedInvoices,
          meta: {
            total: filteredInvoices.length,
            page: pageNum,
            limit: limitNum,
            totalPages: Math.ceil(filteredInvoices.length / limitNum),
          },
        };

        resolve(response);
        return;
      }

      // POST request - Create a new invoice
      if (method === 'POST') {
        // Generate a unique invoice number based on current count
        const lastInvoice = mockInvoices.sort((a, b) => {
          return a.invoiceNumber.localeCompare(b.invoiceNumber);
        })[mockInvoices.length - 1];

        const lastNumber = parseInt(lastInvoice.invoiceNumber.split('-').pop() || '0', 10);
        const newNumber = lastNumber + 1;
        const invoiceNumber = `INV-${new Date().getFullYear()}-${newNumber
          .toString()
          .padStart(3, '0')}`;

        const newInvoice: Invoice = {
          ...(data as Partial<Invoice>),
          id: `invoice-${Date.now()}`,
          invoiceNumber,
          status: 'draft',
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        } as Invoice;

        // In a real implementation, we would add this to the database
        resolve(newInvoice);
        return;
      }

      // PUT request - Update an invoice
      if (method === 'PUT') {
        const invoiceId = url.split('/').pop() as string;
        const invoiceIndex = mockInvoices.findIndex((inv) => inv.id === invoiceId);

        if (invoiceIndex !== -1) {
          // In a real implementation, we would update the database
          const updatedInvoice: Invoice = {
            ...mockInvoices[invoiceIndex],
            ...(data as Partial<Invoice>),
            id: invoiceId, // Ensure ID doesn't change
            updatedAt: new Date().toISOString(),
          } as Invoice;

          resolve(updatedInvoice);
        } else {
          resolve({
            error: 'Invoice not found',
            status: 404,
          });
        }

        return;
      }

      // DELETE request - Delete an invoice
      if (method === 'DELETE') {
        const invoiceId = url.split('/').pop() as string;
        const invoiceIndex = mockInvoices.findIndex((inv) => inv.id === invoiceId);

        if (invoiceIndex !== -1) {
          // In a real implementation, we would delete from the database
          resolve({
            success: true,
            message: 'Invoice deleted successfully',
          });
        } else {
          resolve({
            error: 'Invoice not found',
            status: 404,
          });
        }

        return;
      }

      // PUT request for /invoices/:id/send - Send an invoice
      if (method === 'PUT' && url.includes('/send')) {
        const invoiceId = url.split('/').slice(-2)[0]; // Get the ID from the URL
        const invoice = mockInvoices.find((inv) => inv.id === invoiceId);

        if (invoice) {
          // In a real implementation, we would send the invoice via email
          // and update the database with the new status
          const updatedInvoice: Invoice = {
            ...invoice,
            status: 'sent',
            updatedAt: new Date().toISOString(),
          };

          resolve({
            success: true,
            message: `Invoice ${invoice.invoiceNumber} has been sent to ${invoice.clientEmail}`,
            invoice: updatedInvoice,
          });
        } else {
          resolve({
            error: 'Invoice not found',
            status: 404,
          });
        }

        return;
      }

      // PUT request for /invoices/:id/mark-paid - Mark an invoice as paid
      if (method === 'PUT' && url.includes('/mark-paid')) {
        const invoiceId = url.split('/').slice(-2)[0]; // Get the ID from the URL
        const invoice = mockInvoices.find((inv) => inv.id === invoiceId);

        if (invoice) {
          // In a real implementation, we would update the database with payment info
          const updatedInvoice: Invoice = {
            ...invoice,
            ...(data as { paymentDate: string; paymentMethod: string }),
            status: 'paid',
            updatedAt: new Date().toISOString(),
          };

          resolve({
            success: true,
            message: `Invoice ${invoice.invoiceNumber} has been marked as paid`,
            invoice: updatedInvoice,
          });
        } else {
          resolve({
            error: 'Invoice not found',
            status: 404,
          });
        }

        return;
      }

      // GET request for /invoices/:id/pdf - Generate PDF
      if (method === 'GET' && url.includes('/pdf')) {
        const invoiceId = url.split('/').slice(-2)[0]; // Get the ID from the URL
        const invoice = mockInvoices.find((inv) => inv.id === invoiceId);

        if (invoice) {
          // In a real implementation, we would generate a PDF
          resolve({
            success: true,
            message: `PDF for invoice ${invoice.invoiceNumber} has been generated`,
            pdfUrl: `/mock/invoices/${invoice.invoiceNumber}.pdf`,
          });
        } else {
          resolve({
            error: 'Invoice not found',
            status: 404,
          });
        }

        return;
      }

      // If we get here, the request method is not supported
      resolve({
        error: 'Method not supported',
        status: 405,
      });
    }, 300); // 300ms delay to simulate network
  });
};
