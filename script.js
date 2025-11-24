// =================================================================
// CONFIGURAÇÃO OBRIGATÓRIA
// =================================================================
const WORKER_URL = "https://jolly-morning-6b1f.marlonlotici6.workers.dev/"; 

// =================================================================
// ESTADO DA APLICAÇÃO
// =================================================================
const chatMessages = document.getElementById('chat-messages');
const inputContainer = document.getElementById('input-container');
const progressBar = document.getElementById('progress-bar');

let leadData = {
    propertyType: null,
    city: null,
    billAnalysis: null
};

let conversationHistory = []; 

// =================================================================
// FUNÇÕES UTILITÁRIAS (UI)
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
    // Se for mensagem de sistema oculta (tag), ignora
    if (text.includes("#FINALIZAR_AGENDAMENTO#")) return;

    const div = document.createElement('div');
    div.className = `chat-message flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const bubble = document.createElement('div');
    bubble.className = `max-w-[85%] p-3.5 rounded-2xl text-sm md:text-base shadow-sm ${
        sender === 'user' 
        ? 'bg-sky-600 text-white rounded-tr-none' 
        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
    }`;

    // Converte quebras de linha (\n) em <br> para visualização correta
    const formattedText = text.replace(/\n/g, '<br>');

    if (isHtml) bubble.innerHTML = text;
    else bubble.innerHTML = formattedText; // Usa innerHTML para suportar o <br>

    div.appendChild(bubble);
    chatMessages.appendChild(div);
    scrollToBottom();
    if (typeof lucide !== 'undefined') lucide.createIcons();

    if (!isHtml) {
        conversationHistory.push({ role: sender, content: text });
    }
}

function showTypingIndicator() {
    const id = 'typing-indicator';
    if (document.getElementById(id)) return;
    
    const div = document.createElement('div');
    div.id = id;
    div.className = 'chat-message flex justify-start';
    div.innerHTML = `
        <div class="bg-white p-4 rounded-2xl rounded-tl-none border border-gray-100 shadow-sm flex gap-1">
            <div class="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
            <div class="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
            <div class="typing-dot w-2 h-2 bg-gray-400 rounded-full"></div>
        </div>
    `;
    chatMessages.appendChild(div);
    scrollToBottom();
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

// =================================================================
// CONEXÃO COM A IA (BACKEND)
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

        if (!response.ok) throw new Error('Falha na conexão com a IA');
        
        const data = await response.json();
        return data.response;

    } catch (error) {
        console.error(error);
        return "Tive um pequeno problema técnico. Pode repetir, por favor?";
    }
}

// =================================================================
// FLUXO DA CONVERSA
// =================================================================

function startConversation() {
    updateProgress(10);
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        addMessage("Olá! 👋 Sou o assistente inteligente da Enerzee. Vou analisar seu perfil para encontrarmos a melhor oportunidade de economia (Solar ou Assinatura).");
        setTimeout(() => {
            addMessage("Para começar: O imóvel é **Próprio** ou **Alugado**?");
            showPropertyOptions();
        }, 800);
    }, 600);
}

function showPropertyOptions() {
    inputContainer.innerHTML = `
        <div class="flex gap-2 animate-pulse-once">
            <button onclick="handleProperty('proprio')" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg hover:-translate-y-1">🏠 Próprio</button>
            <button onclick="handleProperty('alugado')" class="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-medium py-3 rounded-xl transition-all shadow-lg hover:-translate-y-1">🏢 Alugado</button>
        </div>
    `;
}

function handleProperty(type) {
    leadData.propertyType = type;
    addMessage(type === 'proprio' ? 'Imóvel Próprio 🏠' : 'Imóvel Alugado 🏢', 'user');
    updateProgress(30);
    
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        addMessage("Certo. E em qual cidade fica o imóvel?");
        showCityInput();
    }, 600);
}

function showCityInput() {
    inputContainer.innerHTML = `
        <form id="city-form" class="flex gap-2 w-full">
            <input type="text" id="city-input" placeholder="Ex: Curitiba, Londrina..." required class="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500 focus:ring-1 focus:ring-green-500">
            <button type="submit" class="bg-green-500 text-white p-3 rounded-xl hover:bg-green-600 transition-colors"><i data-lucide="send" class="w-5 h-5"></i></button>
        </form>
    `;
    document.getElementById('city-form').onsubmit = (e) => {
        e.preventDefault();
        const city = document.getElementById('city-input').value;
        if(city.trim()) handleCity(city);
    };
    if (typeof lucide !== 'undefined') lucide.createIcons();
    document.getElementById('city-input').focus();
}

function handleCity(city) {
    leadData.city = city;
    addMessage(city, 'user');
    updateProgress(50);
    
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        addMessage(`Ótimo! Em ${city}, temos condições especiais.`);
        addMessage(`📸 **Agora vem a mágica:** Tire uma foto ou envie o PDF da sua conta de luz. Nossa IA vai ler os dados e calcular o potencial exato para você.`);
        showUploadInput();
    }, 800);
}

function showUploadInput() {
    inputContainer.innerHTML = `
        <div class="w-full">
            <label for="file-upload" class="flex items-center justify-center w-full p-4 border-2 border-dashed border-green-400 rounded-xl cursor-pointer bg-green-50 hover:bg-green-100 transition-colors gap-2">
                <i data-lucide="camera" class="w-6 h-6 text-green-600"></i>
                <span class="text-green-800 font-medium">Enviar Foto da Fatura</span>
                <input id="file-upload" type="file" accept="image/*" class="hidden">
            </label>
            <button onclick="skipUpload()" class="w-full mt-2 text-xs text-gray-400 hover:text-gray-600 underline text-center">Prefiro digitar os valores manualmente</button>
        </div>
    `;
    
    document.getElementById('file-upload').addEventListener('change', handleFileSelect);
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

async function handleFileSelect(event) {
    const file = event.target.files[0];
    if (!file) return;

    addMessage(`<div class="flex items-center gap-2"><i data-lucide="image" class="w-4 h-4"></i> Foto enviada: ${file.name}</div>`, 'user', true);
    inputContainer.innerHTML = ''; 
    updateProgress(70);
    
    addMessage("🔍 Analisando sua fatura com Inteligência Artificial... Só um instante.", 'ia');
    showTypingIndicator();

    const reader = new FileReader();
    reader.onloadend = async function() {
        const base64String = reader.result;
        const aiResponse = await sendToGemini("Analise esta fatura e me diga o que encontrou de consumo e valor, e sugira a solução.", base64String);
        
        hideTypingIndicator();
        addMessage(aiResponse, 'ia');
        enableFreeChat();
    };
    reader.readAsDataURL(file);
}

function skipUpload() {
    addMessage("Prefiro digitar manualmente.", 'user');
    addMessage("Sem problemas! Qual o valor médio da sua fatura (R$)?", 'ia');
    showFreeChatInput(); 
}

// =================================================================
// ÁREA DE CHAT LIVRE & LÓGICA DE CONVERSÃO
// =================================================================
function showFreeChatInput() {
    inputContainer.innerHTML = `
        <form id="chat-form" class="flex gap-2 w-full">
            <input type="text" id="chat-input" placeholder="Digite sua dúvida..." class="flex-1 p-3 border border-gray-300 rounded-xl focus:outline-none focus:border-green-500">
            <button type="submit" class="bg-green-500 text-white p-3 rounded-xl hover:bg-green-600"><i data-lucide="send" class="w-5 h-5"></i></button>
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

        // Envia para o Worker (IA)
        const response = await sendToGemini(text);
        hideTypingIndicator();

        // --- VERIFICA SE A IA DECIDIU FINALIZAR ---
        if (response.includes("#FINALIZAR_AGENDAMENTO#")) {
            // A IA identificou que o cliente mandou os dados!
            addMessage("Perfeito! Estou processando seu agendamento...", 'ia');
            
            // Pega a última mensagem do usuário (que tem os dados) + Histórico
            const userData = text; 
            const fullHistory = JSON.stringify(conversationHistory);

            // Aciona o envio automático
            submitDataToEmail(userData, fullHistory);
        } else {
            // Continua a conversa normal
            addMessage(response, 'ia');
        }
    };
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function enableFreeChat() {
    updateProgress(90);
    showFreeChatInput();
}

// =================================================================
// ENVIO REAL DOS DADOS (WEB3FORMS)
// =================================================================
async function submitDataToEmail(userData, historyChat) {
    updateProgress(100);
    inputContainer.innerHTML = `<div class="bg-green-100 text-green-800 p-4 rounded-xl text-center font-bold flex items-center justify-center gap-2"><div class="spinner w-5 h-5 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div> Agendando...</div>`;

    try {
        // Cria um formulário invisível para enviar os dados
        const formData = new FormData();
        formData.append("access_key", "4ee5d80b-0860-4b79-a30d-5c0392c46ff4"); // Sua chave atual
        formData.append("subject", "🚀 Novo Agendamento via IA - Enerzee");
        formData.append("DADOS_DO_CLIENTE", userData); // O que ele digitou por último
        formData.append("HISTORICO_CONVERSA", historyChat); // O papo todo para você ler
        formData.append("TIPO_IMOVEL", leadData.propertyType);
        formData.append("CIDADE", leadData.city);

        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData
        });

        const result = await response.json();

        if (result.success) {
            inputContainer.innerHTML = `<div class="bg-green-100 text-green-800 p-4 rounded-xl text-center font-bold">✅ Agendamento Confirmado!</div>`;
            addMessage("Prontinho! ✅ Já enviei seus dados e o resumo da nossa conversa para o Marlon. Ele vai confirmar o horário com você pelo WhatsApp em breve. Obrigado!", 'ia');
        } else {
            throw new Error("Erro no Web3Forms");
        }

    } catch (error) {
        console.error(error);
        inputContainer.innerHTML = `<div class="bg-red-100 text-red-800 p-4 rounded-xl text-center">Erro ao enviar.</div>`;
        addMessage("Ops! Tive um erro de conexão ao enviar o agendamento. Por favor, me chame direto no WhatsApp: (46) 99920-1690.", 'ia');
    }
}

// Inicia ao carregar
window.onload = () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    startConversation();
};