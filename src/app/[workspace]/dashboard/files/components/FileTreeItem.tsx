import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { type FileItem } from '@/hooks/useFileManager';
import { cn } from '@/lib/utils';
import { ChevronRight, Copy, Download, MoreVertical, Trash2 } from 'lucide-react';
import { getFileIcon } from '../utils/fileIcons';

interface FileTreeItemProps {
  item: FileItem;
  level?: number;
  expandedFolders: string[];
  onToggleFolder: (name: string) => void;
  onNavigateToFolder: (name: string) => void;
  onDelete?: (id: string) => void;
  onDuplicate?: (id: string) => void;
  onDownload?: (id: string) => void;
  currentPath: string[];
}

export const FileTreeItem = ({
  item,
  level = 0,
  expandedFolders,
  onToggleFolder,
  onNavigateToFolder,
  onDelete,
  onDuplicate,
  onDownload,
  currentPath,
}: FileTreeItemProps) => {
  const isExpanded = expandedFolders.includes(item.name);
  const hasChildren = item.children && item.children.length > 0;
  const isSelected = currentPath.includes(item.name);

  return (
    <div>
      <div
        className={cn(
          'flex items-center px-2 py-1.5 rounded-md text-sm group',
          'hover:bg-[#e5e5e7] dark:hover:bg-[#2c2c2e] transition-colors',
          'text-foreground',
          isSelected && 'bg-[#e5e5e7] dark:bg-[#2c2c2e]',
        )}
        style={{ paddingLeft: `${level * 12 + 8}px` }}
      >
        {hasChildren && (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleFolder(item.name);
            }}
            className='p-0.5 hover:bg-[#d1d1d6] dark:hover:bg-[#3a3a3c] rounded-sm transition-colors'
          >
            <ChevronRight
              className={cn('h-4 w-4 transition-transform', isExpanded ? 'rotate-90' : '')}
            />
          </button>
        )}
        <button
          onClick={() => {
            return onNavigateToFolder(item.name);
          }}
          className={cn(
            'flex items-center gap-2 flex-1 min-w-0 text-left',
            'hover:bg-[#e5e5e7] dark:hover:bg-[#2c2c2e] transition-colors',
            'rounded-md px-1 py-0.5',
            item.type !== 'folder' && (level === 0 ? 'pl-6' : 'pl-3'),
          )}
        >
          <div className='w-5 h-5 flex items-center justify-center'>
            {getFileIcon(item.type, item.fileDetails?.contentType)}
          </div>
          <span className='truncate w-[calc(256px-4rem)] text-left' title={item.name}>
            {item.name}
          </span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger
            asChild
            onClick={(e) => {
              return e.stopPropagation();
            }}
          >
            <button className='p-1 hover:bg-[#d1d1d6] dark:hover:bg-[#3a3a3c] rounded-sm transition-colors opacity-0 group-hover:opacity-100'>
              <MoreVertical className='h-4 w-4 text-muted-foreground' />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align='end'>
            {item.type !== 'folder' && (
              <DropdownMenuItem
                onClick={() => {
                  return onDownload?.(item._id);
                }}
              >
                <Download className='h-4 w-4 mr-2' />
                Download
              </DropdownMenuItem>
            )}
            <DropdownMenuItem
              onClick={() => {
                return onDuplicate?.(item._id);
              }}
            >
              <Copy className='h-4 w-4 mr-2' />
              Duplicate
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={() => {
                return onDelete?.(item._id);
              }}
              className='text-red-600 dark:text-red-400'
            >
              <Trash2 className='h-4 w-4 mr-2' />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {hasChildren && isExpanded && (
        <div className='pl-2'>
          {item.children.map((child, index) => {
            return (
              <FileTreeItem
                key={index}
                item={child}
                level={level + 1}
                expandedFolders={expandedFolders}
                onToggleFolder={onToggleFolder}
                onNavigateToFolder={onNavigateToFolder}
                onDelete={onDelete}
                onDuplicate={onDuplicate}
                onDownload={onDownload}
                currentPath={currentPath}
              />
            );
          })}
        </div>
      )}
    </div>
  );
};
