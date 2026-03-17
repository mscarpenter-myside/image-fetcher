// Configura o painel lateral para abrir ao clicar no ícone da extensão
chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: true })
    .catch((error) => console.error(error));

// Cria o item de menu de contexto ao instalar a extensão
chrome.runtime.onInstalled.addListener(() => {
    chrome.contextMenus.create({
        id: 'myside-fetch-image',
        title: 'Enviar para MySide Image Fetcher',
        contexts: ['image']
    });
});

// Escuta o clique no menu de contexto
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (info.menuItemId === 'myside-fetch-image') {
        // Abre o painel lateral na janela atual
        chrome.sidePanel.open({ windowId: tab.windowId });

        // Aguarda um pouco para garantir que o painel carregou e envia a URL da imagem
        setTimeout(() => {
            chrome.runtime.sendMessage({
                action: 'image_selected',
                imageUrl: info.srcUrl
            });
        }, 500);
    }
});