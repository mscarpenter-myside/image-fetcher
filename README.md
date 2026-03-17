# MySide Image Fetcher

Uma extensão para Google Chrome projetada para otimizar o fluxo de trabalho de SEO imobiliário, permitindo a captura, redimensionamento e compressão de imagens diretamente do navegador.

---

### 📖 [Acessar Guia do Usuário (HTML Interativo)](./guide-web/index.html)
### 📄 [Acessar Guia do Usuário (PDF)](./docs/guia-image-fetcher.pdf)
*Consulte o guia completo para instruções detalhadas de instalação e uso.*

---

## Funcionalidades

- **Menu:** Envie qualquer imagem da web diretamente para o painel lateral com um clique direito.
- **Redimensionamento:** Ajuste automático para a largura padrão de **747px** utilizando algoritmos de multi-step downscaling para máxima qualidade.
- **Compressão Otimizada:** Busca binária de qualidade para garantir que as imagens fiquem abaixo dos limites ideais (Capa: 100kb | Corpo: 150kb).
- **SEO & Nomenclatura Inteligente:**
  - **Campos:** Descrição (2 campos opcionais), Bairro (obrigatório) e Cidade (opcional).
  - **Autocomplete Inline:** Sugestão nos campos Bairro e Cidade. O texto é completado à frente e pode ser confirmado com `Tab`, ou `Enter`.
  - **Lógica de Localização:**
    - **Formato de Cidade:** Cidades são identificadas pelo slug do nome (ex: `belo-horizonte`, `sao-paulo`, `rio-de-janeiro`).
    - **Vínculo Bairro-Cidade:** Ao confirmar um Bairro único, a Cidade é preenchida automaticamente via índice reverso.
    - **City Picker:** Para bairros presentes em múltiplas cidades, um seletor visual abre automaticamente no campo Cidade, permitindo navegação via teclado (`↑`, `↓`, `Enter`) ou clique.
    - **Rollback:** Clique no campo Cidade para reabrir as opções e corrigir a seleção sem redigitar o bairro.
  - **Padronização:** Arquivos salvos no padrão `descricao-bairro-cidade.jpg` (cidade omitida se não preenchida) com higienização de caracteres (sem acentos ou espaços).
- **Temas Personalizados:** Suporte para temas Light, Dark e o exclusivo MySide.

## 🛠️ Instalação e Uso

Para instruções completas de como baixar, instalar e utilizar a extensão, consulte o nosso **[Guia de Usuário](./docs/guia-image-fetcher.pdf)**.

### Resumo rápido:
- [Baixe myside-image-fetcher.zip](https://drive.google.com/drive/folders/1SnsAoE3Sx1T9oFIe6wOR8gLVyRwCe4UV?usp=drive_link).
- Acesse [chrome://extensions/](chrome://extensions/) no seu navegador.
- Ative o **"Modo do desenvolvedor"**.
- Clique em **"Carregar sem compactação"** e selecione a pasta raiz da extensão.

## ⚙️ Configuração

As chaves e tokens de API devem ser configurados em um arquivo `.env` na raiz do projeto (veja o arquivo `.env.example` para referência).

## 📄 Licença

Este projeto é de uso interno da MySide.
