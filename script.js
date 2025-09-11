const chatMessages = document.getElementById('chat-messages');
const chatInputArea = document.getElementById('chat-input-area');
const progressBar = document.getElementById('progress-bar');
const progressLabels = {
    calculo: document.getElementById('label-calculo'),
    impacto: document.getElementById('label-impacto'),
    proposta: document.getElementById('label-proposta'),
};

// Variáveis para o Modal de Privacidade
const privacyModal = document.getElementById('privacy-modal');
const closePrivacyModalBtn = document.getElementById('close-privacy-modal');

let leadData = { type: null };

function updateProgress(percentage, activeLabel) {
    progressBar.style.width = `${percentage}%`;
    Object.values(progressLabels).forEach(label => label.classList.remove('font-bold'));
    if (progressLabels[activeLabel]) {
        progressLabels[activeLabel].classList.add('font-bold');
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
    bubble.className = `max-w-xs md:max-w-md p-3 rounded-2xl ${sender === 'user' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-800'}`;
    messageDiv.appendChild(bubble);
    chatMessages.appendChild(messageDiv);
    chatMessages.scrollTop = chatMessages.scrollHeight;
    lucide.createIcons();
}

function clearInputArea() {
    chatInputArea.innerHTML = '';
}

function startConversation() {
    updateProgress(10, 'calculo');
    addMessage("Olá! 👋 Sou o assistente Virtual do Consultor Marlon Lotici da Enerzee. Vamos descobrir em 30 segundos quanto você pode economizar na sua conta de luz?");
    setTimeout(() => {
        addMessage("Para começar, me diga qual o valor médio da sua fatura. É 100% gratuito e sem compromisso.");
        showCalculatorInput();
    }, 1200);
}

function showCalculatorInput() {
    const form = document.createElement('form');
    form.className = 'flex gap-2 chat-message';
    form.onsubmit = handleCalculation;
    form.innerHTML = `
        <input type="number" id="billValue" placeholder="Ex: 350,00" required class="flex-grow p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:outline-none" min="1" step="0.01">
        <button type="submit" class="bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">Calcular</button>
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

    setTimeout(() => {
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
        setTimeout(() => {
            addMessage("<p class='text-xs'>Lembrando que essa economia é aplicada sobre seu consumo de energia. Taxas de iluminação pública e outros encargos da distribuidora não entram no cálculo.</p>", 'ia', true);
            setTimeout(showImpactButton, 1500);
        }, 1200);
    }, 500);
}

function showImpactButton() {
    const button = document.createElement('button');
    button.innerHTML = 'Descobrir Meu Impacto no Planeta<i data-lucide="arrow-right" class="inline w-4 h-4 ml-1"></i>';
    button.className = 'w-full bg-green-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-green-600 transition-colors chat-message flex items-center justify-center';
    button.onclick = () => {
        clearInputArea();
        addMessage("Descobrir Meu Impacto no Planeta", 'user');
        setTimeout(showImpactMessage, 500);
    };
    chatInputArea.appendChild(button);
    lucide.createIcons();
}

function showImpactMessage() {
    updateProgress(66, 'impacto');
    addMessage("E o melhor: essa economia vem de uma fonte 100% limpa. Ao se juntar à Enerzee, você não está apenas aliviando o bolso, <strong>está assumindo um papel fundamental na regeneração da Natureza.</strong>", 'ia', true);
    setTimeout(() => {
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
            setTimeout(() => {
                addMessage("Impressionante, não é? Pequenas escolhas geram grandes mudanças.");
                setTimeout(showProposalButton, 1500);
            }, 1500);
    }, 1200);
}

function showProposalButton() {
    const button = document.createElement('button');
    button.textContent = 'Começar a economizar agora sem custo!';
    button.className = 'w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors chat-message';
    button.onclick = () => {
        clearInputArea();
        addMessage("Começar a Economizar Agora!", 'user');
        setTimeout(bridgeToFormalProposal, 500);
    };
    chatInputArea.appendChild(button);
}

function bridgeToFormalProposal() {
    addMessage("Excelente decisão! 😄 Para transformarmos esse potencial em uma <strong>proposta formal</strong> e garantir seu desconto, o próximo passo é analisar sua fatura.", 'ia', true);
    setTimeout(() => {
        addMessage("Para qual tipo de imóvel seria a simulação?");
        const buttonContainer = document.createElement('div');
        buttonContainer.className = 'flex gap-2 mt-2 chat-message';
        buttonContainer.innerHTML = `
            <button onclick="handleLeadType('pf')" class="flex-1 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">Residência</button>
            <button onclick="handleLeadType('pj')" class="flex-1 bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors">Empresa</button>
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
    setTimeout(() => {
        addMessage("Ótimo. Para preparar sua proposta oficial, preciso que preencha os campos abaixo. <strong>Fique tranquilo(a), seus dados são protegidos pela LGPD e usados exclusivamente para a simulação.</strong>", 'ia', true);
        setTimeout(showProceedButton, 1800);
    }, 500);
}

function showProceedButton() {
    const button = document.createElement('button');
    button.textContent = 'Preencher Dados';
    button.className = 'w-full bg-blue-500 text-white font-semibold py-2 px-4 rounded-lg hover:bg-blue-600 transition-colors chat-message';
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
    formContainer.onsubmit = handleSubmit;
    
    const pfFields = `
        <input name="name" type="text" placeholder="Nome Completo" required class="w-full p-2 border rounded-md">
        <div>
            <input name="cpf" type="text" placeholder="CPF" required class="w-full p-2 border rounded-md">
            <small class="text-xs text-gray-500 px-1">Necessário para vincular a proposta ao titular da conta.</small>
        </div>
        <input name="email" type="email" placeholder="Seu melhor e-mail" required class="w-full p-2 border rounded-md">
        <input name="phone" type="tel" placeholder="Telefone (com DDD)" required class="w-full p-2 border rounded-md">
    `;
    
    const pjFields = `
        <input name="responsavel_nome" type="text" placeholder="Nome Completo do Responsável" required class="w-full p-2 border rounded-md">
        <input name="responsavel_cpf" type="text" placeholder="CPF do Responsável" required class="w-full p-2 border rounded-md">
        <input name="responsavel_email" type="email" placeholder="E-mail Pessoal do Responsável" required class="w-full p-2 border rounded-md">
        <input name="empresa_email" type="email" placeholder="E-mail da Empresa" required class="w-full p-2 border rounded-md">
        <input name="responsavel_telefone" type="tel" placeholder="Telefone Pessoal (com DDD)" required class="w-full p-2 border rounded-md">
        <input name="empresa_telefone" type="tel" placeholder="Telefone da Empresa (com DDD)" required class="w-full p-2 border rounded-md">
    `;

    const fileUploadSection = `
        <div>
            <label class="block text-sm font-medium text-gray-700 mb-1">Anexe sua última fatura de energia:</label>
            <div class="grid grid-cols-2 gap-2">
                <button type="button" id="upload-btn" class="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <i data-lucide="upload-cloud" class="w-4 h-4"></i>
                    <span>Upload</span>
                </button>
                <button type="button" id="camera-btn" class="w-full flex items-center justify-center gap-2 bg-white border border-gray-300 text-gray-700 font-semibold py-2 px-4 rounded-lg hover:bg-gray-50 transition-colors">
                    <i data-lucide="camera" class="w-4 h-4"></i>
                    <span>Tirar Foto</span>
                </button>
            </div>
            <p id="file-name-display" class="text-xs text-gray-500 mt-2 text-center"></p>
            <input type="file" id="fatura-input" name="fatura" class="hidden" accept="image/*,.pdf" required>
        </div>
    `;

    formContainer.innerHTML = `
        ${leadData.type === 'pf' ? pfFields : pjFields}
        ${fileUploadSection}
        <div class="flex items-center justify-center gap-4 text-xs text-gray-500 pt-2">
            <span class="flex items-center gap-1"><i data-lucide="lock" class="w-4 h-4"></i> Ambiente Seguro</span>
            <a href="#" id="privacy-link" class="hover:underline">Política de Privacidade</a>
        </div>
        <button type="submit" class="w-full bg-green-500 text-white font-bold py-3 px-4 rounded-lg hover:bg-green-600 transition-colors">Enviar para Simulação</button>
    `;
    chatInputArea.appendChild(formContainer);

    // Adiciona listeners para os botões de upload
    const faturaInput = document.getElementById('fatura-input');
    const uploadBtn = document.getElementById('upload-btn');
    const cameraBtn = document.getElementById('camera-btn');
    const fileNameDisplay = document.getElementById('file-name-display');

    uploadBtn.onclick = () => {
        faturaInput.removeAttribute('capture');
        faturaInput.click();
    };

    cameraBtn.onclick = () => {
        faturaInput.setAttribute('capture', 'environment');
        faturaInput.click();
    };

    faturaInput.onchange = (event) => {
        if (event.target.files && event.target.files.length > 0) {
            fileNameDisplay.textContent = `Arquivo: ${event.target.files[0].name}`;
            fileNameDisplay.classList.add('text-green-600', 'font-semibold');
        } else {
            fileNameDisplay.textContent = '';
            fileNameDisplay.classList.remove('text-green-600', 'font-semibold');
        }
    };
    
    // NOVO: Adiciona o listener para o link da Política de Privacidade AQUI
    const privacyLink = document.getElementById('privacy-link');
    if (privacyLink) { 
        privacyLink.onclick = (e) => {
            e.preventDefault(); 
            openPrivacyModal();
        };
    }

    lucide.createIcons();
    chatInputArea.scrollIntoView({ behavior: 'smooth', block: 'end' });
}

async function handleSubmit(event) {
    event.preventDefault();

    // Coleta os dados do formulário
    const form = event.target;
    const formData = new FormData(form);
    const data = Object.fromEntries(formData.entries());
    Object.assign(leadData, data); // Mantém os dados no leadData para referência interna

    clearInputArea();
    addMessage("Enviando seus dados...", 'user');

    try {
        // URL do seu endpoint Formspree (SUBSTITUA COM O SEU CÓDIGO ÚNICO DO FORMSPREE)
        const formspreeUrl = 'https://formspree.io/f/myzdovvl'; 

        const response = await fetch(formspreeUrl, {
            method: 'POST',
            body: formData, // Envia o FormData diretamente para incluir o arquivo anexo
            headers: {
                'Accept': 'application/json' // Informa ao Formspree que esperamos JSON como resposta
            }
        });

        if (response.ok) { // Verifica se a requisição foi bem-sucedida (status 200)
            const leadName = leadData.name || leadData.responsavel_nome;
            addMessage(`Perfeito, ${leadName}! Recebi tudo certinho.`);
            setTimeout(() => {
                addMessage("Nossa equipe já está analisando seus dados para preparar a melhor proposta de economia para você. Em breve, um especialista entrará em contato. Obrigado por se juntar à nossa comunidade de energia limpa! ✅");
            }, 1200);
        } else {
            // Se houver erro, tenta ler a mensagem de erro do Formspree
            const errorData = await response.json();
            console.error('Erro ao enviar para Formspree:', errorData);
            addMessage("Ocorreu um erro ao enviar seus dados. Por favor, tente novamente mais tarde ou entre em contato direto. 😥", 'ia');
        }
    } catch (error) {
        console.error('Erro na requisição de rede:', error);
        addMessage("Ocorreu um erro de conexão. Por favor, verifique sua internet e tente novamente. 😥", 'ia');
    }
}
    
    

// Funções para abrir e fechar o modal de privacidade
function openPrivacyModal() {
    privacyModal.classList.remove('hidden');
    document.body.style.overflow = 'hidden'; // Para evitar que o scroll da página principal funcione
}

function closePrivacyModal() {
    privacyModal.classList.add('hidden');
    document.body.style.overflow = ''; // Restaura o scroll da página
}

// Event Listeners globais para fechar o modal
closePrivacyModalBtn.onclick = closePrivacyModal;
privacyModal.onclick = (e) => {
    if (e.target === privacyModal) { // Fecha o modal ao clicar fora, mas dentro da área escura
        closePrivacyModal();
    }
};


window.onload = startConversation;