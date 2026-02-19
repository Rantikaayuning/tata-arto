import { format } from 'date-fns';
import { id } from 'date-fns/locale';

export const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('id-ID', {
        style: 'currency',
        currency: 'IDR',
        minimumFractionDigits: 0,
    }).format(amount);
};

export const formatNumberWithDots = (value: string): string => {
    if (!value) return '';
    // Remove non-numeric characters first
    const cleanValue = value.replace(/\D/g, '');
    return cleanValue.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
};

export const parseNumberFromDots = (value: string): number => {
    if (!value) return 0;
    return parseInt(value.replace(/\./g, ''), 10);
};

export const formatDate = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'dd MMMM yyyy', { locale: id });
};

export const formatMonth = (dateString: string): string => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return format(date, 'MMMM yyyy', { locale: id });
};
