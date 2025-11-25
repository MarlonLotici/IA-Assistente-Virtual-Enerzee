// =================================================================
// CONFIGURAÇÃO
// =================================================================
const WORKER_URL = "https://jolly-morning-6b1f.marlonlotici6.workers.dev/"; 
const WEB3FORMS_ACCESS_KEY = "4ee5d80b-0860-4b79-a30d-5c0392c46ff4"; 
const WHATSAPP_NUMBER = "5546999201690"; 
const CALENDLY_LINK = "https://calendly.com/marlon-enerzee/consultoria"; 

// =================================================================
// ESTADO
// =================================================================
const chatMessages = document.getElementById('chat-messages');
const inputContainer = document.getElementById('input-container');
const progressBar = document.getElementById('progress-bar');

let leadData = { propertyType: null, city: null, billValue: null };
let conversationHistory = []; 
let uploadedFile = null; 
let manualInputMode = false; // Variável de controle do Loop

// =================================================================
// UI HELPERS
// =================================================================

function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
    }, 100);
}

function updateProgress(percent) {
    progressBar.style.width = `${percent}%`;
}

function addMessage(text, sender = 'ia', isHtml = false) {
    if (text.includes("#TRIGGER_CALENDLY#")) return;

    const div = document.createElement('div');
    div.className = `chat-message flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const bubble = document.createElement('div');
    bubble.className = `max-w-[85%] p-4 rounded-2xl text-sm md:text-base shadow-sm ${
        sender === 'user' ? 'bubble-user' : 'bubble-ia'
    }`;

    let formattedText = text.replace(/\n/g, '<br>');
    if (isHtml) bubble.innerHTML = text;
    else bubble.innerHTML = formattedText;

    div.appendChild(bubble);
    chatMessages.appendChild(div);
    scrollToBottom();
    if (typeof lucide !== 'undefined') lucide.createIcons();

    if (!isHtml) conversationHistory.push({ role: sender, content: text });
}

function showTypingIndicator() {
    if (document.getElementById('typing-indicator')) return;
    const div = document.createElement('div');
    div.id = 'typing-indicator';
    div.className = 'chat-message flex justify-start';
    div.innerHTML = `
        <div class="bubble-ia p-4 rounded-2xl flex gap-1">
            <div class="typing-dot w-2 h-2 bg-slate-400 rounded-full"></div>
            <div class="typing-dot w-2 h-2 bg-slate-400 rounded-full"></div>
            <div class="typing-dot w-2 h-2 bg-slate-400 rounded-full"></div>
        </div>`;
    chatMessages.appendChild(div);
    scrollToBottom();
}

function hideTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
}

// =================================================================
// CONEXÃO COM A IA
// =================================================================

async function sendToGemini(userMessage, imageBase64 = null) {
    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                history: conversationHistory,
                leadData: leadData,
                imageBase64: imageBase64
            })
        });
        if (!response.ok) throw new Error('Erro API');
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error(error);
        return "Minha conexão oscilou. Pode repetir?";
    }
}

// =================================================================
// FLUXO INICIAL
// =================================================================

function startConversation() {
    updateProgress(10);
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        addMessage("Olá! 🐦 Eu sou o **Zee**, seu especialista em economia da Enerzee.");
        setTimeout(() => {
            addMessage("Vou analisar seu perfil para descobrirmos quanto você pode economizar (Solar ou Assinatura).");
            setTimeout(() => {
                addMessage("Pra começar e eu personalizar sua análise: **Em qual cidade você mora?**");
                showSimpleInput(); 
            }, 800);
        }, 1000);
    }, 600);
}

function showSimpleInput() {
    inputContainer.innerHTML = `
        <form id="chat-form" class="flex gap-2 w-full">
            <input type="text" id="chat-input" placeholder="Digite aqui..." class="flex-1 p-4 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-slate-50">
            <button type="submit" class="bg-green-600 text-white p-4 rounded-xl hover:bg-green-700 transition-colors shadow-lg"><i data-lucide="send" class="w-5 h-5"></i></button>
        </form>
    `;
    
    document.getElementById('chat-form').onsubmit = async (e) => {
        e.preventDefault();
        const textInput = document.getElementById('chat-input');
        const text = textInput.value;
        if(!text.trim()) return;

        textInput.value = ''; 
        addMessage(text, 'user');
        handleFlow(text); 
    };
    lucide.createIcons();
    document.getElementById('chat-input').focus();
}

// =================================================================
// CONTROLADOR DE FLUXO
// =================================================================

async function handleFlow(userText) {
    showTypingIndicator();

    if (!leadData.city) {
        leadData.city = userText;
        updateProgress(30);
    }

    // Captura valor se estiver em modo manual
    if (manualInputMode && !leadData.billValue) {
        const numbers = userText.match(/\d+/g);
        if (numbers) {
            leadData.billValue = numbers.join('');
            updateProgress(60);
        }
    }

    const response = await sendToGemini(userText);
    hideTypingIndicator();

    if (response.includes("#TRIGGER_CALENDLY#")) {
        addMessage("Excelente! Vamos agendar sua consultoria para garantir essa condição.", 'ia');
        triggerFinalFlow();
    } else {
        addMessage(response, 'ia');
        
        // CORREÇÃO DO LOOP:
        // Só mostra botões de upload se NÃO estivermos em modo manual.
        // Se manualInputMode for true, ignoramos qualquer sugestão de "fatura" da IA
        // e mantemos o input de texto simples.
        const suggestsBill = response.toLowerCase().includes("fatura") || response.toLowerCase().includes("conta de luz") || response.toLowerCase().includes("digitar o valor");
        
        if (!manualInputMode && suggestsBill) {
            showBillInputOptions();
        } else {
            // Garante que o campo de texto esteja visível se não for mostrar botões
            // Verifica se o inputContainer já tem o form, se não, recria
            if (!document.getElementById('chat-form')) {
                showSimpleInput();
            }
        }
    }
}

// =================================================================
// OPÇÕES DE FATURA
// =================================================================

function showBillInputOptions() {
    inputContainer.innerHTML = `
        <div class="flex gap-2 w-full animate-fade-in">
            <label class="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-800 font-bold py-4 rounded-xl cursor-pointer hover:bg-green-200 transition-colors border border-green-300">
                <i data-lucide="camera" class="w-5 h-5"></i> Enviar Foto/PDF
                <input id="file-upload" type="file" accept="image/*,application/pdf" class="hidden">
            </label>
            <button onclick="restoreManualInput()" class="px-6 bg-white border-2 border-slate-200 text-slate-600 font-medium py-4 rounded-xl hover:border-green-500 hover:text-green-600 transition-colors">
                Digitar Valor
            </button>
        </div>
    `;
    document.getElementById('file-upload').addEventListener('change', handleFileSelect);
    lucide.createIcons();
}

function restoreManualInput() {
    manualInputMode = true; // TRAVA O MODO MANUAL
    addMessage("Prefiro digitar o valor.", 'user');
    
    // Restaura o input IMEDIATAMENTE para o usuário digitar
    showSimpleInput(); 
    
    // Opcional: Mandar mensagem oculta pra IA saber que vai digitar,
    // mas não é estritamente necessário se o usuário já vai digitar em seguida.
    // Se quiser que a IA responda "Ok, digite", descomente abaixo:
    // handleFlow("Vou digitar o valor manualmente.");
}

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    uploadedFile = file;
    
    addMessage(`<div class="flex items-center gap-2"><i data-lucide="file-check" class="w-4 h-4"></i> Arquivo anexado: ${file.name}</div>`, 'user', true);
    inputContainer.innerHTML = ''; 
    updateProgress(60);
    
    addMessage("🔍 O Zee está analisando sua fatura... Projetando economia de 5 anos... Só um instante.", 'ia');
    showTypingIndicator();

    const reader = new FileReader();
    reader.onloadend = async function() {
        const base64String = reader.result;
        const aiResponse = await sendToGemini("O cliente enviou a fatura. Analise e apresente a economia acumulada em 5 Anos (com inflação) e impacto ambiental. Não fale porcentagens.", base64String);
        
        hideTypingIndicator();
        addMessage(aiResponse, 'ia');
        showSimpleInput(); 
    };
    reader.readAsDataURL(file);
}

// =================================================================
// FINALIZAÇÃO
// =================================================================

function triggerFinalFlow() {
    updateProgress(100);
    sendEmailReport();

    inputContainer.innerHTML = `
        <div class="flex flex-col gap-3 w-full animate-fade-in p-2">
            <div class="bg-green-50 text-green-800 p-3 rounded-lg text-center text-sm font-medium border border-green-200">
                ✅ Pré-análise aprovada!
            </div>
            <button onclick="openCalendly()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105">
                <i data-lucide="calendar-check" class="w-5 h-5"></i>
                Agendar Reunião Agora
            </button>
            <a href="${generateWhatsappLink()}" target="_blank" class="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm">
                <i data-lucide="message-circle" class="w-4 h-4"></i>
                Falar direto no WhatsApp
            </a>
        </div>
    `;
    lucide.createIcons();
    
    addMessage(`📅 **Tudo pronto!**<br>Para confirmar, escolha o melhor horário na minha agenda abaixo. Assim garantimos que o Marlon estará disponível para você.`, 'ia', true);
}

function openCalendly() {
    if (window.Calendly) {
        window.Calendly.initPopupWidget({ url: CALENDLY_LINK });
    } else {
        window.open(CALENDLY_LINK, '_blank');
    }
}

function generateWhatsappLink() {
    const text = `Olá Marlon! 👋\n\nVim pelo Zee (IA).\nGostaria de confirmar a consultoria.\n\n*Interesse:* ${leadData.propertyType || 'Energia Solar'}\n*Cidade:* ${leadData.city || 'PR'}\n\nPodemos conversar?`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

async function sendEmailReport() {
    let htmlHistory = conversationHistory.map(msg => 
        `<p style="margin-bottom: 5px;"><b>${msg.role.toUpperCase()}:</b> ${msg.content}</p>`
    ).join('');

    const htmlBody = `
        <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: #16a34a;">🚀 Novo Lead Qualificado (Via Zee IA)</h2>
            <p>Cliente chegou na fase de agendamento.</p>
            <hr>
            <h3>📊 Dados Capturados</h3>
            <ul>
                <li><b>Cidade:</b> ${leadData.city || "Ver histórico"}</li>
                <li><b>Tipo:</b> ${leadData.propertyType || "Ver histórico"}</li>
                <li><b>Fatura Estimada:</b> ${leadData.billValue || "Ver histórico"}</li>
            </ul>
            <hr>
            <h3>💬 Histórico Completo</h3>
            <div style="background:#f9fafb; padding:15px; border-radius:8px; font-size: 14px;">
                ${htmlHistory}
            </div>
        </div>
    `;

    const formData = new FormData();
    formData.append("access_key", WEB3FORMS_ACCESS_KEY); 
    formData.append("subject", `🔥 Lead Enerzee: ${leadData.city || 'Novo'} - ${leadData.propertyType || 'Consultoria'}`);
    formData.append("message", htmlBody); 
    
    if (uploadedFile) {
        formData.append("attachment", uploadedFile);
    }

    fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
}

window.onload = () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    startConversation();
};