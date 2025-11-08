import { format, formatDistance as formatDistanceFns, parseISO } from 'date-fns';

/**
 * Format date for display
 */
export const formatDate = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd-MM-yyyy');
};

/**
 * Format time for display
 */
export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'hh:mm a');
};

/**
 * Format date and time for display
 */
export const formatDateTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return format(dateObj, 'dd-MM-yyyy hh:mm a');
};

/**
 * Get relative time (e.g., "2 hours ago")
 */
export const getRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? parseISO(date) : date;
  return formatDistanceFns(dateObj, new Date(), { addSuffix: true });
};

/**
 * Format schedule string (e.g., "weekly 07:30 PM - 11:30 PM")
 */
export const formatSchedule = (
  frequency: string,
  startTime: string,
  endTime: string
): string => {
  return `${frequency} ${startTime} - ${endTime}`;
};
