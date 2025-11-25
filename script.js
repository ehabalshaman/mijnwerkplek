/**
 * WERKPLEK DESIGNER PROFESSIONAL
 * Optimized & Clean Version
 */

// 🎯 GLOBALE VARIABELEN
let draggedElement = null;
let selectedItem = null;
let itemCounter = 0;
let offset = { x: 0, y: 0 };
let isDragging = false;

// 📊 ITEM CONFIGURATIE
const ITEM_CONFIG = {
    bureau: { width: 120, height: 80, emoji: '🪑', name: 'Bureau', price: 1000 },
    stoel: { width: 60, height: 60, emoji: '💺', name: 'Stoel', price: 500 },
    monitor: { width: 80, height: 60, emoji: '🖥️', name: 'Monitor', price: 300 },
    plant: { width: 50, height: 70, emoji: '🌱', name: 'Plant', price: 50 },
    lamp: { width: 40, height: 80, emoji: '💡', name: 'Lamp', price: 150 },
    kast: { width: 80, height: 120, emoji: '🗄️', name: 'Kast', price: 800 },
    whiteboard: { width: 140, height: 100, emoji: '📋', name: 'Whiteboard', price: 350 },
    koffie: { width: 100, height: 100, emoji: '☕', name: 'Koffie', price: 2000 },
    printer: { width: 70, height: 50, emoji: '🖨️', name: 'Printer', price: 600 },
    boeken: { width: 60, height: 140, emoji: '📚', name: 'Boeken', price: 200 }
};

// 🚀 INITIALISATIE
document.addEventListener('DOMContentLoaded', initializeApp);

function initializeApp() {
    setupEventListeners();
    setupColorPicker();
    checkForSavedLayout();
    showWelcomeMessage();
}

// 🎧 EVENT LISTENERS
function setupEventListeners() {
    document.querySelectorAll('.palette-item').forEach(item => {
        item.addEventListener('click', handlePaletteClick);
        item.addEventListener('mouseenter', handlePaletteHover);
    });

    document.addEventListener('click', handleDocumentClick);
    document.addEventListener('dragstart', e => e.preventDefault());
    document.addEventListener('keydown', handleKeyboard);

    ['sizeSlider', 'rotationSlider', 'itemText', 'colorFilter'].forEach(id => {
        const el = document.getElementById(id);
        if (!el) return;
        
        if (id === 'sizeSlider') el.addEventListener('input', updateSize);
        if (id === 'rotationSlider') el.addEventListener('input', updateRotation);
        if (id === 'itemText') el.addEventListener('input', updateText);
        if (id === 'colorFilter') el.addEventListener('change', updateColorFilter);
    });
}

// 🎨 PALETTE HANDLERS
function handlePaletteClick(e) {
    const itemType = e.currentTarget.dataset.type;
    if (itemType) {
        addItemToWorkspace(itemType);
        showNotification(`${ITEM_CONFIG[itemType]?.name} toegevoegd! 🎉`);
    }
}

function handlePaletteHover(e) {
    const itemType = e.currentTarget.dataset.type;
    const config = ITEM_CONFIG[itemType];
    if (config) {
        e.currentTarget.title = `${config.name} (${config.width}x${config.height}px)`;
    }
}

// ➕ ITEMS TOEVOEGEN
function addItemToWorkspace(type) {
    const workspace = document.getElementById('workspace');
    const config = ITEM_CONFIG[type] || { width: 80, height: 80, emoji: '📦', name: 'Item', price: 0 };
    
    itemCounter++;
    const item = createElement('div', {
        className: `workspace-item item-${type}`,
        id: `${type}_${itemCounter}`
    });
    item.dataset.name = config.name;
    const labelSpan = document.createElement('span');
    labelSpan.className = 'item-label-text';
    labelSpan.textContent = config.name;
    item.appendChild(labelSpan);

    const maxX = workspace.offsetWidth - config.width;
    const maxY = workspace.offsetHeight - config.height;
    const randomX = Math.random() * Math.max(0, maxX - 100) + 50;
    const randomY = Math.random() * Math.max(0, maxY - 100) + 50;
    
    item.dataset.price = config.price || 0;
    item.dataset.itemType = type;
    
    Object.assign(item.style, {
        left: randomX + 'px',
        top: randomY + 'px',
        width: config.width + 'px',
        height: config.height + 'px',
        opacity: '0',
        transform: 'scale(0.5)',
        transition: 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)'
    });

    setupItemEventListeners(item);
    workspace.appendChild(item);
    addPriceBadge(item);
    
    requestAnimationFrame(() => {
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
    });
    
    updateCostDisplay();
}

function addPriceBadge(item) {
    const price = parseInt(item.dataset.price || '0');
    let badge = item.querySelector('.price-badge');
    if (!badge) {
        badge = document.createElement('div');
        badge.className = 'price-badge';
        item.appendChild(badge);
    }
    badge.textContent = '€' + price.toLocaleString('nl-NL');
}

// 🎮 ITEM EVENT LISTENERS
function setupItemEventListeners(item) {
    item.addEventListener('mousedown', startDrag);
    item.addEventListener('touchstart', startDrag, { passive: false });
    item.addEventListener('contextmenu', e => {
        e.preventDefault();
        selectItem(item);
    });
    item.addEventListener('dblclick', () => {
        if (confirm('Wil je dit item verwijderen? 🗑️')) removeItem(item);
    });
}

// 🖱️ DRAG & DROP
function startDrag(e) {
    e.preventDefault();
    
    const item = e.currentTarget;
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    if (!clientX || !clientY) return;
    
    draggedElement = item;
    isDragging = true;
    
    const rect = item.getBoundingClientRect();
    const workspaceRect = document.getElementById('workspace').getBoundingClientRect();
    
    offset.x = clientX - rect.left;
    offset.y = clientY - rect.top;
    
    item.classList.add('dragging');
    item.style.zIndex = '1001';
    document.body.style.cursor = 'grabbing';
    
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
}

function drag(e) {
    if (!draggedElement || !isDragging) return;
    
    e.preventDefault();
    
    const clientX = e.clientX || e.touches?.[0]?.clientX;
    const clientY = e.clientY || e.touches?.[0]?.clientY;
    
    if (!clientX || !clientY) return;
    
    const workspace = document.getElementById('workspace');
    const workspaceRect = workspace.getBoundingClientRect();
    
    let newX = clientX - workspaceRect.left - offset.x;
    let newY = clientY - workspaceRect.top - offset.y;
    
    newX = Math.max(0, Math.min(newX, workspace.offsetWidth - draggedElement.offsetWidth));
    newY = Math.max(0, Math.min(newY, workspace.offsetHeight - draggedElement.offsetHeight));
    
    draggedElement.style.left = newX + 'px';
    draggedElement.style.top = newY + 'px';
}

function stopDrag() {
    if (draggedElement) {
        draggedElement.classList.remove('dragging');
        draggedElement.style.zIndex = '';
        draggedElement = null;
    }
    
    isDragging = false;
    document.body.style.cursor = '';
    
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
}

// ✏️ ITEM BEWERKING
function selectItem(item) {
    if (selectedItem) selectedItem.classList.remove('selected');
    
    selectedItem = item;
    item.classList.add('selected');
    showEditPanel();
    populateEditPanel(item);
}

function showEditPanel() {
    const panel = document.getElementById('editPanel');
    if (panel) {
        panel.style.display = 'block';
        panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}

function populateEditPanel(item) {
    const transform = item.style.transform || '';
    const scaleMatch = transform.match(/scale\(([^)]+)\)/);
    const rotateMatch = transform.match(/rotate\(([^)]+)deg\)/);
    
    const currentScale = scaleMatch ? parseFloat(scaleMatch[1]) * 100 : 100;
    const currentRotation = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
    
    const elements = {
        sizeSlider: document.getElementById('sizeSlider'),
        rotationSlider: document.getElementById('rotationSlider'),
        itemText: document.getElementById('itemText'),
        colorFilter: document.getElementById('colorFilter'),
        sizeValue: document.getElementById('sizeValue'),
        rotationValue: document.getElementById('rotationValue')
    };
    
    if (elements.sizeSlider) {
        elements.sizeSlider.value = currentScale;
        if (elements.sizeValue) elements.sizeValue.textContent = Math.round(currentScale) + '%';
    }
    
    if (elements.rotationSlider) {
        elements.rotationSlider.value = currentRotation;
        if (elements.rotationValue) elements.rotationValue.textContent = Math.round(currentRotation) + '°';
    }
    
    if (elements.itemText) {
        const cleanName = item.dataset.name || item.querySelector('.item-label-text')?.textContent || '';
        elements.itemText.value = cleanName;
    }
    if (elements.colorFilter) elements.colorFilter.value = item.style.filter || 'none';
    const priceInput = document.getElementById('priceInput');
    if (priceInput) {
        priceInput.value = item.dataset.price || '0';
        priceInput.oninput = () => {
            if (!selectedItem) return;
            const v = parseInt(priceInput.value);
            if (isNaN(v) || v < 0) return;
            selectedItem.dataset.price = v.toString();
            addPriceBadge(selectedItem);
            updateCostDisplay();
        };
    }
}

// 🎛️ UPDATE FUNCTIES
function updateSize() {
    if (!selectedItem) return;
    const sizeSlider = document.getElementById('sizeSlider');
    const rotationSlider = document.getElementById('rotationSlider');
    const size = parseFloat(sizeSlider.value) / 100;
    const rotation = rotationSlider ? parseFloat(rotationSlider.value) : 0;
    
    selectedItem.style.transform = `scale(${size}) rotate(${rotation}deg)`;
    const sizeValue = document.getElementById('sizeValue');
    if (sizeValue) sizeValue.textContent = Math.round(sizeSlider.value) + '%';
}

function updateRotation() {
    if (!selectedItem) return;
    const sizeSlider = document.getElementById('sizeSlider');
    const rotationSlider = document.getElementById('rotationSlider');
    const size = sizeSlider ? parseFloat(sizeSlider.value) / 100 : 1;
    const rotation = parseFloat(rotationSlider.value);
    
    selectedItem.style.transform = `scale(${size}) rotate(${rotation}deg)`;
    const rotationValue = document.getElementById('rotationValue');
    if (rotationValue) rotationValue.textContent = Math.round(rotation) + '°';
}

function updateText() {
    if (!selectedItem) return;
    const itemText = document.getElementById('itemText');
    if (!itemText) return;
    const newText = itemText.value.trim();
    const span = selectedItem.querySelector('.item-label-text');
    if (span) span.textContent = newText || getDefaultItemName(selectedItem);
    selectedItem.dataset.name = newText || getDefaultItemName(selectedItem);
    // behoud badge
    addPriceBadge(selectedItem);
}

function updateColorFilter() {
    if (!selectedItem) return;
    const colorFilter = document.getElementById('colorFilter');
    if (!colorFilter) return;
    selectedItem.style.filter = colorFilter.value === 'none' ? '' : colorFilter.value;
}

// 🗑️ ITEM VERWIJDERING
function removeItem(item) {
    item.style.transition = 'all 0.3s ease';
    item.style.transform = 'scale(0) rotate(180deg)';
    item.style.opacity = '0';
    
    setTimeout(() => {
        if (item.parentNode) item.parentNode.removeChild(item);
        if (selectedItem === item) closeEditPanel();
        updateCostDisplay();
    }, 300);
    
    showNotification('Item verwijderd 🗑️');
}

function closeEditPanel() {
    if (selectedItem) {
        selectedItem.classList.remove('selected');
        selectedItem = null;
    }
    const panel = document.getElementById('editPanel');
    if (panel) panel.style.display = 'none';
}

function deleteCurrentItem() {
    if (selectedItem && confirm('Wil je dit item verwijderen? 🗑️')) {
        removeItem(selectedItem);
    }
}

// ➕ CUSTOM ITEMS
function addCustomItem() {
    const itemName = prompt('Naam voor je eigen item:', 'Mijn Item');
    if (!itemName || !itemName.trim()) return;
    
    const workspace = document.getElementById('workspace');
    itemCounter++;
    const item = createElement('div', {
        className: 'workspace-item item-custom',
        id: `custom_${itemCounter}`,
        textContent: itemName.trim()
    });
    
    Object.assign(item.style, {
        width: '100px',
        height: '100px',
        left: '50px',
        top: '50px'
    });
    
    setupItemEventListeners(item);
    workspace.appendChild(item);
    addPriceBadge(item);
    showNotification(`"${itemName}" toegevoegd! ✨`);
}

// 💾 OPSLAAN & LADEN
function saveLayout() {
    try {
        const items = [];
        document.querySelectorAll('.workspace-item').forEach(item => {
            items.push({
                type: getItemType(item),
                id: item.id,
                left: item.style.left,
                top: item.style.top,
                width: item.style.width,
                height: item.style.height,
                transform: item.style.transform || '',
                filter: item.style.filter || '',
                textContent: item.textContent || '',
                className: item.className,
                backgroundImage: item.style.backgroundImage || '',
                backgroundColor: item.style.backgroundColor || '',
                photoUrl: item.dataset.photoUrl || '',
                backupColor: item.dataset.backupColor || '',
                price: item.dataset.price || '0',
                itemType: item.dataset.itemType || ''
            });
        });
        
        localStorage.setItem('werkplekLayout', JSON.stringify({
            items: items,
            timestamp: new Date().toISOString(),
            version: '2.0'
        }));
        
        showNotification('Layout opgeslagen! 💾', 'success');
    } catch (error) {
        console.error('Fout bij opslaan:', error);
        showNotification('Fout bij opslaan! ❌', 'error');
    }
}

function loadLayout() {
    try {
        const saved = localStorage.getItem('werkplekLayout');
        if (!saved) return false;
        
        const layoutData = JSON.parse(saved);
        const workspace = document.getElementById('workspace');
        workspace.innerHTML = '<div class="grid-overlay"></div>';
        
        layoutData.items.forEach(itemData => {
            const item = createElement('div', {
                className: itemData.className,
                id: itemData.id,
                textContent: itemData.textContent
            });
            
            Object.assign(item.style, {
                left: itemData.left,
                top: itemData.top,
                width: itemData.width,
                height: itemData.height,
                transform: itemData.transform,
                filter: itemData.filter,
                backgroundImage: itemData.backgroundImage || '',
                backgroundColor: itemData.backgroundColor || ''
            });
            
            if (itemData.photoUrl) item.dataset.photoUrl = itemData.photoUrl;
            if (itemData.backupColor) item.dataset.backupColor = itemData.backupColor;
            if (itemData.price) item.dataset.price = itemData.price;
            if (itemData.itemType) item.dataset.itemType = itemData.itemType;
            
            setupItemEventListeners(item);
            workspace.appendChild(item);
        });
        
        updateCostDisplay();
        showNotification('Layout geladen! 📂', 'success');
        return true;
    } catch (error) {
        console.error('Fout bij laden:', error);
        showNotification('Fout bij laden! ❌', 'error');
        return false;
    }
}

// 🗑️ WORKSPACE BEHEER
function clearWorkspace() {
    if (!confirm('Weet je zeker dat je alles wilt wissen? 🗑️')) return;
    
    const workspace = document.getElementById('workspace');
    const items = workspace.querySelectorAll('.workspace-item');
    
    items.forEach((item, index) => {
        setTimeout(() => {
            item.style.transition = 'all 0.3s ease';
            item.style.transform = 'scale(0) rotate(180deg)';
            item.style.opacity = '0';
            
            setTimeout(() => {
                if (item.parentNode) item.parentNode.removeChild(item);
            }, 300);
        }, index * 50);
    });
    
    closeEditPanel();
    itemCounter = 0;
    updateCostDisplay();
}

// 🖨️ PRINT
function printWorkspace() {
    document.body.classList.add('printing');
    setTimeout(() => {
        window.print();
        document.body.classList.remove('printing');
    }, 100);
}

// ⌨️ KEYBOARD SHORTCUTS
function handleKeyboard(e) {
    const ae = document.activeElement;
    if (ae && (ae.tagName === 'INPUT' || ae.tagName === 'TEXTAREA' || ae.tagName === 'SELECT')) {
        // Laat standaard typen toe in form velden
        return;
    }
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveLayout();
    } else if (e.key === 'Delete' && selectedItem) {
        e.preventDefault();
        removeItem(selectedItem);
    } else if (e.key === 'Escape') {
        closeEditPanel();
        closePhotoModal();
    } else if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openPhotoModal();
    }
}

// 🔧 HELPER FUNCTIES
function createElement(tag, attributes = {}) {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        key === 'textContent' ? element.textContent = value : element[key] = value;
    });
    return element;
}

function getItemType(item) {
    const typeClass = Array.from(item.classList).find(cls => cls.startsWith('item-'));
    return typeClass ? typeClass.replace('item-', '') : 'unknown';
}

function getDefaultItemName(item) {
    const type = getItemType(item);
    return ITEM_CONFIG[type]?.name || type;
}

function handleDocumentClick(e) {
    if (!e.target.closest('.edit-panel') && !e.target.closest('.workspace-item')) {
        closeEditPanel();
    }
}

function checkForSavedLayout() {
    const saved = localStorage.getItem('werkplekLayout');
    if (saved) {
        setTimeout(() => {
            if (confirm('Opgeslagen layout gevonden. Laden? 📂')) loadLayout();
        }, 1000);
    }
}

function showWelcomeMessage() {
    setTimeout(() => {
        showNotification('Welkom bij Werkplek Designer! 🎉', 'success', 5000);
    }, 500);
}

// 📸 PHOTO FUNCTIES
function openPhotoModal() {
    const modal = document.getElementById('photoModal');
    if (modal) {
        modal.style.display = 'flex';
        document.getElementById('itemName').value = '';
        document.getElementById('photoUrl').value = '';
        document.getElementById('itemWidth').value = '100';
        document.getElementById('itemHeight').value = '100';
        document.getElementById('itemPrice').value = '100';
        document.getElementById('backupColor').value = '#3498db';
        resetPhotoPreview();
    }
}

function closePhotoModal() {
    const modal = document.getElementById('photoModal');
    if (modal) modal.style.display = 'none';
}

function previewPhoto() {
    const urlInput = document.getElementById('photoUrl');
    const preview = document.getElementById('photoPreview');
    let url = urlInput.value.trim();
    
    if (!url) {
        resetPhotoPreview();
        return;
    }
    
    url = fixImageUrl(url);
    preview.innerHTML = '<div class="loading-preview" style="color: #3498db; padding: 20px;">📸 Foto laden...</div>';
    
    const img = new Image();
    const timeout = setTimeout(() => {
        showPhotoError('Foto laadt te langzaam. Probeer een andere URL.');
    }, 10000);
    
    img.onload = function() {
        clearTimeout(timeout);
        preview.innerHTML = `<img src="${url}" class="preview-image" alt="Preview" style="max-width: 100%; max-height: 100px; border-radius: 8px;">`;
        preview.classList.add('has-image');
        showNotification('Foto geladen! ✨', 'success');
        urlInput.value = url;
    };
    
    img.onerror = function() {
        clearTimeout(timeout);
        showPhotoError('Foto kon niet geladen worden.');
    };
    
    img.src = url;
}

function fixImageUrl(url) {
    if (url.includes('unsplash.com') && !url.includes('?')) {
        url += '?w=400&h=300&fit=crop';
    }
    if (url.includes('drive.google.com/file/d/')) {
        const fileId = url.match(/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileId) url = `https://drive.google.com/uc?export=view&id=${fileId[1]}`;
    }
    if (url.includes('dropbox.com') && !url.includes('?raw=1')) {
        url = url.replace('?dl=0', '?raw=1').replace('?dl=1', '?raw=1');
        if (!url.includes('?raw=1')) url += '?raw=1';
    }
    return url;
}

function resetPhotoPreview() {
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = `<div class="preview-placeholder"><span>📷</span><p>Foto preview hier</p></div>`;
    preview.classList.remove('has-image');
}

function useExampleUrl(url) {
    document.getElementById('photoUrl').value = url;
    previewPhoto();
}

function testPhotoUrl() {
    previewPhoto();
}

function showPhotoError(message) {
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = `<div class="preview-placeholder"><span>❌</span><p style="color: #e74c3c;">${message}</p></div>`;
    preview.classList.remove('has-image');
    showNotification(message, 'error');
}

function createCustomPhotoItem() {
    const itemName = document.getElementById('itemName').value.trim();
    let photoUrl = document.getElementById('photoUrl').value.trim();
    const itemWidth = parseInt(document.getElementById('itemWidth').value) || 100;
    const itemHeight = parseInt(document.getElementById('itemHeight').value) || 100;
    const itemPrice = parseInt(document.getElementById('itemPrice').value) || 0;
    const backupColor = document.getElementById('backupColor').value;
    
    if (!itemName) {
        showNotification('Voer een naam in! 📝', 'warning');
        return;
    }
    if (!photoUrl) {
        showNotification('Voer een foto URL in! 🔗', 'warning');
        return;
    }
    
    photoUrl = fixImageUrl(photoUrl);
    const workspace = document.getElementById('workspace');
    itemCounter++;
    const item = createElement('div', {
        className: 'workspace-item item-custom-photo',
        id: `custom_photo_${itemCounter}`
    });
    item.dataset.name = itemName;
    const labelSpan = document.createElement('span');
    labelSpan.className = 'item-label-text';
    labelSpan.textContent = itemName;
    item.appendChild(labelSpan);
    
    Object.assign(item.style, {
        width: itemWidth + 'px',
        height: itemHeight + 'px',
        left: '50px',
        top: '50px',
        backgroundImage: `url('${photoUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: backupColor
    });
    
    item.dataset.photoUrl = photoUrl;
    item.dataset.backupColor = backupColor;
    item.dataset.price = itemPrice.toString();
    item.dataset.itemType = 'custom';
    
    setupItemEventListeners(item);
    workspace.appendChild(item);
    closePhotoModal();
    addPriceBadge(item);
    showNotification(`"${itemName}" met foto toegevoegd! 📸 (Prijs: €${itemPrice})`, 'success');
    updateCostDisplay();
}

function updateItemPhoto() {
    if (!selectedItem) return;
    const newUrlInput = document.getElementById('newPhotoUrl');
    const newUrl = newUrlInput.value.trim();
    
    if (!newUrl) {
        showNotification('Voer een foto URL in! 🔗', 'warning');
        return;
    }
    
    const img = new Image();
    img.onload = function() {
        selectedItem.style.backgroundImage = `url('${newUrl}')`;
        selectedItem.style.backgroundSize = 'cover';
        selectedItem.style.backgroundPosition = 'center';
        selectedItem.dataset.photoUrl = newUrl;
        showNotification('Foto bijgewerkt! ✨', 'success');
        newUrlInput.value = '';
    };
    img.onerror = function() {
        showNotification('Foto kon niet geladen worden! ❌', 'error');
    };
    img.src = newUrl;
}

function clearPhotoUrl() {
    if (!selectedItem) return;
    const backupColor = selectedItem.dataset.backupColor || '#3498db';
    selectedItem.style.backgroundImage = '';
    selectedItem.style.backgroundColor = backupColor;
    document.getElementById('newPhotoUrl').value = '';
    showNotification('Foto gereset! 🎨', 'info');
}

function setupColorPicker() {
    const colorInput = document.getElementById('backupColor');
    const colorPreview = document.getElementById('colorPreview');
    
    if (colorInput && colorPreview) {
        colorInput.addEventListener('input', function() {
            colorPreview.textContent = this.value;
            colorPreview.style.backgroundColor = this.value;
            colorPreview.style.color = getContrastColor(this.value);
        });
    }
}

function getContrastColor(hexColor) {
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

// 📢 NOTIFICATIE SYSTEEM
function showNotification(message, type = 'info', duration = 3000) {
    const existing = document.querySelectorAll('.notification');
    existing.forEach(notif => notif.remove());
    
    const notification = createElement('div', {
        className: `notification notification-${type}`,
        textContent: message
    });
    
    const colors = {
        info: '#3498db',
        success: '#27ae60',
        warning: '#f39c12',
        error: '#e74c3c'
    };
    
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '15px 20px',
        borderRadius: '8px',
        color: 'white',
        fontWeight: 'bold',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
        background: colors[type] || colors.info
    });
    
    document.body.appendChild(notification);
    
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) notification.parentNode.removeChild(notification);
        }, 300);
    }, duration);
}

// 💰 KOSTEN BEREKENING
function updateCostDisplay() {
    const items = document.querySelectorAll('.workspace-item');
    const costList = document.getElementById('costList');
    const totalCostSpan = document.getElementById('totalCost');
    
    if (!costList || !totalCostSpan) return;
    
    let totalCost = 0;
    const itemsByType = {};
    
    items.forEach(item => {
        const price = parseInt(item.dataset.price) || 0;
    const itemName = item.dataset.name || item.querySelector('.item-label-text')?.textContent || 'Item';
        const itemType = item.dataset.itemType || 'custom';
        
        totalCost += price;
        
        if (!itemsByType[itemName]) {
            itemsByType[itemName] = { price: price, count: 1 };
        } else {
            itemsByType[itemName].count += 1;
        }
    });
    
    if (items.length === 0) {
        costList.innerHTML = '<div class="cost-empty">Voeg items toe om kosten te zien</div>';
        totalCostSpan.textContent = '€0';
        return;
    }
    
    let costHtml = '';
    for (const [itemName, data] of Object.entries(itemsByType)) {
        const subtotal = data.price * data.count;
        costHtml += `
            <div class="cost-item">
                <span class="cost-item-name">${itemName}</span>
                <span class="cost-item-qty">×${data.count}</span>
                <span class="cost-item-price">€${subtotal.toLocaleString('nl-NL')}</span>
            </div>
        `;
    }
    
    costList.innerHTML = costHtml;
    totalCostSpan.textContent = `€${totalCost.toLocaleString('nl-NL')}`;
}

// 🌐 GLOBALE FUNCTIES VOOR HTML
window.addCustomItem = addCustomItem;
window.clearWorkspace = clearWorkspace;
window.saveLayout = saveLayout;
window.printWorkspace = printWorkspace;
window.closeEditPanel = closeEditPanel;
window.deleteCurrentItem = deleteCurrentItem;
window.updateSize = updateSize;
window.updateRotation = updateRotation;
window.updateText = updateText;
window.updateColorFilter = updateColorFilter;
window.openPhotoModal = openPhotoModal;
window.closePhotoModal = closePhotoModal;
window.previewPhoto = previewPhoto;
window.useExampleUrl = useExampleUrl;
window.testPhotoUrl = testPhotoUrl;
window.createCustomPhotoItem = createCustomPhotoItem;
window.updateItemPhoto = updateItemPhoto;
window.clearPhotoUrl = clearPhotoUrl;
window.updateCostDisplay = updateCostDisplay;
window.updateItemPrice = updateItemPrice;

function updateItemPrice() {
    if (!selectedItem) return;
    const priceInput = document.getElementById('priceInput');
    if (!priceInput) return;
    let raw = priceInput.value.trim();
    if (raw === '') raw = '0';
    const newPrice = parseInt(raw);
    if (isNaN(newPrice) || newPrice < 0) {
        showNotification('Ongeldige prijs', 'error');
        return;
    }
    selectedItem.dataset.price = newPrice.toString();
    addPriceBadge(selectedItem);
    updateCostDisplay();
    showNotification(`Prijs aangepast naar €${newPrice}`, 'success');
}

console.log('✅ Werkplek Designer Professional v2.0 geladen!');