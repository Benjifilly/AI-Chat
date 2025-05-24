/* filepath: d:\IA CHAT\auth.js */
document.addEventListener('DOMContentLoaded', function() {
    // Gestion des onglets (Connexion/Inscription)
    const tabs = document.querySelectorAll('.auth-tab');
    const forms = document.querySelectorAll('.auth-form');
    
    tabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Désactiver tous les onglets et formulaires
            tabs.forEach(t => t.classList.remove('active'));
            forms.forEach(f => f.classList.remove('active'));
            
            // Activer l'onglet cliqué et le formulaire correspondant
            tab.classList.add('active');
            const formId = `${tab.dataset.tab}-form`;
            document.getElementById(formId).classList.add('active');
            
            // Mise à jour de l'URL avec le paramètre tab
            const newUrl = window.location.pathname + (tab.dataset.tab === 'register' ? '?tab=register' : '');
            window.history.pushState({}, '', newUrl);
        });
    });
    
    // Afficher/masquer le mot de passe
    const togglePasswordButtons = document.querySelectorAll('.toggle-password');
    
    togglePasswordButtons.forEach(button => {
        button.addEventListener('click', () => {
            const input = button.parentElement.querySelector('input');
            const icon = button.querySelector('i');
            
            if (input.type === 'password') {
                input.type = 'text';
                icon.classList.remove('fa-eye');
                icon.classList.add('fa-eye-slash');
            } else {
                input.type = 'password';
                icon.classList.remove('fa-eye-slash');
                icon.classList.add('fa-eye');
            }
        });
    });
    
    // Basculer le thème (clair/sombre)
    const themeToggleBtn = document.getElementById('theme-toggle-btn');
    const themeLabel = themeToggleBtn.nextElementSibling;
    
    // Vérifier si un thème est déjà enregistré dans localStorage
    const savedTheme = localStorage.getItem('theme') || 'dark';
    document.body.classList.add(savedTheme === 'dark' ? 'dark-theme' : 'light-theme');
    
    // Mettre à jour l'icône et le texte du bouton de thème
    updateThemeToggle(savedTheme === 'dark');
    
    themeToggleBtn.addEventListener('click', () => {
        const isDarkTheme = document.body.classList.contains('dark-theme');
        
        // Basculer les classes de thème
        document.body.classList.toggle('dark-theme');
        document.body.classList.toggle('light-theme');
        
        // Enregistrer le nouveau thème dans localStorage
        localStorage.setItem('theme', isDarkTheme ? 'light' : 'dark');
        
        // Mettre à jour l'icône et le texte
        updateThemeToggle(!isDarkTheme);
    });
    
    function updateThemeToggle(isDarkTheme) {
        const icon = themeToggleBtn.querySelector('i');
        
        if (isDarkTheme) {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
            themeLabel.setAttribute('data-i18n', 'darkMode');
            themeLabel.textContent = 'Mode sombre';
        } else {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
            themeLabel.setAttribute('data-i18n', 'lightMode');
            themeLabel.textContent = 'Mode clair';
        }
    }
      // Validation des formulaires côté client
    // Note: La validation côté serveur est déjà gérée par PHP
    const registerForm = document.getElementById('register-form');
    if (registerForm) {
        registerForm.querySelector('form').addEventListener('submit', function(e) {
            let hasError = false;
            
            // Vérifier les différents champs
            const username = document.getElementById('register-username').value;
            if (!username) {
                addError('register-username', 'Le nom d\'utilisateur est requis');
                hasError = true;
            }
            
            const email = document.getElementById('register-email').value;
            if (!email) {
                addError('register-email', 'L\'email est requis');
                hasError = true;
            } else if (!isValidEmail(email)) {
                addError('register-email', 'Format d\'email invalide');
                hasError = true;
            }
            
            const password = document.getElementById('register-password').value;
            if (!password) {
                addError('register-password', 'Le mot de passe est requis');
                hasError = true;
            } else if (password.length < 6) {
                addError('register-password', 'Le mot de passe doit contenir au moins 6 caractères');
                hasError = true;
            }
            
            const confirmPassword = document.getElementById('register-confirm-password').value;
            if (password !== confirmPassword) {
                addError('register-confirm-password', 'Les mots de passe ne correspondent pas');
                hasError = true;
            }
            
            const acceptTerms = document.getElementById('accept-terms').checked;
            if (!acceptTerms) {
                addError('accept-terms', 'Vous devez accepter les conditions d\'utilisation');
                hasError = true;
            }
            
            // Si des erreurs sont présentes, empêcher la soumission du formulaire
            if (hasError) {
                e.preventDefault();
            }
        });
    }
    
    const loginForm = document.getElementById('login-form');
    if (loginForm) {
        loginForm.querySelector('form').addEventListener('submit', function(e) {
            let hasError = false;
            
            const email = document.getElementById('login-email').value;
            if (!email) {
                addError('login-email', 'L\'email est requis');
                hasError = true;
            }
            
            const password = document.getElementById('login-password').value;
            if (!password) {
                addError('login-password', 'Le mot de passe est requis');
                hasError = true;
            }
            
            if (hasError) {
                e.preventDefault();
            }
        });
    }
      // Fonctions utilitaires
    function addError(fieldId, message) {
        const field = document.getElementById(fieldId);
        const formGroup = field.closest('.form-group') || field.closest('.accept-terms');
        
        formGroup.classList.add('error');
        
        // Afficher une notification pour l'erreur
        showNotification(message, "error");
    }
    
    function isValidEmail(email) {
        const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        return regex.test(email);
    }
    
    // Animation subtile sur les champs d'entrée
    const inputs = document.querySelectorAll('input');
    
    inputs.forEach(input => {
        input.addEventListener('focus', () => {
            input.parentElement.style.transform = 'translateY(-2px)';
            input.parentElement.style.transition = 'transform 0.2s ease';
        });
        
        input.addEventListener('blur', () => {
            input.parentElement.style.transform = 'translateY(0)';
        });
    });    // Appliquer les traductions si disponibles
    if (typeof applyTranslations === 'function') {
        applyTranslations();
    }
    
    // Plus besoin du code pour masquer les messages de succès
    // car ils sont maintenant gérés par le nouveau système de notifications
});
