// Localization dictionary containing English, Traditional Chinese, and Japanese strings
const locales = {
  en: {
    title: "TomoWordCard",
    emptyMsg: "No words saved yet!",
    placeholderTrans: "Custom translation...",
    peekTitle: "Hold to view translation",
    deleteTitle: 'Delete "{word}"',
    deleteConfirm: 'Are you sure you want to delete "{word}"?',
    exportBtn: "Export Backup",
    importBtn: "Import Words",
    clearAllBtn: "Clear All Data",
    clearAllConfirm: "Are you sure you want to clear all word notes? This operation cannot be undone.",
    exportEmptyAlert: "There are no words to export!",
    importSuccessAlert: "Import complete! Successfully imported {count} new words.",
    importFailFormat: "File format error, import failed!",
    importFailParse: "Failed to parse file. Please ensure it is a valid JSON backup file.",
    reviewTip: "Click to review on Google Translate",
    contextMenuTitle: "Save '{word}' to TomoWordCard",
    saveSuccessNotify: "Successfully saved: {word}"
  },
  zh: {
    title: "TomoWordCard",
    emptyMsg: "還沒有儲存任何單字喔！",
    placeholderTrans: "自訂翻譯...",
    peekTitle: "按住查看翻譯",
    deleteTitle: '刪除「{word}」',
    deleteConfirm: '確定要刪除「{word}」嗎？',
    exportBtn: "匯出備份",
    importBtn: "匯入單字",
    clearAllBtn: "清除所有資料",
    clearAllConfirm: "確定要清空所有的單字筆記嗎？此操作無法復原。",
    exportEmptyAlert: "目前沒有任何單字可以匯出喔！",
    importSuccessAlert: "匯入完成！成功匯入 {count} 個新單字。",
    importFailFormat: "檔案格式錯誤，匯入失敗！",
    importFailParse: "解析檔案失敗，請確保該檔案是正確的 JSON 備份檔。",
    reviewTip: "點擊前往 Google 翻譯複習",
    contextMenuTitle: "將「{word}」儲存至 TomoWordCard",
    saveSuccessNotify: "已成功儲存：{word}"
  },
  ja: {
    title: "TomoWordCard",
    emptyMsg: "単語がまだ保存されていません！",
    placeholderTrans: "カスタム翻訳...",
    peekTitle: "長押しして翻訳を表示",
    deleteTitle: '「{word}」を削除',
    deleteConfirm: '本当に「{word}」を削除しますか？',
    exportBtn: "データエクスポート",
    importBtn: "データインポート",
    clearAllBtn: "全データを消去",
    clearAllConfirm: "すべての単語メモを消去しますか？この操作は取り消せません。",
    exportEmptyAlert: "書き出す単語がありません！",
    importSuccessAlert: "インポートが完了しました！新たに {count} 個の単語を取り込みました。",
    importFailFormat: "ファイル形式のエラー。インポートに失敗しました！",
    importFailParse: "ファイルの解析に失敗しました。正しいJSONバックアップファイルか確認してください。",
    reviewTip: "クリックしてGoogle翻訳で復習",
    contextMenuTitle: "「{word}」を TomoWordCard に保存",
    saveSuccessNotify: "保存に成功しました：{word}"
  }
};

let currentLang = 'en'; // Default language tracker

// Function to update static UI texts based on selection (Safe for Background Script)
function applyLocalization(lang) {
  currentLang = lang;
  
  // Check if document exists (it only exists in popup/content scripts, not background)
  if (typeof document !== 'undefined') {
    const exportBtn = document.getElementById('export-btn');
    const importBtn = document.getElementById('import-btn');
    const clearAllBtn = document.getElementById('clear-all');
    
    if (exportBtn) exportBtn.textContent = locales[lang].exportBtn;
    if (importBtn) importBtn.textContent = locales[lang].importBtn;
    if (clearAllBtn) clearAllBtn.textContent = locales[lang].clearAllBtn;
  }
}

// Helper function to fetch a localized string and replace placeholders if any
function getLocaleString(key, placeholders = {}) {
  let str = locales[currentLang][key] || locales['en'][key] || '';
  Object.keys(placeholders).forEach(pKey => {
    str = str.replaceAll(`{${pKey}}`, placeholders[pKey]);
  });
  return str;
}