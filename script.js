// --- CONSTANTES DO DOM ---
const chatMessages = document.getElementById('chat-messages');
const chatInputArea = document.getElementById('chat-input-area');
const progressBar = document.getElementById('progress-bar');
const progressLabels = {
    calculo: document.getElementById('label-calculo'),
    impacto: document.getElementById('label-impacto'),
    proposta: document.getElementById('label-proposta'),
};
const privacyModal = document.getElementById('privacy-modal');
const closePrivacyModalBtn = document.getElementById('close-privacy-modal');

// ALTERAÇÃO: 'billValue' foi adicionado para guardar o valor da fatura.
let leadData = { type: null, billValue: 0 };

// --- FUNÇÕES DE CHAT E ESTRUTURA (sem alterações) ---

function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTop = chatMessages.scrollHeight;
        window.scrollTo({ top: document.body.scrollHeight, behavior: 'smooth' });
    }, 100);
}

function updateProgress(percentage, activeLabel) {
    progressBar.style.width = `${percentage}%`;
    Object.values(progressLabels).forEach(label => label.classList.remove('font-bold', 'text-green-600'));
    if (progressLabels[activeLabel]) {
        progressLabels[activeLabel].classList.add('font-bold', 'text-green-600');
    }
}

function addMessage(text, sender = 'ia', isHtml = false) {
    const messageDiv = document.createElement('div');
    messageDiv.className = `chat-message flex ${sender === 'user' ? 'justify-end' : 'justify-start'}`;
    const bubble = document.createElement('div');
    if (isHtml) {
        bubble.innerHTML = text;
    } else {
        bubble.textContent = text;
    }
    bubble.className = `max-w-xs md:max-w-md p-3 rounded-2xl shadow-sm ${sender === 'user' ? 'bg-sky-500 text-white' : 'bg-gray-200 text-gray-800'}`;
    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    scrollToBottom();
    lucide.createIcons();
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'chat-message flex justify-start';
    indicator.innerHTML = `<div class="bg-gray-200 p-3 rounded-2xl shadow-sm"><div class="typing-indicator"><div class="typing-dot"></div><div class="typing-dot"></div><div class="typing-dot"></div></div></div>`;
    chatMessages.appendChild(indicator);
    scrollToBottom();
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) indicator.remove();
}

function clearInputArea() {
    chatInputArea.innerHTML = '';
}

// --- FLUXO DE ALTA CONVERSÃO (Simplificado) ---

function startConversation() {
    updateProgress(10, 'calculo');
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        addMessage("Olá! 👋 Sou o assistente virtual da Enerzee, treinado pelo consultor Marlon para te ajudar a descobrir seu potencial de economia de forma rápida e segura.");
        showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator();
            addMessage("Vamos começar? Me diga qual o valor médio da sua fatura de energia. É 100% gratuito e sem compromisso.");
            showCalculatorInput();
        }, 1500);
    }, 800);
}

function showCalculatorInput() {
    const form = document.createElement('form');
    form.className = 'flex gap-2 chat-message w-full';
    form.onsubmit = handleCalculation;
    form.innerHTML = `
        <input type="number" id="billValue" placeholder="Ex: 350,00" required class="flex-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" min="1" step="0.01">
        <button type="submit" class="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg btn-interactive btn-pulsing flex-shrink-0">Calcular</button>
    `;
    chatInputArea.appendChild(form);
    document.getElementById('billValue').focus();
    scrollToBottom();
}

function handleCalculation(event) {
    event.preventDefault();
    const billValue = parseFloat(document.getElementById('billValue').value);
    
    // ALTERAÇÃO: Guardando o valor da fatura para enviar no formulário depois.
    leadData.billValue = billValue;

    addMessage(`R$ ${billValue.toFixed(2).replace('.', ',')}`, 'user');
    clearInputArea();
    
    const monthlySaving = billValue * 0.15;
    const annualSaving = monthlySaving * 12;

    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        updateProgress(33, 'calculo');
        const resultText = `<p class="font-semibold">Excelente! Com base nesse valor, seu potencial de economia é de até:</p><ul class="list-none mt-2 space-y-1"><li><strong>Mensal:</strong> <span class="font-bold text-green-600">R$ ${monthlySaving.toFixed(2).replace('.', ',')}</span></li><li><strong>Anual:</strong> <span class="font-bold text-green-600">R$ ${annualSaving.toFixed(2).replace('.', ',')}</span></li></ul>`;
        addMessage(resultText, 'ia', true);
        
        setTimeout(() => {
            addMessage("<p class='text-xs'>Lembrando que a economia é sobre seu consumo. Taxas e outros encargos não entram no cálculo.</p>", 'ia', true);
            setTimeout(showImpactButton, 1500);
        }, 1200);
    }, 800);
}

function showImpactButton() {
    const button = document.createElement('button');
    button.innerHTML = 'Ver o impacto positivo disso <i data-lucide="arrow-right" class="inline w-4 h-4 ml-1"></i>';
    button.className = 'w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg btn-interactive btn-pulsing chat-message flex items-center justify-center';
    button.onclick = () => {
        clearInputArea();
        addMessage("Ver o impacto positivo disso", 'user');
        setTimeout(showImpactMessage, 800);
    };
    chatInputArea.appendChild(button);
    lucide.createIcons();
    scrollToBottom();
}
    
function showImpactMessage() {
    hideTypingIndicator();
    updateProgress(66, 'impacto');
    addMessage("Além de economizar, você passa a consumir energia 100% limpa, assumindo um papel fundamental na regeneração do nosso planeta.", 'ia', true);
    setTimeout(() => {
        const impactText = `<div class="impact-card p-3 rounded-lg"><div class="flex items-center gap-3"><i data-lucide="leaf" class="w-8 h-8 text-green-600 flex-shrink-0"></i><div><p class="font-bold text-gray-800">Você se junta a uma comunidade com +1.000 pessoas!</p><p class="text-sm text-gray-600">Juntas, já evitamos a emissão de 960 toneladas de CO₂, o mesmo que plantar +43.000 árvores! 🌳</p></div></div></div>`;
        addMessage(impactText, 'ia', true);
        setTimeout(() => {
            hideTypingIndicator();
            addMessage("Essa é a força da nossa comunidade. Agora, vamos cuidar da sua economia.");
            setTimeout(showProposalButton, 1500);
        }, 1500);
    }, 1200);
}

function showProposalButton() {
    const button = document.createElement('button');
    button.textContent = 'Sim, quero garantir meu desconto!'; 
    button.className = 'w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg btn-interactive btn-pulsing chat-message';
    button.onclick = () => {
        clearInputArea();
        addMessage("Sim, quero garantir meu desconto!", 'user');
        setTimeout(bridgeToFormalProposal, 800);
    };
    chatInputArea.appendChild(button);
    scrollToBottom();
}

function bridgeToFormalProposal() {
    // ALTERAÇÃO: Mensagem ajustada, pois não vamos mais analisar a fatura.
    addMessage("Excelente decisão! 😄 Para receber uma proposta personalizada com base na sua média de consumo, basta preencher os dados abaixo.");
    setTimeout(() => {
        addMessage("Para qual tipo de imóvel seria a simulação?");
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex gap-2 mt-2 chat-message w-full';
        buttonContainer.innerHTML = `
            <button onclick="handleLeadType('pf')" class="flex-1 bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg btn-interactive">Residência</button>
            <button onclick="handleLeadType('pj')" class="flex-1 bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg btn-interactive">Empresa</button>
        `;
        chatInputArea.appendChild(buttonContainer);
        scrollToBottom();
    }, 1500);
}

function handleLeadType(type) {
    leadData.type = type;
    const userResponse = type === 'pf' ? 'Residência' : 'Empresa';
    addMessage(userResponse, 'user');
    clearInputArea();
    updateProgress(100, 'proposta');
    setTimeout(() => {
        addMessage("Ótimo! Por favor, preencha os campos abaixo para que um especialista entre em contato. É rápido e seguro.", 'ia', true);
        // ALTERAÇÃO: Chamando o novo formulário de passo único.
        setTimeout(showSecureForm, 1800);
    }, 500);
}

// --- ALTERAÇÃO GERAL: NOVO FORMULÁRIO DE PASSO ÚNICO ---
function showSecureForm() {
    const formContainer = document.createElement('form');
    formContainer.id = 'lead-form';
    formContainer.className = 'chat-message space-y-3 p-4 bg-gray-50 rounded-lg border w-full'; 
    formContainer.onsubmit = handleSubmit;

    // Campos para Pessoa Física (Residência)
    const pfFields = `
        <input name="nome_completo" type="text" placeholder="Nome Completo" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none">
        <input name="email" type="email" placeholder="Seu melhor e-mail" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none">
        <input name="telefone" type="tel" placeholder="Telefone (com DDD)" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none">
    `;
    
    // Campos para Pessoa Jurídica (Empresa)
    const pjFields = `
        <input name="nome_estabelecimento" type="text" placeholder="Nome do Estabelecimento" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none">
        <input name="tipo_estabelecimento" type="text" placeholder="Tipo de Estabelecimento (Ex: Restaurante)" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none">
        <input name="nome_proprietario" type="text" placeholder="Nome do Proprietário" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none">
        <input name="email_proprietario" type="email" placeholder="E-mail do Proprietário" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none">
        <input name="telefone_proprietario" type="tel" placeholder="Telefone do Proprietário (com DDD)" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none">
    `;

    formContainer.innerHTML = `
        <input type="hidden" name="access_key" value="4ee5d80b-0860-4b79-a30d-5c0392c46ff4">
        <input type="hidden" name="subject" value="Novo Lead (Sem Fatura) - Simulação Enerzee!">
        <input type="hidden" name="consumo_medio_em_reais" value="${leadData.billValue.toFixed(2)}">
        
        ${leadData.type === 'pf' ? pfFields : pjFields}
        
        <div class="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
            <span class="flex items-center gap-1"><i data-lucide="lock" class="w-4 h-4"></i> Ambiente Seguro</span>
            <a href="#" id="privacy-link" class="hover:underline">Política de Privacidade</a>
        </div>
        <button type="submit" class="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg btn-interactive btn-pulsing">Enviar Para Análise</button>
    `;
    chatInputArea.appendChild(formContainer);
    
    document.getElementById('privacy-link').onclick = (e) => { e.preventDefault(); openPrivacyModal(); };
    
    lucide.createIcons();
    scrollToBottom(); 
}

// --- ALTERAÇÃO: FUNÇÃO DE SUBMISSÃO SIMPLIFICADA ---
async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    // A validação do anexo foi removida.

    addMessage("Enviando seus dados...", 'user');
    clearInputArea();
    showTypingIndicator();

    const formData = new FormData(form);

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        hideTypingIndicator();

        if (result.success) {
            const leadName = form.nome_completo?.value || form.nome_proprietario?.value || "amigo(a)";
            addMessage(`Perfeito, ${leadName}! Recebemos seus dados.`);
            setTimeout(() => {
                addMessage("Nossa equipe de especialistas já vai preparar uma proposta com base no seu consumo. Em breve, entraremos em contato. Obrigado por se juntar à nossa comunidade de energia limpa! ✅");
            }, 1200);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        hideTypingIndicator();
        console.error('Erro no envio:', error);
        addMessage("Ocorreu um erro ao enviar seus dados. Por favor, tente novamente ou entre em contato direto. 😥", 'ia');
    }
}

// --- FUNÇÕES DO MODAL (sem alterações) ---
function openPrivacyModal() {
    privacyModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}
function closePrivacyModal() {
    privacyModal.classList.add('hidden');
    document.body.style.overflow = '';
}
closePrivacyModalBtn.onclick = closePrivacyModal;
privacyModal.onclick = (e) => { if (e.target === privacyModal) closePrivacyModal(); };

window.onload = startConversation;