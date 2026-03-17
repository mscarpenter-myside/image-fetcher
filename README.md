# MySide Image Fetcher

Uma extensão para Google Chrome projetada para otimizar o fluxo de trabalho de SEO imobiliário, permitindo a captura, redimensionamento e compressão de imagens diretamente do navegador.

## 🚀 Funcionalidades

- **Menu de Contexto:** Envie qualquer imagem da web diretamente para o painel lateral com um clique direito.
- **Redimensionamento Inteligente:** Ajuste automático para a largura padrão de **747px** utilizando algoritmos de multi-step downscaling para máxima qualidade.
- **Compressão Otimizada:** Busca binária de qualidade para garantir que as imagens fiquem abaixo dos limites ideais:
  - **Capa:** Máximo 100kb.
  - **Corpo:** Máximo 150kb.
- **SEO Automático:** Renomeia arquivos seguindo o padrão `cidade-estado.jpg` com higienização de caracteres.
- **Temas Personalizados:** Suporte para temas Light, Dark e o exclusivo MySide.

## 🛠️ Instalação

1. Clone este repositório ou baixe os arquivos.
2. Abra o Chrome e acesse `chrome://extensions/`.
3. Ative o **"Modo do desenvolvedor"** no canto superior direito.
4. Clique em **"Carregar sem compactação"** e selecione a pasta deste projeto.

## ⚙️ Configuração

As chaves e tokens de API devem ser configurados em um arquivo `.env` na raiz do projeto (veja o arquivo `.env.example` se disponível).

## 📄 Licença

Este projeto é de uso interno da MySide.
