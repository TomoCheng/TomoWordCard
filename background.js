chrome.runtime.onInstalled.addListener(() => {
  chrome.contextMenus.create({
    id: "translateAndSave",
    title: "翻譯並儲存「%s」",
    contexts: ["selection"]
  });
});

chrome.contextMenus.onClicked.addListener((info, tab) => {
  if (info.menuItemId === "translateAndSave" && info.selectionText) {
    const word = info.selectionText.trim();
    const translateUrl = `https://translate.google.com/?sl=auto&tl=zh-TW&text=${encodeURIComponent(word)}&op=translate`;
    chrome.tabs.create({ url: translateUrl });

    chrome.storage.local.get({ vocabList: [] }, (result) => {
      const list = result.vocabList;
      
      if (!list.some(item => item.word.toLowerCase() === word.toLowerCase())) {
        list.push({
          id: Date.now().toString(), // 新增：唯一識別碼
          word: word,
          date: new Date().toLocaleDateString(),
          learned: false // 新增：是否已熟悉
        });
        
        chrome.storage.local.set({ vocabList: list });
      }
    });
  }
});