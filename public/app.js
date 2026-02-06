const API_URL = '/api';

// State
let currentUserId = localStorage.getItem('expenseTrackerUserId');
let currentUser = null;
let currentPage = 1;
const itemsPerPage = 5;

// DOM Utility
const $ = (id) => document.getElementById(id);

// UI Elements
const ui = {
    authSection: $('auth-section'),
    dashboardSection: $('dashboard-section'),
    registerView: $('register-view'),
    loginView: $('login-view'),
    errorContainer: $('error-container'),
    
    // Auth Forms
    registerForm: $('register-form'),
    loginForm: $('login-form'),
    showLoginBtn: $('show-login-btn'),
    showRegisterBtn: $('show-register-btn'),
    
    // Dashboard
    userGreeting: $('user-greeting'),
    logoutBtn: $('logout-btn'),
    
    // Stats
    statBudget: $('stat-budget'),
    statSpent: $('stat-spent'),
    statRemaining: $('stat-remaining'),
    
    // Expense Form
    expenseForm: $('expense-form'),
    expTitle: $('exp-title'),
    expAmount: $('exp-amount'),
    expCategory: $('exp-category'),
    expDate: $('exp-date'),
    
    // List
    expensesList: $('expenses-list'),
    expenseCount: $('expense-count'),
    
    // Pagination
    paginationControls: $('pagination-controls'),
    prevBtn: $('prev-btn'),
    nextBtn: $('next-btn'),
    pageInfo: $('page-info')
};

// Initialize
init();

function init() {
    // Event Listeners
    setupEventListeners();
    
    // Check Auth
    if (currentUserId) {
        loadUser(currentUserId);
    } else {
        showAuth();
    }

    // Set default date
    ui.expDate.valueAsDate = new Date();
}

function setupEventListeners() {
    // Auth Toggles
    ui.showLoginBtn.addEventListener('click', () => {
        ui.registerView.classList.add('hidden');
        ui.loginView.classList.remove('hidden');
        clearError();
    });

    ui.showRegisterBtn.addEventListener('click', () => {
        ui.loginView.classList.add('hidden');
        ui.registerView.classList.remove('hidden');
        clearError();
    });

    // Forms
    ui.registerForm.addEventListener('submit', handleRegister);
    ui.loginForm.addEventListener('submit', handleLogin);
    ui.expenseForm.addEventListener('submit', handleAddExpense);
    ui.logoutBtn.addEventListener('click', handleLogout);
    
    ui.prevBtn.addEventListener('click', () => changePage(-1));
    ui.nextBtn.addEventListener('click', () => changePage(1));
}

// --- Auth Actions ---

async function handleRegister(e) {
    e.preventDefault();
    clearError();

    const name = $('reg-name').value;
    const email = $('reg-email').value;
    const monthlyBudget = parseFloat($('reg-budget').value) || 0;

    try {
        const res = await fetch(`${API_URL}/users`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ name, email, monthlyBudget })
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || 'Registration failed');
        
        loginUser(data.data._id);
    } catch (err) {
        showError(err.message);
    }
}

async function handleLogin(e) {
    e.preventDefault();
    clearError();
    
    const userId = $('login-id').value.trim();
    if (!userId) return showError('Please enter a User ID');
    
    loginUser(userId);
}

function handleLogout() {
    localStorage.removeItem('expenseTrackerUserId');
    currentUserId = null;
    currentUser = null;
    showAuth();
}

function loginUser(id) {
    currentUserId = id;
    localStorage.setItem('expenseTrackerUserId', id);
    loadUser(id);
}

async function loadUser(id) {
    try {
        const res = await fetch(`${API_URL}/users/${id}`);
        const data = await res.json();
        
        if (!res.ok) {
            if (res.status === 404 || res.status === 400) {
                // Invalid ID, logout
                handleLogout();
                showError('User not found. Please log in again.');
                return;
            }
            throw new Error(data.message || 'Failed to load user');
        }
        
        currentUser = data.data;
        showDashboard();
        refreshDashboard();
    } catch (err) {
        showError(err.message);
        showAuth();
    }
}

// --- Dashboard Actions ---

async function refreshDashboard() {
    if (!currentUserId) return;
    
    ui.userGreeting.textContent = `Hello, ${currentUser.name}`;
    
    try {
        // Fetch Summary
        const summaryRes = await fetch(`${API_URL}/users/${currentUserId}/summary`);
        const summaryData = await summaryRes.json();
        if (summaryData.success) {
            updateStats(summaryData.data);
        }
        
        // Fetch Expenses
        const expRes = await fetch(`${API_URL}/users/${currentUserId}/expenses?page=${currentPage}&limit=${itemsPerPage}`);
        const expData = await expRes.json();
        if (expData.success) {
            renderExpenses(expData.data);
            renderPagination(expData.pagination);
        }
    } catch (err) {
        console.error('Failed to refresh dashboard', err);
    }
}

async function handleAddExpense(e) {
    e.preventDefault();
    clearError();
    
    const title = ui.expTitle.value;
    const amount = parseFloat(ui.expAmount.value);
    const category = ui.expCategory.value;
    const date = ui.expDate.value;
    
    try {
        const res = await fetch(`${API_URL}/expenses`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                userId: currentUserId,
                title,
                amount,
                category,
                date
            })
        });
        
        const data = await res.json();
        
        if (!res.ok) throw new Error(data.message || 'Failed to add expense');
        
        // Success
        ui.expenseForm.reset();
        ui.expDate.valueAsDate = new Date();
        currentPage = 1; // Reset to first page to see new expense
        refreshDashboard();
        
    } catch (err) {
        showError(err.message);
    }
}

// --- UI Rendering ---

function showAuth() {
    ui.dashboardSection.classList.add('hidden');
    ui.authSection.classList.remove('hidden');
}

function showDashboard() {
    ui.authSection.classList.add('hidden');
    ui.dashboardSection.classList.remove('hidden');
}

function updateStats(summary) {
    ui.statBudget.textContent = formatMoney(summary.monthlyBudget);
    ui.statSpent.textContent = formatMoney(summary.totalExpenses);
    
    const remaining = summary.remainingBudget;
    ui.statRemaining.textContent = formatMoney(remaining);
    
    // Color coding
    ui.statRemaining.className = 'stat-value';
    if (remaining < 0) {
        ui.statRemaining.classList.add('negative');
    } else {
        ui.statRemaining.classList.add('positive');
    }
}

function renderExpenses(expenses) {
    ui.expensesList.innerHTML = '';
    
    if (expenses.length === 0) {
        ui.expensesList.innerHTML = '<li style="text-align:center; color:#888; padding: 20px;">No transactions yet.</li>';
        return;
    }
    
    expenses.forEach(exp => {
        const item = document.createElement('li');
        item.className = 'expense-item';
        
        const date = new Date(exp.date).toLocaleDateString();
        
        item.innerHTML = `
            <div class="expense-info">
                <h4>${exp.title}</h4>
                <div class="expense-meta">${exp.category} • ${date}</div>
            </div>
            <div class="expense-amount">-$${exp.amount.toFixed(2)}</div>
        `;
        
        ui.expensesList.appendChild(item);
    });
}

function formatMoney(amount) {
    return new Intl.NumberFormat('en-IN', {
        style: 'currency',
        currency: 'INR'
    }).format(amount);
}

function showError(msg) {
    ui.errorContainer.textContent = msg;
    ui.errorContainer.classList.remove('hidden');
    setTimeout(() => {
        ui.errorContainer.classList.add('hidden');
    }, 5000);
}

function clearError() {
    ui.errorContainer.classList.add('hidden');
    ui.errorContainer.textContent = '';
}

function changePage(delta) {
    currentPage += delta;
    refreshDashboard();
}

function renderPagination(pagination) {
    // Update count regardless of pagination visibility
    if (ui.expenseCount && pagination) {
        ui.expenseCount.textContent = `(${pagination.totalExpenses || 0})`;
    }

    if (!pagination || pagination.totalPages <= 1) {
        ui.paginationControls.classList.add('hidden');
        return;
    }
    
    ui.paginationControls.classList.remove('hidden');
    ui.pageInfo.textContent = `Page ${pagination.currentPage} of ${pagination.totalPages}`;
    
    ui.prevBtn.disabled = !pagination.hasPrevPage;
    ui.nextBtn.disabled = !pagination.hasNextPage;
    
    // Visual feedback for disabled buttons
    ui.prevBtn.style.opacity = !pagination.hasPrevPage ? '0.5' : '1';
    ui.nextBtn.style.opacity = !pagination.hasNextPage ? '0.5' : '1';
    ui.prevBtn.style.cursor = !pagination.hasPrevPage ? 'not-allowed' : 'pointer';
    ui.nextBtn.style.cursor = !pagination.hasNextPage ? 'not-allowed' : 'pointer';
}

