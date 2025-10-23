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
    extDescription: 'Công cụ học ngoại ngữ siêu xịn - Bắt từ và học liền tay! 🚀',
    actionTitle: 'Select Care',
    
    // Buttons
    btnNote: 'Ghi Chú',
    btnLearn: 'Nghĩa từ này là gì ta?',
    btnChat: 'Chat Nào',
    btnTranslate: 'Dịch Ngay',
    btnDictionary: 'Tra Cứu',
    btnManage: 'Quản Lý',
    btnExport: 'Xuất Data',
    btnStats: 'Xem Thống Kê',
    btnLanguage: 'Đổi Ngôn Ngữ',
    btnSave: 'Lưu Lại',
    btnSaveLearn: 'Lưu ngay',
    btnCancel: 'Thôi, Bỏ Qua',
    btnClose: 'Đóng',
    
    // Title
    titleLearn: 'Nghĩa của từ này',

    // Placeholders
    placeholderNote: 'Viết ghi chú gì đó đi nào... ✍️',
    placeholderTargetLang: 'Muốn dịch sang ngôn ngữ gì? (vd: Tiếng Việt, English...)',
    placeholderChat: 'Hỏi gì cũng được nha! 🤔',
    
    // Labels
    labelSelectedText: 'Đoạn text bạn chọn:',
    labelTranslation: 'Nghĩa là:',
    labelDefinition: 'Giải thích:',
    labelNote: 'Ghi chú của bạn:',
    
    // Messages
    msgSaving: 'Đợi tí, đang lưu... ⏳',
    msgSaved: 'Xong rồi! Lưu thành công nè! 🎉',
    msgError: 'Ối, có lỗi rồi! Thử lại xem? 😅',
    msgNoSelection: 'Ê, bạn chưa chọn chữ nào cả! 👆',
    msgTranslating: 'Để mình dịch nhé... 🔄',
    msgLoading: 'Chờ xíu đang tải... ⏱️',
    
    // Dashboard
    dashboardTitle: 'Bảng Điều Khiển',
    dashboardMySelections: 'Kho Từ Của Bạn',
    dashboardSearch: 'Tìm gì đó đi... 🔍',
    dashboardNoItems: 'Trống trơn luôn! Bắt đầu bắt từ trên web đi nào! 🎯',
    
    // Auth
    authRequired: 'Đăng nhập đi bạn ơi, không là không xài được đâu! 🔐',
    authLogin: 'Đăng Nhập Ngay',
    authLogout: 'Thoát Ra',
    
    // Settings
    settingsTitle: 'Cài Đặt',
    settingsLanguage: 'Ngôn ngữ',
    settingsTheme: 'Giao diện',
    
    // Errors
    errorNetwork: 'Ối, mất mạng rồi! Check lại internet đi bạn ơi 📡',
    errorAuth: 'Hết phiên rồi! Đăng nhập lại đi nha 🔑',
    
    // Content Script - Learn Input
    phonetics: 'Phát âm',
    synonyms: 'Từ đồng nghĩa',
    antonyms: 'Từ trái nghĩa',
    customDefinition: 'Tự Định Nghĩa',
    defineHere: 'Viết định nghĩa ở đây nè...',
    synonymsAntonyms: 'Từ Đồng Nghĩa & Trái Nghĩa',
    example: 'Ví dụ',
    addExample: 'Thêm ví dụ nào',
    markToSave: 'Đánh dấu để lưu',
    marked: 'Đã đánh dấu',
    markMeaningsToSave: 'Đánh dấu nghĩa nào bạn muốn lưu nhé!',
    definitionsAvailable: 'định nghĩa có sẵn, đánh dấu ít nhất 1 định nghĩa để lưu và học nha!',
    addComments: 'Ghi chú thêm',
    addCommentsPlaceholder: 'Thêm comment gì đó nè... (vd: "ui hay quá", "ý nghĩa ghê huhu", vv)',
    addCommentButton: '+ Thêm Comment',
    tags: 'Tags',
    addTagsPlaceholder: 'Gõ tên tag và nhấn Enter...',
    noDictionaryFound: 'Không tìm thấy định nghĩa nào cho từ này. Bạn hãy dùng "Tự Định Nghĩa" để tự thêm nha!',
    targetLanguage: 'Ngôn ngữ đích',
    partOfSpeech: 'Loại từ',
    currentLanguage: 'Ngôn ngữ hiện tại',
    
    // Popup
    popupSubtitle: 'Đừng để lỡ mất những gì thú vị bạn đọc được trên web nhé! Bôi đen và lưu ngay!',
    btnHome: 'Trang Chủ',
    howToUse: 'Cách dùng nè:',
    openSidebar: 'Mở Thanh Bên',
    howToStep1: 'Bôi đen text trên trang web',
    howToStep2: 'Chọn hành động (Học, Ghi Chú,...)',
    howToStep3: 'Mở thanh bên để quản lý kho nội dung bạn đã lưu nha',
    
    // Dashboard - Filters & Actions
    filters: 'Lọc',
    showStats: 'Xem Thống Kê',
    hideStats: 'Ẩn Thống Kê',
    clearFilters: 'Xóa Bộ Lọc',
    filterPlaceholder: 'Tìm từ, ghi chú...',
    allTypes: 'Tất Cả',
    refresh: 'Làm Mới',
    items: 'mục',
    
    // Dashboard - Selection Actions
    showComments: 'Xem Comment',
    hideComments: 'Ẩn Comment',
    generateShareCard: 'Tạo Card Chia Sẻ',
    hideCard: 'Ẩn Card',
    details: 'Chi Tiết',
    edit: 'Sửa',
    delete: 'Xóa',
    save: 'Lưu',
    cancel: 'Hủy',
    
    // Dashboard - Edit Section
    editSelectedText: 'Text đã chọn',
    editTags: 'Tags',
    editComments: 'Comments',
    editDefinition: 'Định nghĩa',
    editTranslation: 'Bản dịch',
    editExample: 'Ví dụ',
    
    // Dashboard - Export Section
    exportSelections: 'Xuất Selections',
    exportTitle: 'Xuất Selections',
    exportSubtitle: 'Chọn loại và app đích nhé — các hành động sẽ hiện bên dưới đó!',
    exportWhat: 'Xuất',
    exportLearning: 'Learning (flashcards)',
    exportNote: 'Note',
    exportTargetApp: 'App đích',
    exportFormat: 'Định Dạng',
    exportOptions: 'Tùy Chọn',
    exportFieldsToInclude: 'Các trường muốn xuất',
    exportDragToReorder: 'Kéo thả để sắp xếp lại các trường nha',
    exportActions: 'Hành Động',
    exportDownload: 'Download',
    exportCopy: 'Copy',
    exportCopied: 'Đã Copy',
    exportTo: 'Xuất về',
    exportPreview: 'Xem Trước',
    exportUpdatePreview: 'Cập Nhật Xem Trước',
    exportFront: 'Front',
    exportBack: 'Back',
    exportTags: 'Tags',
    exportSource: 'Source',
    exportTitle_field: 'Title',
    exportBody: 'Body',
    exportAnki: 'Anki',
    exportNotion: 'Notion',
    exportQuizlet: 'Quizlet',
    exportLogseq: 'Logseq',
    
    // Dashboard - Stats
    statsYourStats: 'Thống Kê Của Bạn',
    statsToday: 'Hôm Nay',
    statsTotal: 'Tổng Cộng',
    statsCongrats: 'Chúc mừng! Bạn đã lưu được',
    
    // Dashboard - Empty States
    noItemsAdjustFilters: 'Thử đổi bộ lọc xem sao!',
    startSelecting: 'Bôi đen đoạn text bất kỳ trên web và xem điều kì diệu xuất hiện nha!',
  },
  en: {
    // Extension metadata
    extName: 'Select Care',
    extDescription: 'Smart language learning tool - Save and learn from text you select',
    actionTitle: 'Select Care',
    
    // Buttons
    btnNote: 'Note it',
    btnLearn: 'Meaning?',
    btnChat: 'Chat',
    btnTranslate: 'Translate',
    btnDictionary: 'Dictionary',
    btnManage: 'Manage',
    btnExport: 'Export',
    btnStats: 'Stats',
    btnLanguage: 'Language',
    btnSave: 'Save',
    btnSaveLearn: 'Save to Learn',
    btnCancel: 'Cancel',
    btnClose: 'Close',
    
    // Title
    titleLearn: 'This word means...',

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
    
    // Content Script - Learn Input
    phonetics: 'Phonetics',
    synonyms: 'Synonyms',
    antonyms: 'Antonyms',
    customDefinition: 'Custom Definition',
    defineHere: 'Define here...',
    synonymsAntonyms: 'Synonyms & Antonyms',
    example: 'Example',
    addExample: 'Add example',
    markToSave: 'Mark to Save',
    marked: 'Marked',
    markMeaningsToSave: 'Mark meanings to save and learn.',
    definitionsAvailable: 'definitions available — select at least one to save and learn.',
    addComments: 'Add comments',
    addCommentsPlaceholder: 'Add comments... (e.g., context, memory aids, etc.)',
    addCommentButton: '+ Add Comment',
    tags: 'Tags',
    addTagsPlaceholder: 'Type tag name and press Enter...',
    noDictionaryFound: 'No dictionary meanings found for this word. Use "Custom Definition" to add your own.',
    targetLanguage: 'Target language',
    partOfSpeech: 'Part of speech',
    currentLanguage: 'Current Language',
    
    // Popup
    popupSubtitle: 'Capture and learn!',
    btnHome: 'Home',
    howToUse: 'How to use:',
    openSidebar: 'Open Sidebar',
    howToStep1: 'Select text on web pages',
    howToStep2: 'Choose action (Learn, Note, Chat)',
    howToStep3: 'Open sidebar to manage your collection',
    
    // Dashboard - Filters & Actions
    filters: 'Filters',
    showStats: 'Show Stats',
    hideStats: 'Hide Stats',
    clearFilters: 'Clear',
    filterPlaceholder: 'Search words, notes...',
    allTypes: 'All Types',
    refresh: 'Refresh',
    items: 'items',
    
    // Dashboard - Selection Actions
    showComments: 'Show Comments',
    hideComments: 'Hide Comments',
    generateShareCard: 'Generate Share Card',
    hideCard: 'Hide Card',
    details: 'Details',
    edit: 'Edit',
    delete: 'Delete',
    save: 'Save',
    cancel: 'Cancel',
    
    // Dashboard - Edit Section
    editSelectedText: 'Selected Text',
    editTags: 'Tags',
    editComments: 'Comments',
    editDefinition: 'Definition',
    editTranslation: 'Translation',
    editExample: 'Example',
    
    // Dashboard - Export Section
    exportSelections: 'Export Selections',
    exportTitle: 'Export Selections',
    exportSubtitle: 'Choose what to export and the target app — actions are shown below.',
    exportWhat: 'Export',
    exportLearning: 'Learning (flashcards)',
    exportNote: 'Note',
    exportTargetApp: 'Target app',
    exportFormat: 'Format',
    exportOptions: 'Options',
    exportFieldsToInclude: 'Fields to include',
    exportDragToReorder: 'Drag to reorder fields',
    exportActions: 'Actions',
    exportDownload: 'Download',
    exportCopy: 'Copy',
    exportCopied: 'Copied',
    exportTo: 'Export to',
    exportPreview: 'Preview',
    exportUpdatePreview: 'Update preview',
    exportFront: 'Front',
    exportBack: 'Back',
    exportTags: 'Tags',
    exportSource: 'Source',
    exportTitle_field: 'Title',
    exportBody: 'Body',
    exportAnki: 'Anki',
    exportNotion: 'Notion',
    exportQuizlet: 'Quizlet',
    exportLogseq: 'Logseq',
    
    // Dashboard - Stats
    statsYourStats: 'Your Stats',
    statsToday: 'Today',
    statsTotal: 'Total',
    statsCongrats: 'Congratulations! You\'ve saved',
    
    // Dashboard - Empty States
    noItemsAdjustFilters: 'Try adjusting your filters',
    startSelecting: 'Start selecting text on websites!',
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
  btnSaveLearn: 'btnSaveLearn',
  btnCancel: 'btnCancel',
  btnClose: 'btnClose',
  btnHome: 'btnHome',
  
  //title
  titleLearn: 'titleLearn',

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
  
  // Content Script - Learn Input
  phonetics: 'phonetics',
  synonyms: 'synonyms',
  antonyms: 'antonyms',
  customDefinition: 'customDefinition',
  defineHere: 'defineHere',
  synonymsAntonyms: 'synonymsAntonyms',
  example: 'example',
  addExample: 'addExample',
  markToSave: 'markToSave',
  marked: 'marked',
  markMeaningsToSave: 'markMeaningsToSave',
  definitionsAvailable: 'definitionsAvailable',
  addComments: 'addComments',
  addCommentsPlaceholder: 'addCommentsPlaceholder',
  addCommentButton: 'addCommentButton',
  tags: 'tags',
  addTagsPlaceholder: 'addTagsPlaceholder',
  noDictionaryFound: 'noDictionaryFound',
  targetLanguage: 'targetLanguage',
  partOfSpeech: 'partOfSpeech',
  currentLanguage: 'currentLanguage',
  
  // Popup
  popupSubtitle: 'popupSubtitle',
  howToUse: 'howToUse',
  openSidebar: 'openSidebar',
  howToStep1: 'howToStep1',
  howToStep2: 'howToStep2',
  howToStep3: 'howToStep3',
  
  // Dashboard - Filters & Actions
  filters: 'filters',
  showStats: 'showStats',
  hideStats: 'hideStats',
  clearFilters: 'clearFilters',
  filterPlaceholder: 'filterPlaceholder',
  allTypes: 'allTypes',
  refresh: 'refresh',
  items: 'items',
  
  // Dashboard - Selection Actions
  showComments: 'showComments',
  hideComments: 'hideComments',
  generateShareCard: 'generateShareCard',
  hideCard: 'hideCard',
  details: 'details',
  edit: 'edit',
  delete: 'delete',
  save: 'save',
  cancel: 'cancel',
  
  // Dashboard - Edit Section
  editSelectedText: 'editSelectedText',
  editTags: 'editTags',
  editComments: 'editComments',
  editDefinition: 'editDefinition',
  editTranslation: 'editTranslation',
  editExample: 'editExample',
  
  // Dashboard - Export Section
  exportSelections: 'exportSelections',
  exportTitle: 'exportTitle',
  exportSubtitle: 'exportSubtitle',
  exportWhat: 'exportWhat',
  exportLearning: 'exportLearning',
  exportNote: 'exportNote',
  exportTargetApp: 'exportTargetApp',
  exportFormat: 'exportFormat',
  exportOptions: 'exportOptions',
  exportFieldsToInclude: 'exportFieldsToInclude',
  exportDragToReorder: 'exportDragToReorder',
  exportActions: 'exportActions',
  exportDownload: 'exportDownload',
  exportCopy: 'exportCopy',
  exportCopied: 'exportCopied',
  exportTo: 'exportTo',
  exportPreview: 'exportPreview',
  exportUpdatePreview: 'exportUpdatePreview',
  exportFront: 'exportFront',
  exportBack: 'exportBack',
  exportTags: 'exportTags',
  exportSource: 'exportSource',
  exportTitle_field: 'exportTitle_field',
  exportBody: 'exportBody',
  exportAnki: 'exportAnki',
  exportNotion: 'exportNotion',
  exportQuizlet: 'exportQuizlet',
  exportLogseq: 'exportLogseq',
  
  // Dashboard - Stats
  statsYourStats: 'statsYourStats',
  statsToday: 'statsToday',
  statsTotal: 'statsTotal',
  statsCongrats: 'statsCongrats',
  
  // Dashboard - Empty States
  noItemsAdjustFilters: 'noItemsAdjustFilters',
  startSelecting: 'startSelecting',
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
