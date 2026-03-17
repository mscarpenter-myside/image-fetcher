# MySide Image Fetcher

Uma extensão para Google Chrome projetada para otimizar o fluxo de trabalho de SEO imobiliário, permitindo a captura, redimensionamento e compressão de imagens diretamente do navegador.

---

### 📖 [Acessar Guia do Usuário (HTML Interativo)](./guide-web/index.html)
### 📄 [Acessar Guia do Usuário (PDF)](./docs/guia-image-fetcher.pdf)
*Consulte o guia completo para instruções detalhadas de instalação e uso.*

---

## Principais Funcionalidades

- **Captura Inteligente:** Envie qualquer imagem da web diretamente para o painel lateral com um clique direito utilizando o menu de contexto.
- **Redimensionamento Profissional:** Ajuste automático para a largura padrão de **747px** com algoritmos de multi-step downscaling para garantir nitidez.
- **Compressão de Alta Performance:** Compressão inteligente que garante arquivos leves sem perda perceptível de qualidade (Capa: até 100kb | Corpo: até 150kb).
- **SEO & Nomenclatura Automatizada:**
  - **Campos de Metadados:** Descrição opcional (2 campos), Bairro (obrigatório) e Cidade.
  - **Autocomplete** Sugestões em tempo real para Bairro e Cidade, com confirmação via `Tab` ou `Enter`.
  - **Lógica de Localizaçã:**
    - Identificação de cidades via slug (ex: `belo-horizonte`).
    - Preenchimento automático de Cidade ao confirmar um Bairro único.
    - **City Picker:** Seletor visual automático para bairros presentes em múltiplas cidades, navegável via teclado (`↑`, `↓`, `Enter`).
  - **Padronização de Arquivos:** Nomenclatura automática no padrão `descricao-bairro-cidade.jpg`, com higienização de caracteres especiais.
- **Personalização Visual:** Escolha entre os temas **Light**, **Dark** e o tema oficial **MySide** para conforto visual.
- **Textura Paper-Style:** Interface moderna com acabamento texturizado estilo papel pautado.

## 🛠️ Instalação

Para instruções detalhadas, consulte o **[Guia de Usuário](./guide-web/index.html)**.

### Instalação Rápida:
1. [Baixe o pacote myside-image-fetcher.zip](https://drive.google.com/drive/folders/1SnsAoE3Sx1T9oFIe6wOR8gLVyRwCe4UV?usp=drive_link).
2. Descompacte o arquivo em uma pasta local.
3. Acesse `chrome://extensions/` no seu navegador Chrome.
4. Ative o **"Modo do desenvolvedor"** no canto superior direito.
5. Clique em **"Carregar sem compactação"** e selecione a pasta descompactada.

## ⚙️ Requisitos
- Google Chrome instalado.
- Chaves de API configuradas em um arquivo `.env` na raiz do projeto (veja `.env.example`).

## 📄 Licença
Uso exclusivo institucional da MySide.
