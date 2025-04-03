import * as LuIcons from 'react-icons/lu';
import { LuSmile } from 'react-icons/lu'; // Default fallback icon

// Create a map of all Lucide icons
const iconMap = Object.fromEntries(
  Object.entries(LuIcons)
    .filter(([key]) => {
      // Filter out non-icon exports
      return key !== 'default' && typeof LuIcons[key as keyof typeof LuIcons] === 'function';
    })
    .filter(([key]) => {
      // Filter out duplicate icons (some icons have both Lu prefix and without)
      return !key.startsWith('Lu') || !LuIcons[key.slice(2) as keyof typeof LuIcons];
    }),
);

// Create a sorted list of icon names
const iconList = Object.keys(iconMap).sort();

// Default fallback icon name
export const DEFAULT_ICON = 'LuSmile';

// Helper function to filter icons based on search query
export const filterIcons = (searchQuery: string) => {
  const query = searchQuery.toLowerCase();
  const filtered = iconList.filter((name) => {
    return name.toLowerCase().includes(query);
  });

  // If no search query, return all icons
  if (!query) {
    return {
      icons: iconList,
      total: iconList.length,
    };
  }

  return {
    icons: filtered,
    total: filtered.length,
  };
};

// Helper function to get an icon component with fallback
export const getIconWithFallback = (iconName: string) => {
  return iconMap[iconName] || iconMap[DEFAULT_ICON] || LuSmile;
};

export { iconList, iconMap };
