// ═══════════════════════════════════════════
// ELEMENTS
// ═══════════════════════════════════════════

const imagePreview = document.getElementById('imagePreview');
const placeholderText = document.getElementById('placeholderText');
const previewCard = document.getElementById('previewCard');
const previewBadge = document.getElementById('previewBadge');
const imageInfo = document.getElementById('imageInfo');
const imageDimensions = document.getElementById('imageDimensions');
const imageSizeEl = document.getElementById('imageSize');
const downloadBtn = document.getElementById('downloadBtn');
const statusBar = document.getElementById('statusBar');
const cidadeInput = document.getElementById('cidade');
const estadoInput = document.getElementById('estado');

// Type toggle
const typeCapa = document.getElementById('typeCapa');
const typeCorpo = document.getElementById('typeCorpo');
let tipoImagem = 'capa';

// Theme
const themeButtons = document.querySelectorAll('.theme-btn');

let currentImageUrl = null;
const TARGET_WIDTH = 747;

// ═══════════════════════════════════════════
// THEME SYSTEM
// ═══════════════════════════════════════════

function setTheme(theme) {
    document.documentElement.setAttribute('data-theme', theme);
    themeButtons.forEach(btn => {
        btn.classList.toggle('active', btn.dataset.theme === theme);
    });
    // Persist
    chrome.storage.local.set({ theme });
}

// Load saved theme
chrome.storage.local.get('theme', (data) => {
    if (data.theme) setTheme(data.theme);
});

themeButtons.forEach(btn => {
    btn.addEventListener('click', () => setTheme(btn.dataset.theme));
});

// ═══════════════════════════════════════════
// TYPE TOGGLE
// ═══════════════════════════════════════════

typeCapa.addEventListener('click', () => {
    tipoImagem = 'capa';
    typeCapa.classList.add('active');
    typeCorpo.classList.remove('active');
});

typeCorpo.addEventListener('click', () => {
    tipoImagem = 'corpo';
    typeCorpo.classList.add('active');
    typeCapa.classList.remove('active');
});

// ═══════════════════════════════════════════
// MESSAGE LISTENER
// ═══════════════════════════════════════════

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    if (message.action === 'image_selected') {
        loadImage(message.imageUrl);
    }
});

// ═══════════════════════════════════════════
// IMAGE LOADING
// ═══════════════════════════════════════════

function loadImage(url) {
    currentImageUrl = url;
    imagePreview.src = url;
    imagePreview.classList.add('visible');
    placeholderText.style.display = 'none';
    previewCard.classList.add('has-image');
    downloadBtn.disabled = false;

    // Get natural dimensions
    const tempImg = new Image();
    tempImg.onload = () => {
        imageDimensions.textContent = `${tempImg.width} × ${tempImg.height}`;
        imageInfo.classList.add('visible');
        previewBadge.textContent = `→ ${TARGET_WIDTH}px`;
    };
    tempImg.src = url;

    showStatus('Imagem carregada. Preencha os dados e baixe.', 'info');
}

// ═══════════════════════════════════════════
// STATUS
// ═══════════════════════════════════════════

function showStatus(msg, type) {
    statusBar.className = `status-bar visible ${type || ''}`;

    let icon = '';
    if (type === 'success') {
        icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>';
    } else if (type === 'error') {
        icon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="15" y1="9" x2="9" y2="15"/><line x1="9" y1="9" x2="15" y2="15"/></svg>';
    } else if (type === 'info') {
        icon = '<div class="spinner"></div>';
    }

    statusBar.innerHTML = `${icon}<span>${msg}</span>`;
}

function hideStatus() {
    statusBar.className = 'status-bar';
    statusBar.innerHTML = '';
}

// ═══════════════════════════════════════════
// STRING UTILS
// ═══════════════════════════════════════════

function sanitizeString(str) {
    return str
        .toString()
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^a-z0-9\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-');
}

function generateFileName() {
    const cidade = sanitizeString(cidadeInput.value || 'cidade');
    const estado = sanitizeString(estadoInput.value || 'estado');
    return `${cidade}-${estado}.jpg`;
}

// ═══════════════════════════════════════════
// IMAGE PROCESSING
// ═══════════════════════════════════════════

const yieldThread = () => new Promise(resolve => setTimeout(resolve, 10));

async function stepDownScale(img, targetWidth) {
    let currentWidth = img.width;
    let currentHeight = img.height;
    let source = img;

    while (currentWidth * 0.5 > targetWidth) {
        const tempCanvas = document.createElement('canvas');
        currentWidth = Math.floor(currentWidth * 0.5);
        currentHeight = Math.floor(currentHeight * 0.5);
        tempCanvas.width = currentWidth;
        tempCanvas.height = currentHeight;
        const tempCtx = tempCanvas.getContext('2d');
        tempCtx.drawImage(source, 0, 0, currentWidth, currentHeight);
        source = tempCanvas;
        await yieldThread();
    }

    const finalCanvas = document.createElement('canvas');
    const scaleFactor = targetWidth / img.width;
    const finalHeight = Math.round(img.height * scaleFactor);

    finalCanvas.width = targetWidth;
    finalCanvas.height = finalHeight;
    const finalCtx = finalCanvas.getContext('2d');

    finalCtx.fillStyle = '#FFFFFF';
    finalCtx.fillRect(0, 0, targetWidth, finalHeight);
    finalCtx.drawImage(source, 0, 0, targetWidth, finalHeight);

    return finalCanvas;
}

function getBase64Size(base64) {
    const base64str = base64.split(',')[1];
    const decoded = atob(base64str);
    return decoded.length;
}

async function optimizeQuality(canvas, maxBytes) {
    let min = 0.0;
    let max = 1.0;
    let bestDataUrl = null;
    let bestSize = 0;

    for (let i = 0; i < 7; i++) {
        const mid = (min + max) / 2;
        const dataUrl = canvas.toDataURL('image/jpeg', mid);
        const size = getBase64Size(dataUrl);

        if (size <= maxBytes) {
            bestDataUrl = dataUrl;
            bestSize = size;
            min = mid;
        } else {
            max = mid;
        }
        await yieldThread();
    }

    if (!bestDataUrl) {
        bestDataUrl = canvas.toDataURL('image/jpeg', 0.0);
        bestSize = getBase64Size(bestDataUrl);
    }

    return { dataUrl: bestDataUrl, size: bestSize };
}

// ═══════════════════════════════════════════
// DOWNLOAD
// ═══════════════════════════════════════════

async function processAndDownloadImage() {
    if (!currentImageUrl) return;

    if (!cidadeInput.value || !estadoInput.value) {
        showStatus('Preencha todos os campos de SEO.', 'error');
        return;
    }

    showStatus('Iniciando otimização...', 'info');
    downloadBtn.disabled = true;
    downloadBtn.classList.add('processing');
    await yieldThread();

    try {
        const img = new Image();
        img.crossOrigin = 'Anonymous';

        await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () => reject(new Error('Falha ao carregar. Possível bloqueio de CORS.'));
            img.src = currentImageUrl;
        });

        showStatus('Redimensionando (Multi-step)...', 'info');
        await yieldThread();
        const finalCanvas = await stepDownScale(img, TARGET_WIDTH);

        const isCover = tipoImagem === 'capa';
        const maxBytes = (isCover ? 100 : 150) * 1024;

        showStatus('Otimizando compressão (Binary Search)...', 'info');
        await yieldThread();
        const { dataUrl, size } = await optimizeQuality(finalCanvas, maxBytes);

        if (size > maxBytes) {
            console.warn(`Não comprimiu abaixo de ${maxBytes / 1024}kb. Final: ${(size / 1024).toFixed(2)}kb`);
        }

        const fileName = generateFileName();

        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const blobUrl = URL.createObjectURL(blob);

        chrome.downloads.download({
            url: blobUrl,
            filename: fileName,
            saveAs: true
        }, (downloadId) => {
            if (chrome.runtime.lastError) {
                showStatus(`Erro: ${chrome.runtime.lastError.message}`, 'error');
            } else {
                showStatus(`Salvo como ${fileName} (${(size / 1024).toFixed(1)}kb)`, 'success');
                imageSizeEl.textContent = `${(size / 1024).toFixed(1)}kb`;
            }
            downloadBtn.disabled = false;
            downloadBtn.classList.remove('processing');
            URL.revokeObjectURL(blobUrl);
        });

    } catch (error) {
        showStatus(error.message, 'error');
        downloadBtn.disabled = false;
        downloadBtn.classList.remove('processing');
    }
}

// ═══════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════

downloadBtn.addEventListener('click', processAndDownloadImage);