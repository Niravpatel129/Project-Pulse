import { Template } from '@/api/models';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import { Textarea } from '@/components/ui/textarea';
import { useEffect, useState } from 'react';

interface NewModuleFromTemplateSheetProps {
  isOpen: boolean;
  onClose: () => void;
  template: Template;
  onSave: (moduleData: any) => void;
}

// Extend the Template type to include content property
interface TemplateWithContent extends Template {
  content?: string;
}

export default function NewModuleFromTemplateSheet({
  isOpen,
  onClose,
  template,
  onSave,
}: NewModuleFromTemplateSheetProps) {
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [content, setContent] = useState('');

  // Set initial content when template changes
  useEffect(() => {
    if (template) {
      // Type assertion to access content property
      const templateWithContent = template as TemplateWithContent;
      setContent(templateWithContent.content || '');
    }
  }, [template]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    onSave({
      name,
      description,
      content,
      templateId: template.id,
    });

    // Reset form
    setName('');
    setDescription('');
    setContent('');
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
      <SheetContent className='sm:max-w-md'>
        <SheetHeader>
          <SheetTitle>Create from Template</SheetTitle>
          <SheetDescription>
            Create a new module based on the template &ldquo;{template?.name}&rdquo;.
          </SheetDescription>
        </SheetHeader>

        <form onSubmit={handleSubmit} className='space-y-4 py-4'>
          <div className='space-y-2'>
            <Label htmlFor='name'>Name</Label>
            <Input
              id='name'
              value={name}
              onChange={(e) => {
                return setName(e.target.value);
              }}
              placeholder='Module name'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='description'>Description</Label>
            <Textarea
              id='description'
              value={description}
              onChange={(e) => {
                return setDescription(e.target.value);
              }}
              placeholder='Module description'
              rows={3}
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='content'>Content</Label>
            <Textarea
              id='content'
              value={content}
              onChange={(e) => {
                return setContent(e.target.value);
              }}
              placeholder='Module content'
              rows={6}
              required
            />
          </div>

          <SheetFooter>
            <Button type='submit'>Create Module</Button>
          </SheetFooter>
        </form>
      </SheetContent>
    </Sheet>
  );
}
