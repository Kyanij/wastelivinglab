import { format, formatDistanceToNow, isToday, isYesterday } from 'date-fns';
import { enUS, id } from 'date-fns/locale';

const locales = {
  en: enUS,
  id: id,
};

export const getLocale = () => {
  const savedLang = localStorage.getItem('gc_lang') || 'en';
  return locales[savedLang] || enUS;
};

export const formatDate = (date, formatStr = 'MMM dd, yyyy') => {
  if (!date) return '-';
  const d = date?.toDate ? date.toDate() : new Date(date);
  const locale = getLocale();
  return format(d, formatStr, { locale });
};

export const formatDateLong = (date) => {
  return formatDate(date, 'MMMM dd, yyyy');
};

export const formatDateShort = (date) => {
  return formatDate(date, 'MMM dd, yyyy');
};

export const formatDateTime = (date) => {
  return formatDate(date, 'MMM d, h:mm a');
};

export const formatDateForInput = (date) => {
  if (!date) return '';
  const d = date?.toDate ? date.toDate() : new Date(date);
  return format(d, 'yyyy-MM-dd');
};

export const formatRelativeDate = (date) => {
  if (!date) return '-';
  const d = date?.toDate ? date.toDate() : new Date(date);
  const locale = getLocale();
  
  if (isToday(d)) {
    return format(d, 'h:mm a', { locale });
  }
  
  if (isYesterday(d)) {
    return locale === id ? 'Kemarin' : 'Yesterday';
  }
  
  return formatDistanceToNow(d, { addSuffix: true, locale });
};