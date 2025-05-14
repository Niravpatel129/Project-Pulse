import { TaxRate } from '@/components/project/TaxRateDialog';
import { newRequest } from '@/utils/newRequest';

// Get all tax rates for a project
export async function getTaxRates(): Promise<TaxRate[]> {
  const response = await newRequest.get('/invoice-taxes');

  // Transform the data to map _id to id
  if (response.data?.data && Array.isArray(response.data.data)) {
    return response.data.data.map((item) => {
      return {
        id: item._id,
        name: item.name,
        rate: item.rate,
      };
    });
  }

  return [];
}

// Create a new tax rate
export async function createTaxRate(taxRate: Omit<TaxRate, 'id'>): Promise<TaxRate> {
  const response = await newRequest.post('/invoice-taxes', taxRate);

  // Transform the response to match our frontend model
  if (response.data?.data) {
    return {
      id: response.data.data._id,
      name: response.data.data.name,
      rate: response.data.data.rate,
    };
  }

  return response.data.data;
}

// Update an existing tax rate
export async function updateTaxRate(
  taxRateId: string,
  taxRate: Omit<TaxRate, 'id'>,
): Promise<TaxRate> {
  const response = await newRequest.put(`/invoice-taxes/${taxRateId}`, taxRate);

  // Transform the response to match our frontend model
  if (response.data?.data) {
    return {
      id: response.data.data._id,
      name: response.data.data.name,
      rate: response.data.data.rate,
    };
  }

  return response.data.data;
}

// Delete a tax rate
export async function deleteTaxRate(taxRateId: string): Promise<void> {
  await newRequest.delete(`/invoice-taxes/${taxRateId}`);
}
