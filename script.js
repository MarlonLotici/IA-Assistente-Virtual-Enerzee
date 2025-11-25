// =================================================================
// CONFIGURAÇÃO
// =================================================================
const WORKER_URL = "https://jolly-morning-6b1f.marlonlotici6.workers.dev/"; 
const WEB3FORMS_ACCESS_KEY = "4ee5d80b-0860-4b79-a30d-5c0392c46ff4"; 
const WHATSAPP_NUMBER = "5546999201690"; 
// Substitua pelo SEU link do Calendly
const CALENDLY_LINK = "https://calendly.com/SEU_USUARIO/reuniao-enerzee"; 

// Estado
const chatMessages = document.getElementById('chat-messages');
const inputContainer = document.getElementById('input-container');
const progressBar = document.getElementById('progress-bar');

let leadData = { propertyType: null, city: null, billValue: null };
let conversationHistory = []; 

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
    // Classes definidas no CSS do HTML (bubble-ia / bubble-user)
    bubble.className = `max-w-[85%] p-4 rounded-2xl text-sm md:text-base ${sender === 'user' ? 'bubble-user' : 'bubble-ia'}`;

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
            <div class="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
            <div class="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
            <div class="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>`;
    chatMessages.appendChild(div);
    scrollToBottom();
}

function hideTypingIndicator() {
    const el = document.getElementById('typing-indicator');
    if (el) el.remove();
}

// =================================================================
// CONEXÃO IA
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
// FLUXO DE TRIAGEM (GPCTBA)
// =================================================================

function startConversation() {
    updateProgress(10);
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        addMessage("Olá! 🐦 Sou o **Zee**, seu consultor de economia.");
        setTimeout(() => {
            addMessage("Vou analisar seu perfil rapidinho para descobrirmos quanto você pode economizar (Solar ou Assinatura).");
            setTimeout(() => {
                addMessage("Para começar: O imóvel é **Próprio** ou **Alugado**?");
                showPropertyOptions();
            }, 800);
        }, 800);
    }, 600);
}

function showPropertyOptions() {
    inputContainer.innerHTML = `
        <div class="flex gap-2 animate-pulse-once">
            <button onclick="handleProperty('proprio')" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl shadow-lg transition-transform hover:-translate-y-1">🏠 Próprio</button>
            <button onclick="handleProperty('alugado')" class="flex-1 bg-white border-2 border-slate-200 hover:border-slate-800 text-slate-700 font-medium py-3 rounded-xl shadow-sm transition-all">🏢 Alugado</button>
        </div>
    `;
}

function handleProperty(type) {
    leadData.propertyType = type;
    addMessage(type === 'proprio' ? 'Imóvel Próprio 🏠' : 'Imóvel Alugado 🏢', 'user');
    updateProgress(25);
    
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        addMessage("Entendido. E em qual cidade fica o imóvel?");
        showCityInput();
    }, 600);
}

function showCityInput() {
    inputContainer.innerHTML = `
        <form id="city-form" class="flex gap-2 w-full">
            <input type="text" id="city-input" placeholder="Ex: Curitiba..." required class="flex-1 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50">
            <button type="submit" class="bg-green-500 text-white p-4 rounded-xl hover:bg-green-600 transition-colors shadow-lg"><i data-lucide="send" class="w-5 h-5"></i></button>
        </form>
    `;
    document.getElementById('city-form').onsubmit = (e) => {
        e.preventDefault();
        const city = document.getElementById('city-input').value;
        if(city.trim()) handleCity(city);
    };
    lucide.createIcons();
    document.getElementById('city-input').focus();
}

function handleCity(city) {
    leadData.city = city;
    addMessage(city, 'user');
    updateProgress(40);
    
    showTypingIndicator();
    // Aqui a IA já começa a personalizar com base na cidade
    sendToGemini(`O cliente é de ${city}, imóvel ${leadData.propertyType}. Dê as boas vindas personalizadas e pergunte o valor da fatura.`).then(res => {
        hideTypingIndicator();
        addMessage(res, 'ia');
        showBillInputOptions();
    });
}

// Opções Claras: Digitar ou Foto (UX Melhorada)
function showBillInputOptions() {
    inputContainer.innerHTML = `
        <div class="flex gap-2 w-full">
            <label class="flex-1 flex items-center justify-center gap-2 bg-green-100 text-green-800 font-medium py-3 rounded-xl cursor-pointer hover:bg-green-200 transition-colors">
                <i data-lucide="camera" class="w-5 h-5"></i> Foto da Conta
                <input id="file-upload" type="file" accept="image/*" class="hidden">
            </label>
            <button onclick="enableManualInput()" class="flex-1 bg-white border-2 border-gray-200 text-gray-600 font-medium py-3 rounded-xl hover:border-gray-400 transition-colors">
                Digitar Valor
            </button>
        </div>
    `;
    document.getElementById('file-upload').addEventListener('change', handleFileSelect);
    lucide.createIcons();
}

function enableManualInput() {
    addMessage("Vou digitar o valor.", 'user');
    updateProgress(50);
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        addMessage("Sem problemas! Qual o valor médio da sua fatura (R$)?", 'ia');
        showFreeChatInput(); // Libera o chat livre aqui
    }, 600);
}

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    addMessage(`<div class="flex items-center gap-2"><i data-lucide="image" class="w-4 h-4"></i> Foto enviada</div>`, 'user', true);
    inputContainer.innerHTML = ''; 
    updateProgress(60);
    
    addMessage("🔍 O Zee está analisando sua fatura... Só um instante.", 'ia');
    showTypingIndicator();

    const reader = new FileReader();
    reader.onloadend = async function() {
        const base64String = reader.result;
        const aiResponse = await sendToGemini("Analise esta fatura: consumo kWh e Valor R$. Seja breve.", base64String);
        hideTypingIndicator();
        addMessage(aiResponse, 'ia');
        showFreeChatInput(); // Libera o chat livre
    };
    reader.readAsDataURL(file);
}

// =================================================================
// CHAT LIVRE & INTEGRAÇÃO CALENDLY
// =================================================================

function showFreeChatInput() {
    inputContainer.innerHTML = `
        <form id="chat-form" class="flex gap-2 w-full">
            <input type="text" id="chat-input" placeholder="Digite sua mensagem..." class="flex-1 p-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50">
            <button type="submit" class="bg-green-500 text-white p-4 rounded-xl hover:bg-green-600 transition-colors shadow-lg"><i data-lucide="send" class="w-5 h-5"></i></button>
        </form>
    `;
    
    document.getElementById('chat-form').onsubmit = async (e) => {
        e.preventDefault();
        const textInput = document.getElementById('chat-input');
        const text = textInput.value;
        if(!text.trim()) return;

        textInput.value = ''; 
        addMessage(text, 'user');
        showTypingIndicator();

        // 1. Envia mensagem para a IA processar
        const response = await sendToGemini(text);
        hideTypingIndicator();

        // 2. Verifica se a IA disparou o gatilho de agendamento
        if (response.includes("#TRIGGER_CALENDLY#")) {
            // Salva a intenção
            conversationHistory.push({ role: 'ia', content: "Gatilho de Agendamento Acionado" });
            
            // Mostra mensagem de sucesso antes do botão
            addMessage("Excelente decisão! Vamos agendar com o Marlon agora mesmo.", 'ia');
            
            // Ativa a interface final
            triggerCalendlyFlow();
        } else {
            addMessage(response, 'ia');
        }
    };
    lucide.createIcons();
}

// =================================================================
// FLUXO FINAL: EMAIL + CALENDLY + WHATSAPP
// =================================================================

function triggerCalendlyFlow() {
    updateProgress(100);
    
    // Envia o relatório por e-mail (silenciosamente)
    sendEmailReport();

    // Mostra opções de agendamento
    inputContainer.innerHTML = `
        <div class="flex flex-col gap-3 w-full animate-fade-in">
            <!-- Botão Calendly -->
            <button onclick="openCalendly()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105">
                <i data-lucide="calendar-check" class="w-5 h-5"></i>
                Agendar Reunião (Calendly)
            </button>
            
            <!-- Botão WhatsApp (Plano B) -->
            <a href="${generateWhatsappLink()}" target="_blank" class="w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-3 rounded-xl shadow-md flex items-center justify-center gap-2 text-sm">
                <i data-lucide="message-circle" class="w-4 h-4"></i>
                Prefiro confirmar pelo WhatsApp
            </a>
        </div>
    `;
    lucide.createIcons();
    
    addMessage(`📅 **Próximo Passo:**<br>Para garantir que não haja conflito de horários, integramos nossa agenda oficial.<br><br>Clique em **"Agendar Reunião"** abaixo e escolha o melhor horário para você. É automático!`, 'ia', true);
}

function openCalendly() {
    // Abre o popup do Calendly
    // Certifique-se de ter colocado o script do Calendly no HTML
    if (window.Calendly) {
        window.Calendly.initPopupWidget({ url: CALENDLY_LINK });
    } else {
        window.open(CALENDLY_LINK, '_blank');
    }
}

function generateWhatsappLink() {
    const text = `Olá Marlon! 👋\n\nFinalizei a conversa com o Zee (IA).\nGostaria de confirmar um horário para a consultoria.\n\n*Interesse:* ${leadData.propertyType} em ${leadData.city}\n\nPodemos conversar?`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

async function sendEmailReport() {
    // Formata o histórico para HTML bonito no email
    let htmlHistory = conversationHistory.map(msg => 
        `<p><b>${msg.role.toUpperCase()}:</b> ${msg.content}</p>`
    ).join('');

    const htmlBody = `
        <h2>🚀 Novo Lead Qualificado (Via Chatbot Enerzee)</h2>
        <hr>
        <h3>📊 Perfil do Cliente</h3>
        <ul>
            <li><b>Imóvel:</b> ${leadData.propertyType}</li>
            <li><b>Cidade:</b> ${leadData.city}</li>
            <li><b>Valor Fatura (estimado):</b> ${leadData.billValue || "Não informado no campo"}</li>
        </ul>
        <hr>
        <h3>💬 Histórico da Conversa</h3>
        <div style="background:#f4f4f4; padding:15px; border-radius:10px;">
            ${htmlHistory}
        </div>
    `;

    const formData = new FormData();
    formData.append("access_key", WEB3FORMS_ACCESS_KEY); 
    formData.append("subject", `🔥 Lead Enerzee: ${leadData.city} - ${leadData.propertyType}`);
    formData.append("message", htmlBody); // Web3Forms renderiza HTML se detectar tags

    // Disparo fire-and-forget (não trava a tela)
    fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
}

// Init
window.onload = () => {
    lucide.createIcons();
    startConversation();
};