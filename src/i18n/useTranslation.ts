import useExpenseStore from '../context/useExpenseStore';
import { translations, Language } from './translations';

export const useTranslation = () => {
    const language = useExpenseStore((state) => state.language);
    return (key: string): string => {
        return translations[language]?.[key] || translations['id']?.[key] || key;
    };
};

export const t = (language: Language, key: string): string => {
    return translations[language]?.[key] || translations['id']?.[key] || key;
};
