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
const scrollToBottomBtn = document.getElementById('scroll-to-bottom-btn');

let leadData = { type: null, billValue: 0 };

// --- FUNÇÕES DE CHAT E ESTRUTURA (sem alterações) ---

function scrollToBottom() {
    setTimeout(() => {
        chatMessages.scrollTo({
            top: chatMessages.scrollHeight,
            behavior: 'smooth'
        });
        window.scrollTo({
            top: document.body.scrollHeight,
            behavior: 'smooth'
        });
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

// --- FLUXO DE ALTA CONVERSÃO ---

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
    form.className = 'flex gap-2 chat-message w-full form-fade-in';
    form.onsubmit = handleCalculation;
    form.innerHTML = `
        <input type="number" id="billValue" placeholder="Ex: 350,00" required class="flex-1 w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none" min="1" step="0.01">
        <button type="submit" class="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg btn-interactive btn-pulsing flex-shrink-0">Calcular</button>
    `;
    chatInputArea.appendChild(form);
    const billValueInput = document.getElementById('billValue');
    billValueInput.focus();
    
    const placeholders = ["Ex: 250,00", "Ex: 500,00", "Ex: 1200,00"];
    let placeholderIndex = 0;
    const intervalId = setInterval(() => {
        if (document.contains(billValueInput)) {
            placeholderIndex = (placeholderIndex + 1) % placeholders.length;
            billValueInput.placeholder = placeholders[placeholderIndex];
        } else {
            clearInterval(intervalId);
        }
    }, 2000);

    scrollToBottom();
}

function handleCalculation(event) {
    event.preventDefault();
    const billValue = parseFloat(document.getElementById('billValue').value);
    
    leadData.billValue = billValue;

    addMessage(`R$ ${billValue.toFixed(2).replace('.', ',')}`, 'user');
    clearInputArea();
    
    const monthlySaving = billValue * 0.15;
    const annualSaving = monthlySaving * 12;

    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        updateProgress(33, 'calculo');
        const resultText = `<p class="font-semibold">Excelente! Com base nesse valor, seu potencial de economia é de até:</p><ul class="list-none mt-2 space-y-1"><li><strong>Mensal:</strong> <span class="font-bold text-green-600">R$ ${monthlySaving.toFixed(2).replace('.', ',')}</span></li><li><strong>Anual:</strong> <span class="font-bold text-green-600">R$ ${annualSaving.toFixed(2).replace('.', ',')}</span></li></ul><p class='text-xs mt-3 italic text-gray-500'>*Estimativa baseada nas tarifas de energia atuais. Garanta sua análise para travar o desconto.</p>`;
        addMessage(resultText, 'ia', true);
        
        setTimeout(() => {
            addMessage("<p class='text-xs'>Lembrando que a economia é sobre seu consumo. Taxas e outros encargos não entram no cálculo.</p>", 'ia', true);
            setTimeout(showImpactButton, 1500);
        }, 1200);
    }, 800);
}

function showImpactButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.innerHTML = 'Ver o impacto positivo disso <i data-lucide="arrow-right" class="inline w-4 h-4 ml-1"></i>';
    button.className = 'w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg btn-interactive btn-pulsing chat-message flex items-center justify-center';
    button.onclick = () => {
        clearInputArea();
        addMessage("Ver o impacto positivo disso", 'user');
        showTypingIndicator();
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
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        const impactText = `<div class="impact-card p-3 rounded-lg"><div class="flex items-center gap-3"><i data-lucide="leaf" class="w-8 h-8 text-green-600 flex-shrink-0"></i><div><p class="font-bold text-gray-800">Você se junta a uma comunidade com +1.000 pessoas!</p><p class="text-sm text-gray-600">Juntas, já evitamos a emissão de 960 toneladas de CO₂, o mesmo que plantar +43.000 árvores! 🌳</p></div></div></div>`;
        addMessage(impactText, 'ia', true);
        showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator();
            addMessage("Essa é a força da nossa comunidade. Agora, vamos cuidar da sua economia.");
            setTimeout(showProposalButton, 1500);
        }, 1500);
    }, 1200);
}

function showProposalButton() {
    const button = document.createElement('button');
    button.type = 'button';
    button.textContent = 'Sim, quero garantir meu desconto!'; 
    button.className = 'w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg btn-interactive btn-pulsing chat-message';
    button.onclick = () => {
        clearInputArea();
        addMessage("Sim, quero garantir meu desconto!", 'user');
        showTypingIndicator();
        setTimeout(bridgeToFormalProposal, 800);
    };
    chatInputArea.appendChild(button);
    scrollToBottom();
}

function bridgeToFormalProposal() {
    hideTypingIndicator();
    addMessage("Excelente decisão! 😄 Para receber uma proposta personalizada com base na sua média de consumo, basta preencher os dados abaixo.");
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        addMessage("Para qual tipo de imóvel seria a simulação?");
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex gap-2 mt-2 chat-message w-full';
        buttonContainer.innerHTML = `
            <button type="button" onclick="handleLeadType('pf')" class="flex-1 bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg btn-interactive">Residência</button>
            <button type="button" onclick="handleLeadType('pj')" class="flex-1 bg-sky-500 text-white font-semibold py-2 px-4 rounded-lg btn-interactive">Empresa</button>
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
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        addMessage("Ótimo! Faltam só alguns detalhes para montarmos sua análise personalizada.", 'ia', true);
        setTimeout(showSecureForm, 1800);
    }, 500);
}

function showSecureForm() {
    const formContainer = document.createElement('form');
    formContainer.id = 'lead-form';
    formContainer.className = 'chat-message space-y-3 p-4 bg-gray-50 rounded-lg border w-full form-fade-in'; 
    formContainer.onsubmit = handleSubmit;

    const pfFields = `
        <input name="nome_completo" type="text" placeholder="Nome Completo" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none">
        <input name="email" type="email" placeholder="Seu melhor e-mail" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none">
        <input name="telefone" type="tel" placeholder="Telefone (com DDD)" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none">
    `;
    const pjFields = `
        <input name="nome_estabelecimento" type="text" placeholder="Nome do Estabelecimento" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none">
        <input name="tipo_estabelecimento" type="text" placeholder="Tipo de Estabelecimento (Ex: Restaurante)" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none">
        <input name="nome_proprietario" type="text" placeholder="Nome do Proprietário" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none">
        <input name="email_proprietario" type="email" placeholder="E-mail do Proprietário" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none">
        <input name="telefone_proprietario" type="tel" placeholder="Telefone do Proprietário (com DDD)" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:border-green-500 focus:outline-none">
    `;
    const microCommitmentCheckbox = `
        <label class="flex items-center gap-2 text-xs text-gray-600 cursor-pointer hover:text-gray-800">
            <input type="checkbox" name="aceita_dicas" value="sim" class="rounded border-gray-300 text-green-500 shadow-sm focus:border-green-500 focus:ring focus:ring-green-200 focus:ring-opacity-50">
            <span>Sim, quero receber dicas de economia de energia.</span>
        </label>
    `;

    formContainer.innerHTML = `
        <input type="hidden" name="access_key" value="4ee5d80b-0860-4b79-a30d-5c0392c46ff4">
        <input type="hidden" name="subject" value="Novo Lead (Sem Fatura) - Simulação Enerzee!">
        <input type="hidden" name="consumo_medio_em_reais" value="${leadData.billValue.toFixed(2)}">
        
        ${leadData.type === 'pf' ? pfFields : pjFields}
        
        ${microCommitmentCheckbox}

        <div class="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
            <span class="flex items-center gap-1"><i data-lucide="lock" class="w-4 h-4"></i> Ambiente Seguro</span>
            <a href="#" id="privacy-link" class="hover:underline">Política de Privacidade</a>
        </div>
        <button type="submit" class="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg btn-interactive btn-pulsing">Enviar para Análise</button>
    `;
    chatInputArea.appendChild(formContainer);
    
    document.getElementById('privacy-link').onclick = (e) => { e.preventDefault(); openPrivacyModal(); };
    
    lucide.createIcons();
    scrollToBottom(); 
}

// ***** NOVA MELHORIA *****
// Nova função para mostrar os próximos passos após a conversão.
function showPostSubmissionOptions() {
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        addMessage("Enquanto nossa equipe prepara sua análise, que tal continuar a conversa ou ver algumas dicas?");

        const optionsContainer = document.createElement('div');
        optionsContainer.className = 'space-y-2 mt-2 chat-message w-full form-fade-in';
        
        // **IMPORTANTE**: Substitua os placeholders abaixo pelos seus links reais!
        const whatsappNumber = "46999201690"; // Seu número de WhatsApp com código do país e DDD
        const instagramUsername = "marlon.enerzee"; // Seu nome de usuário do Instagram
        const preFilledMessage = encodeURIComponent(`Olá, Marlon! Acabei de fazer uma simulação no site e gostaria de conversar.`);

        optionsContainer.innerHTML = `
            <a href="https://wa.me/${whatsappNumber}?text=${preFilledMessage}" target="_blank" class="w-full bg-green-500 text-white font-semibold py-3 px-4 rounded-lg btn-interactive flex items-center justify-center gap-2">
                <i data-lucide="message-circle" class="w-5 h-5"></i>
                <span>Falar no WhatsApp</span>
            </a>
            <a href="https://instagram.com/${instagramUsername}" target="_blank" class="w-full bg-gray-700 text-white font-semibold py-3 px-4 rounded-lg btn-interactive flex items-center justify-center gap-2">
                <i data-lucide="instagram" class="w-5 h-5"></i>
                <span>Ver Dicas no Instagram</span>
            </a>
        `;
        chatInputArea.appendChild(optionsContainer);
        lucide.createIcons();
        scrollToBottom();
    }, 1500);
}

async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    const submitButton = form.querySelector('button[type="submit"]');
    submitButton.disabled = true;
    submitButton.innerHTML = `
        <div style="display: flex; align-items: center; justify-content: center; gap: 0.5rem;">
            <div class="spinner"></div>
            <span>Enviando...</span>
        </div>
    `;

    const formData = new FormData(form);

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();
        
        clearInputArea(); 
        hideTypingIndicator();

        if (result.success) {
            const leadName = form.nome_completo?.value || form.nome_proprietario?.value || "amigo(a)";
            addMessage(`Perfeito, ${leadName}! Recebemos seus dados.`);
            setTimeout(() => {
                addMessage("Nossa equipe de especialistas já vai preparar uma proposta com base no seu consumo. Em breve, entraremos em contato. Obrigado por se juntar à nossa comunidade de energia limpa! ✅");
                
                // ***** NOVA MELHORIA *****
                // Chama a função com as opções de WhatsApp e Instagram.
                setTimeout(showPostSubmissionOptions, 2000);

            }, 1200);
        } else {
            throw new Error(result.message);
        }
    } catch (error) {
        hideTypingIndicator();
        console.error('Erro no envio:', error);
        addMessage("Ocorreu um erro ao enviar seus dados. Por favor, tente novamente ou entre em contato direto. 😥", 'ia');
        
        submitButton.disabled = false;
        submitButton.innerHTML = 'Enviar para Análise';
    }
}

// --- FUNÇÕES DO MODAL ---
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

// --- LÓGICA DO BOTÃO DE ROLAGEM ---
chatMessages.addEventListener('scroll', () => {
    const tolerance = 50; 
    const isScrolledToBottom = chatMessages.scrollHeight - chatMessages.scrollTop <= chatMessages.clientHeight + tolerance;

    if (isScrolledToBottom) {
        scrollToBottomBtn.classList.add('hidden');
    } else {
        scrollToBottomBtn.classList.remove('hidden');
    }
});

scrollToBottomBtn.addEventListener('click', scrollToBottom);

window.onload = () => {
    startConversation();
    lucide.createIcons();
};