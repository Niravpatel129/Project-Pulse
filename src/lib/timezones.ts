export type Timezone = {
  value: string;
  label: string;
  region: string;
  offset: string;
};

export const timezones: Timezone[] = [
  // North America
  {
    value: 'America/New_York',
    label: 'Eastern Time',
    region: 'North America',
    offset: 'UTC-04:00',
  },
  { value: 'America/Chicago', label: 'Central Time', region: 'North America', offset: 'UTC-05:00' },
  { value: 'America/Denver', label: 'Mountain Time', region: 'North America', offset: 'UTC-06:00' },
  {
    value: 'America/Los_Angeles',
    label: 'Pacific Time',
    region: 'North America',
    offset: 'UTC-07:00',
  },
  {
    value: 'America/Anchorage',
    label: 'Alaska Time',
    region: 'North America',
    offset: 'UTC-08:00',
  },
  {
    value: 'America/Halifax',
    label: 'Atlantic Time',
    region: 'North America',
    offset: 'UTC-03:00',
  },
  {
    value: 'America/Toronto',
    label: 'Eastern Time - Toronto',
    region: 'North America',
    offset: 'UTC-04:00',
  },
  {
    value: 'America/Vancouver',
    label: 'Pacific Time - Vancouver',
    region: 'North America',
    offset: 'UTC-07:00',
  },

  // Europe
  { value: 'Europe/London', label: 'UK Time', region: 'Europe', offset: 'UTC+01:00' },
  { value: 'Europe/Paris', label: 'Central European Time', region: 'Europe', offset: 'UTC+02:00' },
  { value: 'Europe/Berlin', label: 'Berlin Time', region: 'Europe', offset: 'UTC+02:00' },
  { value: 'Europe/Moscow', label: 'Moscow Time', region: 'Europe', offset: 'UTC+03:00' },
  { value: 'Europe/Istanbul', label: 'Turkey Time', region: 'Europe', offset: 'UTC+03:00' },

  // Asia
  { value: 'Asia/Dubai', label: 'Gulf Time', region: 'Asia', offset: 'UTC+04:00' },
  { value: 'Asia/Shanghai', label: 'China Time', region: 'Asia', offset: 'UTC+08:00' },
  { value: 'Asia/Tokyo', label: 'Japan Time', region: 'Asia', offset: 'UTC+09:00' },
  { value: 'Asia/Singapore', label: 'Singapore Time', region: 'Asia', offset: 'UTC+08:00' },
  { value: 'Asia/Seoul', label: 'Korea Time', region: 'Asia', offset: 'UTC+09:00' },

  // Australia & Pacific
  {
    value: 'Australia/Sydney',
    label: 'Sydney Time',
    region: 'Australia & Pacific',
    offset: 'UTC+10:00',
  },
  {
    value: 'Australia/Melbourne',
    label: 'Melbourne Time',
    region: 'Australia & Pacific',
    offset: 'UTC+10:00',
  },
  {
    value: 'Pacific/Auckland',
    label: 'New Zealand Time',
    region: 'Australia & Pacific',
    offset: 'UTC+12:00',
  },

  // South America
  {
    value: 'America/Sao_Paulo',
    label: 'Brazil Time',
    region: 'South America',
    offset: 'UTC-03:00',
  },
  {
    value: 'America/Buenos_Aires',
    label: 'Argentina Time',
    region: 'South America',
    offset: 'UTC-03:00',
  },

  // India
  { value: 'Asia/Kolkata', label: 'India Time', region: 'Asia', offset: 'UTC+05:30' },
];

export const regions = [
  ...new Set(
    timezones.map((tz) => {
      return tz.region;
    }),
  ),
];
