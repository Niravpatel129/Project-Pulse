// Helper functions for the deliverable content tab

// Get field error from errors object
export const getFieldError = (field: any, errors: any) => {
  if (!errors) return null;

  // Find errors related to this field
  const fieldErrors = Object.keys(errors)
    .filter((key) => {
      return key.includes(`customField_`) && key.includes(field.id);
    })
    .map((key) => {
      return errors[key];
    });

  return fieldErrors.length > 0 ? fieldErrors[0] : null;
};

// Function to determine icon based on table name
export const getIconForTableType = (tableName: string) => {
  const name = tableName.toLowerCase();
  if (name.includes('product') || name.includes('item') || name.includes('inventory'))
    return 'product';
  if (name.includes('customer') || name.includes('client') || name.includes('user'))
    return 'customer';
  if (name.includes('project') || name.includes('task')) return 'project';
  if (name.includes('invoice') || name.includes('payment') || name.includes('bill'))
    return 'invoice';
  if (name.includes('flag')) return 'flag';
  if (name.includes('order')) return 'order';
  return 'database';
};
