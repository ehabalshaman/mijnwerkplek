/**
 * ===== WERKPLEK DESIGNER PROFESSIONAL =====
 * JavaScript Module voor Drag & Drop Functionaliteit
 * Auteur: Jij! 🎨
 * Datum: November 2025
 */

// 🎯 GLOBALE VARIABELEN
let draggedElement = null;
let selectedItem = null;
let itemCounter = 0;
let offset = { x: 0, y: 0 };
let isDragging = false;

// 📊 ITEM CONFIGURATIE
const ITEM_CONFIG = {
    bureau: { width: 120, height: 80, emoji: '🪑', name: 'Bureau' },
    stoel: { width: 60, height: 60, emoji: '💺', name: 'Stoel' },
    monitor: { width: 80, height: 60, emoji: '🖥️', name: 'Monitor' },
    plant: { width: 50, height: 70, emoji: '🌱', name: 'Plant' },
    lamp: { width: 40, height: 80, emoji: '💡', name: 'Lamp' },
    kast: { width: 80, height: 120, emoji: '🗄️', name: 'Kast' },
    whiteboard: { width: 140, height: 100, emoji: '📋', name: 'Whiteboard' },
    koffie: { width: 100, height: 100, emoji: '☕', name: 'Koffie' },
    printer: { width: 70, height: 50, emoji: '🖨️', name: 'Printer' },
    boeken: { width: 60, height: 140, emoji: '📚', name: 'Boeken' }
};

// 🚀 INITIALISATIE
document.addEventListener('DOMContentLoaded', function() {
    console.log('🏢 Werkplek Designer Professional wordt geladen...');
    initializeApp();
});

function initializeApp() {
    setupEventListeners();
    checkForSavedLayout();
    showWelcomeMessage();
    console.log('✅ Applicatie succesvol geladen!');
}

// 🎧 EVENT LISTENERS SETUP
function setupEventListeners() {
    // Palette items
    const paletteItems = document.querySelectorAll('.palette-item');
    paletteItems.forEach(item => {
        item.addEventListener('click', handlePaletteClick);
        item.addEventListener('mouseenter', handlePaletteHover);
    });

    // Workspace clicks
    document.addEventListener('click', handleDocumentClick);
    
    // Prevent drag on images
    document.addEventListener('dragstart', e => e.preventDefault());
    
    // Keyboard shortcuts
    document.addEventListener('keydown', handleKeyboard);
    
    // Edit panel sliders
    setupEditPanelListeners();
}

function setupEditPanelListeners() {
    const sizeSlider = document.getElementById('sizeSlider');
    const rotationSlider = document.getElementById('rotationSlider');
    const itemText = document.getElementById('itemText');
    const colorFilter = document.getElementById('colorFilter');
    
    if (sizeSlider) sizeSlider.addEventListener('input', updateSize);
    if (rotationSlider) rotationSlider.addEventListener('input', updateRotation);
    if (itemText) itemText.addEventListener('input', updateText);
    if (colorFilter) colorFilter.addEventListener('change', updateColorFilter);
}

// 🎨 PALETTE ITEM HANDLERS
function handlePaletteClick(e) {
    const itemType = e.currentTarget.dataset.type;
    if (itemType) {
        addItemToWorkspace(itemType);
        showNotification(`${ITEM_CONFIG[itemType]?.name || itemType} toegevoegd! 🎉`);
    }
}

function handlePaletteHover(e) {
    const item = e.currentTarget;
    const itemType = item.dataset.type;
    const config = ITEM_CONFIG[itemType];
    
    if (config) {
        item.title = `Klik om ${config.name} toe te voegen (${config.width}x${config.height}px)`;
    }
}

// ➕ ITEMS TOEVOEGEN
function addItemToWorkspace(type) {
    const workspace = document.getElementById('workspace');
    const config = ITEM_CONFIG[type] || { width: 80, height: 80, emoji: '📦', name: 'Item' };
    
    itemCounter++;
    const item = createElement('div', {
        className: `workspace-item item-${type}`,
        id: `${type}_${itemCounter}`,
        textContent: config.name
    });

    // Positionering
    const maxX = workspace.offsetWidth - config.width;
    const maxY = workspace.offsetHeight - config.height;
    const randomX = Math.random() * Math.max(0, maxX - 100) + 50;
    const randomY = Math.random() * Math.max(0, maxY - 100) + 50;
    
    Object.assign(item.style, {
        left: randomX + 'px',
        top: randomY + 'px',
        width: config.width + 'px',
        height: config.height + 'px'
    });

    // Event listeners
    setupItemEventListeners(item);
    
    // Toevoegen aan workspace
    workspace.appendChild(item);
    
    // Animatie
    item.style.opacity = '0';
    item.style.transform = 'scale(0.5)';
    
    requestAnimationFrame(() => {
        item.style.transition = 'all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275)';
        item.style.opacity = '1';
        item.style.transform = 'scale(1)';
    });
}

// 🎮 ITEM EVENT LISTENERS
function setupItemEventListeners(item) {
    // Dragging
    item.addEventListener('mousedown', startDrag);
    item.addEventListener('touchstart', startDrag, { passive: false });
    
    // Context menu (rechtermuisklik)
    item.addEventListener('contextmenu', e => {
        e.preventDefault();
        selectItem(item);
    });
    
    // Dubbelklik verwijderen
    item.addEventListener('dblclick', () => {
        if (confirm('Wil je dit item verwijderen? 🗑️')) {
            removeItem(item);
        }
    });
}

// 🖱️ DRAG & DROP FUNCTIONALITEIT
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
    
    // Event listeners voor beweging
    document.addEventListener('mousemove', drag);
    document.addEventListener('touchmove', drag, { passive: false });
    document.addEventListener('mouseup', stopDrag);
    document.addEventListener('touchend', stopDrag);
    
    // Cursor feedback
    document.body.style.cursor = 'grabbing';
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
    
    // Grenzen controleren
    newX = Math.max(0, Math.min(newX, workspace.offsetWidth - draggedElement.offsetWidth));
    newY = Math.max(0, Math.min(newY, workspace.offsetHeight - draggedElement.offsetHeight));
    
    // Positie updaten
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
    
    // Event listeners verwijderen
    document.removeEventListener('mousemove', drag);
    document.removeEventListener('touchmove', drag);
    document.removeEventListener('mouseup', stopDrag);
    document.removeEventListener('touchend', stopDrag);
}

// ✏️ ITEM BEWERKING
function selectItem(item) {
    // Vorige selectie wissen
    if (selectedItem) {
        selectedItem.classList.remove('selected');
    }
    
    selectedItem = item;
    item.classList.add('selected');
    
    // Edit panel tonen
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
    // Huidige waarden ophalen
    const transform = item.style.transform || '';
    const scaleMatch = transform.match(/scale\(([^)]+)\)/);
    const rotateMatch = transform.match(/rotate\(([^)]+)deg\)/);
    
    const currentScale = scaleMatch ? parseFloat(scaleMatch[1]) * 100 : 100;
    const currentRotation = rotateMatch ? parseFloat(rotateMatch[1]) : 0;
    
    // Velden vullen
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
        elements.itemText.value = item.textContent || '';
    }
    
    if (elements.colorFilter) {
        elements.colorFilter.value = item.style.filter || 'none';
    }
}

// 🎛️ UPDATE FUNCTIES
function updateSize() {
    if (!selectedItem) return;
    
    const sizeSlider = document.getElementById('sizeSlider');
    const sizeValue = document.getElementById('sizeValue');
    const rotationSlider = document.getElementById('rotationSlider');
    
    if (!sizeSlider) return;
    
    const size = parseFloat(sizeSlider.value) / 100;
    const rotation = rotationSlider ? parseFloat(rotationSlider.value) : 0;
    
    selectedItem.style.transform = `scale(${size}) rotate(${rotation}deg)`;
    
    if (sizeValue) {
        sizeValue.textContent = Math.round(sizeSlider.value) + '%';
    }
}

function updateRotation() {
    if (!selectedItem) return;
    
    const sizeSlider = document.getElementById('sizeSlider');
    const rotationSlider = document.getElementById('rotationSlider');
    const rotationValue = document.getElementById('rotationValue');
    
    if (!rotationSlider) return;
    
    const size = sizeSlider ? parseFloat(sizeSlider.value) / 100 : 1;
    const rotation = parseFloat(rotationSlider.value);
    
    selectedItem.style.transform = `scale(${size}) rotate(${rotation}deg)`;
    
    if (rotationValue) {
        rotationValue.textContent = Math.round(rotation) + '°';
    }
}

function updateText() {
    if (!selectedItem) return;
    
    const itemText = document.getElementById('itemText');
    if (!itemText) return;
    
    const newText = itemText.value.trim();
    selectedItem.textContent = newText || getDefaultItemName(selectedItem);
}

function updateColorFilter() {
    if (!selectedItem) return;
    
    const colorFilter = document.getElementById('colorFilter');
    if (!colorFilter) return;
    
    const filterValue = colorFilter.value;
    selectedItem.style.filter = filterValue === 'none' ? '' : filterValue;
}

// 🗑️ ITEM VERWIJDERING
function removeItem(item) {
    item.style.transition = 'all 0.3s ease';
    item.style.transform = 'scale(0) rotate(180deg)';
    item.style.opacity = '0';
    
    setTimeout(() => {
        if (item.parentNode) {
            item.parentNode.removeChild(item);
        }
        if (selectedItem === item) {
            closeEditPanel();
        }
    }, 300);
    
    showNotification('Item verwijderd 🗑️');
}

function closeEditPanel() {
    if (selectedItem) {
        selectedItem.classList.remove('selected');
        selectedItem = null;
    }
    
    const panel = document.getElementById('editPanel');
    if (panel) {
        panel.style.display = 'none';
    }
}

function deleteCurrentItem() {
    if (selectedItem) {
        if (confirm('Wil je dit item verwijderen? 🗑️')) {
            removeItem(selectedItem);
        }
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
    
    // Standaard afmetingen
    const width = 100;
    const height = 100;
    
    Object.assign(item.style, {
        width: width + 'px',
        height: height + 'px',
        left: '50px',
        top: '50px'
    });
    
    setupItemEventListeners(item);
    workspace.appendChild(item);
    
    showNotification(`Custom item "${itemName}" toegevoegd! ✨`);
}

// 💾 OPSLAAN & LADEN
function saveLayout() {
    try {
        const items = [];
        const workspaceItems = document.querySelectorAll('.workspace-item');
        
        workspaceItems.forEach(item => {
            const itemData = {
                type: getItemType(item),
                id: item.id,
                left: item.style.left,
                top: item.style.top,
                width: item.style.width,
                height: item.style.height,
                transform: item.style.transform || '',
                filter: item.style.filter || '',
                textContent: item.textContent || '',
                className: item.className
            };
            items.push(itemData);
        });
        
        const layoutData = {
            items: items,
            timestamp: new Date().toISOString(),
            version: '1.0'
        };
        
        localStorage.setItem('werkplekLayout', JSON.stringify(layoutData));
        showNotification('Layout opgeslagen! 💾');
        
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
        
        // Workspace leegmaken
        workspace.innerHTML = '<div class="grid-overlay"></div>';
        
        // Items herstellen
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
                filter: itemData.filter
            });
            
            setupItemEventListeners(item);
            workspace.appendChild(item);
        });
        
        showNotification('Layout geladen! 📂');
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
                if (item.parentNode) {
                    item.parentNode.removeChild(item);
                }
            }, 300);
        }, index * 50);
    });
    
    closeEditPanel();
    itemCounter = 0;
    
    setTimeout(() => {
        showNotification('Werkplek gewist! 🧹');
    }, items.length * 50 + 300);
}

// 🖨️ PRINT FUNCTIONALITEIT
function printWorkspace() {
    // Print optimalisatie
    document.body.classList.add('printing');
    
    setTimeout(() => {
        window.print();
        document.body.classList.remove('printing');
    }, 100);
}

// ⌨️ KEYBOARD SHORTCUTS
function handleKeyboard(e) {
    // Ctrl/Cmd + S = Opslaan
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveLayout();
    }
    
    // Delete = Verwijder geselecteerd item
    if (e.key === 'Delete' && selectedItem) {
        e.preventDefault();
        removeItem(selectedItem);
    }
    
    // Escape = Sluit edit panel
    if (e.key === 'Escape') {
        closeEditPanel();
    }
    
    // Ctrl/Cmd + Z = Undo (toekomstige functie)
    if ((e.ctrlKey || e.metaKey) && e.key === 'z') {
        e.preventDefault();
        // TODO: Undo functionaliteit
        showNotification('Undo functie komt binnenkort! ⏳');
    }
}

// 🔧 HELPER FUNCTIES
function createElement(tag, attributes = {}) {
    const element = document.createElement(tag);
    Object.entries(attributes).forEach(([key, value]) => {
        if (key === 'textContent') {
            element.textContent = value;
        } else {
            element[key] = value;
        }
    });
    return element;
}

function getItemType(item) {
    const classes = item.className.split(' ');
    const typeClass = classes.find(cls => cls.startsWith('item-'));
    return typeClass ? typeClass.replace('item-', '') : 'unknown';
}

function getDefaultItemName(item) {
    const type = getItemType(item);
    return ITEM_CONFIG[type]?.name || type;
}

function handleDocumentClick(e) {
    // Sluit edit panel als er buiten wordt geklikt
    if (!e.target.closest('.edit-panel') && !e.target.closest('.workspace-item')) {
        closeEditPanel();
    }
}

function checkForSavedLayout() {
    const saved = localStorage.getItem('werkplekLayout');
    if (saved) {
        setTimeout(() => {
            if (confirm('Er is een opgeslagen layout gevonden. Wil je deze laden? 📂')) {
                loadLayout();
            }
        }, 1000);
    }
}

function showWelcomeMessage() {
    setTimeout(() => {
        showNotification('Welkom bij Werkplek Designer Professional! 🎉', 'success', 5000);
    }, 500);
}

// 📢 NOTIFICATIE SYSTEEM
function showNotification(message, type = 'info', duration = 3000) {
    // Verwijder bestaande notificaties
    const existing = document.querySelectorAll('.notification');
    existing.forEach(notif => notif.remove());
    
    const notification = createElement('div', {
        className: `notification notification-${type}`,
        textContent: message
    });
    
    // Styling
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
        boxShadow: '0 4px 12px rgba(0,0,0,0.3)'
    });
    
    // Type specifieke kleuren
    const colors = {
        info: '#3498db',
        success: '#27ae60',
        warning: '#f39c12',
        error: '#e74c3c'
    };
    
    notification.style.background = colors[type] || colors.info;
    
    document.body.appendChild(notification);
    
    // Animatie
    requestAnimationFrame(() => {
        notification.style.transform = 'translateX(0)';
    });
    
    // Auto verwijderen
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, duration);
}

// 📊 DEBUG FUNCTIES (alleen in ontwikkeling)
function debugInfo() {
    console.log('🔍 Debug Info:', {
        selectedItem,
        draggedElement,
        itemCounter,
        totalItems: document.querySelectorAll('.workspace-item').length
    });
}

// 📸 PHOTO MODAL FUNCTIES
function openPhotoModal() {
    const modal = document.getElementById('photoModal');
    if (modal) {
        modal.style.display = 'flex';
        // Reset form
        document.getElementById('itemName').value = '';
        document.getElementById('photoUrl').value = '';
        document.getElementById('itemWidth').value = '100';
        document.getElementById('itemHeight').value = '100';
        document.getElementById('backupColor').value = '#3498db';
        resetPhotoPreview();
    }
}

function closePhotoModal() {
    const modal = document.getElementById('photoModal');
    if (modal) {
        modal.style.display = 'none';
    }
}

function previewPhoto() {
    const urlInput = document.getElementById('photoUrl');
    const preview = document.getElementById('photoPreview');
    let url = urlInput.value.trim();
    
    if (!url) {
        resetPhotoPreview();
        return;
    }
    
    // Auto-fix URL problemen
    url = fixImageUrl(url);
    
    // Toon loading
    preview.innerHTML = '<div class="loading-preview" style="color: #3498db; padding: 20px;">📸 Foto laden...</div>';
    
    // Test of afbeelding bestaat met langere timeout
    const img = new Image();
    
    // Timeout na 10 seconden
    const timeout = setTimeout(() => {
        showPhotoError('Foto laadt te langzaam. Probeer een andere URL of controleer je internetverbinding.');
    }, 10000);
    
    img.onload = function() {
        clearTimeout(timeout);
        preview.innerHTML = `<img src="${url}" class="preview-image" alt="Preview" style="max-width: 100%; max-height: 100px; border-radius: 8px;">`;
        preview.classList.add('has-image');
        showNotification('Foto succesvol geladen! ✨', 'success');
        
        // Update URL in input als we het hebben aangepast
        if (url !== urlInput.value.trim()) {
            urlInput.value = url;
        }
    };
    
    img.onerror = function() {
        clearTimeout(timeout);
        // Probeer alternatieve URL formats
        tryAlternativeUrls(url, preview, urlInput);
    };
    
    img.src = url;
}

function fixImageUrl(url) {
    // Veelvoorkomende URL fixes
    
    // Unsplash: zorg voor directe image URL
    if (url.includes('unsplash.com') && !url.includes('?')) {
        // Voeg Unsplash parameters toe als ze ontbreken
        if (!url.includes('?w=')) {
            url += '?w=400&h=300&fit=crop';
        }
    }
    
    // Google Drive links naar directe links
    if (url.includes('drive.google.com/file/d/')) {
        const fileId = url.match(/file\/d\/([a-zA-Z0-9_-]+)/);
        if (fileId) {
            url = `https://drive.google.com/uc?export=view&id=${fileId[1]}`;
        }
    }
    
    // Dropbox links
    if (url.includes('dropbox.com') && !url.includes('?raw=1')) {
        url = url.replace('?dl=0', '?raw=1').replace('?dl=1', '?raw=1');
        if (!url.includes('?raw=1')) {
            url += '?raw=1';
        }
    }
    
    return url;
}

function tryAlternativeUrls(originalUrl, preview, urlInput) {
    const alternatives = [];
    
    // Probeer verschillende Unsplash formaten
    if (originalUrl.includes('unsplash.com')) {
        alternatives.push(originalUrl + '?w=400&h=300&fit=crop');
        alternatives.push(originalUrl.replace('?w=400&h=300&fit=crop', '') + '?auto=format&fit=crop&w=400&q=80');
    }
    
    // Probeer met https als het http was
    if (originalUrl.startsWith('http://')) {
        alternatives.push(originalUrl.replace('http://', 'https://'));
    }
    
    // Als er geen alternatieven zijn, toon error
    if (alternatives.length === 0) {
        showPhotoError('Foto kon niet geladen worden. Probeer een andere URL.');
        return;
    }
    
    // Probeer eerste alternatief
    tryAlternative(0, alternatives, preview, urlInput, originalUrl);
}

function tryAlternative(index, alternatives, preview, urlInput, originalUrl) {
    if (index >= alternatives.length) {
        showPhotoError('Foto kon niet geladen worden na meerdere pogingen. Controleer of de URL correct is.');
        return;
    }
    
    const img = new Image();
    const altUrl = alternatives[index];
    
    img.onload = function() {
        preview.innerHTML = `<img src="${altUrl}" class="preview-image" alt="Preview" style="max-width: 100%; max-height: 100px; border-radius: 8px;">`;
        preview.classList.add('has-image');
        showNotification('Foto geladen met alternatieve URL! ✨', 'success');
        urlInput.value = altUrl; // Update naar werkende URL
    };
    
    img.onerror = function() {
        // Probeer volgende alternatief
        tryAlternative(index + 1, alternatives, preview, urlInput, originalUrl);
    };
    
    img.src = altUrl;
}

function resetPhotoPreview() {
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = `
        <div class="preview-placeholder">
            <span>📷</span>
            <p>Foto preview verschijnt hier</p>
        </div>
    `;
    preview.classList.remove('has-image');
}

function showPhotoError(message) {
    const preview = document.getElementById('photoPreview');
    preview.innerHTML = `
        <div class="preview-placeholder">
            <span>❌</span>
            <p style="color: #e74c3c;">${message}</p>
        </div>
    `;
    preview.classList.remove('has-image');
    showNotification(message, 'error');
}

function isValidImageUrl(url) {
    // Basis URL validatie
    try {
        new URL(url);
    } catch {
        return false;
    }
    
    // Veel meer permissieve validatie - als het een URL is, proberen we het gewoon!
    const imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg|bmp|tiff|ico)$/i;
    const imageServices = /(unsplash\.com|pixabay\.com|pexels\.com|imgur\.com|cloudinary\.com|amazonaws\.com|googleusercontent\.com|wp\.com|wordpress\.com|blogspot\.com|githubusercontent\.com)/i;
    
    // Als het een van deze heeft, accepteer het
    if (imageExtensions.test(url) || imageServices.test(url) || url.includes('images.') || url.includes('/photo') || url.includes('/image')) {
        return true;
    }
    
    // Voor alle andere URLs, probeer het gewoon - laat de browser beslissen
    return true; // Veel permissiever - probeer alles!
}

function createCustomPhotoItem() {
    const itemName = document.getElementById('itemName').value.trim();
    let photoUrl = document.getElementById('photoUrl').value.trim();
    const itemWidth = parseInt(document.getElementById('itemWidth').value) || 100;
    const itemHeight = parseInt(document.getElementById('itemHeight').value) || 100;
    const backupColor = document.getElementById('backupColor').value;
    
    // Validatie
    if (!itemName) {
        showNotification('Voer een naam in voor je item! 📝', 'warning');
        return;
    }
    
    if (!photoUrl) {
        showNotification('Voer een foto URL in! 🔗', 'warning');
        return;
    }
    
    // Auto-fix URL
    photoUrl = fixImageUrl(photoUrl);
    
    // Maak custom item
    const workspace = document.getElementById('workspace');
    itemCounter++;
    
    const item = createElement('div', {
        className: 'workspace-item item-custom-photo',
        id: `custom_photo_${itemCounter}`,
        textContent: itemName
    });
    
    // Styling
    Object.assign(item.style, {
        width: itemWidth + 'px',
        height: itemHeight + 'px',
        left: '50px',
        top: '50px',
        backgroundImage: `url('${photoUrl}')`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundColor: backupColor, // Fallback
    });
    
    // Custom data attributes voor later gebruik
    item.dataset.photoUrl = photoUrl;
    item.dataset.backupColor = backupColor;
    
    setupItemEventListeners(item);
    workspace.appendChild(item);
    
    closePhotoModal();
    showNotification(`"${itemName}" met eigen foto toegevoegd! �`, 'success');
}

// UPDATE FOTO IN EDIT PANEL
function updateItemPhoto() {
    if (!selectedItem) return;
    
    const newUrlInput = document.getElementById('newPhotoUrl');
    const newUrl = newUrlInput.value.trim();
    
    if (!newUrl) {
        showNotification('Voer een nieuwe foto URL in! 🔗', 'warning');
        return;
    }
    
    if (!isValidImageUrl(newUrl)) {
        showNotification('Ongeldige foto URL! 📷', 'error');
        return;
    }
    
    // Test of nieuwe foto werkt
    const img = new Image();
    img.onload = function() {
        // Update item styling
        selectedItem.style.backgroundImage = `url('${newUrl}')`;
        selectedItem.style.backgroundSize = 'cover';
        selectedItem.style.backgroundPosition = 'center';
        selectedItem.dataset.photoUrl = newUrl;
        
        showNotification('Foto succesvol bijgewerkt! ✨', 'success');
        newUrlInput.value = '';
    };
    
    img.onerror = function() {
        showNotification('Nieuwe foto kon niet geladen worden! ❌', 'error');
    };
    
    img.src = newUrl;
}

function clearPhotoUrl() {
    if (!selectedItem) return;
    
    // Reset naar originele styling of backup kleur
    const backupColor = selectedItem.dataset.backupColor || '#3498db';
    selectedItem.style.backgroundImage = '';
    selectedItem.style.backgroundColor = backupColor;
    
    document.getElementById('newPhotoUrl').value = '';
    showNotification('Foto gereset naar backup kleur! 🎨', 'info');
}

// UITGEBREIDE COLOR PICKER
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
    // Convert hex to RGB
    const r = parseInt(hexColor.substr(1, 2), 16);
    const g = parseInt(hexColor.substr(3, 2), 16);
    const b = parseInt(hexColor.substr(5, 2), 16);
    
    // Calculate relative luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    return luminance > 0.5 ? '#000000' : '#ffffff';
}

// KEYBOARD SHORTCUTS UITBREIDEN
function handleKeyboard(e) {
    // Escape = Sluit modals
    if (e.key === 'Escape') {
        closeEditPanel();
        closePhotoModal();
    }
    
    // Ctrl/Cmd + S = Opslaan
    if ((e.ctrlKey || e.metaKey) && e.key === 's') {
        e.preventDefault();
        saveLayout();
    }
    
    // Delete = Verwijder geselecteerd item
    if (e.key === 'Delete' && selectedItem) {
        e.preventDefault();
        removeItem(selectedItem);
    }
    
    // Ctrl/Cmd + N = Nieuwe foto item
    if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        openPhotoModal();
    }
}

// ENHANCED SAVE/LOAD VOOR CUSTOM PHOTOS
function saveLayout() {
    try {
        const items = [];
        const workspaceItems = document.querySelectorAll('.workspace-item');
        
        workspaceItems.forEach(item => {
            const itemData = {
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
                // Nieuwe foto data
                backgroundImage: item.style.backgroundImage || '',
                backgroundColor: item.style.backgroundColor || '',
                photoUrl: item.dataset.photoUrl || '',
                backupColor: item.dataset.backupColor || ''
            };
            items.push(itemData);
        });
        
        const layoutData = {
            items: items,
            timestamp: new Date().toISOString(),
            version: '2.0' // Updated version voor photo support
        };
        
        localStorage.setItem('werkplekLayout', JSON.stringify(layoutData));
        showNotification('Layout met foto\'s opgeslagen! 💾', 'success');
        
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
        
        // Workspace leegmaken
        workspace.innerHTML = '<div class="grid-overlay"></div>';
        
        // Items herstellen
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
            
            // Restore custom data
            if (itemData.photoUrl) item.dataset.photoUrl = itemData.photoUrl;
            if (itemData.backupColor) item.dataset.backupColor = itemData.backupColor;
            
            setupItemEventListeners(item);
            workspace.appendChild(item);
        });
        
        showNotification('Layout met foto\'s geladen! 📂', 'success');
        return true;
        
    } catch (error) {
        console.error('Fout bij laden:', error);
        showNotification('Fout bij laden! ❌', 'error');
        return false;
    }
}

// UPDATE INITIALISATIE
function initializeApp() {
    setupEventListeners();
    setupColorPicker();
    checkForSavedLayout();
    showWelcomeMessage();
    console.log('✅ Applicatie met foto support geladen!');
}

// �🎯 GLOBALE FUNCTIES (voor HTML onclick handlers)
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
// Nieuwe photo functies
window.openPhotoModal = openPhotoModal;
window.closePhotoModal = closePhotoModal;
window.previewPhoto = previewPhoto;
window.createCustomPhotoItem = createCustomPhotoItem;
window.updateItemPhoto = updateItemPhoto;
window.clearPhotoUrl = clearPhotoUrl;
window.testPhotoUrl = testPhotoUrl;
window.useExampleUrl = useExampleUrl;

// HELPER FUNCTIES VOOR URL TESTING
function testPhotoUrl() {
    const urlInput = document.getElementById('photoUrl');
    const url = urlInput.value.trim();
    
    if (!url) {
        showNotification('Voer eerst een URL in! 🔗', 'warning');
        return;
    }
    
    showNotification('URL wordt getest... 🧪', 'info');
    previewPhoto();
}

function useExampleUrl(exampleUrl) {
    const urlInput = document.getElementById('photoUrl');
    const nameInput = document.getElementById('itemName');
    
    urlInput.value = exampleUrl;
    
    // Auto-fill naam als deze leeg is
    if (!nameInput.value.trim()) {
        if (exampleUrl.includes('1555041469')) {
            nameInput.value = 'Modern Bureau';
        } else if (exampleUrl.includes('1549497538')) {
            nameInput.value = 'Comfy Stoel';
        } else if (exampleUrl.includes('1485955900')) {
            nameInput.value = 'Groene Plant';
        }
    }
    
    showNotification('Voorbeeld URL ingevuld! Klik "🧪 Test URL" om te bekijken.', 'success');
}

// 🚀 EXPORT VOOR MODULES (toekomstig gebruik)
if (typeof module !== 'undefined' && module.exports) {
    module.exports = {
        addItemToWorkspace,
        saveLayout,
        loadLayout,
        clearWorkspace
    };
}

console.log('📝 Werkplek Designer Professional Script geladen! Versie 1.0');
