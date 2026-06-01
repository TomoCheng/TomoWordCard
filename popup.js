document.addEventListener('DOMContentLoaded', () => {
  const containerEl = document.getElementById('container');
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const fileInput = document.getElementById('file-input');
  const clearAllBtn = document.getElementById('clear-all');

  let openFoldersState = {}; 

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
        details.open = openFoldersState[date] || false;

        details.addEventListener('toggle', () => {
          openFoldersState[date] = details.open;
        });

        const hasUnlearned = groups[date].some(item => !item.learned);
        const starHtml = hasUnlearned ? '<span class="star-icon">*</span>' : '';

        const summary = document.createElement('summary');
        summary.innerHTML = `${date} (${groups[date].length}) ${starHtml}`;
        details.appendChild(summary);

        groups[date].slice().reverse().forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'word-item';

          // A. Checkbox
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.className = 'word-checkbox';
          checkbox.checked = item.learned || false;
          checkbox.addEventListener('change', () => {
            toggleLearned(item, checkbox.checked);
          });

          // B. 單字文字
          const wordSpan = document.createElement('span');
          wordSpan.className = `word-text ${checkbox.checked ? 'learned' : ''}`;
          wordSpan.textContent = item.word;
          wordSpan.title = "點擊前往 Google 翻譯複習";
          wordSpan.addEventListener('click', () => {
            const translateUrl = `https://translate.google.com/?sl=auto&tl=zh-TW&text=${encodeURIComponent(item.word)}&op=translate`;
            chrome.tabs.create({ url: translateUrl });
          });

          // C. 翻譯輸入框
          const transInput = document.createElement('input');
          transInput.type = 'text';
          transInput.className = 'trans-input';
          transInput.placeholder = '自訂翻譯...';
          transInput.value = item.translation || '';
          
          // 如果一開始有翻譯內容，就套用隱藏樣式
          if (item.translation) {
            transInput.classList.add('is-masked');
          }

          // 點擊輸入框時解除隱藏，方便編輯
          transInput.addEventListener('focus', () => {
            transInput.classList.remove('is-masked');
          });

          // 失去焦點時儲存，並判斷是否要重新隱藏
          transInput.addEventListener('blur', () => {
            const newVal = transInput.value.trim();
            if (newVal) {
              transInput.classList.add('is-masked');
            }
            if (newVal !== (item.translation || '')) {
              saveTranslation(item, newVal);
              item.translation = newVal; // 更新當前物件狀態
            }
          });

          // 按下 Enter 也能儲存並失去焦點
          transInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              transInput.blur();
            }
          });

          // D. 查看按鈕 (長按眼睛)
          const peekBtn = document.createElement('button');
          peekBtn.className = 'peek-btn';
          peekBtn.textContent = '👁️';
          peekBtn.title = '按住查看翻譯';

          const showTrans = () => transInput.classList.remove('is-masked');
          const hideTrans = () => {
            if (transInput.value.trim()) {
              transInput.classList.add('is-masked');
            }
          };

          // 綁定滑鼠與觸控事件
          peekBtn.addEventListener('mousedown', showTrans);
          peekBtn.addEventListener('touchstart', showTrans);
          peekBtn.addEventListener('mouseup', hideTrans);
          peekBtn.addEventListener('mouseleave', hideTrans);
          peekBtn.addEventListener('touchend', hideTrans);

          // E. 刪除按鈕
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

          // 依序放入容器 (最左邊是Checkbox -> 單字 -> 輸入框 -> 眼睛 -> 刪除)
          itemDiv.appendChild(checkbox);
          itemDiv.appendChild(wordSpan);
          itemDiv.appendChild(transInput);
          itemDiv.appendChild(peekBtn);
          itemDiv.appendChild(deleteBtn);
          details.appendChild(itemDiv);
        });

        containerEl.appendChild(details);
      });
    });
  }

  // 儲存自訂翻譯
  function saveTranslation(targetItem, newTranslation) {
    chrome.storage.local.get({ vocabList: [] }, (result) => {
      const list = result.vocabList;
      const target = list.find(item => 
        (item.id && targetItem.id) ? item.id === targetItem.id : item.word === targetItem.word
      );
      if (target) {
        target.translation = newTranslation;
        chrome.storage.local.set({ vocabList: list });
      }
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
                learned: importedItem.learned !== undefined ? importedItem.learned : false,
                translation: importedItem.translation || '' // 匯入時也支援翻譯欄位
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

  clearAllBtn.addEventListener('click', () => {
    if (confirm('確定要清空所有的單字筆記嗎？此操作無法復原。')) {
      chrome.storage.local.set({ vocabList: [] }, () => {
        openFoldersState = {};
        renderVocab();
      });
    }
  });

  renderVocab();
});