import { InventoryExample } from '@/components/examples/InventoryExample';
import { InvoicesExample } from '@/components/examples/InvoicesExample';
import { ProjectFilesExample } from '@/components/examples/ProjectFilesExample';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function ExamplesPage() {
  return (
    <div className='container mx-auto py-8'>
      <h1 className='text-3xl font-bold mb-8'>Context API Examples</h1>

      <Tabs defaultValue='project-files' className='w-full'>
        <TabsList className='mb-4'>
          <TabsTrigger value='project-files'>Project Files</TabsTrigger>
          <TabsTrigger value='inventory'>Inventory</TabsTrigger>
          <TabsTrigger value='invoices'>Invoices</TabsTrigger>
        </TabsList>

        <TabsContent value='project-files'>
          <ProjectFilesExample />
        </TabsContent>

        <TabsContent value='inventory'>
          <InventoryExample />
        </TabsContent>

        <TabsContent value='invoices'>
          <InvoicesExample />
        </TabsContent>
      </Tabs>
    </div>
  );
}
