import { IconType } from 'react-icons';
import * as LuIcons from 'react-icons/lu';

export const iconOptions = [
  { icon: 'AlertCircle', name: 'Alert Circle' },
  { icon: 'Bell', name: 'Bell' },
  { icon: 'Calendar', name: 'Calendar' },
  { icon: 'Clock', name: 'Clock' },
  { icon: 'FileText', name: 'File' },
  { icon: 'Heart', name: 'Heart' },
  { icon: 'Mail', name: 'Mail' },
  { icon: 'MapPin', name: 'Map Pin' },
  { icon: 'Star', name: 'Star' },
  { icon: 'Tag', name: 'Tag' },
  { icon: 'Box', name: 'Box' },
  { icon: 'Users', name: 'Users' },
];

export const defaultPropertyTypes = [
  { id: 'text', name: 'Text', iconName: 'LuCaseSensitive' },
  { id: 'number', name: 'Number', iconName: 'LuHash' },
  { id: 'date', name: 'Date', iconName: 'LuCalendar' },
  { id: 'checkbox', name: 'Checkbox', iconName: 'LuCheck' },
  { id: 'select', name: 'Select', iconName: 'LuChevronDown' },
  { id: 'multiselect', name: 'Multi-select', iconName: 'LuCheckCheck' },
  { id: 'url', name: 'URL', iconName: 'LuLink' },
  { id: 'email', name: 'Email', iconName: 'LuMail' },
  { id: 'phone', name: 'Phone', iconName: 'LuPhone' },
  { id: 'file', name: 'File', iconName: 'LuFile' },
];

export function useDatabaseIcons() {
  const getIconComponent = (iconName: string): IconType => {
    return LuIcons[iconName as keyof typeof LuIcons] || LuIcons.LuSmile;
  };

  return {
    getIconComponent,
    iconOptions,
    defaultPropertyTypes,
  };
}
