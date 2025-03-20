import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Save } from 'lucide-react';

interface EmailTemplate {
  id: string;
  name: string;
  subject: string;
  body: string;
}

interface EmailTemplatesProps {
  templates: EmailTemplate[];
  isLoading: boolean;
  newTemplateName: string;
  onTemplateNameChange: (value: string) => void;
  onSaveTemplate: () => void;
  onApplyTemplate: (templateId: string) => void;
  isSaving: boolean;
}

export const EmailTemplates = ({
  templates,
  isLoading,
  newTemplateName,
  onTemplateNameChange,
  onSaveTemplate,
  onApplyTemplate,
  isSaving,
}: EmailTemplatesProps) => {
  if (isLoading) {
    return <div className='text-center py-8'>Loading templates...</div>;
  }

  return (
    <div className='space-y-4'>
      <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
        {templates.length === 0 ? (
          <div className='text-center py-8 text-gray-500'>No templates found</div>
        ) : (
          templates.map((template) => {
            return (
              <Card key={template.id} className='p-4'>
                <div className='flex justify-between items-start mb-2'>
                  <h4 className='font-medium'>{template.name}</h4>
                  <Button
                    variant='ghost'
                    size='sm'
                    onClick={() => {
                      onApplyTemplate(template.id);
                      // Switch back to compose tab
                      const composeTab = document.querySelector(
                        '[data-value="compose"]',
                      ) as HTMLElement;
                      if (composeTab) composeTab.click();
                    }}
                  >
                    Use
                  </Button>
                </div>
                <div className='text-sm font-medium'>Subject: {template.subject}</div>
                <div className='text-xs text-gray-500 mt-2 line-clamp-3'>{template.body}</div>
              </Card>
            );
          })
        )}
      </div>

      <Card className='p-4 mt-4'>
        <h4 className='font-medium mb-2'>Save Current Email as Template</h4>
        <div className='space-y-4'>
          <div>
            <Label htmlFor='templateName'>Template Name</Label>
            <Input
              id='templateName'
              value={newTemplateName}
              onChange={(e) => {
                return onTemplateNameChange(e.target.value);
              }}
              placeholder='Enter template name'
            />
          </div>
          <Button onClick={onSaveTemplate} disabled={isSaving || !newTemplateName}>
            <Save className='h-4 w-4 mr-2' />
            Save as Template
          </Button>
        </div>
      </Card>
    </div>
  );
};
