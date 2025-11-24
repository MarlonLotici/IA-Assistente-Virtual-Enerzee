// =================================================================
// CONFIGURAÇÃO OBRIGATÓRIA
// =================================================================
// Seu link do Cloudflare Worker
const WORKER_URL = "https://jolly-morning-6b1f.marlonlotici6.workers.dev/"; 

// =================================================================
// ESTADO DA APLICAÇÃO
// =================================================================
const chatMessages = document.getElementById('chat-messages');
const inputContainer = document.getElementById('input-container');
const progressBar = document.getElementById('progress-bar');

let leadData = {
    propertyType: null, // 'proprio' ou 'alugado'
    city: null,
    billAnalysis: null // Dados lidos pela IA
};

let conversationHistory = []; // Mantém o contexto para o Gemini

// =================================================================
// FUNÇÕES UTILITÁRIAS
// =================================================================

function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTo({ top: chatMessages.scrollHeight, behavior: 'smooth' });
    }, 100);
}

function updateProgress(percent) {
    progressBar.style.width = `${percent}%`;
}

// Adiciona mensagem na tela
function addMessage(text, sender = 'ia', isHtml = false) {
    const div = document.createElement('div');
    div.className = `chat-message flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const bubble = document.createElement('div');
    bubble.className = `max-w-[85%] p-3.5 rounded-2xl text-sm md:text-base shadow-sm ${
        sender === 'user' 
        ? 'bg-sky-600 text-white rounded-tr-none' 
        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
    }`;

    if (isHtml) bubble.innerHTML = text;
    else bubble.textContent = text;

    div.appendChild(bubble);
    chatMessages.appendChild(div);
    scrollToBottom();
    if (typeof lucide !== 'undefined') lucide.createIcons();

    // Salva no histórico (exceto HTML complexo ou loading)
    if (!isHtml) {
        conversationHistory.push({ role: sender, content: text });
    }
}

// Indicador de "Digitando..."
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
    if (WORKER_URL.includes("SEU_LINK")) {
        alert("ERRO: Você precisa configurar o link do Worker no arquivo script.js!");
        return "Erro de configuração.";
    }

    try {
        const response = await fetch(WORKER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                message: userMessage,
                history: conversationHistory,
                leadData: leadData,
                imageBase64: imageBase64 // Envia a imagem se houver
            })
        });

        if (!response.ok) throw new Error('Falha na conexão com a IA');
        
        const data = await response.json();
        return data.response;

    } catch (error) {
        console.error(error);
        return "Desculpe, tive uma instabilidade técnica momentânea. Podemos continuar agendando uma conversa rápida com o Marlon?";
    }
}

// =================================================================
// FLUXO DA CONVERSA
// =================================================================

// Passo 1: Início
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

// Passo Crítico: Upload da Imagem
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

    // Feedback visual imediato
    addMessage(`<div class="flex items-center gap-2"><i data-lucide="image" class="w-4 h-4"></i> Foto enviada: ${file.name}</div>`, 'user', true);
    inputContainer.innerHTML = ''; // Trava input
    updateProgress(70);
    
    addMessage("🔍 Analisando sua fatura com Inteligência Artificial... Só um instante.", 'ia');
    showTypingIndicator();

    // Converte imagem para Base64
    const reader = new FileReader();
    reader.onloadend = async function() {
        const base64String = reader.result; // Contém "data:image/jpeg;base64,..."
        
        // Envia para o Worker (Gemini)
        const aiResponse = await sendToGemini("Analise esta fatura e me diga o que encontrou de consumo e valor, e sugira a solução.", base64String);
        
        hideTypingIndicator();
        addMessage(aiResponse, 'ia');
        enableFreeChat(); // Libera o chat livre após a análise
    };
    reader.readAsDataURL(file);
}

function skipUpload() {
    addMessage("Prefiro digitar manualmente.", 'user');
    addMessage("Sem problemas! Qual o valor médio da sua fatura (R$)?", 'ia');
    showFreeChatInput(); // Vai direto para o chat livre
}

// =================================================================
// CORREÇÃO AQUI: LÓGICA DE GATILHO INTELIGENTE
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
        
        // --- DETECÇÃO DE INTENÇÃO FORTE ---
        const lowerText = text.toLowerCase();
        
        // Palavras que indicam, SEM DÚVIDA, que a pessoa quer a reunião
        const closingKeywords = [
            'agendar reunião', 
            'marcar reunião', 
            'pode me ligar', 
            'quero contratar', 
            'quero fechar',
            'proposta oficial',
            'falar com consultor',
            'falar com humano',
            'vamos agendar',
            'agendar agora'
        ];
        
        // Verifica se alguma das palavras fortes está na frase
        const isConversion = closingKeywords.some(phrase => lowerText.includes(phrase));

        // Se for conversão REAL, dispara o formulário
        if (isConversion) {
            hideTypingIndicator();
            triggerLeadForm();
            return;
        }
        
        // Se a pessoa disse apenas "sim", "quero", "topo", ou fez uma pergunta ("como assim?"),
        // ou qualquer outra coisa, DEIXAMOS A IA RESPONDER e qualificar.
        // -------------------------------------

        showTypingIndicator();
        const response = await sendToGemini(text);
        hideTypingIndicator();
        addMessage(response, 'ia');
    };
    if (typeof lucide !== 'undefined') lucide.createIcons();
}

function enableFreeChat() {
    updateProgress(90);
    showFreeChatInput();
}

function triggerLeadForm() {
    updateProgress(100);
    addMessage("Excelente! Vamos formalizar para eu te passar a proposta oficial. Preencha abaixo rapidinho:", 'ia');
    
    inputContainer.innerHTML = `
        <form id="lead-form" class="w-full space-y-3 bg-gray-50 p-3 rounded-lg border animate-fade-in">
            <input type="text" name="name" placeholder="Nome Completo" required class="w-full p-3 border rounded-lg">
            <input type="tel" name="phone" placeholder="WhatsApp (com DDD)" required class="w-full p-3 border rounded-lg">
            <button type="submit" class="w-full bg-green-600 text-white font-bold py-3 rounded-lg hover:bg-green-700 transition-all shadow-lg">Receber Proposta Completa</button>
        </form>
    `;

    document.getElementById('lead-form').onsubmit = async (e) => {
        e.preventDefault();
        const btn = e.target.querySelector('button');
        btn.innerHTML = 'Enviando...';
        btn.disabled = true;

        // Aqui você integraria com seu CRM ou Web3Forms
        await new Promise(r => setTimeout(r, 1500)); // Simulação
        
        inputContainer.innerHTML = `<div class="bg-green-100 text-green-800 p-4 rounded-xl text-center font-bold">✅ Dados recebidos! O Marlon entrará em contato em breve.</div>`;
        addMessage("Obrigado! Já recebi seus dados. Em instantes nosso especialista humano te chama no WhatsApp com a análise técnica.", 'ia');
    };
}

// Inicia ao carregar
window.onload = () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    startConversation();
};