# 🤵💍 Projeto Gravata: Edição Malas Duplas (Matheus & Beatriz)

Este sistema é uma solução de entretenimento e arrecadação digital personalizada para casamentos. O objetivo é gamificar a tradicional "hora da gravata/sapato", transformando-a em uma competição em tempo real entre Padrinhos e Madrinhas, com prêmios distintos e controle total pelos noivos.

## 🚀 O Conceito do Jogo

1. **Arrecadação:** Os convidados adquirem fichas físicas (Tokens) via PIX ou dinheiro.
2. **Acesso:** Cada ficha possui um QR Code exclusivo. Ao escanear, o convidado é levado ao site com o Token e o Time já pré-selecionados.
3. **O Desafio:** O convidado deve tentar adivinhar a senha da sua respectiva mala (Mala 1 para Padrinhos, Mala 2 para Madrinhas).
4. **O Show:** O botão de tentativa só funciona quando os noivos autorizam pelo painel de controle.

---

## 🛠️ Funcionalidades Técnicas

### 📱 Experiência do Convidado (Front-End)

- **Identidade Visual:** Estética "Sage & Cream" (Verde Sálvia e Creme), inspirada no site oficial dos noivos.
- **Leitura de Token:** Preenchimento automático via URL (`?token=XXXX&time=padrinhos`).
- **Bloqueio por Modal:** Caso a mala não tenha sido liberada pelos noivos, um Pop-up elegante informa: *"Aguarde a autorização dos noivos"*.
- **Animação de Sucesso:** Chuva de "+R$ 30,00" flutuando no fundo ao validar uma ficha.

### 🔐 Regras de Negócio e Segurança

- **Malas Duplas:** - **Padrinhos:** Tentam a **Mala 1** (Prêmio Masculino).
  - **Madrinhas:** Tentam a **Mala 2** (Prêmio Feminino).
- **Validação Atômica:** O Firebase garante que um token só seja usado uma única vez. Assim que clicado, ele é "queimado" no banco de dados.
- **Segurança de Senha:** As senhas premiadas ficam armazenadas no servidor (Firestore) e nunca são expostas no código-fonte do cliente.

### 📊 Painéis de Monitoramento

- **Página de Competição:** Gráfico de duas barras verticais para projeção em telão. Mostra a disputa percentual (quem está na frente) sem revelar os valores exatos em dinheiro para os convidados.
- **Dashboard Admin:** Página restrita para os noivos visualizarem:
  - Valor exato arrecadado por cada time.
  - Valor Total Geral.
  - Botão "Master Switch" para liberar ou travar as tentativas da mala.

---

## 🏗️ Estrutura de Dados (Firebase Firestore)

### Coleção: `configuracao/geral`

Campos necessários para o funcionamento:

- `arrecadado_padrinhos` (number)
- `arrecadado_madrinhas` (number)
- `liberado` (boolean) - *Chave que ativa o site na festa.*
- `senha_mala_1` (string) - *Senha para o time Padrinhos.*
- `senha_mala_2` (string) - *Senha para o time Madrinhas.*

### Coleção: `tokens`

Documentos nomeados com o ID do Token (ex: `A1B2`):

- `usado` (boolean)
- `time_sugerido` (string: "padrinhos" ou "madrinhas")

---

## ⚙️ Configuração de Hospedagem

O projeto foi desenhado para ser estático (HTML/CSS/JS) e hospedado via **GitHub Pages**.

1. Repositório configurado como **Public**.
2. Branch `main` ativada nas configurações de **Pages**.
3. URL oficial gerada para criação dos QR Codes:
   - `https://[usuario].github.io/gravata-casamento/?token=ID&time=padrinhos`

---

## 🎨 Paleta de Cores (Identidade Visual)

- **Sage Green:** `#8b9d83`
- **Cream/Off-White:** `#fbfaf8`
- **Blue Grey:** `#879bb0`
- **Fontes:** Montserrat (Sans-serif elegante).

---

*Desenvolvido para o casamento de Matheus Rodrigues & Beatriz Magalhães - 01/05/2026.*

Uma aplicação Single Page (SPA) desenvolvida em HTML, CSS e JavaScript puro para gamificar a tradicional "Brincadeira da Gravata" em casamentos. O sistema controla a venda de fichas (tokens), valida tentativas de abrir uma "mala premiada" e mantém um placar em tempo real entre Padrinhos e Madrinhas.

## 🚀 Funcionalidades

- **Sistema de Tokens de Uso Único:** Impede que a mesma ficha física seja usada duas vezes.
- **Placar Integrado:** Soma automaticamente R$ 30,00 ao time escolhido (Padrinhos ou Madrinhas) a cada tentativa válida.
- **Validação Segura:** A senha premiada fica segura no banco de dados, protegida contra inspeção de código no navegador.
- **Design Mobile-First:** Interface responsiva, com dark mode e cores temáticas (azul, rosa e dourado), ideal para o uso em celulares durante a festa.

## 🛠️ Tecnologias Utilizadas

- HTML5
- CSS3 (Puro)
- JavaScript (Vanilla / ES6 Modules)
- **Firebase Firestore:** Banco de dados NoSQL para controle de tokens e placar em tempo real.

## ⚙️ Como executar o projeto

1. Clone este repositório ou baixe os arquivos.
2. Crie um projeto gratuito no [Firebase](https://console.firebase.google.com/).
3. Inicialize um banco Firestore (Modo de Teste ou com Regras de Segurança aplicadas).
4. Crie uma coleção chamada `configuracao`, com um documento `geral` contendo os campos: `arrecadado_padrinhos` (number), `arrecadado_madrinhas` (number) e `senha_premiada` (string).
5. No arquivo `script.js`, substitua o objeto `firebaseConfig` pelas chaves geradas no seu console do Firebase.
6. Abra o arquivo `index.html` em qualquer navegador (Para testes com módulos locais, recomenda-se usar uma extensão como o *Live Server* no VS Code).

## 🔒 Regras de Segurança do Firestore (Recomendado)

Para evitar trapaças no dia do evento, utilize as regras de segurança presentes na documentação do projeto, que bloqueiam a criação e deleção de dados diretamente pelo navegador do cliente.

---

*Desenvolvido para o casamento do irmão! Que a lua de mel seja garantida.*
