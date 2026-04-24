# 🤵💍 A Gravata - App para Casamento

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