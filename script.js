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

let leadData = { type: null };

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
    bubble.className = `max-w-xs md:max-w-md p-3 rounded-2xl shadow-sm ${sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`;
    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    lucide.createIcons();
}

function showTypingIndicator() {
    const indicator = document.createElement('div');
    indicator.id = 'typing-indicator';
    indicator.className = 'chat-message flex justify-start';
    indicator.innerHTML = `
        <div class="bg-gray-200 p-3 rounded-2xl shadow-sm">
            <div class="typing-indicator">
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
                <div class="typing-dot"></div>
            </div>
        </div>
    `;
    chatMessages.appendChild(indicator);
    chatMessages.scrollTop = chatMessages.scrollHeight;
}

function hideTypingIndicator() {
    const indicator = document.getElementById('typing-indicator');
    if (indicator) {
        indicator.remove();
    }
}

function clearInputArea() {
    chatInputArea.innerHTML = '';
}

function startConversation() {
    updateProgress(10, 'calculo');
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        addMessage("Olá! 👋 Sou o assistente virtual do Consultor Marlon da Enerzee. Vamos descobrir em 30 segundos quanto você pode economizar na sua conta de luz?");
        showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator();
            addMessage("Para começar, me diga qual o valor médio da sua fatura. É 100% gratuito e sem compromisso.");
            showCalculatorInput();
        }, 1200);
    }, 500);
}

function showCalculatorInput() {
    const form = document.createElement('form');
    form.className = 'flex gap-2 chat-message';
    form.onsubmit = handleCalculation;
    form.innerHTML = `
        <input type="number" id="billValue" placeholder="Ex: 350,00" required class="flex-1 w-full p-2 border rounded-lg focus:ring-2 focus:ring-green-500 focus:outline-none" min="1" step="0.01">
        <button type="submit" class="bg-green-500 text-white font-semibold py-2 px-4 rounded-lg btn-interactive flex-shrink-0">Calcular</button>
    `;
    chatInputArea.appendChild(form);
    document.getElementById('billValue').focus();
}

function handleCalculation(event) {
    event.preventDefault();
    const billValue = parseFloat(document.getElementById('billValue').value);
    addMessage(`R$ ${billValue.toFixed(2).replace('.', ',')}`, 'user');
    clearInputArea();
    
    const SAVING_PERCENTAGE = 0.15;
    const monthlySaving = billValue * SAVING_PERCENTAGE;
    const semestralSaving = monthlySaving * 6;
    const annualSaving = monthlySaving * 12;

    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        updateProgress(33, 'calculo');
        const resultText = `
            <p class="font-semibold">Excelente! Com base nesse valor, seu potencial de economia é de:</p>
            <ul class="list-none mt-2 space-y-1">
                <li><strong>Mensal:</strong> <span class="font-bold text-green-600">R$ ${monthlySaving.toFixed(2).replace('.', ',')}</span></li>
                <li><strong>Semestral:</strong> <span class="font-bold text-green-600">R$ ${semestralSaving.toFixed(2).replace('.', ',')}</span></li>
                <li><strong>Anual:</strong> <span class="font-bold text-green-600">R$ ${annualSaving.toFixed(2).replace('.', ',')}</span></li>
            </ul>
        `;
        addMessage(resultText, 'ia', true);
        showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator();
            addMessage("<p class='text-xs'>Lembrando que essa economia é aplicada sobre seu consumo de energia. Taxas de iluminação pública e outros encargos da distribuidora não entram no cálculo.</p>", 'ia', true);
            setTimeout(showImpactButton, 1500);
        }, 1200);
    }, 800);
}

function showImpactButton() {
    const button = document.createElement('button');
    button.innerHTML = 'Descobrir meu impacto ambiental<i data-lucide="arrow-right" class="inline w-4 h-4 ml-1"></i>';
    button.className = 'w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg btn-interactive chat-message flex items-center justify-center';
    button.onclick = () => {
        clearInputArea();
        addMessage("Descobrir meu impacto ambiental", 'user');
        showTypingIndicator();
        setTimeout(showImpactMessage, 800);
    };
    chatInputArea.appendChild(button);
    lucide.createIcons();
}
        
function showImpactMessage() {
    hideTypingIndicator();
    updateProgress(66, 'impacto');
    addMessage("Essa economia vem de uma fonte 100% limpa. Ao se juntar à Enerzee, você não está apenas aliviando o bolso, <strong>está assumindo um papel fundamental na regeneração do nosso planeta.</strong>", 'ia', true);
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
         const impactText = `
            <div class="impact-card p-3 rounded-lg">
                <div class="flex items-center gap-3">
                    <i data-lucide="leaf" class="w-8 h-8 text-green-600 flex-shrink-0"></i>
                    <div>
                        <p class="font-bold text-gray-800">Você se junta a uma comunidade com +1.000 pessoas!</p>
                        <p class="text-sm text-gray-600">Juntas, já evitamos a emissão de 960 toneladas de CO₂, o mesmo que plantar +43.000 árvores ou tirar +560 carros das ruas! 🚗🌳</p>
                    </div>
                </div>
            </div>
        `;
        addMessage(impactText, 'ia', true);
        showTypingIndicator();
        setTimeout(() => {
            hideTypingIndicator();
            addMessage("Impressionante, não é? Pequenas escolhas geram grandes mudanças.");
            setTimeout(showProposalButton, 1500);
        }, 1500);
    }, 1200);
}

function showProposalButton() {
    const button = document.createElement('button');
    button.textContent = 'Gostei, quero a simulação!';
    button.className = 'w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg btn-interactive chat-message';
    button.onclick = () => {
        clearInputArea();
        addMessage("Gostei, quero a simulação!", 'user');
        showTypingIndicator();
        setTimeout(bridgeToFormalProposal, 800);
    };
    chatInputArea.appendChild(button);
}

function bridgeToFormalProposal() {
    hideTypingIndicator();
    addMessage("Excelente decisão! 😄 Para transformarmos esse potencial em uma simulação real e <strong>garantir seu desconto</strong>, o próximo passo é analisar sua fatura.", 'ia', true);
    showTypingIndicator();
    setTimeout(() => {
        hideTypingIndicator();
        addMessage("Para qual tipo de imóvel seria a simulação?");
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex gap-2 mt-2 chat-message';
        buttonContainer.innerHTML = `
            <button onclick="handleLeadType('pf')" class="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg btn-interactive">Residência</button>
            <button onclick="handleLeadType('pj')" class="flex-1 bg-green-500 text-white font-semibold py-2 px-4 rounded-lg btn-interactive">Empresa</button>
        `;
        chatInputArea.appendChild(buttonContainer);
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
        addMessage("Ótimo. Para preparar sua simulação personalizada, preciso que preencha os campos abaixo. <strong>Fique tranquilo(a), seus dados são protegidos pela LGPD e usados exclusivamente para essa finalidade.</strong>", 'ia', true);
        setTimeout(showProceedButton, 1800);
    }, 500);
}

function showProceedButton() {
    const button = document.createElement('button');
    button.textContent = 'Preencher Dados';
    button.className = 'w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg btn-interactive chat-message';
    button.onclick = () => {
        clearInputArea();
        addMessage("Preencher Dados", 'user');
        setTimeout(showSecureForm, 500);
    };
    chatInputArea.appendChild(button);
}

function showSecureForm() {
    const formContainer = document.createElement('form');
    formContainer.id = 'lead-form';
    formContainer.className = 'chat-message space-y-3 p-4 bg-gray-50 rounded-lg border';
    
    const pfFields = `<input name="name" type="text" placeholder="Nome Completo" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"><div><input name="cpf" type="text" placeholder="CPF" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"><small class="text-xs text-gray-500 px-1">Necessário para vincular a proposta ao titular da conta.</small></div><input name="email" type="email" placeholder="Seu melhor e-mail" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"><input name="phone" type="tel" placeholder="Telefone (com DDD)" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none">`;
    const pjFields = `<input name="responsavel_nome" type="text" placeholder="Nome Completo do Responsável" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"><input name="responsavel_cpf" type="text" placeholder="CPF do Responsável" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"><input name="responsavel_email" type="email" placeholder="E-mail Pessoal do Responsável" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"><input name="empresa_email" type="email" placeholder="E-mail da Empresa" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"><input name="responsavel_telefone" type="tel" placeholder="Telefone Pessoal (com DDD)" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none"><input name="empresa_telefone" type="tel" placeholder="Telefone da Empresa (com DDD)" required class="w-full p-2 border rounded-md focus:ring-2 focus:ring-green-500 focus:outline-none">`;

    const fileUploadSection = `<div><label class="block text-sm font-medium text-gray-700 mb-1">Anexe sua última fatura de energia:</label><div class="grid grid-cols-2 gap-2"><button type="button" id="upload-widget-btn" class="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 btn-interactive"><i data-lucide="upload-cloud" class="w-4 h-4"></i><span>Anexar Fatura</span></button></div><p id="file-name-display" class="text-xs text-gray-500 mt-2 text-center"></p></div>`;

    formContainer.innerHTML = `
        <input type="hidden" name="access_key" value="SUA_CHAVE_DE_ACESSO_AQUI">
        <input type="hidden" name="subject" value="Novo Lead para Simulação Enerzee!">
        <input type="hidden" id="fatura-url" name="fatura_url" value="">
        ${leadData.type === 'pf' ? pfFields : pjFields}
        ${fileUploadSection}
        <div class="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2"><span class="flex items-center gap-1"><i data-lucide="lock" class="w-4 h-4"></i> Ambiente Seguro</span><a href="#" id="privacy-link" class="hover:underline">Política de Privacidade</a></div>
        <button type="submit" class="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg btn-interactive">Enviar para Simulação</button>
    `;
    chatInputArea.appendChild(formContainer);
    
    const cloudinaryWidget = cloudinary.createUploadWidget({
        cloudName: 'di3ezpmyb', 
        uploadPreset: 'ci0yimyz',
        folder: 'faturas_enerzee',
        language: 'pt',
        text: { "pt": { "or_drag_a_file_here": "ou arraste o arquivo aqui" } }
    }, (error, result) => { 
        if (!error && result && result.event === "success") { 
            document.getElementById('fatura-url').value = result.info.secure_url;
            const fileNameDisplay = document.getElementById('file-name-display');
            fileNameDisplay.textContent = `Arquivo enviado: ${result.info.original_filename}`;
            fileNameDisplay.classList.add('text-green-600', 'font-semibold');
        }
    });

    document.getElementById('upload-widget-btn').onclick = () => cloudinaryWidget.open();
    document.getElementById('privacy-link').onclick = (e) => { e.preventDefault(); openPrivacyModal(); };
    
    formContainer.onsubmit = handleSubmit;
    lucide.createIcons();
    chatInputArea.scrollIntoView({ behavior: 'smooth', block: 'end' });
}
        
async function handleSubmit(event) {
    event.preventDefault();
    const form = event.target;
    
    if (!form.fatura_url.value) {
        alert('Por favor, anexe sua fatura de energia para continuar.');
        return;
    }
    
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    Object.assign(leadData, data);
    
    clearInputArea();
    addMessage("Enviando seus dados...", 'user');
    showTypingIndicator();

    try {
        const response = await fetch('https://api.web3forms.com/submit', {
            method: 'POST',
            body: formData,
        });
        const result = await response.json();

        if (result.success) {
            hideTypingIndicator();
            const leadName = leadData.name || leadData.responsavel_nome;
            addMessage(`Perfeito, ${leadName}! Recebi tudo certinho, incluindo o anexo.`);
            showTypingIndicator();
            setTimeout(() => {
                hideTypingIndicator();
                addMessage("Nossa equipe já está analisando seus dados para preparar a melhor proposta de economia para você. Em breve, um especialista entrará em contato. Obrigado por se juntar à nossa comunidade de energia limpa! ✅");
            }, 1200);
        } else {
            hideTypingIndicator();
            console.error("Erro no envio para Web3Forms:", result.message || result);
            addMessage("Ocorreu um erro ao enviar seus dados. Por favor, tente novamente mais tarde. 😥", 'ia');
        }
    } catch (error) {
        hideTypingIndicator();
        console.error('Erro de rede:', error);
        addMessage("Ocorreu um erro de conexão. Verifique sua internet e tente novamente. 😥", 'ia');
    }
}

function openPrivacyModal() {
    privacyModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden';
}
function closePrivacyModal() {
    privacyModal.classList.add('hidden');
    document.body.style.overflow = '';
}
closePrivacyModalBtn.onclick = closePrivacyModal;
privacyModal.onclick = (e) => {
    if (e.target === privacyModal) closePrivacyModal();
};

window.onload = startConversation;