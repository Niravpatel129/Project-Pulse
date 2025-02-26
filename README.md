# Pulse: Project & Inventory Management System

Pulse is a comprehensive project management system with integrated CRM (Customer Relationship Management) and ERP (Enterprise Resource Planning) features. It helps businesses manage their projects, templates, and inventory in one unified platform.

## Features

### Project Management

- Create and manage project files
- Add attachments to projects
- Track file versions and history
- Collaborate with comments
- Email documents to clients

### Template System

- Create reusable templates with customizable fields
- Support for various field types: text, number, date, price, dimension, and more
- Template items can be added to projects
- Version history for template items
- Edit and restore previous versions

### Inventory Management (CRM/ERP)

- Track inventory items and categories
- Monitor stock levels with alerts for low stock
- Connect inventory items to template fields
- Usage tracking across projects
- Inventory reporting dashboard

## Inventory Integration

The system creates a powerful connection between your templates and inventory:

1. **Template Creation**

   - When creating templates, you can add "Inventory Item" field types
   - Optionally filter by category to limit available items

2. **Template Usage**

   - When filling out templates, users select from available inventory items
   - System tracks which items are used in which templates/projects
   - Stock levels are automatically updated

3. **Inventory Reporting**
   - View comprehensive inventory reports
   - Filter by all items, low stock, or used items
   - Track usage across projects
   - Monitor stock levels

## Getting Started

To run the application locally:

```bash
npm install
npm run dev
```

## Inventory Workflow Example

### Creating a Template with Inventory Items

1. Click "Add File Item"
2. Select "Template" as the file type
3. Fill in template details
4. Add fields as needed
5. For inventory-connected fields, select "Inventory Item" as the field type
6. Optionally select a category to filter available items

### Using a Template with Inventory Items

1. Open a project file
2. Click "Add Item" → "Add Template"
3. Select a template that includes inventory fields
4. Fill in all required fields
5. For inventory fields, select an item from your inventory
6. Save the template item

### Viewing Inventory Reports

1. Click the "Inventory" button in the top menu
2. View overall inventory statistics
3. Filter by All Items, Low Stock, or Used Items
4. See which items are being used in which projects

## Benefits

- **Reduce Errors**: Templates ensure consistent data collection
- **Improve Tracking**: Know exactly which inventory items are used in each project
- **Optimize Stock**: Get alerts when items are running low
- **Business Intelligence**: Generate reports on product usage and popularity
- **Better Forecasting**: Use historical data to plan future inventory needs

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
