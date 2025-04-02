import * as LuIcons from 'react-icons/lu';

// Create a map of all Lucide icons
const iconMap = Object.fromEntries(
  Object.entries(LuIcons).filter(([key]) => {
    // Filter out non-icon exports
    return key !== 'default' && typeof LuIcons[key as keyof typeof LuIcons] === 'function';
  }),
);

// Create a sorted list of icon names
const iconList = Object.keys(iconMap).sort();

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

export { iconList, iconMap };
