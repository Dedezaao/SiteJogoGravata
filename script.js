// script.js
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

// COLOQUE SUAS CHAVES DO FIREBASE AQUI
const firebaseConfig = {
    apiKey: "SUA_API_KEY_AQUI",
    authDomain: "SEU_PROJETO.firebaseapp.com",
    projectId: "SEU_PROJETO_ID",
    storageBucket: "SEU_PROJETO.appspot.com",
    messagingSenderId: "SEU_SENDER_ID",
    appId: "SEU_APP_ID"
};

// Inicializando o banco
const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

let timeEscolhido = "";

// Expõe as funções para o HTML através do objeto window
window.escolherTime = function(time) {
    timeEscolhido = time;
    document.getElementById('tela-inicio').classList.remove('ativa');
    document.getElementById('tela-jogo').classList.add('ativa');
    document.getElementById('titulo-time').innerText = time === 'arrecadado_padrinhos' ? 'Time Padrinhos' : 'Time Madrinhas';
    document.getElementById('mensagem').innerText = "";
};

window.voltarInicio = function() {
    document.getElementById('tela-jogo').classList.remove('ativa');
    document.getElementById('tela-inicio').classList.add('ativa');
    document.getElementById('input-token').value = "";
    document.getElementById('input-senha').value = "";
};

// Evento de clique para validar a senha
document.getElementById('btn-tentar').addEventListener('click', async () => {
    const tokenVal = document.getElementById('input-token').value.trim().toUpperCase();
    const senhaVal = document.getElementById('input-senha').value.trim();
    const msgDiv = document.getElementById('mensagem');
    const btn = document.getElementById('btn-tentar');

    if (!tokenVal || senhaVal.length !== 3) {
        msgDiv.style.color = "#ef4444";
        msgDiv.innerText = "Preencha o Token e 3 números da senha!";
        return;
    }

    btn.disabled = true;
    btn.innerText = "Validando...";

    try {
        const tokenRef = doc(db, "tokens", tokenVal);
        const configRef = doc(db, "configuracao", "geral");

        const tokenSnap = await getDoc(tokenRef);
        if (!tokenSnap.exists()) {
            throw new Error("❌ Token não encontrado!");
        }
        if (tokenSnap.data().usado === true) {
            throw new Error("⚠️ Este token já foi usado!");
        }

        // Atualiza banco: Queima o token e soma R$ 30
        await updateDoc(tokenRef, { usado: true }); 
        await updateDoc(configRef, { [timeEscolhido]: increment(30) });

        // Verifica a senha
        const configSnap = await getDoc(configRef);
        if (senhaVal === configSnap.data().senha_premiada) {
            msgDiv.style.color = "#22c55e"; 
            msgDiv.innerText = "🎉 ACERTOU! MALA LIBERADA!";
            btn.innerText = "VENCEDOR!";
        } else {
            msgDiv.style.color = "#ef4444"; 
            msgDiv.innerText = "😅 ERROU! A lua de mel agradece. Tente outra vez!";
            btn.innerText = "TENTAR ABRIR!";
            btn.disabled = false;
        }

    } catch (error) {
        msgDiv.style.color = "#ef4444";
        msgDiv.innerText = error.message.replace("FirebaseError: ", "");
        btn.innerText = "TENTAR ABRIR!";
        btn.disabled = false;
    }
});