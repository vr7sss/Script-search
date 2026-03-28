// ===== DOM Elements =====
const searchForm = document.getElementById('searchForm');
const searchInput = document.getElementById('searchInput');
const scriptsGrid = document.getElementById('scriptsGrid');
const loading = document.getElementById('loading');
const noResults = document.getElementById('noResults');
const emptyState = document.getElementById('emptyState');
const resultsTitle = document.getElementById('resultsTitle');
const resultsCount = document.getElementById('resultsCount');

// ===== State =====
let isSearched = false;

// ===== Event Listeners =====
searchForm.addEventListener('submit', handleSearch);

// ===== Functions =====

// Format date to Arabic
function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ar-SA');
}

// Show loading state
function showLoading() {
    loading.classList.remove('hidden');
    noResults.classList.add('hidden');
    emptyState.classList.add('hidden');
    scriptsGrid.classList.add('hidden');
}

// Hide loading state
function hideLoading() {
    loading.classList.add('hidden');
}

// Show no results
function showNoResults() {
    noResults.classList.remove('hidden');
    loading.classList.add('hidden');
    emptyState.classList.add('hidden');
    scriptsGrid.classList.add('hidden');
}

// Show empty state
function showEmptyState() {
    emptyState.classList.remove('hidden');
    loading.classList.add('hidden');
    noResults.classList.add('hidden');
    scriptsGrid.classList.add('hidden');
}

// Show scripts grid
function showScriptsGrid() {
    scriptsGrid.classList.remove('hidden');
    loading.classList.add('hidden');
    noResults.classList.add('hidden');
    emptyState.classList.add('hidden');
}

// Create script card HTML
function createScriptCard(script) {
    const badges = [];
    
    if (script.verified) {
        badges.push('<div class="badge-item badge-verified">✅ موثق</div>');
    }
    if (script.key) {
        badges.push('<div class="badge-item badge-key">🔐 مفتاح</div>');
    }
    if (script.isUniversal) {
        badges.push('<div class="badge-item badge-universal">🌍 عام</div>');
    }
    if (script.isPatched) {
        badges.push('<div class="badge-item badge-patched">⚙️ معدل</div>');
    }

    const keyBanner = script.key ? 
        '<div class="script-key-banner">🔐 يحتاج إلى مفتاح</div>' : '';

    const keyWarning = script.key ?
        '<div class="script-key-warning">⚠️ يتطلب مفتاح للاستخدام</div>' : '';

    const imageUrl = script.image || script.game?.imageUrl || 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100"%3E%3Crect fill="%23334155" width="100" height="100"/%3E%3C/svg%3E';

    return `
        <div class="script-card">
            <div style="position: relative; overflow: hidden;">
                <img src="${imageUrl}" alt="${script.title}" class="script-image" onerror="this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 viewBox=%220 0 100 100%22%3E%3Crect fill=%22%23334155%22 width=%22100%22 height=%22100%22/%3E%3C/svg%3E'">
                <div class="script-badges">
                    ${badges.join('')}
                </div>
                ${keyBanner}
            </div>
            <div class="script-content">
                ${script.game ? `<div class="script-game">${script.game.name}</div>` : ''}
                <h3 class="script-title">${script.title}</h3>
                <p class="script-type">${script.scriptType}</p>
                <div class="script-stats">
                    <div class="script-stat">
                        <span>👁️</span>
                        <span>${script.views.toLocaleString('ar-SA')}</span>
                    </div>
                    <div class="script-stat">
                        <span>📅</span>
                        <span>${formatDate(script.createdAt)}</span>
                    </div>
                </div>
                ${keyWarning}
                <button class="script-copy-btn" onclick="copyScript('${script.slug}', '${script.script || ''}')">
                    <span>📋</span>
                    <span>نسخ السكربت</span>
                </button>
            </div>
        </div>
    `;
}

// Copy script to clipboard
function copyScript(slug, scriptCode) {
    // If script code exists, copy it directly
    // Otherwise, create loadstring code
    const codeToClip = scriptCode || `loadstring(game:HttpGet("https://scriptblox.com/api/script/fetch?slug=${slug}"))()`;
    
    navigator.clipboard.writeText(codeToClip).then(() => {
        showNotification('تم نسخ السكربت! الصق الكود في Roblox', 'success');
    }).catch(() => {
        showNotification('حدث خطأ في النسخ', 'error');
    });
}

// Show notification
function showNotification(message, type = 'info') {
    const notification = document.createElement('div');
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        background-color: ${type === 'success' ? '#10b981' : type === 'error' ? '#ef4444' : '#06b6d4'};
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        z-index: 1000;
        animation: slideIn 0.3s ease;
        max-width: 300px;
        word-wrap: break-word;
    `;
    notification.textContent = message;
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 2000);
}

// Add animation styles
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(100%);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// Fetch featured scripts on page load
async function fetchFeaturedScripts() {
    try {
        showLoading();
        const response = await fetch('https://scriptblox.com/api/script/fetch');
        
        if (!response.ok) {
            throw new Error('فشل في جلب البيانات');
        }

        const data = await response.json();
        const scriptList = data.result?.scripts || [];
        
        if (scriptList.length > 0) {
            displayScripts(scriptList.slice(0, 12), false);
        } else {
            showEmptyState();
        }
    } catch (error) {
        console.error('Error fetching featured scripts:', error);
        showEmptyState();
    }
}

// Handle search
async function handleSearch(e) {
    e.preventDefault();
    
    const query = searchInput.value.trim();
    
    if (!query) {
        showNotification('الرجاء إدخال كلمة بحث', 'error');
        return;
    }

    showLoading();
    isSearched = true;

    try {
        const response = await fetch(
            `https://scriptblox.com/api/script/search?q=${encodeURIComponent(query)}`
        );
        
        if (!response.ok) {
            throw new Error('فشل في جلب البيانات');
        }

        const data = await response.json();
        const scriptList = data.result?.scripts || [];
        
        if (scriptList.length === 0) {
            showNotification('لم يتم العثور على نتائج', 'info');
            showNoResults();
            resultsTitle.textContent = 'نتائج البحث';
            resultsCount.textContent = '';
        } else {
            displayScripts(scriptList, true);
            resultsTitle.textContent = 'نتائج البحث';
            resultsCount.textContent = `تم العثور على ${scriptList.length} سكربت`;
            showNotification(`تم العثور على ${scriptList.length} سكربت`, 'success');
        }
    } catch (error) {
        console.error('Error fetching scripts:', error);
        showNotification('حدث خطأ أثناء البحث', 'error');
        showNoResults();
    }
}

// Display scripts
function displayScripts(scripts, isSearch) {
    hideLoading();
    scriptsGrid.innerHTML = scripts.map(script => createScriptCard(script)).join('');
    showScriptsGrid();
    
    if (!isSearch) {
        resultsTitle.textContent = 'السكربتات المميزة';
        resultsCount.textContent = `${scripts.length} سكربت مميز`;
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', () => {
    fetchFeaturedScripts();
});
