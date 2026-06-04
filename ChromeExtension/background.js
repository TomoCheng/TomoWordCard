// Import the localization dictionary and helper functions
importScripts('loc.js');

// Helper function to initialize or update the context menu based on saved language
function updateContextMenu() {
  chrome.storage.local.get({ appLanguage: 'en' }, (result) => {
    // Set the current language variable inside loc.js
    currentLang = result.appLanguage;

    // Remove the old menu item first to avoid duplication errors, then create a new one
    chrome.contextMenus.removeAll(() => {
      chrome.contextMenus.create({
        id: "saveWord",
        // Fetch localized title (e.g., "Save '%s' to TomoWordCard")
        title: getLocaleString('contextMenuTitle', { word: "%s" }),
        contexts: ["selection"]
      });
    });
  });
}

// Trigger context menu update when the extension is installed or updated
chrome.runtime.onInstalled.addListener(() => {
  updateContextMenu();
});

// Watch for storage changes (e.g., when the user changes language in popup.html)
chrome.storage.onChanged.addListener((changes, areaName) => {
  if (areaName === 'local' && changes.appLanguage) {
    updateContextMenu();
  }
});

// Handle right-click context menu click events
chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "saveWord" && info.selectionText) {
    const selectedText = info.selectionText.trim();
    if (!selectedText) return;

    chrome.storage.local.get({ vocabList: [], appLanguage: 'en' }, (result) => {
      const list = result.vocabList;
      currentLang = result.appLanguage; // Ensure current language is up to date

      // Check for duplicates (case-insensitive)
      const isDuplicate = list.some(item => item.word.toLowerCase() === selectedText.toLowerCase());

      if (!isDuplicate) {
        const newItem = {
          id: Date.now().toString() + Math.random().toString(36).substr(2, 5),
          word: selectedText,
          date: new Date().toLocaleDateString(),
          learned: false,
          starred: false,
          translation: ""
        };
        list.push(newItem);
        
        chrome.storage.local.set({ vocabList: list }, () => {
          console.log(`Word saved successfully via context menu: ${selectedText}`);
        });
      }
    });
  }
});