import { forwardRef, useEffect, useImperativeHandle, useState } from 'react';
import './MentionList.css';

interface MentionListProps {
  items: string[];
  command: (item: { id: string }) => void;
}

interface MentionListRef {
  onKeyDown: (props: { event: KeyboardEvent }) => boolean;
}

const MentionList = forwardRef<MentionListRef, MentionListProps>((props, ref) => {
  const [selectedIndex, setSelectedIndex] = useState(0);

  const selectItem = (index: number) => {
    const item = props.items[index];
    if (item) {
      props.command({ id: item });
    }
  };

  const upHandler = () => {
    setSelectedIndex((selectedIndex + props.items.length - 1) % props.items.length);
  };

  const downHandler = () => {
    setSelectedIndex((selectedIndex + 1) % props.items.length);
  };

  const enterHandler = () => {
    selectItem(selectedIndex);
  };

  useEffect(() => {
    return setSelectedIndex(0);
  }, [props.items]);

  useImperativeHandle(ref, () => {
    return {
      onKeyDown: ({ event }: { event: KeyboardEvent }) => {
        if (event.key === 'ArrowUp') {
          upHandler();
          return true;
        }

        if (event.key === 'ArrowDown') {
          downHandler();
          return true;
        }

        if (event.key === 'Enter') {
          enterHandler();
          return true;
        }

        return false;
      },
    };
  });

  return (
    <div className='mention-dropdown'>
      {props.items.length ? (
        props.items.map((item, index) => {
          return (
            <button
              className={`mention-item ${index === selectedIndex ? 'is-selected' : ''}`}
              key={index}
              onClick={() => {
                return selectItem(index);
              }}
            >
              {item}
            </button>
          );
        })
      ) : (
        <div className='mention-item'>No result</div>
      )}
    </div>
  );
});

MentionList.displayName = 'MentionList';

export default MentionList;
