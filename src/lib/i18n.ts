/**
 * i18n Helper for Chrome Extension with Dynamic Language Switching
 * 
 * Chrome's chrome.i18n API doesn't support runtime language switching,
 * so we implement our own translation system with all strings embedded.
 */

const LOCALE_STORAGE_KEY = 'user_preferred_locale';

// Translation dictionary with all strings
const translations = {
  vi: {
    // Extension metadata
    extName: 'Select Care',
    extDescription: 'Tiện ích học ngôn ngữ thông minh - Lưu và học từ các đoạn văn bản bạn chọn',
    actionTitle: 'Select Care',
    
    // Buttons
    btnNote: 'Ghi Chú',
    btnLearn: 'Học',
    btnChat: 'Trò Chuyện',
    btnTranslate: 'Dịch',
    btnDictionary: 'Tra Từ',
    btnManage: 'Quản Lý',
    btnExport: 'Xuất',
    btnStats: 'Thống Kê',
    btnLanguage: 'Ngôn Ngữ',
    btnSave: 'Lưu',
    btnCancel: 'Hủy',
    btnClose: 'Đóng',
    
    // Placeholders
    placeholderNote: 'Thêm ghi chú của bạn...',
    placeholderTargetLang: 'Ngôn ngữ đích (ví dụ: Tiếng Việt, Tiếng Anh)',
    placeholderChat: 'Đặt câu hỏi về văn bản này...',
    
    // Labels
    labelSelectedText: 'Văn bản đã chọn:',
    labelTranslation: 'Bản dịch:',
    labelDefinition: 'Định nghĩa:',
    labelNote: 'Ghi chú:',
    
    // Messages
    msgSaving: 'Đang lưu...',
    msgSaved: 'Đã lưu thành công!',
    msgError: 'Đã xảy ra lỗi. Vui lòng thử lại.',
    msgNoSelection: 'Vui lòng chọn văn bản trước',
    msgTranslating: 'Đang dịch...',
    msgLoading: 'Đang tải...',
    
    // Dashboard
    dashboardTitle: 'Bảng Điều Khiển',
    dashboardMySelections: 'Các Lựa Chọn Của Tôi',
    dashboardSearch: 'Tìm kiếm...',
    dashboardNoItems: 'Chưa có mục nào. Bắt đầu chọn văn bản trên các trang web!',
    
    // Auth
    authRequired: 'Vui lòng đăng nhập để sử dụng tính năng này',
    authLogin: 'Đăng Nhập',
    authLogout: 'Đăng Xuất',
    
    // Settings
    settingsTitle: 'Cài Đặt',
    settingsLanguage: 'Ngôn ngữ',
    settingsTheme: 'Giao diện',
    
    // Errors
    errorNetwork: 'Lỗi kết nối mạng. Vui lòng kiểm tra kết nối internet.',
    errorAuth: 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.',
  },
  en: {
    // Extension metadata
    extName: 'Select Care',
    extDescription: 'Smart language learning tool - Save and learn from text you select',
    actionTitle: 'Select Care',
    
    // Buttons
    btnNote: 'Note',
    btnLearn: 'Learn',
    btnChat: 'Chat',
    btnTranslate: 'Translate',
    btnDictionary: 'Dictionary',
    btnManage: 'Manage',
    btnExport: 'Export',
    btnStats: 'Stats',
    btnLanguage: 'Language',
    btnSave: 'Save',
    btnCancel: 'Cancel',
    btnClose: 'Close',
    
    // Placeholders
    placeholderNote: 'Add your note...',
    placeholderTargetLang: 'Target language (e.g., English, Spanish)',
    placeholderChat: 'Ask a question about this text...',
    
    // Labels
    labelSelectedText: 'Selected text:',
    labelTranslation: 'Translation:',
    labelDefinition: 'Definition:',
    labelNote: 'Note:',
    
    // Messages
    msgSaving: 'Saving...',
    msgSaved: 'Saved successfully!',
    msgError: 'An error occurred. Please try again.',
    msgNoSelection: 'Please select text first',
    msgTranslating: 'Translating...',
    msgLoading: 'Loading...',
    
    // Dashboard
    dashboardTitle: 'Dashboard',
    dashboardMySelections: 'My Selections',
    dashboardSearch: 'Search...',
    dashboardNoItems: 'No items yet. Start selecting text on websites!',
    
    // Auth
    authRequired: 'Please login to use this feature',
    authLogin: 'Login',
    authLogout: 'Logout',
    
    // Settings
    settingsTitle: 'Settings',
    settingsLanguage: 'Language',
    settingsTheme: 'Theme',
    
    // Errors
    errorNetwork: 'Network error. Please check your internet connection.',
    errorAuth: 'Session expired. Please login again.',
  }
} as const;

type TranslationKey = keyof typeof translations.vi;
type Locale = keyof typeof translations;

let currentLocaleCache: Locale | null = null;

/**
 * Get the current effective locale
 * Priority: User preference > Browser locale > Default (vi)
 */
export async function getCurrentLocale(): Promise<Locale> {
  try {
    const result = await chrome.storage.local.get(LOCALE_STORAGE_KEY);
    if (result[LOCALE_STORAGE_KEY]) {
      currentLocaleCache = result[LOCALE_STORAGE_KEY] as Locale;
      return currentLocaleCache;
    }
    const browserLang = getUILanguage();
    currentLocaleCache = browserLang as Locale;
    return currentLocaleCache;
  } catch (error) {
    return 'vi';
  }
}

/**
 * Get current locale synchronously from cache
 */
export function getCurrentLocaleSyncFromCache(): Locale {
  return currentLocaleCache || 'vi';
}

/**
 * Set user's preferred locale
 */
export async function setLocale(locale: Locale): Promise<void> {
  currentLocaleCache = locale;
  await chrome.storage.local.set({ [LOCALE_STORAGE_KEY]: locale });
  // Notify all extension contexts to reload
  chrome.runtime.sendMessage({ type: 'LOCALE_CHANGED', locale }).catch(() => {
    // Ignore errors if no listeners
  });
}

/**
 * Get translated message for a given key
 * @param key - The translation key
 * @param localeOverride - Optional locale override
 * @returns Translated string
 */
export function t(key: TranslationKey, localeOverride?: Locale): string {
  const locale = localeOverride || currentLocaleCache || 'vi';
  return translations[locale][key] || translations.vi[key] || key;
}

/**
 * Get current UI locale (e.g., 'vi', 'en')
 */
export function getUILanguage(): string {
  if (typeof chrome !== 'undefined' && chrome.i18n) {
    const lang = chrome.i18n.getUILanguage();
    // Normalize to our supported locales
    if (lang.startsWith('vi')) return 'vi';
    if (lang.startsWith('en')) return 'en';
  }
  return 'vi'; // default
}

/**
 * Get available locales
 */
export function getAvailableLocales(): Array<{ code: Locale; name: string; nativeName: string }> {
  return [
    { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt' },
    { code: 'en', name: 'English', nativeName: 'English' }
  ];
}

/**
 * Initialize locale on module load
 */
if (typeof chrome !== 'undefined' && chrome.storage) {
  getCurrentLocale().then(locale => {
    currentLocaleCache = locale;
  });
}

/**
 * Common translation keys for convenience
 */
export const i18nKeys = {
  // Buttons
  btnNote: 'btnNote',
  btnLearn: 'btnLearn',
  btnChat: 'btnChat',
  btnTranslate: 'btnTranslate',
  btnDictionary: 'btnDictionary',
  btnSave: 'btnSave',
  btnCancel: 'btnCancel',
  btnClose: 'btnClose',
  
  // Labels
  labelSelectedText: 'labelSelectedText',
  labelTranslation: 'labelTranslation',
  labelDefinition: 'labelDefinition',
  labelNote: 'labelNote',
  
  // Messages
  msgSaving: 'msgSaving',
  msgSaved: 'msgSaved',
  msgError: 'msgError',
  msgNoSelection: 'msgNoSelection',
  msgTranslating: 'msgTranslating',
  msgLoading: 'msgLoading',
  
  // Dashboard
  dashboardTitle: 'dashboardTitle',
  dashboardMySelections: 'dashboardMySelections',
  dashboardSearch: 'dashboardSearch',
  dashboardNoItems: 'dashboardNoItems',
  
  // Auth
  authRequired: 'authRequired',
  authLogin: 'authLogin',
  authLogout: 'authLogout',
  
  // Placeholders
  placeholderNote: 'placeholderNote',
  placeholderTargetLang: 'placeholderTargetLang',
  placeholderChat: 'placeholderChat',
  
  // Errors
  errorNetwork: 'errorNetwork',
  errorAuth: 'errorAuth',
} as const;

/**
 * Helper to get all translations at once
 */
export function getAllMessages() {
  if (typeof chrome !== 'undefined' && chrome.i18n) {
    const messages: Record<string, string> = {};
    Object.values(i18nKeys).forEach(key => {
      messages[key] = t(key);
    });
    return messages;
  }
  return {};
}
