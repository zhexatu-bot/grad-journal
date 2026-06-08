(function () {
    'use strict';

    const CATEGORIES = ['论文', '实验', '代码', '组会', '项目', '其他'];
    const CATEGORY_ICONS = { '论文': '📄', '实验': '🔬', '代码': '💻', '组会': '👥', '项目': '📁', '其他': '📌' };

    let currentView = 'dashboard';
    let currentCategory = '';
    let currentTag = '';
    let currentSearch = '';
    let editingId = null;

    // API helpers
    async function api(path, opts = {}) {
        const res = await fetch(path, {
            headers: { 'Content-Type': 'application/json' },
            ...opts,
        });
        if (opts.raw) return res;
        return res.json();
    }

    // Views
    function showView(name) {
        document.getElementById('dashboard-view').style.display = name === 'dashboard' ? '' : 'none';
        document.getElementById('record-list-view').style.display = name === 'list' ? '' : 'none';
        document.getElementById('record-detail-view').style.display = name === 'detail' ? '' : 'none';
        document.getElementById('record-form-view').style.display = name === 'form' ? '' : 'none';
        currentView = name;
    }

    // Dashboard
    async function loadDashboard() {
        showView('dashboard');
        const stats = await api('/api/stats');

        const cardsHtml = `
            <div class="stat-card">
                <div class="stat-number">${stats.total}</div>
                <div class="stat-label">总记录数</div>
            </div>
            ${stats.by_category.map(c => `
                <div class="stat-card">
                    <div class="stat-number">${c.count}</div>
                    <div class="stat-label">${CATEGORY_ICONS[c.category] || ''} ${c.category}</div>
                </div>
            `).join('')}
        `;
        document.getElementById('stats-cards').innerHTML = cardsHtml;

        const maxCount = Math.max(1, ...stats.by_month.map(m => m.count));
        const monthHtml = stats.by_month.map(m => `
            <div class="month-row">
                <span class="month-label">${m.month}</span>
                <div class="month-bar-bg">
                    <div class="month-bar" style="width:${(m.count / maxCount * 100)}%"></div>
                </div>
                <span class="month-count">${m.count}</span>
            </div>
        `).join('');
        document.getElementById('month-chart').innerHTML = monthHtml || '<p style="color:#999">暂无数据</p>';

        document.getElementById('badge-all').textContent = stats.total;

        // Update category nav
        const catHtml = CATEGORIES.map(cat => {
            const found = stats.by_category.find(c => c.category === cat);
            const count = found ? found.count : 0;
            return `
                <div class="nav-item${currentCategory === cat ? ' active' : ''}" data-category="${cat}">
                    <span>${CATEGORY_ICONS[cat] || ''} ${cat}</span>
                    <span class="badge">${count}</span>
                </div>
            `;
        }).join('');
        document.getElementById('category-list').innerHTML = catHtml;

        // Update tag cloud
        const tagHtml = stats.tags.map(t => `
            <span class="tag-item${currentTag === t.name ? ' active' : ''}" data-tag="${t.name}">${t.name} (${t.count})</span>
        `).join('');
        document.getElementById('tag-cloud').innerHTML = tagHtml || '<span style="color:#999;font-size:13px">暂无标签</span>';
    }

    // Record list
    async function loadRecords() {
        showView('list');
        const params = new URLSearchParams();
        if (currentSearch) params.set('search', currentSearch);
        if (currentCategory) params.set('category', currentCategory);
        if (currentTag) params.set('tag', currentTag);
        const records = await api('/api/records?' + params.toString());

        let title = '全部记录';
        if (currentCategory) title = currentCategory;
        else if (currentTag) title = '标签: ' + currentTag;
        else if (currentSearch) title = '搜索: ' + currentSearch;
        document.getElementById('list-title').textContent = title;

        const listEl = document.getElementById('record-list');
        const emptyEl = document.getElementById('empty-state');

        if (records.length === 0) {
            listEl.innerHTML = '';
            emptyEl.style.display = '';
        } else {
            emptyEl.style.display = 'none';
            listEl.innerHTML = records.map(r => {
                const tags = r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
                const excerpt = r.content.replace(/[#*`>\[\]()!_~\-]/g, '').substring(0, 120);
                return `
                    <div class="record-card" data-id="${r.id}">
                        <div class="record-card-header">
                            <span class="record-card-title">${escapeHtml(r.title)}</span>
                            <span class="record-card-date">${r.record_date}</span>
                        </div>
                        <div class="record-card-meta">
                            <span class="category-badge">${CATEGORY_ICONS[r.category] || ''} ${r.category}</span>
                            <div class="record-card-tags">
                                ${tags.map(t => `<span class="tag-item">${escapeHtml(t)}</span>`).join('')}
                            </div>
                        </div>
                        ${excerpt ? `<div class="record-card-excerpt">${escapeHtml(excerpt)}</div>` : ''}
                    </div>
                `;
            }).join('');
        }
    }

    // Record detail
    async function loadDetail(id) {
        showView('detail');
        const r = await api('/api/records/' + id);
        if (!r || r.error) {
            showView('list');
            return;
        }
        const tags = r.tags ? r.tags.split(',').map(t => t.trim()).filter(Boolean) : [];
        document.getElementById('record-detail').innerHTML = `
            <h2 class="detail-title">${escapeHtml(r.title)}</h2>
            <div class="detail-meta">
                <span class="category-badge">${CATEGORY_ICONS[r.category] || ''} ${r.category}</span>
                <span>${r.record_date}</span>
                ${tags.map(t => `<span class="tag-item">${escapeHtml(t)}</span>`).join('')}
            </div>
            <div class="detail-body">${renderMarkdown(r.content)}</div>
        `;
        document.getElementById('btn-edit').onclick = () => openForm(r);
        document.getElementById('btn-delete').onclick = () => deleteRecord(id);
    }

    // Form
    function openForm(record = null) {
        showView('form');
        editingId = record ? record.id : null;
        document.getElementById('form-title').textContent = record ? '编辑记录' : '新建记录';
        document.getElementById('field-title').value = record ? record.title : '';
        document.getElementById('field-category').value = record ? record.category : '其他';
        document.getElementById('field-tags').value = record ? record.tags : '';
        document.getElementById('field-date').value = record ? record.record_date : new Date().toISOString().slice(0, 10);
        document.getElementById('field-content').value = record ? record.content : '';
    }

    async function saveRecord() {
        const title = document.getElementById('field-title').value.trim();
        if (!title) { alert('请输入标题'); return; }
        const data = {
            title,
            category: document.getElementById('field-category').value,
            tags: document.getElementById('field-tags').value,
            record_date: document.getElementById('field-date').value,
            content: document.getElementById('field-content').value,
        };
        if (editingId) {
            await api('/api/records/' + editingId, { method: 'PUT', body: JSON.stringify(data) });
        } else {
            await api('/api/records', { method: 'POST', body: JSON.stringify(data) });
        }
        await loadDashboard();
    }

    async function deleteRecord(id) {
        if (!confirm('确定删除这条记录吗？')) return;
        await api('/api/records/' + id, { method: 'DELETE' });
        await loadDashboard();
    }

    // Simple Markdown renderer
    function renderMarkdown(text) {
        if (!text) return '';
        let html = escapeHtml(text);

        // Code blocks
        html = html.replace(/```(\w*)\n([\s\S]*?)```/g, '<pre><code>$2</code></pre>');
        // Inline code
        html = html.replace(/`([^`]+)`/g, '<code>$1</code>');
        // Headers
        html = html.replace(/^#### (.+)$/gm, '<h4>$1</h4>');
        html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
        html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
        html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
        // Bold & italic
        html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');
        html = html.replace(/\*(.+?)\*/g, '<em>$1</em>');
        // Blockquote
        html = html.replace(/^&gt; (.+)$/gm, '<blockquote>$1</blockquote>');
        // Unordered list
        html = html.replace(/^- (.+)$/gm, '<li>$1</li>');
        html = html.replace(/(<li>.*<\/li>\n?)+/g, '<ul>$&</ul>');
        // Ordered list
        html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>');
        // Horizontal rule
        html = html.replace(/^---$/gm, '<hr>');
        // Links
        html = html.replace(/\[([^\]]+)\]\(([^)]+)\)/g, '<a href="$2" target="_blank">$1</a>');
        // Paragraphs
        html = html.replace(/\n\n/g, '</p><p>');
        html = '<p>' + html + '</p>';
        html = html.replace(/<p><\/p>/g, '');
        html = html.replace(/<p>(<h[1-4]>)/g, '$1');
        html = html.replace(/(<\/h[1-4]>)<\/p>/g, '$1');
        html = html.replace(/<p>(<ul>)/g, '$1');
        html = html.replace(/(<\/ul>)<\/p>/g, '$1');
        html = html.replace(/<p>(<blockquote>)/g, '$1');
        html = html.replace(/(<\/blockquote>)<\/p>/g, '$1');
        html = html.replace(/<p>(<pre>)/g, '$1');
        html = html.replace(/(<\/pre>)<\/p>/g, '$1');
        html = html.replace(/<p>(<hr>)<\/p>/g, '$1');

        return html;
    }

    function escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    // Event listeners
    function init() {
        loadDashboard();

        // New record
        document.getElementById('btn-new').onclick = () => openForm();
        document.getElementById('btn-new-empty').onclick = () => openForm();

        // Save / Cancel
        document.getElementById('btn-save').onclick = (e) => { e.preventDefault(); saveRecord(); };
        document.getElementById('btn-cancel').onclick = () => {
            editingId ? loadDetail(editingId) : loadDashboard();
        };

        // Back
        document.getElementById('btn-back').onclick = () => loadRecords();

        // Search
        let searchTimer;
        document.getElementById('search-input').addEventListener('input', (e) => {
            clearTimeout(searchTimer);
            searchTimer = setTimeout(() => {
                currentSearch = e.target.value.trim();
                if (currentSearch) {
                    currentCategory = '';
                    currentTag = '';
                    updateActiveNav();
                    loadRecords();
                } else {
                    loadDashboard();
                }
            }, 300);
        });

        // Category nav
        document.getElementById('category-list').addEventListener('click', (e) => {
            const item = e.target.closest('.nav-item');
            if (!item) return;
            currentCategory = item.dataset.category;
            currentTag = '';
            currentSearch = '';
            document.getElementById('search-input').value = '';
            updateActiveNav();
            loadRecords();
        });

        // All records nav
        document.querySelector('.nav-section .nav-item[data-category=""]').addEventListener('click', () => {
            currentCategory = '';
            currentTag = '';
            currentSearch = '';
            document.getElementById('search-input').value = '';
            updateActiveNav();
            loadRecords();
        });

        // Tag cloud
        document.getElementById('tag-cloud').addEventListener('click', (e) => {
            const tagEl = e.target.closest('.tag-item');
            if (!tagEl) return;
            currentTag = currentTag === tagEl.dataset.tag ? '' : tagEl.dataset.tag;
            currentCategory = '';
            currentSearch = '';
            document.getElementById('search-input').value = '';
            updateActiveNav();
            loadRecords();
        });

        // Record card click
        document.getElementById('record-list').addEventListener('click', (e) => {
            const card = e.target.closest('.record-card');
            if (!card) return;
            loadDetail(parseInt(card.dataset.id));
        });

        // Export
        document.getElementById('btn-export-json').onclick = () => {
            window.location.href = '/api/export/json';
        };
        document.getElementById('btn-export-md').onclick = () => {
            window.location.href = '/api/export/markdown';
        };
    }

    function updateActiveNav() {
        document.querySelectorAll('.nav-item').forEach(el => {
            el.classList.toggle('active',
                el.dataset.category !== undefined && el.dataset.category === currentCategory
            );
        });
        document.querySelectorAll('.tag-item').forEach(el => {
            el.classList.toggle('active', el.dataset.tag === currentTag);
        });
    }

    init();
})();
