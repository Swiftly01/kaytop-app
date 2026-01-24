import dayjs from 'dayjs';

export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = dayjs(date);
    
    if (!dateObj.isValid()) {
      return 'Invalid Date';
    }
    
    return dateObj.format('MMM DD, YYYY');
  } catch {
    return 'Invalid Date';
  }
}

export function formatDateTime(date: string | Date | null | undefined): string {
  if (!date) return 'N/A';
  
  try {
    const dateObj = dayjs(date);
    
    if (!dateObj.isValid()) {
      return 'Invalid Date';
    }
    
    return dateObj.format('MMM DD, YYYY h:mm A');
  } catch {
    return 'Invalid Date';
  }
}