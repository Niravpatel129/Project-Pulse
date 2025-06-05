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
    <div className='sticky bottom-0 z-10 bg-white border-t pt-2 pb-2 px-2'>
      {/* Top row: font and formatting controls */}
      <div className='flex items-center gap-1 w-full mb-1'>
        {/* Font family dropdown */}
        <div className='flex items-center bg-gray-100 rounded-full px-2 py-1 mr-0.5'>
          <FaFont className='mr-1 text-gray-500' size={16} />
          <select
            className='bg-transparent outline-none border-none text-xs font-medium appearance-none pr-3'
            style={{ minWidth: 60 }}
          >
            <option value='sans-serif'>Sans-Serif</option>
            <option value='serif'>Serif</option>
            <option value='monospace'>Mono</option>
          </select>
          <MdArrowDropDown className='ml-[-14px] text-gray-500' size={18} />
        </div>
        {/* Font size dropdown */}
        <div className='flex items-center bg-gray-100 rounded-full px-2 py-1 mr-0.5'>
          <span className='mr-1 text-gray-500 text-xs'>14</span>
          <select
            className='bg-transparent outline-none border-none text-xs font-medium appearance-none pr-3'
            style={{ width: 28 }}
          >
            <option value='12'>12</option>
            <option value='14'>14</option>
            <option value='16'>16</option>
            <option value='18'>18</option>
            <option value='20'>20</option>
            <option value='24'>24</option>
          </select>
          <MdArrowDropDown className='ml-[-14px] text-gray-500' size={18} />
        </div>
        {/* Text color dropdown */}
        <div className='flex items-center bg-gray-100 rounded-full px-2 py-1 mr-0.5'>
          <MdFormatUnderlined className='mr-1 text-gray-500' size={16} />
          <IoMdColorPalette className='mr-0.5 text-gray-500' size={16} />
          <select
            className='bg-transparent outline-none border-none text-xs font-medium appearance-none pr-3'
            style={{ width: 24 }}
          >
            <option value='#000000'>A</option>
            <option value='#ff0000'>A</option>
            <option value='#008000'>A</option>
            <option value='#0000ff'>A</option>
          </select>
          <MdArrowDropDown className='ml-[-14px] text-gray-500' size={18} />
        </div>
        {/* Highlight color dropdown */}
        <div className='flex items-center bg-gray-100 rounded-full px-2 py-1 mr-0.5'>
          <MdFormatUnderlined className='mr-1 text-gray-500' size={16} />
          <span className='w-3 h-3 rounded bg-yellow-200 border border-gray-300 mr-0.5' />
          <select
            className='bg-transparent outline-none border-none text-xs font-medium appearance-none pr-3'
            style={{ width: 24 }}
          >
            <option value='#ffff00'>A</option>
            <option value='#ffb300'>A</option>
            <option value='#00ff00'>A</option>
            <option value='#00ffff'>A</option>
          </select>
          <MdArrowDropDown className='ml-[-14px] text-gray-500' size={18} />
        </div>
        {/* Formatting icons */}
        <div className='flex items-center gap-0.5 ml-0.5'>
          <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
            <MdFormatBold size={16} />
          </button>
          <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
            <MdFormatItalic size={16} />
          </button>
          <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
            <MdFormatUnderlined size={16} />
          </button>
          <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
            <MdStrikethroughS size={16} />
          </button>
          <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
            <MdFormatListBulleted size={16} />
          </button>
          <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
            <MdLink size={16} />
          </button>
          <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
            <MdImage size={16} />
          </button>
          <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
            <MdFormatQuote size={16} />
          </button>
          <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
            <MdCode size={16} />
          </button>
        </div>
      </div>
      {/* Bottom row: media/action icons left, send button right */}
      <div className='flex items-center w-full'>
        <div className='flex items-center gap-0.5'>
          <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
            <MdEmojiEmotions size={16} />
          </button>
          <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
            <MdGif size={16} />
          </button>
          <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
            <MdAttachFile size={16} />
          </button>
          <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
            <MdFlashOn size={16} />
          </button>
          <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
            <MdInsertDriveFile size={16} />
          </button>
          <button type='button' className='bg-gray-100 rounded-full p-1 mr-0.5'>
            <MdDelete size={16} />
          </button>
        </div>
        <div className='flex-1' />
        <button className='bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-1.5 rounded-full shadow flex items-center gap-1 text-sm'>
          Send & archive <MdArrowDropDown size={18} />
        </button>
      </div>
    </div>
  );
}
