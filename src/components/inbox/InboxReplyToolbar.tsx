import { Button } from '@/components/ui/button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Separator } from '@/components/ui/separator';
import { FaFont } from 'react-icons/fa';
import { IoMdColorPalette } from 'react-icons/io';
import {
  MdArrowDropDown,
  MdAttachFile,
  MdCode,
  MdDelete,
  MdEmojiEmotions,
  MdFlashOn,
  MdFormatBold,
  MdFormatItalic,
  MdFormatListBulleted,
  MdFormatQuote,
  MdFormatUnderlined,
  MdGif,
  MdImage,
  MdInsertDriveFile,
  MdLink,
  MdStrikethroughS,
} from 'react-icons/md';

export function InboxReplyToolbar() {
  return (
    <div className='sticky bottom-0 z-10 bg-background border-t p-3 shadow-sm'>
      {/* Top row: font and formatting controls */}
      <div className='flex items-center gap-2 w-full mb-2'>
        {/* Font family dropdown */}
        <Select defaultValue='sans-serif'>
          <SelectTrigger className='w-[120px]'>
            <FaFont className='mr-2 text-muted-foreground' size={16} />
            <SelectValue placeholder='Font' />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='sans-serif'>Sans-Serif</SelectItem>
            <SelectItem value='serif'>Serif</SelectItem>
            <SelectItem value='monospace'>Mono</SelectItem>
          </SelectContent>
        </Select>

        {/* Font size dropdown */}
        <Select defaultValue='14'>
          <SelectTrigger className='w-[80px]'>
            <span className='mr-2 text-muted-foreground text-sm'>14</span>
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='12'>12</SelectItem>
            <SelectItem value='14'>14</SelectItem>
            <SelectItem value='16'>16</SelectItem>
            <SelectItem value='18'>18</SelectItem>
            <SelectItem value='20'>20</SelectItem>
            <SelectItem value='24'>24</SelectItem>
          </SelectContent>
        </Select>

        {/* Text color dropdown */}
        <Select defaultValue='#000000'>
          <SelectTrigger className='w-[100px]'>
            <MdFormatUnderlined className='mr-2 text-muted-foreground' size={16} />
            <IoMdColorPalette className='mr-1 text-muted-foreground' size={16} />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='#000000'>Black</SelectItem>
            <SelectItem value='#ff0000'>Red</SelectItem>
            <SelectItem value='#008000'>Green</SelectItem>
            <SelectItem value='#0000ff'>Blue</SelectItem>
          </SelectContent>
        </Select>

        {/* Highlight color dropdown */}
        <Select defaultValue='#ffff00'>
          <SelectTrigger className='w-[100px]'>
            <span className='w-3 h-3 rounded bg-yellow-200 border border-border mr-1' />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value='#ffff00'>Yellow</SelectItem>
            <SelectItem value='#ffb300'>Orange</SelectItem>
            <SelectItem value='#00ff00'>Green</SelectItem>
            <SelectItem value='#00ffff'>Cyan</SelectItem>
          </SelectContent>
        </Select>

        <Separator orientation='vertical' className='h-6' />

        {/* Formatting icons */}
        <div className='flex items-center gap-1'>
          <Button variant='ghost' size='icon' title='Bold'>
            <MdFormatBold size={18} className='text-muted-foreground' />
          </Button>
          <Button variant='ghost' size='icon' title='Italic'>
            <MdFormatItalic size={18} className='text-muted-foreground' />
          </Button>
          <Button variant='ghost' size='icon' title='Underline'>
            <MdFormatUnderlined size={18} className='text-muted-foreground' />
          </Button>
          <Button variant='ghost' size='icon' title='Strikethrough'>
            <MdStrikethroughS size={18} className='text-muted-foreground' />
          </Button>
          <Button variant='ghost' size='icon' title='Bullet List'>
            <MdFormatListBulleted size={18} className='text-muted-foreground' />
          </Button>
          <Button variant='ghost' size='icon' title='Insert Link'>
            <MdLink size={18} className='text-muted-foreground' />
          </Button>
          <Button variant='ghost' size='icon' title='Insert Image'>
            <MdImage size={18} className='text-muted-foreground' />
          </Button>
          <Button variant='ghost' size='icon' title='Insert Quote'>
            <MdFormatQuote size={18} className='text-muted-foreground' />
          </Button>
          <Button variant='ghost' size='icon' title='Insert Code'>
            <MdCode size={18} className='text-muted-foreground' />
          </Button>
        </div>
      </div>

      {/* Bottom row: media/action icons left, send button right */}
      <div className='flex items-center w-full'>
        <div className='flex items-center gap-1'>
          <Button variant='ghost' size='icon' title='Insert Emoji'>
            <MdEmojiEmotions size={18} className='text-muted-foreground' />
          </Button>
          <Button variant='ghost' size='icon' title='Insert GIF'>
            <MdGif size={18} className='text-muted-foreground' />
          </Button>
          <Button variant='ghost' size='icon' title='Attach File'>
            <MdAttachFile size={18} className='text-muted-foreground' />
          </Button>
          <Button variant='ghost' size='icon' title='Quick Reply'>
            <MdFlashOn size={18} className='text-muted-foreground' />
          </Button>
          <Button variant='ghost' size='icon' title='Insert File'>
            <MdInsertDriveFile size={18} className='text-muted-foreground' />
          </Button>
          <Button variant='ghost' size='icon' title='Delete'>
            <MdDelete size={18} className='text-muted-foreground' />
          </Button>
        </div>
        <div className='flex-1' />
        <Button className='gap-2'>
          Send & archive <MdArrowDropDown size={18} />
        </Button>
      </div>
    </div>
  );
}
