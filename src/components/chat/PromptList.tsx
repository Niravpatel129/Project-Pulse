import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { useState } from 'react';

interface PromptCategory {
  category: string;
  prompts: string[];
}

interface PromptListProps {
  categories: PromptCategory[];
  onSelectPrompt: (prompt: string) => void;
}

export function PromptList({ categories, onSelectPrompt }: PromptListProps) {
  const [activeTab, setActiveTab] = useState(categories[0].category);

  return (
    <div className='overflow-hidden rounded-md'>
      <Tabs defaultValue={categories[0].category} onValueChange={setActiveTab} className='w-full'>
        <div className='border-b border-gray-100 dark:border-gray-800 px-3 py-2'>
          <TabsList className='grid w-full grid-cols-4 bg-gray-50 dark:bg-gray-900'>
            {categories.map((category) => {
              return (
                <TabsTrigger
                  key={category.category}
                  value={category.category}
                  className='text-xs font-medium data-[state=active]:bg-white dark:data-[state=active]:bg-gray-800'
                >
                  {category.category}
                </TabsTrigger>
              );
            })}
          </TabsList>
        </div>
        <ScrollArea className='h-64'>
          {categories.map((category) => {
            return (
              <TabsContent key={category.category} value={category.category} className='p-0 mt-0'>
                <div className='p-1'>
                  {category.prompts.map((prompt, index) => {
                    return (
                      <div key={index}>
                        <Button
                          variant='ghost'
                          onClick={() => {
                            return onSelectPrompt(prompt);
                          }}
                          className={cn(
                            'w-full justify-start text-left text-xs p-3 h-auto rounded-md',
                            'hover:bg-gray-50 dark:hover:bg-gray-900/50 transition-colors duration-150',
                            'text-gray-700 dark:text-gray-300 whitespace-normal break-words',
                            'focus:outline-none focus-visible:ring-1 focus-visible:ring-gray-950 dark:focus-visible:ring-gray-300',
                          )}
                        >
                          {prompt}
                        </Button>
                        {index < category.prompts.length - 1 && (
                          <Separator className='my-1 bg-gray-100 dark:bg-gray-800' />
                        )}
                      </div>
                    );
                  })}
                </div>
              </TabsContent>
            );
          })}
        </ScrollArea>
      </Tabs>
    </div>
  );
}
