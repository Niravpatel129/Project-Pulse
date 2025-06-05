import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  MdAttachFile,
  MdDelete,
  MdFormatBold,
  MdFormatColorText,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatQuote,
  MdFormatUnderlined,
  MdImage,
  MdInsertEmoticon,
  MdLink,
  MdSend,
} from 'react-icons/md';

interface InboxReplyToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onList: () => void;
  onLink: () => void;
  onFontFamily: (font: string) => void;
  onFontSize: (size: string) => void;
  onTextColor: (color: string) => void;
  onImage?: () => void;
  onQuote?: () => void;
  onEmoji?: () => void;
  onAttach?: () => void;
  onDelete?: () => void;
  onSend?: () => void;
}

const FONT_FAMILIES = [
  { value: 'Arial', label: 'Arial' },
  { value: 'Times New Roman', label: 'Times New Roman' },
  { value: 'Helvetica', label: 'Helvetica' },
  { value: 'Georgia', label: 'Georgia' },
  { value: 'Courier New', label: 'Courier New' },
];

const FONT_SIZES = [
  { value: '12px', label: 'Small' },
  { value: '16px', label: 'Normal' },
  { value: '20px', label: 'Large' },
  { value: '24px', label: 'Extra Large' },
];

const COLORS = [
  '#000000', // Black
  '#FF0000', // Red
  '#0000FF', // Blue
  '#008000', // Green
  '#800080', // Purple
  '#FFA500', // Orange
];

export function InboxReplyToolbar({
  onBold,
  onItalic,
  onUnderline,
  onList,
  onLink,
  onFontFamily,
  onFontSize,
  onTextColor,
  onImage,
  onQuote,
  onEmoji,
  onAttach,
  onDelete,
  onSend,
}: InboxReplyToolbarProps) {
  return (
    <div className='sticky bottom-0 z-10 bg-background border-t p-2 shadow-sm'>
      <div className='flex items-center justify-between w-full'>
        {/* Left side: formatting options */}
        <div className='flex items-center gap-0.5'>
          <Select onValueChange={onFontFamily}>
            <SelectTrigger className='h-8 w-[120px]'>
              <SelectValue placeholder='Font' />
            </SelectTrigger>
            <SelectContent>
              {FONT_FAMILIES.map((font) => {
                return (
                  <SelectItem key={font.value} value={font.value}>
                    <span style={{ fontFamily: font.value }}>{font.label}</span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Select onValueChange={onFontSize}>
            <SelectTrigger className='h-8 w-[100px]'>
              <SelectValue placeholder='Size' />
            </SelectTrigger>
            <SelectContent>
              {FONT_SIZES.map((size) => {
                return (
                  <SelectItem key={size.value} value={size.value}>
                    <span style={{ fontSize: size.value }}>{size.label}</span>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant='ghost'
                size='icon'
                className='h-8 w-8 hover:bg-muted/50'
                title='Text Color'
              >
                <MdFormatColorText size={18} className='text-gray-600' />
              </Button>
            </PopoverTrigger>
            <PopoverContent className='w-48 p-2'>
              <div className='grid grid-cols-6 gap-1'>
                {COLORS.map((color) => {
                  return (
                    <button
                      key={color}
                      className='w-6 h-6 rounded-full border border-gray-200 hover:scale-110 transition-transform'
                      style={{ backgroundColor: color }}
                      onClick={() => {
                        return onTextColor(color);
                      }}
                    />
                  );
                })}
              </div>
            </PopoverContent>
          </Popover>

          <div className='w-px h-6 bg-gray-200 mx-1' />

          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 hover:bg-muted/50'
            title='Bold'
            onClick={onBold}
          >
            <MdFormatBold size={18} className='text-gray-600' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 hover:bg-muted/50'
            title='Italic'
            onClick={onItalic}
          >
            <MdFormatItalic size={18} className='text-gray-600' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 hover:bg-muted/50'
            title='Underline'
            onClick={onUnderline}
          >
            <MdFormatUnderlined size={18} className='text-gray-600' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 hover:bg-muted/50'
            title='Bullet List'
            onClick={onList}
          >
            <MdFormatListBulleted size={18} className='text-gray-600' />
          </Button>
          <Button
            variant='ghost'
            size='icon'
            className='h-8 w-8 hover:bg-muted/50'
            title='Insert Link'
            onClick={onLink}
          >
            <MdLink size={18} className='text-gray-600' />
          </Button>
          {onImage && (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 hover:bg-muted/50'
              title='Insert Image'
              onClick={onImage}
            >
              <MdImage size={18} className='text-gray-600' />
            </Button>
          )}
          {onQuote && (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 hover:bg-muted/50'
              title='Insert Quote'
              onClick={onQuote}
            >
              <MdFormatQuote size={18} className='text-gray-600' />
            </Button>
          )}
          {onEmoji && (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 hover:bg-muted/50'
              title='Insert Emoji'
              onClick={onEmoji}
            >
              <MdInsertEmoticon size={18} className='text-gray-600' />
            </Button>
          )}
          {onAttach && (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 hover:bg-muted/50'
              title='Attach File'
              onClick={onAttach}
            >
              <MdAttachFile size={18} className='text-gray-600' />
            </Button>
          )}
          {onDelete && (
            <Button
              variant='ghost'
              size='icon'
              className='h-8 w-8 hover:bg-muted/50'
              title='Delete'
              onClick={onDelete}
            >
              <MdDelete size={18} className='text-gray-600' />
            </Button>
          )}
        </div>

        {/* Right side: send button */}
        {onSend && (
          <Button
            variant='default'
            className='gap-2 bg-blue-600 hover:bg-blue-700 text-white'
            onClick={onSend}
          >
            Send <MdSend size={18} />
          </Button>
        )}
      </div>
    </div>
  );
}
