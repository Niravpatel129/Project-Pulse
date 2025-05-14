import { aiContext } from '@/api/services/aiContext';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Textarea } from '@/components/ui/textarea';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { DocumentUpload } from './DocumentUpload';

interface AIContextDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function AIContextDialog({ open, onOpenChange }: AIContextDialogProps) {
  const [activeTab, setActiveTab] = useState('documents');
  const [knowledgePrompt, setKnowledgePrompt] = useState('');
  const queryClient = useQueryClient();

  // Query for fetching AI context
  const { data: context, isLoading: isLoadingContext } = useQuery({
    queryKey: ['aiContext'],
    queryFn: aiContext.get,
    enabled: open,
  });

  // Mutation for updating AI context
  const { mutate: updateContext, isPending: isUpdating } = useMutation({
    mutationFn: aiContext.update,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['aiContext'] });
      toast.success('AI context saved successfully');
    },
    onError: (error) => {
      console.error('Error saving AI context:', error);
      toast.error('Failed to save AI context');
    },
  });

  // Update local state when context data changes
  useEffect(() => {
    if (context) {
      setKnowledgePrompt(context.knowledgePrompt);
    }
  }, [context]);

  const handleSave = () => {
    updateContext({ knowledgePrompt });
  };

  const handleUploadSuccess = (response: any) => {
    // Handle successful upload
    console.log('Document uploaded successfully:', response);
  };

  const handleUploadError = (error: any) => {
    // Handle upload error
    console.error('Error uploading document:', error);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className='bg-white dark:bg-[#141414] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] max-w-3xl h-[600px]'>
        <DialogHeader>
          <DialogTitle className='text-lg font-medium'>AI Context</DialogTitle>
        </DialogHeader>
        <Tabs value={activeTab} onValueChange={setActiveTab} className='flex-1'>
          <TabsList className='grid w-full grid-cols-2 mb-4 bg-[#F4F4F5] dark:bg-[#232428]'>
            <TabsTrigger value='documents'>Documents</TabsTrigger>
            <TabsTrigger value='knowledge'>Knowledge Prompts</TabsTrigger>
          </TabsList>
          <ScrollArea className='h-[500px] pr-4'>
            <TabsContent value='documents' className='space-y-4'>
              <DocumentUpload
                onUploadSuccess={handleUploadSuccess}
                onUploadError={handleUploadError}
              />
            </TabsContent>
            <TabsContent value='knowledge' className='space-y-4'>
              <div className='space-y-2 p-1'>
                <p className='text-sm text-[#3F3F46]/60 dark:text-gray-400'>
                  Add custom knowledge or context that will be used to inform the AI&apos;s
                  responses.
                </p>
                <Textarea
                  value={knowledgePrompt}
                  maxLength={1000}
                  onChange={(e) => {
                    return setKnowledgePrompt(e.target.value);
                  }}
                  placeholder='Enter any additional context or knowledge that should be considered...'
                  className='min-h-[200px] bg-[#F4F4F5] dark:bg-[#1a1a1a] border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] placeholder:text-[#3F3F46]/60 dark:placeholder:text-[#8C8C8C]'
                  disabled={isLoadingContext}
                />
                {knowledgePrompt.length >= 1000 && (
                  <p className='text-sm text-[#3F3F46]/60 dark:text-gray-400'>
                    {knowledgePrompt.length} / 1000 max characters reached
                  </p>
                )}
                <div className='flex justify-end mt-4'>
                  <Button
                    onClick={handleSave}
                    disabled={isUpdating || isLoadingContext}
                    variant='outline'
                    className='border-[#E4E4E7] dark:border-[#232428] text-[#3F3F46] dark:text-[#fafafa] hover:bg-[#F4F4F5] dark:hover:bg-[#232428]'
                  >
                    {isUpdating ? 'Saving...' : 'Save Context'}
                  </Button>
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
