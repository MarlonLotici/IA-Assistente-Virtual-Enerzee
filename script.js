// =================================================================
// CONFIGURAÇÃO
// =================================================================
const WORKER_URL = "https://jolly-morning-6b1f.marlonlotici6.workers.dev/"; 
const WEB3FORMS_ACCESS_KEY = "4ee5d80b-0860-4b79-a30d-5c0392c46ff4"; 
const WHATSAPP_NUMBER = "5546999201690"; 
const CALENDLY_LINK = "https://calendly.com/marlonlotici2/consultoria-energetica"; // <--- SEU LINK REAL

// Estado
const chatMessages = document.getElementById('chat-messages');
const inputContainer = document.getElementById('input-container');
const progressBar = document.getElementById('progress-bar');

let leadData = { propertyType: null, city: null, billValue: null };
let conversationHistory = []; 
let uploadedFile = null; 
let manualInputMode = false; 

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

async function sendToGemini(userMessage, imageBase64 = null, mimeType = null) {
    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                history: conversationHistory,
                leadData: leadData,
                imageBase64: imageBase64,
                mimeType: mimeType
            })
        });
        if (!response.ok) throw new Error('Erro API');
        const data = await response.json();
        return data.response;
    } catch (error) {
        console.error(error);
        return "Ops! Minha conexão oscilou rapidinho. Pode repetir, por favor? 🐦";
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

async function handleFlow(userText) {
    showTypingIndicator();

    if (!leadData.city) {
        leadData.city = userText;
        updateProgress(30);
    }

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
        const suggestsBill = response.toLowerCase().includes("fatura") || response.toLowerCase().includes("conta de luz");
        
        if (!manualInputMode && suggestsBill) {
            showBillInputOptions();
        } else {
            if (!document.getElementById('chat-form')) {
                showSimpleInput();
            }
        }
    }
}

// =================================================================
// UPLOAD DE CONTA
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
    manualInputMode = true; 
    addMessage("Prefiro digitar o valor.", 'user');
    showSimpleInput(); 
    handleFlow("Vou digitar o valor manualmente.");
}

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    uploadedFile = file;
    const fileName = file.name;
    const fileType = file.type; 

    addMessage(`<div class="flex items-center gap-2"><i data-lucide="file-check" class="w-4 h-4"></i> Recebi: ${fileName}</div>`, 'user', true);
    inputContainer.innerHTML = ''; 
    updateProgress(60);
    
    addMessage("✨ O Zee está lendo sua fatura... Calculando economia 5 anos... Só um instante.", 'ia');
    showTypingIndicator();

    const reader = new FileReader();
    reader.onloadend = async function() {
        const base64String = reader.result;
        const aiResponse = await sendToGemini(
            "O cliente enviou a fatura. Extraia o valor e APRESENTE OBRIGATORIAMENTE a economia em 5 Anos, 2 Anos e 6 Meses.", 
            base64String, 
            fileType
        );
        
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
    
    addMessage(`📅 **Tudo pronto!**<br>Para confirmar, escolha o melhor horário na minha agenda abaixo.`, 'ia', true);
}

function openCalendly() {
    if (window.Calendly) {
        window.Calendly.initPopupWidget({ url: CALENDLY_LINK });
    } else {
        window.open(CALENDLY_LINK, '_blank');
    }
}

function generateWhatsappLink() {
    const text = `Olá Marlon! 👋\n\nVim pelo Zee (IA).\nGostaria de confirmar a consultoria.\n\n*Interesse:* ${leadData.propertyType || 'Solar'}\n*Cidade:* ${leadData.city || 'PR'}\n\nPodemos conversar?`;
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(text)}`;
}

async function sendEmailReport() {
    // Formata histórico para HTML
    let htmlHistory = conversationHistory.map(msg => {
        const bg = msg.role === 'ia' ? '#f3f4f6' : '#dcfce7';
        const align = msg.role === 'ia' ? 'left' : 'right';
        const sender = msg.role === 'ia' ? 'Zee (IA)' : 'Cliente';
        return `
            <div style="background: ${bg}; padding: 10px; margin-bottom: 10px; border-radius: 8px; text-align: ${align}; border: 1px solid #e5e7eb;">
                <strong>${sender}:</strong><br>
                ${msg.content}
            </div>
        `;
    }).join('');

    const htmlBody = `
        <div style="font-family: sans-serif; color: #333; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #16a34a; text-align: center;">🚀 Novo Lead Qualificado (Via Zee IA)</h2>
            <p style="text-align: center;">O cliente finalizou a conversa e foi para o agendamento.</p>
            
            <hr style="border: 0; border-top: 2px solid #16a34a; margin: 20px 0;">
            
            <h3>📊 Resumo dos Dados Capturados</h3>
            <table style="width: 100%; border-collapse: collapse;">
                <tr style="background: #f9fafb;">
                    <td style="padding: 10px; border: 1px solid #ddd;"><b>Cidade:</b></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${leadData.city || "Não detectado"}</td>
                </tr>
                <tr>
                    <td style="padding: 10px; border: 1px solid #ddd;"><b>Tipo de Imóvel:</b></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">${leadData.propertyType || "Não detectado"}</td>
                </tr>
                <tr style="background: #f9fafb;">
                    <td style="padding: 10px; border: 1px solid #ddd;"><b>Valor Fatura (Estimado):</b></td>
                    <td style="padding: 10px; border: 1px solid #ddd;">R$ ${leadData.billValue || "Não detectado"}</td>
                </tr>
            </table>
            
            <hr style="border: 0; border-top: 2px solid #16a34a; margin: 20px 0;">
            
            <h3>💬 Histórico Completo da Conversa</h3>
            <div style="background:#fff; padding:15px; border-radius:8px; border: 1px solid #ddd;">
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