import { useLanguage } from '../../context/LanguageContext';

export default function LanguageSwitcher({ className = '' }) {
  const { lang, setLang } = useLanguage();

  return (
    <button
      onClick={() => setLang(lang === 'en' ? 'he' : 'en')}
      className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm font-medium border transition-colors ${className}`}
      aria-label={lang === 'en' ? 'Switch to Hebrew' : 'החלף לאנגלית'}
      title={lang === 'en' ? 'Switch to Hebrew / עברית' : 'Switch to English'}
    >
      <span className="text-base leading-none">{lang === 'en' ? '🇮🇱' : '🇬🇧'}</span>
      <span>{lang === 'en' ? 'עברית' : 'English'}</span>
    </button>
  );
}
