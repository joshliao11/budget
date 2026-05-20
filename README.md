# 💼 ApexBudget - 智能極簡記帳與預算管理網頁

ApexBudget 是一個專注於個人隱私、極簡美學與流暢操作的記帳與財務管理工具。採用現代磨砂玻璃風 (Glassmorphism) 設計，內置多款財務分析圖表，讓您的收支管理更有質感。

👉 **[線上立即體驗 ApexBudget](https://joshliao11.github.io/budget/)**

---

## ✨ 核心特色

- 🎨 **Glassmorphism 視覺美學**：精緻的磨砂玻璃卡片、漸層霓虹陰影、流暢的主題切換動畫。
- 🌓 **雙色主題**：支持高質感的深色模式 (Dark Mode) 與簡約的淺色模式 (Light Mode)。
- 📊 **動態圖表分析**：
  - 本月支出類別比例（圓餅圖）
  - 近六個月收支對比與儲蓄趨勢（柱狀對比圖）
- 🔒 **100% 隱私保護**：所有財務資料皆儲存在您本地瀏覽器的 `localStorage` 中，數據絕不上傳至任何第三方伺服器。
- 💸 **分類預算與超支警示**：為各個支出類別設定每月額度，超支時預算條將動態轉為呼吸漸層的警戒紅色。
- 📝 **強大收支明細**：支持金額、類別、帳戶（現金/信用卡/銀行）、備忘錄的多重篩選與即時搜尋。
- 💾 **備份與匯出**：
  - 匯出為標準 `CSV` 交易報表
  - 匯出/匯入完整 `JSON` 備份檔，輕鬆移轉資料。

---

## 🛠️ 技術棧

- **核心**：HTML5, JavaScript (Vanilla JS, ES Modules)
- **樣式**：CSS3 (CSS Variables, Flexbox, Grid, Glassmorphism, CSS Transitions)
- **圖示庫**：[Lucide Icons](https://lucide.dev/)
- **圖表庫**：[Chart.js](https://www.chartjs.org/)
- **建置工具**：[Vite](https://vitejs.dev/)

---

## 🚀 本地開發指南

### 1. 複製專案與安裝依賴

確保您已安裝 [Node.js](https://nodejs.org/)，接著在終端機中執行：

```bash
# 複製專案
git clone git@github.com:joshliao11/budget.git
cd budget

# 安裝套件
npm install
```

### 2. 啟動開發伺服器

執行以下指令開啟本機開發伺服器：

```bash
npm run dev
```

啟動後，在瀏覽器中開啟 `http://localhost:5173/` 即可進行開發與測試。

---

## 📦 生產編譯與部署

### 1. 本地打包編譯

將專案打包壓縮至 `dist/` 目錄：

```bash
npm run build
```

### 2. 一鍵發布至 GitHub Pages

我們已整合 `gh-pages` 部署工具，只需執行以下指令，系統會自動編譯並推送到 GitHub 的 `gh-pages` 分支上線：

```bash
npm run deploy
```
