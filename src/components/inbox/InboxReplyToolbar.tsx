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
    <div className='sticky bottom-0 z-10 bg-white border-t pt-3 pb-3 px-3 shadow-sm'>
      {/* Top row: font and formatting controls */}
      <div className='flex items-center gap-2 w-full mb-2'>
        {/* Font family dropdown */}
        <div className='flex items-center bg-gray-50 hover:bg-gray-100 rounded-full px-3 py-1.5 transition-colors duration-200'>
          <FaFont className='mr-2 text-gray-600' size={16} />
          <select
            className='bg-transparent outline-none border-none text-sm font-medium appearance-none pr-3 cursor-pointer'
            style={{ minWidth: 80 }}
            title='Font Family'
          >
            <option value='sans-serif'>Sans-Serif</option>
            <option value='serif'>Serif</option>
            <option value='monospace'>Mono</option>
          </select>
          <MdArrowDropDown className='ml-[-14px] text-gray-600' size={18} />
        </div>
        {/* Font size dropdown */}
        <div className='flex items-center bg-gray-50 hover:bg-gray-100 rounded-full px-3 py-1.5 transition-colors duration-200'>
          <span className='mr-2 text-gray-600 text-sm'>14</span>
          <select
            className='bg-transparent outline-none border-none text-sm font-medium appearance-none pr-3 cursor-pointer'
            style={{ width: 32 }}
            title='Font Size'
          >
            <option value='12'>12</option>
            <option value='14'>14</option>
            <option value='16'>16</option>
            <option value='18'>18</option>
            <option value='20'>20</option>
            <option value='24'>24</option>
          </select>
          <MdArrowDropDown className='ml-[-14px] text-gray-600' size={18} />
        </div>
        {/* Text color dropdown */}
        <div className='flex items-center bg-gray-50 hover:bg-gray-100 rounded-full px-3 py-1.5 transition-colors duration-200'>
          <MdFormatUnderlined className='mr-2 text-gray-600' size={16} />
          <IoMdColorPalette className='mr-1 text-gray-600' size={16} />
          <select
            className='bg-transparent outline-none border-none text-sm font-medium appearance-none pr-3 cursor-pointer'
            style={{ width: 28 }}
            title='Text Color'
          >
            <option value='#000000'>A</option>
            <option value='#ff0000'>A</option>
            <option value='#008000'>A</option>
            <option value='#0000ff'>A</option>
          </select>
          <MdArrowDropDown className='ml-[-14px] text-gray-600' size={18} />
        </div>
        {/* Highlight color dropdown */}
        <div className='flex items-center bg-gray-50 hover:bg-gray-100 rounded-full px-3 py-1.5 transition-colors duration-200'>
          <MdFormatUnderlined className='mr-2 text-gray-600' size={16} />
          <span className='w-3 h-3 rounded bg-yellow-200 border border-gray-300 mr-1' />
          <select
            className='bg-transparent outline-none border-none text-sm font-medium appearance-none pr-3 cursor-pointer'
            style={{ width: 28 }}
            title='Highlight Color'
          >
            <option value='#ffff00'>A</option>
            <option value='#ffb300'>A</option>
            <option value='#00ff00'>A</option>
            <option value='#00ffff'>A</option>
          </select>
          <MdArrowDropDown className='ml-[-14px] text-gray-600' size={18} />
        </div>
        {/* Formatting icons */}
        <div className='flex items-center gap-1 ml-1'>
          <button
            type='button'
            className='bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full p-1.5 transition-colors duration-200'
            title='Bold'
          >
            <MdFormatBold size={18} className='text-gray-600' />
          </button>
          <button
            type='button'
            className='bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full p-1.5 transition-colors duration-200'
            title='Italic'
          >
            <MdFormatItalic size={18} className='text-gray-600' />
          </button>
          <button
            type='button'
            className='bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full p-1.5 transition-colors duration-200'
            title='Underline'
          >
            <MdFormatUnderlined size={18} className='text-gray-600' />
          </button>
          <button
            type='button'
            className='bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full p-1.5 transition-colors duration-200'
            title='Strikethrough'
          >
            <MdStrikethroughS size={18} className='text-gray-600' />
          </button>
          <button
            type='button'
            className='bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full p-1.5 transition-colors duration-200'
            title='Bullet List'
          >
            <MdFormatListBulleted size={18} className='text-gray-600' />
          </button>
          <button
            type='button'
            className='bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full p-1.5 transition-colors duration-200'
            title='Insert Link'
          >
            <MdLink size={18} className='text-gray-600' />
          </button>
          <button
            type='button'
            className='bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full p-1.5 transition-colors duration-200'
            title='Insert Image'
          >
            <MdImage size={18} className='text-gray-600' />
          </button>
          <button
            type='button'
            className='bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full p-1.5 transition-colors duration-200'
            title='Insert Quote'
          >
            <MdFormatQuote size={18} className='text-gray-600' />
          </button>
          <button
            type='button'
            className='bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full p-1.5 transition-colors duration-200'
            title='Insert Code'
          >
            <MdCode size={18} className='text-gray-600' />
          </button>
        </div>
      </div>
      {/* Bottom row: media/action icons left, send button right */}
      <div className='flex items-center w-full'>
        <div className='flex items-center gap-1'>
          <button
            type='button'
            className='bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full p-1.5 transition-colors duration-200'
            title='Insert Emoji'
          >
            <MdEmojiEmotions size={18} className='text-gray-600' />
          </button>
          <button
            type='button'
            className='bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full p-1.5 transition-colors duration-200'
            title='Insert GIF'
          >
            <MdGif size={18} className='text-gray-600' />
          </button>
          <button
            type='button'
            className='bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full p-1.5 transition-colors duration-200'
            title='Attach File'
          >
            <MdAttachFile size={18} className='text-gray-600' />
          </button>
          <button
            type='button'
            className='bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full p-1.5 transition-colors duration-200'
            title='Quick Reply'
          >
            <MdFlashOn size={18} className='text-gray-600' />
          </button>
          <button
            type='button'
            className='bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full p-1.5 transition-colors duration-200'
            title='Insert File'
          >
            <MdInsertDriveFile size={18} className='text-gray-600' />
          </button>
          <button
            type='button'
            className='bg-gray-50 hover:bg-gray-100 active:bg-gray-200 rounded-full p-1.5 transition-colors duration-200'
            title='Delete'
          >
            <MdDelete size={18} className='text-gray-600' />
          </button>
        </div>
        <div className='flex-1' />
        <button className='bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-semibold px-6 py-2 rounded-full shadow-sm hover:shadow transition-all duration-200 flex items-center gap-2 text-sm'>
          Send & archive <MdArrowDropDown size={18} />
        </button>
      </div>
    </div>
  );
}
