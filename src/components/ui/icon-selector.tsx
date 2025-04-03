import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { useDebounce } from '@/hooks/useDebounce';
import { filterIcons, iconMap } from '@/lib/icons';
import { Smile } from 'lucide-react';
import { memo, useCallback, useEffect, useMemo, useState } from 'react';
import { IconType } from 'react-icons';
import InfiniteScroll from 'react-infinite-scroll-component';

// Memoized Icon Component
const IconButton = memo(
  ({ name, onClick, value }: { name: string; onClick: () => void; value: string }) => {
    const Icon = iconMap[name];
    if (!Icon) return null;

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              variant='ghost'
              className='h-10 w-10 p-0 flex items-center justify-center hover:bg-accent'
              onClick={onClick}
            >
              <Icon className='h-4 w-4' />
            </Button>
          </TooltipTrigger>

          <TooltipContent>
            <p>{name}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  },
);
IconButton.displayName = 'IconButton';

interface IconSelectorProps {
  onSelect: (name: string) => void;
  trigger?: React.ReactNode;
  selectedIcon?: IconType;
}

export const IconSelector = memo(({ onSelect, trigger, selectedIcon }: IconSelectorProps) => {
  const [iconSearchQuery, setIconSearchQuery] = useState('');
  const debouncedSearch = useDebounce(iconSearchQuery, 150);

  // Use useMemo to prevent unnecessary recalculations
  const { icons: allIcons, total } = useMemo(() => {
    return filterIcons(debouncedSearch);
  }, [debouncedSearch]);

  const [displayedIcons, setDisplayedIcons] = useState<string[]>([]);

  // Reset displayed icons when search changes
  useEffect(() => {
    setDisplayedIcons(allIcons.slice(0, 64));
  }, [debouncedSearch, allIcons]);

  const handleIconSelect = useCallback(
    (name: string) => {
      onSelect(name);
    },
    [onSelect],
  );

  // Memoize the loadMore function to prevent recreating on each render
  const loadMore = useCallback(() => {
    const currentLength = displayedIcons.length;
    const nextIcons = allIcons.slice(currentLength, currentLength + 64);
    setDisplayedIcons((prev) => {
      return [...prev, ...nextIcons];
    });
  }, [displayedIcons.length, allIcons]);

  // Memoize the default trigger based on selected icon
  const defaultTrigger = useMemo(() => {
    let IconComponent: IconType = Smile;

    if (selectedIcon) {
      IconComponent = selectedIcon;
    }

    return (
      <Button variant='ghost' className='justify-start h-[80%] px-3'>
        <IconComponent className='text-muted-foreground' size={24} />
      </Button>
    );
  }, [selectedIcon]);

  // Memoize the input handler
  const handleInputChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    setIconSearchQuery(e.target.value);
  }, []);

  return (
    <Popover modal>
      <PopoverTrigger asChild>{trigger || defaultTrigger}</PopoverTrigger>
      <PopoverContent className='w-[400px] p-0' align='end' sideOffset={5}>
        <div className='p-4 border-b'>
          <Input
            placeholder='Search icons...'
            value={iconSearchQuery}
            onChange={handleInputChange}
            className='w-full'
          />
        </div>
        <InfiniteScroll
          dataLength={displayedIcons.length}
          next={loadMore}
          hasMore={displayedIcons.length < total}
          loader={
            <div className='p-4 text-center text-sm text-muted-foreground'>
              Loading more icons...
            </div>
          }
          height={300}
          scrollThreshold='90%'
        >
          <div className='grid grid-cols-8 gap-0 p-4'>
            {displayedIcons.map((name) => {
              return (
                <IconButton
                  key={name}
                  name={name}
                  value={name}
                  onClick={() => {
                    return handleIconSelect(name);
                  }}
                />
              );
            })}
          </div>
          <div className='p-4 text-center text-sm text-muted-foreground'>{total} icons found</div>
        </InfiniteScroll>
      </PopoverContent>
    </Popover>
  );
});

IconSelector.displayName = 'IconSelector';
