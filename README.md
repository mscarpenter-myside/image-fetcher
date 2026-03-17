# MySide Image Fetcher

Uma extensão para Google Chrome projetada para otimizar o fluxo de trabalho de SEO imobiliário, permitindo a captura, redimensionamento e compressão de imagens diretamente do navegador.

## 🚀 Funcionalidades

- **Menu de Contexto:** Envie qualquer imagem da web diretamente para o painel lateral com um clique direito.
- **Redimensionamento Inteligente:** Ajuste automático para a largura padrão de **747px** utilizando algoritmos de multi-step downscaling para máxima qualidade.
- **Compressão Otimizada:** Busca binária de qualidade para garantir que as imagens fiquem abaixo dos limites ideais (Capa: 100kb | Corpo: 150kb).
- **SEO & Nomenclatura Inteligente:**
  - **Autocomplete Inline:** Sugestão inteligente nos campos Bairro e Cidade. O texto é completado à frente e pode ser confirmado com `Tab`, `→` ou `Enter`.
  - **Lógica de Localização:**
    - **Cidade como Sigla:** Cidades são identificadas por suas siglas (ex: `sp`, `mg`, `rj`).
    - **Vínculo Bairro-Cidade:** Ao confirmar um Bairro único, a Cidade é preenchida automaticamente via índice reverso.
    - **City Picker:** Para bairros presentes em múltiplas cidades, um seletor visual abre automaticamente permitindo navegação via teclado (`↑`, `↓`, `Enter`) ou clique.
    - **Rollback:** Clique no campo Cidade para trocar rapidamente entre opções sugeridas sem perder o bairro digitado.
  - **Padronização:** Arquivos salvos automaticamente no padrão `bairro-sigla.jpg` com higienização de caracteres (sem acentos ou espaços).
- **Temas Personalizados:** Suporte para temas Light, Dark e o exclusivo MySide.

## 🛠️ Instalação

1. Clone este repositório ou baixe os arquivos.
2. Abra o Chrome e acesse `chrome://extensions/`.
3. Ative o **"Modo do desenvolvedor"** no canto superior direito.
4. Clique em **"Carregar sem compactação"** e selecione a pasta deste projeto.

## ⚙️ Configuração

As chaves e tokens de API devem ser configurados em um arquivo `.env` na raiz do projeto (veja o arquivo `.env.example` para referência).

---
**Engenharia de Conteúdo & Automação**
