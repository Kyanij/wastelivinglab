import { useTranslation } from 'react-i18next';

export default function LanguageToggle() {
  const { i18n } = useTranslation();
  const current = i18n.language;

  const toggle = (lang) => {
    i18n.changeLanguage(lang);
    localStorage.setItem('gc_lang', lang);
  };

  return (
    <div className="flex items-center gap-1 bg-gray-100 rounded-full p-1">
      <button
        onClick={() => toggle('en')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all
          ${current === 'en' 
            ? 'bg-green-600 text-white shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'}`}
      >
        EN
      </button>
      <button
        onClick={() => toggle('id')}
        className={`px-3 py-1 rounded-full text-sm font-medium transition-all
          ${current === 'id' 
            ? 'bg-green-600 text-white shadow-sm' 
            : 'text-gray-500 hover:text-gray-700'}`}
      >
        ID
      </button>
    </div>
  );
}