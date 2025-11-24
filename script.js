// =================================================================
// CONFIGURAÇÃO OBRIGATÓRIA
// =================================================================
// Link do seu Cérebro (Cloudflare Worker)
const WORKER_URL = "https://jolly-morning-6b1f.marlonlotici6.workers.dev/"; 

// Chave para backup dos leads por e-mail
const WEB3FORMS_ACCESS_KEY = "4ee5d80b-0860-4b79-a30d-5c0392c46ff4"; 

// Seu número de WhatsApp para receber os leads (com 55 e DDD)
const WHATSAPP_NUMBER = "5546999201690"; 

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
// FUNÇÕES UTILITÁRIAS (VISUAL)
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
    // BLINDAGEM: Se for o código secreto, NÃO MOSTRA NA TELA.
    if (text.includes("#FINALIZAR_AGENDAMENTO#")) return;

    const div = document.createElement('div');
    div.className = `chat-message flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
    
    const bubble = document.createElement('div');
    bubble.className = `max-w-[85%] p-3.5 rounded-2xl text-sm md:text-base shadow-sm ${
        sender === 'user' 
        ? 'bg-sky-600 text-white rounded-tr-none' 
        : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
    }`;

    // Formatação: Transforma quebras de linha em <br> para ficar bonito
    let formattedText = text.replace(/\n/g, '<br>');
    
    if (isHtml) bubble.innerHTML = text;
    else bubble.innerHTML = formattedText;

    div.appendChild(bubble);
    chatMessages.appendChild(div);
    scrollToBottom();
    
    // Atualiza ícones se necessário
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
// CONEXÃO COM A IA (WORKER)
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
        return "Minha conexão oscilou um pouquinho. Pode repetir?";
    }
}

// =================================================================
// FLUXO INICIAL (TRIAGEM)
// =================================================================

function startConversation() {
    updateProgress(10);
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        addMessage("Olá! 👋 Sou o assistente inteligente da Enerzee. Vou analisar seu perfil para encontrarmos a melhor oportunidade de economia.");
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

    addMessage(`<div class="flex items-center gap-2"><i data-lucide="image" class="w-4 h-4"></i> Foto enviada: ${file.name}</div>`, 'user', true);
    inputContainer.innerHTML = ''; 
    updateProgress(70);
    
    addMessage("🔍 Analisando sua fatura com Inteligência Artificial... Só um instante.", 'ia');
    showTypingIndicator();

    const reader = new FileReader();
    reader.onloadend = async function() {
        const base64String = reader.result;
        // Envia imagem pro Worker
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
// CHAT LIVRE & DETECÇÃO DE CONVERSÃO
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

        // Envia para o Gemini responder
        const response = await sendToGemini(text);
        hideTypingIndicator();

        // --- VERIFICA SE A IA DEU O SINAL VERDE ---
        if (response.includes("#FINALIZAR_AGENDAMENTO#")) {
            
            // 1. A IA detectou Nome+Telefone+Horário
            // 2. Acionamos o finalizador com a última mensagem do usuário (onde estão os dados)
            submitDataFinal(text, JSON.stringify(conversationHistory));

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
// FINALIZAÇÃO: E-MAIL (BACKUP) + WHATSAPP (PRINCIPAL)
// =================================================================
async function submitDataFinal(userData, historyChat) {
    updateProgress(100);
    
    // Feedback visual enquanto processa
    inputContainer.innerHTML = `<div class="bg-green-50 text-green-800 p-4 rounded-xl text-center font-semibold border border-green-200 flex items-center justify-center gap-2"><div class="spinner w-4 h-4 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div> Gerando link de confirmação...</div>`;

    // 1. Preparar o Texto para o WhatsApp (Resumo Inteligente para VOCÊ ler)
    const wppMessage = `Olá Marlon! 👋
    
Vim pelo Assistente Virtual da Enerzee.
Gostaria de confirmar meu agendamento.

*Meus Dados:*
${userData}

*Interesse:* Imóvel ${leadData.propertyType === 'proprio' ? 'Próprio 🏠' : 'Alugado 🏢'} em ${leadData.city}
    
Pode confirmar meu horário?`;

    // Cria o link Mágico
    const encodedMessage = encodeURIComponent(wppMessage);
    const wppLink = `https://wa.me/${WHATSAPP_NUMBER}?text=${encodedMessage}`;

    try {
        // 2. Tenta enviar o e-mail de backup (silencioso) para o Web3Forms
        const formData = new FormData();
        formData.append("access_key", WEB3FORMS_ACCESS_KEY); 
        formData.append("subject", "🚀 Lead via IA (Cópia de Segurança)");
        formData.append("DADOS_CLIENTE", userData); 
        formData.append("RESUMO_IA", "O cliente finalizou pelo botão do WhatsApp."); 
        formData.append("HISTORICO_CONVERSA", historyChat); 

        // Dispara o email sem travar o código (fire and forget)
        fetch('https://api.web3forms.com/submit', { method: 'POST', body: formData });

        // 3. Mostra a TELA FINAL com o Botão do WhatsApp
        setTimeout(() => {
            // Mensagem da IA finalizando o papo
            addMessage("Perfeito! Gereui um link de prioridade para você falar direto comigo. 👇", 'ia');
            
            // Substitui o input pelo botão do WhatsApp
            inputContainer.innerHTML = `
                <div class="space-y-3 animate-fade-in">
                    <div class="bg-green-50 text-green-800 p-3 rounded-xl text-center text-sm border border-green-200">
                        ✅ Pré-agendamento realizado!<br>Para confirmar, clique abaixo e envie a mensagem no WhatsApp.
                    </div>
                    
                    <a href="${wppLink}" target="_blank" class="flex items-center justify-center gap-2 w-full bg-[#25D366] hover:bg-[#20bd5a] text-white font-bold py-4 rounded-xl shadow-lg transition-transform hover:scale-105">
                        <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" stroke-width="2" fill="none" stroke-linecap="round" stroke-linejoin="round" class="text-white"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>
                        Confirmar no WhatsApp
                    </a>
                    
                    <p class="text-xs text-center text-gray-400">Ao clicar, o WhatsApp abrirá com seus dados preenchidos.</p>
                </div>
            `;
            
        }, 800);

    } catch (error) {
        console.error(error);
        // Se der erro no email, mostra o botão do WhatsApp mesmo assim (Prioridade)
        inputContainer.innerHTML = `<a href="${wppLink}" target="_blank" class="w-full bg-green-500 text-white py-3 rounded-xl text-center block font-bold">Chamar no WhatsApp</a>`;
    }
}

// Inicia ao carregar a página
window.onload = () => {
    if (typeof lucide !== 'undefined') lucide.createIcons();
    startConversation();
};