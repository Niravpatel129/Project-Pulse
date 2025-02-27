'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useInventory } from '@/contexts';
import { useEffect } from 'react';

export function InventoryExample() {
  const {
    items,
    categories,
    isLoading,
    error,
    loadItems,
    loadCategories,
    createItem,
    deleteItem,
    filterItemsByCategory,
  } = useInventory();

  useEffect(() => {
    // Load inventory items and categories when component mounts
    loadItems();
    loadCategories();
  }, [loadItems, loadCategories]);

  const handleCreateItem = async () => {
    const newItem = {
      name: `New Item ${new Date().toISOString().substring(11, 19)}`,
      description: 'Created from example component',
      sku: `SKU-${Math.floor(Math.random() * 10000)}`,
      price: 99.99,
      stock: 10,
      isActive: true,
      categoryId: categories.length > 0 ? categories[0].id : undefined,
    };

    await createItem(newItem);
  };

  const handleFilterByCategory = async (categoryId: string) => {
    await filterItemsByCategory(categoryId);
  };

  if (error) {
    return (
      <Card className='w-full'>
        <CardHeader>
          <CardTitle className='text-red-500'>Error</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error.message}</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className='w-full'>
      <CardHeader>
        <CardTitle>Inventory Example</CardTitle>
        <CardDescription>This component demonstrates using the InventoryContext</CardDescription>
      </CardHeader>
      <CardContent>
        <div className='flex gap-2 mb-4'>
          <Button onClick={handleCreateItem}>Create Item</Button>
        </div>

        {isLoading ? (
          <p>Loading...</p>
        ) : (
          <div className='space-y-6'>
            <div>
              <h3 className='text-lg font-medium mb-2'>Categories ({categories.length})</h3>
              {categories.length === 0 ? (
                <p className='text-muted-foreground'>No categories found</p>
              ) : (
                <div className='flex flex-wrap gap-2'>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      variant='outline'
                      size='sm'
                      onClick={() => handleFilterByCategory(category.id)}
                    >
                      {category.name}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            <div>
              <h3 className='text-lg font-medium mb-2'>Items ({items.length})</h3>
              {items.length === 0 ? (
                <p className='text-muted-foreground'>No items found</p>
              ) : (
                <ul className='space-y-2'>
                  {items.map((item) => (
                    <li key={item.id} className='p-3 border rounded-md'>
                      <div className='flex justify-between items-center'>
                        <div>
                          <h4 className='font-medium'>{item.name}</h4>
                          <p className='text-sm text-muted-foreground'>
                            SKU: {item.sku} | Price: ${item.price} | Stock: {item.stock}
                          </p>
                          <p className='text-xs text-muted-foreground'>
                            Category: {item.categoryName || 'None'}
                          </p>
                        </div>
                        <div className='flex gap-2'>
                          <Button
                            variant='destructive'
                            size='sm'
                            onClick={() => deleteItem(item.id)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
