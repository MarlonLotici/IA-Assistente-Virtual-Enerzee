// =================================================================
// ⚙️ CONFIGURAÇÃO (Edite aqui)
// =================================================================
const WORKER_URL = "https://jolly-morning-6b1f.marlonlotici6.workers.dev/"; 
const WEB3FORMS_ACCESS_KEY = "4ee5d80b-0860-4b79-a30d-5c0392c46ff4"; 
const WHATSAPP_NUMBER = "5546999201690"; 
// *** COLOQUE SEU LINK DO CALENDLY AQUI ***
const CALENDLY_LINK = "https://calendly.com/marlon-enerzee/consultoria"; 

// =================================================================
// ESTADO DA APLICAÇÃO
// =================================================================
const chatMessages = document.getElementById('chat-messages');
const inputContainer = document.getElementById('input-container');
const progressBar = document.getElementById('progress-bar');

// Dados temporários do Lead
let leadData = { 
    propertyType: null, 
    city: null, 
    billValue: null 
};

let conversationHistory = []; 
let uploadedFile = null; // Armazena o arquivo para envio no email
let manualInputMode = false; // Trava para evitar loop de botões de foto

// =================================================================
// 🎨 FUNÇÕES VISUAIS (UI)
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
    // Se for comando interno da IA, não exibe na tela
    if (text.includes("#TRIGGER_CALENDLY#")) return;

    const div = document.createElement('div');
    div.className = `chat-message flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const bubble = document.createElement('div');
    // Classes definidas no CSS do HTML
    bubble.className = `max-w-[85%] p-4 rounded-2xl text-sm md:text-base shadow-sm ${
        sender === 'user' 
        ? 'bubble-user' 
        : 'bubble-ia'
    }`;

    // Formatação básica: transforma quebras de linha em <br>
    let formattedText = text.replace(/\n/g, '<br>');
    
    if (isHtml) bubble.innerHTML = text;
    else bubble.innerHTML = formattedText;

    div.appendChild(bubble);
    chatMessages.appendChild(div);
    scrollToBottom();
    
    // Atualiza ícones se necessário
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Salva no histórico (para a IA ter contexto)
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
// 🧠 CONEXÃO COM A IA (Cloudflare Worker)
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
        return "Minha conexão oscilou um pouquinho. Pode repetir?";
    }
}

// =================================================================
// 🚀 FLUXO INICIAL (Inicia ao carregar a página)
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
                showSimpleInput(); // Começa com input de texto simples
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
// 🚦 CONTROLADOR DE FLUXO PRINCIPAL
// =================================================================

async function handleFlow(userText) {
    showTypingIndicator();

    // 1. Captura Inteligente de Dados
    // Se ainda não temos cidade e é a primeira interação
    if (!leadData.city) {
        leadData.city = userText;
        updateProgress(30);
    }

    // Tenta extrair valor numérico da fatura se estiver em modo manual
    if (manualInputMode && !leadData.billValue) {
        const numbers = userText.match(/\d+/g);
        if (numbers) {
            leadData.billValue = numbers.join('');
            // Atualiza progresso pois conseguimos um dado importante
            updateProgress(60);
        }
    }

    // 2. Envia para a IA decidir o que falar
    const response = await sendToGemini(userText);
    hideTypingIndicator();

    // 3. Verifica Gatilhos Especiais na resposta da IA

    // GATILHO FINAL: Agendamento
    if (response.includes("#TRIGGER_CALENDLY#")) {
        addMessage("Excelente! A decisão inteligente é agendar essa consultoria para garantir essa condição.", 'ia');
        triggerFinalFlow();
    } 
    
    // GATILHO DE FATURA (Meio do fluxo)
    // Se a IA sugerir envio da conta, mostramos o botão de upload
    // MAS APENAS SE o usuário não tiver optado por digitar manualmente antes
    else if (!manualInputMode && (response.toLowerCase().includes("fatura") || response.toLowerCase().includes("conta de luz"))) {
        addMessage(response, 'ia');
        showBillInputOptions();
    } 
    
    // CONVERSA NORMAL
    else {
        addMessage(response, 'ia');
        // Mantém o input simples aberto
    }
}

// =================================================================
// 📸 UPLOAD DE CONTA vs DIGITAÇÃO MANUAL
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
    manualInputMode = true; // TRAVA O MODO MANUAL (Impede loop de botões)
    addMessage("Prefiro digitar o valor.", 'user');
    showSimpleInput(); 
    // Força a IA a reagir e perguntar o valor imediatamente
    handleFlow("Vou digitar o valor manualmente.");
}

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    uploadedFile = file; // Guarda o arquivo para anexar no email final
    
    addMessage(`<div class="flex items-center gap-2"><i data-lucide="file-check" class="w-4 h-4"></i> Arquivo anexado: ${file.name}</div>`, 'user', true);
    inputContainer.innerHTML = ''; 
    updateProgress(60);
    
    addMessage("🔍 O Zee está analisando sua fatura... Projetando economia de 5 anos... Só um instante.", 'ia');
    showTypingIndicator();

    const reader = new FileReader();
    reader.onloadend = async function() {
        const base64String = reader.result;
        // Pede para a IA simular com base na imagem (Instrução Visionária)
        const aiResponse = await sendToGemini("O cliente enviou a fatura. Analise e apresente a economia acumulada em 5 Anos (com inflação) e impacto ambiental. Não fale porcentagens.", base64String);
        
        hideTypingIndicator();
        addMessage(aiResponse, 'ia');
        showSimpleInput(); // Volta o input normal para continuar conversando
    };
    reader.readAsDataURL(file);
}

// =================================================================
// 📅 FINALIZAÇÃO: CALENDLY + EMAIL + WHATSAPP
// =================================================================

function triggerFinalFlow() {
    updateProgress(100);
    
    // 1. Envia o email silenciosamente com todo o histórico e anexo
    sendEmailReport();

    // 2. Mostra os botões finais na tela
    inputContainer.innerHTML = `
        <div class="flex flex-col gap-3 w-full animate-fade-in p-2">
            <div class="bg-green-50 text-green-800 p-3 rounded-lg text-center text-sm font-medium border border-green-200">
                ✅ Pré-análise aprovada!
            </div>
            
            <!-- Botão Calendly (Principal) -->
            <button onclick="openCalendly()" class="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg flex items-center justify-center gap-2 transition-transform hover:scale-105">
                <i data-lucide="calendar-check" class="w-5 h-5"></i>
                Agendar Reunião Agora
            </button>
            
            <!-- Link WhatsApp (Secundário) -->
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
    // Tenta abrir o Widget do Calendly
    if (window.Calendly) {
        window.Calendly.initPopupWidget({ url: CALENDLY_LINK });
    } else {
        // Se falhar (bloqueador de popups), abre em nova aba
        window.open(CALENDLY_LINK, '_blank');
    }
}

function generateWhatsappLink() {
    const text = `Olá Marlon! 👋\n\nVim pelo Zee (IA).\nGostaria de confirmar a consultoria.\n\n*Interesse:* ${leadData.propertyType || 'Energia Solar'}\n*Cidade:* ${leadData.city || 'PR'}\n\nPodemos conversar?`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

async function sendEmailReport() {
    // Formata histórico para HTML bonito
    let htmlHistory = conversationHistory.map(msg => 
        `<p style="margin-bottom: 5px;"><b>${msg.role.toUpperCase()}:</b> ${msg.content}</p>`
    ).join('');

    const htmlBody = `
        <div style="font-family: sans-serif; color: #333;">
            <h2 style="color: #16a34a;">🚀 Novo Lead Qualificado (Via Zee IA)</h2>
            <p>Cliente chegou na fase de agendamento.</p>
            <hr>
            <h3>📊 Dados Capturados (Estimados)</h3>
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
    
    // Anexa a foto da conta se tiver
    if (uploadedFile) {
        formData.append("attachment", uploadedFile);
    }

    // Disparo silencioso (sem travar o chat)
    fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });
}

// Inicialização
window.onload = () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    startConversation();
};