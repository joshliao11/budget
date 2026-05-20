/* ==========================================================================
   ApexBudget - App Controller (Vanilla JS)
   ========================================================================== */

// 1. Category Schema (Includes Icons and Harmonious HSL Colors)
const CATEGORIES = {
  expense: {
    food: { name: '餐飲食品', icon: 'utensils', color: '35, 85%, 55%' },
    shopping: { name: '購物消費', icon: 'shopping-bag', color: '330, 85%, 60%' },
    housing: { name: '居住水電', icon: 'home', color: '220, 75%, 55%' },
    transport: { name: '交通出行', icon: 'car', color: '200, 85%, 50%' },
    entertainment: { name: '休閒娛樂', icon: 'gamepad-2', color: '270, 80%, 60%' },
    medical: { name: '醫療保健', icon: 'heart-pulse', color: '0, 80%, 60%' },
    education: { name: '學習教育', icon: 'book-open', color: '180, 80%, 40%' },
    other: { name: '其他支出', icon: 'more-horizontal', color: '240, 10%, 60%' }
  },
  income: {
    salary: { name: '工作薪資', icon: 'briefcase', color: '145, 80%, 42%' },
    investment: { name: '投資理財', icon: 'trending-up', color: '190, 80%, 45%' },
    bonus: { name: '獎金外快', icon: 'gift', color: '290, 80%, 55%' },
    other: { name: '其他收入', icon: 'plus-circle', color: '45, 85%, 50%' }
  }
};

const ACCOUNT_NAMES = {
  cash: { name: '現金', icon: 'banknote' },
  card: { name: '信用卡', icon: 'credit-card' },
  bank: { name: '銀行帳戶', icon: 'landmark' }
};

// 2. Mock Data for First-Time Users
const getMockTransactions = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  
  // Helpers to offset days
  const getDateStr = (offsetDays) => {
    const d = new Date();
    d.setDate(now.getDate() - offsetDays);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  };

  return [
    { id: 'mock-1', type: 'income', amount: 55000, date: getDateStr(15), category: 'salary', account: 'bank', notes: '公司月薪' },
    { id: 'mock-2', type: 'income', amount: 3200, date: getDateStr(8), category: 'investment', account: 'bank', notes: '美股股息發放' },
    { id: 'mock-3', type: 'expense', amount: 150, date: getDateStr(0), category: 'food', account: 'cash', notes: '午餐便當' },
    { id: 'mock-4', type: 'expense', amount: 2800, date: getDateStr(1), category: 'shopping', account: 'card', notes: '夏天防曬外套' },
    { id: 'mock-5', type: 'expense', amount: 9800, date: getDateStr(3), category: 'housing', account: 'bank', notes: '本月房租' },
    { id: 'mock-6', type: 'expense', amount: 65, date: getDateStr(2), category: 'transport', account: 'card', notes: '捷運乘車' },
    { id: 'mock-7', type: 'expense', amount: 1200, date: getDateStr(4), category: 'entertainment', account: 'card', notes: '週末電影與爆米花' },
    { id: 'mock-8', type: 'expense', amount: 450, date: getDateStr(6), category: 'medical', account: 'cash', notes: '牙醫診所掛號' },
    { id: 'mock-9', type: 'expense', amount: 350, date: getDateStr(10), category: 'food', account: 'card', notes: '和朋友聚餐咖啡' }
  ];
};

const DEFAULT_BUDGETS = {
  food: 12000,
  shopping: 8000,
  housing: 15000,
  transport: 3000,
  entertainment: 6000,
  medical: 2000,
  education: 4000,
  other: 5000
};

// 3. Application State Object
const state = {
  transactions: [],
  budgets: {},
  theme: 'dark',
  currentTab: 'dashboard',
  categoryChart: null,
  trendChart: null
};

// 4. Initialisation
document.addEventListener('DOMContentLoaded', () => {
  loadState();
  initTheme();
  initNavigation();
  initForms();
  initSettingsActions();
  initMobileMenu();
  
  // Set default form date to today
  document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];
  
  renderApp();
  showToast('歡迎使用 ApexBudget！資料已成功加載。', 'info');
});

// Load state from localStorage or seed mock data
function loadState() {
  const savedTx = localStorage.getItem('apex_budget_transactions');
  const savedBudgets = localStorage.getItem('apex_budget_budgets');
  const savedTheme = localStorage.getItem('apex_budget_theme');
  
  if (savedTx) {
    state.transactions = JSON.parse(savedTx);
  } else {
    // First run - seed data
    state.transactions = getMockTransactions();
    saveTransactions();
  }
  
  if (savedBudgets) {
    state.budgets = JSON.parse(savedBudgets);
  } else {
    state.budgets = { ...DEFAULT_BUDGETS };
    saveBudgets();
  }
  
  if (savedTheme) {
    state.theme = savedTheme;
  } else {
    state.theme = 'dark';
  }
}

function saveTransactions() {
  localStorage.setItem('apex_budget_transactions', JSON.stringify(state.transactions));
}

function saveBudgets() {
  localStorage.setItem('apex_budget_budgets', JSON.stringify(state.budgets));
}

// 5. Theme Configuration
function initTheme() {
  const themeToggle = document.getElementById('theme-toggle');
  
  // Apply saved theme
  if (state.theme === 'dark') {
    document.body.classList.add('dark-mode');
  } else {
    document.body.classList.remove('dark-mode');
  }
  
  themeToggle.addEventListener('click', () => {
    document.body.classList.toggle('dark-mode');
    state.theme = document.body.classList.contains('dark-mode') ? 'dark' : 'light';
    localStorage.setItem('apex_budget_theme', state.theme);
    
    // Redraw charts to update text/border colors according to mode
    renderCharts();
    showToast(`已切換為${state.theme === 'dark' ? '深色' : '淺色'}主題`, 'info');
  });
}

// 6. Navigation Tabs
function initNavigation() {
  const navItems = document.querySelectorAll('.sidebar-nav .nav-item');
  const sections = document.querySelectorAll('main .tab-content');
  const pageTitle = document.getElementById('page-title');
  const currentDate = document.getElementById('current-date');
  
  // Display current date in sub-title
  const options = { year: 'numeric', month: 'long', day: 'numeric', weekday: 'long' };
  currentDate.textContent = new Date().toLocaleDateString('zh-TW', options);
  
  navItems.forEach(item => {
    item.addEventListener('click', (e) => {
      e.preventDefault();
      const targetTab = item.getAttribute('href').replace('#', '');
      switchTab(targetTab);
    });
  });
  
  // Link other button shortcuts
  document.getElementById('btn-view-all-transactions').addEventListener('click', () => switchTab('transactions'));
  document.getElementById('btn-manage-budgets').addEventListener('click', () => switchTab('budgets'));
}

function switchTab(tabId) {
  state.currentTab = tabId;
  
  // Update sidebar UI
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(el => el.classList.remove('active'));
  const activeNav = document.getElementById(`nav-${tabId}`);
  if (activeNav) activeNav.classList.add('active');
  
  // Update Content panel visibility
  document.querySelectorAll('main .tab-content').forEach(el => el.classList.remove('active'));
  const activeSection = document.getElementById(`tab-${tabId}`);
  if (activeSection) activeSection.classList.add('active');
  
  // Title update
  const titles = {
    dashboard: '歡迎回來',
    transactions: '收支明細管理',
    budgets: '預算分析與設定',
    settings: '系統設定與備份'
  };
  document.getElementById('page-title').textContent = titles[tabId] || 'ApexBudget';
  
  // Dynamic rendering depending on target tab
  if (tabId === 'dashboard') {
    renderDashboard();
  } else if (tabId === 'transactions') {
    renderTransactionsTab();
  } else if (tabId === 'budgets') {
    renderBudgetsTab();
  }
  
  // Trigger Lucide to render icons inside new components
  lucide.createIcons();
}

// 7. Modals & Forms handling
function initForms() {
  const modal = document.getElementById('transaction-modal');
  const openBtn = document.getElementById('btn-open-add-transaction');
  const closeBtn = document.getElementById('btn-close-modal');
  const cancelBtn = document.getElementById('btn-cancel-modal');
  const form = document.getElementById('transaction-form');
  const typeRadios = document.getElementsByName('tx-type');
  
  // Open modal
  openBtn.addEventListener('click', () => openTransactionModal());
  
  // Close modals
  const closeModalFunc = () => {
    modal.classList.remove('active');
    form.reset();
    document.getElementById('tx-id').value = '';
    document.getElementById('modal-title').textContent = '新增收支記錄';
    document.getElementById('tx-date').value = new Date().toISOString().split('T')[0];
  };
  
  closeBtn.addEventListener('click', closeModalFunc);
  cancelBtn.addEventListener('click', closeModalFunc);
  
  // Click outside modal block closes it
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModalFunc();
  });
  
  // Sync Category selector options when Type toggles (Income <-> Expense)
  typeRadios.forEach(radio => {
    radio.addEventListener('change', () => {
      populateCategoriesSelect(radio.value);
    });
  });
  
  // Transaction Submit Form
  form.addEventListener('submit', (e) => {
    e.preventDefault();
    
    const txId = document.getElementById('tx-id').value;
    const type = form.elements['tx-type'].value;
    const amount = parseFloat(document.getElementById('tx-amount').value);
    const date = document.getElementById('tx-date').value;
    const category = document.getElementById('tx-category').value;
    const account = document.getElementById('tx-account').value;
    const notes = document.getElementById('tx-notes').value.trim();
    
    if (isNaN(amount) || amount <= 0) {
      showToast('請輸入大於 0 的有效金額！', 'danger');
      return;
    }
    
    const txData = {
      id: txId || 'tx-' + Date.now() + Math.random().toString(36).substr(2, 4),
      type,
      amount,
      date,
      category,
      account,
      notes: notes || CATEGORIES[type][category].name
    };
    
    if (txId) {
      // Edit transaction
      const idx = state.transactions.findIndex(t => t.id === txId);
      if (idx !== -1) {
        state.transactions[idx] = txData;
        showToast('交易資料已更新成功', 'success');
      }
    } else {
      // Add transaction
      state.transactions.unshift(txData);
      showToast('新增收支記錄成功', 'success');
    }
    
    // Sort transactions by date descending
    state.transactions.sort((a, b) => new Date(b.date) - new Date(a.date));
    
    saveTransactions();
    closeModalFunc();
    renderApp();
  });
  
  // Budget Form Save
  const budgetForm = document.getElementById('budget-settings-form');
  budgetForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    for (const catKey in CATEGORIES.expense) {
      const input = document.getElementById(`budget-${catKey}`);
      if (input) {
        const val = parseFloat(input.value);
        state.budgets[catKey] = isNaN(val) || val < 0 ? 0 : val;
      }
    }
    
    saveBudgets();
    showToast('分類預算額度已儲存成功！', 'success');
    renderApp();
  });
}

// Populate Category Selector depending on Type
function populateCategoriesSelect(type, selectedValue = '') {
  const catSelect = document.getElementById('tx-category');
  catSelect.innerHTML = '';
  
  const options = CATEGORIES[type];
  for (const key in options) {
    const opt = document.createElement('option');
    opt.value = key;
    opt.textContent = options[key].name;
    if (key === selectedValue) {
      opt.selected = true;
    }
    catSelect.appendChild(opt);
  }
}

function openTransactionModal(existingTx = null) {
  const modal = document.getElementById('transaction-modal');
  const form = document.getElementById('transaction-form');
  
  if (existingTx) {
    // Edit Mode
    document.getElementById('modal-title').textContent = '修改交易記錄';
    document.getElementById('tx-id').value = existingTx.id;
    form.elements['tx-type'].value = existingTx.type;
    
    // Adjust visual checked toggle classes
    if (existingTx.type === 'income') {
      document.getElementById('type-income').checked = true;
    } else {
      document.getElementById('type-expense').checked = true;
    }
    
    populateCategoriesSelect(existingTx.type, existingTx.category);
    document.getElementById('tx-amount').value = existingTx.amount;
    document.getElementById('tx-date').value = existingTx.date;
    document.getElementById('tx-account').value = existingTx.account;
    document.getElementById('tx-notes').value = existingTx.notes === CATEGORIES[existingTx.type][existingTx.category].name ? '' : existingTx.notes;
  } else {
    // New Mode
    document.getElementById('modal-title').textContent = '新增收支記錄';
    document.getElementById('tx-id').value = '';
    document.getElementById('type-expense').checked = true;
    populateCategoriesSelect('expense');
  }
  
  modal.classList.add('active');
  document.getElementById('tx-amount').focus();
  lucide.createIcons();
}

function editTransaction(id) {
  const tx = state.transactions.find(t => t.id === id);
  if (tx) {
    openTransactionModal(tx);
  }
}

function deleteTransaction(id) {
  if (confirm('確定要刪除這筆交易記錄嗎？')) {
    state.transactions = state.transactions.filter(t => t.id !== id);
    saveTransactions();
    renderApp();
    showToast('交易記錄已成功刪除', 'warning');
  }
}

// 8. Settings Page Handler Actions
function initSettingsActions() {
  // Export JSON
  document.getElementById('btn-export-json').addEventListener('click', () => {
    const backupData = {
      transactions: state.transactions,
      budgets: state.budgets,
      theme: state.theme,
      exportedAt: new Date().toISOString()
    };
    
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApexBudget_Backup_${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('JSON 備份檔案匯出成功！', 'success');
  });
  
  // Import JSON
  const importFile = document.getElementById('import-json-file');
  importFile.addEventListener('change', (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const reader = new FileReader();
    reader.onload = (event) => {
      try {
        const data = JSON.parse(event.target.result);
        if (data.transactions && Array.isArray(data.transactions) && data.budgets) {
          state.transactions = data.transactions;
          state.budgets = data.budgets;
          if (data.theme) state.theme = data.theme;
          
          saveTransactions();
          saveBudgets();
          localStorage.setItem('apex_budget_theme', state.theme);
          
          // Re-apply settings
          initTheme();
          renderApp();
          showToast('備份檔案載入成功，已恢復全部財務資料！', 'success');
        } else {
          showToast('備份檔案格式不正確！', 'danger');
        }
      } catch (err) {
        showToast('解析備份檔案時出錯！', 'danger');
      }
    };
    reader.readAsText(file);
    // Reset file input
    importFile.value = '';
  });
  
  // Export CSV (Transactions Tab)
  document.getElementById('btn-export-csv').addEventListener('click', () => {
    if (state.transactions.length === 0) {
      showToast('目前尚無交易資料可匯出！', 'warning');
      return;
    }
    
    let csvContent = '\uFEFF'; // UTF-8 BOM for Excel compatibility
    csvContent += '日期,交易類型,金額,分類,帳戶,說明/備註\n';
    
    state.transactions.forEach(t => {
      const typeLabel = t.type === 'income' ? '收入' : '支出';
      const catLabel = CATEGORIES[t.type][t.category]?.name || t.category;
      const accountLabel = ACCOUNT_NAMES[t.account]?.name || t.account;
      const sanitizedNotes = (t.notes || '').replace(/"/g, '""');
      
      csvContent += `"${t.date}","${typeLabel}",${t.amount},"${catLabel}","${accountLabel}","${sanitizedNotes}"\n`;
    });
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ApexBudget_Transactions_${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('CSV 報表已成功匯出！', 'success');
  });
  
  // Clear/Reset All Data
  document.getElementById('btn-reset-all').addEventListener('click', () => {
    if (confirm('警告！這將會清除您所有的帳目資料與預算設定，且無法還原！\n您確定要繼續嗎？')) {
      if (confirm('最後確認：真的要清除全部資料嗎？')) {
        localStorage.clear();
        state.transactions = [];
        state.budgets = { ...DEFAULT_BUDGETS };
        state.theme = 'dark';
        
        saveTransactions();
        saveBudgets();
        localStorage.setItem('apex_budget_theme', state.theme);
        
        initTheme();
        switchTab('dashboard');
        renderApp();
        showToast('系統已恢復為出廠初始狀態。', 'warning');
      }
    }
  });
}

// 9. Core App Rendering Coordinator
function renderApp() {
  // Update KPI Metrics (Balance, Monthly Income, Expense)
  updateKPICards();
  
  // Render based on active tabs
  if (state.currentTab === 'dashboard') {
    renderDashboard();
  } else if (state.currentTab === 'transactions') {
    renderTransactionsTab();
  } else if (state.currentTab === 'budgets') {
    renderBudgetsTab();
  }
}

// Helper to filter transactions within current month
function getCurrentMonthTransactions() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth(); // 0-indexed
  
  return state.transactions.filter(t => {
    const d = new Date(t.date);
    return d.getFullYear() === year && d.getMonth() === month;
  });
}

// Format numbers nicely to currency
function formatCurrency(amount) {
  return '$' + amount.toLocaleString('zh-TW', { minimumFractionDigits: 0, maximumFractionDigits: 2 });
}

// Update KPI totals on dashboard
function updateKPICards() {
  // 1. Total Balance (Overall historical)
  let totalBalance = 0;
  state.transactions.forEach(t => {
    if (t.type === 'income') totalBalance += t.amount;
    else totalBalance -= t.amount;
  });
  
  const balanceEl = document.getElementById('kpi-total-balance');
  balanceEl.textContent = formatCurrency(totalBalance);
  
  // Total Balance footer trend note
  const balancePercentageEl = document.getElementById('kpi-balance-percentage');
  if (totalBalance < 0) {
    balanceEl.style.color = 'hsl(var(--hue-danger), 85%, 60%)';
    balancePercentageEl.className = 'kpi-trend trend-down';
    balancePercentageEl.innerHTML = '<i data-lucide="alert-triangle"></i> 帳戶已透支，請留意';
  } else {
    balanceEl.style.color = '';
    balancePercentageEl.className = 'kpi-trend trend-neutral';
    balancePercentageEl.innerHTML = '<i data-lucide="activity"></i> 財務狀況健康';
  }
  
  // 2. Month-specific Income/Expenses
  const currentMonthTx = getCurrentMonthTransactions();
  let monthlyIncome = 0;
  let monthlyExpense = 0;
  
  currentMonthTx.forEach(t => {
    if (t.type === 'income') monthlyIncome += t.amount;
    else monthlyExpense += t.amount;
  });
  
  document.getElementById('kpi-total-income').textContent = formatCurrency(monthlyIncome);
  document.getElementById('kpi-total-expense').textContent = formatCurrency(monthlyExpense);
  
  // 3. Savings Rate
  const savingsRateEl = document.getElementById('kpi-savings-rate');
  const savingsSubtextEl = document.getElementById('kpi-savings-subtext');
  
  if (monthlyIncome > 0) {
    const savingsAmount = monthlyIncome - monthlyExpense;
    const rate = Math.round((savingsAmount / monthlyIncome) * 100);
    savingsRateEl.textContent = `${rate}%`;
    
    if (rate >= 30) {
      savingsSubtextEl.className = 'kpi-trend trend-up';
      savingsSubtextEl.innerHTML = '<i data-lucide="smile"></i> 儲蓄表現優異';
    } else if (rate >= 10) {
      savingsSubtextEl.className = 'kpi-trend trend-neutral';
      savingsSubtextEl.innerHTML = '<i data-lucide="check"></i> 達到基本儲蓄標準';
    } else {
      savingsSubtextEl.className = 'kpi-trend trend-down';
      savingsSubtextEl.innerHTML = '<i data-lucide="frown"></i> 本月支出偏高';
    }
  } else {
    savingsRateEl.textContent = '0%';
    savingsSubtextEl.className = 'kpi-trend trend-neutral';
    savingsSubtextEl.innerHTML = '本月尚無收入資料';
  }
}

// 10. Dashboard Tab Renderer
function renderDashboard() {
  // A. Render Recent Transactions (Last 5 records)
  const tbody = document.getElementById('recent-transactions-tbody');
  const emptyState = document.getElementById('transactions-empty-state');
  tbody.innerHTML = '';
  
  const recent = state.transactions.slice(0, 5);
  
  if (recent.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    recent.forEach(t => {
      const tr = document.createElement('tr');
      
      const catMeta = CATEGORIES[t.type][t.category] || { name: t.category, color: '240, 10%, 60%', icon: 'tag' };
      const accountMeta = ACCOUNT_NAMES[t.account] || { name: t.account, icon: 'credit-card' };
      
      // Category Badge CSS template
      const bg = `rgba(${catMeta.color.split(',')[0]}, ${catMeta.color.split(',')[1].trim()}, 10%, 0.12)`;
      const textCol = `hsl(${catMeta.color})`;
      const borderCol = `rgba(${catMeta.color.split(',')[0]}, ${catMeta.color.split(',')[1].trim()}, 50%, 0.2)`;
      
      tr.innerHTML = `
        <td>${t.date.substring(5)}</td>
        <td>
          <span class="tx-category-badge" style="background-color: ${bg}; color: ${textCol}; border-color: ${borderCol}">
            <i data-lucide="${catMeta.icon}" style="width: 12px; height: 12px;"></i>
            ${catMeta.name}
          </span>
        </td>
        <td>${t.notes}</td>
        <td>
          <span class="tx-account-badge">
            <i data-lucide="${accountMeta.icon}"></i>
            ${accountMeta.name}
          </span>
        </td>
        <td class="tx-amount ${t.type}">
          ${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
        </td>
        <td>
          <div class="tx-actions">
            <button class="action-btn edit-btn" onclick="editTransaction('${t.id}')" title="編輯">
              <i data-lucide="edit-3"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteTransaction('${t.id}')" title="刪除">
              <i data-lucide="trash"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  // B. Render Category Progress indicators
  renderCategoryBudgets();
  
  // C. Render Charts
  renderCharts();
  
  lucide.createIcons();
}

// Render the budget progression list on dashboard
function renderCategoryBudgets() {
  const container = document.getElementById('dashboard-budget-list');
  container.innerHTML = '';
  
  const currentMonthTx = getCurrentMonthTransactions();
  
  // Sum current month expense by categories
  const expensesByCat = {};
  for (const catKey in CATEGORIES.expense) {
    expensesByCat[catKey] = 0;
  }
  
  currentMonthTx.forEach(t => {
    if (t.type === 'expense' && expensesByCat[t.category] !== undefined) {
      expensesByCat[t.category] += t.amount;
    }
  });
  
  // Render only categories that have a budget set > 0
  let budgetsRendered = 0;
  
  for (const catKey in state.budgets) {
    const budgetVal = state.budgets[catKey];
    if (budgetVal <= 0) continue;
    
    budgetsRendered++;
    const spent = expensesByCat[catKey] || 0;
    const pct = Math.min((spent / budgetVal) * 100, 100);
    const isOver = spent > budgetVal;
    
    const catMeta = CATEGORIES.expense[catKey];
    const barColor = isOver 
      ? 'var(--gradient-danger)' 
      : `linear-gradient(90deg, hsla(${catMeta.color}, 0.8) 0%, hsla(${catMeta.color}, 1) 100%)`;
      
    const item = document.createElement('div');
    item.className = 'budget-item';
    item.innerHTML = `
      <div class="budget-info-row">
        <span class="budget-name-group">
          <span class="category-dot" style="background-color: hsl(${catMeta.color})"></span>
          ${catMeta.name}
        </span>
        <span class="budget-values">
          <span class="spent">${spent.toLocaleString()}</span> / ${budgetVal.toLocaleString()}
        </span>
      </div>
      <div class="budget-bar-container">
        <div class="budget-bar-fill" style="width: ${pct}%; background: ${barColor}"></div>
      </div>
    `;
    container.appendChild(item);
  }
  
  if (budgetsRendered === 0) {
    container.innerHTML = `
      <div class="empty-state" style="text-align: center; color: var(--text-muted); font-size: 13px; padding: 20px;">
        <p>尚未設定任何預算。請點選上方「設定預算」按鈕以追蹤您的開銷限制！</p>
      </div>
    `;
  }
}

// 11. Charts Logic
function renderCharts() {
  const isDark = document.body.classList.contains('dark-mode');
  const textColor = isDark ? '#8e9cae' : '#626e82';
  const gridColor = isDark ? 'rgba(255, 255, 255, 0.06)' : 'rgba(0, 0, 0, 0.05)';
  
  // --- A. Expense Category Doughnut Chart ---
  const currentMonthTx = getCurrentMonthTransactions();
  const expensesByCat = {};
  
  currentMonthTx.forEach(t => {
    if (t.type === 'expense') {
      const label = CATEGORIES.expense[t.category]?.name || t.category;
      expensesByCat[label] = (expensesByCat[label] || 0) + t.amount;
    }
  });
  
  const doughnutCanvas = document.getElementById('expenseCategoryChart');
  const emptyState = document.getElementById('chart-empty-state');
  
  const labels = Object.keys(expensesByCat);
  const data = Object.values(expensesByCat);
  
  if (data.length === 0) {
    doughnutCanvas.style.display = 'none';
    emptyState.classList.remove('hidden');
    if (state.categoryChart) {
      state.categoryChart.destroy();
      state.categoryChart = null;
    }
  } else {
    doughnutCanvas.style.display = 'block';
    emptyState.classList.add('hidden');
    
    // Match colors dynamically
    const backgroundColors = labels.map(label => {
      const catKey = Object.keys(CATEGORIES.expense).find(k => CATEGORIES.expense[k].name === label);
      if (catKey) {
        return `hsla(${CATEGORIES.expense[catKey].color}, 0.8)`;
      }
      return 'rgba(255,255,255,0.2)';
    });
    
    const borderColors = labels.map(label => {
      const catKey = Object.keys(CATEGORIES.expense).find(k => CATEGORIES.expense[k].name === label);
      if (catKey) {
        return `hsl(${CATEGORIES.expense[catKey].color})`;
      }
      return 'rgba(255,255,255,0.4)';
    });
    
    if (state.categoryChart) {
      state.categoryChart.destroy();
    }
    
    state.categoryChart = new Chart(doughnutCanvas, {
      type: 'doughnut',
      data: {
        labels: labels,
        datasets: [{
          data: data,
          backgroundColor: backgroundColors,
          borderColor: borderColors,
          borderWidth: 1.5,
          hoverOffset: 12
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            position: 'right',
            labels: {
              boxWidth: 12,
              font: { family: 'Inter', size: 12 },
              color: isDark ? '#e1e7f0' : '#1e2229'
            }
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                const total = context.dataset.data.reduce((a, b) => a + b, 0);
                const val = context.raw;
                const pct = Math.round((val / total) * 100);
                return ` ${context.label}: $${val.toLocaleString()} (${pct}%)`;
              }
            }
          }
        },
        cutout: '68%'
      }
    });
  }
  
  // --- B. Monthly Trend Comparison Chart ---
  const trendCanvas = document.getElementById('monthlyTrendChart');
  if (!trendCanvas) return;
  
  // Calculate aggregate values for the last 6 months
  const monthsData = [];
  const now = new Date();
  
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    monthsData.push({
      year: d.getFullYear(),
      month: d.getMonth(),
      label: `${d.getFullYear()}/${d.getMonth() + 1}`,
      income: 0,
      expense: 0
    });
  }
  
  state.transactions.forEach(t => {
    const td = new Date(t.date);
    const ty = td.getFullYear();
    const tm = td.getMonth();
    
    const match = monthsData.find(m => m.year === ty && m.month === tm);
    if (match) {
      if (t.type === 'income') match.income += t.amount;
      else match.expense += t.amount;
    }
  });
  
  const labelsTrend = monthsData.map(m => m.label);
  const incomeData = monthsData.map(m => m.income);
  const expenseData = monthsData.map(m => m.expense);
  
  if (state.trendChart) {
    state.trendChart.destroy();
  }
  
  state.trendChart = new Chart(trendCanvas, {
    type: 'bar',
    data: {
      labels: labelsTrend,
      datasets: [
        {
          label: '月度總收入',
          data: incomeData,
          backgroundColor: isDark ? 'rgba(16, 185, 129, 0.75)' : 'rgba(16, 185, 129, 0.85)',
          borderColor: '#10b981',
          borderWidth: 1.5,
          borderRadius: 4
        },
        {
          label: '月度總支出',
          data: expenseData,
          backgroundColor: isDark ? 'rgba(244, 63, 94, 0.75)' : 'rgba(244, 63, 94, 0.85)',
          borderColor: '#f43f5e',
          borderWidth: 1.5,
          borderRadius: 4
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        x: {
          grid: { display: false },
          ticks: { color: textColor, font: { family: 'Inter' } }
        },
        y: {
          grid: { color: gridColor },
          ticks: {
            color: textColor,
            font: { family: 'Inter' },
            callback: function(value) {
              return '$' + value.toLocaleString();
            }
          }
        }
      },
      plugins: {
        legend: {
          labels: {
            font: { family: 'Inter' },
            color: isDark ? '#e1e7f0' : '#1e2229'
          }
        }
      }
    }
  });
}

// 12. Transactions Tab Renderer
function renderTransactionsTab() {
  const tbody = document.getElementById('all-transactions-tbody');
  const emptyState = document.getElementById('all-transactions-empty-state');
  tbody.innerHTML = '';
  
  // Set up Filter select values on load
  const catFilter = document.getElementById('tx-filter-category');
  if (catFilter.options.length <= 1) { // If only "All" exists, populate
    catFilter.innerHTML = '<option value="all">所有分類</option>';
    
    // Add expenses categories
    const expGroup = document.createElement('optgroup');
    expGroup.label = '支出分類';
    for (const key in CATEGORIES.expense) {
      const opt = document.createElement('option');
      opt.value = `expense:${key}`;
      opt.textContent = CATEGORIES.expense[key].name;
      expGroup.appendChild(opt);
    }
    catFilter.appendChild(expGroup);
    
    // Add income categories
    const incGroup = document.createElement('optgroup');
    incGroup.label = '收入分類';
    for (const key in CATEGORIES.income) {
      const opt = document.createElement('option');
      opt.value = `income:${key}`;
      opt.textContent = CATEGORIES.income[key].name;
      incGroup.appendChild(opt);
    }
    catFilter.appendChild(incGroup);
  }
  
  // Read Filters
  const query = document.getElementById('tx-search').value.toLowerCase().trim();
  const typeFilter = document.getElementById('tx-filter-type').value;
  const categoryFilterVal = document.getElementById('tx-filter-category').value;
  const accountFilter = document.getElementById('tx-filter-account').value;
  
  // Filter transactions
  const filtered = state.transactions.filter(t => {
    // Search query matches notes/memo
    if (query && !t.notes.toLowerCase().includes(query)) return false;
    
    // Type Filter
    if (typeFilter !== 'all' && t.type !== typeFilter) return false;
    
    // Category Filter (format is e.g. "expense:food" or "all")
    if (categoryFilterVal !== 'all') {
      const [fType, fCat] = categoryFilterVal.split(':');
      if (t.type !== fType || t.category !== fCat) return false;
    }
    
    // Account Filter
    if (accountFilter !== 'all' && t.account !== accountFilter) return false;
    
    return true;
  });
  
  // Event listeners on inputs (only bind once)
  if (!tbody.dataset.listenersBound) {
    const bindFilter = (id) => {
      document.getElementById(id).addEventListener('input', renderTransactionsTab);
    };
    bindFilter('tx-search');
    bindFilter('tx-filter-type');
    bindFilter('tx-filter-category');
    bindFilter('tx-filter-account');
    tbody.dataset.listenersBound = 'true';
  }
  
  if (filtered.length === 0) {
    emptyState.classList.remove('hidden');
  } else {
    emptyState.classList.add('hidden');
    
    filtered.forEach(t => {
      const tr = document.createElement('tr');
      
      const catMeta = CATEGORIES[t.type][t.category] || { name: t.category, color: '240, 10%, 60%', icon: 'tag' };
      const accountMeta = ACCOUNT_NAMES[t.account] || { name: t.account, icon: 'credit-card' };
      
      // Dynamic styles for Category Badges
      const bg = `rgba(${catMeta.color.split(',')[0]}, ${catMeta.color.split(',')[1].trim()}, 10%, 0.12)`;
      const textCol = `hsl(${catMeta.color})`;
      const borderCol = `rgba(${catMeta.color.split(',')[0]}, ${catMeta.color.split(',')[1].trim()}, 50%, 0.2)`;
      
      tr.innerHTML = `
        <td>${t.date}</td>
        <td>
          <span class="tx-category-badge" style="background-color: ${bg}; color: ${textCol}; border-color: ${borderCol}">
            <i data-lucide="${catMeta.icon}" style="width: 12px; height: 12px;"></i>
            ${catMeta.name}
          </span>
        </td>
        <td>${t.notes}</td>
        <td>
          <span class="tx-account-badge">
            <i data-lucide="${accountMeta.icon}"></i>
            ${accountMeta.name}
          </span>
        </td>
        <td class="tx-amount ${t.type}">
          ${t.type === 'income' ? '+' : '-'}${t.amount.toLocaleString()}
        </td>
        <td>
          <div class="tx-actions">
            <button class="action-btn edit-btn" onclick="editTransaction('${t.id}')" title="編輯">
              <i data-lucide="edit-3"></i>
            </button>
            <button class="action-btn delete-btn" onclick="deleteTransaction('${t.id}')" title="刪除">
              <i data-lucide="trash"></i>
            </button>
          </div>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }
  
  lucide.createIcons();
}

// 13. Budgets Tab Renderer
function renderBudgetsTab() {
  const inputsContainer = document.getElementById('budget-settings-inputs');
  inputsContainer.innerHTML = '';
  
  for (const catKey in CATEGORIES.expense) {
    const cat = CATEGORIES.expense[catKey];
    const budgetVal = state.budgets[catKey] || 0;
    
    const row = document.createElement('div');
    row.className = 'budget-input-row';
    row.innerHTML = `
      <label class="budget-input-label">
        <span class="category-dot" style="background-color: hsl(${cat.color})"></span>
        ${cat.name}
      </label>
      <div class="budget-input-field">
        <span>$</span>
        <input type="number" id="budget-${catKey}" min="0" placeholder="未設定預算" value="${budgetVal || ''}">
      </div>
    `;
    inputsContainer.appendChild(row);
  }
  
  // Render analytical comparison charts
  renderCharts();
}

// 14. Toast/Notification Alert Controller
function showToast(message, type = 'info') {
  const container = document.getElementById('toast-container');
  
  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;
  
  const icons = {
    success: 'check-circle',
    danger: 'alert-octagon',
    warning: 'alert-triangle',
    info: 'info'
  };
  
  const iconName = icons[type] || 'info';
  
  toast.innerHTML = `
    <div class="toast-icon">
      <i data-lucide="${iconName}"></i>
    </div>
    <div class="toast-content">${message}</div>
  `;
  
  container.appendChild(toast);
  lucide.createIcons();
  
  // Slide out after 3s
  setTimeout(() => {
    toast.classList.add('removing');
    // Remove element completely after animation completes
    toast.addEventListener('animationend', () => {
      toast.remove();
    });
  }, 3500);
}

// Expose functions to global window object for inline HTML onclick attributes
window.editTransaction = editTransaction;
window.deleteTransaction = deleteTransaction;

// 15. Mobile Menu Controller
function initMobileMenu() {
  const hamburgerBtn = document.getElementById('btn-hamburger');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.getElementById('sidebar-overlay');
  
  if (!hamburgerBtn || !sidebar || !overlay) return;
  
  const toggleMenu = () => {
    sidebar.classList.toggle('active');
    overlay.classList.toggle('active');
    
    // Change hamburger icon dynamically
    const icon = hamburgerBtn.querySelector('i');
    if (sidebar.classList.contains('active')) {
      icon.setAttribute('data-lucide', 'x');
    } else {
      icon.setAttribute('data-lucide', 'menu');
    }
    lucide.createIcons();
  };
  
  const closeMenu = () => {
    sidebar.classList.remove('active');
    overlay.classList.remove('active');
    const icon = hamburgerBtn.querySelector('i');
    icon.setAttribute('data-lucide', 'menu');
    lucide.createIcons();
  };
  
  hamburgerBtn.addEventListener('click', toggleMenu);
  overlay.addEventListener('click', closeMenu);
  
  // Close menu when clicking navigation items
  document.querySelectorAll('.sidebar-nav .nav-item').forEach(item => {
    item.addEventListener('click', closeMenu);
  });
}
