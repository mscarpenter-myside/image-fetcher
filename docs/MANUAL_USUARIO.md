# GUIA DE USUÁRIO | MySide Image Fetcher
> Otimização de Imagens e SEO Imobiliário

---

## 1. Instalação Passo a Passo

Para começar a usar o **MySide Image Fetcher**, siga o guia abaixo:

1.  **Baixar o Projeto:** Clique no botão de download (ZIP) no repositório ou receba o arquivo enviado pela equipe.
2.  **Descompactar:** Extraia o conteúdo do arquivo `.zip` em uma pasta de sua preferência no computador (ex: `Documentos/Extensoes/MySide`).
3.  **Abrir o Chrome:** No navegador Google Chrome, acesse o endereço `chrome://extensions/`.
4.  **Modo do Desenvolvedor:** No canto superior direito da página, ative a chave **"Modo do desenvolvedor"**.
5.  **Carregar Extensão:** 
    * Clique no botão **"Carregar sem compactação"** que apareceu no canto superior esquerdo.
    * Selecione a pasta onde você descompactou os arquivos (a pasta que contém o arquivo `manifest.json`).
6.  **Fixar a Extensão:** Clique no ícone de peça de quebra-cabeça (Extensões) ao lado da barra de endereços do Chrome e clique no "pin" ao lado do **MySide Image Fetcher** para deixá-lo sempre visível.

---

## 2. Como Utilizar as Funcionalidades

### 🖱️ Capturando Imagens
Navegue em qualquer site e, ao encontrar uma imagem que deseja baixar:
1.  Clique com o **botão direito** sobre a imagem.
2.  Selecione a opção **"Enviar para MySide Image Fetcher"**.
3.  O painel lateral abrirá automaticamente com a imagem carregada.

### Configurando a Nomenclatura SEO
No painel lateral, você encontrará os campos para processamento:

1.  **Tipo de Imagem:** Selecione entre **Capa** (máximo 100kb) ou **Corpo** (máximo 150kb). A extensão aplicará a compressão ideal automaticamente.
2.  **Descrição (Opcional):** Dois campos para adicionar detalhes como "Praça-da" ou "P".
3.  **Bairro e Cidade:**
    *   **Autocomplete:** Comece a digitar e a extensão sugerirá o nome. Aperte `Tab` ou `Enter` para aceitar.
    *   **Auto-Preenchimento:** Ao preencher o Bairro, a Cidade será preenchida automaticamente se for um bairro único em nossa base.
    *   **City Picker:** Se o bairro existir em mais de uma cidade, um seletor aparecerá para você escolher a correta usando as setas do teclado.

### Processar e Baixar
Clique no botão **"Processar e Baixar"**. A extensão irá:
1.  Redimensionar a imagem para exatamente **747px** de largura.
2.  Comprimir o arquivo para o limite de peso selecionado (mantendo a melhor qualidade possível).
3.  Renomear o arquivo no padrão: `descricao-bairro-cidade.jpg`.
4.  Abrir a janela de salvamento do Windows/Mac.

---

## 3. Dicas de Ouro
*   **Temas:** No topo do painel, você pode alternar entre os temas **Dark**, **Light** e o oficial **MySide** para melhor conforto visual.
*   **Correção Rápida:** Errou a cidade no seletor? Clique novamente no campo **Cidade** para reabrir as opções disponíveis para aquele bairro sem precisar redigitar tudo.

---

**Engenharia de Conteúdo & Automação**
