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
                <button class="script-copy-btn" onclick="copyScript('${script.slug}', '${(script.script || '').replace(/'/g, "\\'")}')">
                    <span>📋</span>
                    <span>نسخ السكربت</span>
                </button>
            </div>
        </div>
    `;
}

// Copy script to clipboard
function copyScript(slug, scriptCode) {
    console.log('copyScript called with slug:', slug);
    
    // If script code exists and is not empty, copy it directly
    // Otherwise, create loadstring code
    let codeToClip = scriptCode;
    
    if (!codeToClip || codeToClip.trim() === '') {
        codeToClip = 'loadstring(game:HttpGet("https://scriptblox.com/api/script/fetch?slug=' + slug + '"))()';
    }
    
    console.log('Code to copy:', codeToClip.substring(0, 50) + '...');
    
    // Try using the modern clipboard API
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(codeToClip).then(function() {
            console.log('Clipboard API succeeded');
            showNotification('✅ تم نسخ السكربت! الصق الكود في Roblox', 'success');
        }).catch(function(err) {
            console.error('Clipboard API error:', err);
            // Fallback to old method
            fallbackCopyToClipboard(codeToClip);
        });
    } else {
        // Use fallback method
        console.log('Using fallback copy method');
        fallbackCopyToClipboard(codeToClip);
    }
}

// Fallback copy method
function fallbackCopyToClipboard(text) {
    console.log('Fallback copy method called');
    
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    textarea.style.left = '-9999px';
    textarea.style.top = '-9999px';
    document.body.appendChild(textarea);
    
    try {
        textarea.select();
        const successful = document.execCommand('copy');
        
        if (successful) {
            console.log('Fallback copy succeeded');
            showNotification('✅ تم نسخ السكربت! الصق الكود في Roblox', 'success');
        } else {
            console.error('Fallback copy failed');
            showNotification('❌ حدث خطأ في النسخ', 'error');
        }
    } catch (err) {
        console.error('Fallback copy error:', err);
        showNotification('❌ حدث خطأ في النسخ', 'error');
    }
    
    document.body.removeChild(textarea);
}

// Show notification
function showNotification(message, type) {
    if (!type) type = 'info';
    
    console.log('showNotification called:', message, type);
    
    const notification = document.createElement('div');
    
    let bgColor = '#10b981';
    if (type === 'error') {
        bgColor = '#ef4444';
    } else if (type === 'success') {
        bgColor = '#10b981';
    }
    
    notification.style.position = 'fixed';
    notification.style.top = '20px';
    notification.style.right = '20px';
    notification.style.backgroundColor = bgColor;
    notification.style.color = 'white';
    notification.style.padding = '1rem 1.5rem';
    notification.style.borderRadius = '0.5rem';
    notification.style.zIndex = '9999';
    notification.style.maxWidth = '350px';
    notification.style.wordWrap = 'break-word';
    notification.style.boxShadow = '0 4px 12px rgba(0, 0, 0, 0.3)';
    notification.style.fontWeight = '500';
    notification.style.fontSize = '1rem';
    notification.style.animation = 'slideIn 0.3s ease';
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    console.log('Notification element added to DOM');
    
    setTimeout(function() {
        notification.style.animation = 'slideOut 0.3s ease';
        setTimeout(function() {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
                console.log('Notification removed from DOM');
            }
        }, 300);
    }, 3000);
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
function fetchFeaturedScripts() {
    try {
        showLoading();
        fetch('https://scriptblox.com/api/script/fetch')
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('فشل في جلب البيانات');
                }
                return response.json();
            })
            .then(function(data) {
                const scriptList = data.result && data.result.scripts ? data.result.scripts : [];
                
                if (scriptList.length > 0) {
                    displayScripts(scriptList.slice(0, 12), false);
                } else {
                    showEmptyState();
                }
            })
            .catch(function(error) {
                console.error('Error fetching featured scripts:', error);
                showEmptyState();
            });
    } catch (error) {
        console.error('Error in fetchFeaturedScripts:', error);
        showEmptyState();
    }
}

// Handle search
function handleSearch(e) {
    e.preventDefault();
    
    const query = searchInput.value.trim();
    
    if (!query) {
        showNotification('الرجاء إدخال كلمة بحث', 'error');
        return;
    }

    showLoading();
    isSearched = true;

    try {
        fetch('https://scriptblox.com/api/script/search?q=' + encodeURIComponent(query))
            .then(function(response) {
                if (!response.ok) {
                    throw new Error('فشل في جلب البيانات');
                }
                return response.json();
            })
            .then(function(data) {
                const scriptList = data.result && data.result.scripts ? data.result.scripts : [];
                
                if (scriptList.length === 0) {
                    showNotification('لم يتم العثور على نتائج', 'info');
                    showNoResults();
                    resultsTitle.textContent = 'نتائج البحث';
                    resultsCount.textContent = '';
                } else {
                    displayScripts(scriptList, true);
                    resultsTitle.textContent = 'نتائج البحث';
                    resultsCount.textContent = 'تم العثور على ' + scriptList.length + ' سكربت';
                    showNotification('تم العثور على ' + scriptList.length + ' سكربت', 'success');
                }
            })
            .catch(function(error) {
                console.error('Error fetching scripts:', error);
                showNotification('حدث خطأ أثناء البحث', 'error');
                showNoResults();
            });
    } catch (error) {
        console.error('Error in handleSearch:', error);
        showNotification('حدث خطأ أثناء البحث', 'error');
        showNoResults();
    }
}

// Display scripts
function displayScripts(scripts, isSearch) {
    hideLoading();
    scriptsGrid.innerHTML = scripts.map(function(script) {
        return createScriptCard(script);
    }).join('');
    showScriptsGrid();
    
    if (!isSearch) {
        resultsTitle.textContent = 'السكربتات المميزة';
        resultsCount.textContent = scripts.length + ' سكربت مميز';
    }
}

// Initialize on page load
document.addEventListener('DOMContentLoaded', function() {
    console.log('Page loaded, fetching featured scripts');
    fetchFeaturedScripts();
});
