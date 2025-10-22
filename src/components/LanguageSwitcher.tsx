import React, { useState, useEffect } from 'react';
import { getCurrentLocale, setLocale, getAvailableLocales, t } from '../lib/i18n';

interface LanguageSwitcherProps {
  className?: string;
  showLabel?: boolean;
  onLocaleChange?: (locale: string) => void;
}

export const LanguageSwitcher: React.FC<LanguageSwitcherProps> = ({ 
  className = '', 
  showLabel = true,
  onLocaleChange
}) => {
  const [currentLocale, setCurrentLocale] = useState<string>('vi');
  const [isOpen, setIsOpen] = useState(false);
  const availableLocales = getAvailableLocales();

  useEffect(() => {
    getCurrentLocale().then(setCurrentLocale);

    // Listen for locale changes from other parts of the extension
    const handleMessage = (message: any) => {
      if (message.type === 'LOCALE_CHANGED') {
        setCurrentLocale(message.locale);
        // Trigger re-render in parent component
        if (onLocaleChange) {
          onLocaleChange(message.locale);
        }
      }
    };

    chrome.runtime.onMessage.addListener(handleMessage);
    return () => chrome.runtime.onMessage.removeListener(handleMessage);
  }, [onLocaleChange]);

  const handleLocaleChange = async (localeCode: string) => {
    await setLocale(localeCode as 'vi' | 'en');
    setCurrentLocale(localeCode);
    setIsOpen(false);
    // Trigger re-render in parent component
    if (onLocaleChange) {
      onLocaleChange(localeCode);
    }
  };

  const currentLocaleData = availableLocales.find(l => l.code === currentLocale) || availableLocales[0];

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 px-3 py-2 text-sm rounded hover:bg-gray-100 transition-colors"
        aria-label={showLabel ? undefined : t('btnLanguage')}
      >
        <svg 
          className="w-5 h-5 text-gray-600" 
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path 
            strokeLinecap="round" 
            strokeLinejoin="round" 
            strokeWidth={2} 
            d="M3 5h12M9 3v2m1.048 9.5A18.022 18.022 0 016.412 9m6.088 9h7M11 21l5-10 5 10M12.751 5C11.783 10.77 8.07 15.61 3 18.129" 
          />
        </svg>
        {showLabel && (
          <span className="text-gray-700">
            {currentLocaleData.nativeName}
          </span>
        )}
        <svg 
          className={`w-4 h-4 text-gray-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
          fill="none" 
          stroke="currentColor" 
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setIsOpen(false)}
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="py-1">
              {availableLocales.map((locale) => (
                <button
                  key={locale.code}
                  onClick={() => handleLocaleChange(locale.code)}
                  className={`w-full text-left px-4 py-2 text-sm hover:bg-gray-100 flex items-center justify-between ${
                    currentLocale === locale.code ? 'bg-blue-50 text-blue-700' : 'text-gray-700'
                  }`}
                >
                  <div>
                    <div className="font-medium">{locale.nativeName}</div>
                    <div className="text-xs text-gray-500">{locale.name}</div>
                  </div>
                  {currentLocale === locale.code && (
                    <svg 
                      className="w-5 h-5 text-blue-600" 
                      fill="currentColor" 
                      viewBox="0 0 20 20"
                    >
                      <path 
                        fillRule="evenodd" 
                        d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" 
                        clipRule="evenodd" 
                      />
                    </svg>
                  )}
                </button>
              ))}
            </div>
          </div>
        </>
      )}
    </div>
  );
};
