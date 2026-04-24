// script.js - DEFINITIVE WEDDING EDITION
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// SUAS CHAVES DO FIREBASE AQUI
const firebaseConfig = {
    apiKey: "AIzaSyB_kJmyZVJaVv0VskIlhrbTSEoI-BWhcrA",
    authDomain: "gravata-do-casamento.firebaseapp.com",
    projectId: "gravata-do-casamento",
    storageBucket: "gravata-do-casamento.firebasestorage.app",
    messagingSenderId: "666542051098",
    appId: "1:666542051098:web:aa66d9ab9ba911376466a3",
    measurementId: "G-DC634PDRJJ"
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let timeEscolhido = "";
const btnTextoOriginal = "💰 TENTAR ABRIR! 🔓";

// --- TRAVAS DOS INPUTS (Obrigando o usuário a digitar certo) ---

// Token: Só permite letras e números, transforma em maiúsculo e limita a 4
document.getElementById('input-token').addEventListener('input', function(e) {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
});

// Senha: Só permite números exatos (bloqueia letras ou espaços) e limita a 3
document.getElementById('input-senha').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '').slice(0, 3);
});

// ----------------------------------------------------------------

window.escolherTime = function(time) {
    timeEscolhido = time;
    document.getElementById('tela-inicio').classList.remove('ativa');
    document.getElementById('tela-jogo').classList.add('ativa');
    document.getElementById('titulo-time').innerText = time === 'arrecadado_padrinhos' ? 'Time Padrinhos' : 'Time Madrinhas';
    document.getElementById('mensagem').style.display = "none";
};

window.voltarInicio = function() {
    document.getElementById('tela-jogo').classList.remove('ativa');
    document.getElementById('tela-inicio').classList.add('ativa');
    document.getElementById('input-token').value = "";
    document.getElementById('input-senha').value = "";
    document.getElementById('btn-tentar').innerHTML = btnTextoOriginal;
    document.getElementById('btn-tentar').classList.remove('winner');
};

// Evento de clique para Tentar a Sorte com SUSPENSE PREMIUM!
document.getElementById('btn-tentar').addEventListener('click', async () => {
    const tokenVal = document.getElementById('input-token').value;
    const senhaVal = document.getElementById('input-senha').value;
    const msgDiv = document.getElementById('mensagem');
    const btn = document.getElementById('btn-tentar');
    const telaJogo = document.getElementById('tela-jogo');

    if (tokenVal.length !== 4 || senhaVal.length !== 3) {
        msgDiv.style.display = "block";
        msgDiv.style.color = "#ef4444"; // Vermelho
        msgDiv.style.borderColor = "#7f1d1d";
        msgDiv.innerText = "Preencha 4 caracteres no Token e 3 números na Senha!";
        return;
    }

    // 1. INÍCIO DO SUSPENSE
    btn.disabled = true;
    btn.innerText = "⏳ VALIDANDO...";
    msgDiv.style.display = "none";
    btn.classList.remove('winner');
    
    // Faz o cartão inteiro tremer com classe como se a mala estivesse tentando abrir!
    telaJogo.classList.add('mala-tremendo');

    // Mágica: Pausa o código por 2.5 segundos de propósito para dar agonia!
    await new Promise(resolve => setTimeout(resolve, 2500));
    
    // FIM DO SUSPENSE
    telaJogo.classList.remove('mala-tremendo');

    try {
        const tokenRef = doc(db, "tokens", tokenVal);
        const configRef = doc(db, "configuracao", "geral");

        const tokenSnap = await getDoc(tokenRef);
        if (!tokenSnap.exists()) {
            throw new Error("❌ Token Inexistente!");
        }
        if (tokenSnap.data().usado === true) {
            throw new Error("⚠️ Essa peça já foi usada!");
        }

        // Se o token for válido, queima ele e soma o dinheiro
        await updateDoc(tokenRef, { usado: true }); 
        await updateDoc(configRef, { [timeEscolhido]: increment(30) });

        // Verifica a senha premiada (sempre comparando como Texto/String)
        const configSnap = await getDoc(configRef);
        
        msgDiv.style.display = "block";
        
        if (senhaVal === String(configSnap.data().senha_premiada)) {
            msgDiv.style.color = "#10b981"; // Verde
            msgDiv.style.borderColor = "#10b981";
            msgDiv.innerText = "🎉 ACERTOUUUU! A MALA ABRIU!";
            btn.innerText = "🏆 VENCEDOR!";
            btn.classList.add('winner'); // Ativa o pulso de vitória
        } else {
            msgDiv.style.color = "#ef4444"; // Vermelho
            msgDiv.style.borderColor = "#7f1d1d";
            msgDiv.innerText = "😅 ERROU A SENHA! Tente mais uma vez!";
            // Restaura o botão original consertando o bug
            btn.innerHTML = btnTextoOriginal;
            btn.disabled = false;
        }

    } catch (error) {
        msgDiv.style.display = "block";
        msgDiv.style.color = "#ef4444";
        msgDiv.style.borderColor = "#7f1d1d";
        msgDiv.innerText = error.message.replace("FirebaseError: ", "");
        btn.innerHTML = btnTextoOriginal;
        btn.disabled = false;
    }
});