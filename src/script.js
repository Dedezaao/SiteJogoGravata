// script.js - DEFINITIVE WEDDING EDITION
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";

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
let liberado = false;

// Função para chuva de dinheiro
function choverDinheiro() {
    for (let i = 0; i < 10; i++) {
        setTimeout(() => {
            const money = document.createElement('div');
            money.className = 'money-float';
            money.textContent = '+R$ 30,00';
            money.style.left = Math.random() * 100 + 'vw';
            document.body.appendChild(money);
            setTimeout(() => money.remove(), 2500);
        }, i * 100);
    }
}

// Funções para acesso admin e placar
window.acessarAdmin = function() {
    const senha = prompt('Digite a senha para Painel Admin:');
    if (senha === '0981') {
        mostrarTelaAdmin();
    } else {
        alert('Senha incorreta!');
    }
};

window.acessarPlacar = function() {
    const senha = prompt('Digite a senha para Placar Competição:');
    if (senha === '0105') {
        mostrarTelaPlacar();
    } else {
        alert('Senha incorreta!');
    }
};

async function mostrarTelaAdmin() {
    const configRef = doc(db, "configuracao", "geral");
    const configSnap = await getDoc(configRef);
    if (configSnap.exists()) {
        const data = configSnap.data();
        document.getElementById('admin-padrinhos').textContent = data.arrecadado_padrinhos || 0;
        document.getElementById('admin-madrinhas').textContent = data.arrecadado_madrinhas || 0;
        document.getElementById('admin-total').textContent = (data.arrecadado_padrinhos || 0) + (data.arrecadado_madrinhas || 0);
        document.getElementById('admin-senha1').textContent = data.senha_mala_1 || 'N/A';
        document.getElementById('admin-senha2').textContent = data.senha_mala_2 || 'N/A';
    }
    document.getElementById('tela-inicio').classList.remove('ativa');
    document.getElementById('tela-admin').classList.add('ativa');

    // Adicionar event listener ao toggle
    const toggle = document.getElementById('toggle-liberado');
    toggle.addEventListener('change', async (e) => {
        const status = e.target.checked;
        const configRef = doc(db, "configuracao", "geral");
        await updateDoc(configRef, { liberado: status });
    });

    // onSnapshot para atualizar UI em tempo real
    const unsubscribe = onSnapshot(configRef, (doc) => {
        const data = doc.data();
        const liberado = data.liberado || false;
        const statusText = document.getElementById('status-text');
        const toggleInput = document.getElementById('toggle-liberado');
        
        toggleInput.checked = liberado;
        statusText.textContent = liberado ? 'STATUS: LIBERADO ✅' : 'STATUS: BLOQUEADO 🔒';
        statusText.style.color = liberado ? 'var(--sage-green)' : 'var(--error-red)';
    });

    // Armazenar unsubscribe para limpar quando sair da tela
    window.adminUnsubscribe = unsubscribe;
}

async function mostrarTelaPlacar() {
    const configRef = doc(db, "configuracao", "geral");
    const configSnap = await getDoc(configRef);
    if (configSnap.exists()) {
        const data = configSnap.data();
        const padrinhos = data.arrecadado_padrinhos || 0;
        const madrinhas = data.arrecadado_madrinhas || 0;
        const total = padrinhos + madrinhas;
        let heightPadrinhos = 50;
        let heightMadrinhas = 50;
        if (total > 0) {
            heightPadrinhos = (padrinhos / total) * 100;
            heightMadrinhas = (madrinhas / total) * 100;
        }
        document.getElementById('barra-padrinhos').style.height = heightPadrinhos + '%';
        document.getElementById('barra-madrinhas').style.height = heightMadrinhas + '%';
    }
    document.getElementById('tela-inicio').classList.remove('ativa');
    document.getElementById('tela-placar').classList.add('ativa');
}

// Função para toggle liberado (removida, agora usa event listener)

// Lógica de URL params
const urlParams = new URLSearchParams(window.location.search);
const tokenUrl = urlParams.get('token');
const timeUrl = urlParams.get('time');
if (tokenUrl) {
    document.getElementById('input-token').value = tokenUrl.toUpperCase();
}
if (timeUrl) {
    if (timeUrl === 'padrinhos') {
        escolherTime('arrecadado_padrinhos');
    } else if (timeUrl === 'madrinhas') {
        escolherTime('arrecadado_madrinhas');
    }
}

// onSnapshot para liberado
const configRef = doc(db, "configuracao", "geral");
onSnapshot(configRef, (doc) => {
    const data = doc.data();
    liberado = data.liberado || false;
    const btn = document.getElementById('btn-tentar');
    const modal = document.getElementById('modal-espera');
    const telaJogoAtiva = document.getElementById('tela-jogo').classList.contains('ativa');
    if (!liberado && telaJogoAtiva) {
        modal.style.display = 'flex';
        btn.disabled = true;
        btn.innerText = 'AGUARDE...';
    } else {
        modal.style.display = 'none';
        btn.disabled = false;
        btn.innerHTML = btnTextoOriginal;
    }
});

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
    // Verificar se liberado e mostrar modal se necessário
    if (!liberado) {
        document.getElementById('modal-espera').style.display = 'flex';
        document.getElementById('btn-tentar').disabled = true;
        document.getElementById('btn-tentar').innerText = 'AGUARDE...';
    }
};

window.voltarInicio = function() {
    document.querySelectorAll('.tela').forEach(tela => tela.classList.remove('ativa'));
    document.getElementById('tela-inicio').classList.add('ativa');
    document.getElementById('input-token').value = "";
    document.getElementById('input-senha').value = "";
    document.getElementById('btn-tentar').innerHTML = btnTextoOriginal;
    document.getElementById('btn-tentar').classList.remove('winner');
    
    // Limpar unsubscribe se existir
    if (window.adminUnsubscribe) {
        window.adminUnsubscribe();
        window.adminUnsubscribe = null;
    }
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
    
    // Chuva de dinheiro
    choverDinheiro();
    
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

        // Verifica a senha premiada baseada no time
        const senhaCorreta = timeEscolhido === 'arrecadado_padrinhos' ? configSnap.data().senha_mala_1 : configSnap.data().senha_mala_2;
        
        msgDiv.style.display = "block";
        
        if (senhaVal === String(senhaCorreta)) {
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