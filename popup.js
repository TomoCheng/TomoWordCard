document.addEventListener('DOMContentLoaded', () => {
  const containerEl = document.getElementById('container');
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const fileInput = document.getElementById('file-input');
  const clearAllBtn = document.getElementById('clear-all');

  // 【新增】用來記錄每個日期的展開狀態，防止打勾時資料夾意外收合
  let openFoldersState = {}; 

  // 渲染畫面的主函數
  function renderVocab() {
    chrome.storage.local.get({ vocabList: [] }, (result) => {
      const list = result.vocabList;
      containerEl.innerHTML = '';

      if (list.length === 0) {
        containerEl.innerHTML = '<div class="empty-msg">還沒有儲存任何單字喔！</div>';
        return;
      }

      const groups = {};
      list.forEach(item => {
        if (!groups[item.date]) {
          groups[item.date] = [];
        }
        groups[item.date].push(item);
      });

      const sortedDates = Object.keys(groups).sort((a, b) => new Date(b) - new Date(a));

      sortedDates.forEach(date => {
        const details = document.createElement('details');
        
        // 【變更】預設摺疊 (false)，但如果之前是展開的，就保持展開
        details.open = openFoldersState[date] || false;

        // 【新增】監聽展開/摺疊事件，並記錄下來
        details.addEventListener('toggle', () => {
          openFoldersState[date] = details.open;
        });

        // 【新增】檢查該日期內，是否還有「未熟悉（未打勾）」的單字
        const hasUnlearned = groups[date].some(item => !item.learned);
        const starHtml = hasUnlearned ? '<span class="star-icon">*</span>' : '';

        const summary = document.createElement('summary');
        // 加入星號提示
        summary.innerHTML = `${date} (${groups[date].length}) ${starHtml}`;
        details.appendChild(summary);

        groups[date].slice().reverse().forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'word-item';

          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.className = 'word-checkbox';
          checkbox.checked = item.learned || false;
          checkbox.addEventListener('change', () => {
            toggleLearned(item, checkbox.checked);
          });

          const wordSpan = document.createElement('span');
          wordSpan.className = `word-text ${checkbox.checked ? 'learned' : ''}`;
          wordSpan.textContent = item.word;
          wordSpan.title = "點擊前往 Google 翻譯複習";
          wordSpan.addEventListener('click', () => {
            const translateUrl = `https://translate.google.com/?sl=auto&tl=zh-TW&text=${encodeURIComponent(item.word)}&op=translate`;
            chrome.tabs.create({ url: translateUrl });
          });

          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'delete-btn';
          deleteBtn.textContent = '×';
          deleteBtn.title = `刪除「${item.word}」`;
          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(`確定要刪除「${item.word}」嗎？`)) {
              deleteWord(item);
            }
          });

          itemDiv.appendChild(checkbox);
          itemDiv.appendChild(wordSpan);
          itemDiv.appendChild(deleteBtn);
          details.appendChild(itemDiv);
        });

        containerEl.appendChild(details);
      });
    });
  }

  function toggleLearned(targetItem, isChecked) {
    chrome.storage.local.get({ vocabList: [] }, (result) => {
      const list = result.vocabList;
      const target = list.find(item => 
        (item.id && targetItem.id) ? item.id === targetItem.id : item.word === targetItem.word
      );
      
      if (target) {
        target.learned = isChecked;
        chrome.storage.local.set({ vocabList: list }, () => {
          renderVocab(); 
        });
      }
    });
  }

  function deleteWord(targetItem) {
    chrome.storage.local.get({ vocabList: [] }, (result) => {
      const list = result.vocabList;
      const updatedList = list.filter(item => {
        if (item.id && targetItem.id) {
          return item.id !== targetItem.id;
        }
        return item.word !== targetItem.word;
      });
      
      chrome.storage.local.set({ vocabList: updatedList }, () => {
        renderVocab(); 
      });
    });
  }

  // 匯出功能
  exportBtn.addEventListener('click', () => {
    chrome.storage.local.get({ vocabList: [] }, (result) => {
      const list = result.vocabList;
      if (list.length === 0) {
        alert('目前沒有任何單字可以匯出喔！');
        return;
      }
      const dataStr = JSON.stringify(list, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TomoWordCard_備份_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });

  // 匯入功能
  importBtn.addEventListener('click', () => {
    fileInput.click();
  });

  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedList = JSON.parse(event.target.result);
        if (!Array.isArray(importedList)) {
          alert('檔案格式錯誤，匯入失敗！');
          return;
        }
        chrome.storage.local.get({ vocabList: [] }, (result) => {
          let currentList = result.vocabList;
          let importCount = 0;
          importedList.forEach(importedItem => {
            const isDuplicate = currentList.some(item => 
              item.word.trim().toLowerCase() === importedItem.word.trim().toLowerCase()
            );
            if (!isDuplicate) {
              const newItem = {
                id: importedItem.id || Date.now().toString() + Math.random().toString(36).substr(2, 5),
                word: importedItem.word,
                date: importedItem.date || new Date().toLocaleDateString(),
                learned: importedItem.learned !== undefined ? importedItem.learned : false
              };
              currentList.push(newItem);
              importCount++;
            }
          });
          chrome.storage.local.set({ vocabList: currentList }, () => {
            alert(`匯入完成！成功匯入 ${importCount} 個新單字。`);
            fileInput.value = ''; 
            renderVocab();
          });
        });
      } catch (err) {
        alert('解析檔案失敗，請確保該檔案是正確的 JSON 備份檔。');
      }
    };
    reader.readAsText(file);
  });

  // 清除功能
  clearAllBtn.addEventListener('click', () => {
    if (confirm('確定要清空所有的單字筆記嗎？此操作無法復原。')) {
      chrome.storage.local.set({ vocabList: [] }, () => {
        // 清空時也順便把展開狀態清掉
        openFoldersState = {};
        renderVocab();
      });
    }
  });

  renderVocab();
});