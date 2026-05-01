// script.js - DEFINITIVE WEDDING EDITION (UX/UI OTIMIZADO)
import { initializeApp } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-app.js";
import { getFirestore, doc, getDoc, updateDoc, increment, onSnapshot } from "https://www.gstatic.com/firebasejs/10.11.0/firebase-firestore.js";
import confetti from 'https://cdn.skypack.dev/canvas-confetti'; // API DE CONFETES PREMIUM

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

// Variáveis para rastrear pontos em tempo real (Efeito Videogame)
let oldPadrinhos = null;
let oldMadrinhas = null;

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
    if (senha === '0981') mostrarTelaAdmin();
    else alert('Senha incorreta!');
};

window.acessarPlacar = function() {
    const senha = prompt('Digite a senha para Placar Competição:');
    if (senha === '0105') mostrarTelaPlacar();
    else alert('Senha incorreta!');
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

    const toggle = document.getElementById('toggle-liberado');
    toggle.addEventListener('change', async (e) => {
        await updateDoc(configRef, { liberado: e.target.checked });
    });

    const unsubscribe = onSnapshot(configRef, (doc) => {
        const data = doc.data();
        const isLiberado = data.liberado || false;
        const statusText = document.getElementById('status-text');
        
        document.getElementById('toggle-liberado').checked = isLiberado;
        statusText.textContent = isLiberado ? 'STATUS: LIBERADO ✅' : 'STATUS: BLOQUEADO 🔒';
        statusText.style.color = isLiberado ? 'var(--sage-green)' : 'var(--error-red)';
    });
    window.adminUnsubscribe = unsubscribe;
}

// --- LÓGICA DA NOVA ARENA DE BATALHA ---
async function mostrarTelaPlacar() {
    document.getElementById('tela-inicio').classList.remove('ativa');
    document.getElementById('tela-placar').classList.add('ativa');
}

function atualizarArena(padrinhos, madrinhas) {
    const total = padrinhos + madrinhas;
    let percPadrinhos = 50, percMadrinhas = 50;

    if (total > 0) {
        percPadrinhos = Math.round((padrinhos / total) * 100);
        percMadrinhas = 100 - percPadrinhos;
    }

    const barPadrinhos = document.getElementById('bar-padrinhos');
    const barMadrinhas = document.getElementById('bar-madrinhas');
    if (barPadrinhos && barMadrinhas) {
        barPadrinhos.style.width = percPadrinhos + '%';
        barMadrinhas.style.width = percMadrinhas + '%';
    }
    
    document.getElementById('porcentagem-padrinhos').innerText = percPadrinhos + '%';
    document.getElementById('porcentagem-madrinhas').innerText = percMadrinhas + '%';

    const avatarPadrinhos = document.getElementById('avatar-padrinhos');
    const avatarMadrinhas = document.getElementById('avatar-madrinhas');

    if (avatarPadrinhos && avatarMadrinhas) {
        avatarPadrinhos.classList.remove('liderando', 'perdendo');
        avatarMadrinhas.classList.remove('liderando', 'perdendo');

        if (padrinhos > madrinhas) {
            avatarPadrinhos.classList.add('liderando');
            avatarMadrinhas.classList.add('perdendo');
        } else if (madrinhas > padrinhos) {
            avatarMadrinhas.classList.add('liderando');
            avatarPadrinhos.classList.add('perdendo');
        }
    }
}

// Lógica de URL params
const urlParams = new URLSearchParams(window.location.search);
const tokenUrl = urlParams.get('token');
const timeUrl = urlParams.get('time');
if (tokenUrl) document.getElementById('input-token').value = tokenUrl.toUpperCase();
if (timeUrl) {
    if (timeUrl === 'padrinhos') escolherTime('arrecadado_padrinhos');
    else if (timeUrl === 'madrinhas') escolherTime('arrecadado_madrinhas');
}

// --- onSnapshot GLOBAL ---
const configRefGlobal = doc(db, "configuracao", "geral");
onSnapshot(configRefGlobal, (doc) => {
    const data = doc.data();
    liberado = data.liberado || false;
    const btn = document.getElementById('btn-tentar');
    const modalEspera = document.getElementById('modal-espera');
    const telaJogoAtiva = document.getElementById('tela-jogo').classList.contains('ativa');
    
    if (!liberado && telaJogoAtiva) {
        modalEspera.style.display = 'flex';
        if(btn) { btn.disabled = true; btn.innerText = 'AGUARDE...'; }
    } else {
        modalEspera.style.display = 'none';
        const modalResultado = document.getElementById('modal-resultado');
        if(btn && (!modalResultado || !modalResultado.classList.contains('show'))) { 
            btn.disabled = false; 
            btn.innerHTML = btnTextoOriginal; 
        }
    }

    const arrecPadrinhos = data.arrecadado_padrinhos || 0;
    const arrecMadrinhas = data.arrecadado_madrinhas || 0;
    atualizarArena(arrecPadrinhos, arrecMadrinhas);

    const miniPlacarStatus = document.getElementById('mini-placar-status');
    const badgeCaixa = document.getElementById('badge-status-batalha');
    
    if(miniPlacarStatus && timeEscolhido !== "") {
        const meuCaixa = timeEscolhido === 'arrecadado_padrinhos' ? arrecPadrinhos : arrecMadrinhas;
        const caixaRival = timeEscolhido === 'arrecadado_padrinhos' ? arrecMadrinhas : arrecPadrinhos;

        if (meuCaixa > caixaRival) {
            miniPlacarStatus.innerText = "🔥 Seu time está na frente!";
            miniPlacarStatus.style.color = "#10b981"; badgeCaixa.style.borderColor = "#bbf7d0"; badgeCaixa.style.background = "#f0fdf4";
        } else if (meuCaixa < caixaRival) {
            miniPlacarStatus.innerText = "⚠️ Atrás no placar! Garanta mais fichas!";
            miniPlacarStatus.style.color = "#ef4444"; badgeCaixa.style.borderColor = "#fecaca"; badgeCaixa.style.background = "#fef2f2";
        } else {
            miniPlacarStatus.innerText = "⚔️ Batalha empatada! Desempate agora!";
            miniPlacarStatus.style.color = "#f59e0b"; badgeCaixa.style.borderColor = "#fde68a"; badgeCaixa.style.background = "#fffbeb";
        }
    }

    if (oldPadrinhos !== null && arrecPadrinhos > oldPadrinhos) animarMais30('avatar-padrinhos');
    if (oldMadrinhas !== null && arrecMadrinhas > oldMadrinhas) animarMais30('avatar-madrinhas');

    oldPadrinhos = arrecPadrinhos;
    oldMadrinhas = arrecMadrinhas;
});

function animarMais30(avatarId) {
    const avatar = document.getElementById(avatarId);
    if(!avatar) return;
    const popup = document.createElement('div');
    popup.className = 'score-popup'; popup.innerText = '+R$30';
    avatar.appendChild(popup);
    setTimeout(() => popup.remove(), 2000);
}

// --- TRAVAS DOS INPUTS E MELHORIAS DE UX (FOCO E TECLADO) ---
const inputToken = document.getElementById('input-token');
const inputSenha = document.getElementById('input-senha');
const msgErro = document.getElementById('msg-erro');

inputToken.addEventListener('input', function(e) {
    this.classList.remove('input-error'); // Remove o vermelho ao começar a digitar
    msgErro.style.display = 'none'; // Esconde a mensagem de erro
    
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
    
    // UX: Pulo automático para a senha ao digitar os 4 caracteres
    if (this.value.length === 4) {
        inputSenha.focus();
    }
});

inputSenha.addEventListener('input', function(e) {
    this.classList.remove('input-error'); // Remove o vermelho ao começar a digitar
    msgErro.style.display = 'none'; // Esconde a mensagem de erro
    
    this.value = this.value.replace(/[^0-9]/g, '').slice(0, 3);
    
    // UX: Fecha o teclado do celular automaticamente ao digitar o 3º número
    if (this.value.length === 3) {
        this.blur();
    }
});

// --- NAVEGAÇÃO BÁSICA ---
window.escolherTime = function(time) {
    timeEscolhido = time;
    document.getElementById('tela-inicio').classList.remove('ativa');
    document.getElementById('tela-jogo').classList.add('ativa');
    
    if (time === 'arrecadado_padrinhos') {
        document.getElementById('titulo-time').innerText = 'Time Padrinhos';
        document.getElementById('avatar-time-jogo').innerText = '🤵🏻‍♂️';
    } else {
        document.getElementById('titulo-time').innerText = 'Time Madrinhas';
        document.getElementById('avatar-time-jogo').innerText = '💃🏻';
    }
    
    if (!liberado) {
        document.getElementById('modal-espera').style.display = 'flex';
        document.getElementById('btn-tentar').disabled = true;
        document.getElementById('btn-tentar').innerText = 'AGUARDE...';
    }
};

window.voltarInicio = function() {
    document.querySelectorAll('.tela').forEach(tela => tela.classList.remove('ativa'));
    document.getElementById('tela-inicio').classList.add('ativa');
    inputToken.value = ""; inputSenha.value = "";
    inputToken.classList.remove('input-error'); inputSenha.classList.remove('input-error');
    msgErro.style.display = 'none';
    document.getElementById('btn-tentar').innerHTML = btnTextoOriginal;
    
    if (window.adminUnsubscribe) {
        window.adminUnsubscribe();
        window.adminUnsubscribe = null;
    }
};

window.fecharModalResultado = function() {
    document.getElementById('modal-resultado').classList.remove('show');
    document.getElementById('btn-tentar').innerHTML = btnTextoOriginal;
    document.getElementById('btn-tentar').disabled = false;
    
    inputToken.value = ""; inputSenha.value = "";
    inputToken.classList.remove('input-error'); inputSenha.classList.remove('input-error');
    
    const cadeado = document.getElementById('cadeado-animado');
    if(cadeado) cadeado.classList.remove('success', 'error');
};

// --- O EVENTO DE CLIQUE MASTER ---
document.getElementById('btn-tentar').addEventListener('click', async () => {
    // Esconde o teclado caso a pessoa não tenha clicado fora do campo
    inputToken.blur(); 
    inputSenha.blur();

    const tokenVal = inputToken.value;
    const senhaVal = inputSenha.value;
    const btn = document.getElementById('btn-tentar');
    
    // UX: VALIDAÇÕES COM MENSAGEM AMIGÁVEL NA TELA (FIM DO ALERT)
    if (tokenVal.length !== 4) {
        inputToken.classList.add('input-error');
        msgErro.innerText = "⚠️ Faltou preencher o 'Seu Acesso' inteiro!";
        msgErro.style.display = 'block';
        return;
    }
    if (senhaVal.length !== 3) {
        inputSenha.classList.add('input-error');
        msgErro.innerText = "⚠️ Faltou preencher a 'Senha da Mala'!";
        msgErro.style.display = 'block';
        return;
    }

    const modal = document.getElementById('modal-resultado');
    const faseSuspense = document.getElementById('fase-suspense');
    const faseResultado = document.getElementById('fase-resultado');
    const tituloRes = document.getElementById('titulo-resultado');
    const textoRes = document.getElementById('texto-resultado');
    const iconeRes = document.getElementById('icone-resultado');
    const cadeado = document.getElementById('cadeado-animado');

    if(cadeado) cadeado.classList.remove('success', 'error');

    // 1. INÍCIO DO SUSPENSE
    btn.disabled = true;
    faseResultado.classList.remove('ativa');
    faseSuspense.classList.add('ativa');
    modal.classList.add('show');

    choverDinheiro();
    await new Promise(resolve => setTimeout(resolve, 2500)); // Suspense

    try {
        const tokenRef = doc(db, "tokens", tokenVal);
        const configRef = doc(db, "configuracao", "geral");
        
        const configSnap = await getDoc(configRef);
        const tokenSnap = await getDoc(tokenRef);

        if (!tokenSnap.exists()) throw new Error("Ficha Inexistente! Verifique o código digitado.");
        if (tokenSnap.data().usado === true) throw new Error("Atenção: Esta ficha já foi utilizada!");

        await updateDoc(tokenRef, { usado: true }); 
        await updateDoc(configRef, { [timeEscolhido]: increment(30) });

        const senhaCorreta = timeEscolhido === 'arrecadado_padrinhos' ? configSnap.data().senha_mala_1 : configSnap.data().senha_mala_2;
        
        // 2. TRANSIÇÃO PARA O RESULTADO
        faseSuspense.classList.remove('ativa');
        faseResultado.classList.add('ativa');
        
        if (senhaVal === String(senhaCorreta)) {
            iconeRes.innerHTML = "🔓";
            tituloRes.innerText = "ABRIU!";
            tituloRes.style.color = "#10b981"; 
            textoRes.innerText = "Parabéns! Você encontrou a combinação perfeita.";
            if(cadeado) cadeado.classList.add('success');
            
            confetti({
                particleCount: 200, spread: 120, origin: { y: 0.5 },
                colors: ['#8b9d83', '#cca35e', '#ffffff'], zIndex: 10000
            });
            
        } else {
            iconeRes.innerHTML = "🔒";
            tituloRes.innerText = "Cofre Trancado";
            tituloRes.style.color = "#ef4444"; 
            if(cadeado) cadeado.classList.add('error');

            const sVal = parseInt(senhaVal, 10);
            const sCorreta = parseInt(senhaCorreta, 10);

            if (Math.abs(sVal - sCorreta) === 1) {
                textoRes.innerText = "UHHHHH! Passou raspando! Foi por apenas 1 dígito de diferença! Pega outra ficha e tenta de novo!";
            } else {
                const piadasChile = [
                    "Fez mais frio que no alto da Cordilheira dos Andes! Longe demais.",
                    "Ay caramba! Essa senha não abre nem garrafa de vinho chileno.",
                    "Quase! Faltou aquele tempero de empanada chilena nessa tentativa.",
                    "Desse jeito a gente vai pro Chile de bicicleta! Vamos tentar outra ficha?",
                    "A mala continua fechada... Cuidado com o Yeti nos Andes!"
                ];
                const piadaSorteada = piadasChile[Math.floor(Math.random() * piadasChile.length)];
                textoRes.innerText = `Senha incorreta. ${piadaSorteada}\n\nMas relaxa, você ajudou a subir o placar do seu time!`;
            }
        }

    } catch (error) {
        faseSuspense.classList.remove('ativa');
        faseResultado.classList.add('ativa');
        iconeRes.innerHTML = "⚠️";
        tituloRes.innerText = "Oops!";
        tituloRes.style.color = "#f59e0b"; 
        textoRes.innerText = error.message.replace("FirebaseError: ", "");
        if(cadeado) cadeado.classList.add('error');
    }
});

function nevarNoChile() {
    var duration = 15 * 1000; 
    var animationEnd = Date.now() + duration;
    var skew = 1;

    (function frame() {
        var timeLeft = animationEnd - Date.now();
        var ticks = Math.max(200, 500 * (timeLeft / duration));
        skew = Math.max(0.8, skew - 0.001);

        confetti({
            particleCount: 1, startVelocity: 0, ticks: ticks,
            origin: { x: Math.random(), y: (Math.random() * skew) - 0.2 },
            colors: ['#ffffff'], shapes: ['circle'],
            gravity: Math.random() * 0.4 + 0.6, scalar: Math.random() * 0.4 + 0.4,
            disableForReducedMotion: true, zIndex: 1 
        });

        if (timeLeft > 0) requestAnimationFrame(frame);
    }());
}

nevarNoChile();