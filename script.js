// script.js - DEFINITIVE WEDDING EDITION
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

    // onSnapshot para atualizar UI do admin em tempo real
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

// --- LÓGICA DA NOVA ARENA DE BATALHA ---
async function mostrarTelaPlacar() {
    document.getElementById('tela-inicio').classList.remove('ativa');
    document.getElementById('tela-placar').classList.add('ativa');
}

function atualizarArena(padrinhos, madrinhas) {
    const total = padrinhos + madrinhas;
    let percPadrinhos = 50;
    let percMadrinhas = 50;

    if (total > 0) {
        percPadrinhos = Math.round((padrinhos / total) * 100);
        percMadrinhas = 100 - percPadrinhos;
    }

    // Move a barra do Cabo de Guerra
    const barPadrinhos = document.getElementById('bar-padrinhos');
    const barMadrinhas = document.getElementById('bar-madrinhas');
    
    if (barPadrinhos && barMadrinhas) {
        barPadrinhos.style.width = percPadrinhos + '%';
        barMadrinhas.style.width = percMadrinhas + '%';
    }
    
    // Atualiza os números
    const txtPadrinhos = document.getElementById('porcentagem-padrinhos');
    const txtMadrinhas = document.getElementById('porcentagem-madrinhas');
    if(txtPadrinhos) txtPadrinhos.innerText = percPadrinhos + '%';
    if(txtMadrinhas) txtMadrinhas.innerText = percMadrinhas + '%';

    // Pega os avatares e julga a batalha
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

// --- onSnapshot GLOBAL (Controla Liberação, Batalha e Popups) ---
const configRefGlobal = doc(db, "configuracao", "geral");
onSnapshot(configRefGlobal, (doc) => {
    const data = doc.data();
    
    // 1. Lógica do Modal de Espera
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
        // Só restaura o botão se o modal de resultado de vitória/erro não estiver na tela
        if(btn && (!modalResultado || !modalResultado.classList.contains('show'))) { 
            btn.disabled = false; 
            btn.innerHTML = btnTextoOriginal; 
        }
    }

    // 2. Alimenta a Arena de Batalha com os dados novos
    const arrecPadrinhos = data.arrecadado_padrinhos || 0;
    const arrecMadrinhas = data.arrecadado_madrinhas || 0;
    
    atualizarArena(arrecPadrinhos, arrecMadrinhas);

    // --- O GATILHO MENTAL DA COMPETIÇÃO OCULTA ---
    const miniPlacarStatus = document.getElementById('mini-placar-status');
    const badgeCaixa = document.getElementById('badge-status-batalha');
    
    if(miniPlacarStatus && timeEscolhido !== "") {
        const meuCaixa = timeEscolhido === 'arrecadado_padrinhos' ? arrecPadrinhos : arrecMadrinhas;
        const caixaRival = timeEscolhido === 'arrecadado_padrinhos' ? arrecMadrinhas : arrecPadrinhos;

        if (meuCaixa > caixaRival) {
            miniPlacarStatus.innerText = "🔥 Seu time está na frente!";
            miniPlacarStatus.style.color = "#10b981"; // Verde
            badgeCaixa.style.borderColor = "#bbf7d0";
            badgeCaixa.style.background = "#f0fdf4";
        } else if (meuCaixa < caixaRival) {
            miniPlacarStatus.innerText = "⚠️ Atrás no placar! Garanta mais fichas!";
            miniPlacarStatus.style.color = "#ef4444"; // Vermelho
            badgeCaixa.style.borderColor = "#fecaca";
            badgeCaixa.style.background = "#fef2f2";
        } else {
            miniPlacarStatus.innerText = "⚔️ Batalha empatada! Desempate agora!";
            miniPlacarStatus.style.color = "#f59e0b"; // Amarelo
            badgeCaixa.style.borderColor = "#fde68a";
            badgeCaixa.style.background = "#fffbeb";
        }
    }

    // 3. O TOQUE DE MESTRE: Dispara o +30 animado se o placar subiu!
    if (oldPadrinhos !== null && arrecPadrinhos > oldPadrinhos) {
        animarMais30('avatar-padrinhos');
    }
    if (oldMadrinhas !== null && arrecMadrinhas > oldMadrinhas) {
        animarMais30('avatar-madrinhas');
    }

    oldPadrinhos = arrecPadrinhos;
    oldMadrinhas = arrecMadrinhas;
});

// Função para jogar o +R$30 pra cima do avatar!
function animarMais30(avatarId) {
    const avatar = document.getElementById(avatarId);
    if(!avatar) return;
    
    const popup = document.createElement('div');
    popup.className = 'score-popup';
    popup.innerText = '+R$30';
    
    avatar.appendChild(popup);
    
    setTimeout(() => popup.remove(), 2000);
}

// --- TRAVAS DOS INPUTS ---
document.getElementById('input-token').addEventListener('input', function(e) {
    this.value = this.value.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 4);
});

document.getElementById('input-senha').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9]/g, '').slice(0, 3);
});

// --- NAVEGAÇÃO BÁSICA ---
window.escolherTime = function(time) {
    timeEscolhido = time;
    document.getElementById('tela-inicio').classList.remove('ativa');
    document.getElementById('tela-jogo').classList.add('ativa');
    
    // Atualiza o Título e o Avatar Gigante
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
    document.getElementById('input-token').value = "";
    document.getElementById('input-senha').value = "";
    document.getElementById('btn-tentar').innerHTML = btnTextoOriginal;
    document.getElementById('btn-tentar').classList.remove('winner');
    
    if (window.adminUnsubscribe) {
        window.adminUnsubscribe();
        window.adminUnsubscribe = null;
    }
};

// --- NOVA FUNÇÃO: FECHAR O MODAL PREMIUM E RESETAR ---
window.fecharModalResultado = function() {
    document.getElementById('modal-resultado').classList.remove('show');
    document.getElementById('btn-tentar').innerHTML = btnTextoOriginal;
    document.getElementById('btn-tentar').disabled = false;
    
    // Limpa os campos para a próxima pessoa
    document.getElementById('input-token').value = "";
    document.getElementById('input-senha').value = "";
    
    // Reseta as cores do cadeado
    const cadeado = document.getElementById('cadeado-animado');
    if(cadeado) cadeado.classList.remove('success', 'error');
};

// --- O EVENTO DE CLIQUE MASTER (SUSPENSE + EXPLOSÃO) ---
document.getElementById('btn-tentar').addEventListener('click', async () => {
    const tokenVal = document.getElementById('input-token').value;
    const senhaVal = document.getElementById('input-senha').value;
    const btn = document.getElementById('btn-tentar');
    
    // Elementos do Novo Modal Premium
    const modal = document.getElementById('modal-resultado');
    const faseSuspense = document.getElementById('fase-suspense');
    const faseResultado = document.getElementById('fase-resultado');
    const tituloRes = document.getElementById('titulo-resultado');
    const textoRes = document.getElementById('texto-resultado');
    const iconeRes = document.getElementById('icone-resultado');
    const cadeado = document.getElementById('cadeado-animado');

    // Reseta cadeado antes da nova tentativa
    if(cadeado) cadeado.classList.remove('success', 'error');

    if (tokenVal.length !== 4 || senhaVal.length !== 3) {
        alert("Preencha 4 caracteres no Token e 3 números na Senha!");
        return;
    }

    // 1. INÍCIO DO SUSPENSE
    btn.disabled = true;
    
    // Mostra o Modal no Modo Cadeado Pulsante
    faseResultado.classList.remove('ativa');
    faseSuspense.classList.add('ativa');
    modal.classList.add('show');

    // Manda chover dinheiro ao fundo
    choverDinheiro();

    // Mágica: Pausa de 2.5 segundos para a agonia bater
    await new Promise(resolve => setTimeout(resolve, 2500));

    try {
        const tokenRef = doc(db, "tokens", tokenVal);
        const configRef = doc(db, "configuracao", "geral");
        
        const configSnap = await getDoc(configRef);
        const tokenSnap = await getDoc(tokenRef);

        if (!tokenSnap.exists()) throw new Error("Ficha Inexistente! Verifique o código digitado.");
        if (tokenSnap.data().usado === true) throw new Error("Atenção: Esta ficha já foi utilizada!");

        // Validação OK: Queima a ficha e adiciona os 30 reais no placar!
        await updateDoc(tokenRef, { usado: true }); 
        await updateDoc(configRef, { [timeEscolhido]: increment(30) });

        // Valida qual senha a pessoa está tentando bater
        const senhaCorreta = timeEscolhido === 'arrecadado_padrinhos' ? configSnap.data().senha_mala_1 : configSnap.data().senha_mala_2;
        
        // 2. TRANSIÇÃO PARA O RESULTADO
        faseSuspense.classList.remove('ativa');
        faseResultado.classList.add('ativa');
        
        if (senhaVal === String(senhaCorreta)) {
            // SUCESSO!
            iconeRes.innerHTML = "🔓";
            tituloRes.innerText = "ABRIU!";
            tituloRes.style.color = "#10b981"; // Verde sucesso
            textoRes.innerText = "Parabéns! Você encontrou a combinação perfeita.";
            if(cadeado) cadeado.classList.add('success');
            
            // EXPLOSÃO DE CONFETES PREMIUM (Z-Index Ajustado!)
            confetti({
                particleCount: 200,
                spread: 120,
                origin: { y: 0.5 },
                colors: ['#8b9d83', '#cca35e', '#ffffff'],
                zIndex: 10000 // Fura o vidro do modal!
            });
            
        } else {
            // ERROU!
            iconeRes.innerHTML = "🔒";
            tituloRes.innerText = "Cofre Trancado";
            tituloRes.style.color = "#ef4444"; // Vermelho erro
            if(cadeado) cadeado.classList.add('error');

            // --- LÓGICA DE PIADAS (O TOQUE DE MESTRE) ---
            const sVal = parseInt(senhaVal, 10);
            const sCorreta = parseInt(senhaCorreta, 10);

            // Verifica se errou por apenas 1 número
            if (Math.abs(sVal - sCorreta) === 1) {
                textoRes.innerText = "UHHHHH! Passou raspando! Foi por apenas 1 dígito de diferença! Pega outra ficha e tenta de novo!";
            } else {
                // Sorteia uma piada sobre o Chile
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
        // TRATAMENTO DE ERROS
        faseSuspense.classList.remove('ativa');
        faseResultado.classList.add('ativa');
        iconeRes.innerHTML = "⚠️";
        tituloRes.innerText = "Oops!";
        tituloRes.style.color = "#f59e0b"; // Amarelo aviso
        textoRes.innerText = error.message.replace("FirebaseError: ", "");
        if(cadeado) cadeado.classList.add('error');
    }
});

// --- CLIMA DE CHILE: NEVE NO FUNDO DA TELA INICIAL ---
function nevarNoChile() {
    var duration = 15 * 1000; // Neve dura 15 segundos na tela inicial
    var animationEnd = Date.now() + duration;
    var skew = 1;

    (function frame() {
        var timeLeft = animationEnd - Date.now();
        var ticks = Math.max(200, 500 * (timeLeft / duration));
        skew = Math.max(0.8, skew - 0.001);

        confetti({
            particleCount: 1,
            startVelocity: 0,
            ticks: ticks,
            origin: {
                x: Math.random(),
                y: (Math.random() * skew) - 0.2
            },
            colors: ['#ffffff'],
            shapes: ['circle'],
            gravity: Math.random() * 0.4 + 0.6,
            scalar: Math.random() * 0.4 + 0.4,
            disableForReducedMotion: true,
            zIndex: 1 // Fica atrás dos cartões brancos!
        });

        if (timeLeft > 0) {
            requestAnimationFrame(frame);
        }
    }());
}

// Inicia a neve assim que o site carrega!
nevarNoChile();