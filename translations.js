// Objet contenant les traductions pour l'interface
const translations = {
    fr: {
        // Interface principale
        welcomeTitle: "ChatIA",
        welcomeSubtitle: "Votre assistant IA connecté à Hugging Face",
        examples: "Exemples",
        examplePrompts: [
            "Explique-moi la théorie de la relativité d'Einstein comme si j'avais 10 ans.",
            "Écris un poème sur la beauté de la nature en automne.",
            "Comment fonctionne l'apprentissage automatique (machine learning) ?",
            "Quels sont les plus beaux endroits à visiter en France ?"
        ],
        apiInfo: "Ce chat utilise l'API gratuite de Hugging Face pour accéder à de véritables modèles d'IA.",
        getApiKey: "Obtenir une clé API Hugging Face",
        userInputPlaceholder: "Posez votre question ici...",
        disclaimer: "ChatIA utilise des modèles Hugging Face. Les réponses sont générées en temps réel.",
        
        // Barre latérale
        newConversation: "Nouvelle conversation",
        toggleSidebar: "Réduire/Étendre",
        search: "Rechercher",
        modelLabel: "Modèle :",
        apiStatusConnecting: "Connexion à l'API...",
        apiStatusOnline: "API connectée",
        apiStatusOffline: "API non disponible",
        noConversations: "Aucune conversation. Commencez une nouvelle discussion !",
          // Modèles d'IA
        modelLlama7b: "Llama 3.1 (8B)",
        modelMistral7b: "Mistral (7B)",
        modelResponseFooter: "Réponse générée avec le modèle {model} via Hugging Face.",
        modelTemporaryUnavailable: "Le modèle {model} est temporairement indisponible.",
        
        // Messages de confirmation
        usernameSaved: "Nom d'utilisateur enregistré avec succès",
        apiKeySaved: "Clé API enregistrée avec succès",
        languageChanged: "Langue changée avec succès",
        
        // Conversations par dates
        last7Days: "7 derniers jours",
        last30Days: "30 derniers jours",
        today: "Aujourd'hui",
        yesterday: "Hier",
        daysAgo: "Il y a {days} jours",        // Modales
        rename: "Renommer",
        delete: "Supprimer",
        cancel: "Annuler",
        clearAll: "Effacer tout",
        renameConversation: "Renommer la conversation",
        deleteConversation: "Supprimer la conversation",
        deleteConfirmMessage: "Êtes-vous sûr de vouloir supprimer cette conversation ?",
        deleteIrreversible: "Cette action est irréversible.",
        newConversationNamePlaceholder: "Nouveau nom...",
        
        // Boutons d'action
        renameBtnTitle: "Renommer la conversation",
        deleteBtnTitle: "Supprimer la conversation",
        
        // Recherche
        searchPlaceholder: "Rechercher des conversations...",
        startTypingToSearch: "Commencez à taper pour rechercher des conversations",
        noResultsFor: "Aucun résultat trouvé pour \"{term}\"",
        
        // Paramètres
        settings: "Paramètres",
        general: "Général",
        user: "Utilisateur",
        theme: "Thème",
        darkTheme: "Sombre",
        lightTheme: "Clair",
        language: "Langue",        apiKey: "API Hugging Face",
        apiKeyPlaceholder: "Entrez votre clé API Hugging Face",
        apiKeyHelper: "Votre clé API est stockée localement et n'est jamais partagée.",
        saveApiKey: "Enregistrer la clé",        apiKeyError: "Erreur de clé API. Veuillez vérifier votre clé dans les paramètres.",
        huggingFaceApiKeyMissing: "Veuillez configurer une clé API Hugging Face dans les paramètres pour utiliser ce modèle.",
        huggingFaceApiKeyInvalid: "Votre clé API Hugging Face semble invalide ou a expiré. Veuillez la vérifier dans les paramètres.",
        dangerZone: "Zone de danger",
        clearAllConversations: "Effacer toutes les conversations",
        clearAllHelper: "Cette action supprimera définitivement toutes vos conversations.",
        userProfile: "Profil utilisateur",
        profilePic: "Photo de profil",
        changeProfilePic: "Changer la photo",
        userInfo: "Informations utilisateur",
        username: "Nom d'utilisateur",
        usernamePlaceholder: "Votre nom d'utilisateur",
        save: "Enregistrer",
        
        // Messages de confirmation
        apiKeySaved: "Clé API enregistrée avec succès",
        usernameSaved: "Nom d'utilisateur enregistré",
        clearConversationsConfirm: "Êtes-vous sûr de vouloir effacer toutes les conversations ?",
        clearConversationsModalConfirm: "Êtes-vous sûr de vouloir effacer toutes les conversations ? Cette action est irréversible."
    },
    en: {
        // Main interface
        welcomeTitle: "ChatAI",
        welcomeSubtitle: "Your AI assistant connected to Hugging Face",
        examples: "Examples",
        examplePrompts: [
            "Explain Einstein's theory of relativity to me like I'm 10 years old.",
            "Write a poem about the beauty of nature in autumn.",
            "How does machine learning work?",
            "What are the most beautiful places to visit in France?"
        ],
        apiInfo: "This chat uses the free Hugging Face API to access real AI models.",
        getApiKey: "Get a Hugging Face API key",
        userInputPlaceholder: "Ask your question here...",
        disclaimer: "ChatAI uses Hugging Face models. Responses are generated in real-time.",
        
        // Sidebar
        newConversation: "New conversation",
        toggleSidebar: "Collapse/Expand",
        search: "Search",
        modelLabel: "Model:",
        apiStatusConnecting: "Connecting to API...",
        apiStatusOnline: "API connected",
        apiStatusOffline: "API unavailable",
        noConversations: "No conversations. Start a new discussion!",
          // AI Models
        modelLlama7b: "Llama 3.1 (8B)",
        modelMistral7b: "Mistral (7B)",
        modelResponseFooter: "Response generated with the {model} model via Hugging Face.",
        modelTemporaryUnavailable: "The {model} model is temporarily unavailable.",
        
        // Confirmation messages
        usernameSaved: "Username saved successfully",
        apiKeySaved: "API key saved successfully",
        languageChanged: "Language changed successfully",
        
        // Date-based conversations
        last7Days: "Last 7 days",
        last30Days: "Last 30 days",
        today: "Today",
        yesterday: "Yesterday",
        daysAgo: "{days} days ago",        // Modals
        rename: "Rename",
        delete: "Delete",
        cancel: "Cancel",
        clearAll: "Clear All",
        renameConversation: "Rename conversation",
        deleteConversation: "Delete conversation",
        deleteConfirmMessage: "Are you sure you want to delete this conversation?",
        deleteIrreversible: "This action is irreversible.",
        newConversationNamePlaceholder: "New name...",
        
        // Action buttons
        renameBtnTitle: "Rename conversation",
        deleteBtnTitle: "Delete conversation",
        
        // Search
        searchPlaceholder: "Search conversations...",
        startTypingToSearch: "Start typing to search conversations",
        noResultsFor: "No results found for \"{term}\"",
        
        // Settings
        settings: "Settings",
        general: "General",
        user: "User",
        theme: "Theme",
        darkTheme: "Dark",
        lightTheme: "Light",
        language: "Language",        apiKey: "Hugging Face API",
        apiKeyPlaceholder: "Enter your Hugging Face API key",
        apiKeyHelper: "Your API key is stored locally and never shared.",
        saveApiKey: "Save key",        apiKeyError: "API key error. Please check your key in settings.",
        huggingFaceApiKeyMissing: "Please configure a Hugging Face API key in settings to use this model.",
        huggingFaceApiKeyInvalid: "Your Hugging Face API key seems invalid or has expired. Please check it in settings.",
        dangerZone: "Danger zone",
        clearAllConversations: "Clear all conversations",
        clearAllHelper: "This action will permanently delete all your conversations.",
        userProfile: "User profile",
        profilePic: "Profile picture",
        changeProfilePic: "Change picture",
        userInfo: "User information",
        username: "Username",
        usernamePlaceholder: "Your username",
        save: "Save",
        
        // Confirmation messages
        apiKeySaved: "API key saved successfully",
        usernameSaved: "Username saved",
        clearConversationsConfirm: "Are you sure you want to clear all conversations?",
        clearConversationsModalConfirm: "Are you sure you want to clear all conversations? This action is irreversible."
    }
};

// Exporter l'objet translations pour l'utiliser dans d'autres fichiers
// Pour une utilisation avec les modules ES6
if (typeof exports !== 'undefined') {
    exports.translations = translations;
}
// Pour une utilisation sans modules
window.translations = translations;
