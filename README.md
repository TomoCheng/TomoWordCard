# TomoWordCard

[繁體中文](#繁體中文) | [日本語](#日本語) | [English](#english)

---

## 繁體中文

一款能輕鬆製作單字卡的 Chrome 擴充功能。

### 🚀 功能特點

- **右鍵快速儲存**：在網頁上反白任何文字並點擊右鍵，即可立即將其儲存至您的單字列表。
- **動態多國語言支援**：完整在地化的介面，支援英文、繁體中文與日本語。
- **智慧翻譯路由**：
  - 當套件語言設定為 **日本語** 時，點擊單字會自動開啟 Google 翻譯並配置為 **英文 ➔ 日本語**。
  - 當設定為英文或繁體中文時，則會路由至 **自動偵測 ➔ 繁體中文**。
- **自訂翻譯與遮罩**：使用符合設計規範的輸入框添加您自己的翻譯定義。預設情況下翻譯會被遮罩以協助自我測試；只需按住眼睛圖示（`👁️`）即可偷看。
- **資料管理**：輕鬆將您的單字本匯出為 JSON 備份檔案、匯入現有的備份，或在想要全新開始時清除所有資料。
- **按日期分組**：儲存的單字會自動按日期分組，並顯示在乾淨、可摺疊的資料夾檢視中。

### 📂 檔案結構

- `manifest.json`：擴充功能的設定檔與本地資料。
- `popup.html`：擴充功能彈出視窗的使用者介面佈局。
- `popup.js`：UI 邏輯、事件監聽器與動態單字渲染。
- `background.js`：管理右鍵選單與擴充功能安裝事件的 Service Worker。
- `loc.js`：集中管理的在地化字典與多語言同步輔助函式。

### 🛠️ 安裝步驟

1. 複製或下載此儲存庫至您的本機電腦。
2. 開啟 Google Chrome 瀏覽器並導覽至 `chrome://extensions/`。
3. 切換右上角的開關以啟用 **開發者模式**。
4. 點擊左上角的 **載入未封裝項目**。
5. 選擇包含擴充功能檔案的資料夾。

### 📝 使用方法

1. **新增單字**：在任何網站上反白單字，點擊右鍵並選擇 `Save '[word]' to TomoWordCard`。
2. **複習單字**：點擊擴充功能圖示，查看按日期分組的儲存列表。點擊任何單字即可快速在 Google 翻譯中查詢。
3. **自我測試**：在輸入框中輸入自訂定義。儲存後它們將被遮罩。按住輸入欄位旁的 `👁️` 按鈕可暫時顯示您的自訂翻譯。
4. **資料攜帶性**：使用底部的按鈕來備份（`匯出備份`）或還原（`匯入單字`）您的單字資料。

---

## 日本語

手軽に単語カードを作成できる Chrome 拡張機能。

### 🚀 主な機能

- **コンテキストメニューからクイック保存**：ウェブページ上の任意のテキストをハイライトして右クリックするだけで、即座に単語リストに保存できます。
- **動的多言語サポート**：英語、繁体字中国語（繁體中文）、日本語を完全にサポートしたローカライズ済みインターフェース。
- **スマート翻訳ルーティング**：
  - アプリの言語が **日本語** に設定されている場合、単語をクリックすると自動的に **英語 ➔ 日本語** に設定された Google 翻訳が開きます。
  - 英語または繁体字中国語の場合、**自動検出 ➔ 繁体字中国語** にルーティングされます。
- **カスタム翻訳とマスキング**：仕様に準拠したクリーンな入力ボックスで、独自の翻訳意味を追加できます。自己テストをサポートするため、翻訳はデフォルトでマスクされます。目のアイコン（`👁️`）を長押しするだけで表示できます。
- **データ管理**：単語帳を JSON バックアップファイルとして簡単にエクスポート、既存のバックアップをインポート、または最初からやり直したいときに全データを消去できます。
- **時系列グルーピング**：保存された単語は、日付ごとにクリーンで折りたたみ可能なフォルダービュー内に自動的にグループ化されます。

### 📂 ファイル構成

- `manifest.json`：拡張機能の設定とメタデータ。
- `popup.html`：拡張機能ポップアップのユーザーインターフェースレイアウト。
- `popup.js`：UIロジック、イベントリスナー、動的な単語レンダリング。
- `background.js`：右クリックコンテキストメニューと拡張機能のインストールイベントを管理するサービスワーカー。
- `loc.js`：多言語同期のための、中央管理されたローカライズ辞書とヘルパー関数。

### 🛠️ インストール方法

1. このリポジトリをローカルマシンにクローンまたはダウンロードします。
2. Google Chrome を開き、`chrome://extensions/` に移動します。
3. 右上隅のスイッチを切り替えて **デベロッパー モード** を有効にします。
4. 左上隅の **展開型の拡張機能を取り込む** をクリックします。
5. 拡張機能ファイルが含まれているフォルダーを選択します。

### 📝 使い方

1. **単語の追加**：任意のウェブサイトで単語をハイライトし、右クリックして `Save '[word]' to TomoWordCard` を選択します。
2. **復習する**：拡張機能アイコンをクリックして、日付ごとにグループ化された保存リストを表示します。任意の単語をクリックすると、Google 翻訳ですばやく検索できます。
3. **セルフテスト**：入力ボックスにカスタム定義を入力します。保存されると、それらはマスクされます。入力フィールドの横にある `👁️` ボタンを長押しすると、カスタム翻訳が一時的に表示されます。
4. **データのポータビリティ**：下部にあるボタンを使用して、単語データをバックアップ（`データエクスポート`）または復元（`データインポート`）します。

---

## English

A simple Chrome extension for saving words to a word list.

### 🚀 Features

- **Quick Save via Context Menu**: Right-click any selected text on a webpage to instantly save it to your word list.
- **Dynamic Multi-Language Support**: Fully localized interface supporting English, Traditional Chinese (繁體中文), and Japanese (日本語).
- **Smart Translation Routing**: 
  - When the app language is set to **Japanese**, clicking a word automatically opens Google Translate configured for **English ➔ Japanese**.
  - For English and Traditional Chinese, it routes to **Auto-Detect ➔ Traditional Chinese**.
- **Custom Translation & Masking**: Add your own translated meanings with a clean, specifications-aligned input box. Translations are masked by default to assist with self-testing; simply hold the eye icon (`👁️`) to peek.
- **Data Management**: Easily export your vocabulary as a JSON backup file, import existing backups, or clear all data when you want a fresh start.
- **Chronological Grouping**: Saved words are automatically grouped by date inside clean, collapsible folder views.

### 📂 File Structure

- `manifest.json`: Extension configuration and metadata.
- `popup.html`: The user interface layout of the extension popup.
- `popup.js`: UI logic, event listeners, and dynamic vocabulary rendering.
- `background.js`: Service worker managing the right-click context menus and extension installation events.
- `loc.js`: Centrally managed localization dictionary and helper functions for multi-language synchronization.

### 🛠️ Installation

1. Clone or download this repository to your local machine.
2. Open Google Chrome and navigate to `chrome://extensions/`.
3. Enable **Developer mode** by toggling the switch in the top-right corner.
4. Click **Load unpacked** in the top-left corner.
5. Select the folder containing the extension files.

### 📝 Usage

1. **Adding Words**: Highlight a word on any website, right-click, and select `Save '[word]' to TomoWordCard`.
2. **Reviewing**: Click the extension icon to view your saved list grouped by date. Click any word to quickly look it up on Google Translate.
3. **Self-Testing**: Type custom definitions in the input box. Once saved, they will be masked. Hold the `👁️` button next to the input field to temporarily reveal your custom translation.
4. **Data Portability**: Use the buttons at the bottom to backup (`Export Backup`) or restore (`Import Words`) your vocabulary data.

---

## 📄 License

This project is open-source and available under the [MIT License](LICENSE).