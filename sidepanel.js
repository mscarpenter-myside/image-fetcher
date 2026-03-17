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
    const parts = [];
    parts.push(sanitizeString(cidadeInput.value || 'bairro'));
    parts.push(sanitizeString(estadoInput.value || 'cidade'));
    return parts.join('-') + '.jpg';
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
// LOCATION DATA
// ═══════════════════════════════════════════

const LOCATION_DATA = [
    { slug: 'sp', label: 'São Paulo (SP)', neighborhoods: [
        { slug: 'itaim-bibi', label: 'Itaim Bibi' },
        { slug: 'pinheiros', label: 'Pinheiros' },
        { slug: 'jardins', label: 'Jardins' },
        { slug: 'moema', label: 'Moema' },
        { slug: 'vila-mariana', label: 'Vila Mariana' },
        { slug: 'paraiso', label: 'Paraíso' },
        { slug: 'perdizes', label: 'Perdizes' },
        { slug: 'bela-vista', label: 'Bela Vista' },
        { slug: 'santana', label: 'Santana' },
        { slug: 'vila-andrade', label: 'Vila Andrade' },
    ]},
    { slug: 'rj', label: 'Rio de Janeiro (RJ)', neighborhoods: [
        { slug: 'leblon', label: 'Leblon' },
        { slug: 'ipanema', label: 'Ipanema' },
        { slug: 'lagoa', label: 'Lagoa' },
        { slug: 'barra-da-tijuca', label: 'Barra da Tijuca' },
        { slug: 'botafogo', label: 'Botafogo' },
        { slug: 'copacabana', label: 'Copacabana' },
        { slug: 'flamengo', label: 'Flamengo' },
        { slug: 'laranjeiras', label: 'Laranjeiras' },
        { slug: 'recreio-dos-bandeirantes', label: 'Recreio dos Bandeirantes' },
        { slug: 'tijuca', label: 'Tijuca' },
    ]},
    { slug: 'mg', label: 'Belo Horizonte (MG)', neighborhoods: [
        { slug: 'savassi', label: 'Savassi' },
        { slug: 'santo-agostinho', label: 'Santo Agostinho' },
        { slug: 'lourdes', label: 'Lourdes' },
        { slug: 'funcionarios', label: 'Funcionários' },
        { slug: 'santa-lucia', label: 'Santa Lúcia' },
        { slug: 'santo-antonio', label: 'Santo Antônio' },
        { slug: 'sion', label: 'Sion' },
        { slug: 'gutierrez', label: 'Gutierrez' },
        { slug: 'serra', label: 'Serra' },
        { slug: 'buritis', label: 'Buritis' },
    ]},
    { slug: 'df', label: 'Brasília (DF)', neighborhoods: [
        { slug: 'setor-sudoeste', label: 'Setor Sudoeste' },
        { slug: 'asa-norte', label: 'Asa Norte' },
        { slug: 'asa-sul', label: 'Asa Sul' },
        { slug: 'aguas-claras', label: 'Águas Claras' },
        { slug: 'guara-sul', label: 'Guará Sul' },
        { slug: 'taguatinga-sul', label: 'Taguatinga Sul' },
        { slug: 'taguatinga-norte', label: 'Taguatinga Norte' },
        { slug: 'ceilandia-sul', label: 'Ceilândia Sul' },
        { slug: 'sobradinho', label: 'Sobradinho' },
        { slug: 'riacho-fundo', label: 'Riacho Fundo' },
    ]},
    { slug: 'ba', label: 'Salvador (BA)', neighborhoods: [
        { slug: 'barra', label: 'Barra' },
        { slug: 'caminho-das-arvores', label: 'Caminho das Árvores' },
        { slug: 'ondina', label: 'Ondina' },
        { slug: 'rio-vermelho', label: 'Rio Vermelho' },
        { slug: 'brotas', label: 'Brotas' },
        { slug: 'pernambues', label: 'Pernambués' },
        { slug: 'graca', label: 'Graça' },
        { slug: 'pituba', label: 'Pituba' },
        { slug: 'imbui', label: 'Imbuí' },
        { slug: 'itaigara', label: 'Itaigara' },
    ]},
    { slug: 'ce', label: 'Fortaleza (CE)', neighborhoods: [
        { slug: 'meireles', label: 'Meireles' },
        { slug: 'aldeota', label: 'Aldeota' },
        { slug: 'engenheiro-luciano-cavalcante', label: 'Engenheiro Luciano Cavalcante' },
        { slug: 'centro', label: 'Centro' },
        { slug: 'manuel-dias-branco', label: 'Manuel Dias Branco' },
        { slug: 'dionisio-torres', label: 'Dionísio Torres' },
        { slug: 'fatima', label: 'Fátima' },
        { slug: 'praia-do-futuro-ii', label: 'Praia do Futuro II' },
        { slug: 'papicu', label: 'Papicu' },
        { slug: 'joaquim-tavora', label: 'Joaquim Távora' },
    ]},
    { slug: 'pe', label: 'Recife (PE)', neighborhoods: [
        { slug: 'parnamirim', label: 'Parnamirim' },
        { slug: 'boa-viagem', label: 'Boa Viagem' },
        { slug: 'madalena', label: 'Madalena' },
        { slug: 'santo-amaro', label: 'Santo Amaro' },
        { slug: 'imbiribeira', label: 'Imbiribeira' },
        { slug: 'casa-amarela', label: 'Casa Amarela' },
        { slug: 'gracas', label: 'Graças' },
        { slug: 'tamarineira', label: 'Tamarineira' },
        { slug: 'espinheiro', label: 'Espinheiro' },
        { slug: 'cordeiro', label: 'Cordeiro' },
    ]},
    { slug: 'rs', label: 'Porto Alegre (RS)', neighborhoods: [
        { slug: 'montserrat', label: 'Montserrat' },
        { slug: 'rio-branco', label: 'Rio Branco' },
        { slug: 'bela-vista', label: 'Bela Vista' },
        { slug: 'moinhos-de-vento', label: 'Moinhos de Vento' },
        { slug: 'praia-de-belas', label: 'Praia de Belas' },
        { slug: 'petropolis', label: 'Petrópolis' },
        { slug: 'menino-deus', label: 'Menino Deus' },
        { slug: 'centro-historico', label: 'Centro Histórico' },
        { slug: 'santa-tereza', label: 'Santa Tereza' },
        { slug: 'nonoai', label: 'Nonoai' },
    ]},
    { slug: 'pr', label: 'Curitiba (PR)', neighborhoods: [
        { slug: 'batel', label: 'Batel' },
        { slug: 'bigorrilho', label: 'Bigorrilho' },
        { slug: 'juveve', label: 'Juvevê' },
        { slug: 'ahu', label: 'Ahú' },
        { slug: 'agua-verde', label: 'Água Verde' },
        { slug: 'cabral', label: 'Cabral' },
        { slug: 'centro', label: 'Centro' },
        { slug: 'campo-comprido', label: 'Campo Comprido' },
        { slug: 'portao', label: 'Portão' },
        { slug: 'cidade-industrial-de-curitiba', label: 'Cidade Industrial de Curitiba' },
    ]},
    { slug: 'sc', label: 'Florianópolis (SC)', neighborhoods: [
        { slug: 'agronomica', label: 'Agronômica' },
        { slug: 'centro', label: 'Centro' },
        { slug: 'corrego-grande', label: 'Córrego Grande' },
        { slug: 'itacorubi', label: 'Itacorubi' },
        { slug: 'trindade', label: 'Trindade' },
        { slug: 'saco-dos-limoes', label: 'Saco dos Limões' },
        { slug: 'estreito', label: 'Estreito' },
        { slug: 'coqueiros', label: 'Coqueiros' },
        { slug: 'ingleses-do-rio-vermelho', label: 'Ingleses do Rio Vermelho' },
        { slug: 'capoeiras', label: 'Capoeiras' },
    ]},
    { slug: 'es', label: 'Vitória (ES)', neighborhoods: [
        { slug: 'enseada-do-sua', label: 'Enseada do Suá' },
        { slug: 'praia-do-canto', label: 'Praia do Canto' },
        { slug: 'mata-da-praia', label: 'Mata da Praia' },
        { slug: 'barro-vermelho', label: 'Barro Vermelho' },
        { slug: 'aeroporto', label: 'Aeroporto' },
        { slug: 'ilha-do-boi', label: 'Ilha do Boi' },
        { slug: 'jardim-camburi', label: 'Jardim Camburi' },
        { slug: 'santa-lucia', label: 'Santa Lúcia' },
        { slug: 'bento-ferreira', label: 'Bento Ferreira' },
        { slug: 'jardim-da-penha', label: 'Jardim da Penha' },
    ]},
    { slug: 'go', label: 'Goiânia (GO)', neighborhoods: [
        { slug: 'marista', label: 'Marista' },
        { slug: 'sul', label: 'Sul' },
        { slug: 'bueno', label: 'Bueno' },
        { slug: 'jardim-goias', label: 'Jardim Goiás' },
        { slug: 'jardim-america', label: 'Jardim América' },
        { slug: 'oeste', label: 'Oeste' },
        { slug: 'pedro-ludovicobela-vista', label: 'Pedro Ludovico/Bela Vista' },
        { slug: 'aeroporto', label: 'Aeroporto' },
        { slug: 'nova-suica', label: 'Nova Suíça' },
        { slug: 'central', label: 'Central' },
    ]},
    { slug: 'pb', label: 'João Pessoa (PB)', neighborhoods: [
        { slug: 'cabo-branco', label: 'Cabo Branco' },
        { slug: 'jardim-oceania', label: 'Jardim Oceania' },
        { slug: 'altiplano-cabo-branco', label: 'Altiplano Cabo Branco' },
        { slug: 'brisamar', label: 'Brisamar' },
        { slug: 'manaira', label: 'Manaíra' },
        { slug: 'aeroclube', label: 'Aeroclube' },
        { slug: 'bessa', label: 'Bessa' },
        { slug: 'torre', label: 'Torre' },
        { slug: 'portal-do-sol', label: 'Portal do Sol' },
        { slug: 'jardim-cidade-universitaria', label: 'Jardim Cidade Universitária' },
    ]},
    { slug: 'ms', label: 'Campo Grande (MS)', neighborhoods: [
        { slug: 'bela-vista', label: 'Bela Vista' },
        { slug: 'jardim-dos-estados', label: 'Jardim dos Estados' },
        { slug: 'caranda', label: 'Carandá' },
        { slug: 'planalto', label: 'Planalto' },
        { slug: 'mata-do-jacinto', label: 'Mata do Jacinto' },
        { slug: 'sao-francisco', label: 'São Francisco' },
        { slug: 'tiradentes', label: 'Tiradentes' },
        { slug: 'rita-vieira', label: 'Rita Vieira' },
        { slug: 'centro', label: 'Centro' },
        { slug: 'cruzeiro', label: 'Cruzeiro' },
    ]},
    { slug: 'al', label: 'Maceió (AL)', neighborhoods: [
        { slug: 'pajucara', label: 'Pajuçara' },
        { slug: 'jacarecica', label: 'Jacarecica' },
        { slug: 'ponta-verde', label: 'Ponta Verde' },
        { slug: 'jatiuca', label: 'Jatiúca' },
        { slug: 'cruz-das-almas', label: 'Cruz das Almas' },
        { slug: 'mangabeiras', label: 'Mangabeiras' },
        { slug: 'poco', label: 'Poço' },
        { slug: 'gruta-de-lourdes', label: 'Gruta de Lourdes' },
        { slug: 'serraria', label: 'Serraria' },
        { slug: 'feitosa', label: 'Feitosa' },
    ]},
    { slug: 'am', label: 'Manaus (AM)', neighborhoods: [
        { slug: 'adrianopolis', label: 'Adrianópolis' },
        { slug: 'aleixo', label: 'Aleixo' },
        { slug: 'ponta-negra', label: 'Ponta Negra' },
        { slug: 'dom-pedro-i', label: 'Dom Pedro I' },
        { slug: 'nossa-senhora-das-gracas', label: 'Nossa Senhora das Graças' },
        { slug: 'parque-10-de-novembro', label: 'Parque 10 de Novembro' },
        { slug: 'centro', label: 'Centro' },
        { slug: 'flores', label: 'Flores' },
        { slug: 'compensa', label: 'Compensa' },
        { slug: 'japiim', label: 'Japiim' },
    ]},
    { slug: 'ma', label: 'São Luís (MA)', neighborhoods: [
        { slug: 'ponta-dareia', label: "Ponta D'Areia" },
        { slug: 'sao-marcos', label: 'São Marcos' },
        { slug: 'ponta-do-farol', label: 'Ponta do Farol' },
        { slug: 'calhau', label: 'Calhau' },
        { slug: 'quintas-do-calhau', label: 'Quintas do Calhau' },
        { slug: 'renascenca', label: 'Renascença' },
        { slug: 'olho-dagua', label: "Olho D'Água" },
        { slug: 'cohama', label: 'Cohama' },
        { slug: 'angelim', label: 'Angelim' },
        { slug: 'turu', label: 'Turu' },
    ]},
    { slug: 'pi', label: 'Teresina (PI)', neighborhoods: [
        { slug: 'joquei', label: 'Jóquei' },
        { slug: 'sao-cristovao', label: 'São Cristóvão' },
        { slug: 'fatima', label: 'Fátima' },
        { slug: 'horto', label: 'Horto' },
        { slug: 'planalto', label: 'Planalto' },
        { slug: 'ininga', label: 'Ininga' },
        { slug: 'noivos', label: 'Noivos' },
        { slug: 'uruguai', label: 'Uruguai' },
        { slug: 'santa-isabel', label: 'Santa Isabel' },
        { slug: 'centro', label: 'Centro' },
    ]},
    { slug: 'se', label: 'Aracaju (SE)', neighborhoods: [
        { slug: 'jardins', label: 'Jardins' },
        { slug: 'coroa-do-meio', label: 'Coroa do Meio' },
        { slug: 'farolandia', label: 'Farolândia' },
        { slug: 'luzia', label: 'Luzia' },
        { slug: 'grageru', label: 'Grageru' },
        { slug: 'ponto-novo', label: 'Ponto Novo' },
        { slug: 'jabotiana', label: 'Jabotiana' },
        { slug: 'treze-de-julho', label: 'Treze de Julho' },
        { slug: 'salgado-filho', label: 'Salgado Filho' },
        { slug: 'sao-jose', label: 'São José' },
    ]},
    { slug: 'pa', label: 'Belém (PA)', neighborhoods: [
        { slug: 'jurunas', label: 'Jurunas' },
        { slug: 'umarizal', label: 'Umarizal' },
        { slug: 'nazare', label: 'Nazaré' },
        { slug: 'reduto', label: 'Reduto' },
        { slug: 'marco', label: 'Marco' },
        { slug: 'sao-bras', label: 'São Brás' },
        { slug: 'cremacao', label: 'Cremação' },
        { slug: 'batista-campos', label: 'Batista Campos' },
        { slug: 'pedreira', label: 'Pedreira' },
        { slug: 'campina', label: 'Campina' },
    ]},
    { slug: 'mt', label: 'Cuiabá (MT)', neighborhoods: [
        { slug: 'jardim-cuiaba', label: 'Jardim Cuiabá' },
        { slug: 'duque-de-caxias', label: 'Duque de Caxias' },
        { slug: 'ribeirao-do-lipa', label: 'Ribeirão do Lipa' },
        { slug: 'area-de-expansao-urbana', label: 'Área de Expansão Urbana' },
        { slug: 'cidade-alta', label: 'Cidade Alta' },
        { slug: 'da-goiabeira', label: 'da Goiabeira' },
        { slug: 'do-quilombo', label: 'do Quilombo' },
        { slug: 'do-porto', label: 'do Porto' },
        { slug: 'dos-araes', label: 'dos Araés' },
        { slug: 'centro-norte', label: 'Centro Norte' },
    ]},
    { slug: 'rn', label: 'Natal (RN)', neighborhoods: [
        { slug: 'capim-macio', label: 'Capim Macio' },
        { slug: 'ponta-negra', label: 'Ponta Negra' },
        { slug: 'tirol', label: 'Tirol' },
        { slug: 'lagoa-nova', label: 'Lagoa Nova' },
        { slug: 'nossa-senhora-de-nazare', label: 'Nossa Senhora de Nazaré' },
        { slug: 'ribeira', label: 'Ribeira' },
        { slug: 'neopolis', label: 'Neópolis' },
        { slug: 'petropolis', label: 'Petrópolis' },
        { slug: 'candelaria', label: 'Candelária' },
        { slug: 'praia-do-meio', label: 'Praia do Meio' },
    ]},
];

// ═══════════════════════════════════════════
// AUTOCOMPLETE
// ═══════════════════════════════════════════

// Mapa reverso: slug do bairro → lista de slugs de cidades
const NEIGHBORHOOD_CITY_MAP = {};
LOCATION_DATA.forEach(city => {
    city.neighborhoods.forEach(n => {
        if (!NEIGHBORHOOD_CITY_MAP[n.slug]) NEIGHBORHOOD_CITY_MAP[n.slug] = [];
        NEIGHBORHOOD_CITY_MAP[n.slug].push(city.slug);
    });
});

const cityPickerList = document.getElementById('cityPickerList');
let pickerOpen = false;
let pickerCities = [];
let pickerIndex = 0;
let openingPicker = false; // guard contra focus recursivo

function updatePickerHighlight() {
    const items = cityPickerList.querySelectorAll('.city-picker-item');
    items.forEach((el, i) => el.classList.toggle('selected', i === pickerIndex));
    estadoInput.value = pickerCities[pickerIndex];
    items[pickerIndex]?.scrollIntoView({ block: 'nearest' });
}

function closePicker() {
    cityPickerList.classList.remove('open');
    pickerOpen = false;
}

function confirmPicker() {
    estadoInput.value = pickerCities[pickerIndex];
    closePicker();
}

function showCityPicker(citySlugs) {
    pickerCities = citySlugs;
    // preserva a seleção atual se já estava na lista
    const currentIdx = citySlugs.indexOf(estadoInput.value.trim());
    pickerIndex = currentIdx >= 0 ? currentIdx : 0;

    cityPickerList.innerHTML = '';
    citySlugs.forEach((slug, i) => {
        const item = document.createElement('div');
        item.className = 'city-picker-item' + (i === pickerIndex ? ' selected' : '');
        item.textContent = slug;
        item.addEventListener('mousedown', (e) => {
            e.preventDefault();
            pickerIndex = i;
            confirmPicker();
        });
        cityPickerList.appendChild(item);
    });

    cityPickerList.classList.add('open');
    pickerOpen = true;
    estadoInput.value = citySlugs[pickerIndex];

    openingPicker = true;
    estadoInput.focus();
    openingPicker = false;
}

// Rollback: clicar no input Cidade reabre o picker se o bairro é ambíguo
estadoInput.addEventListener('focus', () => {
    if (openingPicker || pickerOpen) return;
    const neighborhood = cidadeInput.value.trim();
    const cities = NEIGHBORHOOD_CITY_MAP[neighborhood];
    if (cities && cities.length > 1) showCityPicker(cities);
});

// Navegação por teclado no picker — captura antes do autocomplete
estadoInput.addEventListener('keydown', (e) => {
    if (!pickerOpen) return;
    if (e.key === 'ArrowDown') {
        e.preventDefault();
        e.stopImmediatePropagation();
        pickerIndex = Math.min(pickerIndex + 1, pickerCities.length - 1);
        updatePickerHighlight();
    } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        e.stopImmediatePropagation();
        pickerIndex = Math.max(pickerIndex - 1, 0);
        updatePickerHighlight();
    } else if (e.key === 'Enter') {
        e.preventDefault();
        e.stopImmediatePropagation();
        confirmPicker();
    } else if (e.key === 'Escape' || e.key === 'Tab') {
        e.preventDefault();
        e.stopImmediatePropagation();
        closePicker();
    }
}, true); // capture: true — roda antes dos outros listeners

document.addEventListener('mousedown', (e) => {
    if (pickerOpen && !cityPickerList.contains(e.target) && e.target !== estadoInput) {
        closePicker();
    }
});

function setupInlineAutocomplete(input, getMatch, onComplete) {
    let skipComplete = false;

    input.addEventListener('keydown', (e) => {
        if (e.key === 'Backspace' || e.key === 'Delete') {
            skipComplete = true;
        } else if (e.key === 'Tab' || e.key === 'ArrowRight' || e.key === 'Enter') {
            const hasCompletion = input.selectionStart < input.selectionEnd &&
                                  input.selectionEnd === input.value.length;
            if (hasCompletion) {
                input.setSelectionRange(input.value.length, input.value.length);
            }
            if (onComplete && input.value) {
                const handled = onComplete(input.value);
                if (hasCompletion || handled) e.preventDefault();
            } else if (hasCompletion) {
                e.preventDefault();
            }
        }
    });

    input.addEventListener('input', () => {
        if (skipComplete) { skipComplete = false; return; }
        const typed = input.value;
        if (!typed) return;
        const match = getMatch(typed);
        if (match && match.startsWith(typed)) {
            input.value = match;
            input.setSelectionRange(typed.length, match.length);
        }
    });
}

setupInlineAutocomplete(estadoInput, (typed) => {
    return LOCATION_DATA.find(c => c.slug.startsWith(typed))?.slug ?? null;
});

setupInlineAutocomplete(cidadeInput, (typed) => {
    const citySlug = estadoInput.value.trim();
    const city = LOCATION_DATA.find(c => c.slug === citySlug);
    const pool = city ? city.neighborhoods : LOCATION_DATA.flatMap(c => c.neighborhoods);
    return pool.find(n => n.slug.startsWith(typed))?.slug ?? null;
}, (completedNeighborhood) => {
    const cities = NEIGHBORHOOD_CITY_MAP[completedNeighborhood];
    if (!cities) return false;
    if (cities.length === 1) {
        estadoInput.value = cities[0];
        return false;
    }
    showCityPicker(cities);
    return true;
});

// ═══════════════════════════════════════════
// EVENT LISTENERS
// ═══════════════════════════════════════════

downloadBtn.addEventListener('click', processAndDownloadImage);