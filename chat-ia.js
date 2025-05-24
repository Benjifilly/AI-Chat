document.addEventListener('DOMContentLoaded', function() {    // Éléments DOM
    const userInput = document.getElementById('user-input');
    const sendButton = document.getElementById('send-btn');
    const chatContainer = document.getElementById('chat-container');
    const welcomeScreen = document.getElementById('welcome-screen');
    const newChatBtn = document.getElementById('new-chat-btn');
    const clearConversationsBtn = document.getElementById('clear-conversations-btn') || document.createElement('button'); // Fallback si l'élément n'existe plus
    const conversationsList = document.getElementById('conversations-list');
    const modelSelect = document.getElementById('model-select');
    const exampleCards = document.querySelectorAll('.example-card');
    const apiStatus = document.getElementById('api-status');
    const profilePic = document.getElementById('profile-pic');
    const settingsBtn = document.getElementById('settings-btn');
    const sidebarElement = document.getElementById('sidebar');
    const toggleSidebarBtn = document.getElementById('toggle-sidebar-btn');    const searchBtn = document.getElementById('search-btn');
    const searchModal = document.getElementById('search-modal');
    const searchModalInput = document.getElementById('search-modal-input');
    const closeSearchModalBtn = document.getElementById('close-search-modal');
    const searchResults = document.getElementById('search-results');
    const sidebarOverlay = document.getElementById('sidebar-overlay'); // Overlay pour mobile
    
    console.log('Profile Pic:', profilePic);
    console.log('Settings Button:', settingsBtn);
    
    // Initialiser les données utilisateur à partir de PHP si disponibles
    if (typeof userData !== 'undefined') {
        console.log('User data from PHP:', userData);
        
        // Mettre à jour le nom d'utilisateur dans l'interface
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay && userData.username) {
            usernameDisplay.textContent = userData.username;
        }
        
        // Mettre à jour le champ de saisie du nom d'utilisateur dans les paramètres
        const usernameInput = document.getElementById('username-input');
        if (usernameInput && userData.username) {
            usernameInput.value = userData.username;
        }
        
        // Mettre à jour la photo de profil si elle est définie
        if (userData.profilePic) {
            const profilePicPath = `uploads/${userData.profilePic}`;
            if (profilePic) {
                profilePic.style.backgroundImage = `url('${profilePicPath}')`;
            }
            
            const profilePicDisplay = document.getElementById('profile-pic-display');
            if (profilePicDisplay) {
                profilePicDisplay.style.backgroundImage = `url('${profilePicPath}')`;
            }
        }
    }
    
    // Éléments pour les modales
    const renameModal = document.getElementById('rename-modal');
    const deleteModal = document.getElementById('delete-modal');
    const settingsModal = document.getElementById('settings-modal');
    const confirmRenameBtn = document.getElementById('confirm-rename-btn');
    const confirmDeleteBtn = document.getElementById('confirm-delete-btn');
    const cancelRenameBtn = document.getElementById('cancel-rename-btn');
    const cancelDeleteBtn = document.getElementById('cancel-delete-btn');
    const closeModalBtns = document.querySelectorAll('.close-modal');
    const settingsMenuItems = document.querySelectorAll('.settings-menu-item');
    const settingsTabs = document.querySelectorAll('.settings-tab');
    const themeSelect = document.getElementById('theme-select');
    const languageSelect = document.getElementById('language-select');
    const apiKeyInput = document.getElementById('api-key-input');
    const saveApiKeyBtn = document.getElementById('save-api-key-btn');
    const settingsClearConversationsBtn = document.getElementById('settings-clear-conversations-btn');
    const changeProfilePicBtn = document.getElementById('change-profile-pic-btn');    const profilePicInput = document.getElementById('profile-pic-input');
    const profilePicDisplay = document.getElementById('profile-pic-display');
    const usernameInput = document.getElementById('username-input');
    const saveUsernameBtn = document.getElementById('save-username-btn');
    const gptApiKeyInput = document.getElementById('gpt-api-key-input');
    const saveGptApiKeyBtn = document.getElementById('save-gpt-api-key-btn');
    
    // Variables
    let currentConversationId = null;
    let conversations = loadConversations();
    let isWaitingForResponse = false;
    let apiAvailable = false;
    let userSettings = loadUserSettings();
      // Vérifier l'état de l'API au chargement
    checkAPIStatus();
    
    // Initialiser l'interface
    initInterface();
      // Appliquer les paramètres utilisateur
    applyUserSettings();
    
    // Initialiser toutes les améliorations
    initializeEnhancements();
    
    // Gestionnaires d'événements pour les modales
    confirmRenameBtn.addEventListener('click', confirmRenameConversation);
    confirmDeleteBtn.addEventListener('click', confirmDeleteConversation);
    
    cancelRenameBtn.addEventListener('click', function() {
        renameModal.classList.remove('active');
    });
    
    cancelDeleteBtn.addEventListener('click', function() {
        deleteModal.classList.remove('active');
    });
    
    closeModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            renameModal.classList.remove('active');
            deleteModal.classList.remove('active');
        });
    });
    
    // Fermer les modales en cliquant en dehors
    window.addEventListener('click', function(e) {
        if (e.target === renameModal) {
            renameModal.classList.remove('active');
        }
        if (e.target === deleteModal) {
            deleteModal.classList.remove('active');
        }
    });
    
    // Gestion de la touche Entrée dans la modale de renommage
    document.getElementById('new-conversation-name').addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
            e.preventDefault();
            confirmRenameConversation();
        }
    });
    
    // Gestionnaires d'événements
    userInput.addEventListener('input', function() {
        // Ajuster la hauteur de textarea en fonction du contenu
        this.style.height = 'auto';
        this.style.height = (this.scrollHeight) + 'px';
        
        // Activer/désactiver le bouton d'envoi
        sendButton.disabled = this.value.trim() === '';
    });
    
    userInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault();
            if (!sendButton.disabled) {
                sendMessage();
            }
        }
    });
    
    sendButton.addEventListener('click', sendMessage);
      newChatBtn.addEventListener('click', startNewConversation);
    
    clearConversationsBtn.addEventListener('click', function() {
        // Afficher le modal de confirmation
        const clearModal = document.getElementById('clear-conversations-modal');
        clearModal.classList.add('active');
    });
    
    exampleCards.forEach(card => {
        card.addEventListener('click', function() {
            const prompt = this.getAttribute('data-prompt');
            userInput.value = prompt;
            userInput.dispatchEvent(new Event('input'));
            sendMessage();
        });
    });
    
    // Fonctions
    function initInterface() {
        // Initialiser l'état des catégories si nécessaire
        if (!localStorage.getItem('chatia-category-state')) {
            // Par défaut, les catégories sont dépliées
            const defaultState = {
                'recent': false,
                'month': false
            };
            localStorage.setItem('chatia-category-state', JSON.stringify(defaultState));
        }
        
        renderConversationsList();
        
        if (conversations.length === 0) {
            // Afficher l'écran d'accueil si aucune conversation n'existe
            showWelcomeScreen();
        } else {
            // Charger la conversation la plus récente
            loadMostRecentConversation();
        }
    }
    
    function startNewConversation() {
        // Créer une nouvelle conversation
        const newId = Date.now().toString();
        const newConversation = {
            id: newId,
            title: 'Nouvelle conversation',
            messages: [],
            model: modelSelect.value
        };
        
        conversations.push(newConversation);
        currentConversationId = newId;
        saveConversations();
        
        // Obtenir la catégorie pour la nouvelle conversation
        const category = getDateCategory(newId);
        
        // S'assurer que la catégorie de la nouvelle conversation est dépliée
        const categoryState = loadCategoryState();
        if (categoryState[category.id]) {
            categoryState[category.id] = false; // Déplier la catégorie
            localStorage.setItem('chatia-category-state', JSON.stringify(categoryState));
        }
        
        renderConversationsList();
        
        // Effacer la zone de chat et afficher l'écran d'accueil
        chatContainer.innerHTML = '';
        chatContainer.appendChild(welcomeScreen);
        welcomeScreen.style.display = 'flex';
    }
      function loadConversation(conversationId) {
        const conversation = conversations.find(conv => conv.id === conversationId);
        if (!conversation) return;
          currentConversationId = conversationId;
        
        // Mettre à jour l'interface pour la conversation sélectionnée
        chatContainer.innerHTML = '';
        welcomeScreen.style.display = 'none';
          // Restaurer le modèle sélectionné pour cette conversation
        modelSelect.value = conversation.model || 'llama-7b';
        
        // Vérifier et, si nécessaire, corriger la structure des messages de la conversation
        ensureValidMessageStructure(conversation);
        
        // Afficher tous les messages de la conversation
        conversation.messages.forEach(msg => {
            addMessageToUI(msg.role, msg.content);
        });
        
        // Mettre à jour la liste des conversations (pour l'élément actif)
        renderConversationsList();
        
        // Faire défiler jusqu'au bas
        scrollToBottom();
    }
    
    // Fonction pour vérifier et corriger la structure des messages
    function ensureValidMessageStructure(conversation) {
        if (!conversation || !conversation.messages || conversation.messages.length === 0) return;
        
        const correctedMessages = [];
        let lastRole = null;
        
        // Parcourir tous les messages et s'assurer de l'alternance correcte des rôles
        for (const msg of conversation.messages) {
            // Si c'est le premier message ou si le rôle est différent du précédent
            if (lastRole === null || msg.role !== lastRole) {
                correctedMessages.push(msg);
                lastRole = msg.role;
            } else {
                // Si deux messages consécutifs ont le même rôle, combiner leur contenu
                const lastMsg = correctedMessages[correctedMessages.length - 1];
                lastMsg.content += "\n\n" + msg.content;
            }
        }
        
        // S'assurer que le dernier message est toujours de l'utilisateur si nécessaire
        if (correctedMessages.length > 0 && 
            correctedMessages[correctedMessages.length - 1].role === 'bot' &&
            correctedMessages.length % 2 === 1) {
            // Ajouter un message vide de l'utilisateur pour maintenir l'alternance
            correctedMessages.push({
                role: 'user',
                content: '[Message système: Attente de réponse...]'
            });
        }
        
        // Mettre à jour la conversation avec les messages corrigés
        conversation.messages = correctedMessages;
        saveConversations();
    }
    
    function loadMostRecentConversation() {
        if (conversations.length > 0) {
            // Trier les conversations par date (en supposant que l'ID est un timestamp)
            const sortedConversations = [...conversations].sort((a, b) => parseInt(b.id) - parseInt(a.id));
            loadConversation(sortedConversations[0].id);
        }
    }      function sendMessage() {
        const message = userInput.value.trim();
        
        // Valider le message avant traitement
        if (!validateMessage(message) || isWaitingForResponse) {
            return;
        }
        
        // Créer une nouvelle conversation si nécessaire
        if (!currentConversationId) {
            startNewConversation();
        }
        
        // Cacher l'écran d'accueil
        welcomeScreen.style.display = 'none';
        
        // Ajouter le message de l'utilisateur à l'interface
        addMessageToUI('user', message);
        
        // Ajouter le message à la conversation actuelle
        const currentConversation = conversations.find(conv => conv.id === currentConversationId);
        currentConversation.messages.push({
            role: 'user',
            content: message
        });
        
        // Mettre à jour le titre de la conversation basé sur le premier message
        if (currentConversation.messages.length === 1) {
            currentConversation.title = message.substring(0, 30) + (message.length > 30 ? '...' : '');
            renderConversationsList();
        }
        
        // Enregistrer les conversations
        saveConversations();
        
        // Effacer l'entrée utilisateur et réinitialiser la hauteur
        userInput.value = '';
        userInput.style.height = 'auto';
        sendButton.disabled = true;
        
        // Faire défiler vers le bas
        scrollToBottom();
        
        // Obtenir la réponse de l'IA
        isWaitingForResponse = true;
        simulateTyping().then(response => {
            addMessageToUI('bot', response);
            
            // Ajouter la réponse de l'IA à la conversation
            currentConversation.messages.push({
                role: 'bot',
                content: response
            });
            
            // Enregistrer les conversations
            saveConversations();
            
            // Faire défiler vers le bas
            scrollToBottom();
            
            isWaitingForResponse = false;
        });
    }
      function addMessageToUI(role, content) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `message ${role}`;
        
        // Ajouter un ID unique pour les messages
        messageDiv.setAttribute('data-message-id', Date.now() + Math.random());
        
        const messageHeader = document.createElement('div');
        messageHeader.className = 'message-header';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        
        // Améliorer les avatars avec icônes
        if (role === 'user') {
            avatar.innerHTML = '<i class="fas fa-user"></i>';
            messageDiv.classList.add('message-user');
        } else {
            avatar.innerHTML = '<i class="fas fa-robot"></i>';
            messageDiv.classList.add('message-assistant');
        }
        
        const messageContent = document.createElement('div');
        messageContent.className = 'message-content';
          // Ajouter timestamp
        const timestamp = document.createElement('span');
        timestamp.className = 'message-timestamp';
        const now = new Date();
        timestamp.textContent = now.toLocaleTimeString('fr-FR', { 
            hour: '2-digit', 
            minute: '2-digit' 
        });
        timestamp.setAttribute('data-original-time', now.toISOString());
        timestamp.title = now.toLocaleString('fr-FR');
        
        // Si c'est un message de l'IA, on utilise marked pour le rendu Markdown
        if (role === 'bot' || role === 'assistant') {
            // Configuration avancée de marked
            const renderer = new marked.Renderer();
            renderer.code = function(code, language) {
                const validLanguage = hljs.getLanguage(language) ? language : 'plaintext';
                const highlightedCode = hljs.highlight(code, { language: validLanguage }).value;
                
                return `
                    <div class="code-block-container">
                        <div class="code-block-header">
                            <span class="code-language">${language || 'code'}</span>
                            <button class="copy-code-btn" title="Copier le code">
                                <i class="fas fa-copy"></i>
                            </button>
                        </div>
                        <pre><code class="hljs language-${validLanguage}">${highlightedCode}</code></pre>
                    </div>
                `;
            };
            
            marked.setOptions({
                renderer: renderer,
                breaks: true,
                gfm: true
            });
            
            messageContent.innerHTML = marked.parse(content);
            
            // Ajouter les événements de copie après le rendu
            setTimeout(() => {
                addCopyButtonEvents(messageContent);
            }, 100);
            
        } else {
            // Pour les messages utilisateur, préserver les sauts de ligne
            const formattedContent = content.replace(/\n/g, '<br>');
            messageContent.innerHTML = formattedContent;
        }
        
        // Actions pour les messages (copier, partager, etc.)
        const messageActions = document.createElement('div');
        messageActions.className = 'message-actions';
        messageActions.innerHTML = `
            <button class="message-action-btn copy-message-btn" title="Copier le message">
                <i class="fas fa-copy"></i>
            </button>
            <button class="message-action-btn regenerate-btn" title="Régénérer" style="display: ${role === 'bot' || role === 'assistant' ? 'block' : 'none'}">
                <i class="fas fa-redo"></i>
            </button>
        `;
        
        messageHeader.appendChild(avatar);
        messageHeader.appendChild(timestamp);
        messageDiv.appendChild(messageHeader);
        messageDiv.appendChild(messageContent);
        messageDiv.appendChild(messageActions);
        
        // Animation d'entrée
        messageDiv.style.opacity = '0';
        messageDiv.style.transform = 'translateY(20px)';
        chatContainer.appendChild(messageDiv);
        
        // Déclencher l'animation
        requestAnimationFrame(() => {
            messageDiv.style.transition = 'opacity 0.4s ease, transform 0.4s ease';
            messageDiv.style.opacity = '1';
            messageDiv.style.transform = 'translateY(0)';
        });
        
        // Ajouter les événements pour les actions de messages
        addMessageActionEvents(messageDiv, content);
        
        // Faire défiler vers le bas
        scrollToBottom();
    }
    
    // Fonction pour ajouter les événements de copie des blocs de code
    function addCopyButtonEvents(messageContent) {
        messageContent.querySelectorAll('.copy-code-btn').forEach(btn => {
            btn.addEventListener('click', async function(e) {
                e.preventDefault();
                const codeBlock = this.closest('.code-block-container').querySelector('code');
                const code = codeBlock.textContent;
                
                try {
                    await navigator.clipboard.writeText(code);
                    
                    // Feedback visuel
                    const originalIcon = this.innerHTML;
                    this.innerHTML = '<i class="fas fa-check"></i>';
                    this.classList.add('copied');
                    
                    setTimeout(() => {
                        this.innerHTML = originalIcon;
                        this.classList.remove('copied');
                    }, 2000);
                    
                    showSuccessNotification('Code copié dans le presse-papiers');
                } catch (err) {
                    showErrorNotification('Erreur lors de la copie du code');
                }
            });
        });
    }
    
    // Fonction pour ajouter les événements d'actions des messages
    function addMessageActionEvents(messageDiv, content) {
        const copyBtn = messageDiv.querySelector('.copy-message-btn');
        const regenerateBtn = messageDiv.querySelector('.regenerate-btn');
        
        copyBtn.addEventListener('click', async function() {
            try {
                await navigator.clipboard.writeText(content);
                
                // Feedback visuel
                const originalIcon = this.innerHTML;
                this.innerHTML = '<i class="fas fa-check"></i>';
                
                setTimeout(() => {
                    this.innerHTML = originalIcon;
                }, 2000);
                
                showSuccessNotification('Message copié dans le presse-papiers');
            } catch (err) {
                showErrorNotification('Erreur lors de la copie du message');
            }
        });
          if (regenerateBtn) {
            regenerateBtn.addEventListener('click', async function() {
                try {
                    // Trouver le message précédent de l'utilisateur
                    const messageId = messageDiv.getAttribute('data-message-id');
                    const currentConversation = conversations.find(conv => conv.id === currentConversationId);
                    
                    if (!currentConversation) {
                        showErrorNotification('Aucune conversation active trouvée');
                        return;
                    }
                    
                    // Trouver le dernier message utilisateur avant ce message IA
                    let lastUserMessage = null;
                    for (let i = currentConversation.messages.length - 1; i >= 0; i--) {
                        if (currentConversation.messages[i].role === 'user') {
                            lastUserMessage = currentConversation.messages[i].content;
                            break;
                        }
                    }
                    
                    if (!lastUserMessage) {
                        showErrorNotification('Aucun message utilisateur trouvé pour la régénération');
                        return;
                    }
                    
                    // Désactiver le bouton pendant la régénération
                    this.disabled = true;
                    this.innerHTML = '<i class="fas fa-spinner fa-spin"></i>';
                    
                    // Supprimer le message IA actuel de la conversation
                    currentConversation.messages = currentConversation.messages.filter(msg => 
                        !(msg.role === 'assistant' && msg === currentConversation.messages[currentConversation.messages.length - 1])
                    );
                    
                    // Supprimer le message de l'interface
                    messageDiv.style.animation = 'fadeOut 0.3s ease';
                    setTimeout(() => {
                        if (messageDiv.parentNode) {
                            messageDiv.parentNode.removeChild(messageDiv);
                        }
                    }, 300);
                    
                    // Attendre un peu pour l'animation
                    await new Promise(resolve => setTimeout(resolve, 400));
                    
                    // Simuler l'indication de frappe
                    simulateTyping();
                    
                    // Régénérer la réponse
                    const response = await callAIAPI(lastUserMessage, currentConversation.model || modelSelect.value);
                    
                    // Ajouter la nouvelle réponse
                    addMessageToUI('assistant', response);
                    
                    // Mettre à jour la conversation
                    currentConversation.messages.push({
                        role: 'assistant',
                        content: response
                    });
                    
                    saveConversations();
                    showSuccessNotification('Réponse régénérée avec succès');
                    
                } catch (error) {
                    console.error('Erreur lors de la régénération:', error);
                    showErrorNotification('Erreur lors de la régénération: ' + error.message);
                    
                    // Réactiver le bouton en cas d'erreur
                    this.disabled = false;
                    this.innerHTML = '<i class="fas fa-redo"></i>';
                }
            });
        }
    }function simulateTyping() {
        // Créer un indicateur de frappe
        const typingDiv = document.createElement('div');
        typingDiv.className = 'message bot';
        
        const typingHeader = document.createElement('div');
        typingHeader.className = 'message-header';
        
        const avatar = document.createElement('div');
        avatar.className = 'message-avatar';
        avatar.textContent = 'AI';
        
        const typingIndicator = document.createElement('div');
        typingIndicator.className = 'typing-indicator';
        typingIndicator.innerHTML = '<span></span><span></span><span></span>';
        
        typingHeader.appendChild(avatar);
        typingDiv.appendChild(typingHeader);
        typingDiv.appendChild(typingIndicator);
        
        chatContainer.appendChild(typingDiv);
        scrollToBottom();
        
        // Obtenir la conversation courante
        const currentConversation = conversations.find(conv => conv.id === currentConversationId);
        
        // Obtenir le dernier message
        const latestUserMessage = currentConversation.messages
            .filter(msg => msg.role === 'user')
            .pop()?.content || "";
            
        const selectedModel = modelSelect.value;
        
        // Appeler l'API pour générer une réponse (utilisant l'historique des conversations)
        return new Promise(resolve => {
            callAIAPI(latestUserMessage, selectedModel)
                .then(response => {
                    // Supprimer l'indicateur de frappe
                    chatContainer.removeChild(typingDiv);
                    resolve(response);
                })
                .catch(error => {
                    // En cas d'erreur, utiliser une réponse de secours et afficher une notification
                    console.error("Erreur API:", error);
                    showErrorNotification("Impossible de se connecter à l'API. Veuillez vérifier votre connexion Internet ou réessayer plus tard.");
                    chatContainer.removeChild(typingDiv);
                    resolve("Désolé, je n'ai pas pu générer de réponse pour le moment. Veuillez réessayer plus tard.");
                });
        });
    }    // Fonction pour appeler l'API IA avec support pour l'historique des conversations
    async function callAIAPI(message, model) {
        // Configuration des modèles disponibles Hugging Face
        // Utiliser les constantes définies dans le fichier Hugging.js
        // Si réutilisées plusieurs fois dans le code, mieux vaut les centraliser
        const MODELES_DISPONIBLES = [
            'meta-llama/Llama-3.1-8B-Instruct',
            'mistralai/Mistral-7B-Instruct-v0.3'
        ];

        // Mapper les modèles de l'interface vers les modèles Hugging Face
        const modelMapping = {
            'llama-7b': 'meta-llama/Llama-3.1-8B-Instruct',
            'mistral-7b': 'mistralai/Mistral-7B-Instruct-v0.3'
        };
        const modeleChoisi = modelMapping[model] || MODELES_DISPONIBLES[0];
        
        // Récupérer la clé API Hugging Face
        const huggingFaceApiKey = userSettings.apiKey;

        // Vérifier la clé API Hugging Face
        if (!huggingFaceApiKey) {
            return getKeyMissingMessage('huggingface');
        }
        
        // Gestion des messages simples avec réponses prédéfinies (seulement pour les messages courts)
        const quickResponses = {
            "bonjour": "Bonjour ! Comment puis-je vous aider aujourd'hui ?",
            "salut": "Salut ! Comment puis-je vous aider ?",
            "comment ça va": "Je suis une IA, donc je n'ai pas de sentiments, mais je suis prêt à vous aider !",
            "qui es-tu": "Je suis ChatIA, un assistant IA conçu pour converser et répondre à vos questions. J'utilise des modèles d'IA à travers l'API Hugging Face.",
            "merci": "Je vous en prie ! N'hésitez pas si vous avez d'autres questions.",
            "au revoir": "Au revoir ! N'hésitez pas à revenir si vous avez d'autres questions."
        };
        
        // Vérifier s'il s'agit d'un message simple et court
        const lowerMessage = message.toLowerCase();
        for (const [key, value] of Object.entries(quickResponses)) {
            if (lowerMessage.includes(key) && lowerMessage.length < 20) {
                return value;
            }
        }

        try {
            // Mettre à jour le statut de connexion
            updateAPIStatusUI('connecting');
            
            // Préparer les messages pour inclure l'historique de conversation
            const messages = [];
            
            // Ajouter le message système
            messages.push({ role: 'system', content: 'Tu es un assistant utile et amical.' });
              // Récupérer l'historique de conversation si disponible
            const currentConversation = conversations.find(conv => conv.id === currentConversationId);
            
            // Limiter l'historique aux derniers messages pour éviter de dépasser les limites de token
            const MAX_HISTORY_MESSAGES = 10;
            const historyMessages = currentConversation?.messages || [];
            
            // Nous devons nous assurer que les messages alternent correctement entre "user" et "assistant"
            const processedMessages = [];
            let lastRole = null;
            
            // Parcourir l'historique récent et s'assurer de l'alternance correcte des rôles
            for (let i = 0; i < historyMessages.length && processedMessages.length < MAX_HISTORY_MESSAGES; i++) {
                const historyMsg = historyMessages[i];
                // Convertir 'bot' en 'assistant' pour l'API
                const role = historyMsg.role === 'bot' ? 'assistant' : historyMsg.role;
                
                // Vérifier si le rôle actuel est le même que le précédent (ce qui provoquerait une erreur)
                if (role !== lastRole || lastRole === null) {
                    processedMessages.push({ role, content: historyMsg.content });
                    lastRole = role;
                }
            }
            
            // S'assurer que le dernier message de l'historique n'est pas déjà un user message
            // pour éviter deux messages utilisateur consécutifs
            if (processedMessages.length > 0 && 
                processedMessages[processedMessages.length - 1].role === 'user') {
                // Si le dernier message est déjà un message utilisateur, nous le remplaçons par le nouveau
                processedMessages[processedMessages.length - 1] = { role: 'user', content: message };
            } else {
                // Sinon, nous ajoutons le nouveau message utilisateur
                processedMessages.push({ role: 'user', content: message });
            }
            
            // Ajouter les messages traités à notre liste de messages pour l'API
            messages.push(...processedMessages);

            // Appel API Hugging Face avec format chat completions
            const response = await fetch(`https://api-inference.huggingface.co/models/${modeleChoisi}/v1/chat/completions`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${huggingFaceApiKey}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    model: modeleChoisi,
                    messages: messages,
                    temperature: 0.7,
                    max_tokens: 4096
                })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                
                if (response.status === 401) {
                    updateAPIStatusUI('offline');
                    showErrorNotification("Erreur d'authentification: Clé API invalide. Veuillez vérifier vos paramètres.");
                    return getKeyInvalidMessage('huggingface');
                } else if (response.status === 503) {
                    updateAPIStatusUI('connecting');
                    showInfoNotification("Le modèle est en cours de chargement, veuillez patienter...");
                    throw new Error('Le modèle est en cours de chargement, veuillez réessayer dans quelques instants');
                } else {
                    updateAPIStatusUI('offline');
                    showErrorNotification(`Erreur API: ${errorData.error || response.status}`);
                    throw new Error(errorData.error || `Erreur HTTP: ${response.status}`);
                }
            }
            
            const data = await response.json();
            
            // Récupérer la réponse (format Hugging Face chat completions)
            let assistantResponse = '';
            if (data.choices && data.choices.length > 0) {
                assistantResponse = data.choices[0].message.content;
            } else {
                throw new Error('Format de réponse inattendu');
            }

            // Mettre à jour le statut de connexion
            updateAPIStatusUI('online');
            
            return formatResponse(assistantResponse, model);        } catch (error) {
            console.error("Erreur d'API:", error);
            updateAPIStatusUI('offline');
            
            // Gérer les erreurs spécifiques
            if (error.message && (error.message.includes("401") || error.message.includes("403"))) {
                showErrorNotification(`Erreur d'authentification: Clé API invalide ou insuffisante pour ce modèle`);
                return getKeyInvalidMessage('huggingface');
            } else if (error.message && error.message.includes("Failed to fetch")) {
                // Problème de connexion
                showErrorNotification(`Erreur de connexion: Impossible d'accéder à l'API. Vérifiez votre connexion internet.`);
                console.log("arg1 =", JSON.stringify(error)); // Afficher l'erreur complète pour débogage
            } else {
                // Autres erreurs
                showErrorNotification(`Erreur API: ${error.message || "Erreur inconnue"}`);
            }
            
            // Utiliser une réponse de secours en cas d'échec
            return useFallbackResponse(message, model);
        }
    }    // Fonction pour obtenir un message d'erreur de clé API manquante
    function getKeyMissingMessage(apiType) {
        const currentLang = userSettings.language || 'fr';
        const translationObj = translations[currentLang];
        
        return translationObj.huggingFaceApiKeyMissing || "Veuillez configurer une clé API Hugging Face dans les paramètres pour utiliser ce modèle.";
    }

    // Fonction pour obtenir un message d'erreur de clé API invalide
    function getKeyInvalidMessage(apiType) {
        const currentLang = userSettings.language || 'fr';
        const translationObj = translations[currentLang];
        
        return translationObj.huggingFaceApiKeyInvalid || "Votre clé API Hugging Face semble invalide ou a expiré. Veuillez la vérifier dans les paramètres.";
    }
    
    // Fonction pour formater la réponse
    function formatResponse(response, model) {
        // Nettoyer la réponse
        response = response.trim();
        
        // Ajouter un formatage markdown si nécessaire
        if (!response.includes('#') && !response.includes('*')) {
            // Identifier si la réponse contient plusieurs paragraphes
            const paragraphs = response.split(/\n\s*\n/);
            if (paragraphs.length > 1) {
                // Ajouter des titres pour structurer la réponse
                let formattedResponse = '';
                for (let i = 0; i < paragraphs.length; i++) {
                    if (i === 0) {
                        formattedResponse += paragraphs[i] + "\n\n";
                    } else if (paragraphs[i].length > 20) {
                        // Ne formater que les paragraphes assez longs
                        const firstSentence = paragraphs[i].split('.')[0].trim();
                        const title = firstSentence.length > 30 ? 
                            firstSentence.substring(0, 30) + "..." : 
                            firstSentence;
                        formattedResponse += "## " + title + "\n\n" + paragraphs[i] + "\n\n";
                    } else {
                        formattedResponse += paragraphs[i] + "\n\n";
                    }
                }
                response = formattedResponse;
            }
        }
          // Obtenir le nom convivial du modèle pour l'affichage
        let modelDisplayName = '';
        switch(model) {
            case 'llama-7b':
                modelDisplayName = 'Llama 3.1 (8B)';
                break;
            case 'mistral-7b':
                modelDisplayName = 'Mistral (7B)';
                break;
            default:
                modelDisplayName = model;
        }
        
        // Déterminer le message de pied de page en fonction de la langue actuelle
        const currentLang = userSettings.language || 'fr';
        let footerMessage = '';
        
        if (translations[currentLang] && translations[currentLang].modelResponseFooter) {
            footerMessage = translations[currentLang].modelResponseFooter.replace('{model}', modelDisplayName);
        } else {
            // Message par défaut si la traduction n'est pas disponible
            footerMessage = `Réponse générée avec le modèle ${modelDisplayName} via Hugging Face.`;
        }
        
        // Ajouter une mention du modèle utilisé
        response += `\n\n---\n*${footerMessage}*`;
          return response;
    }
    
      // Fonction de secours en cas d'échec de l'API
      function useFallbackResponse(message, model) {
        // Obtenir le nom convivial du modèle pour l'affichage
        let modelDisplayName = '';
        switch(model) {
            case 'llama-7b':
                modelDisplayName = 'Llama 3.1 (8B)';
                break;
            case 'mistral-7b':
                modelDisplayName = 'Mistral (7B)';
                break;
            default:
                modelDisplayName = model;
        }
        
        // Déterminer le message d'indisponibilité en fonction de la langue actuelle
        const currentLang = userSettings.language || 'fr';
        let unavailableMessage = '';
        
        if (translations[currentLang] && translations[currentLang].modelTemporaryUnavailable) {
            unavailableMessage = translations[currentLang].modelTemporaryUnavailable.replace('{model}', modelDisplayName);
        } else {
            // Message par défaut si la traduction n'est pas disponible
            unavailableMessage = `Le modèle ${modelDisplayName} est temporairement indisponible.`;
        }
        
        // Ajouter une indication de l'état de l'API pour aider l'utilisateur
        const apiKeyStatus = userSettings.apiKey ? 
            'Veuillez vérifier votre connexion Internet ou réessayer plus tard.' : 
            'Veuillez configurer votre clé API Hugging Face dans les paramètres.';
        
        // Message de base expliquant pourquoi nous utilisons une réponse de secours
        const baseErrorMessage = `Je ne peux pas générer une réponse personnalisée pour le moment. ${apiKeyStatus}\n\n`;
        
        // Si la connexion API est active mais le modèle est indisponible
        if (apiAvailable) {
            unavailableMessage += ' Le service est peut-être surchargé, veuillez réessayer dans quelques minutes.';
        }
        
        // Réponses spécifiques pour certains sujets courants
        if (message.toLowerCase().includes("machine learning") || message.toLowerCase().includes("apprentissage automatique")) {
            return `L'apprentissage automatique (machine learning) est une branche de l'intelligence artificielle qui permet aux ordinateurs d'apprendre sans être explicitement programmés pour chaque tâche.\n\nVoici comment ça fonctionne en 4 étapes :\n\n1. **Données** : On commence par collecter beaucoup de données. Par exemple, des milliers d'images de chats et de chiens si on veut construire un système qui différencie ces animaux.\n\n2. **Modèle** : On choisit une structure mathématique (comme un réseau de neurones) qui va analyser ces données.\n\n3. **Entraînement** : Le modèle examine les données et ajuste ses paramètres internes pour minimiser les erreurs.\n\n4. **Prédiction** : Une fois entraîné, le modèle peut faire des prédictions sur de nouvelles données qu'il n'a jamais vues.\n\n---\n*Note: ${unavailableMessage} Cette réponse provient de notre base de connaissances locale.*`;
        }
        
        if (message.toLowerCase().includes("recette")) {
            return `# Désolé pour l'interruption de service\n\nIl semble que notre API soit temporairement indisponible. \n\nNormalement, j'aurais pu vous proposer une recette détaillée basée sur votre demande avec le modèle ${modelDisplayName}, mais je ne peux actuellement pas accéder à ma base de connaissances complète.\n\nVeuillez réessayer ultérieurement ou poser une autre question.\n\n---\n*Note: ${unavailableMessage}*`;
        }
          // Réponse générique en cas d'échec de l'API
        return `Désolé, je ne peux pas accéder au modèle ${modelDisplayName} pour le moment. Votre question sur "${message.substring(0, 30)}..." est intéressante, mais je ne peux pas y répondre de manière détaillée actuellement.\n\nVeuillez vérifier votre clé API dans les paramètres ou réessayer dans quelques instants.\n\n---\n*Note: ${unavailableMessage}*`;
    }
    
    function showWelcomeScreen() {
        chatContainer.innerHTML = '';
        chatContainer.appendChild(welcomeScreen);
        welcomeScreen.style.display = 'flex';
    }

    function renderConversationsList() {
        // Vider la liste
        conversationsList.innerHTML = '';
        
        // Trier les conversations par date (décroissante)
        const sortedConversations = [...conversations].sort((a, b) => parseInt(b.id) - parseInt(a.id));
        
        // Regrouper les conversations par catégorie de date
        const groupedConversations = groupConversationsByDate(sortedConversations);
          // Si aucune conversation, afficher un message
        if (Object.keys(groupedConversations).length === 0) {
            const emptyMessage = document.createElement('div');
            emptyMessage.className = 'empty-conversations-message';
            
            const language = userSettings.language || 'fr';
            const translationObj = translations[language];
            emptyMessage.textContent = translationObj.noConversations || 'Aucune conversation. Commencez une nouvelle discussion !';
            
            conversationsList.appendChild(emptyMessage);
            return;
        }
        
        // Pour chaque groupe, créer un en-tête et ajouter les conversations
        Object.keys(groupedConversations).forEach(groupId => {
            const group = groupedConversations[groupId];
            
            // Créer l'en-tête de la catégorie
            const categoryHeader = document.createElement('div');
            categoryHeader.className = 'conversation-category-header';
            
            // Créer div pour le texte et l'icône
            const headerContent = document.createElement('div');
            headerContent.className = 'category-header-content';
            
            // Ajouter l'icône de repli/dépli
            const toggleIcon = document.createElement('i');
            toggleIcon.className = 'fas fa-chevron-down category-toggle-icon';
            headerContent.appendChild(toggleIcon);
            
            // Ajouter le texte de la catégorie
            const headerText = document.createElement('span');
            headerText.textContent = group.label;
            headerContent.appendChild(headerText);
            
            // Ajouter le compteur de conversations
            const counter = document.createElement('span');
            counter.className = 'conversation-counter';
            counter.textContent = group.conversations.length;
            headerContent.appendChild(counter);
            
            categoryHeader.appendChild(headerContent);
            
            // Créer un conteneur pour les conversations de cette catégorie
            const categoryContent = document.createElement('div');
            categoryContent.className = 'category-conversations';
            categoryContent.dataset.category = groupId;
            
            // Gérer le clic sur l'en-tête pour replier/déplier
            categoryHeader.addEventListener('click', function() {
                toggleIcon.classList.toggle('fa-chevron-down');
                toggleIcon.classList.toggle('fa-chevron-right');
                categoryContent.classList.toggle('collapsed');
                
                // Sauvegarder l'état des catégories
                saveCategoryState(groupId, categoryContent.classList.contains('collapsed'));
            });
            
            // Appliquer l'état sauvegardé (replié/déplié)
            const categoryState = loadCategoryState();
            if (categoryState[groupId]) {
                toggleIcon.classList.remove('fa-chevron-down');
                toggleIcon.classList.add('fa-chevron-right');
                categoryContent.classList.add('collapsed');
            }
            
            conversationsList.appendChild(categoryHeader);
            conversationsList.appendChild(categoryContent);
            
            // Créer un élément pour chaque conversation du groupe
            group.conversations.forEach(conversation => {
                const conversationEl = document.createElement('div');
                conversationEl.className = 'conversation-item';
                if (conversation.id === currentConversationId) {
                    conversationEl.classList.add('active');
                }
                conversationEl.dataset.id = conversation.id;
                
                // Créer un span pour le titre de la conversation
                const titleSpan = document.createElement('span');
                titleSpan.className = 'conversation-title';
                titleSpan.textContent = conversation.title || 'Nouvelle conversation';
                conversationEl.appendChild(titleSpan);
                
                // Créer des boutons d'action (renommer et supprimer)
                const actionsDiv = document.createElement('div');
                actionsDiv.className = 'conversation-actions';
                  // Bouton renommer
                const renameBtn = document.createElement('button');
                renameBtn.className = 'action-btn rename-btn';
                renameBtn.innerHTML = '<i class="fas fa-edit"></i>';
                
                // Utiliser la traduction pour le titre du bouton
                const language = userSettings.language || 'fr';
                const translationObj = translations[language];
                renameBtn.title = translationObj.renameBtnTitle || 'Renommer la conversation';
                
                renameBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // Empêcher le chargement de la conversation
                    renameConversation(conversation.id);
                });
                  // Bouton supprimer
                const deleteBtn = document.createElement('button');
                deleteBtn.className = 'action-btn delete-btn';
                deleteBtn.innerHTML = '<i class="fas fa-trash"></i>';
                deleteBtn.title = translationObj.deleteBtnTitle || 'Supprimer la conversation';
                deleteBtn.addEventListener('click', function(e) {
                    e.stopPropagation(); // Empêcher le chargement de la conversation
                    deleteConversation(conversation.id);
                });
                
                actionsDiv.appendChild(renameBtn);
                actionsDiv.appendChild(deleteBtn);
                conversationEl.appendChild(actionsDiv);
                
                // Ajouter le gestionnaire d'événement pour charger la conversation
                conversationEl.addEventListener('click', function() {
                    loadConversation(this.dataset.id);
                });
                
                categoryContent.appendChild(conversationEl);
            });
        });
    }
    
    // Sauvegarder l'état des catégories (repliées/dépliées)
    function saveCategoryState(categoryId, isCollapsed) {
        const categoryState = loadCategoryState();
        categoryState[categoryId] = isCollapsed;
        localStorage.setItem('chatia-category-state', JSON.stringify(categoryState));
    }
    
    // Charger l'état des catégories
    function loadCategoryState() {
        const saved = localStorage.getItem('chatia-category-state');
        return saved ? JSON.parse(saved) : {};
    }
      // Fonction pour renommer une conversation
    function renameConversation(conversationId) {
        const conversation = conversations.find(conv => conv.id === conversationId);
        if (!conversation) return;
        
        // Préparer et afficher la modale de renommage
        const renameModal = document.getElementById('rename-modal');
        const newNameInput = document.getElementById('new-conversation-name');
        const conversationIdInput = document.getElementById('conversation-id-to-rename');
        
        newNameInput.value = conversation.title || '';
        conversationIdInput.value = conversationId;
        
        // Mettre le focus sur le champ de texte
        setTimeout(() => newNameInput.focus(), 100);
        
        // Afficher la modale
        renameModal.classList.add('active');
    }
    
    // Fonction pour supprimer une conversation
    function deleteConversation(conversationId) {
        const conversation = conversations.find(conv => conv.id === conversationId);
        if (!conversation) return;
        
        // Préparer et afficher la modale de suppression
        const deleteModal = document.getElementById('delete-modal');
        const conversationIdInput = document.getElementById('conversation-id-to-delete');
        
        conversationIdInput.value = conversationId;
        
        // Afficher la modale
        deleteModal.classList.add('active');
    }
    
    // Fonction qui effectue le renommage après confirmation dans la modale
    function confirmRenameConversation() {
        const conversationId = document.getElementById('conversation-id-to-rename').value;
        const newTitle = document.getElementById('new-conversation-name').value.trim();
        
        if (newTitle !== '') {
            const conversation = conversations.find(conv => conv.id === conversationId);
            if (conversation) {
                conversation.title = newTitle;
                saveConversations();
                renderConversationsList();
            }
        }
        
        // Fermer la modale
        document.getElementById('rename-modal').classList.remove('active');
    }
    
    // Fonction qui effectue la suppression après confirmation dans la modale
    function confirmDeleteConversation() {
        const conversationId = document.getElementById('conversation-id-to-delete').value;
        const index = conversations.findIndex(conv => conv.id === conversationId);
        
        if (index !== -1) {
            conversations.splice(index, 1);
            
            // Si la conversation supprimée était la conversation active
            if (conversationId === currentConversationId) {
                currentConversationId = null;
                if (conversations.length > 0) {
                    // Charger la conversation la plus récente
                    loadMostRecentConversation();
                } else {
                    // Afficher l'écran d'accueil s'il n'y a plus de conversations
                    showWelcomeScreen();
                }
            }
            
            saveConversations();
            renderConversationsList();
        }
        
        // Fermer la modale
        document.getElementById('delete-modal').classList.remove('active');
    }
    
    function clearAllConversations() {
        conversations = [];
        currentConversationId = null;
        saveConversations();
        renderConversationsList();
        showWelcomeScreen();
    }
    
    function saveConversations() {
        localStorage.setItem('chatia-conversations', JSON.stringify(conversations));
    }
    
    function loadConversations() {
        const saved = localStorage.getItem('chatia-conversations');
        return saved ? JSON.parse(saved) : [];
    }
      // Fonction pour faire défiler vers le bas avec animation douce
    function scrollToBottom() {
        if (chatContainer) {
            chatContainer.scrollTo({
                top: chatContainer.scrollHeight,
                behavior: 'smooth'
            });
        }
    }
    
    // Fonction d'optimisation des performances
    function optimizePerformance() {
        // Limiter le nombre de messages affichés pour éviter les ralentissements
        const maxMessages = 100;
        const messages = chatContainer.querySelectorAll('.message');
        
        if (messages.length > maxMessages) {
            // Supprimer les anciens messages en gardant les plus récents
            const messagesToRemove = messages.length - maxMessages;
            for (let i = 0; i < messagesToRemove; i++) {
                if (messages[i]) {
                    messages[i].remove();
                }
            }
            
            // Afficher une notification informative
            showInfoNotification(`Messages plus anciens supprimés pour optimiser les performances (${messagesToRemove} supprimés)`);
        }
        
        // Optimiser les images
        const images = chatContainer.querySelectorAll('img');
        images.forEach(img => {
            if (!img.loading) {
                img.loading = 'lazy';
            }
        });
        
        // Nettoyer les event listeners orphelins
        cleanupEventListeners();
    }
    
    // Fonction pour nettoyer les event listeners
    function cleanupEventListeners() {
        // Supprimer les anciens event listeners des boutons de copie
        const oldCopyBtns = document.querySelectorAll('.copy-code-btn[data-cleaned]');
        oldCopyBtns.forEach(btn => btn.remove());
        
        // Marquer les nouveaux boutons
        const copyBtns = document.querySelectorAll('.copy-code-btn:not([data-cleaned])');
        copyBtns.forEach(btn => btn.setAttribute('data-cleaned', 'true'));
    }
    
    // Fonction d'amélioration de l'interface utilisateur
    function enhanceUI() {        // Ajouter des raccourcis clavier avancés
        document.addEventListener('keydown', function(e) {
            // Ctrl/Cmd + K pour nettoyer le chat
            if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
                e.preventDefault();
                if (confirm('Voulez-vous vraiment effacer tous les messages ?')) {
                    chatContainer.innerHTML = '';
                    showWelcomeScreen();
                    showSuccessNotification('Chat nettoyé');
                }
            }
            
            // Ctrl/Cmd + D pour télécharger la conversation
            if ((e.ctrlKey || e.metaKey) && e.key === 'd') {
                e.preventDefault();
                downloadConversation();
            }
            
            // Ctrl/Cmd + S pour sauvegarder la conversation
            if ((e.ctrlKey || e.metaKey) && e.key === 's') {
                e.preventDefault();
                saveCurrentConversation();
            }
            
            // Ctrl/Cmd + I pour afficher les statistiques
            if ((e.ctrlKey || e.metaKey) && e.key === 'i') {
                e.preventDefault();
                showConversationStats();
            }
              // Ctrl/Cmd + E pour exporter toutes les conversations
            if ((e.ctrlKey || e.metaKey) && e.key === 'e') {
                e.preventDefault();
                exportAllConversations();
            }
            
            // Ctrl/Cmd + T pour basculer le thème
            if ((e.ctrlKey || e.metaKey) && e.key === 't') {
                e.preventDefault();
                toggleTheme();
            }
            
            // Ctrl/Cmd + N pour nouvelle conversation
            if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
                e.preventDefault();
                startNewConversation();
                showSuccessNotification('Nouvelle conversation créée');
            }
            
            // Échap pour annuler l'édition en cours
            if (e.key === 'Escape' && userInput.value.trim()) {
                if (confirm('Voulez-vous annuler la saisie en cours ?')) {
                    userInput.value = '';
                    userInput.style.height = 'auto';
                    sendButton.disabled = true;
                    userInput.focus();
                }
            }
        });
        
        // Améliorer la zone de saisie
        enhanceInputArea();
    }
      // Fonction pour améliorer la zone de saisie
    function enhanceInputArea() {
        // Ajouter un compteur de caractères
        const inputContainer = document.querySelector('.input-container');
        if (inputContainer && !document.querySelector('.character-counter')) {
            const charCounter = document.createElement('div');
            charCounter.className = 'character-counter';
            charCounter.textContent = '0/4000';
            inputContainer.appendChild(charCounter);
            
            userInput.addEventListener('input', function() {
                const length = this.value.length;
                charCounter.textContent = `${length}/4000`;
                charCounter.style.color = length > 3800 ? 'var(--warning-color)' : 'var(--text-muted)';
                
                if (length > 4000) {
                    this.value = this.value.substring(0, 4000);
                    showWarningNotification('Message tronqué à 4000 caractères');
                }
            });
        }
        // Les suggestions ont été supprimées
    }
      // La fonction de suggestions a été supprimée
    
    // Fonction pour télécharger la conversation
    function downloadConversation() {
        const currentConversation = conversations.find(conv => conv.id === currentConversationId);
        if (!currentConversation) {
            showWarningNotification('Aucune conversation à télécharger');
            return;
        }
        
        const conversationData = {
            title: currentConversation.title,
            date: new Date().toISOString(),
            messages: currentConversation.messages,
            model: currentConversation.model || 'default'
        };
        
        const dataStr = JSON.stringify(conversationData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        
        const link = document.createElement('a');
        link.href = URL.createObjectURL(dataBlob);
        link.download = `conversation_${currentConversation.title.replace(/[^a-z0-9]/gi, '_')}_${new Date().toISOString().split('T')[0]}.json`;
        link.click();
        
        showSuccessNotification('Conversation téléchargée');
    }
    
    // Fonction pour sauvegarder la conversation actuelle
    function saveCurrentConversation() {
        saveConversations();
        showSuccessNotification('Conversation sauvegardée');
    }
    
    // Fonction pour optimiser les images dans les messages
    function optimizeImages() {
        const images = chatContainer.querySelectorAll('img');
        images.forEach(img => {
            // Lazy loading
            img.loading = 'lazy';
            
            // Compression d'image basique
            img.addEventListener('load', function() {
                if (this.naturalWidth > 800) {
                    this.style.maxWidth = '800px';
                    this.style.height = 'auto';
                }
            });
            
            // Gestion des erreurs d'image
            img.addEventListener('error', function() {
                this.style.display = 'none';
                showWarningNotification('Impossible de charger une image');
            });
        });
    }
      // Fonction de recherche améliorée dans les messages
    function enhanceSearch() {
        const searchModal = document.getElementById('search-modal');
        const searchBtn = document.getElementById('search-btn');
        const closeSearchModalBtn = document.getElementById('close-search-modal');
        const searchResults = document.getElementById('search-results');
        
        if (searchModal && searchBtn) {
            // Ouvrir le modal de recherche
            searchBtn.addEventListener('click', function() {
                searchModal.classList.add('active');
                const searchInput = document.getElementById('search-modal-input');
                if (searchInput) {
                    searchInput.focus();
                }
            });
            
            // Fermer le modal de recherche
            if (closeSearchModalBtn) {
                closeSearchModalBtn.addEventListener('click', function() {
                    searchModal.classList.remove('active');
                    clearSearchHighlights();
                });
            }
            
            // Fermer en cliquant en dehors
            searchModal.addEventListener('click', function(e) {
                if (e.target === searchModal) {
                    searchModal.classList.remove('active');
                    clearSearchHighlights();
                }
            });
            
            // Recherche en temps réel
            const searchInput = document.getElementById('search-modal-input');
            if (searchInput) {
                searchInput.addEventListener('input', function() {
                    debounce(performAdvancedSearch, 300)(this.value);
                });
                
                // Recherche avec Entrée
                searchInput.addEventListener('keypress', function(e) {
                    if (e.key === 'Enter') {
                        performAdvancedSearch(this.value);
                    }
                });
                
                // Raccourci clavier Ctrl+F pour ouvrir la recherche
                document.addEventListener('keydown', function(e) {
                    if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
                        e.preventDefault();
                        searchModal.classList.add('active');
                        searchInput.focus();
                    }
                    
                    // Échap pour fermer la recherche
                    if (e.key === 'Escape' && searchModal.classList.contains('active')) {
                        searchModal.classList.remove('active');
                        clearSearchHighlights();
                    }
                });
            }
        }
    }
    
    // Fonction pour effacer les surlignages de recherche
    function clearSearchHighlights() {
        const messages = chatContainer.querySelectorAll('.message');
        messages.forEach(message => {
            message.style.backgroundColor = '';
            message.classList.remove('search-highlighted');
            
            // Restaurer le contenu original s'il était modifié pour le surlignage
            const originalContent = message.getAttribute('data-original-content');
            if (originalContent) {
                const messageContent = message.querySelector('.message-content');
                if (messageContent) {
                    messageContent.innerHTML = originalContent;
                }
                message.removeAttribute('data-original-content');
            }
        });
    }
    
    // Fonction de recherche avancée
    function performAdvancedSearch(query) {
        const searchResults = document.getElementById('search-results');
        if (!query.trim()) {
            if (searchResults) {
                searchResults.innerHTML = '';
            }
            clearSearchHighlights();
            return;
        }
        
        clearSearchHighlights();
        
        const messages = chatContainer.querySelectorAll('.message');
        const results = [];
        
        messages.forEach((message, index) => {
            const messageContent = message.querySelector('.message-content');
            if (!messageContent) return;
            
            const content = messageContent.textContent.toLowerCase();
            const searchTerm = query.toLowerCase();
            
            if (content.includes(searchTerm)) {
                // Sauvegarder le contenu original
                if (!message.getAttribute('data-original-content')) {
                    message.setAttribute('data-original-content', messageContent.innerHTML);
                }
                
                // Surligner le terme recherché
                const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
                const highlightedContent = messageContent.innerHTML.replace(regex, '<mark class="search-highlight">$1</mark>');
                messageContent.innerHTML = highlightedContent;
                
                message.classList.add('search-highlighted');
                
                // Ajouter aux résultats
                const role = message.classList.contains('message-user') ? 'Utilisateur' : 'Assistant';
                const preview = content.substring(0, 100) + (content.length > 100 ? '...' : '');
                
                results.push({
                    index: index,
                    role: role,
                    preview: preview,
                    element: message
                });
            }
        });
        
        // Afficher les résultats dans le modal
        if (searchResults) {
            if (results.length === 0) {
                searchResults.innerHTML = '<div class="search-no-results">Aucun résultat trouvé</div>';
            } else {
                const resultsHTML = results.map((result, i) => `
                    <div class="search-result-item" data-message-index="${result.index}">
                        <div class="search-result-header">
                            <span class="search-result-role">${result.role}</span>
                            <span class="search-result-number">${i + 1}/${results.length}</span>
                        </div>
                        <div class="search-result-preview">${result.preview}</div>
                    </div>
                `).join('');
                
                searchResults.innerHTML = resultsHTML;
                
                // Ajouter les événements de clic pour naviguer vers les messages
                searchResults.querySelectorAll('.search-result-item').forEach(item => {
                    item.addEventListener('click', function() {
                        const messageIndex = this.getAttribute('data-message-index');
                        const message = messages[messageIndex];
                        if (message) {
                            message.scrollIntoView({ behavior: 'smooth', block: 'center' });
                            
                            // Animation temporaire
                            message.style.animation = 'pulse 0.5s ease';
                            setTimeout(() => {
                                message.style.animation = '';
                            }, 500);
                        }
                    });
                });
            }
        }
        
        // Défiler vers le premier résultat
        if (results.length > 0) {
            results[0].element.scrollIntoView({ behavior: 'smooth', block: 'center' });
            showSuccessNotification(`${results.length} résultat(s) trouvé(s)`);
        } else {
            showInfoNotification(`Aucun résultat trouvé pour "${query}"`);
        }
    }
    
    // Fonction utilitaire pour échapper les caractères spéciaux dans une regex
    function escapeRegExp(string) {
        return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }
      // Fonction debounce pour optimiser les performances
    function debounce(func, wait) {
        let timeout;
        return function executedFunction(...args) {
            const later = () => {
                clearTimeout(timeout);
                func(...args);
            };
            clearTimeout(timeout);
            timeout = setTimeout(later, wait);
        };
    }
      // Initialiser les améliorations
    function initializeEnhancements() {
        // Attendre que le DOM soit chargé
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', function() {
                setTimeout(initializeEnhancements, 100);
            });
            return;
        }
        
        enhanceUI();
        enhanceSearch();
        
        // Auto-sauvegarde toutes les 2 minutes
        setInterval(autoSaveConversations, 120000);
        
        // Optimiser périodiquement
        setInterval(optimizePerformance, 60000); // Toutes les minutes
        
        // Optimiser les images périodiquement
        setInterval(optimizeImages, 30000); // Toutes les 30 secondes
        
        // Mettre à jour les timestamps toutes les minutes
        setInterval(updateTimestamps, 60000);
    }
    
    // Fonction pour vérifier l'état de l'API    
    
    function checkAPIStatus() {
        updateAPIStatusUI('connecting');
        
        // Utiliser la clé API des paramètres utilisateur si disponible
        const apiKey = userSettings.apiKey || '';
        
        if (!apiKey) {
            console.warn("Aucune clé API Hugging Face configurée");
            // Indiquer que l'API est hors ligne car pas de clé
            apiAvailable = false;
            updateAPIStatusUI('offline');
            return;
        }
        
        // URL pour vérifier la disponibilité de l'API (endpoint health check)
        const apiUrl = 'https://api-inference.huggingface.co/models/meta-llama/Llama-3.1-8B-Instruct/v1/chat/completions';
          
        // Essayer d'appeler l'API pour vérifier sa disponibilité
        fetch(apiUrl, {
            method: 'POST',
            headers: {
                'Authorization': `Bearer ${apiKey}`,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                model: "meta-llama/Llama-3.1-8B-Instruct",
                messages: [
                    { role: 'system', content: 'Tu es un assistant utile.' },
                    { role: 'user', content: 'Bonjour' }
                ],
                max_tokens: 5
            })
        })
        .then(response => {
            console.log("API Status Response:", response.status);
            
            if (response.ok || response.status === 503) {
                // 503 signifie que le modèle est en cours de chargement, donc l'API est bien disponible
                apiAvailable = true;
                updateAPIStatusUI(response.ok ? 'online' : 'connecting');
                return response.json().catch(() => null);
            } else {
                // Si la réponse est 401 ou 403, problème d'authentification
                if (response.status === 401 || response.status === 403) {
                    console.error("Erreur d'authentification API:", response.status);
                    // Montrer un message spécifique pour problème de clé API
                    showApiKeyError();
                }
                apiAvailable = false;
                updateAPIStatusUI('offline');
                return null;
            }
        })
        .catch(error => {
            console.error("API Status Check Error:", error);
            apiAvailable = false;
            updateAPIStatusUI('offline');
        });    }
    
    // Fonction pour afficher un message d'erreur concernant la clé API
    function showApiKeyError() {
        const language = userSettings.language || 'fr';
        const translationObj = translations[language];
        
        // Utiliser le système de notifications pour afficher un message clair
        showErrorNotification(translationObj.apiKeyError || 'Erreur de clé API. Veuillez vérifier que votre clé est valide dans les paramètres.');
        
        // Ouvrir automatiquement les paramètres sur l'onglet API
        openSettingsModal('api');
    }
    
    // Mettre à jour l'interface d'état de l'API
    function updateAPIStatusUI(status) {
        const statusIndicator = apiStatus.querySelector('.status-indicator');
        const statusText = apiStatus.querySelector('span:last-child') || apiStatus;
        
        // Supprimer toutes les classes existantes
        statusIndicator.classList.remove('online', 'offline', 'connecting');
        
        const language = userSettings.language || 'fr';
        const translationObj = translations[language];
        
        if (status === 'online') {
            statusIndicator.classList.add('online');
            statusText.textContent = translationObj.apiStatusOnline || 'API connectée';
        } else if (status === 'offline') {
            statusIndicator.classList.add('offline');
            statusText.textContent = translationObj.apiStatusOffline || 'API non disponible';
        } else if (status === 'connecting') {
            statusIndicator.classList.add('connecting');
            statusText.textContent = translationObj.apiStatusConnecting || 'Connexion à l\'API...';
        }
    }
    
    // Charger les paramètres utilisateur depuis localStorage
    function loadUserSettings() {
        const defaultSettings = {
            theme: 'dark',
            language: 'fr',
            apiKey: '',
            username: 'Utilisateur',
            profilePic: null,
            sidebarCollapsed: false
        };
        
        const savedSettings = localStorage.getItem('chatia-user-settings');
        
        if (savedSettings) {
            try {
                return {...defaultSettings, ...JSON.parse(savedSettings)};
            } catch (e) {
                console.error('Erreur lors du chargement des paramètres:', e);
                return defaultSettings;
            }
        }
        
        return defaultSettings;
    }
    
    // Enregistrer les paramètres utilisateur dans localStorage
    function saveUserSettings() {
        localStorage.setItem('chatia-user-settings', JSON.stringify(userSettings));
    }
    
    // Appliquer les paramètres utilisateur
    function applyUserSettings() {
        // Appliquer le thème
        applyTheme(userSettings.theme);
        
        // Mettre à jour le sélecteur de thème
        themeSelect.value = userSettings.theme;
        
        // Mettre à jour le sélecteur de langue
        languageSelect.value = userSettings.language;
        
        // Appliquer les traductions
        applyTranslations(userSettings.language);
        
        // Mettre à jour la clé API si définie
        if (userSettings.apiKey) {
            apiKeyInput.value = userSettings.apiKey;
        }
          // Mettre à jour le nom d'utilisateur
        if (userSettings.username) {
            usernameInput.value = userSettings.username;
            document.getElementById('username-display').textContent = userSettings.username;
        }
        
        // Mettre à jour la photo de profil
        if (userSettings.profilePic) {
            updateProfilePic(userSettings.profilePic);
        }
    
        // Mettre à jour l'affichage du nom d'utilisateur dans la barre latérale
        const usernameDisplay = document.getElementById('username-display');
        if (usernameDisplay && userSettings.username) {
            usernameDisplay.textContent = userSettings.username;
        }
        
        // Appliquer l'état de la barre latérale
        if (userSettings.sidebarCollapsed) {
            sidebarElement.classList.add('collapsed');
        } else {
            sidebarElement.classList.remove('collapsed');
        }
    }
    
    // Mise à jour de la photo de profil
    function updateProfilePic(imageUrl) {
        profilePic.style.backgroundImage = `url(${imageUrl})`;
        profilePicDisplay.style.backgroundImage = `url(${imageUrl})`;
    }
    
    // Appliquer le thème
    function applyTheme(theme) {
        document.body.classList.remove('light-theme', 'dark-theme');
        document.body.classList.add(`${theme}-theme`);
    }
    
    // Ouvrir la modale des paramètres
    function openSettingsModal(tab) {
        console.log('Opening settings modal, tab:', tab);
        console.log('Settings modal element:', settingsModal);
        
        if (settingsModal) {
            settingsModal.classList.add('active');
            switchSettingsTab(tab);
        } else {
            console.error('Settings modal element not found!');
        }
    }
    
    // Changer d'onglet dans les paramètres
    function switchSettingsTab(tabId) {
        settingsMenuItems.forEach(item => {
            if (item.getAttribute('data-tab') === tabId) {
                item.classList.add('active');
            } else {
                item.classList.remove('active');
            }
        });
        
        settingsTabs.forEach(tab => {
            if (tab.id === `${tabId}-tab`) {
                tab.classList.add('active');
            } else {
                tab.classList.remove('active');
            }
        });
    }
      modelSelect.addEventListener('change', function() {
        // Mettre à jour l'état de connexion à l'API
        checkAPIStatus();
        
        // Mettre à jour le modèle dans la conversation actuelle
        if (currentConversationId) {
            const currentConversation = conversations.find(conv => conv.id === currentConversationId);
            if (currentConversation) {
                // Sauvegarder le modèle sélectionné
                currentConversation.model = modelSelect.value;
                
                // S'assurer que la structure des messages est valide pour le nouvel API
                ensureValidMessageStructure(currentConversation);
                
                saveConversations();
                
                // Afficher une notification de changement de modèle
                const modelName = modelSelect.options[modelSelect.selectedIndex].text;
                showInfoNotification(`Modèle changé pour ${modelName}`);
            }
        }
    });
    
    // Événements pour la photo de profil et les paramètres
    profilePic.addEventListener('click', function() {
        openSettingsModal('user');
    });
    
    settingsBtn.addEventListener('click', function() {
        openSettingsModal('general');
    });
    
    // Gestionnaires d'événements pour le modal des paramètres
    settingsMenuItems.forEach(item => {
        item.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            switchSettingsTab(tabId);
        });
    });
    
    // Fermer la modale des paramètres
    document.querySelectorAll('#settings-modal .close-modal').forEach(btn => {
        btn.addEventListener('click', function() {
            settingsModal.classList.remove('active');
        });
    });
    
    // Fermer la modale des paramètres en cliquant en dehors
    window.addEventListener('click', function(e) {
        if (e.target === settingsModal) {
            settingsModal.classList.remove('active');
        }
    });
    
    // Changement de thème
    themeSelect.addEventListener('change', function() {
        userSettings.theme = this.value;
        saveUserSettings();
        applyTheme(this.value);
    });
      // Changement de langue
    languageSelect.addEventListener('change', function() {
        userSettings.language = this.value;
        saveUserSettings();
        applyTranslations(this.value);
        
        // Mettre à jour dynamiquement les exemples
        updateExamplePrompts(this.value);
        
        // Mettre à jour la liste des conversations pour traduire les dates et messages
        renderConversationsList();
          
        // Message de confirmation
        const message = document.createElement('div');
        message.classList.add('settings-message', 'success');
        message.textContent = translations[this.value].languageChanged || 'Langue changée avec succès';
        languageSelect.parentNode.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    });
    
    // Fonction pour mettre à jour les exemples
    function updateExamplePrompts(language) {
        const transObj = translations[language];
        if (!transObj || !transObj.examplePrompts) return;
        
        const examples = document.querySelectorAll('.example-card');
        examples.forEach((card, index) => {
            if (index < transObj.examplePrompts.length) {
                const newPrompt = transObj.examplePrompts[index];
                card.textContent = `"${newPrompt}"`;
                card.setAttribute('data-prompt', newPrompt);
            }
        });
    }    // Enregistrer la clé API
    saveApiKeyBtn.addEventListener('click', function() {
        const apiKey = apiKeyInput.value.trim();
        userSettings.apiKey = apiKey;
        saveUserSettings();
        
        // Vérifier si la clé fonctionne
        checkAPIStatus();
        
        // Afficher un message de confirmation
        const language = userSettings.language || 'fr';
        const translationObj = translations[language];
        
        const message = document.createElement('div');
        message.classList.add('settings-message', 'success');
        message.textContent = translationObj.apiKeySaved || 'Clé API enregistrée avec succès';
        apiKeyInput.parentNode.appendChild(message);
        
        setTimeout(() => {
            message.remove();
        }, 3000);
    });       // Enregistrer la clé API GPT (avec protection si l'élément n'existe pas)
    if (saveGptApiKeyBtn) {
        saveGptApiKeyBtn.addEventListener('click', function() {
            const gptApiKey = gptApiKeyInput.value.trim();
            userSettings.gptApiKey = gptApiKey;
            saveUserSettings();
            
            // Afficher un message de confirmation
            const language = userSettings.language || 'fr';
            const translationObj = translations[language];
            
            const message = document.createElement('div');
            message.classList.add('settings-message', 'success');
            message.textContent = translationObj.gptApiKeySaved || 'Clé API enregistrée avec succès';
            gptApiKeyInput.parentNode.appendChild(message);
            
            setTimeout(() => {
                message.remove();
            }, 3000);
        });
    }
    
    // Effacer toutes les conversations depuis les paramètres
    settingsClearConversationsBtn.addEventListener('click', function() {
        // Afficher le modal de confirmation
        const clearModal = document.getElementById('clear-conversations-modal');
        clearModal.classList.add('active');
    });
    
    // Boutons du modal de confirmation pour effacer toutes les conversations
    const confirmClearBtn = document.getElementById('confirm-clear-btn');
    const cancelClearBtn = document.getElementById('cancel-delete-btn');
    
    // Récupérer les boutons de fermeture au moment où on en a besoin
    function getCloseModalButtons() {
        const clearModal = document.getElementById('clear-conversations-modal');
        return clearModal.querySelectorAll('.close-modal');
    }
      // Confirmer la suppression
    confirmClearBtn.addEventListener('click', function() {
        clearAllConversations();
        const clearModal = document.getElementById('clear-conversations-modal');
        clearModal.classList.remove('active');
        // Si on était dans les paramètres, fermer aussi le modal des paramètres
        settingsModal.classList.remove('active');
    });
    
    // Annuler la suppression
    cancelClearBtn.addEventListener('click', function() {
        const clearModal = document.getElementById('clear-conversations-modal');
        clearModal.classList.remove('active');
    });
      // Fermer avec le bouton X
    const closeClearModalBtns = getCloseModalButtons();
    closeClearModalBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const clearModal = document.getElementById('clear-conversations-modal');
            clearModal.classList.remove('active');
        });
    });
      // Fermer en cliquant en dehors
    window.addEventListener('click', function(e) {
        const clearModal = document.getElementById('clear-conversations-modal');
        if (e.target === clearModal) {
            clearModal.classList.remove('active');
        }
    });    // Changer la photo de profil
    changeProfilePicBtn.addEventListener('click', function() {
        profilePicInput.click();
    });
    
    // Gestion du téléchargement de photo de profil via FileReader
    profilePicInput.addEventListener('change', function(e) {
        if (e.target.files && e.target.files[0]) {
            const file = e.target.files[0];
            
            // Vérifier si le fichier est une image
            if (!file.type.startsWith('image/')) {
                showErrorNotification('Le fichier doit être une image (JPEG, PNG, etc.)');
                return;
            }
            
            // Lire le fichier en base64
            const reader = new FileReader();
            reader.onload = function(e) {
                const imageUrl = e.target.result;
                
                // Mettre à jour l'image dans l'interface
                updateProfilePic(imageUrl);
                
                // Enregistrer l'image dans les paramètres utilisateur
                userSettings.profilePic = imageUrl;
                saveUserSettings();
                
                // Afficher une notification de succès
                showSuccessNotification('Photo de profil mise à jour avec succès');
            };
            
            reader.onerror = function() {
                showErrorNotification('Erreur lors de la lecture du fichier');
            };
            
            reader.readAsDataURL(file);
        }
    });    saveUsernameBtn.addEventListener('click', function() {
        const username = usernameInput.value.trim();
        if (username) {
            // Valider le nom d'utilisateur
            if (username.length < 2) {
                showErrorNotification('Le nom d\'utilisateur doit contenir au moins 2 caractères');
                return;
            }
            
            if (username.length > 30) {
                showErrorNotification('Le nom d\'utilisateur ne peut pas dépasser 30 caractères');
                return;
            }
            
            try {
                // Mettre à jour les paramètres locaux
                userSettings.username = username;
                saveUserSettings();
                
                // Mettre à jour l'affichage du nom d'utilisateur
                const usernameDisplay = document.getElementById('username-display');
                if (usernameDisplay) {
                    usernameDisplay.textContent = username;
                }
                
                // Afficher un message de confirmation
                const language = userSettings.language || 'fr';
                const translationObj = translations[language];
                
                showSuccessNotification(translationObj.usernameSaved || 'Nom d\'utilisateur enregistré avec succès');
                
            } catch (error) {
                console.error('Erreur lors de la sauvegarde:', error);
                showErrorNotification('Erreur lors de la sauvegarde du nom d\'utilisateur');
            }        } else {
            showWarningNotification('Veuillez saisir un nom d\'utilisateur valide');
        }
    });

    // Référence au nouveau bouton pour rouvrir la barre latérale
    const collapsedToggleBtn = document.getElementById('collapsed-toggle-btn');
    
    // Fonction pour mettre à jour la visibilité du bouton toggle-collapse
    function updateToggleButtonVisibility() {
        if (sidebarElement.classList.contains('collapsed')) {
            collapsedToggleBtn.style.display = 'flex';
            setTimeout(() => {
                collapsedToggleBtn.style.opacity = '1';
                collapsedToggleBtn.style.transform = 'translateX(0)';
            }, 50);
        } else {
            collapsedToggleBtn.style.opacity = '0';
            collapsedToggleBtn.style.transform = 'translateX(-20px)';
            setTimeout(() => {
                collapsedToggleBtn.style.display = 'none';
            }, 300); // Attendre que l'animation soit terminée
        }
    }

    // Fonctions pour gérer l'overlay mobile
    function isMobileDevice() {
        return window.innerWidth <= 768;
    }

    function showMobileOverlay() {
        if (isMobileDevice() && sidebarOverlay) {
            sidebarOverlay.classList.add('active');
        }
    }

    function hideMobileOverlay() {
        if (sidebarOverlay) {
            sidebarOverlay.classList.remove('active');
        }
    }

    function handleMobileSidebar() {
        if (isMobileDevice()) {
            if (!sidebarElement.classList.contains('collapsed')) {
                showMobileOverlay();
            } else {
                hideMobileOverlay();
            }
        } else {
            hideMobileOverlay(); // S'assurer que l'overlay est caché sur desktop
        }
    }    // Gestion de la barre latérale rétractable
    toggleSidebarBtn.addEventListener('click', function() {
        sidebarElement.classList.toggle('collapsed');
        
        // Mettre à jour le style de la page principale
        adjustMainContentMargin();
        
        // Mettre à jour la visibilité du bouton toggle
        updateToggleButtonVisibility();
        
        // Gérer l'overlay mobile
        handleMobileSidebar();
        
        // Enregistrer l'état dans les paramètres utilisateur
        userSettings.sidebarCollapsed = sidebarElement.classList.contains('collapsed');
        saveUserSettings();
    });    // Bouton pour rouvrir la barre latérale quand elle est réduite
    collapsedToggleBtn.addEventListener('click', function() {
        sidebarElement.classList.remove('collapsed');
        
        // Mettre à jour le style de la page principale
        adjustMainContentMargin();
        
        // Mettre à jour la visibilité du bouton toggle
        updateToggleButtonVisibility();
        
        // Gérer l'overlay mobile
        handleMobileSidebar();
        
        // Mettre à jour l'état dans les paramètres
        userSettings.sidebarCollapsed = false;
        saveUserSettings();
    });
      // Fonction pour ajuster les marges du contenu principal
    function adjustMainContentMargin() {
        const mainContent = document.querySelector('.main-content');
        if (sidebarElement.classList.contains('collapsed')) {
            // Utiliser requestAnimationFrame pour une transition plus fluide
            requestAnimationFrame(() => {
                mainContent.style.marginLeft = '0';
            });
        } else {
            requestAnimationFrame(() => {
                mainContent.style.marginLeft = ''; // Réinitialise à la valeur par défaut
            });
        }
    }    // Appliquer l'état de la barre latérale au chargement
    if (userSettings.sidebarCollapsed) {
        sidebarElement.classList.add('collapsed');
        // Ajuster également les marges du contenu principal
        setTimeout(adjustMainContentMargin, 0);
        // Initialiser la visibilité du bouton toggle
        setTimeout(updateToggleButtonVisibility, 0);    } else {
        // S'assurer que le bouton est masqué si la sidebar est visible
        collapsedToggleBtn.style.display = 'none';
    }

    // Événements pour la gestion mobile
    if (sidebarOverlay) {
        // Fermer la sidebar quand on clique sur l'overlay
        sidebarOverlay.addEventListener('click', function() {
            if (isMobileDevice()) {
                sidebarElement.classList.add('collapsed');
                adjustMainContentMargin();
                updateToggleButtonVisibility();
                handleMobileSidebar();
                
                // Mettre à jour l'état dans les paramètres
                userSettings.sidebarCollapsed = true;
                saveUserSettings();
            }
        });
    }

    // Gérer le redimensionnement de la fenêtre pour mobile/desktop
    window.addEventListener('resize', function() {
        handleMobileSidebar();
        
        // Si on passe de mobile à desktop, s'assurer que l'overlay est caché
        if (!isMobileDevice()) {
            hideMobileOverlay();
        }
    });    // Initialiser l'état mobile au chargement
    setTimeout(() => {
        handleMobileSidebar();
    }, 100);

    // Gestion des gestes tactiles pour mobile
    let touchStartX = 0;
    let touchEndX = 0;

    document.addEventListener('touchstart', function(e) {
        if (isMobileDevice()) {
            touchStartX = e.changedTouches[0].screenX;
        }
    });

    document.addEventListener('touchend', function(e) {
        if (isMobileDevice()) {
            touchEndX = e.changedTouches[0].screenX;
            handleSwipeGesture();
        }
    });

    function handleSwipeGesture() {
        const swipeThreshold = 50; // Distance minimale pour un swipe
        const swipeDistance = touchEndX - touchStartX;

        // Swipe vers la droite (ouvrir la sidebar) depuis le bord gauche
        if (swipeDistance > swipeThreshold && touchStartX < 50 && sidebarElement.classList.contains('collapsed')) {
            sidebarElement.classList.remove('collapsed');
            adjustMainContentMargin();
            updateToggleButtonVisibility();
            handleMobileSidebar();
            
            userSettings.sidebarCollapsed = false;
            saveUserSettings();
        }
        // Swipe vers la gauche (fermer la sidebar)
        else if (swipeDistance < -swipeThreshold && !sidebarElement.classList.contains('collapsed')) {
            sidebarElement.classList.add('collapsed');
            adjustMainContentMargin();
            updateToggleButtonVisibility();
            handleMobileSidebar();
            
            userSettings.sidebarCollapsed = true;
            saveUserSettings();
        }
    }

    // Gestion du modal de recherche
    searchBtn.addEventListener('click', function() {
        openSearchModal();
    });

    closeSearchModalBtn.addEventListener('click', function() {
        closeSearchModal();
    });

    // Fermer avec Echap
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape' && searchModal.classList.contains('active')) {
            closeSearchModal();
        }
    });

    // Fermer en cliquant en dehors

    searchModal.addEventListener('click', function(e) {
        if (e.target === searchModal) {
            closeSearchModal();
        }
    });

    searchModalInput.addEventListener('input', function() {
        const searchTerm = this.value.trim().toLowerCase();
        searchConversations(searchTerm);
    });

    // Fonction pour ouvrir le modal de recherche
    function openSearchModal() {
        searchModal.classList.add('active');
        setTimeout(() => {
            searchModalInput.focus();
        }, 300); // Attendre la fin de l'animation
    }

    // Fonction pour fermer le modal de recherche
    function closeSearchModal() {
        searchModal.classList.remove('active');
        searchModalInput.value = '';
        // Réinitialiser les résultats
        resetSearchResults();
    }    // Fonction pour réinitialiser les résultats de recherche
    function resetSearchResults() {
        const language = userSettings.language || 'fr';
        const translationObj = translations[language];
        const startTypingMessage = translationObj.startTypingToSearch || 'Commencez à taper pour rechercher des conversations';
        
        searchResults.innerHTML = `
            <div class="search-placeholder">
                <i class="fas fa-search search-placeholder-icon"></i>
                <p>${startTypingMessage}</p>
            </div>
        `;
    }

    // Fonction pour rechercher dans les conversations
    function searchConversations(searchTerm) {
        if (searchTerm.length === 0) {
            resetSearchResults();
            return;
        }

        // Vider les résultats précédents
        searchResults.innerHTML = '';
        
        let resultsFound = 0;

        // Rechercher dans les conversations
        conversations.forEach(conversation => {
            const title = conversation.title.toLowerCase();
            let matchesTitle = title.includes(searchTerm);
            let messageMatches = [];
            
            // Rechercher dans les messages
            if (conversation.messages) {
                conversation.messages.forEach(msg => {
                    if (msg.content && msg.content.toLowerCase().includes(searchTerm)) {
                        messageMatches.push(msg.content);
                    }
                });
            }
            
            if (matchesTitle || messageMatches.length > 0) {
                resultsFound++;
                
                // Obtenir la catégorie de date pour cette conversation
                const category = getDateCategory(conversation.id);
                
                // Créer l'élément de résultat
                const resultItem = document.createElement('div');
                resultItem.className = 'search-result-item';
                resultItem.dataset.conversationId = conversation.id;
                
                // Snippet à afficher
                let snippet = '';
                if (messageMatches.length > 0) {
                    // Extraire un extrait de texte autour du terme recherché
                    let match = messageMatches[0];
                    const maxLength = 100;
                    const indexOfMatch = match.toLowerCase().indexOf(searchTerm);
                    
                    let start = Math.max(0, indexOfMatch - 20);
                    let end = Math.min(match.length, indexOfMatch + searchTerm.length + 60);
                    
                    snippet = match.substring(start, end);
                    if (start > 0) snippet = '...' + snippet;
                    if (end < match.length) snippet += '...';
                }
                
                // Formatter la date si c'est une date récente
                const date = new Date(parseInt(conversation.id));
                const formattedDate = isNaN(date) ? '' : formatDate(date);
                
                resultItem.innerHTML = `
                    <i class="fas fa-comment search-result-icon"></i>
                    <div class="search-result-content">
                        <div class="search-result-title">
                            ${conversation.title}
                            <span class="search-result-date">${formattedDate}</span>
                            <span class="search-result-category">${category.label}</span>
                        </div>
                        ${snippet ? `<div class="search-result-snippet">${snippet}</div>` : ''}
                    </div>
                `;
                
                // Ajouter l'événement pour charger la conversation
                resultItem.addEventListener('click', function() {
                    loadConversation(this.dataset.conversationId);
                    closeSearchModal();
                });
                
                searchResults.appendChild(resultItem);
            }
        });
          // Si aucun résultat n'est trouvé
        if (resultsFound === 0) {
            const language = userSettings.language || 'fr';
            const translationObj = translations[language];
            const noResultsMessage = translationObj.noResultsFor || 'Aucun résultat trouvé pour "{term}"';
            
            searchResults.innerHTML = `
                <div class="search-placeholder">
                    <p>${noResultsMessage.replace('{term}', searchTerm)}</p>
                </div>
            `;
        }
    }
      // Formater la date pour l'affichage
    function formatDate(date) {
        const now = new Date();
        const diffInDays = Math.floor((now - date) / (1000 * 60 * 60 * 24));
        
        const language = userSettings.language || 'fr';
        const translationObj = translations[language];
        
        if (diffInDays === 0) {
            return translationObj.today || "Aujourd'hui";
        } else if (diffInDays === 1) {
            return translationObj.yesterday || "Hier";
        } else if (diffInDays < 7) {
            const daysAgo = translationObj.daysAgo || "Il y a {days} jours";
            return daysAgo.replace('{days}', diffInDays);
        } else {
            return date.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { 
                day: 'numeric', 
                month: 'short', 
                year: now.getFullYear() !== date.getFullYear() ? 'numeric' : undefined 
            });
        }
    }
    
    // Fonctions utilitaires pour la catégorisation des conversations par date
function getDateCategory(timestampStr) {
    const now = new Date();
    const conversationDate = new Date(parseInt(timestampStr));
    const diffInDays = Math.floor((now - conversationDate) / (1000 * 60 * 60 * 24));
    
    const language = userSettings.language || 'fr';
    const translationObj = translations[language];
    
    if (diffInDays < 7) {
        return { id: 'recent', label: translationObj.last7Days || '7 derniers jours' };
    } else if (diffInDays < 30) {
        return { id: 'month', label: translationObj.last30Days || '30 derniers jours' };
    } else if (now.getFullYear() === conversationDate.getFullYear()) {
        // Format du mois avec première lettre en majuscule
        let monthName = conversationDate.toLocaleDateString(language === 'fr' ? 'fr-FR' : 'en-US', { month: 'long' });
        monthName = monthName.charAt(0).toUpperCase() + monthName.slice(1);
        return { id: `month-${conversationDate.getMonth()}`, label: monthName };
    } else {
        return { id: `year-${conversationDate.getFullYear()}`, label: conversationDate.getFullYear().toString() };
    }
}

function groupConversationsByDate(conversations) {
    // Créer un objet pour stocker les groupes de conversations
    const groups = {};
    
    // Définir l'ordre des catégories
    const categoryOrder = ['recent', 'month'];
    
    // Regrouper les conversations par catégorie
    conversations.forEach(conversation => {
        const category = getDateCategory(conversation.id);
        if (!groups[category.id]) {
            groups[category.id] = {
                label: category.label,
                conversations: [],
                order: categoryOrder.indexOf(category.id) !== -1 
                    ? categoryOrder.indexOf(category.id) 
                    : 999 // Pour les autres catégories (mois spécifiques, années)
            };
        }
        groups[category.id].conversations.push(conversation);
    });
    
    // Trier les groupes par ordre et retourner un objet
    const sortedGroups = {};
    Object.keys(groups)
        .sort((a, b) => {
            // D'abord par ordre prédéfini
            if (groups[a].order !== groups[b].order) {
                return groups[a].order - groups[b].order;
            }
            // Ensuite par ordre alphabétique (pour les mois/années)
            return a.localeCompare(b);
        })
        .forEach(key => {
            sortedGroups[key] = groups[key];
        });
    
    return sortedGroups;
}

// Fonction pour appliquer les traductions
function applyTranslations(language) {
    if (!translations[language]) {
        console.error(`Language ${language} not found in translations`);
        language = 'fr'; // Fallback to French
    }
    
    const translationObj = translations[language];
    
    // Traduire tous les éléments avec l'attribut data-i18n
    document.querySelectorAll('[data-i18n]').forEach(el => {
        const key = el.getAttribute('data-i18n');
        const value = getNestedTranslation(translationObj, key);
        if (value) el.textContent = value;
    });
    
    // Traduire les placeholders
    document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
        const key = el.getAttribute('data-i18n-placeholder');
        const value = getNestedTranslation(translationObj, key);
        if (value) el.placeholder = value;
    });
    
    // Traduire les titres (tooltips)
    document.querySelectorAll('[data-i18n-title]').forEach(el => {
        const key = el.getAttribute('data-i18n-title');
        const value = getNestedTranslation(translationObj, key);
        if (value) el.title = value;
    });
      // Mettre à jour les exemples de prompts
    document.querySelectorAll('[data-i18n-prompt]').forEach(el => {
        const key = el.getAttribute('data-i18n-prompt');
        const value = getNestedTranslation(translationObj, key);
        if (value) {
            el.textContent = `"${value}"`;
            el.setAttribute('data-prompt', value);
        }
    });
    
    // Mettre à jour les titres des boutons d'action des conversations
    const renameBtns = document.querySelectorAll('.rename-btn');
    const deleteBtns = document.querySelectorAll('.delete-btn');
    
    if (renameBtns.length > 0) {
        renameBtns.forEach(btn => {
            btn.title = translationObj.renameBtnTitle || 'Renommer la conversation';
        });
    }
    
    if (deleteBtns.length > 0) {
        deleteBtns.forEach(btn => {
            btn.title = translationObj.deleteBtnTitle || 'Supprimer la conversation';
        });
    }
    
    // Mettre à jour les options du sélecteur de modèle
    const modelOptions = modelSelect.querySelectorAll('option');
    if (modelOptions.length > 0) {
        modelOptions.forEach(option => {
            const modelKey = 'model' + option.value.charAt(0).toUpperCase() + option.value.slice(1).replace(/-/g, '');
            if (translationObj[modelKey]) {
                option.textContent = translationObj[modelKey];
            }
        });
    }
    
    // Mettre à jour le titre de la page
    document.title = language === 'fr' ? 'ChatIA - Conversation avec IA' : 'ChatAI - AI Conversation';
}

// Fonction pour accéder aux propriétés imbriquées d'un objet à partir d'une chaîne de points
function getNestedTranslation(obj, path) {
    if (!path) return null;
    
    const parts = path.split('.');
    let result = obj;
    
    for (const part of parts) {
        if (result && typeof result === 'object' && part in result) {
            result = result[part];
        } else {
            return null;
        }
    }
      return result;
}

// Fonction pour basculer entre les thèmes
    function toggleTheme() {
        const currentTheme = userSettings.theme === 'dark' ? 'light' : 'dark';
        userSettings.theme = currentTheme;
        applyTheme(currentTheme);
        saveUserSettings();
        
        const themeIcon = currentTheme === 'dark' ? '🌙' : '☀️';
        showSuccessNotification(`Thème ${currentTheme === 'dark' ? 'sombre' : 'clair'} activé ${themeIcon}`);
    }
    
    // Fonction pour auto-sauvegarder les conversations
    function autoSaveConversations() {
        try {
            saveConversations();
            console.log('💾 Auto-sauvegarde effectuée');
        } catch (error) {
            console.error('Erreur lors de l\'auto-sauvegarde:', error);
        }
    }
    
    // Fonction pour améliorer la gestion des erreurs réseau
    function handleNetworkError(error) {
        console.error('Erreur réseau:', error);
        
        if (!navigator.onLine) {
            showWarningNotification('Connexion internet perdue. Vérifiez votre connexion.');
            return;
        }
        
        if (error.message.includes('API key')) {
            showApiKeyError();
            return;
        }
        
        if (error.message.includes('rate limit')) {
            showWarningNotification('Limite de taux API atteinte. Veuillez patienter quelques minutes.');
            return;
        }
        
        showErrorNotification('Erreur de connexion à l\'API. Veuillez réessayer.');
    }
    
    // Fonction pour valider les messages avant envoi
    function validateMessage(message) {
        if (!message || message.trim().length === 0) {
            showWarningNotification('Veuillez saisir un message');
            return false;
        }
        
        if (message.length > 4000) {
            showWarningNotification('Le message est trop long (maximum 4000 caractères)');
            return false;
        }
        
        // Vérifier les caractères potentiellement problématiques
        const problematicChars = /[<>]/g;
        if (problematicChars.test(message)) {
            console.warn('Message contient des caractères potentiellement problématiques');
        }
        
        return true;
    }
    
    // Fonction pour formater l'heure relative
    function getRelativeTime(date) {
        const now = new Date();
        const diff = now - new Date(date);
        const seconds = Math.floor(diff / 1000);
        const minutes = Math.floor(seconds / 60);
        const hours = Math.floor(minutes / 60);
        const days = Math.floor(hours / 24);
        
        if (seconds < 60) return 'À l\'instant';
        if (minutes < 60) return `Il y a ${minutes} min`;
        if (hours < 24) return `Il y a ${hours}h`;
        if (days < 7) return `Il y a ${days}j`;
        
        return new Date(date).toLocaleDateString('fr-FR');
    }
    
    // Fonction pour améliorer l'affichage des timestamps
    function updateTimestamps() {
        const timestamps = document.querySelectorAll('.message-timestamp');
        timestamps.forEach(timestamp => {
            const originalTime = timestamp.getAttribute('data-original-time');
            if (originalTime) {
                timestamp.textContent = getRelativeTime(originalTime);
            }
        });
    }

}); // Fin de l'écouteur DOMContentLoaded
