import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import EmojiPickerComponent, { SkinTonePickerLocation, Theme } from 'emoji-picker-react';
import { Smile } from 'lucide-react';
import { useState } from 'react';

interface EmojiPickerProps {
  onSelect: (emoji: string) => void;
}

export function EmojiPicker({ onSelect }: EmojiPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant='ghost' size='icon' className='h-8 w-8 hover:bg-gray-100'>
          <Smile className='h-4 w-4' />
        </Button>
      </PopoverTrigger>
      <PopoverContent className='w-[320px] p-0' align='start'>
        <div className='emoji-picker-react'>
          <EmojiPickerComponent
            onEmojiClick={(emojiData) => {
              onSelect(emojiData.emoji);
              setIsOpen(false);
            }}
            width={320}
            height={350}
            theme={Theme.LIGHT}
            searchPlaceholder='Search emojis...'
            previewConfig={{
              showPreview: false,
            }}
            skinTonePickerLocation={SkinTonePickerLocation.SEARCH}
            lazyLoadEmojis
          />
        </div>
      </PopoverContent>
    </Popover>
  );
}
