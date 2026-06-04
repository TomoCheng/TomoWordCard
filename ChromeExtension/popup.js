document.addEventListener('DOMContentLoaded', () => {
  const containerEl = document.getElementById('container');
  const exportBtn = document.getElementById('export-btn');
  const importBtn = document.getElementById('import-btn');
  const fileInput = document.getElementById('file-input');
  const clearAllBtn = document.getElementById('clear-all');
  const langSelect = document.getElementById('lang-select');

  let openFoldersState = {}; 

  // Initialize Language Settings from Storage
  chrome.storage.local.get({ appLanguage: 'en' }, (result) => {
    const savedLang = result.appLanguage;
    langSelect.value = savedLang;
    applyLocalization(savedLang);
    renderVocab(); // Render list after localization is set
  });

  // Handle Language Dropdown Changes with persistence
  langSelect.addEventListener('change', (e) => {
    const selectedLang = e.target.value;
    chrome.storage.local.set({ appLanguage: selectedLang }, () => {
      applyLocalization(selectedLang);
      renderVocab(); // Re-render to reflect language change instantly
    });
  });

  // Main render function for vocabulary items
  function renderVocab() {
    chrome.storage.local.get({ vocabList: [] }, (result) => {
      const list = result.vocabList;
      containerEl.innerHTML = '';

      if (list.length === 0) {
        containerEl.innerHTML = `<div class="empty-msg">${getLocaleString('emptyMsg')}</div>`;
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
        // Keep folder state: default to closed (false) unless opened previously
        details.open = openFoldersState[date] || false;

        details.addEventListener('toggle', () => {
          openFoldersState[date] = details.open;
        });

        // Check for any unlearned (unchecked) items in this group
        const hasUnlearned = groups[date].some(item => !item.learned);
        const starHtml = hasUnlearned ? '<span class="star-icon">*</span>' : '';

        const summary = document.createElement('summary');
        summary.innerHTML = `${date} (${groups[date].length}) ${starHtml}`;
        details.appendChild(summary);

        groups[date].sort((a, b) => {
          const learnedA = a.learned ? 1 : 0;
          const learnedB = b.learned ? 1 : 0;
          return learnedB - learnedA;
        });
        groups[date].sort((a, b) => {
          const starredA = a.starred ? 0 : 1;
          const starredB = b.starred ? 0 : 1;
          return starredB - starredA;
        });
        groups[date].slice().reverse().forEach(item => {
          const itemDiv = document.createElement('div');
          itemDiv.className = 'word-item';

          // A. Checkbox Element
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.className = 'word-checkbox';
          checkbox.checked = item.learned || false;
          checkbox.addEventListener('change', () => {
            toggleLearned(item, checkbox.checked);
          });

          const starWrapper = document.createElement('span');

          const starInput = document.createElement('input');
          starInput.type = 'checkbox';
          starInput.className = 'star-input';
          starInput.id = `star-${item.id}`;
          starInput.checked = item.starred || false;
          starInput.addEventListener('change', () => {
            toggleStarred(item, starInput.checked);
          });

          const starLabel = document.createElement('label');
          starLabel.className = 'star-label';
          starLabel.htmlFor = `star-${item.id}`;
          starLabel.innerHTML = '★';

          starWrapper.appendChild(starInput);
          starWrapper.appendChild(starLabel);

          // B. Vocabulary Word Display
          const wordSpan = document.createElement('span');
          wordSpan.className = `word-text ${checkbox.checked ? 'learned' : ''}`;
          wordSpan.textContent = item.word;
          wordSpan.title = getLocaleString('reviewTip');
          wordSpan.addEventListener('click', () => {
            let translateUrl = '';
            // Change Google Translate configuration based on the current language selection
            if (currentLang === 'ja') {
              // English to Japanese
              translateUrl = `https://translate.google.com/?sl=en&tl=ja&text=${encodeURIComponent(item.word)}&op=translate`;
            } else {
              // Auto detect to Traditional Chinese
              translateUrl = `https://translate.google.com/?sl=auto&tl=zh-TW&text=${encodeURIComponent(item.word)}&op=translate`;
            }
            chrome.tabs.create({ url: translateUrl });
          });

          // C. Custom Translation Input Box
          const transInput = document.createElement('input');
          transInput.type = 'text';
          transInput.className = 'trans-input';
          transInput.placeholder = getLocaleString('placeholderTrans');
          transInput.value = item.translation || '';
          
          // Apply mask if a translation already exists
          if (item.translation) {
            transInput.classList.add('is-masked');
          }

          // Unmask on focus for clear editing
          transInput.addEventListener('focus', () => {
            transInput.classList.remove('is-masked');
          });

          // Save on blur and determine masking status
          transInput.addEventListener('blur', () => {
            const newVal = transInput.value.trim();
            if (newVal) {
              transInput.classList.add('is-masked');
            }
            if (newVal !== (item.translation || '')) {
              saveTranslation(item, newVal);
              item.translation = newVal;
            }
          });

          // Allow saving via Enter key
          transInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
              transInput.blur();
            }
          });

          // D. Peek Button (Hold to preview translation)
          const peekBtn = document.createElement('button');
          peekBtn.className = 'peek-btn';
          peekBtn.textContent = '👁️';
          peekBtn.title = getLocaleString('peekTitle');

          const showTrans = () => transInput.classList.remove('is-masked');
          const hideTrans = () => {
            if (transInput.value.trim()) {
              transInput.classList.add('is-masked');
            }
          };

          // Bind trigger events for both standard mouse and touch inputs
          peekBtn.addEventListener('mousedown', showTrans);
          peekBtn.addEventListener('touchstart', showTrans);
          peekBtn.addEventListener('mouseup', hideTrans);
          peekBtn.addEventListener('mouseleave', hideTrans);
          peekBtn.addEventListener('touchend', hideTrans);

          // E. Delete Button
          const deleteBtn = document.createElement('button');
          deleteBtn.className = 'delete-btn';
          deleteBtn.textContent = '×';
          deleteBtn.title = getLocaleString('deleteTitle', { word: item.word });
          deleteBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            if (confirm(getLocaleString('deleteConfirm', { word: item.word }))) {
              deleteWord(item);
            }
          });

          // Append elements in chronological structural order
          itemDiv.appendChild(checkbox);
          itemDiv.appendChild(starWrapper);
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

  // Save the custom translation to local storage
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

  // Toggle the checked/unchecked state of a word
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

function toggleStarred(targetItem, isStarred) {
  chrome.storage.local.get({ vocabList: [] }, (result) => {
    const list = result.vocabList;
    const target = list.find(item => 
      (item.id && targetItem.id) ? item.id === targetItem.id : item.word === targetItem.word
    );
    if (target) {
      target.starred = isStarred;
      chrome.storage.local.set({ vocabList: list }, () => {
        renderVocab(); 
      });
    }
  });
}

  // Delete an individual word from the list
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

  // Export functionality
  exportBtn.addEventListener('click', () => {
    chrome.storage.local.get({ vocabList: [] }, (result) => {
      const list = result.vocabList;
      if (list.length === 0) {
        alert(getLocaleString('exportEmptyAlert'));
        return;
      }
      const dataStr = JSON.stringify(list, null, 2);
      const blob = new Blob([dataStr], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `TomoWordCard_Backup_${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    });
  });

  // Import Trigger Functionality
  importBtn.addEventListener('click', () => {
    fileInput.click();
  });

  // Handle importing list from an external backup JSON file
  fileInput.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const importedList = JSON.parse(event.target.result);
        if (!Array.isArray(importedList)) {
          alert(getLocaleString('importFailFormat'));
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
                translation: importedItem.translation || ''
              };
              currentList.push(newItem);
              importCount++;
            }
          });
          chrome.storage.local.set({ vocabList: currentList }, () => {
            alert(getLocaleString('importSuccessAlert', { count: importCount }));
            fileInput.value = ''; 
            renderVocab();
          });
        });
      } catch (err) {
        alert(getLocaleString('importFailParse'));
      }
    };
    reader.readAsText(file);
  });

  // Clear all data entries from storage
  clearAllBtn.addEventListener('click', () => {
    if (confirm(getLocaleString('clearAllConfirm'))) {
      chrome.storage.local.set({ vocabList: [] }, () => {
        openFoldersState = {};
        renderVocab();
      });
    }
  });
});